
import React from 'react';

export enum ViewState {
  HOME = 'HOME',
  LESSON_HUB = 'LESSON_HUB',
  LESSON_DETAIL = 'LESSON_DETAIL',
  CHAT = 'CHAT',
  IMAGE_ANALYZE = 'IMAGE_ANALYZE'
}

export type Language = 'en' | 'he' | 'es' | 'ru' | 'ar';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type LessonCategory = 'AI_BASICS' | 'INTERNET_SKILLS' | 'SAFETY';

export interface LessonStep {
  title: string;
  content: string;
  interactiveType?: 'SIMULATED_EMAIL' | 'SIMULATED_SEARCH' | 'SIMULATED_VIDEO_CALL' | 'SECURE_CHECKOUT' | 'SIMULATED_QR' | 'SIMULATED_VOICE' | 'SIMULATED_MAP' | 'QUIZ' | 'INFO';
  interactiveData?: any;
}

export interface Lesson {
  id: string;
  category: LessonCategory;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  steps: LessonStep[];
}

export interface UserProgress {
  completedLessonIds: string[];
  selectedInterests: LessonCategory[];
  preferredLanguage: Language;
}

export type ImageSize = '1K' | '2K' | '4K';
