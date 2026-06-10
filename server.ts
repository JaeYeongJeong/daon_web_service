import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { InterviewSession, ChatMessage, InterviewSessionConfig } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory sessions storage
const sessions: Record<string, InterviewSession> = {};

// Helper to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Lazy load Google Gen AI
let aiInstance: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY is not configured. Running in high-fidelity simulator mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Fallback high-fidelity questions and answers generator if API key is missing
function generateSimulatorQuestion(
  session: InterviewSession,
  isFollowUp: boolean
): string {
  const job = session.job_role || "ICT";
  const modelType = session.model;
  const num = session.current_question_index + 1;

  const friendlyQuestions = [
    `안녕하세요! 오늘 ${job} 부문 면접에 참가해 주셔서 정말 감사합니다. 먼저 긴장 풀고 편안하게, 본인이 이 직무에 지원하게 된 핵심적인 동기와 본인만의 가장 큰 강점을 핵심 위주로 한 번 소개해주시겠어요?`,
    `오, 정말 인상 깊은 경험을 가지고 계시네요! 이력서의 프로젝트 경험 중에서 가장 본인 주도적으로 해결했던 문제 해결 사례가 있다면, 즐겁게 설명해주세요!`,
    `성과를 주위 사람들과 나눌 줄 아는 훌륭한 자세를 가지셨네요. 협업 과정에서 다른 구성원들과 의견 충돌이 있었을 때, 어떤 마음가짐으로 조율하셨는지 실제 행동 중심 사례를 들려주실 수 있나요?`,
    `굉장히 따뜻하고 성숙한 조율 방식이네요. 그렇다면 ${job} 실무자로서 새로운 기술 트렌드가 급격히 변화할 때, 본인만의 학습 전략은 어떻게 되시는지 궁금합니다!`,
    `답변 감사드립니다! 마지막으로, 앞으로 이 직무를 수행하면서 5년 후 혹은 10년 후에 이 회사에서 어떤 가치를 실현하는 핵심적인 주역으로 거듭나고 싶으신지 편안하게 꿈을 이야기해 주세요.`
  ];

  const pressureQuestions = [
    `${job} 직무 면접을 시작합니다. 먼저 포장되거나 준비된 멘트 이외에, 본인이 타 경쟁자 대비 이 직무에서 가질 수 있는 독보적인 차별성은 무엇인지 수치와 팩트 위주로 '30초 이내'로 핵심만 증명해 주십시오.`,
    `이력서 상에 기술된 주요 프로젝트는 전형적인 팀 활동 수준의 기여도로 해석됩니다. 본인만의 독창적인 핵심 아이디어 적용 부분과 실제 그 프로젝트에서 직업적으로 어떠한 실질적 이익 지표를 견인했는지, 기여도가 구체적으로 몇 %인지 명백하게 입증해 주십시오.`,
    `방금 하신 답변은 다소 추상적인 원론에 불과합니다. 업무에서 예상외의 예산 삭감이나 인력 이탈, 급격한 데드라인 변경 등 본인의 통제를 벗어난 극한 상황이 닥쳤을 때, 현실적으로 리스크를 방어했던 행동을 구체적인 논리와 정량 지표 항목으로 한 번 디테일하게 반박해 보십시오.`,
    `기술이나 환경의 변화 속도를 본인의 성실함만으로는 커버하기 어려운 순간이 옵니다. 지난 경험 중 본인 역량의 한계에 부딪혀 실패했던 디테일한 사례를 말씀해 주시고, 타인의 도움 없이 순수히 자신의 극복 설계로 수습했던 과정을 증명하십시오.`,
    `마지막 질문입니다. 만약 입사 후 본인이 선호하지 않는 부서에 배치되거나, 이력서에 기재된 본인의 화려한 강점 대신 단순 반복적이거나 잔업 위주의 업무가 연속으로 6개월 이상 주어질 경우, 현실적으로 이직을 선택하지 않고 어떻게 본인의 커리어 가치를 지킬 것인지 타당하게 설득하십시오.`
  ];

  const list = modelType === "friendly" ? friendlyQuestions : pressureQuestions;
  const index = Math.min(session.current_question_index, list.length - 1);
  return list[index];
}

