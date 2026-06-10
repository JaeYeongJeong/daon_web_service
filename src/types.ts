export type InterviewModel = 'friendly' | 'pressure';

export interface InterviewSessionConfig {
  user_id: string;
  model: InterviewModel;
  job_role: string;
  question_count: number;
  resume_text: string;
  job_post_text: string;
}

export interface ChatMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

export interface InterviewSession {
  session_id: string;
  user_id: string;
  model: InterviewModel;
  job_role: string;
  question_count: number;
  resume_text: string;
  job_post_text: string;
  current_question_index: number;
  messages: ChatMessage[];
  status: 'created' | 'interview' | 'feedback_done';
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    overall: string;
    improved_examples: {
      original: string;
      improved: string;
      rationale: string;
    }[];
    raw_markdown?: string;
  };
}

export interface SessionResponse {
  session_id: string;
}

export interface StartResponse {
  question: string;
}

export interface AnswerRequest {
  answer: string;
  model: InterviewModel;
}

export interface AnswerResponse {
  status: string;
  next_question?: string;
  model?: InterviewModel;
  answer?: string; // Contains structured or raw feedback text when status is feedback_done
  feedback?: string;
}
