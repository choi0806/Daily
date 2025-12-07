// Gemini API client helper for snippet feedback generation.
// WARNING: Calling Gemini API from the browser with an API key
// exposes the key to end users. Prefer creating a server-side endpoint.

// Support both Vite-style (`VITE_...`) and NEXT_PUBLIC_... (in case env was set that way)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
// Use gemini-2.0-flash-exp (available in v1beta API)
const MODEL = import.meta.env.VITE_GEMINI_MODEL || import.meta.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';

// Try static raw import of `System Prompt.md` so Vite bundles the exact file contents.
// Note: the file name contains a space so path must match exactly.
import systemPromptRaw from '../../System Prompt.md?raw';

// Use the imported prompt if available; otherwise fallback to a minimal embedded default.
const SYSTEM_PROMPT = (typeof systemPromptRaw === 'string' && systemPromptRaw.trim().length > 0)
  ? systemPromptRaw
  : `# Role Definition\n\n당신은 한화그룹의 조직문화 & 리더십 전문 코치입니다. 사용자의 Daily Snippet을 분석하여 피드백을 제공하세요.`;

// Log to verify which prompt is being used (first 100 chars)
console.log('🤖 Using System Prompt:', SYSTEM_PROMPT.slice(0, 100).replace(/\n/g, ' ') + '...');

export async function generateSnippetFeedback(snippetContent, userName = '열정적인 한화인') {
  if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY is not set. Returning placeholder feedback.');
    return '🍊 AI 피드백 기능을 사용하려면 .env.local에 VITE_GEMINI_API_KEY를 설정하세요.';
  }

  // Use the correct REST API endpoint and body format per official docs
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const prompt = `${SYSTEM_PROMPT}

# User Input (Daily Snippet)

사용자 이름: ${userName}

${snippetContent}

위 스니펫을 분석하여 피드백을 작성해주세요.`;

  const body = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  // Implement retry for 429 with respect to Retry-After header
  const maxAttempts = 2;
  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Gemini API error: ${res.status}`, errText);

        // If rate limited, try again after Retry-After if provided
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After') || res.headers.get('retry-after');
          let waitMs = 0;
          if (retryAfter) {
            const asInt = parseInt(retryAfter, 10);
            if (!isNaN(asInt)) {
              waitMs = asInt * 1000;
            } else {
              // If HTTP-date, parse to milliseconds
              const then = Date.parse(retryAfter);
              if (!isNaN(then)) waitMs = Math.max(0, then - Date.now());
            }
          }

          if (attempt < maxAttempts) {
            const waitMsg = waitMs > 0 ? `Retry-After: ${Math.ceil(waitMs/1000)}s` : '잠시 후';
            console.warn(`429 received, attempt ${attempt + 1} waiting ${waitMsg}`);
            if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
            else await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue; // retry
          }

          // No more retries
          const raMsg = retryAfter ? ` (서버 권장 대기: ${retryAfter})` : '';
          return `⚠️ Gemini API 요청 한도를 초과했습니다.\n잠시 후 다시 시도해주세요.${raMsg}`;
        }

        if (res.status === 403) {
          return `⚠️ API 키가 유효하지 않거나 권한이 없습니다.\n.env.local의 VITE_GEMINI_API_KEY를 확인하세요.`;
        }

        return `⚠️ AI 피드백 생성 중 오류가 발생했습니다. (${res.status})\n${errText.slice(0, 200)}`;
      }

      const data = await res.json();
      // Official Gemini API response structure: data.candidates[0].content.parts[0].text
      if (data?.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      console.warn('Unexpected Gemini response structure:', data);
      return '피드백을 생성할 수 없습니다.';
    } catch (error) {
      console.error('Gemini API call failed (network):', error);
      // network errors may be transient — retry a couple times
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return `⚠️ AI 피드백 생성 중 오류가 발생했습니다: ${error.message}`;
    }
  }
}

export async function generateText(prompt, { temperature = 0.2, maxOutputTokens = 512 } = {}) {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set. See .env.local');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature,
      maxOutputTokens
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  if (data?.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  return JSON.stringify(data);
}
