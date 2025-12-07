// Gemini API를 사용한 팀 스니펫 요약 생성

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * 팀 스니펫을 분석하여 요약 생성
 * @param {Array} snippets - 팀원들의 스니펫 배열
 * @param {string} teamName - 팀 이름
 * @returns {Object} 분석 결과 (요약, 키워드, 하이라이트)
 */
export const generateTeamSummary = async (snippets, teamName) => {
  console.log('generateTeamSummary 호출:', { snippetsCount: snippets?.length, teamName });
  
  if (!snippets || snippets.length === 0) {
    console.log('스니펫이 없음');
    return {
      summary: '작성된 스니펫이 없습니다.',
      projectProgress: {
        status: '정보 없음',
        completedTasks: [],
        inProgressTasks: [],
        blockers: []
      },
      keyInsights: [],
      highlights: [],
      concerns: [],
      topKeywords: [],
      recommendations: []
    };
  }

  try {
    // 스니펫 데이터 구조 확인
    console.log('스니펫 데이터 샘플:', snippets[0]);
    
    // 스니펫 내용 결합
    const snippetTexts = snippets.map((s, idx) => {
      const acc = s.accomplishments?.join(', ') || '';
      const todo = s.todoList?.join(', ') || '';
      const cont = s.content || '';
      
      const mainContent = cont || acc || todo || '내용없음';
      return `[${s.userName || '팀원' + (idx + 1)}] ${mainContent}`;
    }).join('\n');
    
    console.log('스니펫 텍스트 길이:', snippetTexts.length);
    console.log('스니펫 텍스트 미리보기:', snippetTexts.substring(0, 500));

    const prompt = `${teamName} 팀의 스니펫을 JSON으로 간단히 요약하세요.

데이터:
${snippetTexts}

형식:
{
  "summary": "2문장 요약",
  "projectProgress": {"status": "진행중", "completedTasks": [], "inProgressTasks": [], "blockers": []},
  "keyInsights": ["인사이트1"],
  "highlights": ["성과1"],
  "concerns": [],
  "topKeywords": ["키워드1"],
  "recommendations": ["제안1"]
}

요구사항:
- 한글로 작성
- 구체적인 작업명이나 기술 용어 그대로 사용
- 팀원 이름은 언급하되 비판적이지 않게
- 관리자가 즉시 활용할 수 있는 실용적인 내용
- 긍정적이면서도 현실적인 톤
`;

    console.log('Gemini API 호출 시작');
    console.log('API URL:', `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4096,
        }
      })
    });

    console.log('API 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 오류 응답:', errorText);
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('API 응답에 candidates가 없습니다.');
    }
    
    // 응답 구조 확인
    const candidate = data.candidates[0];
    console.log('candidate:', candidate);
    console.log('finishReason:', candidate.finishReason);
    
    // parts가 없는 경우 처리
    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
      console.error('응답에 parts가 없습니다:', candidate);
      throw new Error(`응답 생성 실패: ${candidate.finishReason || '알 수 없는 오류'}`);
    }
    
    const text = candidate.content.parts[0].text;
    console.log('생성된 텍스트:', text);
    
    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log('파싱된 결과:', result);
      return result;
    }

    // JSON 파싱 실패 시 기본값 반환
    console.warn('JSON 파싱 실패, 기본값 반환');
    return {
      summary: text.substring(0, 200),
      projectProgress: {
        status: '분석 완료',
        completedTasks: [],
        inProgressTasks: [],
        blockers: []
      },
      keyInsights: ['분석 중...'],
      highlights: [],
      concerns: [],
      topKeywords: [],
      recommendations: []
    };

  } catch (error) {
    console.error('Gemini API 오류 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error; // 에러를 다시 던져서 호출자가 처리하도록
  }
};

/**
 * 개별 스니펫에 대한 피드백 생성
 * @param {string} content - 스니펫 내용
 * @param {string} userName - 사용자 이름
 * @returns {string} AI 피드백
 */
export const generateSnippetFeedback = async (content, userName) => {
  try {
    const prompt = `
당신은 한화그룹의 팀원을 돕는 멘토 AI입니다.
${userName}님이 작성한 Daily Snippet에 대해 긍정적이고 건설적인 피드백을 제공해주세요.

[스니펫 내용]
${content}

피드백 작성 가이드:
1. 잘한 점을 먼저 칭찬
2. 개선할 수 있는 점 제안
3. 격려와 응원 메시지
4. 2-3문장으로 간결하게

한글로 작성해주세요.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini API 오류:', error);
    return '피드백을 생성하는 중 오류가 발생했습니다.';
  }
};
