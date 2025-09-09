import { useState } from 'react';
import Calendar from 'react-calendar';
import type { Event } from '../types';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const mockEvents: Event[] = [
  {
    id: 1,
    title: "가족 모임",
    date: "2024-09-15",
    description: "추석 가족 모임"
  },
  {
    id: 2,
    title: "아빠 생일",
    date: "2024-09-22", 
    description: "아빠 생신 축하"
  },
  {
    id: 3,
    title: "가족 여행",
    date: "2024-10-05",
    description: "제주도 가족 여행"
  },
  {
    id: 4,
    title: "엄마 생일",
    date: "2024-10-12",
    description: "엄마 생신 축하"
  },
  {
    id: 5,
    title: "결혼기념일",
    date: "2024-10-20",
    description: "부모님 결혼기념일"
  },
  {
    id: 6,
    title: "김장하기",
    date: "2024-11-15",
    description: "온 가족이 함께 김장"
  },
  {
    id: 7,
    title: "송년 모임",
    date: "2024-12-31",
    description: "가족 송년 파티"
  }
];

const Events = () => {
  const [events] = useState<Event[]>(mockEvents);
  const [value, onChange] = useState<Value>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const handleDateClick = (date: Date) => {
    onChange(date);
    const eventsForDate = getEventsForDate(date);
    setSelectedDateEvents(eventsForDate);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const eventsForDate = getEventsForDate(date);
      if (eventsForDate.length > 0) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#2563eb', 
              borderRadius: '50%' 
            }}></div>
          </div>
        );
      }
    }
    return null;
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          가족 일정
        </h1>
        <p style={{ color: '#6b7280' }}>
          중요한 날들과 가족 행사를 확인해보세요
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* Calendar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>달력</h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%'
          }}>
            <Calendar
              onChange={onChange}
              value={value}
              onClickDay={handleDateClick}
              tileContent={tileContent}
              locale="ko-KR"
              formatShortWeekday={(_locale, date) => {
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                return weekdays[date.getDay()];
              }}
              style={{ 
                width: '100%', 
                maxWidth: '100%',
                border: 'none', 
                fontFamily: 'Noto Sans KR'
              }}
            />
          </div>
          
          {/* Selected Date Events */}
          {selectedDateEvents.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px'
            }}>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                {value instanceof Date ? formatDate(value.toISOString()) : '선택된 날짜'}의 일정
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedDateEvents.map((event) => (
                  <div key={event.id} style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{event.title}</h4>
                    {event.description && (
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>다가오는 일정</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcomingEvents.map((event) => (
              <div key={event.id} style={{
                borderLeft: '4px solid #2563eb',
                paddingLeft: '16px',
                paddingTop: '8px',
                paddingBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{event.title}</h3>
                    {event.description && (
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px'
                  }}>
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {upcomingEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>📅</span>
              <p style={{ color: '#9ca3af' }}>다가오는 일정이 없어요</p>
            </div>
          )}
        </div>
      </div>

      {/* All Events List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '24px',
        marginTop: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>전체 일정</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((event) => (
            <div key={event.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{event.title}</h3>
                {event.description && (
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{event.description}</p>
                )}
              </div>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                {formatDate(event.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;