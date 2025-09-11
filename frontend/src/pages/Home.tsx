import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '16px',
          margin: 0
        }}>
          우리집 홈페이지
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#6b7280', 
          marginBottom: '32px',
          margin: '16px 0 32px 0'
        }}>
          가족의 소중한 추억과 일정을 함께 나눠요
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '32px', 
        marginBottom: '48px' 
      }}>
        {/* Photos Card */}
        <Link
          to="/photos"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'box-shadow 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{ 
            height: '192px', 
            background: 'linear-gradient(to bottom right, #60a5fa, #2563eb)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '64px', color: 'white' }}>📸</span>
          </div>
          <div style={{ padding: '24px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '8px',
              margin: 0
            }}>
              가족 사진
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '16px',
              margin: '8px 0 16px 0',
              lineHeight: '1.5'
            }}>
              소중한 순간들을 사진으로 저장하고 함께 감상해요
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#2563eb', 
              fontWeight: '500'
            }}>
              사진 보러가기
              <span style={{ marginLeft: '8px' }}>→</span>
            </div>
          </div>
        </Link>

        {/* Albums Card */}
        <Link
          to="/albums"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'box-shadow 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{ 
            height: '192px', 
            background: 'linear-gradient(to bottom right, #f59e0b, #d97706)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '64px', color: 'white' }}>📂</span>
          </div>
          <div style={{ padding: '24px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '8px',
              margin: 0
            }}>
              사진 앨범
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '16px',
              margin: '8px 0 16px 0',
              lineHeight: '1.5'
            }}>
              사진들을 앨범별로 정리하고 관리해요
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#d97706', 
              fontWeight: '500'
            }}>
              앨범 보러가기
              <span style={{ marginLeft: '8px' }}>→</span>
            </div>
          </div>
        </Link>

        {/* Events Card */}
        <Link
          to="/events"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'box-shadow 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{ 
            height: '192px', 
            background: 'linear-gradient(to bottom right, #34d399, #059669)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '64px', color: 'white' }}>📅</span>
          </div>
          <div style={{ padding: '24px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '8px',
              margin: 0
            }}>
              가족 일정
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '16px',
              margin: '8px 0 16px 0',
              lineHeight: '1.5'
            }}>
              중요한 날들과 가족 행사를 달력에서 확인해요
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#059669', 
              fontWeight: '500'
            }}>
              일정 보러가기
              <span style={{ marginLeft: '8px' }}>→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '24px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px',
          textAlign: 'center',
          margin: '0 0 16px 0'
        }}>
          현재 상태
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>2</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>저장된 사진</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>1</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>생성된 앨범</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>0</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>예정된 일정</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;