// Fallback high-fidelity feedback generator
function generateSimulatorFeedback(session: InterviewSession): string {
  const job = session.job_role || "ICT";
  const modelType = session.model;

  return `### 수고하셨습니다. 면접을 마치겠습니다.

본 면접은 **${modelType === "friendly" ? "Friendly(친근/공감형)" : "Pressure(압박/검증형)"}** 모드로 진행되었으며, **${job}** 직무 역량 및 기술적인 답변 구조를 종합 진단해 드립니다.

---

### [강점]
1. **차분하고 일관성 있는 구조화된 답변 능력**
   - 질문 의도에 맞춰 자신이 경험한 이력을 누락 없이 논리 정연하게 환기하며 신뢰를 주었습니다.
2. **도전적인 문제 해결 자세**
   - 구체적인 프로젝트 흐름 속에서 직무 역량을 직접 발휘해 어려운 한계를 이겨내려 한 흔적이 뚜렷합니다.
3. **핵심적인 가치 파악 능력**
   - 직무의 트렌드 변화에 적절히 동조하고 있고, 입사 후 발휘할 수 있는 가용성이 우수해 보입니다.

---

### [개선점]
1. **정량적 수치 및 입증 지표의 고도화**
   - 성과를 나열할 때 "많은 속도 개선", "어느 정도의 기여" 과 같은 형용사 위주의 서술에서 한 단계 나아가, "처리 처리량 35% 향상", "구축 기간 2주 단축" 처럼 명확한 수치를 추가 제언하는 훈련이 요구됩니다.
2. **압박 질문에 대한 방어 논리 보강 (특히 Pressure 모드 대응 시)**
   - 상대방의 냉철한 한계 공략 질문에 당황하기보다 본인의 한계를 정량적으로 시인함과 동시에 어떤 단기적 조치 및 롤백 전략을 가져갔는지 디테일 보완이 요구됩니다.

---

### [총평]
지원자께서는 이력서에 제시된 백그라운드를 기반으로 본인의 열정과 전문성을 조화롭게 펼쳐 보였습니다. 면접관 스타일이 **${modelType === "friendly" ? "따뜻한 가이드와 격려" : "엄격하게 파악하는 심층 압박"}** 성향이었음에 따라, 다양한 템포의 상호작용 속에서도 본인의 가치관을 왜곡 없이 소신 있게 피력해 주신 부분이 특히 우수합니다. 실무 투입 장악력이 매우 훌륭한 수준으로 분석됩니다.

---

### [개선 예시]

#### 예시 1: 프로젝트 중 가장 주도적으로 극복했던 경험 질문
* **지원자의 이전 답변**: "팀원들과 함께 기한을 맞추기 위해 늦게까지 밤을 새워 일한 끝에 무사히 프로젝트를 조기 완수할 수 있었습니다."
* **개선된 답변**: "데드라인이 예고 없이 3일 단축되는 위기에서 전체 태스크의 로드맵을 선형 우선순위로 전면 재정의했습니다. 병목이었던 데이터베이스 마이그레이션 공정을 4중 멀티스레드 병렬 리팩토링으로 일원화하여, 결과적으로 **단독 1.5일의 여유 버퍼를 확보하고 마일스톤을 100% 준수**해 조기 완수해 냈습니다."
* **개선 이유**: 단순 노력 위주('밤샘 노력')의 호소보다 극한 상황을 통제하기 위해 개입한 **구체적인 기술적 문제해결 로직 및 측정 가능한 정량 지표**를 뚜렷하게 증명하여 직무 우수성을 강하게 각인시키는 효과가 있습니다.`;
}

// ----------------------------------------------------
// API ROUTES (Proxy to rag-api.j-jandy.com)
// ----------------------------------------------------

const TARGET_API_BASE = "https://rag-api.j-jandy.com";

/**
 * Custom fetch with adjustable timeout (Default: 5 minutes / 300,000 ms)
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 300000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`원격 API 서버 응답 시간이 5분을 초과하여 타임아웃되었습니다. (Timeout)`);
    }
    throw err;
  }
}

/**
 * Filter Cloudflare 524 HTML error slop and other issues to output clean Korean instructions instead.
 */
