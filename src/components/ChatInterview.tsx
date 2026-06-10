import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, InterviewModel } from '../types';
import { Send, User, Bot, AlertTriangle, MessageSquareCode, Sparkles } from 'lucide-react';

interface ChatInterviewProps {
  session_id: string;
  model: InterviewModel;
  job_role: string;
  question_count: number;
  messages: ChatMessage[];
  current_question_index: number;
  isGenerating: boolean;
  onSendAnswer: (answer: string) => void;
  onForceFeedback: () => void; // QoL emergency early finish
  onChangeModel?: (model: InterviewModel) => void;
}

export default function ChatInterview({
  session_id,
  model,
  job_role,
  question_count,
  messages,
  current_question_index,
  isGenerating,
  onSendAnswer,
  onForceFeedback,
  onChangeModel
}: ChatInterviewProps) {
  const [inputAnswer, setInputAnswer] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasAnswers = messages.some(msg => msg.role === 'candidate');

  // Auto-scroll chat to bottom when messages or generating state shifts
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim() || isGenerating) return;
    onSendAnswer(inputAnswer.trim());
    setInputAnswer('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!inputAnswer.trim() || isGenerating) return;
      onSendAnswer(inputAnswer.trim());
      setInputAnswer('');
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((current_question_index || 1) / question_count) * 100)
  );

  return (
    <div id="chat-interview-view" className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto py-4 px-4 sm:px-6">
      
      {/* Top Banner Progress Section */}
      <div className="glass-card rounded-2xl p-4 mb-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${model === 'pressure' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
            <div>
              <div className="text-xs text-slate-400 font-medium">{job_role} 직무 면접 진행 중</div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onChangeModel?.('friendly')}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                    model === 'friendly'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold'
                      : 'bg-white/2 border-transparent text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }`}
                  title="공감 유도형 면접관 모드로 변경"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${model === 'friendly' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                  공감 유도형 (Friendly)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeModel?.('pressure')}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                    model === 'pressure'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold'
                      : 'bg-white/2 border-transparent text-slate-400 hover:text-slate-300 hover:bg-white/5'
                  }`}
                  title="압박 면접형 면접관 모드로 변경"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${model === 'pressure' ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`} />
                  압박 면접형 (Pressure)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Progress Bar</div>
              <div className="text-sm font-extrabold text-blue-400">
                {current_question_index + 1} <span className="text-slate-500">/</span> {question_count} <span className="text-xs text-slate-400 font-medium">질문</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (!hasAnswers) {
                  alert("조기 종료 및 분석을 진행하려면 최소 1회 이상의 답변을 작성하여 전송하셔야 합니다.");
                  return;
                }
                setShowConfirmModal(true);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                hasAnswers
                  ? "border-white/5 hover:border-red-500/30 text-slate-300 hover:text-red-400 bg-white/5 cursor-pointer"
                  : "border-white/5 text-slate-500 bg-white/2 cursor-not-allowed opacity-40"
              }`}
              title={
                hasAnswers
                  ? "시간이 부족하여 빠른 피드백을 확인하고 싶을 때 사용하세요"
                  : "최소 1회 이상의 답변을 전송한 후에 조기 종료가 가능합니다"
              }
            >
              조기 종료 및 분석
            </button>
          </div>
        </div>

        {/* Dynamic visual slider progress indicator */}
        <div className="w-full bg-black/40 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
            className={`h-full bg-gradient-to-r ${model === 'pressure' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-indigo-500'}`}
          />
        </div>
      </div>

      {/* Main Conversation Stream Panel */}
      <div className="flex-1 overflow-y-auto glass-card rounded-3xl p-4 sm:p-6 mb-4 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isAI = msg.role === 'interviewer';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                    model === 'pressure' ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                  }`}>
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}

                {/* Bubble details */}
                <div className={`max-w-[85%] sm:max-w-[75%] p-4 text-sm leading-relaxed ${
                  isAI
                    ? 'ai-bubble text-slate-100'
                    : 'user-bubble text-slate-200'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[9px] mt-1.5 block text-right font-mono ${
                    isAI ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Candidate Avatar */}
                {!isAI && (
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-slate-700 text-white font-mono text-xs uppercase font-extrabold">
                    Me
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Dynamic loader thinking indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 sm:gap-4 justify-start"
          >
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-white/5 border-white/5 text-slate-400`}>
              <Bot className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div className="ai-bubble px-4 py-3.5 flex items-center gap-1.5">
              <span className="text-xs text-slate-300 font-medium">면접관이 답변을 분석 중입니다</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Editor Form Panel */}
      <form onSubmit={handleSubmit} className="relative glass-card rounded-2xl p-3">
        <textarea
          id="answer-input"
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "AI가 처리 하는 중에는 다음 답변을 작성하실 수 없습니다." : "여기에 성실하고 꼼꼼하게 면접 답변을 작성하세요... (줄바꿈: Shift + Enter, 전송: Ctrl/Cmd + Enter 또는 우측 전송 아이콘)"}
          disabled={isGenerating}
          rows={3}
          style={{ resize: 'none' }}
          className="w-full bg-transparent px-2 text-sm text-slate-100 placeholder-slate-500 outline-none disabled:text-slate-600 focus:ring-0 leading-relaxed"
          required
        />

        <div id="editor-controls-row" className="flex items-center justify-between border-t border-white/5 pt-2 px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquareCode className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">작성 팁: 육하원칙과 STAR 기법(상황-과제-행동-결과)을 바탕으로 작성해보세요.</span>
              <span className="sm:hidden">팁: STAR 기법으로 디테일하게 기재하세요.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{inputAnswer.length} 자</span>
            <button
              id="send-answer-btn"
              type="submit"
              disabled={!inputAnswer.trim() || isGenerating}
              className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:bg-white/5 disabled:text-slate-500 flex items-center gap-1.5 cursor-pointer transition-all shadow shadow-blue-500/20 active:scale-95"
              title="전송"
            >
              <span className="text-xs">Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>

      {/* 커스텀 조기 종료 및 분석 대기 모달 */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* 모달 박스 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">모의면접 조기 종료 및 분석</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    현재 대화 기록까지만 저장하고 AI 분석 및 평가를 시작합니다.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/2 rounded-xl p-3.5 mb-5 border border-white/5 space-y-2 text-xs text-slate-300">
                <p>💡 <span className="text-slate-200 font-semibold">참고사항:</span></p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>지금까지 주고받은 {messages.length}개의 대화를 기반으로 종합 면접 피드백 리포트가 생성됩니다.</li>
                  <li>모드가 즉시 평가 모드로 전환되며 추가 답변은 불가능합니다.</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  취소 (면접 계속하기)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onForceFeedback();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-500/15 border border-red-500/30 transition-all cursor-pointer"
                >
                  면접 종료하고 분석받기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
