import React, { useState } from 'react';
import { motion } from 'motion/react';
import { InterviewModel, InterviewSessionConfig } from '../types';
import { Users2, ShieldAlert, Sparkles, AlertCircle, FileText, Briefcase } from 'lucide-react';

interface SessionConfigProps {
  onBack: () => void;
  onSubmit: (config: InterviewSessionConfig) => void;
  isSubmitting: boolean;
}

// Templates to speed up testing & preview
const PRESET_TEMPLATES = [
  {
    label: "Frontend 개발자",
    role: "Frontend Developer",
    resume: `[인적 사항]
홍길동 (gildong@email.com)
웹 프론트엔드 엔지니어 (경력 2년)

[기술 스택]
React (Hooks, Context API, Redux Toolkit), TypeScript, Next.js, TailwindCSS, Jest

[주요 프로젝트]
1. 사내 통합 어드민 대시보드 구축 (2025.01 - 2025.05)
- 역할: 프론트엔드 메인 개발 (기여도 80%)
- 성과: 컴포넌트 표준 디자인 시스템을 구축하여 개발 선행 시간을 단축하고, React-Query 도입으로 무분별한 API 호출을 방지하여 서버 비용 20% 절감.
- 극복 경험: 웹 브라우저 메모리 누수로 대시보드 차트 렌더링이 느려지던 문제 해결. 크롬 개발자 도구의 성능 프로파일러를 사용해 가상 메모리 차이점을 파악했고, 메모리에 누적되던 타이머 콜백과 리사이즈 핸들러를 useEffect 내부에서 정확히 정리하여 성능 안정성 회복.`,
    jobPost: `[채용 직무]
프론트엔드 React 엔지니어 신입/경력 채용

[자격 요건]
- React 및 고품질 TypeScript 실무 역량을 가지신 분
- 웹 성능 개선 및 프론트엔드 상태 관리에 깊은 문제 해결 감각을 가지신 분
- UI 구성 컴포넌트를 모듈러 방식으로 제작하고 타 부서와 영리한 협업 노하우가 있는 분

[우대 사항]
- 가상 메모리 릭 해결 혹은 렌더 프로파일링 최적화 경험
- 지속 가능한 웹앱 제품 상용 론칭 이력이 있는 분`
  },
  {
    label: "ICT 서비스 기획자",
    role: "ICT Service Planner",
    resume: `[인적 사항]
이지현 (jihyeon@email.com)
ICT 비즈니스 및 웹 서비스 기획자 (경력 3년)

[핵심 역량]
서비스 요구사항 명세화(PRD), 데이터 기반 서비스 지표 분석, 모바일 UI/UX IA 및 와이어프레임 설계, 크로스오버 협업 조율

[주요 성과]
1. 소상공인 O2O 매칭 플랫폼 리뉴얼 및 기능 확장 (2024.03 - 2024.11)
- 성과: 이탈률이 높은 결제 진입점을 분석하여 불필요한 약관 동의 Depth를 줄이고 원클릭 카드결제를 제안. 리뉴얼 후 결제 전환율(CVR) 18% 수치 개선 달성.
- 갈등 극복: 모듈 리팩토링 공수로 마찰을 빚은 개발 파트 팀원들과 지표 결과를 바탕으로 한 점진적 적용 타협안을 명문화하여 데드라인 유연 완수.`,
    jobPost: `[모집 분야]
ICT 신사업 기획 및 서비스 기획 담당자 (경력)

[업무 내용]
- 시장 요구사항 발굴 및 핵심 유저 스토리보드 설계 (PRD 작성)
- 비즈니스 부서와 개발 그룹 간의 완벽한 얼라인먼트 및 커뮤니케이션 조율
- 정량 데이터 검증 기반의 기능 고도화

[우대 역량]
- 데이터 로그 설계 및 전환율 타깃팅 최적화 성과를 보유한 분`
  }
];

