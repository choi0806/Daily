import React, { useState, useEffect } from 'react';
import { generateTeamSummary } from '../lib/geminiSummary';
import './ManagerDashboard.css';

function ManagerDashboard({ currentUser, userData, date, teamSnippets = [] }) {
  const [stats, setStats] = useState({
    completionRate: 0,
    totalMembers: 9,
    completedMembers: 0,
    pendingMembers: 0
  });

  const [insights, setInsights] = useState({
    topKeywords: [],
    mainActivities: [],
    highlights: []
  });

  const [aiSummary, setAiSummary] = useState({
    summary: '분석 중...',
    projectProgress: {
      status: '분석 중',
      completedTasks: [],
      inProgressTasks: [],
      blockers: []
    },
    keyInsights: [],
    highlights: [],
    concerns: [],
    topKeywords: [],
    recommendations: []
  });

  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (!teamSnippets) return;

    // 작성률 계산
    const completed = teamSnippets.length;
    const total = 9; // 팀원 9명
    const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    setStats({
      completionRate: parseFloat(rate),
      totalMembers: total,
      completedMembers: completed,
      pendingMembers: total - completed
    });

    // 인사이트 분석
    analyzeInsights(teamSnippets);

    // AI 요약은 버튼 클릭 시에만 생성 (자동 생성 제거)
  }, [teamSnippets]);

  const generateAISummary = async (snippets) => {
    console.log('🔄 AI 요약 버튼 클릭됨. 스니펫 수:', snippets.length);
    
    if (!snippets || snippets.length === 0) {
      alert('팀원의 스니펫이 없습니다.');
      return;
    }
    
    setIsLoadingSummary(true);
    try {
      console.log('AI 요약 생성 시작:', { 
        snippetsCount: snippets.length, 
        teamName: userData?.teamName 
      });
      
      const summary = await generateTeamSummary(snippets, userData?.teamName || '팀');
      
      console.log('AI 요약 생성 완료:', summary);
      setAiSummary(summary);
    } catch (error) {
      console.error('AI 요약 생성 오류 상세:', {
        error: error,
        message: error.message,
        stack: error.stack
      });
      
      // API 할당량 초과 시 기본 요약 생성
      const manualSummary = generateManualSummary(snippets);
      setAiSummary({
        summary: `AI 요약을 사용할 수 없습니다. (${error.message.includes('429') ? 'API 할당량 초과' : '오류 발생'})`,
        ...manualSummary
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateManualSummary = (snippets) => {
    // 수동으로 스니펫 분석
    const allContent = snippets.map(s => s.content || '').join(' ');
    const keywords = extractKeywords(allContent);
    
    return {
      projectProgress: {
        status: '진행 중',
        completedTasks: snippets.filter(s => s.content?.includes('완료')).map(s => s.userName + '의 작업'),
        inProgressTasks: snippets.map(s => s.userName + '의 작업'),
        blockers: []
      },
      keyInsights: [`총 ${snippets.length}명의 팀원이 작성했습니다.`],
      highlights: snippets.slice(0, 3).map(s => `${s.userName}: ${(s.content || '').substring(0, 50)}...`),
      concerns: [],
      topKeywords: keywords,
      recommendations: ['팀원들의 스니펫을 검토하세요.']
    };
  };

  const extractKeywords = (text) => {
    const words = text.match(/[\uAC00-\uD7A3]+/g) || [];
    const wordCount = {};
    words.forEach(word => {
      if (word.length > 1) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  const analyzeInsights = (snippets) => {
    if (!snippets || snippets.length === 0) return;

    // 키워드 추출 (간단한 구현)
    const allText = snippets.map(s => s.content || '').join(' ');
    const words = allText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const topKeywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // 주요 활동 추출
    const mainActivities = snippets
      .filter(s => s.content && s.content.length > 20)
      .slice(0, 3)
      .map(s => ({
        userName: s.userName,
        content: s.content.substring(0, 100) + '...'
      }));

    setInsights({
      topKeywords,
      mainActivities,
      highlights: snippets.filter(s => s.likes > 0).slice(0, 3)
    });
  };

  const getCompletionColor = () => {
    if (stats.completionRate >= 80) return '#4CAF50';
    if (stats.completionRate >= 50) return '#FFC107';
    return '#F44336';
  };

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <h2>{userData?.teamName} 대시보드</h2>
        <p className="dashboard-date">{date}</p>
      </div>

      {/* 대시보드 섹션 */}
      <div className="survey-insight">
        <h3 className="section-title">대시보드</h3>
        
        <div className="insight-grid-simple">
          {/* 작성률 */}
          <div className="insight-card completion-card">
            <h4>팀원의 데일리 스니펫 작성률</h4>
            <div className="completion-chart">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={getCompletionColor()}
                  strokeWidth="12"
                  strokeDasharray={`${(stats.completionRate / 100) * 314} 314`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="completion-text">
                <span className="completion-rate">{stats.completionRate}%</span>
              </div>
            </div>
            <div className="completion-details">
              <div className="detail-item">
                <span className="bullet blue"></span>
                <span>스니펫 작성완료 ({stats.completedMembers}명)</span>
              </div>
              <div className="detail-item">
                <span className="bullet gray"></span>
                <span>미작성 ({stats.pendingMembers}명)</span>
              </div>
            </div>
          </div>

          {/* AI 요약 */}
          <div className="insight-card activities-card summary-wide">
            <div className="summary-header">
              <h4>🤖 AI 팀 활동 요약</h4>
              {!isLoadingSummary && (
                <button 
                  className="btn-generate-summary"
                  onClick={() => generateAISummary(teamSnippets)}
                  disabled={teamSnippets.length === 0}
                >
                  🔄 AI 요약 생성
                </button>
              )}
            </div>
            {isLoadingSummary ? (
              <div className="loading-summary">
                <div className="spinner"></div>
                <p>AI가 팀원들의 스니펫을 분석하고 있습니다...</p>
              </div>
            ) : (
              <div className="ai-summary-content">
                <div className="summary-section">
                  <h5>📊 전체 요약</h5>
                  <p className="summary-text">{aiSummary.summary}</p>
                </div>

                {aiSummary.projectProgress && (
                  <div className="summary-section">
                    <h5>🎯 프로젝트 진행 상황</h5>
                    <div className="progress-status">
                      <span className={`status-badge status-${aiSummary.projectProgress.status === '순조롭게 진행 중' ? 'good' : aiSummary.projectProgress.status === '주의 필요' ? 'warning' : 'danger'}`}>
                        {aiSummary.projectProgress.status}
                      </span>
                    </div>
                    
                    {aiSummary.projectProgress.completedTasks && aiSummary.projectProgress.completedTasks.length > 0 && (
                      <div className="task-list">
                        <strong>✅ 완료된 작업:</strong>
                        <ul>
                          {aiSummary.projectProgress.completedTasks.map((task, idx) => (
                            <li key={idx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSummary.projectProgress.inProgressTasks && aiSummary.projectProgress.inProgressTasks.length > 0 && (
                      <div className="task-list">
                        <strong>🔄 진행 중:</strong>
                        <ul>
                          {aiSummary.projectProgress.inProgressTasks.map((task, idx) => (
                            <li key={idx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSummary.projectProgress.blockers && aiSummary.projectProgress.blockers.length > 0 && (
                      <div className="task-list blockers">
                        <strong>⚠️ 이슈/장애 요소:</strong>
                        <ul>
                          {aiSummary.projectProgress.blockers.map((blocker, idx) => (
                            <li key={idx}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {aiSummary.highlights && aiSummary.highlights.length > 0 && (
                  <div className="summary-section">
                    <h5>⭐ 주요 성과</h5>
                    <ul className="highlight-list">
                      {aiSummary.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                  <div className="summary-section">
                    <h5>💡 관리자 액션 아이템</h5>
                    <ul className="recommendation-list">
                      {aiSummary.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.topKeywords && aiSummary.topKeywords.length > 0 && (
                  <div className="keywords-tags">
                    {aiSummary.topKeywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">#{keyword}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI 인사이트 섹션 */}
      <div className="interview-insight">
        <h3 className="section-title">AI Insight.</h3>
        
        <div className="interview-grid">
          {aiSummary.keyInsights && aiSummary.keyInsights.length > 0 ? (
            aiSummary.keyInsights.map((insight, idx) => (
              <div key={idx} className="interview-card">
                <div className="card-number">{String(idx + 1).padStart(2, '0')}</div>
                <h4>주요 인사이트 {idx + 1}</h4>
                <p>{insight}</p>
              </div>
            ))
          ) : (
            <>
              <div className="interview-card">
                <div className="card-number">01</div>
                <h4>팀 하이라이트</h4>
                <p>{aiSummary.highlights && aiSummary.highlights.length > 0 ? aiSummary.highlights[0] : '분석 중...'}</p>
              </div>
              <div className="interview-card">
                <div className="card-number">02</div>
                <h4>개선 포인트</h4>
                <p>{aiSummary.concerns && aiSummary.concerns.length > 0 ? aiSummary.concerns[0] : '분석 중...'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 팀원 스니펫 카드 */}
      <div className="team-snippets-section">
        <h3 className="section-title">팀원 Daily Snippets</h3>
        <div className="snippets-grid">
          {teamSnippets && teamSnippets.length > 0 ? (
            teamSnippets.map((snippet, idx) => (
              <div key={idx} className="snippet-card">
                <div className="snippet-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {snippet.userName?.charAt(0) || '?'}
                    </div>
                    <div className="user-details">
                      <h4>{snippet.userName || '이름 없음'}</h4>
                      <p>{snippet.userRole || '부서 미지정'}</p>
                    </div>
                  </div>
                  <div className="snippet-meta">
                    <span className="snippet-type">{snippet.snippetType || 'daily'}</span>
                  </div>
                </div>
                <div className="snippet-content">
                  <div className="content-section">
                    <strong>📝 작성 내용:</strong>
                    <p>{snippet.content || '내용 없음'}</p>
                  </div>
                  {snippet.accomplishments && snippet.accomplishments.length > 0 && (
                    <div className="content-section">
                      <strong>✅ 성과:</strong>
                      <ul>
                        {snippet.accomplishments.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {snippet.todoList && snippet.todoList.length > 0 && (
                    <div className="content-section">
                      <strong>📋 할 일:</strong>
                      <ul>
                        {snippet.todoList.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="snippet-footer">
                  <div className="snippet-stats">
                    <span className="likes">
                      👍 {snippet.likes?.length || 0}
                    </span>
                    <span className="time">
                      {snippet.timestamp ? new Date(snippet.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-snippets">
              <p>아직 작성된 스니펫이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
