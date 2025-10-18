import React, { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Leaderboard from './components/Leaderboard';
import TeamSnippetView from './components/TeamSnippetView';
import SnippetModal from './components/SnippetModal';
import ScheduleView from './components/ScheduleView';
import ScheduleModal from './components/ScheduleModal';
import TemplateEditor from './pages/TemplateEditor';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'template'
  
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: '김유서/컴퓨터학회(컴퓨터학회전공)',
    isLoggedIn: true
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null); // 'snippet' or 'schedule'
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [snippets, setSnippets] = useState({});
  const [schedules, setSchedules] = useState({});

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

  // 팀 스니펫 데이터 (예시)
  const [teamSnippets, setTeamSnippets] = useState({
    '2025-10-15': [
      {
        userId: 1,
        userName: '김유서',
        userRole: '컴퓨터학회(컴퓨터학회전공)',
        date: '2025년 10월 15일',
        title: '이번엔 고수님의 인간본성 수업',
        content: `이번엔 고수님의 인간본성 수업

중간 발표 준비

Why 성준과 변석에대해 인간의 마음으로 해결해야할 문제에대해 mece 기법으로 쪼개어 상각해 볼 그리다 보면 인간본성을 자극하는 해결에 할 문제들을 찾을 수 있음

내일 중간블로 시간이 있어 하루전날인 오늘 최종적으로 팀원들과 발표준비를 열심히 진행함`,
        tags: [],
        score: 48,
        likes: 0,
        likedBy: []
      },
      {
        userId: 2,
        userName: '김유신',
        userRole: '컴퓨터디공학부(컴퓨터학회전공)',
        date: '2025년 10월 15일',
        title: 'What',
        content: `What

• 이번엔 고수님의 인간본성 수업

• 중간 발표 준비

Why`,
        tags: [],
        score: 52,
        likes: 3,
        likedBy: [3, 4, 5]
      },
      {
        userId: 3,
        userName: '이철수',
        userRole: '컴퓨터공학부(소프트웨어전공)',
        date: '2025년 10월 15일',
        title: '프로젝트 진행 상황',
        content: `오늘은 팀 프로젝트의 핵심 기능을 구현했습니다.

React와 Node.js를 활용한 실시간 채팅 기능 개발
데이터베이스 스키마 설계 완료
API 엔드포인트 5개 구현

내일은 프론트엔드 UI를 다듬을 예정입니다.`,
        tags: [],
        score: 45,
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
      tags: [],
      score: existingSnippet?.score || 0,
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

    setSnippets({
      ...snippets,
      [date]: snippetData
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
          />
        </div>
        
        <div className="leaderboard-section">
          <Leaderboard />
        </div>
      </div>

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
        />
      )}

      {showScheduleModal && selectedDate && (
        <ScheduleModal
          date={selectedDate}
          schedule={editingSchedule}
          onSave={handleSaveSchedule}
          onClose={handleCloseScheduleModal}
        />
      )}
    </div>
  );
}

export default App;
