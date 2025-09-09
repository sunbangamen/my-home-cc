import { useState } from 'react';

const TestPhotos = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const photos = [
    { id: 1, title: "사진 1", url: "https://picsum.photos/300/200?random=1" },
    { id: 2, title: "사진 2", url: "https://picsum.photos/300/200?random=2" },
    { id: 3, title: "사진 3", url: "https://picsum.photos/300/200?random=3" },
    { id: 4, title: "사진 4", url: "https://picsum.photos/300/200?random=4" }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
        테스트 사진 페이지
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedPhoto(photo.url)}
          >
            <img
              src={photo.url}
              alt={photo.title}
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                {photo.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '600px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>큰 이미지</h2>
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <img
              src={selectedPhoto}
              alt="큰 이미지"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPhotos;