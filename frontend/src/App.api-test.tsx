import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface HealthStatus {
  status: string
  database: string
  service: string
  version: string
}

interface Photo {
  id: number
  filename: string
  original_name: string
  uploaded_at: string
}

interface Event {
  id: number
  title: string
  description?: string
  event_date: string
  is_all_day: boolean
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test API connectivity
  const checkHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/health`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setHealth(data)
      setError(null)
    } catch (err) {
      setError(`Health check failed: ${err}`)
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  // Load photos
  const loadPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/photos`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setPhotos(data)
      setError(null)
    } catch (err) {
      setError(`Failed to load photos: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/events`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(`Failed to load events: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  // Create test event
  const createTestEvent = async () => {
    try {
      setLoading(true)
      const testEvent = {
        title: '테스트 이벤트',
        description: 'API 연동 테스트용 이벤트입니다',
        event_date: new Date().toISOString(),
        is_all_day: false
      }
      
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEvent)
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      await loadEvents() // Reload events
      setError(null)
    } catch (err) {
      setError(`Failed to create event: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          우리집 홈페이지 API 테스트
        </h1>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">시스템 상태</h2>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? '확인 중...' : '상태 확인'}
          </button>
          
          {health && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p><strong>상태:</strong> {health.status}</p>
              <p><strong>데이터베이스:</strong> {health.database}</p>
              <p><strong>서비스:</strong> {health.service}</p>
              <p><strong>버전:</strong> {health.version}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">사진 관리</h2>
          <button
            onClick={loadPhotos}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? '로딩 중...' : '사진 목록 불러오기'}
          </button>
          
          <div className="mt-4">
            {photos.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-2">총 {photos.length}개의 사진이 있습니다.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="border rounded p-4">
                      <p className="font-medium">{photo.original_name}</p>
                      <p className="text-sm text-gray-500">업로드: {new Date(photo.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">아직 업로드된 사진이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">일정 관리</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded"
            >
              {loading ? '로딩 중...' : '일정 불러오기'}
            </button>
            <button
              onClick={createTestEvent}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded"
            >
              {loading ? '생성 중...' : '테스트 일정 추가'}
            </button>
          </div>
          
          <div className="mt-4">
            {events.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-2">총 {events.length}개의 일정이 있습니다.</p>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded p-4">
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600">{event.description}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        일시: {new Date(event.event_date).toLocaleString()} 
                        {event.is_all_day && ' (종일)'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">아직 등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>API 서버: <code>{API_URL}</code></p>
          <p className="text-sm mt-2">
            이 페이지는 백엔드 API와의 연동을 테스트하기 위한 페이지입니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
