import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare, Flame, BarChart3, ArrowRight } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  return (
    <div id="home-view" className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen AI Mock Interviewer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight"
        >
          합격을 부르는 <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
            AI 맞춤형 면접 시뮬레이터
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          자신의 이력서와 희망하는 채용공고만 입력하세요. 가상의 AI 면접관과 실제 면접장의 긴밀한 호흡을 고도화된 대화형 스타일로 시뮬레이션하고 상세한 진단 보고서를 제공합니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6"
        >
          <button
            id="start-session-btn"
            onClick={onStart}
            className="group px-8 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] flex items-center gap-2.5 mx-auto cursor-pointer"
          >
            면접 시작하기
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Feature cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
      >
        <div id="feat-customized" className="p-6 rounded-2xl glass-card hover:translate-y-[-2px] transition-all duration-350">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">이력서 & 채용공고 분석</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            업로드된 이력서의 세부 경력과 채용 공고의 요구 역량을 결합하여 오직 당신만을 위한 직무 밀착형 질문을 도출합니다.
          </p>
        </div>

        <div id="feat-styles" className="p-6 rounded-2xl glass-card hover:translate-y-[-2px] transition-all duration-350">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">두 가지 면접관 스타일</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            다정하게 이끌어주는 <strong>Friendly</strong> 스타일과 논리 공백을 집요하게 파고드는 매서운 <strong>Pressure</strong> 압박 면접을 선택해보세요.
          </p>
        </div>

        <div id="feat-feedback" className="p-6 rounded-2xl glass-card hover:translate-y-[-2px] transition-all duration-350">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI 정밀 피드백 보고서</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            전체 면접 결과를 다차원 분석하여 강점, 개선점, 그리고 더 나은 경쟁력을 증명하는 구체적인 대안 문장(STAR 기법)을 함께 처방합니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
