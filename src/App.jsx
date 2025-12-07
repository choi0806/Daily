import React, { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TeamSnippetView from './components/TeamSnippetView';
import SnippetModal from './components/SnippetModal';
import ScheduleView from './components/ScheduleView';
import TemplateEditor from './pages/TemplateEditor';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'template', 'admin'
  
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: '김유신/컴퓨터학회(컴퓨터학회전공)',
    isLoggedIn: true,
    isAdmin: true // 관리자 권한
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null); // 'snippet', 'schedule', or 'tomorrow'
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [snippets, setSnippets] = useState({});
  const [schedules, setSchedules] = useState({});

  // INT-002: Tomorrow 계획 데이터
  const [tomorrowPlans, setTomorrowPlans] = useState({
    '2025-10-18': [
      { date: '2025-10-19', content: '프로젝트 최종 발표 준비', category: 'work' },
      { date: '2025-10-19', content: '코드 리뷰 진행', category: 'work' },
      { date: '2025-10-19', content: '문서화 작업 완료', category: 'study' }
    ],
    '2025-10-19': [
      { date: '2025-10-20', content: '새로운 기능 개발 시작', category: 'work' },
      { date: '2025-10-20', content: '테스트 코드 작성', category: 'work' }
    ]
  });

  // 팀 일정 데이터 (예시)
  const [teamSchedules, setTeamSchedules] = useState({
    '2025-10-15': [
      {
        userId: 1,
        userName: '김유서',
        userRole: '컴퓨터학회(컴퓨터학회전공)',
        schedules: [
          {
            id: 1,
            title: '프로젝트 회의',
            time: '14:00',
            description: '주간 프로젝트 진행상황 회의',
            category: 'meeting',
            priority: 'high',
            date: '2025-10-15'
          },
          {
            id: 2,
            title: '코드 리뷰',
            time: '16:30',
            description: '신규 기능 코드 리뷰',
            category: 'work',
            priority: 'medium',
            date: '2025-10-15'
          },
          {
            id: 3,
            title: '점심 약속',
            time: '12:00',
            description: '팀원들과 점심 식사',
            category: 'personal',
            priority: 'low',
            date: '2025-10-15'
          }
        ]
      },
      {
        userId: 2,
        userName: '김유신',
        userRole: '컴퓨터공학부(컴퓨터학회전공)',
        schedules: [
          {
            id: 4,
            title: '알고리즘 스터디',
            time: '10:00',
            description: '동적 계획법 문제 풀이',
            category: 'study',
            priority: 'high',
            date: '2025-10-15'
          },
          {
            id: 5,
            title: '프로젝트 회의',
            time: '14:00',
            description: '주간 프로젝트 진행상황 회의',
            category: 'meeting',
            priority: 'high',
            date: '2025-10-15'
          },
          {
            id: 6,
            title: '점심 약속',
            time: '12:00',
            description: '팀원들과 점심 식사',
            category: 'personal',
            priority: 'low',
            date: '2025-10-15'
          }
        ]
      },
      {
        userId: 3,
        userName: '이순신',
        userRole: '소프트웨어학과(빅데이터전공)',
        schedules: [
          {
            id: 7,
            title: '데이터 분석 미팅',
            time: '15:00',
            description: '사용자 행동 데이터 분석 결과 공유',
            category: 'work',
            priority: 'high',
            date: '2025-10-15'
          },
          {
            id: 8,
            title: '프로젝트 회의',
            time: '14:00',
            description: '주간 프로젝트 진행상황 회의',
            category: 'meeting',
            priority: 'high',
            date: '2025-10-15'
          }
        ]
      }
    ]
  });

  // 팀 스니펫 데이터 (간단한 예시)
  const [teamSnippets, setTeamSnippets] = useState({
    '2025-10-15': [
      {
        userId: 1,
        userName: '김유서',
        userRole: '컴퓨터학회(컴퓨터학회전공)',
        date: '2025년 10월 15일',
        title: '고객 VOC 분석 및 중간 발표 최종 준비',
        content: `고객 VOC 데이터 분석 및 중간 발표 자료 최종 점검을 진행했습니다. 데이터 시각화 업데이트 및 리허설을 통해 Q&A 대응을 정리했습니다.`,
        tags: [],
        likes: 0,
        likedBy: []
      },
      {
        userId: 2,
        userName: '김유신',
        userRole: '컴퓨터공학부(컴퓨터학회전공)',
        date: '2025년 10월 15일',
        title: '알고리즘 스터디: 동적 계획법 집중 학습',
        content: `동적 계획법 관련 문제 풀이 4문제를 수행하고, 시간 복잡도와 상태 정의를 정리했습니다.`,
        tags: [],
        likes: 3,
        likedBy: [3, 4, 5]
      },
      {
        userId: 3,
        userName: '이철수',
        userRole: '컴퓨터공학부(소프트웨어전공)',
        date: '2025년 10월 15일',
        title: '프로젝트 핵심 기능 구현 및 인프라 점검',
        content: `실시간 채팅 기능의 핵심 로직을 구현하고, 데이터베이스 스키마를 확정했습니다. 기본 부하 테스트를 수행했습니다.`,
        tags: [],
        likes: 1,
        likedBy: [1]
      }
    ]
  });

  const handleLogin = () => {
    setCurrentUser({
      id: 1,
      name: '김유서/컴퓨터학회(컴퓨터학회전공)',
      isLoggedIn: true
    });
  };

  const handleLogout = () => {
    setCurrentUser({
      id: null,
      name: null,
      isLoggedIn: false
    });
  };

  const handleDateClick = (date, mode) => {
    setSelectedDate(date);
    setSelectedMode(mode);
    setShowWriteModal(false);
    setShowScheduleModal(false);
  };

  const handleWriteSnippet = (date) => {
    setShowWriteModal(true);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = (date, scheduleData) => {
    const existingTeamSchedules = teamSchedules[date] || [];
    const userScheduleIndex = existingTeamSchedules.findIndex(s => s.userId === currentUser.id);

    if (editingSchedule) {
      // 수정 모드
      if (userScheduleIndex >= 0) {
        const updatedTeamSchedules = [...existingTeamSchedules];
        const scheduleIndex = updatedTeamSchedules[userScheduleIndex].schedules.findIndex(s => s.id === editingSchedule.id);
        
        if (scheduleIndex >= 0) {
          updatedTeamSchedules[userScheduleIndex].schedules[scheduleIndex] = scheduleData;
          setTeamSchedules({
            ...teamSchedules,
            [date]: updatedTeamSchedules
          });
        }
      }
    } else {
      // 추가 모드
      if (userScheduleIndex >= 0) {
        const updatedTeamSchedules = [...existingTeamSchedules];
        updatedTeamSchedules[userScheduleIndex] = {
          ...updatedTeamSchedules[userScheduleIndex],
          schedules: [...updatedTeamSchedules[userScheduleIndex].schedules, scheduleData]
        };
        setTeamSchedules({
          ...teamSchedules,
          [date]: updatedTeamSchedules
        });
      } else {
        const newUserSchedule = {
          userId: currentUser.id,
          userName: currentUser.name.split('/')[0],
          userRole: currentUser.name.split('/')[1] || '컴퓨터학회(컴퓨터학회전공)',
          schedules: [scheduleData]
        };
        setTeamSchedules({
          ...teamSchedules,
          [date]: [...existingTeamSchedules, newUserSchedule]
        });
      }
    }
    
    setEditingSchedule(null);
    setShowScheduleModal(false);
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      const existingTeamSchedules = teamSchedules[selectedDate] || [];
      const userScheduleIndex = existingTeamSchedules.findIndex(s => s.userId === currentUser.id);

      if (userScheduleIndex >= 0) {
        const updatedTeamSchedules = [...existingTeamSchedules];
        const updatedSchedules = updatedTeamSchedules[userScheduleIndex].schedules.filter(s => s.id !== scheduleId);
        
        updatedTeamSchedules[userScheduleIndex] = {
          ...updatedTeamSchedules[userScheduleIndex],
          schedules: updatedSchedules
        };

        setTeamSchedules({
          ...teamSchedules,
          [selectedDate]: updatedTeamSchedules
        });
      }
    }
  };

  const handleSaveSnippet = (date, snippetData) => {
    // 현재 사용자의 스니펫 저장
    const existingSnippets = teamSnippets[date] || [];
    const userSnippetIndex = existingSnippets.findIndex(s => s.userId === currentUser.id);
    const existingSnippet = userSnippetIndex >= 0 ? existingSnippets[userSnippetIndex] : null;

    const snippetTypeLabels = {
      daily: 'Daily Snippet',
      weekly: 'Weekly Snippet',
      monthly: 'Monthly Snippet',
      yearly: 'Yearly Snippet'
    };

    const newSnippet = {
      userId: currentUser.id,
      userName: currentUser.name.split('/')[0],
      userRole: currentUser.name.split('/')[1] || '',
      date: new Date(date).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      snippetType: snippetData.snippetType || 'daily',
      title: snippetTypeLabels[snippetData.snippetType || 'daily'],
      content: snippetData.content,
      feedback: snippetData.feedback || existingSnippet?.feedback || '', // AI 피드백 저장
      tags: [],
      likes: existingSnippet?.likes || 0,
      likedBy: existingSnippet?.likedBy || []
    };

    if (userSnippetIndex >= 0) {
      // 기존 스니펫 업데이트
      existingSnippets[userSnippetIndex] = newSnippet;
    } else {
      // 새 스니펫 추가
      existingSnippets.push(newSnippet);
    }

    setTeamSnippets({
      ...teamSnippets,
      [date]: existingSnippets
    });

    // snippets state used by Calendar expects an array of snippets for the date
    setSnippets({
      ...snippets,
      [date]: existingSnippets
    });
  };

  const handleCloseTeamView = () => {
    setSelectedDate(null);
    setSelectedMode(null);
    setShowWriteModal(false);
  };

  const handleCloseScheduleView = () => {
    setSelectedDate(null);
    setSelectedMode(null);
    setShowScheduleModal(false);
  };

  const handleCloseWriteModal = () => {
    setShowWriteModal(false);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingSchedule(null);
  };

  const getCurrentUserSnippet = (date) => {
    const dateSnippets = teamSnippets[date];
    if (!dateSnippets) return null;
    
    const userSnippet = dateSnippets.find(s => s.userId === currentUser.id);
    return userSnippet ? { 
      snippetType: userSnippet.snippetType || 'daily',
      content: userSnippet.content 
    } : null;
  };

  const getUserSchedules = (date) => {
    const schedulesForDate = teamSchedules[date] || [];
    const userSchedule = schedulesForDate.find(s => s.userId === currentUser.id);
    return userSchedule ? userSchedule.schedules : [];
  };

  const handleToggleLike = (date, snippetUserId) => {
    const dateSnippets = teamSnippets[date];
    if (!dateSnippets) return;

    const updatedSnippets = dateSnippets.map(snippet => {
      if (snippet.userId === snippetUserId) {
        const likedBy = snippet.likedBy || [];
        const hasLiked = likedBy.includes(currentUser.id);
        
        return {
          ...snippet,
          likes: hasLiked ? (snippet.likes || 1) - 1 : (snippet.likes || 0) + 1,
          likedBy: hasLiked 
            ? likedBy.filter(id => id !== currentUser.id)
            : [...likedBy, currentUser.id]
        };
      }
      return snippet;
    });

    setTeamSnippets({
      ...teamSnippets,
      [date]: updatedSnippets
    });
  };

  const handleTemplateClick = () => {
    setCurrentPage('template');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // 템플릿 편집 페이지 렌더링
  if (currentPage === 'template') {
    return (
      <TemplateEditor 
        user={currentUser}
        onBack={handleBackToHome}
      />
    );
  }

  // 메인 페이지 렌더링
  return (
    <div className="app">
      <Header 
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onTemplateClick={handleTemplateClick}
      />
      
      <div className="main-content">
        <div className="calendar-section">
          <Calendar 
            onDateClick={handleDateClick}
            snippets={teamSnippets}
            schedules={teamSchedules}
            tomorrowPlans={tomorrowPlans}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* AI 챗봇 UI 제거 */}

      {selectedDate && selectedMode === 'snippet' && !showWriteModal && (
        <TeamSnippetView
          date={selectedDate}
          teamSnippets={teamSnippets[selectedDate] || []}
          currentUser={currentUser}
          onClose={handleCloseTeamView}
          onWriteSnippet={handleWriteSnippet}
          onToggleLike={handleToggleLike}
        />
      )}

      {selectedDate && selectedMode === 'schedule' && !showScheduleModal && (
        <ScheduleView
          selectedDate={selectedDate}
          schedules={getUserSchedules(selectedDate)}
          teamSchedules={teamSchedules[selectedDate] || []}
          tomorrowPlans={tomorrowPlans[selectedDate] || []}
          onClose={handleCloseScheduleView}
          onDelete={handleDeleteSchedule}
          onEdit={handleEditSchedule}
          onAdd={handleAddSchedule}
        />
      )}

      {showWriteModal && selectedDate && (
        <SnippetModal
          date={selectedDate}
          snippet={getCurrentUserSnippet(selectedDate)}
          onSave={handleSaveSnippet}
          onClose={handleCloseWriteModal}
          timeAttackMode={false}
        />
      )}

      {/* ScheduleModal was removed; modal is unavailable. */}

      {/* AIChatbot 및 AdminSettings 컴포넌트가 제거되어 관련 UI는 표시되지 않습니다. */}

      {/* 템플릿 에디터 */}
      {currentPage === 'template' && (
        <TemplateEditor onClose={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

export default App;
