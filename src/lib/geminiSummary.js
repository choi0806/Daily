// Gemini API를 사용한 팀 스니펫 요약 생성

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * 스니펫을 청크로 나누어 요약 (각 청크당 최대 5명)
 */
const summarizeChunk = async (chunkSnippets, teamName) => {
  try {
    const snippetTexts = chunkSnippets.map((s, idx) => {
      const acc = s.accomplishments?.join(', ') || '';
      const todo = s.todoList?.join(', ') || '';
      const cont = s.content || '';
      
      const mainContent = cont || acc || todo || '내용없음';
      return `[${s.userName || '팀원' + (idx + 1)}] ${mainContent}`;
    }).join('\n\n---\n\n');

    console.log('청크 스니펫 텍스트:', snippetTexts.substring(0, 300));

    const prompt = `${teamName} 팀원 ${chunkSnippets.length}명의 Daily Snippet을 **각 팀원별로 상세하게** 분석하여 JSON으로 요약하세요.

데이터:
${snippetTexts}

형식:
{
  "memberSummaries": [
    {
      "name": "팀원이름",
      "summary": "이 팀원이 오늘 한 일을 2-3문장으로 풍부하게 요약",
      "keyTasks": ["구체적인 작업1", "구체적인 작업2"],
      "achievements": "주요 성과나 잘한 점",
      "concerns": "우려사항이나 어려운 점 (없으면 null)"
    }
  ],
  "overallKeywords": ["전체 팀의 핵심 키워드1", "키워드2"]
}

요구사항:
- 반드시 한글로 작성
- **각 팀원별로** 개별 요약을 작성 (memberSummaries 배열에 각 팀원마다 하나씩)
- summary는 팀원이 한 일을 구체적이고 상세하게 작성 (단순 키워드 나열 금지)
- keyTasks는 실제 작업명을 구체적으로 포함
- 팀원의 스니펫 내용을 최대한 반영하여 풍부하게 작성`;

    console.log('청크 API 호출 시작');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('청크 API 오류:', response.status, errorText);
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('청크 API 응답:', data);
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('청크 응답 구조 오류:', data);
      throw new Error('응답 형식 오류');
    }
    
    let text = data.candidates[0].content.parts[0].text;
    console.log('청크 응답 텍스트:', text);
    
    // ```json ... ``` 형태로 감싸진 경우 제거
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    console.log('정리된 텍스트:', text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('청크 파싱 결과:', parsed);
      return parsed;
    }
    
    console.warn('청크 JSON 파싱 실패, 빈 결과 반환');
    return {
      memberSummaries: [],
      overallKeywords: []
    };
  } catch (error) {
    console.error('청크 요약 오류:', error);
    return {
      memberSummaries: [],
      overallKeywords: []
    };
  }
};

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
    console.log('스니펫 데이터 샘플:', snippets[0]);
    
    // 스니펫을 5명씩 청크로 나누기
    const CHUNK_SIZE = 5;
    const chunks = [];
    for (let i = 0; i < snippets.length; i += CHUNK_SIZE) {
      chunks.push(snippets.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`총 ${snippets.length}명의 스니펫을 ${chunks.length}개 청크로 분할`);
    
    // 각 청크를 병렬로 요약
    console.log('청크 병렬 처리 시작');
    const chunkResults = await Promise.all(
      chunks.map(async (chunk, idx) => {
        console.log(`청크 ${idx + 1}/${chunks.length} 처리 시작 (${chunk.length}명)`);
        const result = await summarizeChunk(chunk, teamName);
        console.log(`청크 ${idx + 1} 완료:`, result);
        return result;
      })
    );
    
    console.log('모든 청크 요약 완료. 결과 수:', chunkResults.length);
    console.log('청크 결과 상세:', JSON.stringify(chunkResults, null, 2));
    
    // 청크 결과들을 병합 (새로운 구조)
    const allMemberSummaries = [];
    const allKeywords = [];
    
    chunkResults.forEach((result, idx) => {
      console.log(`청크 ${idx + 1} 병합 중:`, {
        memberSummaries: result.memberSummaries?.length || 0,
        keywords: result.overallKeywords?.length || 0
      });
      
      if (result.memberSummaries) {
        allMemberSummaries.push(...result.memberSummaries);
      }
      if (result.overallKeywords) {
        allKeywords.push(...result.overallKeywords);
      }
    });
    
    // 키워드 중복 제거
    const uniqueKeywords = [...new Set(allKeywords)];
    
    console.log('병합 완료. 총 항목 수:', {
      memberSummaries: allMemberSummaries.length,
      keywords: uniqueKeywords.length
    });
    console.log('병합된 팀원 요약:', allMemberSummaries);

    // 팀원별 요약을 텍스트로 변환
    const memberSummariesText = allMemberSummaries.map(m => 
      `- ${m.name}: ${m.summary}\n  작업: ${m.keyTasks?.join(', ') || '없음'}\n  성과: ${m.achievements || '없음'}`
    ).join('\n\n');

    // 최종 요약 생성 (팀원별 상세 내용 포함)
    const finalSummaryPrompt = `${teamName} 팀의 ${snippets.length}명의 업무 내용을 종합하여 관리자용 보고서를 작성하세요.

팀원별 상세 내용:
${memberSummariesText}

전체 키워드: ${uniqueKeywords.join(', ')}

JSON 형식으로 다음 구조로 작성:
{
  "summary": "팀 전체 상황을 3-4문장으로 상세히 요약 (구체적인 작업명 포함)",
  "keyInsights": ["각 팀원의 작업을 바탕으로 한 구체적인 인사이트", "인사이트 2"],
  "recommendations": ["관리자를 위한 구체적인 제안 1", "제안 2"],
  "teamProgress": "팀의 전반적인 진행 상황 평가"
}

요구사항:
- 한글로 작성
- 팀원 이름과 구체적인 작업 내용을 summary에 포함
- keyInsights는 실제 작업 내용을 바탕으로 작성
- 긍정적이면서도 현실적인 톤
- 관리자가 즉시 활용할 수 있는 실용적이고 구체적인 내용`;

    console.log('최종 요약 생성 API 호출');
    
    const finalResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalSummaryPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!finalResponse.ok) {
      throw new Error(`최종 요약 API 오류: ${finalResponse.status}`);
    }

    const finalData = await finalResponse.json();
    let finalText = finalData.candidates[0].content.parts[0].text;
    
    // ```json ... ``` 형태로 감싸진 경우 제거
    finalText = finalText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    console.log('최종 정리된 텍스트:', finalText);
    
    const finalJsonMatch = finalText.match(/\{[\s\S]*\}/);
    
    let finalSummary = {
      summary: `${teamName} 팀의 ${snippets.length}명이 작성했습니다.`,
      keyInsights: [],
      recommendations: [],
      teamProgress: '분석 중'
    };
    
    if (finalJsonMatch) {
      const parsed = JSON.parse(finalJsonMatch[0]);
      finalSummary = {
        summary: parsed.summary || finalSummary.summary,
        keyInsights: parsed.keyInsights || [],
        recommendations: parsed.recommendations || [],
        teamProgress: parsed.teamProgress || finalSummary.teamProgress
      };
    }
    
    console.log('최종 결과:', finalSummary);
    
    // 팀원별 상세 내용 추출
    const completedTasks = [];
    const inProgressTasks = [];
    const highlights = [];
    const concerns = [];
    
    allMemberSummaries.forEach(member => {
      if (member.keyTasks) {
        member.keyTasks.forEach(task => {
          if (task.includes('완료') || task.includes('성공')) {
            completedTasks.push(`${member.name}: ${task}`);
          } else {
            inProgressTasks.push(`${member.name}: ${task}`);
          }
        });
      }
      if (member.achievements) {
        highlights.push(`${member.name}: ${member.achievements}`);
      }
      if (member.concerns) {
        concerns.push(`${member.name}: ${member.concerns}`);
      }
    });
    
    // 최종 반환 형식
    return {
      summary: finalSummary.summary,
      projectProgress: {
        status: finalSummary.teamProgress,
        completedTasks: completedTasks,
        inProgressTasks: inProgressTasks,
        blockers: []
      },
      keyInsights: finalSummary.keyInsights,
      highlights: highlights,
      concerns: concerns,
      topKeywords: uniqueKeywords.slice(0, 10),
      recommendations: finalSummary.recommendations
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