export default function SessionConfig({ onBack, onSubmit, isSubmitting }: SessionConfigProps) {
  const [model, setModel] = useState<InterviewModel>('friendly');
  const [jobRole, setJobRole] = useState('Frontend');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [resumeText, setResumeText] = useState('');
  const [jobPostText, setJobPostText] = useState('');

  const handleApplyPreset = (tmpl: typeof PRESET_TEMPLATES[0]) => {
    setJobRole(tmpl.role);
    setResumeText(tmpl.resume);
    setJobPostText(tmpl.jobPost);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim()) return;
    
    onSubmit({
      user_id: "user_001",
      model,
      job_role: jobRole,
      question_count: questionCount,
      resume_text: resumeText,
      job_post_text: jobPostText
    });
  };

  return (
    <div id="session-config-view" className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 메인으로 돌아가기
          </button>
          <h2 className="text-2xl font-bold text-white mt-1">면접 설정</h2>
          <p className="text-sm text-slate-400 mt-0.5">이력서와 채용 공고를 입력하여 질문을 설계하세요.</p>
        </div>

        {/* Templates dropdown bar */}
        <div id="presets-container" className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-xs text-slate-500 font-medium">체험 템플릿 자동완성:</span>
          <div className="flex gap-1">
            {PRESET_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(tmpl)}
                className="px-2.5 py-1 text-xs font-semibold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-blue-400 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Style selection */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <label className="text-sm font-semibold text-slate-200 block">면접관 스타일 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Friendly Choice */}
            <button
              id="model-friendly-btn"
              type="button"
              onClick={() => setModel('friendly')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                model === 'friendly'
                  ? 'bg-blue-500/10 border-blue-500 text-white ring-1 ring-blue-500/30'
                  : 'bg-white/2 border-white/5 text-slate-400 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${model === 'friendly' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Friendly (공감형)</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    따뜻하고 부드러운 화법의 면접관입니다. 지원자의 성과에 공감하고, 편안한 대화를 통해 잠재 가치와 강점을 차분히 끌어내도록 돕습니다.
                  </p>
                </div>
              </div>
            </button>

            {/* Pressure Choice */}
            <button
              id="model-pressure-btn"
              type="button"
              onClick={() => setModel('pressure')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                model === 'pressure'
                  ? 'bg-red-500/10 border-red-500 text-white ring-1 ring-red-500/30'
                  : 'bg-white/2 border-white/5 text-slate-400 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${model === 'pressure' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-500'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Pressure (압박 면접형)</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    엄격하고 까다로운 실무 면접관입니다. 이력서 상의 논리 누락이나 정량 지표의 누락을 매섭게 캐묻고 차가운 눈높이의 반론식 심층 검증을 가성비 있게 전개합니다.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="job-role-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              지원 직무
            </label>
            <input
              id="job-role-input"
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="예) Frontend, Backend, ICT 기획자"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-slate-100 placeholder-slate-500 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">질문 개수 설정</label>
            <div id="q-count-btn-group" className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              {[3, 5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-1.5 text-xs font-medium rounded-lg text-center transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-blue-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {count}개
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="resume-textarea" className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              이력서 입력
            </label>
            <span className="text-[11px] text-slate-500">{resumeText.length} 자</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">본인의 주요 이력과 프로젝트 성과, 사용 기술 스택을 적어주세요. 디테일할수록 날카로운 질문이 제공됩니다.</p>
          <textarea
            id="resume-textarea"
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={`기술 블로그 링크, 학업 이력, 프로젝트 담당 파트와 핵심 문제 해결 성과를 자유롭게 작성해 주십시오.`}
            className="w-full p-4 rounded-xl bg-black/40 border border-white/5 text-slate-200 placeholder-slate-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all font-mono leading-relaxed"
          />
        </div>

        {/* Job Post Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="jobpost-textarea" className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              채용공고 입력 (선택사항)
            </label>
            <span className="text-[11px] text-slate-500">{jobPostText.length} 자</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">지원할 회사의 우대 사항과 자격 요건을 기입하면, 해당 공고의 예상 부합도를 심사하는 전략 질문을 출제합니다.</p>
          <textarea
            id="jobpost-textarea"
            rows={4}
            value={jobPostText}
            onChange={(e) => setJobPostText(e.target.value)}
            placeholder="상세한 자격요건, 우대 사항, 인재상 등 채용 요강 텍스트를 기입해 주십시오."
            className="w-full p-4 rounded-xl bg-black/40 border border-white/5 text-slate-200 placeholder-slate-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all font-mono leading-relaxed"
          />
        </div>

        {/* Start button */}
        <div className="pt-4">
          <button
            id="submit-interview-cfg-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 text-white transition-all disabled:text-slate-500 flex items-center justify-center gap-2 text-base cursor-pointer shadow-lg shadow-blue-500/15"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>AI 면접관 세션 준비 및 질문 설계 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white" />
                <span>면접관 입장 및 면접 시작</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
