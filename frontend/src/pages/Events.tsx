import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import type { Event } from '../types/index';
import apiClient from '../api/client';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    is_all_day: true,
  });

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    // Use local timezone to avoid date shift
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openModal = (date?: Date, event?: Event) => {
    if (event) {
      // Edit existing event
      setEditingEvent(event);
      const eventDate = new Date(event.event_date);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: formatDateForInput(eventDate),
        is_all_day: event.is_all_day,
      });
    } else {
      // Create new event
      setEditingEvent(null);
      const targetDate = date || new Date();
      setFormData({
        title: '',
        description: '',
        event_date: formatDateForInput(targetDate),
        is_all_day: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      is_all_day: true,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        event_date: formData.event_date + 'T00:00:00',  // 로컬 시간 그대로 전송
        is_all_day: formData.is_all_day,
      };

      if (editingEvent) {
        // Update existing event
        await apiClient.updateEvent(editingEvent.id, eventData);
      } else {
        // Create new event
        await apiClient.createEvent(eventData);
      }

      await loadEvents();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;

    try {
      setError(null);
      await apiClient.deleteEvent(event.id);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.toDateString() === date.toDateString();
      });

      if (dayEvents.length > 0) {
        return (
          <div style={{ 
            backgroundColor: '#3b82f6', 
            borderRadius: '50%', 
            width: '6px', 
            height: '6px', 
            margin: '0 auto', 
            marginTop: '2px' 
          }} />
        );
      }
    }
    return null;
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate || Array.isArray(selectedDate)) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>
          가족 일정
        </h1>
        <div style={{ padding: '64px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <p style={{ color: '#6b7280' }}>일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          가족 일정
        </h1>
        <p style={{ color: '#6b7280' }}>
          소중한 날들을 함께 기억해요 ({events.length}개 일정)
        </p>
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

      {/* Main Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', 
        gap: '32px'
      }}>
        {/* Calendar */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => openModal(selectedDate as Date)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + 새 일정 추가
            </button>
          </div>
          
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={getTileContent}
            locale="ko-KR"
            formatDay={(locale, date) => date.getDate().toString()}
            style={{ width: '100%', border: 'none' }}
          />
        </div>

        {/* Event List */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            {selectedDate && !Array.isArray(selectedDate) 
              ? formatDate(selectedDate.toISOString())
              : '날짜를 선택해주세요'
            }
          </h3>

          {selectedDate && !Array.isArray(selectedDate) && (
            <div>
              {getSelectedDateEvents().length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {getSelectedDateEvents().map(event => (
                    <div
                      key={event.id}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#1f2937',
                          margin: 0,
                          flex: 1
                        }}>
                          {event.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => openModal(undefined, event)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#e5e7eb',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
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
                      </div>
                      {event.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#6b7280',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {event.description}
                        </p>
                      )}
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        margin: '4px 0 0 0'
                      }}>
                        {event.is_all_day ? '하루 종일' : '시간 지정'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                    이 날에는 일정이 없습니다
                  </p>
                  <button
                    onClick={() => openModal(selectedDate)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#374151'
                    }}
                  >
                    일정 추가하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding/Editing Events */}
      {showModal && (
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
              {editingEvent ? '일정 수정' : '새 일정 추가'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="일정 제목을 입력하세요"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                날짜 *
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={formData.is_all_day}
                  onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                하루 종일
              </label>
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
                placeholder="일정에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: saving ? 0.6 : 1
                }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (saving || !formData.title.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: (saving || !formData.title.trim()) ? 0.6 : 1
                }}
              >
                {saving ? '저장 중...' : editingEvent ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;