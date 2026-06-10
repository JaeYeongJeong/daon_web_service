import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterviewModel, ChatMessage, InterviewSessionConfig, AnswerResponse } from './types';
import Home from './components/Home';
import SessionConfig from './components/SessionConfig';
import ChatInterview from './components/ChatInterview';
import FeedbackResult from './components/FeedbackResult';
import { Sparkles, Languages, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'home' | 'config' | 'chat' | 'feedback'>('home');
  const [sessionId, setSessionId] = useState('');
  const [model, setModel] = useState<InterviewModel>('friendly');
  const [jobRole, setJobRole] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Status flags
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const restartAll = () => {
    setStep('home');
    setSessionId('');
    setModel('friendly');
    setJobRole('');
    setQuestionCount(5);
    setMessages([]);
    setCurrentQuestionIndex(0);
    setFeedbackText('');
    setErrorMsg('');
  };

  /**
   * Post config setting to server & trigger start
   */
  const handleConfigSubmit = async (config: InterviewSessionConfig) => {
    setIsSubmittingConfig(true);
    setErrorMsg('');
    try {
      // 1. Create Session
      const createRes = await fetch('/interview/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!createRes.ok) {
        let errMsg = '면접 세션을 생성하는 중 오류가 발생했습니다.';
        try {
          const errData = await createRes.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const createData = await createRes.json();
      const sId = createData.session_id;

      setSessionId(sId);
      setModel(config.model);
      setJobRole(config.job_role);
      setQuestionCount(config.question_count);

      // 2. Start Interview immediately to fetch Question 1
      const startRes = await fetch(`/interview/sessions/${sId}/start`, {
        method: 'POST',
      });

      if (!startRes.ok) {
        let errMsg = '첫 번째 질문을 생성하는 도중 오류가 발생했습니다.';
        try {
          const errData = await startRes.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const startData = await startRes.json();
      
      setMessages([
        {
          id: 'start-q',
          role: 'interviewer',
          text: startData.question,
          timestamp: new Date().toISOString(),
        }
      ]);
      setCurrentQuestionIndex(0);
      setStep('chat');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '네트워크 이상으로 세션을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmittingConfig(false);
    }
  };

  /**
   * Submit candidate's response text and get next question OR final feedback report
   */
  const handleSendAnswer = async (answer: string) => {
    if (isGenerating) return;

    // Push candidate message to interface locally right away for reactive feel
    const candidateMsg: ChatMessage = {
      id: `local-ans-${Date.now()}`,
      role: 'candidate',
      text: answer,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/interview/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer,
          model
        }),
      });

      if (!res.ok) {
        let errMsg = '답변을 서버로 송신 및 처리하는 중 문제가 발생했습니다.';
        try {
          const errData = await res.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data: AnswerResponse = await res.json();

      if (data.status === 'interview' && data.next_question) {
        // Increment progress index and output question
        setCurrentQuestionIndex((prev) => prev + 1);
        setMessages((prev) => [
          ...prev,
          {
            id: `server-q-${Date.now()}`,
            role: 'interviewer',
            text: data.next_question!,
            timestamp: new Date().toISOString(),
          }
        ]);
      } else {
        // High quality evaluation complete OR fallback status like feedback_ready
        const feedback = data.answer || data.feedback || '';
        setFeedbackText(feedback);
        setStep('feedback');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '데이터 처리에 실패했습니다. 재시도해 주십시오.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Early wrap-up trigger requesting final summary report
   */
  const handleForceFeedback = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/interview/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force_feedback: true,
          model,
          messages
        }),
      });

      if (!res.ok) {
        let errMsg = '조기 면접 종료 요청에 실패했습니다.';
        try {
          const errData = await res.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data: AnswerResponse = await res.json();

      const feedback = data.answer || data.feedback || '';
      setFeedbackText(feedback);
      setStep('feedback');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '조기 피드백 레포트 생성 도중 예외가 발발했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col text-slate-200 selection:bg-blue-500 selection:text-white relative">
      {/* Frosted Glass Background Layer */}
      <div className="mesh-gradient"></div>
      
      {/* Visual Header using Frosted style */}
      <header className="border-b border-white/5 bg-white/2 backdrop-blur-md sticky top-0 z-50 px-4 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={restartAll}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Sparkles className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>AI 면접 시뮬레이터</span>
                <span className="text-[9px] bg-white/5 border border-white/10 text-blue-400 font-mono px-1.5 py-0.5 rounded-full font-medium">v1.0</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Qwen2.5 & Dual-LoRA Realtime Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {step !== 'home' && (
              <button
                onClick={restartAll}
                className="px-3 py-1.5 text-xs font-semibold text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                메인 화면으로
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with subtle routing animations */}
      <main className="flex-1 overflow-x-hidden">
        {errorMsg && (
          <div className="max-w-3xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block">통신 중 문제 발생</span>
                <p className="mt-0.5">{errorMsg}</p>
                <div className="mt-2.5">
                  <button
                    onClick={() => setErrorMsg('')}
                    className="underline hover:text-red-300 font-bold"
                  >
                    확인 및 닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Home onStart={() => setStep('config')} />
            </motion.div>
          )}

          {step === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SessionConfig
                onBack={() => setStep('home')}
                onSubmit={handleConfigSubmit}
                isSubmitting={isSubmittingConfig}
              />
            </motion.div>
          )}

          {step === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChatInterview
                session_id={sessionId}
                model={model}
                job_role={jobRole}
                question_count={questionCount}
                messages={messages}
                current_question_index={currentQuestionIndex}
                isGenerating={isGenerating}
                onSendAnswer={handleSendAnswer}
                onForceFeedback={handleForceFeedback}
                onChangeModel={(newModel) => setModel(newModel)}
              />
            </motion.div>
          )}

          {step === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FeedbackResult
                feedbackText={feedbackText}
                onRestart={restartAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ground Footer */}
      <footer className="border-t border-white/5 bg-transparent pb-6 pt-4 text-center text-slate-500 text-xs mt-auto">
        <p className="font-mono">© 2026 AI 면접 시뮬레이터. All Rights Reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Powered by Gemini API on Cloud Sandbox • ChatGPT Persona Layout style
        </p>
      </footer>
    </div>
  );
}
