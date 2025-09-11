import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Album, AlbumCreate } from '../types/index';
import apiClient from '../api/client';

const Albums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state for creating album
  const [formData, setFormData] = useState<AlbumCreate>({
    name: '',
    description: ''
  });

  // Load albums on component mount
  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAlbums();
      setAlbums(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!formData.name.trim()) {
      setError('앨범 이름을 입력해주세요.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await apiClient.createAlbum({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined
      });
      await loadAlbums();
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlbum = async (album: Album) => {
    if (!confirm(`"${album.name}" 앨범을 삭제하시겠습니까?`)) return;

    try {
      setError(null);
      await apiClient.deleteAlbum(album.id);
      await loadAlbums();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete album');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>
          사진 앨범
        </h1>
        <div style={{ padding: '64px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <p style={{ color: '#6b7280' }}>앨범을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            사진 앨범
          </h1>
          <p style={{ color: '#6b7280' }}>
            소중한 순간들을 앨범으로 정리해요 ({albums.length}개 앨범)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + 새 앨범 만들기
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Album Grid */}
      {albums.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {albums.map((album) => (
            <div
              key={album.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              {/* Album Cover */}
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {album.cover_photo_id ? (
                  <img
                    src={`https://picsum.photos/400/200?random=${album.cover_photo_id}`}
                    alt={album.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '8px' }}>📂</div>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      {album.photo_count === 0 ? '사진 없음' : `${album.photo_count || 0}장`}
                    </p>
                  </div>
                )}
              </div>

              {/* Album Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: 0,
                    flex: 1
                  }}>
                    {album.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteAlbum(album)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                </div>

                {album.description && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    {album.description}
                  </p>
                )}

                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
                  <p style={{ margin: 0 }}>생성: {formatDate(album.created_at)}</p>
                  <p style={{ margin: '4px 0 0 0' }}>사진 {album.photo_count || 0}장</p>
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151'
                  }}
                  onClick={() => navigate(`/albums/${album.id}`)}
                >
                  앨범 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📂</span>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            아직 앨범이 없어요
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            첫 번째 앨범을 만들어 소중한 사진들을 정리해보세요!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            첫 앨범 만들기
          </button>
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', margin: 0 }}>
              새 앨범 만들기
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                앨범 이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="앨범 이름을 입력하세요"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="앨범에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '' });
                  setError(null);
                }}
                disabled={creating}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: creating ? 0.6 : 1
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={creating || !formData.name.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (creating || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: (creating || !formData.name.trim()) ? 0.6 : 1
                }}
              >
                {creating ? '생성 중...' : '앨범 만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Albums;