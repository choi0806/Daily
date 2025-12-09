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
    }).join('\n');

    console.log('청크 스니펫 텍스트:', snippetTexts.substring(0, 300));

    const prompt = `${teamName} 팀원 ${chunkSnippets.length}명의 Daily Snippet을 분석하여 JSON으로 요약하세요.

데이터:
${snippetTexts}

형식:
{
  "completedTasks": ["완료된 작업을 구체적으로"],
  "inProgressTasks": ["진행 중인 작업을 구체적으로"],
  "blockers": ["차단 요소가 있다면"],
  "highlights": ["주요 성과나 잘한 점"],
  "concerns": ["우려사항이 있다면"],
  "keywords": ["핵심 키워드들"]
}

요구사항:
- 반드시 한글로 작성
- 팀원 이름을 포함하여 구체적으로 작성
- 각 배열에 최소 1개 이상의 항목 포함
- 스니펫 내용을 실제로 분석하여 의미있는 내용 추출`;

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
      completedTasks: [],
      inProgressTasks: [],
      blockers: [],
      highlights: [],
      concerns: [],
      keywords: []
    };
  } catch (error) {
    console.error('청크 요약 오류:', error);
    return {
      completedTasks: [],
      inProgressTasks: [],
      blockers: [],
      highlights: [],
      concerns: [],
      keywords: []
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
    
    // 청크 결과들을 병합
    const mergedResult = {
      completedTasks: [],
      inProgressTasks: [],
      blockers: [],
      highlights: [],
      concerns: [],
      keywords: []
    };
    
    chunkResults.forEach((result, idx) => {
      console.log(`청크 ${idx + 1} 병합 중:`, {
        completedTasks: result.completedTasks?.length || 0,
        inProgressTasks: result.inProgressTasks?.length || 0,
        highlights: result.highlights?.length || 0
      });
      
      mergedResult.completedTasks.push(...(result.completedTasks || []));
      mergedResult.inProgressTasks.push(...(result.inProgressTasks || []));
      mergedResult.blockers.push(...(result.blockers || []));
      mergedResult.highlights.push(...(result.highlights || []));
      mergedResult.concerns.push(...(result.concerns || []));
      mergedResult.keywords.push(...(result.keywords || []));
    });
    
    // 키워드 중복 제거
    const uniqueKeywords = [...new Set(mergedResult.keywords)];
    
    console.log('병합 완료. 총 항목 수:', {
      completedTasks: mergedResult.completedTasks.length,
      inProgressTasks: mergedResult.inProgressTasks.length,
      highlights: mergedResult.highlights.length,
      keywords: uniqueKeywords.length
    });
    console.log('병합된 결과 상세:', mergedResult);

    // 최종 요약 생성 (병합된 결과를 바탕으로)
    const finalSummaryPrompt = `${teamName} 팀의 업무 요약 데이터를 보기 좋게 정리하세요.

데이터:
- 완료된 작업: ${mergedResult.completedTasks.join(', ')}
- 진행 중인 작업: ${mergedResult.inProgressTasks.join(', ')}
- 차단 요소: ${mergedResult.blockers.join(', ')}
- 주요 성과: ${mergedResult.highlights.join(', ')}
- 우려사항: ${mergedResult.concerns.join(', ')}
- 키워드: ${uniqueKeywords.join(', ')}

JSON 형식으로 다음 구조로 작성:
{
  "summary": "팀 전체 상황을 2-3문장으로 요약",
  "keyInsights": ["핵심 인사이트 1", "핵심 인사이트 2"],
  "recommendations": ["관리자를 위한 제안 1", "제안 2"]
}

요구사항:
- 한글로 작성
- 긍정적이면서도 현실적인 톤
- 관리자가 즉시 활용할 수 있는 실용적인 내용`;

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
      recommendations: []
    };
    
    if (finalJsonMatch) {
      const parsed = JSON.parse(finalJsonMatch[0]);
      finalSummary = {
        summary: parsed.summary || finalSummary.summary,
        keyInsights: parsed.keyInsights || [],
        recommendations: parsed.recommendations || []
      };
    }
    
    console.log('최종 결과:', finalSummary);
    
    // 최종 반환 형식
    return {
      summary: finalSummary.summary,
      projectProgress: {
        status: mergedResult.blockers.length > 0 ? '일부 차단' : '순조롭게 진행',
        completedTasks: mergedResult.completedTasks.slice(0, 10), // 상위 10개만
        inProgressTasks: mergedResult.inProgressTasks.slice(0, 10),
        blockers: mergedResult.blockers
      },
      keyInsights: finalSummary.keyInsights,
      highlights: mergedResult.highlights.slice(0, 10),
      concerns: mergedResult.concerns,
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
