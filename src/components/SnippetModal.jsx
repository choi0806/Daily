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
  const [content, setContent] = useState(snippet?.content || '');
  // 타임어택 관련 상태: 시간, 활성화, 그리고 타임업 시 입력 잠금
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  // 기존 스니펫 수정 시에는 타임어택 비활성화
  const [isTimeAttack, setIsTimeAttack] = useState(snippet ? false : timeAttackMode);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setContent(snippet?.content || '');
    // 기존 스니펫을 수정하는 경우 타임어택 모드 해제 및 잠금 해제
    if (snippet) {
      setIsTimeAttack(false);
      setIsLocked(false);
    }
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
      await onSave(date, { 
        snippetType: 'daily',
        content,
        submittedAt: new Date().toISOString()
      });

      if (closeAfter) {
        onClose();
      }
    } catch (error) {
      console.error('스니펫 저장 오류:', error);
      alert('스니펫 저장에 실패했습니다: ' + error.message);
    }
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
          <div className="form-group">
            <label htmlFor="snippet-content">
              Daily Snippet 내용
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
