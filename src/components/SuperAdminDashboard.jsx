import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import './SuperAdminDashboard.css';

function SuperAdminDashboard({ currentUser, userData, date }) {
  const [allSnippets, setAllSnippets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('snippets'); // 'snippets' or 'users'
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    loadAllData();
  }, [selectedDate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 모든 스니펫 로드
      const snippetsQuery = query(
        collection(db, 'snippets'),
        orderBy('timestamp', 'desc')
      );
      const snippetsSnapshot = await getDocs(snippetsQuery);
      const snippetsData = [];
      snippetsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date === selectedDate) {
          snippetsData.push({ id: doc.id, ...data });
        }
      });
      setAllSnippets(snippetsData);

      // 모든 사용자 로드
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers(usersData.sort((a, b) => a.id - b.id));
      
      console.log('슈퍼 관리자: 스니펫', snippetsData.length, '개, 사용자', usersData.length, '명 로드');
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamStats = () => {
    const stats = {
      total: allUsers.length,
      superAdmin: allUsers.filter(u => u.isSuperAdmin).length,
      managers: allUsers.filter(u => u.isManager && !u.isSuperAdmin).length,
      members: allUsers.filter(u => !u.isManager).length,
    };
    return stats;
  };

  const getSnippetStats = () => {
    return {
      total: allSnippets.length,
      byTeam: {
        '피플파트너팀': allSnippets.filter(s => s.teamName === '피플파트너팀').length,
        'HRBP팀': allSnippets.filter(s => s.teamName === 'HRBP팀').length,
        '안전보건팀': allSnippets.filter(s => s.teamName === '안전보건팀').length,
      }
    };
  };

  const stats = getTeamStats();
  const snippetStats = getSnippetStats();

  if (loading) {
    return (
      <div className="super-admin-dashboard loading">
        <div className="spinner"></div>
        <p>데이터를 로드하는 중...</p>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <h2>🔐 슈퍼 관리자 대시보드</h2>
        <div className="date-selector">
          <label htmlFor="date-picker">날짜 선택:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>전체 사용자</h3>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-details">
            <span>슈퍼 관리자: {stats.superAdmin}</span>
            <span>팀 관리자: {stats.managers}</span>
            <span>팀원: {stats.members}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>오늘의 스니펫</h3>
          <div className="stat-number">{snippetStats.total}</div>
          <div className="stat-details">
            {Object.entries(snippetStats.byTeam).map(([team, count]) => (
              <span key={team}>{team}: {count}개</span>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'snippets' ? 'active' : ''}`}
          onClick={() => setActiveTab('snippets')}
        >
          📝 모든 스니펫 ({allSnippets.length})
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 사용자 목록 ({allUsers.length})
        </button>
      </div>

      {/* 스니펫 탭 */}
      {activeTab === 'snippets' && (
        <div className="snippets-section">
          <div className="snippets-grid">
            {allSnippets.length > 0 ? (
              allSnippets.map((snippet) => (
                <div key={snippet.id} className="snippet-card">
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
                    <span className="user-id">ID: {snippet.userId}</span>
                  </div>
                  <div className="snippet-content">
                    <p>{snippet.content || '내용 없음'}</p>
                  </div>
                  <div className="snippet-footer">
                    <span className="snippet-time">
                      {snippet.timestamp ? new Date(snippet.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span className="snippet-likes">
                      👍 {snippet.likes?.length || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>오늘 작성된 스니펫이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 사용자 탭 */}
      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>역할</th>
                  <th>부서</th>
                  <th>이메일</th>
                  <th>가입일</th>
                  <th>비밀번호 변경</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`role-badge ${user.isSuperAdmin ? 'super' : user.isManager ? 'manager' : 'member'}`}>
                        {user.isSuperAdmin ? '슈퍼 관리자' : user.isManager ? '관리자' : '팀원'}
                      </span>
                    </td>
                    <td>{user.department || user.teamName || '-'}</td>
                    <td>{user.email}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                    <td>
                      <span className={user.passwordChanged ? 'status-yes' : 'status-no'}>
                        {user.passwordChanged ? '✅' : '❌'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
