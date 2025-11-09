import React, { useState, useEffect } from 'react';
import './SnippetModal.css';

const TEMPLATES = [
  {
    id: 1,
    name: '기본 템플릿',
    title: 'What/Why 형식',
    content: `What (무엇을 했나요?)


Why (왜 했나요?)


Highlight (잘한 점, 성과)


Lowlight (아쉬운 점, 개선점)


Tomorrow (내일 할 일)`
  },
  {
    id: 2,
    name: '프로젝트 템플릿',
    title: '프로젝트 진행상황',
    content: `📋 오늘 한 일


✅ 완료한 작업


🚧 진행 중


💡 배운 점


📝 내일 할 일`
  },
  {
    id: 3,
    name: '회고 템플릿',
    title: '회고',
    content: `🎯 목표


📊 성과


🤔 어려웠던 점


💪 개선 방안


🔜 다음 계획`
  }
];

function SnippetModal({ date, snippet, onSave, onClose, timeAttackMode = false }) {
  const [snippetType, setSnippetType] = useState(snippet?.snippetType || 'daily');
  const [content, setContent] = useState(snippet?.content || '');
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiScore, setAiScore] = useState(snippet?.aiScore || null);
  const [healthScore, setHealthScore] = useState(snippet?.healthScore || 5);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [isTimeAttack, setIsTimeAttack] = useState(timeAttackMode);

  useEffect(() => {
    setSnippetType(snippet?.snippetType || 'daily');
    setContent(snippet?.content || '');
    setAiScore(snippet?.aiScore || null);
  }, [snippet]);

  // USR-005: 타임어택 타이머
  useEffect(() => {
    if (!isTimeAttack) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('시간이 종료되었습니다! 작성한 내용이 자동 저장됩니다.');
          if (content.trim()) {
            handleSave();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeAttack]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // USR-002: AI 점수 계산 (프론트엔드 시뮬레이션)
    const calculatedScore = calculateAIScore(content);
    
    onSave(date, { 
      snippetType, 
      content,
      aiScore: calculatedScore,
      healthScore,
      submittedAt: new Date().toISOString()
    });
    onClose();
  };

  // USR-002: AI 점수 계산 함수 (프론트엔드 시뮬레이션)
  const calculateAIScore = (text) => {
    const hasWhat = /what|무엇|한\s*일/i.test(text);
    const hasWhy = /why|왜|이유|목적/i.test(text);
    const hasHighlight = /highlight|잘한|성과|완료/i.test(text);
    const hasLowlight = /lowlight|아쉬운|개선|어려운/i.test(text);
    const hasTomorrow = /tomorrow|내일|계획|예정/i.test(text);

    const wordCount = text.trim().split(/\s+/).length;
    const lengthScore = Math.min(wordCount / 10, 20); // 최대 20점

    let score = 0;
    let comments = [];

    if (hasWhat) {
      score += 20;
      comments.push('✅ What 항목이 명확합니다');
    } else {
      comments.push('⚠️ What(무엇을 했는지) 항목을 추가해보세요');
    }

    if (hasWhy) {
      score += 25;
      comments.push('✅ Why 항목이 잘 작성되었습니다');
    } else {
      comments.push('⚠️ Why(왜 했는지) 배경을 추가해보세요');
    }

    if (hasHighlight) {
      score += 20;
      comments.push('✅ Highlight(성과)가 포함되어 있습니다');
    } else {
      comments.push('💡 Highlight(잘한 점)를 추가해보세요');
    }

    if (hasLowlight) {
      score += 15;
      comments.push('✅ Lowlight(개선점)이 포함되어 있습니다');
    } else {
      comments.push('💡 Lowlight(아쉬운 점)를 추가해보세요');
    }

    if (hasTomorrow) {
      score += 20;
      comments.push('✅ Tomorrow(내일 계획)이 명확합니다');
    } else {
      comments.push('⚠️ Tomorrow(내일 할 일)를 추가해보세요');
    }

    return {
      total: Math.round(score),
      breakdown: {
        what: hasWhat ? 20 : 0,
        why: hasWhy ? 25 : 0,
        highlight: hasHighlight ? 20 : 0,
        lowlight: hasLowlight ? 15 : 0,
        tomorrow: hasTomorrow ? 20 : 0
      },
      comments: comments,
      analyzedAt: new Date().toISOString()
    };
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
            {isTimeAttack && (
              <div className={`time-attack-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div className="header-right">
            <button 
              className={`time-attack-toggle ${isTimeAttack ? 'active' : ''}`}
              onClick={() => {
                setIsTimeAttack(!isTimeAttack);
                if (!isTimeAttack) setTimeLeft(300);
              }}
              title="5분 타임어택 모드"
            >
              ⚡ 타임어택
            </button>
            <button className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
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
                Daily
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'weekly' ? 'active' : ''}`}
                onClick={() => setSnippetType('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'monthly' ? 'active' : ''}`}
                onClick={() => setSnippetType('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`type-btn ${snippetType === 'yearly' ? 'active' : ''}`}
                onClick={() => setSnippetType('yearly')}
              >
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
              placeholder="What (무엇을 했나요?)
예: 새로운 기능 개발, 버그 수정, 회의 참석 등

Why (왜 했나요?)
예: 사용자 요청사항, 성능 개선 필요, 팀 협업을 위해 등

Highlight (잘한 점, 성과)
예: 예상보다 빠르게 완료, 좋은 피드백 받음, 새로운 기술 습득

Lowlight (아쉬운 점, 개선점)
예: 시간이 더 걸림, 예상치 못한 문제 발생, 더 나은 방법 고민 필요

Tomorrow (내일 할 일)
예: 리뷰 반영, 다음 단계 진행, 문서화 작업"
            />
          </div>

          {/* USR-002: AI 점수 미리보기 */}
          {content.length > 20 && (
            <div className="ai-score-preview">
              <h4>스니펫 점수</h4>
              {(() => {
                const previewScore = calculateAIScore(content);
                return (
                  <div className="score-preview-content">
                    <div className="score-display">
                      <div className="score-item">
                        <span className="score-label">스니펫 점수</span>
                        <div className="score-circle">
                          <span className="score-number">{previewScore.total}</span>
                          <span className="score-total">/100</span>
                        </div>
                      </div>
                      <div className="score-item">
                        <span className="score-label">헬스체크 점수</span>
                        <div className="score-circle health">
                          <span className="score-number">{healthScore}</span>
                          <span className="score-total">/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="score-breakdown">
                      {previewScore.comments.slice(0, 3).map((comment, idx) => (
                        <p key={idx} className="score-comment">{comment}</p>
                      ))}
                      {previewScore.comments.length > 3 && (
                        <p className="more-comments">+{previewScore.comments.length - 3}개 더...</p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        <div className="health-check-section">
          <h3>Health Check (1-10)</h3>
          <p className="health-check-description">오늘 컨디션은 어떠셨나요?</p>
          <div className="health-score-selector">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
              <button
                key={score}
                className={`health-score-btn ${healthScore === score ? 'active' : ''}`}
                onClick={() => setHealthScore(score)}
              >
                {score}
              </button>
            ))}
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
