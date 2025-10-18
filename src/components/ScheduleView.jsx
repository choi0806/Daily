import React, { useState } from 'react';
import './ScheduleView.css';

function ScheduleView({ selectedDate, schedules, onClose, onDelete, onEdit, onAdd, teamSchedules = [] }) {
  const [selectedTeammate, setSelectedTeammate] = useState(null);

  // 시간 겹침 체크 함수
  const checkTimeOverlap = (time1, time2) => {
    // 시간 형식: "HH:MM" 또는 "HH:MM-HH:MM"
    const parseTime = (timeStr) => {
      const [start, end] = timeStr.split('-');
      const [startHour, startMin] = start.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      
      if (end) {
        const [endHour, endMin] = end.split(':').map(Number);
        const endMinutes = endHour * 60 + endMin;
        return { start: startMinutes, end: endMinutes };
      }
      // 종료 시간이 없으면 1시간으로 가정
      return { start: startMinutes, end: startMinutes + 60 };
    };

    const t1 = parseTime(time1);
    const t2 = parseTime(time2);

    // 시간대가 겹치는지 확인
    return (t1.start < t2.end && t1.end > t2.start);
  };

  // 팀원별 일정 겹침 확인
  const hasScheduleOverlap = (teammate) => {
    const mySchedulesForDate = schedules.filter(s => s.date === selectedDate);
    const teammateSchedulesForDate = teammate.schedules.filter(s => s.date === selectedDate);

    for (const mySchedule of mySchedulesForDate) {
      for (const teammateSchedule of teammateSchedulesForDate) {
        if (checkTimeOverlap(mySchedule.time, teammateSchedule.time)) {
          return true;
        }
      }
    }
    return false;
  };

  // 겹치는 일정 개수 세기
  const getOverlapCount = (teammate) => {
    const mySchedulesForDate = schedules.filter(s => s.date === selectedDate);
    const teammateSchedulesForDate = teammate.schedules.filter(s => s.date === selectedDate);
    let count = 0;

    for (const mySchedule of mySchedulesForDate) {
      for (const teammateSchedule of teammateSchedulesForDate) {
        if (checkTimeOverlap(mySchedule.time, teammateSchedule.time)) {
          count++;
        }
      }
    }
    return count;
  };

  // 특정 일정과 겹치는 팀원들 찾기
  const getOverlappingTeammates = (schedule) => {
    const overlappingTeammates = [];
    
    teamSchedules.forEach(teammate => {
      const teammateSchedulesForDate = teammate.schedules.filter(s => s.date === selectedDate);
      
      teammateSchedulesForDate.forEach(teammateSchedule => {
        if (checkTimeOverlap(schedule.time, teammateSchedule.time)) {
          // 같은 제목의 일정인지 확인 (같은 일정으로 간주)
          const isSameSchedule = schedule.title.toLowerCase() === teammateSchedule.title.toLowerCase();
          
          if (isSameSchedule && !overlappingTeammates.find(t => t.userId === teammate.userId)) {
            overlappingTeammates.push({
              userId: teammate.userId,
              userName: teammate.userName,
              userRole: teammate.userRole
            });
          }
        }
      });
    });
    
    return overlappingTeammates;
  };

  const sortSchedules = (schedules) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...schedules].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.time.localeCompare(b.time);
    });
  };

  const handleTeammateClick = (teammate) => {
    setSelectedTeammate(teammate);
  };

  const handleMyScheduleClick = () => {
    setSelectedTeammate(null);
  };

  const mySchedule = schedules.filter(s => s.date === selectedDate);
  const teammateSchedules = selectedTeammate
    ? selectedTeammate.schedules.filter(s => s.date === selectedDate)
    : [];

  const displaySchedules = selectedTeammate ? teammateSchedules : mySchedule;
  const displayUser = selectedTeammate ? selectedTeammate : null;

  return (
    <div className="schedule-view-overlay" onClick={onClose}>
      <div className="schedule-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-view-header">
          <h2>{selectedDate} 일정</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="schedule-view-body">
          <div className="schedule-detail-section">
            {displayUser && (
              <div className="schedule-owner-info">
                <h3>{displayUser.userName}님의 일정</h3>
                <span className="owner-role">{displayUser.userRole}</span>
              </div>
            )}

            {!selectedTeammate && (
              <button className="add-schedule-btn" onClick={onAdd}>
                ➕ 일정 추가
              </button>
            )}

            {displaySchedules.length === 0 ? (
              <p className="no-schedule">등록된 일정이 없습니다.</p>
            ) : (
              <div className="schedule-list">
                {sortSchedules(displaySchedules).map((schedule) => (
                  <div key={schedule.id} className={`schedule-item priority-${schedule.priority}`}>
                    <div className="schedule-header">
                      <span className={`schedule-category ${schedule.category}`}>
                        {schedule.category === 'work' && '업무'}
                        {schedule.category === 'meeting' && '회의'}
                        {schedule.category === 'personal' && '개인'}
                        {schedule.category === 'study' && '학습'}
                        {schedule.category === 'event' && '행사'}
                      </span>
                      <span className="schedule-time">{schedule.time}</span>
                    </div>
                    <h3 className="schedule-title">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="schedule-description">{schedule.description}</p>
                    )}
                    
                    {/* 함께하는 팀원 표시 */}
                    {!selectedTeammate && (() => {
                      const overlappingTeammates = getOverlappingTeammates(schedule);
                      if (overlappingTeammates.length > 0) {
                        return (
                          <div className="shared-teammates">
                            <span className="shared-icon">👥</span>
                            <span className="shared-label">함께하는 팀원:</span>
                            <div className="shared-teammates-list">
                              {overlappingTeammates.map((teammate, idx) => (
                                <span key={teammate.userId} className="shared-teammate-tag">
                                  {teammate.userName}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="schedule-footer">
                      <span className={`priority-badge ${schedule.priority}`}>
                        {schedule.priority === 'high' && '높음'}
                        {schedule.priority === 'medium' && '보통'}
                        {schedule.priority === 'low' && '낮음'}
                      </span>
                      {!selectedTeammate && (
                        <div className="schedule-actions">
                          <button
                            className="edit-schedule-button"
                            onClick={() => onEdit(schedule)}
                          >
                            수정
                          </button>
                          <button
                            className="delete-schedule-button"
                            onClick={() => onDelete(schedule.id)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="teammates-section">
            <h3>팀원 일정</h3>
            <div
              className={`teammate-card ${!selectedTeammate ? 'active' : ''}`}
              onClick={handleMyScheduleClick}
            >
              <div className="teammate-name">내 일정</div>
              <div className="teammate-role">나</div>
            </div>
            {teamSchedules.map((teammate) => {
              const hasOverlap = hasScheduleOverlap(teammate);
              const overlapCount = getOverlapCount(teammate);
              
              return (
                <div
                  key={teammate.userId}
                  className={`teammate-card ${selectedTeammate?.userId === teammate.userId ? 'active' : ''} ${hasOverlap ? 'has-overlap' : ''}`}
                  onClick={() => handleTeammateClick(teammate)}
                >
                  <div className="teammate-name">
                    {teammate.userName}
                    {hasOverlap && <span className="overlap-badge">🤝</span>}
                  </div>
                  <div className="teammate-role">{teammate.userRole}</div>
                  {hasOverlap && (
                    <div className="overlap-indicator">
                      <span className="overlap-icon">📅</span>
                      공동 일정 {overlapCount}개
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleView;
