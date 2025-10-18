import React, { useState } from 'react';
import './TemplateEditor.css';

function TemplateEditor({ user, onBack }) {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'What/Why/Highlight 템플릿',
      content: `What
• 

Why
• 

Highlight
• 

Lowlight
• 

Tomorrow
• `,
      isDefault: true,
      design: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        headerColor: '#667eea',
        fontSize: '14px',
        fontFamily: 'Arial',
        borderStyle: 'solid',
        borderColor: '#e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        backgroundPattern: 'none',
        headerStyle: 'bold'
      }
    },
    {
      id: 2,
      name: '프로젝트 진행상황 템플릿',
      content: `[프로젝트 진행상황]
• 

[오늘의 목표 달성도]
• 

[내일 할 일]
• `,
      isDefault: true,
      design: {
        backgroundColor: '#f0f4ff',
        textColor: '#2c3e50',
        headerColor: '#3498db',
        fontSize: '14px',
        fontFamily: 'Arial',
        borderStyle: 'solid',
        borderColor: '#3498db',
        borderRadius: '12px',
        padding: '20px',
        backgroundPattern: 'none',
        headerStyle: 'bold'
      }
    },
    {
      id: 3,
      name: '회고 템플릿',
      content: `[잘한 점]
• 

[아쉬운 점]
• 

[배운 점]
• 

[개선할 점]
• `,
      isDefault: true,
      design: {
        backgroundColor: '#fff5f5',
        textColor: '#2d3748',
        headerColor: '#e53e3e',
        fontSize: '14px',
        fontFamily: 'Arial',
        borderStyle: 'dashed',
        borderColor: '#fc8181',
        borderRadius: '8px',
        padding: '20px',
        backgroundPattern: 'none',
        headerStyle: 'bold'
      }
    }
  ]);

  const defaultDesign = {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    headerColor: '#667eea',
    fontSize: '14px',
    fontFamily: 'Arial',
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundPattern: 'none',
    headerStyle: 'bold'
  };

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState({ 
    name: '', 
    content: '',
    design: { ...defaultDesign }
  });

  const handleCreateNew = () => {
    setEditingTemplate({ 
      name: '새 템플릿', 
      content: '',
      design: { ...defaultDesign }
    });
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleEdit = (template) => {
    if (template.isDefault) {
      alert('기본 템플릿은 수정할 수 없습니다. 복사하여 새로운 템플릿을 만들어주세요.');
      return;
    }
    setEditingTemplate({ ...template });
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleDuplicate = (template) => {
    setEditingTemplate({
      name: `${template.name} (복사본)`,
      content: template.content,
      design: { ...template.design }
    });
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleDelete = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template.isDefault) {
      alert('기본 템플릿은 삭제할 수 없습니다.');
      return;
    }
    if (confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleSave = () => {
    if (!editingTemplate.name.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    if (selectedTemplate) {
      // 수정
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { 
              ...t, 
              name: editingTemplate.name, 
              content: editingTemplate.content,
              design: editingTemplate.design
            }
          : t
      ));
    } else {
      // 새로 생성
      const newTemplate = {
        id: Math.max(...templates.map(t => t.id), 0) + 1,
        name: editingTemplate.name,
        content: editingTemplate.content,
        design: editingTemplate.design,
        isDefault: false
      };
      setTemplates([...templates, newTemplate]);
    }

    setIsEditing(false);
    setEditingTemplate({ 
      name: '', 
      content: '',
      design: { ...defaultDesign }
    });
    setSelectedTemplate(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTemplate({ 
      name: '', 
      content: '',
      design: { ...defaultDesign }
    });
    setSelectedTemplate(null);
  };

  const handleDesignChange = (property, value) => {
    setEditingTemplate({
      ...editingTemplate,
      design: {
        ...editingTemplate.design,
        [property]: value
      }
    });
  };

  const getBackgroundStyle = (design) => {
    const patterns = {
      'dots': 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
      'grid': 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
      'stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
      'waves': 'radial-gradient(ellipse at top, rgba(0,0,0,0.05), transparent)'
    };

    if (design.backgroundPattern !== 'none') {
      return {
        backgroundColor: design.backgroundColor,
        backgroundImage: patterns[design.backgroundPattern],
        backgroundSize: design.backgroundPattern === 'grid' ? '20px 20px' : 'auto'
      };
    }

    return { backgroundColor: design.backgroundColor };
  };

  const stylePresets = [
    {
      name: '클래식',
      icon: '📄',
      design: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        headerColor: '#667eea',
        fontSize: '14px',
        fontFamily: 'Arial',
        borderStyle: 'solid',
        borderColor: '#e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        backgroundPattern: 'none',
        headerStyle: 'bold'
      }
    },
    {
      name: '모던',
      icon: '✨',
      design: {
        backgroundColor: '#1a1a2e',
        textColor: '#eaeaea',
        headerColor: '#16c79a',
        fontSize: '14px',
        fontFamily: 'Verdana',
        borderStyle: 'solid',
        borderColor: '#16c79a',
        borderRadius: '12px',
        padding: '20px',
        backgroundPattern: 'none',
        headerStyle: 'bold'
      }
    },
    {
      name: '파스텔',
      icon: '🌸',
      design: {
        backgroundColor: '#ffeef8',
        textColor: '#5a5a5a',
        headerColor: '#ff6b9d',
        fontSize: '14px',
        fontFamily: 'Georgia',
        borderStyle: 'dashed',
        borderColor: '#ffb3d9',
        borderRadius: '12px',
        padding: '20px',
        backgroundPattern: 'dots',
        headerStyle: 'bold'
      }
    },
    {
      name: '네온',
      icon: '⚡',
      design: {
        backgroundColor: '#0f0f23',
        textColor: '#00ff9f',
        headerColor: '#ff00ff',
        fontSize: '14px',
        fontFamily: "'Courier New'",
        borderStyle: 'solid',
        borderColor: '#00ff9f',
        borderRadius: '4px',
        padding: '20px',
        backgroundPattern: 'grid',
        headerStyle: 'bold'
      }
    },
    {
      name: '자연',
      icon: '🌿',
      design: {
        backgroundColor: '#f0f7f4',
        textColor: '#2d5016',
        headerColor: '#4a7c59',
        fontSize: '14px',
        fontFamily: 'Georgia',
        borderStyle: 'solid',
        borderColor: '#8fbc8f',
        borderRadius: '8px',
        padding: '20px',
        backgroundPattern: 'waves',
        headerStyle: 'bold'
      }
    },
    {
      name: '미니멀',
      icon: '⬜',
      design: {
        backgroundColor: '#fafafa',
        textColor: '#1a1a1a',
        headerColor: '#1a1a1a',
        fontSize: '14px',
        fontFamily: 'Arial',
        borderStyle: 'none',
        borderColor: '#e0e0e0',
        borderRadius: '0px',
        padding: '15px',
        backgroundPattern: 'none',
        headerStyle: 'normal'
      }
    }
  ];

  const applyStylePreset = (preset) => {
    setEditingTemplate({
      ...editingTemplate,
      design: { ...preset.design }
    });
  };

  return (
    <div className="template-editor-container">
      <header className="template-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          돌아가기
        </button>
        <h1>나의 템플릿</h1>
        <div className="user-info">
          <span>{user.name}</span>
        </div>
      </header>

      <div className="template-content">
        {!isEditing ? (
          <>
            <div className="template-actions">
              <button className="create-btn" onClick={handleCreateNew}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                새 템플릿 만들기
              </button>
            </div>

            <div className="templates-grid">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-card-header">
                    <h3>{template.name}</h3>
                    {template.isDefault && (
                      <span className="default-badge">기본</span>
                    )}
                  </div>
                  <div 
                    className="template-card-content"
                    style={{
                      ...getBackgroundStyle(template.design),
                      color: template.design.textColor,
                      fontSize: template.design.fontSize,
                      fontFamily: template.design.fontFamily,
                      borderStyle: template.design.borderStyle,
                      borderColor: template.design.borderColor,
                      borderWidth: '2px',
                      borderRadius: template.design.borderRadius,
                      padding: template.design.padding
                    }}
                  >
                    <pre style={{ 
                      color: template.design.textColor,
                      fontFamily: template.design.fontFamily
                    }}>
                      {template.content}
                    </pre>
                  </div>
                  <div className="template-card-actions">
                    {!template.isDefault && (
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(template)}
                      >
                        수정
                      </button>
                    )}
                    <button 
                      className="duplicate-btn"
                      onClick={() => handleDuplicate(template)}
                    >
                      복사
                    </button>
                    {!template.isDefault && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(template.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="template-editor">
            <div className="editor-form">
              <div className="form-group">
                <label>템플릿 이름</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  })}
                  placeholder="템플릿 이름을 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>템플릿 내용</label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  })}
                  placeholder="템플릿 내용을 입력하세요"
                  rows={12}
                />
              </div>

              {/* 스타일 프리셋 */}
              <div className="preset-section">
                <h3 className="preset-title">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  빠른 스타일 적용
                </h3>
                <div className="presets-grid">
                  {stylePresets.map((preset, index) => (
                    <button
                      key={index}
                      className="preset-btn"
                      onClick={() => applyStylePreset(preset)}
                      title={preset.name}
                    >
                      <span className="preset-icon">{preset.icon}</span>
                      <span className="preset-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 디자인 설정 섹션 */}
              <div className="design-section">
                <h3 className="design-section-title">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                  디자인 꾸미기
                </h3>

                <div className="design-grid">
                  {/* 색상 설정 */}
                  <div className="design-group">
                    <label>배경색</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={editingTemplate.design.backgroundColor}
                        onChange={(e) => handleDesignChange('backgroundColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={editingTemplate.design.backgroundColor}
                        onChange={(e) => handleDesignChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="design-group">
                    <label>텍스트 색상</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={editingTemplate.design.textColor}
                        onChange={(e) => handleDesignChange('textColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={editingTemplate.design.textColor}
                        onChange={(e) => handleDesignChange('textColor', e.target.value)}
                        placeholder="#333333"
                      />
                    </div>
                  </div>

                  <div className="design-group">
                    <label>헤더 색상</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={editingTemplate.design.headerColor}
                        onChange={(e) => handleDesignChange('headerColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={editingTemplate.design.headerColor}
                        onChange={(e) => handleDesignChange('headerColor', e.target.value)}
                        placeholder="#667eea"
                      />
                    </div>
                  </div>

                  <div className="design-group">
                    <label>테두리 색상</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={editingTemplate.design.borderColor}
                        onChange={(e) => handleDesignChange('borderColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={editingTemplate.design.borderColor}
                        onChange={(e) => handleDesignChange('borderColor', e.target.value)}
                        placeholder="#e0e0e0"
                      />
                    </div>
                  </div>

                  {/* 폰트 설정 */}
                  <div className="design-group">
                    <label>폰트 크기</label>
                    <select
                      value={editingTemplate.design.fontSize}
                      onChange={(e) => handleDesignChange('fontSize', e.target.value)}
                    >
                      <option value="12px">작게 (12px)</option>
                      <option value="14px">보통 (14px)</option>
                      <option value="16px">크게 (16px)</option>
                      <option value="18px">매우 크게 (18px)</option>
                    </select>
                  </div>

                  <div className="design-group">
                    <label>폰트</label>
                    <select
                      value={editingTemplate.design.fontFamily}
                      onChange={(e) => handleDesignChange('fontFamily', e.target.value)}
                    >
                      <option value="Arial">Arial</option>
                      <option value="'Courier New'">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="'Times New Roman'">Times New Roman</option>
                      <option value="Verdana">Verdana</option>
                      <option value="'Trebuchet MS'">Trebuchet MS</option>
                      <option value="'Comic Sans MS'">Comic Sans MS</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>

                  {/* 테두리 스타일 */}
                  <div className="design-group">
                    <label>테두리 스타일</label>
                    <select
                      value={editingTemplate.design.borderStyle}
                      onChange={(e) => handleDesignChange('borderStyle', e.target.value)}
                    >
                      <option value="none">없음</option>
                      <option value="solid">실선</option>
                      <option value="dashed">점선</option>
                      <option value="dotted">점</option>
                      <option value="double">이중선</option>
                    </select>
                  </div>

                  <div className="design-group">
                    <label>모서리 둥글기</label>
                    <select
                      value={editingTemplate.design.borderRadius}
                      onChange={(e) => handleDesignChange('borderRadius', e.target.value)}
                    >
                      <option value="0px">각진 모서리</option>
                      <option value="4px">약간 둥글게</option>
                      <option value="8px">둥글게</option>
                      <option value="12px">많이 둥글게</option>
                      <option value="20px">매우 둥글게</option>
                    </select>
                  </div>

                  {/* 배경 패턴 */}
                  <div className="design-group">
                    <label>배경 패턴</label>
                    <select
                      value={editingTemplate.design.backgroundPattern}
                      onChange={(e) => handleDesignChange('backgroundPattern', e.target.value)}
                    >
                      <option value="none">없음</option>
                      <option value="dots">점</option>
                      <option value="grid">격자</option>
                      <option value="stripes">줄무늬</option>
                      <option value="waves">물결</option>
                    </select>
                  </div>

                  <div className="design-group">
                    <label>여백</label>
                    <select
                      value={editingTemplate.design.padding}
                      onChange={(e) => handleDesignChange('padding', e.target.value)}
                    >
                      <option value="10px">좁게</option>
                      <option value="15px">보통</option>
                      <option value="20px">넓게</option>
                      <option value="30px">매우 넓게</option>
                    </select>
                  </div>

                  <div className="design-group">
                    <label>헤더 스타일</label>
                    <select
                      value={editingTemplate.design.headerStyle}
                      onChange={(e) => handleDesignChange('headerStyle', e.target.value)}
                    >
                      <option value="normal">일반</option>
                      <option value="bold">굵게</option>
                      <option value="italic">기울임</option>
                      <option value="underline">밑줄</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="editor-actions">
                <button className="cancel-btn" onClick={handleCancel}>
                  취소
                </button>
                <button className="save-btn" onClick={handleSave}>
                  저장
                </button>
              </div>
            </div>

            <div className="editor-preview">
              <h3>미리보기</h3>
              <div 
                className="preview-content"
                style={{
                  ...getBackgroundStyle(editingTemplate.design),
                  color: editingTemplate.design.textColor,
                  fontSize: editingTemplate.design.fontSize,
                  fontFamily: editingTemplate.design.fontFamily,
                  borderStyle: editingTemplate.design.borderStyle,
                  borderColor: editingTemplate.design.borderColor,
                  borderWidth: '2px',
                  borderRadius: editingTemplate.design.borderRadius,
                  padding: editingTemplate.design.padding
                }}
              >
                <pre style={{ 
                  color: editingTemplate.design.textColor,
                  fontFamily: editingTemplate.design.fontFamily
                }}>
                  {editingTemplate.content || '여기에 템플릿 미리보기가 표시됩니다...'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateEditor;
