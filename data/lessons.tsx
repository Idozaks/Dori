
import React from 'react';
import { Lesson, Language, LessonCategory } from '../types';
import { Mail, Search, ShieldCheck, Cpu, Map as MapIcon, Video, QrCode, Mic, Zap, Radio, Eye, Lock, ShoppingCart, Ghost, Users, Navigation, Bus, MessageSquare, Phone, Sparkles, Utensils, Image as ImageIcon, Wand2, FileText, Star, Package, Book, Ticket, Globe, Camera, CreditCard, Heart, MessageCircleMore, ShieldAlert, Pill, Headphones, Gift, Calendar, UserCheck, Phone as PhoneIcon, Truck, MessageCircle, Info, HelpCircle, ClipboardCheck, Cloud, Layout, MousePointer2 } from 'lucide-react';

// Helper function to extract the correct string for the given language.
export const localize = (textMap: Record<string, string> | string, lang: Language): string => {
  if (typeof textMap === 'string') {
    return textMap;
  }
  return textMap[lang] || textMap['en'] || '';
};

// Helper to localize common interactiveData fields.
const localizeInteractiveData = (data: any, lang: Language): any => {
  if (!data) return data;
  const localized = { ...data };
  if (localized.placeholder && typeof localized.placeholder === 'object') {
    localized.placeholder = localize(localized.placeholder, lang);
  }
  if (localized.suggestions && Array.isArray(localized.suggestions)) {
    localized.suggestions = localized.suggestions.map((s: any) => typeof s === 'object' ? localize(s, lang) : s);
  }
  if (localized.question && typeof localized.question === 'object') {
    localized.question = localize(localized.question, lang);
  }
  if (localized.options && Array.isArray(localized.options)) {
    localized.options = localized.options.map((o: any) => typeof o === 'object' ? localize(o, lang) : o);
  }
  if (localized.response && typeof localized.response === 'object') {
    localized.response = localize(localized.response, lang);
  }
  if (localized.commands && Array.isArray(localized.commands)) {
    localized.commands = localized.commands.map((c: any) => typeof c === 'object' ? localize(c, lang) : c);
  }
  if (localized.targets && Array.isArray(localized.targets)) {
    localized.targets = localized.targets.map((t: any) => ({
      ...t,
      label: typeof t.label === 'object' ? localize(t.label, lang) : t.label
    }));
  }
  if (localized.actions && Array.isArray(localized.actions)) {
    localized.actions = localized.actions.map((action: any) => ({
      ...action,
      label: typeof action.label === 'object' ? localize(action.label, lang) : action.label,
      overlayTitle: typeof action.overlayTitle === 'object' ? localize(action.overlayTitle, lang) : action.overlayTitle,
      overlayContent: typeof action.overlayContent === 'object' ? localize(action.overlayContent, lang) : action.overlayContent,
    }));
  }
  return localized;
};

const findCategoryIcon = (category: LessonCategory) => {
  switch (category) {
    case 'AI_BASICS': return <Cpu size={20} />;
    case 'INTERNET_SKILLS': return <Navigation size={20} />;
    case 'SAFETY': return <ShieldCheck size={20} />;
    case 'LIFE_ADMIN': return <ClipboardCheck size={20} />;
    default: return <Book size={20} />;
  }
};

export const getLocalizedCategories = (lang: Language) => {
  const categories = {
    AI_BASICS: {
      id: 'AI_BASICS' as LessonCategory,
      label: { en: 'AI Basics', he: 'יסודות AI' }[lang] || 'AI Basics',
      icon: <Cpu size={20} className="text-purple-600" />,
      color: 'bg-purple-100',
    },
    INTERNET_SKILLS: {
      id: 'INTERNET_SKILLS' as LessonCategory,
      label: { en: 'Internet Skills', he: 'כישורי אינטרנט' }[lang] || 'Internet Skills',
      icon: <Navigation size={20} className="text-blue-600" />,
      color: 'bg-blue-100',
    },
    SAFETY: {
      id: 'SAFETY' as LessonCategory,
      label: { en: 'Online Safety', he: 'בטיחות ברשת' }[lang] || 'Online Safety',
      icon: <ShieldCheck size={20} className="text-emerald-600" />,
      color: 'bg-emerald-100',
    },
    LIFE_ADMIN: {
      id: 'LIFE_ADMIN' as LessonCategory,
      label: { en: 'Life Admin', he: 'ניהול חיים' }[lang] || 'Life Admin',
      icon: <ClipboardCheck size={20} className="text-orange-600" />,
      color: 'bg-orange-100',
    },
  };
  return Object.values(categories);
};