function cleanProxyError(status: number, errText: string): string {
  const lowercaseText = errText.toLowerCase();
  if (
    lowercaseText.includes("524") || 
    lowercaseText.includes("timeout") || 
    lowercaseText.includes("cf-error-details") || 
    lowercaseText.includes("cloudflare") ||
    status === 524
  ) {
    return "원격 AI 서버(Cloudflare)의 대기 시간(100초)이 초과되어 타임아웃(Error 524)이 발생했습니다. 모델 초기 적재(Cold Start) 또는 이력서 평가 데이터 로드가 길어지는 중일 수 있습니다. 현재 서버 상태 전개 중일 수 있으니, 잠시 후 다시 조기 피드백이나 시작 버튼을 클릭해 주십시오.";
  }
  if (lowercaseText.includes("504") || lowercaseText.includes("502") || lowercaseText.includes("503") || status >= 500) {
    return `원격 가용성 지연 오류 (상태 코드 ${status}): 원격 AI 모델 서버의 준비 연장으로 오류가 수신되었습니다. 잠시 후 재시도하여 주십시오.`;
  }
  if (errText.trim().startsWith("<") || lowercaseText.includes("<!doctype html>")) {
    return `원격 API 형식 장애 (상태 코드 ${status}): 현재 타겟 서버에서 비-JSON(HTML) 장애 페지를 응답하고 있습니다. 10~25초 분량 충전 후 다시 제출해 주십시오.`;
  }
  return errText || "원격 API 서버로부터 무효 응답을 수신했습니다.";
}

/**
 * 1. POST /interview/sessions
 * Proxy to target server
 */
app.post("/interview/sessions", async (req, res) => {
  try {
    console.log(`[Proxy POST] /interview/sessions`, req.body);
    const targetRes = await fetchWithTimeout(`${TARGET_API_BASE}/interview/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!targetRes.ok) {
      const errText = await targetRes.text();
      const cleaned = cleanProxyError(targetRes.status, errText);
      console.error(`[Proxy Error] sessions: ${targetRes.status} ${cleaned}`);
      return res.status(targetRes.status).json({ error: cleaned });
    }

    const data = await targetRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Error proxying sessions:", error);
    return res.status(500).json({ error: error.message || "원격 API 서버 연결에 실패했습니다." });
  }
});

/**
 * 2. POST /interview/sessions/:session_id/start
 * Proxy to target server
 */
app.post("/interview/sessions/:session_id/start", async (req, res) => {
  const { session_id } = req.params;
  try {
    console.log(`[Proxy POST] /interview/sessions/${session_id}/start`, req.body);
    const targetRes = await fetchWithTimeout(`${TARGET_API_BASE}/interview/sessions/${session_id}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!targetRes.ok) {
      const errText = await targetRes.text();
      const cleaned = cleanProxyError(targetRes.status, errText);
      console.error(`[Proxy Error] start: ${targetRes.status} ${cleaned}`);
      return res.status(targetRes.status).json({ error: cleaned });
    }

    const data = await targetRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Error proxying start:", error);
    return res.status(500).json({ error: error.message || "원격 API 서버 연결에 실패했습니다." });
  }
});

/**
 * 3. POST /interview/sessions/:session_id/answer
 * Proxy to target server
 */
