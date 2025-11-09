import React, { useState } from 'react';
import './AdminSettings.css';

function AdminSettings({ onClose }) {
  const [activeTab, setActiveTab] = useState('scoring');

  // ADM-001: Ï±ÑÏ†ê Í∏∞Ï? ?§Ï†ï
  const [scoringCriteria, setScoringCriteria] = useState({
    what: { weight: 20, description: 'Î¨¥Ïóá???àÎäîÏßÄ Î™ÖÌôï??Í∏∞Ïà†' },
    why: { weight: 25, description: '??Í∑??ºÏùÑ ?àÎäîÏßÄ ?¥Ïú†?Ä Î∞∞Í≤Ω' },
    highlight: { weight: 20, description: '?òÌïú ?? ?±Í≥º' },
    lowlight: { weight: 15, description: '?ÑÏâ¨???? Í∞úÏÑ†?? },
    tomorrow: { weight: 20, description: '?¥Ïùº ????Í≥ÑÌöç' }
  });

  // ADM-002: ?Ä Íµ¨ÏÑ± ?ïÎ≥¥
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'ÍπÄÍ∞úÎ∞ú', role: 'Frontend Developer', email: 'kim@company.com' },
    { id: 2, name: '?¥Îîî?êÏù∏', role: 'UI/UX Designer', email: 'lee@company.com' },
    { id: 3, name: 'Î∞ïÎ∞±?îÎìú', role: 'Backend Developer', email: 'park@company.com' }
  ]);

  const [teamInfo, setTeamInfo] = useState({
    teamName: 'Daily Snippet Team',
    department: 'Í∞úÎ∞ú?Ä'
  });

  // ADM-003: API ??Í¥ÄÎ¶?
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: ''
  });

  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false
  });

  // ADM-004: ?Ä ?ºÌè¨Î®ºÏä§ ?∞Ïù¥??(?òÌîå)
  const [performanceData, setPerformanceData] = useState({
    weekly: {
      avgScore: 78,
      completionRate: 85,
      growthRate: 12
    },
    monthly: {
      avgScore: 75,
      completionRate: 82,
      growthRate: 8
    }
  });



  // ADM-006: Ïª§Ïä§?∞Îßà?¥Ïßï ??™©
  const [customFields, setCustomFields] = useState([
    { id: 1, name: 'What', maxScore: 20, required: true, placeholder: 'Î¨¥Ïóá???àÎÇò??' },
    { id: 2, name: 'Why', maxScore: 25, required: true, placeholder: '???àÎÇò??' },
    { id: 3, name: 'Highlight', maxScore: 20, required: true, placeholder: '?òÌïú ?? },
    { id: 4, name: 'Lowlight', maxScore: 15, required: true, placeholder: '?ÑÏâ¨???? },
    { id: 5, name: 'Tomorrow', maxScore: 20, required: true, placeholder: '?¥Ïùº ???? }
  ]);

  // INT-001: Todo ?∞Îèô ?§Ï†ï
  const [todoIntegrations, setTodoIntegrations] = useState({
    hanaCalendar: { enabled: false, apiKey: '', syncSettings: '' },
    chaseDaeErp: { enabled: false, apiKey: '', companyId: '' },
    externalSystem: { enabled: false, apiKey: '', systemId: '' }
  });

  // ORG-001: Í∏∞ÏóÖ ???êÏàò ÎπÑÍµê ?∞Ïù¥??
  const [orgComparison, setOrgComparison] = useState({
    company: '?úÌôîÍ∑∏Î£π',
    departments: [
      { id: 1, name: '?êÎÑàÏßÄ ?¨ÏóÖÎ∂Ä', avgScore: 87, memberCount: 45, growthRate: 10 },
      { id: 2, name: 'ICT ?¨ÏóÖÎ∂Ä', avgScore: 85, memberCount: 38, growthRate: 8 },
      { id: 3, name: 'Í±¥ÏÑ§ ?¨ÏóÖÎ∂Ä', avgScore: 82, memberCount: 52, growthRate: 6 },
      { id: 4, name: 'Q&D ?¨ÏóÖÎ∂Ä', avgScore: 88, memberCount: 35, growthRate: 12 },
      { id: 5, name: 'Í∏àÏúµ ?¨ÏóÖÎ∂Ä', avgScore: 84, memberCount: 42, growthRate: 7 }
    ]
  });

  // ORG-002: Ï°∞ÏßÅ ?®ÏúÑÎ≥??úÏúÑ
  const [orgRankings, setOrgRankings] = useState({
    type: 'company', // 'company', 'school', 'department'
    rankings: [
      { rank: 1, name: '?úÌôî?∏Î???, avgScore: 92, memberCount: 58, completionRate: 96 },
      { rank: 2, name: '?úÌôîÎπÑÏ†Ñ', avgScore: 90, memberCount: 45, completionRate: 95 },
      { rank: 3, name: '?úÌôî?åÏõå?úÏä§??, avgScore: 89, memberCount: 62, completionRate: 94 },
      { rank: 4, name: '?úÌôî?êÏñ¥Î°úÏä§?òÏù¥??, avgScore: 88, memberCount: 78, completionRate: 93 },
      { rank: 5, name: 'ÎπÑÏ†Ñ?•Ïä§??, avgScore: 87, memberCount: 42, completionRate: 92 },
      { rank: 6, name: '?ºÏÑ±?ÑÏûê', avgScore: 84, memberCount: 180, completionRate: 90 },
      { rank: 7, name: 'SK?òÏù¥?âÏä§', avgScore: 83, memberCount: 165, completionRate: 88 },
      { rank: 8, name: 'LG?îÌïô', avgScore: 81, memberCount: 155, completionRate: 86 },
      { rank: 9, name: '?ÑÎ??êÎèôÏ∞?, avgScore: 80, memberCount: 220, completionRate: 85 },
      { rank: 10, name: '?¨Ïä§ÏΩ?, avgScore: 79, memberCount: 142, completionRate: 84 }
    ]
  });

  // ORG-003: Ï£ºÍ∞Ñ Î¶¨Ìè¨???§Ï†ï
  const [reportSettings, setReportSettings] = useState({
    enabled: true,
    frequency: 'weekly', // 'daily', 'weekly', 'monthly'
    sendDay: 'monday', // ?îÏùº
    sendTime: '09:00',
    recipients: [
      { id: 1, email: 'team@company.com', type: 'team' },
      { id: 2, email: 'manager@company.com', type: 'manager' }
    ],
    includeCharts: true,
    includeComments: true,
    includeComparison: true
  });

  // Ï±ÑÏ†ê Í∏∞Ï? Í∞ÄÏ§ëÏπò Î≥ÄÍ≤?
  const handleWeightChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setScoringCriteria(prev => ({
      ...prev,
      [field]: { ...prev[field], weight: Math.min(100, Math.max(0, numValue)) }
    }));
  };

  // Ï¥?Í∞ÄÏ§ëÏπò Í≥ÑÏÇ∞
  const getTotalWeight = () => {
    return Object.values(scoringCriteria).reduce((sum, item) => sum + item.weight, 0);
  };

  // ?Ä??Ï∂îÍ?
  const handleAddMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      email: ''
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  // ?Ä???ïÎ≥¥ ?òÏ†ï
  const handleMemberChange = (id, field, value) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  // ?Ä????†ú
  const handleDeleteMember = (id) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  // API ???Ä??
  const handleSaveApiKey = (provider) => {
    alert(`${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API ?§Í? ?Ä?•Îêò?àÏäµ?àÎã§.`);
  };

  // ?§Ï†ï ?Ä??
  const handleSaveSettings = () => {
    const totalWeight = getTotalWeight();
    if (totalWeight !== 100) {
      alert(`Í∞ÄÏ§ëÏπò ?©Í≥ÑÍ∞Ä ${totalWeight}%?ÖÎãà?? 100%Î°?ÎßûÏ∂∞Ï£ºÏÑ∏??`);
      return;
    }
    alert('?§Ï†ï???Ä?•Îêò?àÏäµ?àÎã§!');
  };

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Í¥ÄÎ¶¨Ïûê ?§Ï†ï</h1>
            <p>AI Ï±ÑÏ†ê Í∏∞Ï?, ?Ä Íµ¨ÏÑ±, API ?§Î? Í¥ÄÎ¶¨Ìï©?àÎã§</p>
          </div>
          {onClose && (
            <button className="admin-close-btn" onClick={onClose}>
              ??
            </button>
          )}
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'scoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('scoring')}
        >
          Ï±ÑÏ†ê Í∏∞Ï?
        </button>
        <button
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          ?Ä Íµ¨ÏÑ±
        </button>
        <button
          className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          API ??
        </button>
        <button
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          ?ºÌè¨Î®ºÏä§
        </button>
        <button
          className={`tab-btn ${activeTab === 'customize' ? 'active' : ''}`}
          onClick={() => setActiveTab('customize')}
        >
          ??™© Ïª§Ïä§?∞Îßà?¥Ïßï
        </button>
        <button
          className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          ?∞Îèô ?§Ï†ï
        </button>
        <button
          className={`tab-btn ${activeTab === 'orgComparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('orgComparison')}
        >
          Î∂Ä?úÎ≥Ñ ÎπÑÍµê
        </button>
        <button
          className={`tab-btn ${activeTab === 'orgRankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('orgRankings')}
        >
          Ï°∞ÏßÅ ?úÏúÑ
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Ï£ºÍ∞Ñ Î¶¨Ìè¨??
        </button>
      </div>

      <div className="admin-content">
        {/* ADM-001: Ï±ÑÏ†ê Í∏∞Ï? ?§Ï†ï */}
        {activeTab === 'scoring' && (
          <div className="scoring-settings">
            <h2>AI Ï±ÑÏ†ê Í∏∞Ï? ?§Ï†ï</h2>
            <p className="description">Í∞???™©??Í∞ÄÏ§ëÏπòÎ•?Ï°∞Ï†ï?òÏÑ∏??(?©Í≥Ñ: {getTotalWeight()}%)</p>
            
            <div className="total-weight-indicator">
              <div className="weight-bar">
                <div 
                  className="weight-fill" 
                  style={{ 
                    width: `${getTotalWeight()}%`,
                    backgroundColor: getTotalWeight() === 100 ? '#10b981' : '#f59e0b'
                  }}
                />
              </div>
              <span className={getTotalWeight() === 100 ? 'valid' : 'invalid'}>
                {getTotalWeight()}%
              </span>
            </div>

            <div className="criteria-list">
              {Object.entries(scoringCriteria).map(([key, value]) => (
                <div key={key} className="criteria-item">
                  <div className="criteria-header">
                    <h3>{key.toUpperCase()}</h3>
                    <div className="weight-input">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={value.weight}
                        onChange={(e) => handleWeightChange(key, e.target.value)}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <p className="criteria-desc">{value.description}</p>
                  <div className="criteria-bar">
                    <div 
                      className="criteria-fill" 
                      style={{ width: `${value.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="save-btn" onClick={handleSaveSettings}>
              ?íæ ?§Ï†ï ?Ä??
            </button>
          </div>
        )}

        {/* ADM-002: ?Ä Íµ¨ÏÑ± Í¥ÄÎ¶?*/}
        {activeTab === 'team' && (
          <div className="team-settings">
            <h2>?Ä Íµ¨ÏÑ± Í¥ÄÎ¶?/h2>
            
            <div className="team-info-section">
              <h3>?Ä ?ïÎ≥¥</h3>
              <div className="team-info-inputs">
                <div className="input-group">
                  <label>?ÄÎ™?/label>
                  <input
                    type="text"
                    value={teamInfo.teamName}
                    onChange={(e) => setTeamInfo(prev => ({ ...prev, teamName: e.target.value }))}
                    placeholder="?Ä ?¥Î¶Ñ"
                  />
                </div>
                <div className="input-group">
                  <label>Î∂Ä??/label>
                  <input
                    type="text"
                    value={teamInfo.department}
                    onChange={(e) => setTeamInfo(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="?åÏÜç Î∂Ä??
                  />
                </div>
              </div>
            </div>

            <div className="team-members-section">
              <div className="section-header">
                <h3>?Ä??Í¥ÄÎ¶?({teamMembers.length}Î™?</h3>
                <button className="add-member-btn" onClick={handleAddMember}>
                  ???Ä??Ï∂îÍ?
                </button>
              </div>

              <div className="members-list">
                {teamMembers.map(member => (
                  <div key={member.id} className="member-card">
                    <div className="member-inputs">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                        placeholder="?¥Î¶Ñ"
                        className="name-input"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => handleMemberChange(member.id, 'role', e.target.value)}
                        placeholder="??ï†"
                        className="role-input"
                      />
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                        placeholder="?¥Î©î??
                        className="email-input"
                      />
                    </div>
                    <button
                      className="delete-member-btn"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      ?óëÔ∏?
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveSettings}>
              ?íæ ?Ä ?ïÎ≥¥ ?Ä??
            </button>
          </div>
        )}

        {/* ADM-003: API ??Í¥ÄÎ¶?*/}
        {activeTab === 'api' && (
          <div className="api-settings">
            <h2>API ??Í¥ÄÎ¶?/h2>
            <p className="description">AI Ï±ÑÏ†ê???¨Ïö©??API ?§Î? ?±Î°ù?òÏÑ∏??/p>

            <div className="api-key-section">
              <div className="api-provider">
                <div className="provider-header">
                  <div className="provider-info">
                    <h3>?§ñ Google Gemini API</h3>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      API ??Î∞úÍ∏âÎ∞õÍ∏∞ ??
                    </a>
                  </div>
                </div>
                <div className="api-input-group">
                  <input
                    type={showApiKeys.gemini ? 'text' : 'password'}
                    value={apiKeys.gemini}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                    placeholder="Gemini API ?§Î? ?ÖÎ†•?òÏÑ∏??
                    className="api-key-input"
                  />
                  <button
                    className="toggle-visibility-btn"
                    onClick={() => setShowApiKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                  >
                    {showApiKeys.gemini ? '?ôà' : '?ëÅÔ∏?}
                  </button>
                  <button
                    className="save-api-btn"
                    onClick={() => handleSaveApiKey('gemini')}
                    disabled={!apiKeys.gemini}
                  >
                    ?Ä??
                  </button>
                </div>
              </div>

              <div className="api-provider">
                <div className="provider-header">
                  <div className="provider-info">
                    <h3>?ß† OpenAI API</h3>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      API ??Î∞úÍ∏âÎ∞õÍ∏∞ ??
                    </a>
                  </div>
                </div>
                <div className="api-input-group">
                  <input
                    type={showApiKeys.openai ? 'text' : 'password'}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="OpenAI API ?§Î? ?ÖÎ†•?òÏÑ∏??
                    className="api-key-input"
                  />
                  <button
                    className="toggle-visibility-btn"
                    onClick={() => setShowApiKeys(prev => ({ ...prev, openai: !prev.openai }))}
                  >
                    {showApiKeys.openai ? '?ôà' : '?ëÅÔ∏?}
                  </button>
                  <button
                    className="save-api-btn"
                    onClick={() => handleSaveApiKey('openai')}
                    disabled={!apiKeys.openai}
                  >
                    ?Ä??
                  </button>
                </div>
              </div>
            </div>

            <div className="api-status">
              <h3>?∞Í≤∞ ?ÅÌÉú</h3>
              <div className="status-list">
                <div className="status-item">
                  <span className={`status-indicator ${apiKeys.gemini ? 'active' : 'inactive'}`} />
                  <span>Gemini API</span>
                  <span className="status-text">
                    {apiKeys.gemini ? '???∞Í≤∞?? : '‚≠?ÎØ∏Ïó∞Í≤?}
                  </span>
                </div>
                <div className="status-item">
                  <span className={`status-indicator ${apiKeys.openai ? 'active' : 'inactive'}`} />
                  <span>OpenAI API</span>
                  <span className="status-text">
                    {apiKeys.openai ? '???∞Í≤∞?? : '‚≠?ÎØ∏Ïó∞Í≤?}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADM-004: ?Ä ?ºÌè¨Î®ºÏä§ ?Ä?úÎ≥¥??*/}
        {activeTab === 'performance' && (
          <div className="performance-dashboard">
            <h2>?Ä ?ºÌè¨Î®ºÏä§ ?Ä?úÎ≥¥??/h2>
            <p className="description">?Ä??Ï£ºÍ∞Ñ/?îÍ∞Ñ ?±Í≥ºÎ•??ïÏù∏?òÏÑ∏??/p>

            <div className="performance-cards">
              <div className="perf-card">
                <div className="perf-icon">?ìä</div>
                <div className="perf-content">
                  <h3>Ï£ºÍ∞Ñ ?âÍ∑† ?êÏàò</h3>
                  <div className="perf-value">{performanceData.weekly.avgScore}??/div>
                  <div className="perf-change positive">+5??/div>
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-icon">?çÔ∏è</div>
                <div className="perf-content">
                  <h3>Ï£ºÍ∞Ñ ?ëÏÑ±Î•?/h3>
                  <div className="perf-value">{performanceData.weekly.completionRate}%</div>
                  <div className="perf-change positive">+3%</div>
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-icon">?ìà</div>
                <div className="perf-content">
                  <h3>Ï£ºÍ∞Ñ ?±Ïû•Î•?/h3>
                  <div className="perf-value">+{performanceData.weekly.growthRate}%</div>
                  <div className="perf-change positive">?•ÏÉÅ Ï§?/div>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>?îÍ∞Ñ ?∏Î†å??/h3>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="chart-bar" style={{ height: '60%' }}>
                    <span className="bar-label">1Ï£ºÏ∞®</span>
                    <span className="bar-value">72??/span>
                  </div>
                  <div className="chart-bar" style={{ height: '70%' }}>
                    <span className="bar-label">2Ï£ºÏ∞®</span>
                    <span className="bar-value">75??/span>
                  </div>
                  <div className="chart-bar" style={{ height: '85%' }}>
                    <span className="bar-label">3Ï£ºÏ∞®</span>
                    <span className="bar-value">78??/span>
                  </div>
                  <div className="chart-bar active" style={{ height: '95%' }}>
                    <span className="bar-label">4Ï£ºÏ∞®</span>
                    <span className="bar-value">82??/span>
                  </div>
                </div>
              </div>
            </div>

            <div className="team-rankings">
              <h3>Ï°∞ÏßÅ ?úÏúÑ</h3>
              <div className="ranking-list">
                {orgRankings.rankings.map((company, index) => (
                  <div key={index} className="ranking-item">
                    <span className="rank-badge">{company.rank}</span>
                    <span className="member-name">{company.name}</span>
                    <span className="member-score">{company.avgScore}??/span>
                    <span className="member-rate">{company.completionRate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ADM-006: ?§Îãà????™© Ïª§Ïä§?∞Îßà?¥Ïßï */}
        {activeTab === 'customize' && (
          <div className="customize-fields">
            <h2>?§Îãà????™© Ïª§Ïä§?∞Îßà?¥Ïßï</h2>
            <p className="description">?§Îãà???ëÏÑ± ??™©Í≥??êÏàò Í∏∞Ï????êÏú†Î°?≤å ?òÏ†ï?òÏÑ∏??/p>

            <button className="add-field-btn" onClick={() => {
              const newField = {
                id: Date.now(),
                name: '',
                maxScore: 10,
                required: false,
                placeholder: ''
              };
              setCustomFields([...customFields, newField]);
            }}>
              ????™© Ï∂îÍ?
            </button>

            <div className="custom-fields-list">
              {customFields.map((field, index) => (
                <div key={field.id} className="custom-field-item">
                  <div className="field-order">{index + 1}</div>
                  <div className="field-inputs">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => {
                        setCustomFields(prev => prev.map(f =>
                          f.id === field.id ? { ...f, name: e.target.value } : f
                        ));
                      }}
                      placeholder="??™©Î™?(?? What, Why)"
                      className="field-name-input"
                    />
                    <input
                      type="number"
                      value={field.maxScore}
                      onChange={(e) => {
                        setCustomFields(prev => prev.map(f =>
                          f.id === field.id ? { ...f, maxScore: parseInt(e.target.value) || 0 } : f
                        ));
                      }}
                      className="field-score-input"
                    />
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => {
                        setCustomFields(prev => prev.map(f =>
                          f.id === field.id ? { ...f, placeholder: e.target.value } : f
                        ));
                      }}
                      placeholder="?àÎÇ¥ Î¨∏Íµ¨ (?? Î¨¥Ïóá???àÎÇò??)"
                      className="field-placeholder-input"
                    />
                    <label className="field-required">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          setCustomFields(prev => prev.map(f =>
                            f.id === field.id ? { ...f, required: e.target.checked } : f
                          ));
                        }}
                      />
                      ?ÑÏàò
                    </label>
                    <button
                      className="delete-field-btn"
                      onClick={() => setCustomFields(prev => prev.filter(f => f.id !== field.id))}
                    >
                      ?óëÔ∏?
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-score-info">
              <h3>Ï¥?Î∞∞Ï†ê</h3>
              <div className="total-score-value">
                {customFields.reduce((sum, field) => sum + field.maxScore, 0)}??
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveSettings}>
              ?íæ ??™© ?§Ï†ï ?Ä??
            </button>
          </div>
        )}

        {/* INT-001: Todo ?∞Îèô ?§Ï†ï */}
        {activeTab === 'integrations' && (
          <div className="integrations-settings">
            <h2>?úÌôî Í∑∏Î£π ?úÏä§???∞Îèô</h2>
            <p className="description">?úÌôî Í∑∏Î£π??Ï∫òÎ¶∞??Î∞?ERP ?úÏä§?úÍ≥º ?∞Îèô?òÏó¨ ?ºÏ†ï Î∞??ÖÎ¨¥Î•??êÎèô?ºÎ°ú ?ôÍ∏∞?îÌï©?àÎã§</p>

            <div className="integration-cards">
              {/* ?úÌôî Ï∫òÎ¶∞???∞Îèô */}
              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-icon">?ìÖ</div>
                  <div className="integration-info">
                    <h3>?úÌôî Ï∫òÎ¶∞??/h3>
                    <p>?úÌôî Í∑∏Î£π ?ÑÏÇ¨ Ï∫òÎ¶∞??Î∞??¥Ïùº ?ôÍ∏∞??/p>
                  </div>
                  <label className="integration-toggle">
                    <input
                      type="checkbox"
                      checked={todoIntegrations.hanaCalendar.enabled}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        hanaCalendar: { ...prev.hanaCalendar, enabled: e.target.checked }
                      }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {todoIntegrations.hanaCalendar.enabled && (
                  <div className="integration-config">
                    <input
                      type="password"
                      placeholder="?úÌôî Ï∫òÎ¶∞??API Key"
                      value={todoIntegrations.hanaCalendar.apiKey}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        hanaCalendar: { ...prev.hanaCalendar, apiKey: e.target.value }
                      }))}
                    />
                    <input
                      type="text"
                      placeholder="?ôÍ∏∞???§Ï†ï"
                      value={todoIntegrations.hanaCalendar.syncSettings}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        hanaCalendar: { ...prev.hanaCalendar, syncSettings: e.target.value }
                      }))}
                    />
                    <button className="test-connection-btn">?∞Í≤∞ ?åÏä§??/button>
                  </div>
                )}
              </div>

              {/* Ï∞®ÏÑ∏??ERP ?∞Îèô */}
              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-icon">?è¢</div>
                  <div className="integration-info">
                    <h3>Ï∞®ÏÑ∏?Ä ERP ?úÏä§??/h3>
                    <p>?úÌôî Í∑∏Î£π ERP ?úÏä§?úÍ≥º ?ÖÎ¨¥ ?∞Ïù¥???ôÍ∏∞??/p>
                  </div>
                  <label className="integration-toggle">
                    <input
                      type="checkbox"
                      checked={todoIntegrations.chaseDaeErp.enabled}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        chaseDaeErp: { ...prev.chaseDaeErp, enabled: e.target.checked }
                      }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {todoIntegrations.chaseDaeErp.enabled && (
                  <div className="integration-config">
                    <input
                      type="password"
                      placeholder="ERP API Key"
                      value={todoIntegrations.chaseDaeErp.apiKey}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        chaseDaeErp: { ...prev.chaseDaeErp, apiKey: e.target.value }
                      }))}
                    />
                    <input
                      type="text"
                      placeholder="?åÏÇ¨ ID"
                      value={todoIntegrations.chaseDaeErp.companyId}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        chaseDaeErp: { ...prev.chaseDaeErp, companyId: e.target.value }
                      }))}
                    />
                    <button className="test-connection-btn">?∞Í≤∞ ?åÏä§??/button>
                  </div>
                )}
              </div>

              {/* Í∏∞Ì? ?úÏä§???∞Îèô */}
              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-icon">?ôÔ∏è</div>
                  <div className="integration-info">
                    <h3>Í∏∞Ì? ?úÏä§??/h3>
                    <p>?úÌôî Í∑∏Î£π??Ï∂îÍ? ?úÏä§???∞Îèô</p>
                  </div>
                  <label className="integration-toggle">
                    <input
                      type="checkbox"
                      checked={todoIntegrations.externalSystem.enabled}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        externalSystem: { ...prev.externalSystem, enabled: e.target.checked }
                      }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {todoIntegrations.externalSystem.enabled && (
                  <div className="integration-config">
                    <input
                      type="password"
                      placeholder="?úÏä§??API Key"
                      value={todoIntegrations.externalSystem.apiKey}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        externalSystem: { ...prev.externalSystem, apiKey: e.target.value }
                      }))}
                    />
                    <input
                      type="text"
                      placeholder="?úÏä§??ID"
                      value={todoIntegrations.externalSystem.systemId}
                      onChange={(e) => setTodoIntegrations(prev => ({
                        ...prev,
                        externalSystem: { ...prev.externalSystem, systemId: e.target.value }
                      }))}
                    />
                    <button className="test-connection-btn">?∞Í≤∞ ?åÏä§??/button>
                  </div>
                )}
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveSettings}>
              ?íæ ?∞Îèô ?§Ï†ï ?Ä??
            </button>
          </div>
        )}

        {/* ORG-001: Í∏∞ÏóÖ ???êÏàò ÎπÑÍµê */}
        {activeTab === 'orgComparison' && (
          <div className="org-comparison-settings">
            <h2>?úÌôî Í∑∏Î£π ?¨ÏóÖÎ∂ÄÎ≥??±Í≥º ÎπÑÍµê</h2>
            <p className="description">?úÌôî Í∑∏Î£π ???¨ÏóÖÎ∂ÄÎ≥??âÍ∑† ?êÏàòÎ•?ÎπÑÍµê?òÍ≥† Î∂ÑÏÑù?©Îãà??/p>

            <div className="company-info-card">
              <div className="company-header">
                <span className="company-icon">?è¢</span>
                <h3>{orgComparison.company}</h3>
              </div>
              <div className="company-stats">
                <div className="stat-item">
                  <span className="stat-label">?ÑÏ≤¥ Î∂Ä??/span>
                  <span className="stat-value">{orgComparison.departments.length}Í∞?/span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">?ÑÏ≤¥ ?∏Ïõê</span>
                  <span className="stat-value">
                    {orgComparison.departments.reduce((sum, dept) => sum + dept.memberCount, 0)}Î™?
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">?âÍ∑† ?êÏàò</span>
                  <span className="stat-value">
                    {Math.round(orgComparison.departments.reduce((sum, dept) => sum + dept.avgScore, 0) / orgComparison.departments.length)}??
                  </span>
                </div>
              </div>
            </div>

            <div className="departments-comparison">
              <h3>?¨ÏóÖÎ∂ÄÎ≥??±Í≥º ÎπÑÍµê</h3>
              <div className="comparison-table">
                <div className="table-header">
                  <div className="col-rank">?úÏúÑ</div>
                  <div className="col-dept">?¨ÏóÖÎ∂ÄÎ™?/div>
                  <div className="col-score">?âÍ∑† ?êÏàò</div>
                  <div className="col-members">?∏Ïõê</div>
                  <div className="col-growth">?±Ïû•Î•?/div>
                </div>
                {[...orgComparison.departments]
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .map((dept, index) => (
                    <div key={dept.id} className={`table-row ${index === 0 ? 'top-rank' : ''}`}>
                      <div className="col-rank">
                        {index === 0 && '?•á'}
                        {index === 1 && '?•à'}
                        {index === 2 && '?•â'}
                        {index > 2 && `${index + 1}??}
                      </div>
                      <div className="col-dept">{dept.name}</div>
                      <div className="col-score">
                        <div className="score-bar-container">
                          <div className="score-bar" style={{ width: `${dept.avgScore}%` }}></div>
                          <span className="score-text">{dept.avgScore}??/span>
                        </div>
                      </div>
                      <div className="col-members">{dept.memberCount}Î™?/div>
                      <div className="col-growth">
                        <span className={`growth-badge ${dept.growthRate >= 0 ? 'positive' : 'negative'}`}>
                          {dept.growthRate >= 0 ? '?? : '??} {Math.abs(dept.growthRate)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="comparison-chart-section">
              <h3>?¨ÏóÖÎ∂ÄÎ≥??±Í≥º ?úÍ∞Å??/h3>
              <div className="chart-container">
                {orgComparison.departments.map(dept => (
                  <div key={dept.id} className="chart-bar-item">
                    <div className="chart-label">{dept.name}</div>
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-fill" 
                        style={{ width: `${(dept.avgScore / 100) * 100}%` }}
                      >
                        <span className="chart-value">{dept.avgScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORG-002: Í∏∞ÏóÖ/?ôÍµê/Î∂Ä?úÎ≥Ñ ?úÏúÑ */}
        {activeTab === 'orgRankings' && (
          <div className="org-rankings-settings">
            <h2>Ï°∞ÏßÅ ?®ÏúÑÎ≥??úÏúÑ</h2>
            <p className="description">Í∏∞ÏóÖ, ?ôÍµê, Î∂Ä???®ÏúÑ???ÑÏ≤¥ ?úÏúÑ?Ä Î¶¨Ìè¨??/p>

            <div className="ranking-type-selector">
              <button 
                className={`type-btn ${orgRankings.type === 'company' ? 'active' : ''}`}
                onClick={() => setOrgRankings(prev => ({ ...prev, type: 'company' }))}
              >
                ?è¢ Í∏∞ÏóÖÎ≥?
              </button>
              <button 
                className={`type-btn ${orgRankings.type === 'school' ? 'active' : ''}`}
                onClick={() => setOrgRankings(prev => ({ ...prev, type: 'school' }))}
              >
                ?éì ?ôÍµêÎ≥?
              </button>
              <button 
                className={`type-btn ${orgRankings.type === 'department' ? 'active' : ''}`}
                onClick={() => setOrgRankings(prev => ({ ...prev, type: 'department' }))}
              >
                ?ìÅ Î∂Ä?úÎ≥Ñ
              </button>
            </div>

            <div className="rankings-podium">
              {orgRankings.rankings.slice(0, 3).map((org, index) => (
                <div key={org.rank} className={`podium-item rank-${index + 1}`}>
                  <div className="podium-medal">
                    {index === 0 && '?•á'}
                    {index === 1 && '?•à'}
                    {index === 2 && '?•â'}
                  </div>
                  <div className="podium-info">
                    <div className="podium-rank">#{org.rank}</div>
                    <div className="podium-name">{org.name}</div>
                    <div className="podium-score">{org.avgScore}??/div>
                    <div className="podium-details">
                      <span>?ë• {org.memberCount}Î™?/span>
                      <span>??{org.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rankings-list">
              <h3>?ÑÏ≤¥ ?úÏúÑ</h3>
              {orgRankings.rankings.map((org) => (
                <div key={org.rank} className={`ranking-item ${org.rank <= 3 ? 'top-three' : ''}`}>
                  <div className="ranking-position">
                    <span className="rank-number">#{org.rank}</span>
                  </div>
                  <div className="ranking-content">
                    <div className="ranking-main">
                      <h4>{org.name}</h4>
                      <div className="ranking-metrics">
                        <span className="metric">
                          <span className="metric-icon">‚≠?/span>
                          <span className="metric-value">{org.avgScore}??/span>
                        </span>
                        <span className="metric">
                          <span className="metric-icon">?ë•</span>
                          <span className="metric-value">{org.memberCount}Î™?/span>
                        </span>
                        <span className="metric">
                          <span className="metric-icon">??/span>
                          <span className="metric-value">{org.completionRate}%</span>
                        </span>
                      </div>
                    </div>
                    <div className="ranking-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${org.avgScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ranking-export">
              <button className="export-btn">
                ?ìä Î¶¨Ìè¨???§Ïö¥Î°úÎìú (PDF)
              </button>
              <button className="export-btn">
                ?ìà ?ëÏ? ?¥Î≥¥?¥Í∏∞
              </button>
            </div>
          </div>
        )}

        {/* ORG-003: Ï£ºÍ∞Ñ Î¶¨Ìè¨??Í∏∞Îä• */}
        {activeTab === 'reports' && (
          <div className="reports-settings">
            <h2>Ï£ºÍ∞Ñ Î¶¨Ìè¨???êÎèô Î∞úÏÜ°</h2>
            <p className="description">Í∞úÏù∏ Î∞??Ä Î¶¨Ìè¨?∏Î? ?êÎèô?ºÎ°ú ?ùÏÑ±?òÍ≥† ?¥Î©î?ºÎ°ú Î∞úÏÜ°?©Îãà??/p>

            <div className="report-toggle-card">
              <div className="toggle-header">
                <div>
                  <h3>Î¶¨Ìè¨???êÎèô Î∞úÏÜ°</h3>
                  <p>?ïÍ∏∞?ÅÏúºÎ°??±Í≥º Î¶¨Ìè¨?∏Î? ?¥Î©î?ºÎ°ú ?ÑÏÜ°?©Îãà??/p>
                </div>
                <label className="report-main-toggle">
                  <input
                    type="checkbox"
                    checked={reportSettings.enabled}
                    onChange={(e) => setReportSettings(prev => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {reportSettings.enabled && (
              <>
                <div className="report-schedule-section">
                  <h3>Î∞úÏÜ° ?§Ï?Ï§?/h3>
                  <div className="schedule-options">
                    <div className="option-group">
                      <label>Î∞úÏÜ° Ï£ºÍ∏∞</label>
                      <select
                        value={reportSettings.frequency}
                        onChange={(e) => setReportSettings(prev => ({
                          ...prev,
                          frequency: e.target.value
                        }))}
                      >
                        <option value="daily">Îß§Ïùº</option>
                        <option value="weekly">Îß§Ï£º</option>
                        <option value="monthly">Îß§Ïõî</option>
                      </select>
                    </div>

                    {reportSettings.frequency === 'weekly' && (
                      <div className="option-group">
                        <label>Î∞úÏÜ° ?îÏùº</label>
                        <select
                          value={reportSettings.sendDay}
                          onChange={(e) => setReportSettings(prev => ({
                            ...prev,
                            sendDay: e.target.value
                          }))}
                        >
                          <option value="monday">?îÏöî??/option>
                          <option value="tuesday">?îÏöî??/option>
                          <option value="wednesday">?òÏöî??/option>
                          <option value="thursday">Î™©Ïöî??/option>
                          <option value="friday">Í∏àÏöî??/option>
                        </select>
                      </div>
                    )}

                    <div className="option-group">
                      <label>Î∞úÏÜ° ?úÍ∞Ñ</label>
                      <input
                        type="time"
                        value={reportSettings.sendTime}
                        onChange={(e) => setReportSettings(prev => ({
                          ...prev,
                          sendTime: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="report-content-section">
                  <h3>Î¶¨Ìè¨???¥Ïö© ?§Ï†ï</h3>
                  <div className="content-options">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={reportSettings.includeCharts}
                        onChange={(e) => setReportSettings(prev => ({
                          ...prev,
                          includeCharts: e.target.checked
                        }))}
                      />
                      <span>?ìä ?±Í≥º Ï∞®Ìä∏ ?¨Ìï®</span>
                    </label>
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={reportSettings.includeComments}
                        onChange={(e) => setReportSettings(prev => ({
                          ...prev,
                          includeComments: e.target.checked
                        }))}
                      />
                      <span>?í¨ AI ÏΩîÎ©ò???¨Ìï®</span>
                    </label>
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={reportSettings.includeComparison}
                        onChange={(e) => setReportSettings(prev => ({
                          ...prev,
                          includeComparison: e.target.checked
                        }))}
                      />
                      <span>?ìà ?Ä ÎπÑÍµê Î∂ÑÏÑù ?¨Ìï®</span>
                    </label>
                  </div>
                </div>

                <div className="report-recipients-section">
                  <h3>?òÏã†??Í¥ÄÎ¶?/h3>
                  <div className="recipients-list">
                    {reportSettings.recipients.map((recipient) => (
                      <div key={recipient.id} className="recipient-item">
                        <span className="recipient-icon">
                          {recipient.type === 'team' ? '?ë•' : '?ë§'}
                        </span>
                        <div className="recipient-info">
                          <span className="recipient-email">{recipient.email}</span>
                          <span className="recipient-type">
                            {recipient.type === 'team' ? '?Ä ?ÑÏ≤¥' : 'Í¥ÄÎ¶¨Ïûê'}
                          </span>
                        </div>
                        <button className="remove-recipient-btn">??/button>
                      </div>
                    ))}
                  </div>
                  <button className="add-recipient-btn">+ ?òÏã†??Ï∂îÍ?</button>
                </div>

                <div className="report-preview-section">
                  <h3>Î¶¨Ìè¨??ÎØ∏Î¶¨Î≥¥Í∏∞</h3>
                  <div className="preview-card">
                    <div className="preview-header">
                      <h4>?ìä Ï£ºÍ∞Ñ ?±Í≥º Î¶¨Ìè¨??/h4>
                      <span className="preview-date">2025??10??14??- 10??18??/span>
                    </div>
                    <div className="preview-body">
                      <div className="preview-section">
                        <h5>Í∞úÏù∏ ?±Í≥º</h5>
                        <div className="preview-stats">
                          <div className="preview-stat">
                            <span className="stat-label">?âÍ∑† ?êÏàò</span>
                            <span className="stat-value">82??/span>
                          </div>
                          <div className="preview-stat">
                            <span className="stat-label">?ëÏÑ±Î•?/span>
                            <span className="stat-value">100%</span>
                          </div>
                          <div className="preview-stat">
                            <span className="stat-label">Ï£ºÍ∞Ñ ?±Ïû•</span>
                            <span className="stat-value">+8%</span>
                          </div>
                        </div>
                      </div>
                      <div className="preview-section">
                        <h5>?Ä ?úÏúÑ</h5>
                        <p className="preview-text">Í∞úÎ∞ú?Ä ??3??/ 15Î™?Ï§?/p>
                      </div>
                      {reportSettings.includeComments && (
                        <div className="preview-section">
                          <h5>AI ÏΩîÎ©ò??/h5>
                          <p className="preview-comment">
                            "?¥Î≤à Ï£ºÎäî ?πÌûà ?ÑÎ°ú?ùÌä∏ ?ÑÏÑ±?ÑÍ? ?íÏïò?µÎãà?? 
                            Tomorrow Í≥ÑÌöç???§ÌñâÎ•†ÎèÑ ?∞Ïàò?©Îãà??"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="report-actions">
                  <button className="test-send-btn">
                    ?âÔ∏è ?åÏä§??Î∞úÏÜ°
                  </button>
                  <button className="save-btn" onClick={handleSaveSettings}>
                    ?íæ ?§Ï†ï ?Ä??
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