export const getLocalizedLessons = (lang: Language): Lesson[] => {
  const allLessonsData = [
    {
      id: 'internet-basics',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Browsing the Web', he: 'גלישה באינטרנט' },
      shortDesc: { en: 'Tabs, URLs, and Navigation made simple.', he: 'טאבים, כתובות וניווט - בצורה פשוטה.' },
      icon: <Globe size={20} />,
      steps: [
        {
          title: { en: 'The Browser Window', he: 'חלון הדפדפן' },
          content: { en: 'The browser is your window to the internet. Think of it like a library where every book is a website.', he: 'הדפדפן הוא החלון שלכם לאינטרנט. חשבו עליו כעל ספרייה שבה כל ספר הוא אתר.' },
        },
        {
          title: { en: 'Address Bar & URLs', he: 'שורת הכתובת' },
          content: { en: 'The bar at the top is for the "Address". It tells the computer exactly where to go.', he: 'השורה למעלה מיועדת ל"כתובת". היא אומרת למחשב בדיוק לאן ללכת.' },
          interactiveType: 'SIMULATED_BROWSER',
        }
      ]
    },
    {
      id: 'bureaucracy-lesson',
      category: 'LIFE_ADMIN' as LessonCategory,
      title: { en: 'Decoding Official Letters', he: 'פענוח מכתבים רשמיים' },
      shortDesc: { en: 'Understand complex mail and legal jargon using AI.', he: 'הבינו מכתבים מורכבים וז׳רגון משפטי בעזרת AI.' },
      icon: <ClipboardCheck size={20} />,
      steps: [
        {
          title: { en: 'The Jargon Barrier', he: 'מחסום הז׳רגון' },
          content: { en: 'Official letters often use difficult words to explain simple things. Dori can translate these into plain language.', he: 'מכתבים רשמיים משתמשים לעיתים קרובות במילים קשות כדי להסביר דברים פשוטים. דורי יכולה לתרגם אותם לשפה פשוטה.' },
        },
        {
          title: { en: 'Try Decoding a Letter', he: 'נסו לפענח מכתב' },
          content: { en: 'Scan this simulated letter to see Dori break it down into a simple checklist.', he: 'סרקו את המכתב הסימולטיבי הזה כדי לראות את דורי מפרקת אותו לרשימת משימות פשוטה.' },
          interactiveType: 'SIMULATED_BUREAUCRACY',
          interactiveData: {
            backgroundPrompt: "A clean minimalist graphic illustration of an official document. Flat design, high contrast, clearly legible text, vibrant header, white paper background.",
          }
        },
      ]
    },
    {
      id: 'spotting-scams',
      category: 'SAFETY' as LessonCategory,
      title: { en: 'Spotting Scams', he: 'זיהוי הונאות' },
      shortDesc: { en: 'Identify fake messages and AI fakes.', he: 'זהו הודעות מזויפות וזיופי AI.' },
      icon: <ShieldAlert size={20} />,
      steps: [
        { title: { en: 'Detectives', he: 'בלשים' }, content: { en: 'Learn how to spot digital tricks.', he: 'למדו לזהות טריקים דיגיטליים.' } },
        { title: { en: 'Is it Real?', he: 'זה אמיתי?' }, content: { en: 'Move the lens to find AI mistakes.', he: 'הזיזו את העדשה למציאת טעויות AI.' }, interactiveType: 'SIMULATED_LENS', interactiveData: { backgroundPrompt: "A photo of people where one person has 6 fingers and the clock is warped.", targets: [{ x: 30, y: 55, label: { en: 'AI Error!', he: 'טעות AI!' } }] } },
      ],
    },
    {
      id: 'qr-codes',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Scanning QR Codes', he: 'סריקת קודי QR' },
      shortDesc: { en: 'Master menus, tickets, and tracking.', he: 'שלטו בתפריטים, כרטיסים ומעקב.' },
      icon: <QrCode size={20} />,
      steps: [
        { title: { en: 'Scan', he: 'סריקה' }, content: { en: 'QR codes are smart barcodes you scan with your camera.', he: 'קודי QR הם ברקודים חכמים שסורקים עם המצלמה.' } },
        { title: { en: 'Practice', he: 'תרגול' }, content: { en: 'Try scanning the code on this table.', he: 'נסו לסרוק את הקוד על השולחן.' }, interactiveType: 'SIMULATED_QR', interactiveData: { backgroundPrompt: "A minimalist vector illustration of a restaurant table with a QR code.", actions: [{ id: 'MENU', label: { en: 'Menu', he: 'תפריט' }, overlayTitle: { en: 'Specials', he: 'מיוחדים' }, overlayContent: { en: 'Delicious food here!', he: 'אוכל טעים כאן!' } }] } }
      ]
    }
  ];

  return allLessonsData.map(lesson => ({
    ...lesson,
    title: localize(lesson.title, lang),
    shortDesc: localize(lesson.shortDesc, lang),
    steps: lesson.steps.map(step => ({
      ...step,
      title: localize(step.title, lang),
      content: localize(step.content, lang),
      interactiveData: localizeInteractiveData(step.interactiveData, lang)
    }))
  }));
};
