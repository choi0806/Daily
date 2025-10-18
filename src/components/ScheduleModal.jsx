import React, { useState } from 'react';
import './ScheduleModal.css';

function ScheduleModal({ date, schedule, onSave, onClose }) {
  const [title, setTitle] = useState(schedule?.title || '');
  const [time, setTime] = useState(schedule?.time || '');
  const [description, setDescription] = useState(schedule?.description || '');
  const [category, setCategory] = useState(schedule?.category || 'work');
  const [priority, setPriority] = useState(schedule?.priority || 'medium');

  const isEditMode = !!schedule?.id;

  const handleSave = () => {
    if (!title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    onSave(date, {
      id: schedule?.id || Date.now(),
      title: title.trim(),
      time,
      description: description.trim(),
      category,
      priority,
      date
    });

    onClose();
  };

  const categoryOptions = [
    { value: 'work', label: '업무', icon: '💼', color: '#3498db' },
    { value: 'meeting', label: '회의', icon: '👥', color: '#9b59b6' },
    { value: 'personal', label: '개인', icon: '🏠', color: '#2ecc71' },
    { value: 'study', label: '학습', icon: '📚', color: '#e74c3c' },
    { value: 'event', label: '이벤트', icon: '🎉', color: '#f39c12' }
  ];

  const priorityOptions = [
    { value: 'high', label: '높음', color: '#e74c3c' },
    { value: 'medium', label: '보통', color: '#f39c12' },
    { value: 'low', label: '낮음', color: '#95a5a6' }
  ];

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            {isEditMode ? '일정 수정' : '일정 추가'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="schedule-modal-content">
          <div className="schedule-date-info">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
            <span>{new Date(date).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}</span>
          </div>

          <div className="form-group">
            <label>일정 제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>시간</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>카테고리</label>
            <div className="category-options">
              {categoryOptions.map(option => (
                <button
                  key={option.value}
                  className={`category-btn ${category === option.value ? 'active' : ''}`}
                  style={{
                    '--category-color': option.color
                  }}
                  onClick={() => setCategory(option.value)}
                >
                  <span className="category-icon">{option.icon}</span>
                  <span className="category-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>우선순위</label>
            <div className="priority-options">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  className={`priority-btn ${priority === option.value ? 'active' : ''}`}
                  style={{
                    '--priority-color': option.color
                  }}
                  onClick={() => setPriority(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="일정에 대한 상세 설명을 입력하세요"
              rows={5}
            />
          </div>
        </div>

        <div className="schedule-modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;
