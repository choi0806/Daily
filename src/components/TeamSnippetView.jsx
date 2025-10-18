import React, { useState } from 'react';
import './TeamSnippetView.css';

function TeamSnippetView({ date, teamSnippets, currentUser, onClose, onWriteSnippet, onToggleLike }) {
  const [selectedTeammate, setSelectedTeammate] = useState(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const mySnippet = teamSnippets.find(s => s.userId === currentUser.id);
  const teammateSnippets = teamSnippets.filter(s => s.userId !== currentUser.id);

  // 현재 표시할 스니펫 (선택된 팀원 스니펫 또는 내 스니펫)
  const displayedSnippet = selectedTeammate || mySnippet;

  const handleTeammateClick = (snippet) => {
    setSelectedTeammate(selectedTeammate?.userId === snippet.userId ? null : snippet);
  };

  const handleLike = (snippetUserId) => {
    onToggleLike(date, snippetUserId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="team-snippet-modal split-view" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{formatDate(date)}</h2>
            <p className="subtitle">나와 팀원들의 스니펫</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="team-snippet-content split-layout">
          {/* 왼쪽: 스니펫 상세 보기 */}
          <div className="my-snippet-section">
            <div className="section-header">
              <h3>{selectedTeammate ? '팀원 스니펫' : '내 스니펫'}</h3>
              <div className="header-actions">
                {selectedTeammate && (
                  <button className="back-btn" onClick={() => setSelectedTeammate(null)}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    내 스니펫으로
                  </button>
                )}
                {mySnippet && !selectedTeammate && (
                  <button className="edit-btn" onClick={() => onWriteSnippet(date)}>
                    수정
                  </button>
                )}
              </div>
            </div>
            
            {displayedSnippet ? (
              <div className={`snippet-card ${selectedTeammate ? 'teammate-snippet' : 'my-snippet'}`}>
                <div className="snippet-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="user-name">{displayedSnippet.userName}</span>
                      <span className="user-role">{displayedSnippet.userRole}</span>
                    </div>
                  </div>
                  {displayedSnippet.score && (
                    <div className="snippet-score">
                      <span className="score-badge">{displayedSnippet.score} 점</span>
                    </div>
                  )}
                </div>
                
                <div className="snippet-body">
                  {displayedSnippet.title && <h3 className="snippet-title">{displayedSnippet.title}</h3>}
                  <div className="snippet-content">
                    {displayedSnippet.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  
                  {displayedSnippet.tags && displayedSnippet.tags.length > 0 && (
                    <div className="snippet-tags">
                      {displayedSnippet.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTeammate && (
                  <div className="snippet-actions">
                    <button 
                      className={`like-btn ${selectedTeammate.likedBy?.includes(currentUser.id) ? 'liked' : ''}`}
                      onClick={() => handleLike(selectedTeammate.userId)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{selectedTeammate.likes || 0}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-my-snippet">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p>아직 작성한 스니펫이 없습니다</p>
                <button className="write-snippet-btn" onClick={() => onWriteSnippet(date)}>
                  스니펫 작성하기
                </button>
              </div>
            )}
          </div>

          {/* 오른쪽: 팀원 스니펫 목록 */}
          <div className="teammates-section">
            <div className="section-header">
              <h3>팀원 스니펫 ({teammateSnippets.length})</h3>
            </div>
            
            {teammateSnippets.length === 0 ? (
              <div className="empty-teammates">
                <p>팀원이 작성한 스니펫이 없습니다</p>
              </div>
            ) : (
              <div className="teammates-list">
                {teammateSnippets.map((snippet, index) => (
                  <div 
                    key={index} 
                    className={`teammate-item ${selectedTeammate?.userId === snippet.userId ? 'active' : ''}`}
                    onClick={() => handleTeammateClick(snippet)}
                  >
                    <div className="teammate-avatar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div className="teammate-info">
                      <div className="teammate-name-row">
                        <span className="teammate-name">{snippet.userName}</span>
                        {snippet.score && (
                          <span className="teammate-score">{snippet.score}점</span>
                        )}
                      </div>
                      <span className="teammate-preview">
                        {snippet.title || snippet.content.substring(0, 30) + '...'}
                      </span>
                    </div>
                    <svg className="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {!mySnippet && (
            <button className="primary-btn" onClick={() => onWriteSnippet(date)}>
              스니펫 작성하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamSnippetView;
