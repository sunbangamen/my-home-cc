import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          우리집 홈페이지
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          가족의 소중한 추억과 일정을 함께 나눠요
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Photos Card */}
        <Link
          to="/photos"
          className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-6xl text-white group-hover:scale-110 transition-transform duration-300">
              📸
            </span>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              가족 사진
            </h2>
            <p className="text-gray-600 mb-4">
              소중한 순간들을 사진으로 저장하고 함께 감상해요
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              사진 보러가기
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </div>
          </div>
        </Link>

        {/* Events Card */}
        <Link
          to="/events"
          className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-6xl text-white group-hover:scale-110 transition-transform duration-300">
              📅
            </span>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              가족 일정
            </h2>
            <p className="text-gray-600 mb-4">
              중요한 날들과 가족 행사를 달력에서 확인해요
            </p>
            <div className="flex items-center text-green-600 font-medium">
              일정 보러가기
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          최근 활동
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-gray-600">저장된 사진</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-gray-600">예정된 일정</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;