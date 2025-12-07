import React, { useState, useEffect } from 'react';
import './SnippetModal.css';
import { generateSnippetFeedback } from '../lib/gemini';

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
  // 타임어택 관련 상태: 시간, 활성화, 그리고 타임업 시 입력 잠금
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [isTimeAttack, setIsTimeAttack] = useState(timeAttackMode);
  const [isLocked, setIsLocked] = useState(false);
  // AI 피드백 생성 상태
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    setSnippetType(snippet?.snippetType || 'daily');
    setContent(snippet?.content || '');
  }, [snippet]);

  // USR-005: 타임어택 타이머
  useEffect(() => {
    if (!isTimeAttack) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 타임업: 자동 저장하고 입력을 잠급니다.
          alert('시간이 종료되었습니다! 작성한 내용이 자동 저장되고 수정이 잠깁니다.');
          setIsTimeAttack(false);
          setIsLocked(true);
          if (content.trim()) {
            // 저장은 하되 모달은 닫지 않음(사용자가 결과를 확인할 수 있도록)
            handleSave(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeAttack, content]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // closeAfter=true 면 저장 후 모달을 닫고,
  // closeAfter=false 면 저장만 수행(타임업 자동저장 시 사용)
  const handleSave = async (closeAfter = true) => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      // AI 피드백 생성 시작 (백그라운드에서 진행)
      setIsGeneratingFeedback(true);
      
      // 먼저 스니펫을 저장 (피드백 없이)
      await onSave(date, { 
        snippetType, 
        content,
        feedback: '', // 일단 빈 피드백으로 저장
        submittedAt: new Date().toISOString()
      });

      // 모달을 먼저 닫음
      if (closeAfter) {
        onClose();
      }

      // 백그라운드에서 AI 피드백 생성 후 다시 저장
      try {
        const feedback = await generateSnippetFeedback(content, '사용자');
        // 피드백이 생성되면 다시 저장하여 업데이트
        await onSave(date, { 
          snippetType, 
          content,
          feedback,
          submittedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('피드백 생성 실패:', error);
        // 실패해도 스니펫은 이미 저장되었으므로 문제없음
      } finally {
        setIsGeneratingFeedback(false);
      }
    } catch (error) {
      console.error('스니펫 저장 오류:', error);
      alert('스니펫 저장에 실패했습니다: ' + error.message);
      setIsGeneratingFeedback(false);
    }
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
                if (isLocked) return; // 잠금 상태면 변경 불가
                setIsTimeAttack(!isTimeAttack);
                if (!isTimeAttack) setTimeLeft(300);
              }}
              title="5분 타임어택 모드"
              disabled={isLocked}
            >
              ⚡ 타임어택 {isTimeAttack ? `(${formatTime(timeLeft)})` : ''}
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
              onChange={(e) => { if (!isLocked) setContent(e.target.value); }}
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
        </div>
        
        
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={() => handleSave(true)} disabled={isLocked}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default SnippetModal;
