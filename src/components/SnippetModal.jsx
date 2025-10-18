import React, { useState, useEffect } from 'react';
import './SnippetModal.css';

const TEMPLATES = [
  {
    id: 1,
    name: '템플릿 1',
    title: '오늘의 업무',
    content: `What


Why


Highlight


Lowlight


Tomorrow`
  },
  {
    id: 2,
    name: '템플릿 2',
    title: '프로젝트 진행상황',
    content: `📋 오늘 한 일


✅ 완료한 작업


🚧 진행 중


💡 배운 점


📝 내일 할 일`
  },
  {
    id: 3,
    name: '템플릿 3',
    title: '회고',
    content: `🎯 목표


📊 성과


🤔 어려웠던 점


💪 개선 방안


🔜 다음 계획`
  }
];

function SnippetModal({ date, snippet, onSave, onClose }) {
  const [snippetType, setSnippetType] = useState(snippet?.snippetType || 'daily');
  const [content, setContent] = useState(snippet?.content || '');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setSnippetType(snippet?.snippetType || 'daily');
    setContent(snippet?.content || '');
  }, [snippet]);

  const handleSave = () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    onSave(date, { snippetType, content });
    onClose();
  };

  const handleTemplateSelect = (template) => {
    setContent(template.content);
    setShowTemplates(false);
  };

  const getSnippetTypeLabel = (type) => {
    const labels = {
      daily: 'Daily Snippet',
      weekly: 'Weekly Snippet',
      monthly: 'Monthly Snippet',
      yearly: 'Yearly Snippet'
    };
    return labels[type] || 'Daily Snippet';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content snippet-write-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2>{formatDate(date)}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="template-section">
            <button 
              className="template-toggle-btn"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              템플릿 불러오기
              <svg className={`arrow-icon ${showTemplates ? 'open' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>

            {showTemplates && (
              <div className="template-list">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className="template-item"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    </div>
                    <div className="template-info">
                      <span className="template-name">{template.name}</span>
                      <span className="template-preview">{template.title}</span>
                    </div>
                    <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="snippet-type">스니펫 유형</label>
            <div className="snippet-type-selector">
              <button
                type="button"
                className={`type-btn ${snippetType === 'daily' ? 'active' : ''}`}
                onClick={() => setSnippetType('daily')}
              >
                <span className="type-icon">📅</span>
                Daily
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'weekly' ? 'active' : ''}`}
                onClick={() => setSnippetType('weekly')}
              >
                <span className="type-icon">📊</span>
                Weekly
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'monthly' ? 'active' : ''}`}
                onClick={() => setSnippetType('monthly')}
              >
                <span className="type-icon">📆</span>
                Monthly
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'yearly' ? 'active' : ''}`}
                onClick={() => setSnippetType('yearly')}
              >
                <span className="type-icon">🗓️</span>
                Yearly
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="snippet-content">
              {getSnippetTypeLabel(snippetType)} 내용
            </label>
            <textarea
              id="snippet-content"
              className="snippet-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Why 성준과 변석에대해 인간의 마음으로 해결해야할 문제에대해 mece 기법으로 쪼개어 상각해 볼 그리다 보면 인간본성을 자극하는 해결에 할 문제들을 찾을 수 있음

내일 중간블로 시간이 있어 하루전날인 오늘 최종적으로 팀원들과 발표준비를 열심히 진행함

today 문제정의에 많은 시간을 들이기 탄탄대로 경교하다고 생각했는데,팀원들과 패널의 추점을 할 좋 탕월들이 문제정의 단계로 가서 근거지표에대한..."
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="save-btn" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default SnippetModal;
