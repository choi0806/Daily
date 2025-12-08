import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TeamSnippetView from './components/TeamSnippetView';
import SnippetModal from './components/SnippetModal';
import ScheduleView from './components/ScheduleView';
import Login from './components/Login';
import InitialSetup from './components/InitialSetup';
import ChangePassword from './components/ChangePassword';
import ManagerDashboard from './components/ManagerDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';

// 현재 날짜를 가져오는 헬퍼 함수 (시스템 날짜 사용)
const getTodayKST = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  console.log('현재 시스템 날짜:', today, '시각:', now.toLocaleString('ko-KR'));
  return today;
};
import { 
  onAuthChange, 
  subscribeToUserData, 
  logoutUser,
  saveSnippet,
  getSnippetsByDate,
  getTeamMemberSnippets,
  toggleSnippetLike
} from './firebase';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Firebase 인증 상태
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: null,
    isLoggedIn: false,
    isAdmin: false
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

  // Firebase 인증 상태 변화 감지
  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      
      if (!user) {
        setUserData(null);
        setCurrentUser({
          id: null,
          name: null,
          isLoggedIn: false,
          isAdmin: false
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 사용자 데이터 구독
  useEffect(() => {
    if (!authUser) return;

    const unsubscribeData = subscribeToUserData(authUser.uid, (data) => {
      console.log('App.jsx 사용자 데이터 업데이트:', data);
      setUserData(data);
      
      if (data && data.isInitialSetupComplete) {
        console.log('초기 설정 완료, currentUser 업데이트');
        setCurrentUser({
          id: data.userId,
          name: `${data.name}/${data.department}`,
          isLoggedIn: true,
          isAdmin: data.isManager || false,
          ...data
        });
      }
    });

    return () => unsubscribeData();
  }, [authUser]);

  // 관리자인 경우 오늘 날짜의 팀원 스니펫 자동 로드
  useEffect(() => {
    if (userData?.isManager && currentUser?.id) {
      const today = getTodayKST();
      console.log('관리자 모드: 오늘 날짜로 설정:', today);
      setSelectedDate(today);
      loadSnippetsForDate(today);
    }
  }, [userData?.isManager, currentUser?.id]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleDateClick = async (date, mode) => {
    setSelectedDate(date);
    setSelectedMode(mode);
    setShowWriteModal(false);
    setShowScheduleModal(false);
    
    // 스니펫 모드인 경우 해당 날짜의 스니펫 로드
    if (mode === 'snippet') {
      await loadSnippetsForDate(date);
    }
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

  const handleSaveSnippet = async (date, snippetData) => {
    try {
      console.log('스니펫 저장 시작:', { date, snippetData, currentUser, userData });
      
      if (!currentUser?.id || !userData?.name) {
        throw new Error('사용자 정보가 없습니다.');
      }

      const snippetTypeLabels = {
        daily: 'Daily Snippet',
        weekly: 'Weekly Snippet',
        monthly: 'Monthly Snippet',
        yearly: 'Yearly Snippet'
      };

      // Firebase에 저장할 데이터
      const snippetToSave = {
        userId: currentUser.id,
        userName: userData.name,
        userRole: userData.department || '미지정',
        managerId: userData.managerId || null,
        isManager: userData.isManager || false,
        snippetType: snippetData.snippetType || 'daily',
        title: snippetTypeLabels[snippetData.snippetType || 'daily'],
        content: snippetData.content,
        feedback: snippetData.feedback || '',
        tags: [],
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Firebase에 저장할 데이터:', snippetToSave);

      // Firebase에 저장
      await saveSnippet(currentUser.id, date, snippetToSave);
      
      console.log('Firebase 저장 완료');

      // 모달 먼저 닫기
      setShowWriteModal(false);
      
      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      const updatedSnippet = {
        ...snippetToSave,
        id: `${currentUser.id}_${date}`,
        date: date
      };
      
      // snippets 상태 업데이트
      setSnippets(prev => ({
        ...prev,
        [date]: prev[date] 
          ? prev[date].map(s => s.userId === currentUser.id ? updatedSnippet : s)
          : [updatedSnippet]
      }));
      
      // teamSnippets 상태도 업데이트
      setTeamSnippets(prev => ({
        ...prev,
        [date]: prev[date]
          ? prev[date].map(s => s.userId === currentUser.id ? updatedSnippet : s)
          : [updatedSnippet]
      }));
      
      console.log('로컬 상태 즉시 업데이트 완료');
      
      // 백그라운드에서 Firebase에서 다시 로드 (검증용)
      setTimeout(() => {
        loadSnippetsForDate(date);
      }, 500);
    } catch (error) {
      console.error('스니펫 저장 오류:', error);
      alert('스니펫 저장에 실패했습니다: ' + error.message);
    }
  };

  // 특정 날짜의 스니펫 로드
  const loadSnippetsForDate = async (date) => {
    try {
      console.log('스니펫 로드 시작:', date, 'isManager:', userData?.isManager, 'managerId:', userData?.managerId);
      let result;
      
      // 관리자인 경우 팀원 스니펫 가져오기
      if (userData?.isManager) {
        result = await getTeamMemberSnippets(currentUser.id, date);
      } else {
        // 일반 사용자는 같은 팀 스니펫만 가져오기
        result = await getSnippetsByDate(date, userData?.managerId);
      }

      const snippetsData = result.success ? result.data : [];
      console.log('로드된 스니펫:', snippetsData);

      setTeamSnippets(prev => ({
        ...prev,
        [date]: snippetsData
      }));

      setSnippets(prev => ({
        ...prev,
        [date]: snippetsData
      }));
    } catch (error) {
      console.error('스니펫 로드 오류:', error);
    }
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

  const handleToggleLike = async (date, snippetUserId) => {
    try {
      const dateSnippets = teamSnippets[date];
      if (!dateSnippets) return;

      const snippet = dateSnippets.find(s => s.userId === snippetUserId);
      if (!snippet) return;

      const likedBy = snippet.likedBy || [];
      const hasLiked = likedBy.includes(currentUser.id);

      // Firebase에 좋아요 토글
      await toggleSnippetLike(snippetUserId, date, currentUser.id, hasLiked);

      // 로컬 상태 업데이트
      const updatedSnippets = dateSnippets.map(s => {
        if (s.userId === snippetUserId) {
          return {
            ...s,
            likes: hasLiked ? (s.likes || 1) - 1 : (s.likes || 0) + 1,
            likedBy: hasLiked 
              ? likedBy.filter(id => id !== currentUser.id)
              : [...likedBy, currentUser.id]
          };
        }
        return s;
      });

      setTeamSnippets({
        ...teamSnippets,
        [date]: updatedSnippets
      });
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
    }
  };



  // 로딩 중
  if (authLoading) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        로딩 중...
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!authUser) {
    return <Login />;
  }

  // 초기 설정이 완료되지 않은 경우
  if (userData && !userData.isInitialSetupComplete) {
    return <InitialSetup currentUser={authUser} />;
  }

  // 비밀번호 변경이 필요한 경우
  if (userData && !userData.passwordChanged) {
    return (
      <ChangePassword 
        currentUser={authUser}
        onPasswordChanged={() => {
          // 비밀번호 변경 후 userData를 다시 로드하여 UI 업데이트
          setUserData({ ...userData, passwordChanged: true });
        }}
      />
    );
  }

  // 메인 페이지 렌더링
  return (
    <div className="app">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
      />
      
      {/* 슈퍼 관리자인 경우 슈퍼 관리자 대시보드 표시 */}
      {userData?.isSuperAdmin && currentPage === 'home' ? (
        <SuperAdminDashboard
          currentUser={currentUser}
          userData={userData}
          date={getTodayKST()}
        />
      ) : /* 관리자인 경우 대시보드만 표시 */
      userData?.isManager && currentPage === 'home' ? (
        <ManagerDashboard
          currentUser={currentUser}
          userData={userData}
          date={getTodayKST()}
          teamSnippets={teamSnippets[getTodayKST()] || []}
        />
      ) : currentPage === 'home' ? (
        <div className="main-content">
          <div className="calendar-section">
            <Calendar 
              onDateClick={handleDateClick}
              snippets={userData?.isManager ? teamSnippets : snippets}
              schedules={teamSchedules}
              tomorrowPlans={tomorrowPlans}
              currentUser={currentUser}
            />
          </div>
        </div>
      ) : null}

      {/* AI 챗봇 UI 제거 */}

      {/* 일반 사용자만 스니펫 작성/조회 가능 */}
      {!userData?.isManager && selectedDate && selectedMode === 'snippet' && !showWriteModal && (
        <TeamSnippetView
          date={selectedDate}
          teamSnippets={teamSnippets[selectedDate] || []}
          currentUser={currentUser}
          onClose={handleCloseTeamView}
          onWriteSnippet={handleWriteSnippet}
          onToggleLike={handleToggleLike}
        />
      )}

      {!userData?.isManager && selectedDate && selectedMode === 'schedule' && !showScheduleModal && (
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

      {/* 일반 사용자만 스니펫 작성 가능 */}
      {!userData?.isManager && showWriteModal && selectedDate && (
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
    </div>
  );
}

export default App;
