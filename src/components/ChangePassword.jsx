import React, { useState } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './ChangePassword.css';

function ChangePassword({ currentUser, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setLoading(true);

    try {
      // 재인증
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Firebase Auth 비밀번호 변경
      await updatePassword(auth.currentUser, newPassword);
      
      // Firestore에 비밀번호 변경 완료 플래그 저장
      await updateDoc(doc(db, 'users', currentUser.uid), {
        passwordChanged: true,
        passwordChangedAt: new Date().toISOString()
      });

      onPasswordChanged();
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('현재 비밀번호가 올바르지 않습니다.');
      } else {
        setError('비밀번호 변경 실패: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="change-password-header">
          <h2>🔒 비밀번호 변경 필수</h2>
          <p>보안을 위해 초기 비밀번호를 변경해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 사용 중인 비밀번호"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="최소 6자 이상"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 재입력"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
