import { useState } from 'react';
import type { Photo } from '../types';

const mockPhotos: Photo[] = [
  {
    id: 1,
    filename: "family_trip_1.jpg",
    title: "가족 여행",
    uploaded_at: "2024-09-01",
    thumbnail: "https://picsum.photos/300/200?random=1"
  },
  {
    id: 2,
    filename: "birthday_party.jpg",
    title: "생일 파티",
    uploaded_at: "2024-09-05",
    thumbnail: "https://picsum.photos/300/200?random=2"
  },
  {
    id: 3,
    filename: "weekend_picnic.jpg",
    title: "주말 피크닉",
    uploaded_at: "2024-09-08",
    thumbnail: "https://picsum.photos/300/200?random=3"
  },
  {
    id: 4,
    filename: "cooking_together.jpg",
    title: "함께 요리하기",
    uploaded_at: "2024-09-10",
    thumbnail: "https://picsum.photos/300/200?random=4"
  },
  {
    id: 5,
    filename: "garden_work.jpg",
    title: "정원 가꾸기",
    uploaded_at: "2024-09-12",
    thumbnail: "https://picsum.photos/300/200?random=5"
  },
  {
    id: 6,
    filename: "movie_night.jpg",
    title: "영화 감상",
    uploaded_at: "2024-09-15",
    thumbnail: "https://picsum.photos/300/200?random=6"
  },
  {
    id: 7,
    filename: "beach_walk.jpg",
    title: "해변 산책",
    uploaded_at: "2024-09-18",
    thumbnail: "https://picsum.photos/300/200?random=7"
  },
  {
    id: 8,
    filename: "holiday_dinner.jpg",
    title: "명절 저녁",
    uploaded_at: "2024-09-20",
    thumbnail: "https://picsum.photos/300/200?random=8"
  }
];

const Photos = () => {
  const [photos] = useState<Photo[]>(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          가족 사진
        </h1>
        <p style={{ color: '#6b7280' }}>
          소중한 순간들을 함께 나눠요 ({photos.length}장)
        </p>
      </div>

      {/* Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedPhoto(photo)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1)';
            }}
          >
            <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
              <img
                src={photo.thumbnail}
                alt={photo.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', margin: 0 }}>
                {photo.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {formatDate(photo.uploaded_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Selected Photo */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {selectedPhoto.title}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  {formatDate(selectedPhoto.uploaded_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            {/* Image */}
            <div style={{ padding: '16px' }}>
              <img
                src={selectedPhoto.thumbnail}
                alt={selectedPhoto.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📸</span>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            아직 사진이 없어요
          </h3>
          <p style={{ color: '#9ca3af' }}>
            첫 번째 가족 사진을 업로드해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default Photos;