import React, { useState } from 'react';
import './Calendar.css';

function Calendar({ onDateClick, snippets, schedules }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [viewMode, setViewMode] = useState('snippet'); // 'snippet' or 'schedule'

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 9, 18)); // October 18, 2025
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  const weeks = [];
  let days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateSnippets = snippets[dateStr];
    const snippetCount = dateSnippets ? dateSnippets.length : 0;
    
    const dateSchedules = schedules ? schedules[dateStr] : null;
    const scheduleCount = dateSchedules ? dateSchedules.reduce((total, user) => total + user.schedules.length, 0) : 0;
    
    const isToday = day === 18 && currentDate.getMonth() === 9; // October 18

    days.push(
      <div 
        key={day} 
        className={`calendar-day ${isToday ? 'today' : ''}`}
        onClick={() => onDateClick(dateStr, viewMode)}
      >
        <span className="day-number">{day}</span>
        <div className="day-indicators">
          {viewMode === 'snippet' && snippetCount > 0 && (
            <div className="day-avatars">
              {Array.from({ length: Math.min(snippetCount, 4) }).map((_, i) => (
                <div key={i} className="avatar"></div>
              ))}
              {snippetCount > 4 && (
                <div className="avatar-count">+{snippetCount - 4}</div>
              )}
            </div>
          )}
          {viewMode === 'schedule' && scheduleCount > 0 && (
            <div className="schedule-indicator">
              <span className="schedule-dot">📅</span>
              <span className="schedule-count">{scheduleCount}</span>
            </div>
          )}
        </div>
      </div>
    );

    if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
      weeks.push(<div key={`week-${weeks.length}`} className="calendar-week">{days}</div>);
      days = [];
    }
  }

  return (
    <div className="calendar">
      <div className="calendar-top-section">
        <div className="calendar-header">
          <button className="nav-btn" onClick={previousMonth}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <div className="month-display">
            <span className="month-name">{monthName}</span>
            <button className="today-btn" onClick={goToToday}>오늘</button>
          </div>
          
          <button className="nav-btn" onClick={nextMonth}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>

        <div className="view-mode-tabs">
          <button 
            className={`view-mode-tab ${viewMode === 'schedule' ? 'active' : ''}`}
            onClick={() => setViewMode('schedule')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            일정 확인
          </button>
          <button 
            className={`view-mode-tab ${viewMode === 'snippet' ? 'active' : ''}`}
            onClick={() => setViewMode('snippet')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Daily Snippet
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        <div className="weekday">일</div>
        <div className="weekday">월</div>
        <div className="weekday">화</div>
        <div className="weekday">수</div>
        <div className="weekday">목</div>
        <div className="weekday">금</div>
        <div className="weekday">토</div>
      </div>

      <div className="calendar-grid">
        {weeks}
      </div>
    </div>
  );
}

export default Calendar;
