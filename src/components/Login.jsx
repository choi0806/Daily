import React, { useState } from 'react';
import { loginUser } from '../firebase/auth';
import './Login.css';

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(userId, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Daily Snippet</h1>
          <p>팀 협업 스니펫 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">사용자 ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="1-39"
              required
            />
            <span className="help-text">팀장: 1, 12, 18, 28, 37 | 팀원: 2-11, 13-17, 19-25, 26-27, 29-36, 38-39 </span>
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-info">
          <p>👤 피플파트너팀: 팀장(1), 팀원(2-11, 38)</p>
          <p>👥 HRBP팀: 팀장(12), 팀원(13-17, 26-27)</p>
          <p>🛡️ 안전보건팀: 팀장(18), 팀원(19-25)</p>
          <p>📊 사업관리팀: 팀장(28,37), 팀원(29-36, 39)</p>
          <p>🔑 초기 비밀번호: 123456</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
