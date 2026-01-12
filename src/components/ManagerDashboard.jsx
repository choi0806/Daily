import React, { useState, useEffect } from 'react';
import { generateTeamSummary } from '../lib/geminiSummary';
import { saveManagerFeedback } from '../firebase/firestore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ManagerDashboard.css';

function ManagerDashboard({ currentUser, userData, date, teamSnippets = [] }) {
  const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [periodSnippets, setPeriodSnippets] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const [feedbackInputs, setFeedbackInputs] = useState({}); // 각 스니펫별 피드백 입력 상태
  const [savingFeedback, setSavingFeedback] = useState({}); // 저장 중 상태

  // 주차 계산 함수
  const getWeekNumber = (date) => {
    const d = new Date(date);
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // 주차 범위 계산
  const getWeekRange = (year, week) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 86400000);
    
    // 주의 시작을 월요일로 조정
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diff);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
    };
  };

  // 기간별 스니펫 로드
  const loadPeriodSnippets = async () => {
    setLoading(true);
    try {
      let startDate, endDate;

      if (viewMode === 'daily') {
        startDate = endDate = selectedDate;
        // 일간 모드: 정확한 날짜 매칭 (인덱스 불필요)
        // 사업관리팀(28, 37)은 같은 팀원을 관리
        const isBusinessTeam = currentUser.id === 28 || currentUser.id === 37;
        const snippetsQuery = isBusinessTeam
          ? query(
              collection(db, 'snippets'),
              where('managerId', 'in', [28, 37]),
              where('date', '==', selectedDate)
            )
          : query(
              collection(db, 'snippets'),
              where('managerId', '==', currentUser.id),
              where('date', '==', selectedDate)
            );
        
        const snapshot = await getDocs(snippetsQuery);
        const snippetsData = [];
        snapshot.forEach((doc) => {
          snippetsData.push({ id: doc.id, ...doc.data() });
        });

        // 클라이언트 측 정렬
        snippetsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log('로드된 스니펫:', snippetsData.length, '개');
        setPeriodSnippets(snippetsData);
        setLoading(false);
        return;
      } else if (viewMode === 'weekly' && selectedWeek) {
        const [year, week] = selectedWeek.split('-W');
        const range = getWeekRange(parseInt(year), parseInt(week));
        startDate = range.start;
        endDate = range.end;
      } else if (viewMode === 'monthly' && selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endDate = `${year}-${month}-${lastDay}`;
      } else {
        setPeriodSnippets([]);
        setLoading(false);
        return;
      }

      console.log('스니펫 로드:', { viewMode, startDate, endDate, managerId: currentUser.id });

      // 사업관리팀(28, 37)은 같은 팀원을 관리
      const isBusinessTeam = currentUser.id === 28 || currentUser.id === 37;
      const snippetsQuery = isBusinessTeam
        ? query(
            collection(db, 'snippets'),
            where('managerId', 'in', [28, 37]),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
            // 인덱스 생성 완료 후 아래 주석 해제
            // orderBy('date', 'desc'),
            // orderBy('timestamp', 'desc')
          )
        : query(
            collection(db, 'snippets'),
            where('managerId', '==', currentUser.id),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
            // 인덱스 생성 완료 후 아래 주석 해제
            // orderBy('date', 'desc'),
            // orderBy('timestamp', 'desc')
          );

      const snapshot = await getDocs(snippetsQuery);
      const snippetsData = [];
      snapshot.forEach((doc) => {
        snippetsData.push({ id: doc.id, ...doc.data() });
      });

      // 클라이언트 측 정렬 (인덱스 생성 전까지)
      snippetsData.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });

      console.log('로드된 스니펫:', snippetsData.length, '개');
      setPeriodSnippets(snippetsData);
    } catch (error) {
      console.error('스니펫 로드 오류:', error);
      alert('스니펫을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 날짜 설정
    if (viewMode === 'daily') {
      setSelectedDate(date);
    } else if (viewMode === 'weekly') {
      const now = new Date();
      const year = now.getFullYear();
      const week = getWeekNumber(now);
      setSelectedWeek(`${year}-W${String(week).padStart(2, '0')}`);
    } else if (viewMode === 'monthly') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${year}-${month}`);
    }
  }, [viewMode, date]);

  useEffect(() => {
    loadPeriodSnippets();
  }, [viewMode, selectedDate, selectedWeek, selectedMonth, currentUser.id]);

  useEffect(() => {
    const snippetsToAnalyze = periodSnippets.length > 0 ? periodSnippets : teamSnippets;
    if (!snippetsToAnalyze || snippetsToAnalyze.length === 0) return;

    // 팀원 수 계산 (관리자 ID에 따라 다름)
    let totalMembers = 11; // 기본값 (피플파트너팀: 2-11, 38)
    if (currentUser.id === 12) {
      totalMembers = 7; // HRBP팀: 13-17, 26-27
    } else if (currentUser.id === 18) {
      totalMembers = 7; // 안전보건팀: 19-25
    } else if (currentUser.id === 28 || currentUser.id === 37) {
      totalMembers = 9; // 사업관리팀: 29-36, 39
    } else if (currentUser.isSuperAdmin || currentUser.isMasterAccount) {
      // 마스터 계정은 전체 팀원 수
      totalMembers = 34; // 11 + 7 + 7 + 9
    }

    // 기간별로 고유 사용자 수 계산
    const uniqueUsers = new Set(snippetsToAnalyze.map(s => s.userId));
    const completed = uniqueUsers.size;
    const rate = totalMembers > 0 ? ((completed / totalMembers) * 100).toFixed(1) : 0;

    setStats({
      completionRate: parseFloat(rate),
      totalMembers: totalMembers,
      completedMembers: completed,
      pendingMembers: totalMembers - completed
    });

    // 인사이트 분석
    analyzeInsights(snippetsToAnalyze);

    // 피드백 입력 상태 초기화 (기존 피드백이 있으면 표시)
    const initialFeedbacks = {};
    snippetsToAnalyze.forEach(snippet => {
      const key = `${snippet.userId}_${snippet.date}`;
      initialFeedbacks[key] = snippet.managerFeedback || '';
    });
    setFeedbackInputs(initialFeedbacks);

    // AI 요약은 버튼 클릭 시에만 생성 (자동 생성 제거)
  }, [periodSnippets, teamSnippets, currentUser.id]);

  const generateAISummary = async () => {
    // 현재 보기 모드에 따라 적절한 스니펫 사용
    const snippets = periodSnippets.length > 0 ? periodSnippets : teamSnippets;
    console.log('🔄 AI 요약 버튼 클릭됨. 스니펫 수:', snippets.length, '모드:', viewMode);
    
    if (!snippets || snippets.length === 0) {
      alert('팀원의 스니펫이 없습니다.');
      return;
    }
    
    setIsLoadingSummary(true);
    try {
      console.log('AI 요약 생성 시작:', { 
        snippetsCount: snippets.length, 
        teamName: userData?.teamName,
        viewMode: viewMode
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

  const handleFeedbackChange = (userId, snippetDate, value) => {
    const key = `${userId}_${snippetDate}`;
    setFeedbackInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveFeedback = async (snippet) => {
    const key = `${snippet.userId}_${snippet.date}`;
    const feedback = feedbackInputs[key];
    if (!feedback || !feedback.trim()) {
      alert('피드백을 입력해주세요.');
      return;
    }

    setSavingFeedback(prev => ({ ...prev, [key]: true }));

    try {
      const result = await saveManagerFeedback(snippet.userId, snippet.date, feedback);
      if (result.success) {
        alert('피드백이 저장되었습니다.');
        // 스니펫 데이터 새로고침
        await loadPeriodSnippets();
      } else {
        alert('피드백 저장 실패: ' + result.error);
      }
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      alert('피드백 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingFeedback(prev => ({ ...prev, [key]: false }));
    }
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

      {/* 기간 선택 섹션 */}
      <div className="period-selector-section">
        <div className="view-mode-tabs">
          <button 
            className={`mode-tab ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            일간
          </button>
          <button 
            className={`mode-tab ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            주간
          </button>
          <button 
            className={`mode-tab ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            월간
          </button>
        </div>

        <div className="date-selector">
          {viewMode === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          )}
          {viewMode === 'weekly' && (
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="date-input"
            />
          )}
          {viewMode === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="date-input"
            />
          )}
        </div>
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
                  onClick={generateAISummary}
                  disabled={(periodSnippets.length === 0 && teamSnippets.length === 0)}
                >
                  🔄 {viewMode === 'daily' ? '일간' : viewMode === 'weekly' ? '주간' : '월간'} AI 요약 생성
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
                <div className="summary-section" style={{marginBottom: '20px'}}>
                  <div dangerouslySetInnerHTML={{ __html: aiSummary.summary }} />
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
                        <strong>🔄 진행 중 ({aiSummary.projectProgress.inProgressTasks.length}개 작업)</strong>
                        <div style={{marginTop: '15px'}}>
                          {(() => {
                            // 팀원별로 작업 그룹화
                            const tasksByMember = {};
                            aiSummary.projectProgress.inProgressTasks.forEach(task => {
                              const colonIndex = task.indexOf(':');
                              if (colonIndex > 0) {
                                const memberName = task.substring(0, colonIndex).trim();
                                const taskContent = task.substring(colonIndex + 1).trim();
                                if (!tasksByMember[memberName]) {
                                  tasksByMember[memberName] = [];
                                }
                                tasksByMember[memberName].push(taskContent);
                              }
                            });

                            return Object.entries(tasksByMember).map(([member, tasks]) => (
                              <div key={member} style={{
                                marginBottom: '15px',
                                padding: '12px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '3px solid #667eea'
                              }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#667eea',
                                  marginBottom: '8px',
                                  fontSize: '14px'
                                }}>
                                  👤 {member}
                                </div>
                                <ul style={{margin: 0, paddingLeft: '20px'}}>
                                  {tasks.map((task, idx) => (
                                    <li key={idx} style={{marginBottom: '4px', lineHeight: '1.5'}}>{task}</li>
                                  ))}
                                </ul>
                              </div>
                            ));
                          })()}
                        </div>
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
        <h3 className="section-title">
          {viewMode === 'daily' && '팀원 Daily Snippets'}
          {viewMode === 'weekly' && '팀원 Weekly Snippets'}
          {viewMode === 'monthly' && '팀원 Monthly Snippets'}
        </h3>
        
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>스니펫을 불러오는 중...</p>
          </div>
        ) : (periodSnippets.length > 0 || teamSnippets.length > 0) ? (
          <div className="snippets-grid">
            {(() => {
              const snippetsToDisplay = periodSnippets.length > 0 ? periodSnippets : teamSnippets;
              
              // 주간/월간 모드: 이름별로 그룹화
              if (viewMode !== 'daily' && periodSnippets.length > 0) {
                const groupedByUser = {};
                snippetsToDisplay.forEach(snippet => {
                  const userName = snippet.userName || '이름 없음';
                  if (!groupedByUser[userName]) {
                    groupedByUser[userName] = [];
                  }
                  groupedByUser[userName].push(snippet);
                });

                return Object.entries(groupedByUser).map(([userName, userSnippets]) => (
                  <div key={userName} className="user-snippets-group">
                    <h4 className="user-group-header">👤 {userName} ({userSnippets.length}개)</h4>
                    {userSnippets.map((snippet, idx) => (
              <div key={`${snippet.userId}_${snippet.date}_${idx}`} className="snippet-card">
                <div className="snippet-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {snippet.userName?.charAt(0) || '?'}
                    </div>
                    <div className="user-details">
                      <h4>{snippet.userName || '이름 없음'}</h4>
                      <p>{snippet.userRole || '부서 미지정'}</p>
                      {viewMode !== 'daily' && (
                        <span className="snippet-date">📅 {snippet.date}</span>
                      )}
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

                {/* 팀장 피드백 섹션 */}
                <div className="manager-feedback-section">
                  <strong>💬 팀장 피드백:</strong>
                  <textarea
                    className="feedback-textarea"
                    value={feedbackInputs[`${snippet.userId}_${snippet.date}`] || ''}
                    onChange={(e) => handleFeedbackChange(snippet.userId, snippet.date, e.target.value)}
                    placeholder="팀원에게 피드백을 작성해주세요..."
                    rows="3"
                  />
                  <button
                    className="btn-save-feedback"
                    onClick={() => handleSaveFeedback(snippet)}
                    disabled={savingFeedback[`${snippet.userId}_${snippet.date}`]}
                  >
                    {savingFeedback[`${snippet.userId}_${snippet.date}`] ? '저장 중...' : '피드백 저장'}
                  </button>
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
                    ))}
                  </div>
                ));
              }
              
              // 일간 모드: 일반 표시
              return snippetsToDisplay.map((snippet, idx) => (
              <div key={`${snippet.userId}_${snippet.date}_${idx}`} className="snippet-card">
                <div className="snippet-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {snippet.userName?.charAt(0) || '?'}
                    </div>
                    <div className="user-details">
                      <h4>{snippet.userName || '이름 없음'}</h4>
                      <p>{snippet.userRole || '부서 미지정'}</p>
                      {viewMode !== 'daily' && (
                        <span className="snippet-date">📅 {snippet.date}</span>
                      )}
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

                {/* 팀장 피드백 섹션 */}
                <div className="manager-feedback-section">
                  <strong>💬 팀장 피드백:</strong>
                  <textarea
                    className="feedback-textarea"
                    value={feedbackInputs[`${snippet.userId}_${snippet.date}`] || ''}
                    onChange={(e) => handleFeedbackChange(snippet.userId, snippet.date, e.target.value)}
                    placeholder="팀원에게 피드백을 작성해주세요..."
                    rows="3"
                  />
                  <button
                    className="btn-save-feedback"
                    onClick={() => handleSaveFeedback(snippet)}
                    disabled={savingFeedback[`${snippet.userId}_${snippet.date}`]}
                  >
                    {savingFeedback[`${snippet.userId}_${snippet.date}`] ? '저장 중...' : '피드백 저장'}
                  </button>
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
              ));
            })()}
          </div>
        ) : (
          <div className="no-snippets">
            <p>선택한 기간에 작성된 스니펫이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerDashboard;
