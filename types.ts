
import React from 'react';

export enum ViewState {
  LANDING = 'LANDING',
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  LESSON_HUB = 'LESSON_HUB',
  LESSON_DETAIL = 'LESSON_DETAIL',
  CHAT = 'CHAT',
  IMAGE_ANALYZE = 'IMAGE_ANALYZE',
  VOICE_BUDDY = 'VOICE_BUDDY',
  BUREAUCRACY_TRANSLATOR = 'BUREAUCRACY_TRANSLATOR'
}

export type Language = 'en' | 'he' | 'es' | 'ru' | 'ar';

export interface AccessibilitySettings {
  voiceGuidance: boolean;
  highContrast: boolean;
  extraLargeText: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingUrls?: { uri: string; title?: string }[];
}

export type LessonCategory = 'AI_BASICS' | 'INTERNET_SKILLS' | 'SAFETY' | 'LIFE_ADMIN';

export interface LessonStep {
  title: string;
  content: string;
  interactiveType?: 'SIMULATED_EMAIL' | 'SIMULATED_SEARCH' | 'SIMULATED_VIDEO_CALL' | 'SECURE_CHECKOUT' | 'SIMULATED_QR' | 'SIMULATED_VOICE' | 'SIMULATED_MAP' | 'QUIZ' | 'INFO' | 'SIMULATED_LENS' | 'SIMULATED_SOCIAL' | 'SIMULATED_BUS_PAYMENT' | 'LIVE_AI_CHAT' | 'SIMULATED_IMAGE_GENERATION' | 'SIMULATED_IMAGE_EDITING' | 'SIMULATED_PHOTO_JOURNEY' | 'SIMULATED_PHARMACY' | 'LIVE_VIDEO_CHAT' | 'SIMULATED_APP_TOUR' | 'SIMULATED_BUREAUCRACY' | 'SIMULATED_BROWSER';
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

export interface UserAccount {
  id: string;
  name: string;
  avatar: string;
  completedLessonIds: string[];
  selectedInterests: LessonCategory[];
  preferredLanguage: Language;
}

export interface UserProgress {
  accounts: UserAccount[];
  currentAccountId: string | null;
  isAuthenticated: boolean;
}

export type ImageSize = '1K' | '2K' | '4K';

export type TTSVoiceName = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';

export type CachedImageMap = Record<string, string | null>;
