
import React from 'react';
import { Lesson, Language, LessonCategory } from '../types';
import { Mail, Search, ShieldCheck, Cpu, Map, Video, Fingerprint, QrCode, Mic, MousePointer2, Zap, Radio, Eye, Lock, ShoppingCart, Ghost } from 'lucide-react';

export const getLocalizedLessons = (lang: Language): Lesson[] => {
  const content: Record<Language, Lesson[]> = {
    en: [
      {
        id: 'ai-lens-1',
        category: 'AI_BASICS',
        title: 'The Magic Eye',
        shortDesc: 'Use your phone to identify anything in the real world.',
        icon: <Eye size={24} />,
        steps: [
          {
            title: "Your Phone can 'See'",
            content: "Modern AI can look through your camera and tell you exactly what it's seeing. It's like having an expert in your pocket for plants, landmarks, or even foreign languages.",
            interactiveType: 'INFO'
          },
          {
            title: "Practice Scanning",
            content: "Try dragging your phone over the scene. Hover over the flower or the bird to see what the AI discovers!",
            interactiveType: 'SIMULATED_LENS',
            interactiveData: {
              backgroundPrompt: "Vibrant Kurzgesagt style vector illustration of a lush garden with a giant colorful flower and a floating robot bird. Flat design, bold saturated colors, high contrast.",
              targets: [
                { x: 30, y: 40, label: "Magnolia Flower", desc: "A beautiful spring bloom." },
                { x: 70, y: 60, label: "Dori Bird", desc: "Your helpful AI assistant!" }
              ]
            }
          }
        ]
      },
      {
        id: 'ai-intro-1',
        category: 'AI_BASICS',
        title: 'What is AI, anyway?',
        shortDesc: 'Think of AI as a helpful, digital student that learns from examples.',
        icon: <Cpu size={24} />,
        steps: [
          {
            title: "The Digital Helper",
            content: "Artificial Intelligence (AI) isn't a robot from a movie. It's more like a very fast student. Just like you learned to recognize a cat by seeing many cats, AI looks at millions of pictures to learn what a cat looks like.",
            interactiveType: 'INFO'
          },
          {
            title: "Recommendation Engines",
            content: "Ever wonder how Netflix knows you like detective movies? That's an AI 'Recommendation Engine'. It's like a shopkeeper who remembers everything you've ever bought and suggests things you might like next.",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "If an AI notices you always read recipes for pie, what will it likely suggest next?",
              options: ["Car repair manuals", "A new cake recipe", "A history book about wars"],
              correctIndex: 1
            }
          }
        ]
      },
      {
        id: 'internet-search-1',
        category: 'INTERNET_SKILLS',
        title: 'Searching the Web',
        shortDesc: 'Learn how to find any information in seconds.',
        icon: <Search size={24} />,
        steps: [
          {
            title: "Ask the World",
            content: "Google is like a massive library where you can ask any question. Instead of looking through books, you just type a few keywords.",
            interactiveType: 'INFO'
          },
          {
            title: "Finding Local Help",
            content: "If you need a plumber, you don't just type 'help'. You type 'plumber near me'. Practice typing that below to see how it works.",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: {
              placeholder: "plumber near me",
              targetKeywords: ["plumber", "near", "me", "repair"]
            }
          }
        ]
      },
      {
        id: 'internet-qr-1',
        category: 'INTERNET_SKILLS',
        title: 'QR Codes: The Magic Square',
        shortDesc: 'Scan those black and white squares to see menus or websites.',
        icon: <QrCode size={24} />,
        steps: [
          {
            title: "What is a QR Code?",
            content: "You see them everywhere—on restaurant tables, magazines, and even at the doctor's office. It's a special code that your phone's camera can read to take you directly to a website without typing.",
            interactiveType: 'INFO'
          },
          {
            title: "Practice Scanning",
            content: "Pretend your phone is a scanner. Move the square on your screen over the QR code to 'read' the menu!",
            interactiveType: 'SIMULATED_QR',
            interactiveData: {
              target: 'Restaurant Menu'
            }
          }
        ]
      },
      {
        id: 'safety-shopping-1',
        category: 'SAFETY',
        title: 'Safe Online Shopping',
        shortDesc: 'How to buy things online without worrying.',
        icon: <ShoppingCart size={24} />,
        steps: [
          {
            title: "Look for the Lock",
            content: "When you are about to pay for something, look at the top of your screen. You should see a little 'Padlock' icon. This means your credit card information is being scrambled so thieves can't read it.",
            interactiveType: 'INFO'
          },
          {
            title: "A Secure Checkout",
            content: "Let's practice a safe checkout. Notice the padlock and the 'https' in the address bar below. Go ahead and 'complete' the purchase!",
            interactiveType: 'SECURE_CHECKOUT'
          }
        ]
      },
      {
        id: 'safety-scams-1',
        category: 'SAFETY',
        title: 'Spotting the "Fake"',
        shortDesc: 'Protect yourself from tricky emails and messages.',
        icon: <Ghost size={24} />,
        steps: [
          {
            title: "Urgent! Is it real?",
            content: "Scammers often try to make you panic. They might say your bank account is closed or you won a prize. Real banks will almost never ask for your password via email.",
            interactiveType: 'INFO'
          },
          {
            title: "Spot the Mistake",
            content: "Look at this email: 'Dear Valued Customeer, your account at BankOfAmerrica has been hacked! Click here to fix it immediately.' What looks suspicious?",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "What is the biggest red flag in that message?",
              options: ["The friendly greeting", "The spelling mistakes and urgency", "The blue color of the text"],
              correctIndex: 1
            }
          }
        ]
      }
    ],
    he: [
      {
        id: 'ai-lens-1',
        category: 'AI_BASICS',
        title: 'עין הקסם',
        shortDesc: 'השתמשו בטלפון כדי לזהות כל דבר בעולם האמיתי.',
        icon: <Eye size={24} />,
        steps: [
          {
            title: "הטלפון שלכם יכול 'לראות'",
            content: "בינה מלאכותית מודרנית יכולה להסתכל דרך המצלמה שלכם ולהגיד לכם בדיוק מה היא רואה. זה כמו שיהיה לכם מומחה בכיס לצמחים, אתרים היסטוריים או אפילו שפות זרות.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול סריקה",
            content: "נסו לגרור את הטלפון מעל הסצנה. עמדו מעל הפרח או הציפור כדי לראות מה ה-AI מגלה!",
            interactiveType: 'SIMULATED_LENS',
            interactiveData: {
              backgroundPrompt: "Vibrant Kurzgesagt style vector illustration of a lush garden with a giant colorful flower and a floating robot bird. Flat design, bold saturated colors, high contrast.",
              targets: [
                { x: 30, y: 40, label: "פרח מגנוליה", desc: "פריחה אביבית יפהפייה." },
                { x: 70, y: 60, label: "הציפור דורי", desc: "עוזר ה-AI האישי שלכם!" }
              ]
            }
          }
        ]
      },
      {
        id: 'ai-intro-1',
        category: 'AI_BASICS',
        title: 'מה זה בעצם בינה מלאכותית?',
        shortDesc: 'חשבו על בינה מלאכותית כתלמיד דיגיטלי שעוזר לכם ולומד מדוגמאות.',
        icon: <Cpu size={24} />,
        steps: [
          {
            title: "העוזר הדיגיטלי",
            content: "בינה מלאכותית (AI) היא לא רובוט מסרט. היא יותר כמו תלמיד מהיר מאוד. בדיוק כפי שלמדתם לזהות חתול על ידי ראיית חתולים רבים, ה-AI מסתכל על מיליוני תמונות כדי ללמוד איך חתול נראה.",
            interactiveType: 'INFO'
          },
          {
            title: "מנועי המלצות",
            content: "תהיתם פעם איך נטפליקס יודעת שאתם אוהבים סרטי בלשים? זהו 'מנוע המלצות' של בינה מלאכותית. זה כמו מוכר בחנות שזוכר כל מה שקניתם ומציע דברים שתאהבו.",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "אם בינה מלאכותית שמה לב שאתם תמיד קוראים מתכונים לעוגות, מה היא כנראה תציע לכם אחר כך?",
              options: ["מדריך לתיקון רכב", "מתכון לעוגה חדשה", "ספר היסטוריה על מלחמות"],
              correctIndex: 1
            }
          }
        ]
      },
      {
        id: 'internet-search-1',
        category: 'INTERNET_SKILLS',
        title: 'חיפוש באינטרנט',
        shortDesc: 'למדו איך למצוא כל מידע בשניות.',
        icon: <Search size={24} />,
        steps: [
          {
            title: "לשאול את העולם",
            content: "גוגל הוא כמו ספרייה ענקית שבה אפשר לשאול כל שאלה. במקום לדפדף בספרים, פשוט מקלידים כמה מילות מפתח.",
            interactiveType: 'INFO'
          },
          {
            title: "מציאת עזרה מקומית",
            content: "אם אתם צריכים אינסטלטור, אתם לא מקלידים רק 'עזרה'. אתם מקלידים 'אינסטלטור קרוב אלי'. תרגלו את ההקלדה למטה.",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: {
              placeholder: "אינסטלטור קרוב אלי",
              targetKeywords: ["אינסטלטור", "קרוב", "אלי", "תיקון"]
            }
          }
        ]
      },
      {
        id: 'internet-qr-1',
        category: 'INTERNET_SKILLS',
        title: 'קודי QR: הריבוע המסתורי',
        shortDesc: 'סרקו את הריבועים השחורים-לבנים כדי לראות תפריטים או אתרים.',
        icon: <QrCode size={24} />,
        steps: [
          {
            title: "מה זה קוד QR?",
            content: "רואים אותם בכל מקום - על שולחנות במסעדות, בעיתונים ואפילו אצל הרופא. זהו קוד מיוחד שהמצלמה בטלפון יכולה לקרוא כדי לקחת אתכם ישירות לאתר אינטרנט.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול סריקה",
            content: "דמיינו שהטלפון שלכם הוא סורק. הזיזו את הריבוע שעל המסך מעל קוד ה-QR כדי 'לקרוא' את התפריט!",
            interactiveType: 'SIMULATED_QR',
            interactiveData: {
              target: 'תפריט מסעדה'
            }
          }
        ]
      },
      {
        id: 'safety-shopping-1',
        category: 'SAFETY',
        title: 'קניות בטוחות ברשת',
        shortDesc: 'איך לקנות דברים באינטרנט ללא דאגה.',
        icon: <ShoppingCart size={24} />,
        steps: [
          {
            title: "חפשו את המנעול",
            content: "כשאתם עומדים לשלם על משהו, הסתכלו בחלק העליון של המסך. אתם אמורים לראות אייקון של 'מנעול' קטן. זה אומר שהמידע שלכם מוצפן ומוגן.",
            interactiveType: 'INFO'
          },
          {
            title: "תשלום מאובטח",
            content: "בואו נתרגל תשלום בטוח. שימו לב למנעול ול-'https' בשורת הכתובת למטה. המשיכו וסיימו את הרכישה!",
            interactiveType: 'SECURE_CHECKOUT'
          }
        ]
      },
      {
        id: 'safety-scams-1',
        category: 'SAFETY',
        title: 'זיהוי "זיופים"',
        shortDesc: 'הגנו על עצמכם מפני מיילים והודעות מטעים.',
        icon: <Ghost size={24} />,
        steps: [
          {
            title: "דחוף! האם זה אמיתי?",
            content: "נוכלים מנסים לעיתים קרובות לגרום לכם להיכנס ללחץ. הם עלולים להגיד שחשבון הבנק שלכם נסגר או שזכיתם בפרס. בנקים אמיתיים כמעט אף פעם לא יבקשו סיסמה במייל.",
            interactiveType: 'INFO'
          },
          {
            title: "זהו את הטעות",
            content: "הסתכלו על המייל הזה: 'לקוח יקרר, חשבונך בבנק הפועלים נפרץ! לחץ כאן לתקן מיד'. מה נראה חשוד?",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "מהו התמרור האדום הכי גדול בהודעה הזו?",
              options: ["הברכה הידידותית", "טעויות הכתיב והדחיפות", "הצבע הכחול של הטקסט"],
              correctIndex: 1
            }
          }
        ]
      }
    ],
    es: [],
    ru: [],
    ar: []
  };
  return content[lang] || content['en'];
};

