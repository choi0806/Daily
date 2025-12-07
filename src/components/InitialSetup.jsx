import React, { useState } from 'react';
import { completeInitialSetup } from '../firebase/auth';
import './InitialSetup.css';

function InitialSetup({ currentUser }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('초기 설정 시작:', { uid: currentUser.uid, name, department });
      const result = await completeInitialSetup(currentUser.uid, name, department);
      console.log('초기 설정 결과:', result);
      
      if (!result.success) {
        setError(result.error || '설정을 저장하는 중 오류가 발생했습니다.');
        setLoading(false);
      } else {
        console.log('초기 설정 성공');
        // 성공 시 onAuthChange가 자동으로 업데이트된 사용자 정보를 가져옴
      }
    } catch (error) {
      console.error('초기 설정 오류:', error);
      setError('설정을 저장하는 중 오류가 발생했습니다: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="initial-setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>환영합니다!</h1>
          <p>프로필을 설정해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">부서</label>
            <input
              type="text"
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="부서를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="setup-btn" disabled={loading}>
            {loading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InitialSetup;
