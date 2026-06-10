import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, HelpCircle, ArrowRight, RotateCcw, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface FeedbackResultProps {
  feedbackText: string;
  onRestart: () => void;
}

export default function FeedbackResult({ feedbackText, onRestart }: FeedbackResultProps) {
  // Simple yet highly robust regex parser to slice up the template headers safely
  const parseSections = (text: string) => {
    const defaultResult = {
      greeting: "수고하셨습니다. 면접이 종료되었습니다.",
      strengths: "",
      weaknesses: "",
      overall: "",
      examples: ""
    };

    if (!text) return defaultResult;

    // Split text into lines to perform structured scanning
    const lines = text.split('\n');
    let currentSection: 'greeting' | 'strengths' | 'weaknesses' | 'overall' | 'examples' = 'greeting';
    
    const sections = {
      greeting: [] as string[],
      strengths: [] as string[],
      weaknesses: [] as string[],
      overall: [] as string[],
      examples: [] as string[]
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('[강점]')) {
        currentSection = 'strengths';
        continue;
      } else if (trimmed.includes('[개선점]') || trimmed.includes('[단점]')) {
        currentSection = 'weaknesses';
        continue;
      } else if (trimmed.includes('[총평]')) {
        currentSection = 'overall';
        continue;
      } else if (trimmed.includes('[개선 예시]') || trimmed.includes('[개선예시]') || trimmed.includes('[답변 개선]')) {
        currentSection = 'examples';
        continue;
      } else if (trimmed.startsWith('### 수고하셨습니다') || trimmed.startsWith('## 수고하셨습니다') || (trimmed.includes('수고하셨습니다') && line.includes('###'))) {
        currentSection = 'greeting';
        sections.greeting.push(line);
        continue;
      }

      sections[currentSection].push(line);
    }

    return {
      greeting: sections.greeting.join('\n').trim() || "수고하셨습니다. 면접을 마치겠습니다.",
      strengths: sections.strengths.join('\n').trim(),
      weaknesses: sections.weaknesses.join('\n').trim(),
      overall: sections.overall.join('\n').trim(),
      examples: sections.examples.join('\n').trim()
    };
  };

  const parsed = parseSections(feedbackText);

  // Helper to strip markdown symbols for clean display when rendering plain text
  const cleanMarkdown = (txt: string) => {
    return txt
      .replace(/^[\s#*-]+/gm, '') // remove markdown lists and headers
      .replace(/\*\*/g, '')      // remove bold markers
      .trim();
  };

  // Turn basic lists or paragraphs of text into elements
  const renderListOrParagraphs = (rawText: string) => {
    if (!rawText) return <p className="text-slate-400 text-xs">상세 항목이 기록되지 않았습니다.</p>;
    
    const elements = rawText.split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    return (
      <ul className="space-y-3">
        {elements.map((item, i) => {
          const isListItem = item.startsWith('-') || item.startsWith('*') || item.startsWith('1.') || item.startsWith('2.') || item.startsWith('3.');
          const cleaned = isListItem ? cleanMarkdown(item) : item;
          
          return (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span>{cleaned}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div id="feedback-view" className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Intro Header Card - Styled with frosted glass effects */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 mb-8 shadow-xl"
      >
        <div className="absolute top-0 right-0 p-8 text-blue-500/5 shrink-0 pointer-events-none hidden sm:block">
          <Award className="w-40 h-40" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI 맞춤형 진단 피드백 보고서</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            수고하셨습니다. 면접을 마치겠습니다.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {parsed.greeting ? cleanMarkdown(parsed.greeting) : "이력서와 면접 전 과정의 대응 답변을 종합 분석한 실무 역량 보고서를 도출했습니다. 다음 항목들을 꼼꼼하게 검토하여 나만의 면접 합격 로드맵을 설계하세요."}
          </p>
        </div>
      </motion.div>

      {/* Bento Layout Grid for Feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        
        {/* Left Col: Strengths Card (Blue scale) */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 hover:border-blue-500/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">[강점] (Strengths)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">면접관이 높게 순위를 책정한 핵심 우수 소양</p>
            </div>
          </div>
          {renderListOrParagraphs(parsed.strengths)}
        </motion.div>

        {/* Right Col: Improvement Areas Card (Orange tone) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 hover:border-orange-500/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">[개선점] (Areas to Improve)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">답변 구조의 논리성 및 정량 백업을 위한 추천 제언</p>
            </div>
          </div>
          {renderListOrParagraphs(parsed.weaknesses)}
        </motion.div>
      </div>

      {/* Main Overall Summary Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">[총평] (Overall Evaluation)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">실무 적합도 및 면접 페이스메이킹 종합 소견</p>
          </div>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
          {parsed.overall ? cleanMarkdown(parsed.overall) : "귀하가 제공한 이력 요소와 실시간 대화 피드백 결과를 종합한 평정 소견입니다."}
        </div>
      </motion.div>

      {/* Advanced Examples Optimization Block */}
      {parsed.examples && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">[개선 예시] (Actionable Frameworks)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">실제 본인의 기입 내용을 정형화된 STAR 공식으로 교정한 추천 예시</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed">
            <div className="bg-black/35 rounded-xl p-4 border border-white/5 font-mono text-xs overflow-x-auto text-slate-300 whitespace-pre-wrap leading-relaxed">
              {parsed.examples}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action panel to restart or download */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
        <button
          id="restart-interview-btn"
          onClick={onRestart}
          className="group px-6 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 text-sm w-full sm:w-auto cursor-pointer duration-200 hover:scale-[1.01]"
        >
          <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
          처음부터 다시 시뮬레이션하기
        </button>
      </div>
    </div>
  );
}