export const getLocalizedCategories = (lang: Language): { id: LessonCategory; label: string; icon: React.ReactNode; color: string }[] => {
  const labels: Record<Language, Record<LessonCategory, string>> = {
    en: { AI_BASICS: 'AI Simply Explained', INTERNET_SKILLS: 'Everyday Internet', SAFETY: 'Staying Safe' },
    he: { AI_BASICS: 'בינה מלאכותית בפשטות', INTERNET_SKILLS: 'אינטרנט יומיומי', SAFETY: 'גלישה בטוחה' },
    es: { AI_BASICS: 'IA explicada fácilmente', INTERNET_SKILLS: 'Internet cotidiano', SAFETY: 'Seguridad en línea' },
    ru: { AI_BASICS: 'ИИ простыми словами', INTERNET_SKILLS: 'Интернет каждый день', SAFETY: 'Безопасность' },
    ar: { AI_BASICS: 'الذكاء الاصطناعي ببساطة', INTERNET_SKILLS: 'الإنترنت اليومي', SAFETY: 'البقاء آمناً' }
  };
  
  const currentLabels = labels[lang] || labels['en'];

  return [
    { id: 'AI_BASICS', label: currentLabels.AI_BASICS, icon: <Zap size={20} />, color: 'bg-purple-100 text-purple-700' },
    { id: 'INTERNET_SKILLS', label: currentLabels.INTERNET_SKILLS, icon: <Radio size={20} />, color: 'bg-green-100 text-green-700' },
    { id: 'SAFETY', label: currentLabels.SAFETY, icon: <ShieldCheck size={20} />, color: 'bg-red-100 text-red-700' },
  ];
};
