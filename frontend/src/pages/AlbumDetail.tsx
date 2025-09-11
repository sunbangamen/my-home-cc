import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAlbum, updateAlbum, removePhotosFromAlbum } from '../api/client';

// Type definitions
interface Photo {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  description?: string;
}

interface Album {
  id: number;
  name: string;
  description?: string;
  cover_photo_id?: number;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  photos?: Photo[];
}

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const albumData = await getAlbum(parseInt(id));
        setAlbum(albumData);
        setEditName(albumData.name);
        setEditDescription(albumData.description || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load album');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const handleSave = async () => {
    if (!album || !editName.trim()) return;

    try {
      setSaving(true);
      const updatedAlbum = await updateAlbum(album.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });
      setAlbum(updatedAlbum);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update album');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (album) {
      setEditName(album.name);
      setEditDescription(album.description || '');
    }
    setIsEditing(false);
  };

  const togglePhotoSelection = (photoId: number) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const handleRemovePhotos = async () => {
    if (!album || selectedPhotos.size === 0) return;

    if (!confirm(`선택한 ${selectedPhotos.size}장의 사진을 앨범에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      setError(null);
      await removePhotosFromAlbum(album.id, Array.from(selectedPhotos));
      
      // Refresh album data
      const updatedAlbum = await getAlbum(album.id);
      setAlbum(updatedAlbum);
      setSelectedPhotos(new Set());
      
      setError(`${selectedPhotos.size}장의 사진을 앨범에서 제거했습니다.`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photos from album');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        앨범을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
        <Link 
          to="/albums"
          style={{
            color: '#2563eb',
            textDecoration: 'none'
          }}
        >
          ← 앨범 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ 
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>앨범을 찾을 수 없습니다.</p>
        <Link 
          to="/albums"
          style={{
            color: '#2563eb',
            textDecoration: 'none'
          }}
        >
          ← 앨범 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <Link 
            to="/albums"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              marginRight: '8px'
            }}
          >
            ← 앨범
          </Link>
        </div>

        {isEditing ? (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                앨범 이름
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                placeholder="앨범 이름을 입력하세요"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '4px' 
              }}>
                설명 (선택사항)
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="앨범에 대한 설명을 입력하세요"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: saving || !editName.trim() ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saving || !editName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {album.name}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                편집
              </button>
            </div>

            {album.description && (
              <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                {album.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
              <span>사진 {album.photos?.length || 0}개</span>
              <span>생성일: {new Date(album.created_at).toLocaleDateString('ko-KR')}</span>
              {album.updated_at !== album.created_at && (
                <span>수정일: {new Date(album.updated_at).toLocaleDateString('ko-KR')}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
            앨범 사진
          </h2>
          
          {selectedPhotos.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {selectedPhotos.size}장 선택됨
              </span>
              <button
                onClick={handleRemovePhotos}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                앨범에서 제거
              </button>
              <button
                onClick={() => setSelectedPhotos(new Set())}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                선택 해제
              </button>
            </div>
          )}
        </div>

        {!album.photos || album.photos.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              이 앨범에는 아직 사진이 없습니다
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              사진 페이지에서 사진을 이 앨범에 추가할 수 있습니다
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {album.photos.map((photo: Photo) => (
              <div 
                key={photo.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: selectedPhotos.has(photo.id) 
                    ? '0 0 0 2px #3b82f6' 
                    : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    togglePhotoSelection(photo.id);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!selectedPhotos.has(photo.id)) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedPhotos.has(photo.id)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {/* Selection Checkbox */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 10,
                    width: '20px',
                    height: '20px',
                    backgroundColor: selectedPhotos.has(photo.id) ? '#3b82f6' : 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid #3b82f6',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhotoSelection(photo.id);
                  }}
                >
                  {selectedPhotos.has(photo.id) && (
                    <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                  )}
                </div>

                <div style={{ 
                  aspectRatio: '1', 
                  backgroundColor: '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img
                    src={`/photos/${photo.filename}`}
                    alt={photo.original_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="color: #9ca3af; font-size: 14px;">이미지를 불러올 수 없습니다</div>';
                      }
                    }}
                  />
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {photo.original_name}
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#9ca3af', 
                    margin: '4px 0 0 0'
                  }}>
                    {new Date(photo.uploaded_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;