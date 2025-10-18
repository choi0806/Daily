import React from 'react';
import './Header.css';

function Header({ user, onLogin, onLogout, onTemplateClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Daily Snippet</h1>
      </div>
      
      <div className="header-right">
        {user.isLoggedIn ? (
          <>
            <button className="template-btn" onClick={onTemplateClick}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
              </svg>
              템플릿
            </button>
            <div className="user-info">
              <div className="user-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="user-name">{user.name}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={onLogin}>로그인</button>
        )}
      </div>
    </header>
  );
}

export default Header;
