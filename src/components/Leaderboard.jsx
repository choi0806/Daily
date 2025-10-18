import React, { useState } from 'react';
import './Leaderboard.css';

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 전체 데이터 (기업/학교 구분 포함)
  const allData = {
    monthly: {
      companies: [
        { rank: 1, team: '삼성 마케팅부서', score: 485, type: 'company' },
        { rank: 2, team: 'LG전자 통신부서', score: 445, type: 'company' },
        { rank: 3, team: '현대자동차 개발팀', score: 398, type: 'company' },
        { rank: 4, team: '네이버 클라우드', score: 367, type: 'company' },
        { rank: 5, team: '카카오 AI연구소', score: 342, type: 'company' },
        { rank: 6, team: 'SK텔레콤 R&D', score: 298, type: 'company' }
      ],
      schools: [
        { rank: 1, team: 'ENTeam', score: 435, type: 'school' },
        { rank: 2, team: '드디라도 뚜루라보고 건너는 양봉', score: 429, type: 'school' },
        { rank: 3, team: '[동.사.유.형]', score: 365, type: 'school' },
        { rank: 4, team: '케틱스코프', score: 364, type: 'school' },
        { rank: 5, team: '코드영고', score: 336, type: 'school' },
        { rank: 6, team: '번쩍', score: 287, type: 'school' },
        { rank: 7, team: 'SAF', score: 233, type: 'school' },
        { rank: 8, team: 'B.U.D', score: 202, type: 'school' },
        { rank: 9, team: 'F4', score: 84, type: 'school' },
        { rank: 10, team: '위브마인드', score: 56, type: 'school' }
      ]
    },
    weekly: {
      companies: [
        { rank: 1, team: '삼성 마케팅부서', score: 95, type: 'company' },
        { rank: 2, team: 'LG전자 통신부서', score: 89, type: 'company' },
        { rank: 3, team: '카카오 AI연구소', score: 82, type: 'company' },
        { rank: 4, team: '현대자동차 개발팀', score: 78, type: 'company' },
        { rank: 5, team: '네이버 클라우드', score: 71, type: 'company' },
        { rank: 6, team: 'SK텔레콤 R&D', score: 64, type: 'company' }
      ],
      schools: [
        { rank: 1, team: 'ENTeam', score: 87, type: 'school' },
        { rank: 2, team: '드디라도 뚜루라보고 건너는 양봉', score: 85, type: 'school' },
        { rank: 3, team: '[동.사.유.형]', score: 84, type: 'school' },
        { rank: 4, team: '케틱스코프', score: 80, type: 'school' },
        { rank: 5, team: '번쩍', score: 61, type: 'school' },
        { rank: 6, team: '코드영고', score: 42, type: 'school' },
        { rank: 7, team: 'SAF', score: 15, type: 'school' }
      ]
    }
  };

  const getDisplayData = () => {
    const timeData = allData[activeTab];
    
    if (categoryFilter === 'company') {
      return timeData.companies;
    } else if (categoryFilter === 'school') {
      return timeData.schools;
    } else {
      // 전체: 기업과 학교 합쳐서 점수순 정렬
      const combined = [...timeData.companies, ...timeData.schools];
      return combined.sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
      }));
    }
  };

  const displayData = getDisplayData();

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">팀 리더보드</h2>
      
      <div className="leaderboard-category-tabs">
        <button 
          className={`category-tab ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          전체
        </button>
        <button 
          className={`category-tab ${categoryFilter === 'company' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('company')}
        >
          등록 기업
        </button>
        <button 
          className={`category-tab ${categoryFilter === 'school' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('school')}
        >
          등록 학교
        </button>
      </div>

      <div className="leaderboard-tabs">
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          일간 순위
        </button>
        <button 
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          주간 순위
        </button>
      </div>

      <div className="leaderboard-list">
        {displayData.map((item, index) => (
          <div key={`${index}-${item.team}`} className="leaderboard-item">
            <span className="rank">{item.rank}</span>
            <div className="team-info">
              <span className="team-name">{item.team}</span>
              <span className={`team-badge ${item.type}`}>
                {item.type === 'company' ? '기업' : '학교'}
              </span>
            </div>
            <span className="score">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