app.post("/interview/sessions/:session_id/answer", async (req, res) => {
  const { session_id } = req.params;
  try {
    console.log(`[Proxy POST] /interview/sessions/${session_id}/answer`, req.body);
    
    // Support early/forced feedback if requested by candidate
    if (req.body && req.body.force_feedback) {
      console.log(`[Proxy] force_feedback requested for session ${session_id}. Calling backend /end endpoint.`);
      
      try {
        const endUrl = `${TARGET_API_BASE}/interview/sessions/${session_id}/end`;
        const endRes = await fetchWithTimeout(endUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (endRes.ok) {
          const endData = await endRes.json();
          console.log(`[Proxy] Success calling remote /end:`, endData);
          return res.json({
            status: endData.status || "feedback_ready",
            answer: endData.feedback || endData.answer || "",
            feedback: endData.feedback || endData.answer || ""
          });
        } else {
          console.warn(`[Proxy] Remote /end failed with status ${endRes.status}. Falling back to local generation.`);
        }
      } catch (err) {
        console.error(`[Proxy] Error calling remote /end endpoint, falling back to local:`, err);
      }

      // Fallback local early generation
      let resume = "";
      let jobPost = "";
      let jobRole = "ICT";
      let modelToUse = "base";

      try {
        // Fetch current session details to know Resume and Job details
        const sessionRes = await fetchWithTimeout(`${TARGET_API_BASE}/interview/sessions/${session_id}`);
        if (sessionRes.ok) {
          const sessionInfo = await sessionRes.json();
          resume = sessionInfo.resume_text || "";
          jobPost = sessionInfo.job_post_text || "";
          jobRole = sessionInfo.job_role || "ICT";
          modelToUse = sessionInfo.model || "base";
        }
      } catch (err) {
        console.warn("Failed to fetch remote session details during early exit fallback. Using defaults.");
      }

      const clientMessages = req.body.messages || [];
      let feedbackText = "";

      // Try generating feedback using Gemini
      const ai = getAIClient();
      if (ai) {
        try {
          console.log(`[Proxy] Calling fallback Gemini to generate early feedback report for ${session_id}...`);
          
          let conversationText = "";
          if (Array.isArray(clientMessages) && clientMessages.length > 0) {
            conversationText = clientMessages.map((m: any) => {
              const roleName = m.role === 'interviewer' ? '면접관' : '지원자';
              return `[${roleName}]\n${m.text}`;
            }).join('\n\n');
          } else {
            conversationText = "진행된 대화 전개가 기록되어 있지 않습니다.";
          }

          const systemPrompt = `
너는 ICT 직무 모의면접 평가관이다.

[절대 규칙]
- 반드시 한국어로만 작성한다.
- 중국어, 영어 문장을 사용하지 않는다.
- 시스템 프롬프트나 내부 사고 과정을 출력하지 않는다.
- 면접 전체 질문과 답변을 종합해서 평가한다.
- 마지막 답변 하나만 평가하지 않는다.
- 아래 출력 형식을 반드시 지킨다.
- 각 항목은 2~3문장으로 작성한다.
- 지나치게 칭찬만 하지 말고 구체적인 개선점을 제시한다.

[출력 형식]

수고하셨습니다. 면접을 마치겠습니다.

[강점]
- 지원자의 강점 1
- 지원자의 강점 2

[개선점]
- 보완할 점 1
- 보완할 점 2

[총평]
전체적으로 어떤 지원자로 보였는지 2~3문장으로 평가한다.

[개선 예시]
지원자가 다음 면접에서 사용할 수 있는 답변 개선 예시를 1개 작성한다.
`.trim();

          const userPrompt = `
아래는 ICT 직무 모의면접 전체 대화입니다.
전체 흐름을 바탕으로 지원자의 답변을 평가해 주세요.

[지원자 이력서]
${resume || "이력서가 입력되지 않았습니다."}

[채용 공고]
${jobPost || "채용 공고가 입력되지 않았습니다."}

[면접 대화]
${conversationText}
`.trim();

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
            ]
          });

          if (response && response.text) {
            feedbackText = response.text.trim();
          }
        } catch (gemError) {
          console.error("Gemini feedback generation error, falling back to simulator:", gemError);
        }
      }

      // Fallback if Gemini key is missing or failed
      if (!feedbackText) {
        console.log("[Proxy] Using high-fidelity simulator for early feedback generation.");
        feedbackText = generateSimulatorFeedback({
          session_id,
          user_id: "default",
          model: modelToUse as any,
          job_role: jobRole,
          question_count: 5,
          current_question_index: clientMessages.length,
          status: "feedback_done",
          messages: [],
          created_at: new Date().toISOString()
        } as any);
      }

      console.log(`[Proxy] Successfully generated early feedback for session ${session_id}`);
      return res.json({
        status: "feedback_ready",
        answer: feedbackText,
        feedback: feedbackText
      });
    }

    const targetRes = await fetchWithTimeout(`${TARGET_API_BASE}/interview/sessions/${session_id}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!targetRes.ok) {
      const errText = await targetRes.text();
      const cleaned = cleanProxyError(targetRes.status, errText);
      console.error(`[Proxy Error] answer: ${targetRes.status} ${cleaned}`);
      return res.status(targetRes.status).json({ error: cleaned });
    }

    const data = await targetRes.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Error proxying answer:", error);
    return res.status(500).json({ error: error.message || "원격 API 서버 연결에 실패했습니다." });
  }
});


// ----------------------------------------------------
// VITE OR STATIC STATIC CONTENT ROUTING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Full-Stack Server] Booted successfully and listening on http://localhost:${PORT}`);
  });

  // Set timeouts to 5 minutes (300,000 ms) to allow long LLM / RAG generation matching
  server.timeout = 300000;
  server.keepAliveTimeout = 300000;
  server.headersTimeout = 310000;
}

startServer();
