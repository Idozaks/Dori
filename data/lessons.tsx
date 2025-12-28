
import React from 'react';
import { Lesson, Language, LessonCategory } from '../types';
import { Mail, Search, ShieldCheck, Cpu, Map as MapIcon, Video, QrCode, Mic, Zap, Radio, Eye, Lock, ShoppingCart, Ghost, Users, Navigation } from 'lucide-react';

export const getLocalizedLessons = (lang: Language): Lesson[] => {
  const content: Record<Language, Lesson[]> = {
    en: [
      {
        id: 'internet-social-1',
        category: 'INTERNET_SKILLS',
        title: 'Connecting with Family',
        shortDesc: 'Learn how to use social media to see photos of grandchildren.',
        icon: <Users size={24} />,
        steps: [
          {
            title: "What is Social Media?",
            content: "Think of social media (like Facebook) as a digital community center. It's where friends and family post photos and updates about their lives so you can stay connected.",
            interactiveType: 'INFO'
          },
          {
            title: "Interacting with Posts",
            content: "When you see a photo you like, you can 'Like' it. This tells your family you've seen their update! Practice by liking the photo of the grandchild below.",
            interactiveType: 'SIMULATED_SOCIAL',
            interactiveData: { type: 'LIKE_PRACTICE' }
          }
        ]
      },
      {
        id: 'internet-email-1',
        category: 'INTERNET_SKILLS',
        title: 'Sending an Email',
        shortDesc: 'The modern way to send a letter to anyone in the world.',
        icon: <Mail size={24} />,
        steps: [
          {
            title: "Digital Letters",
            content: "Email is like a letter that arrives instantly. You just need the person's 'Email Address'—which is like their digital house address.",
            interactiveType: 'INFO'
          },
          {
            title: "Write Your First Message",
            content: "Let's practice writing an email. Fill in who it's for, what it's about, and your message below.",
            interactiveType: 'SIMULATED_EMAIL'
          }
        ]
      },
      {
        id: 'internet-maps-1',
        category: 'INTERNET_SKILLS',
        title: 'Finding Your Way',
        shortDesc: 'Never get lost again with digital maps.',
        icon: <Navigation size={24} />,
        steps: [
          {
            title: "The World in Your Pocket",
            content: "Google Maps is a giant, interactive map of the entire world. You can find restaurants, doctors, or your friend's house just by typing.",
            interactiveType: 'INFO'
          },
          {
            title: "Searching for a Place",
            content: "Try searching for a local park or a grocery store to see it on the map!",
            interactiveType: 'SIMULATED_MAP',
            interactiveData: { targetSearch: 'Park' }
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
            title: "The Magic Square",
            content: "You see them everywhere—on restaurant tables and magazines. It's a special code that takes you directly to a website without typing.",
            interactiveType: 'INFO'
          },
          {
            title: "Find the Salade Niçoise",
            content: "Pretend your phone is a scanner. Move the lens over the QR code to open the digital menu!",
            interactiveType: 'SIMULATED_QR',
            interactiveData: { target: 'Restaurant Menu' }
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
            title: "Practice a Search",
            content: "Try typing 'Weather in London' or anything you're curious about to find information.",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: { placeholder: 'Search for anything...', targetKeywords: ['weather', 'london', 'news', 'food'] }
          }
        ]
      },
      {
        id: 'internet-video-1',
        category: 'INTERNET_SKILLS',
        title: 'Video Calls',
        shortDesc: 'See and hear your family live through your screen.',
        icon: <Video size={24} />,
        steps: [
          {
            title: "Live Connection",
            content: "Video calls let you see the face of the person you're talking to. It's like they're right there with you in the room.",
            interactiveType: 'INFO'
          },
          {
            title: "Testing Your Gear",
            content: "Before a call, you must turn on your camera and microphone. Practice by turning both on below.",
            interactiveType: 'SIMULATED_VIDEO_CALL'
          }
        ]
      },
      {
        id: 'ai-lens-1',
        category: 'AI_BASICS',
        title: 'The Magic Eye',
        shortDesc: 'Use your phone to identify anything in the real world.',
        icon: <Eye size={24} />,
        steps: [
          {
            title: "Your Phone can 'See'",
            content: "Modern AI can look through your camera and tell you exactly what it's seeing. It's like having an expert in your pocket for plants or landmarks.",
            interactiveType: 'INFO'
          },
          {
            title: "Practice Scanning",
            content: "Try dragging your phone over the scene. Hover over the flower to see what the AI discovers!",
            interactiveType: 'SIMULATED_LENS',
            interactiveData: {
              backgroundPrompt: "A vibrant garden with a large colorful flower and a bird.",
              targets: [
                { x: 50, y: 40, label: "Magnolia Flower", desc: "A beautiful spring bloom." }
              ]
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
            content: "When you see a 'Padlock' icon in the address bar, it means your payment information is encrypted and safe from hackers.",
            interactiveType: 'INFO'
          },
          {
            title: "A Secure Checkout",
            content: "Notice the padlock below. Practice a safe payment by clicking 'Pay Now'.",
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
            content: "Scammers often try to make you panic. Real banks will almost never ask for your password via email.",
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
        id: 'internet-social-1',
        category: 'INTERNET_SKILLS',
        title: 'מתחברים למשפחה',
        shortDesc: 'למדו איך להשתמש ברשתות חברתיות כדי לראות תמונות של הנכדים.',
        icon: <Users size={24} />,
        steps: [
          {
            title: "מהן רשתות חברתיות?",
            content: "חשבו על רשת חברתית (כמו פייסבוק) כעל מתנ״ס דיגיטלי. זה המקום שבו חברים ומשפחה מפרסמים תמונות ועדכונים.",
            interactiveType: 'INFO'
          },
          {
            title: "אינטראקציה עם פוסטים",
            content: "כשאתם רואים תמונה שאתם אוהבים, אתם יכולים לעשות 'לייק'. תרגלו על ידי סימון לייק לתמונה של הנכד למטה.",
            interactiveType: 'SIMULATED_SOCIAL',
            interactiveData: { type: 'LIKE_PRACTICE' }
          }
        ]
      },
      {
        id: 'internet-email-1',
        category: 'INTERNET_SKILLS',
        title: 'שליחת אימייל',
        shortDesc: 'הדרך המודרנית לשלוח מכתב לכל אחד בעולם.',
        icon: <Mail size={24} />,
        steps: [
          {
            title: "מכתבים דיגיטליים",
            content: "אימייל הוא כמו מכתב שמגיע מיד. אתם רק צריכים את 'כתובת האימייל' של האדם - שהיא כמו כתובת הבית הדיגיטלית שלו.",
            interactiveType: 'INFO'
          },
          {
            title: "כתבו את ההודעה הראשונה שלכם",
            content: "בואו נתרגל כתיבת אימייל. מלאו למי זה מיועד, על מה מדובר והודעה למטה.",
            interactiveType: 'SIMULATED_EMAIL'
          }
        ]
      },
      {
        id: 'internet-maps-1',
        category: 'INTERNET_SKILLS',
        title: 'למצוא את הדרך',
        shortDesc: 'לעולם אל תלכו לאיבוד עם מפות דיגיטליות.',
        icon: <Navigation size={24} />,
        steps: [
          {
            title: "העולם בכיס שלכם",
            content: "גוגל מפות היא מפה ענקית ואינטראקטיבית של כל העולם. אפשר למצוא מסעדות, רופאים או את הבית של חברים פשוט על ידי הקלדה.",
            interactiveType: 'INFO'
          },
          {
            title: "חיפוש מקום",
            content: "נסו לחפש פארק מקומי או חנות כדי לראות אותם על המפה!",
            interactiveType: 'SIMULATED_MAP',
            interactiveData: { targetSearch: 'פארק' }
          }
        ]
      },
      {
        id: 'internet-qr-1',
        category: 'INTERNET_SKILLS',
        title: 'קודי QR: ריבוע הקסם',
        shortDesc: 'סרקו את הריבועים השחורים-לבנים כדי לראות תפריטים.',
        icon: <QrCode size={24} />,
        steps: [
          {
            title: "ריבוע הקסם",
            content: "קוד QR הוא סוג של 'ריבוע קסם'. במקום להקליד כתובות ארוכות, פשוט מכוונים אליו את המצלמה.",
            interactiveType: 'INFO'
          },
          {
            title: "מצאו את סלט הניסואז",
            content: "דמיינו שאתם במסעדה. הזיזו את העדשה מעל הקוד כדי לראות את התפריט!",
            interactiveType: 'SIMULATED_QR',
            interactiveData: { target: 'תפריט מסעדה' }
          }
        ]
      },
      {
        id: 'internet-search-1',
        category: 'INTERNET_SKILLS',
        title: 'חיפוש ברשת',
        shortDesc: 'למדו איך למצוא כל מידע בשניות.',
        icon: <Search size={24} />,
        steps: [
          {
            title: "לשאול את העולם",
            content: "גוגל הוא כמו ספרייה ענקית שבה אפשר לשאול כל שאלה. פשוט מקלידים כמה מילות מפתח.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול חיפוש",
            content: "נסו להקליד 'מזג אוויר' או כל דבר שמעניין אתכם כדי למצוא מידע.",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: { placeholder: 'חפשו כל דבר...', targetKeywords: ['מזג', 'אוויר', 'חדשות', 'אוכל'] }
          }
        ]
      },
      {
        id: 'internet-video-1',
        category: 'INTERNET_SKILLS',
        title: 'שיחות וידאו',
        shortDesc: 'ראו ושמעו את המשפחה שלכם בשידור חי דרך המסך.',
        icon: <Video size={24} />,
        steps: [
          {
            title: "חיבור חי",
            content: "שיחות וידאו מאפשרות לכם לראות את הפנים של האדם איתו אתם מדברים. זה כאילו הם נמצאים איתכם בחדר.",
            interactiveType: 'INFO'
          },
          {
            title: "בדיקת הציוד שלכם",
            content: "לפני שיחה, עליכם להפעיל את המצלמה והמיקרופון. תרגלו זאת על ידי הפעלת שניהם למטה.",
            interactiveType: 'SIMULATED_VIDEO_CALL'
          }
        ]
      },
      {
        id: 'ai-lens-1',
        category: 'AI_BASICS',
        title: 'עין הקסם',
        shortDesc: 'השתמשו בטלפון כדי לזהות כל דבר בעולם האמיתי.',
        icon: <Eye size={24} />,
        steps: [
          {
            title: "הטלפון שלכם יכול 'לראות'",
            content: "בינה מלאכותית מודרנית יכולה להסתכל דרך המצלמה ולהגיד בדיוק מה היא רואה. זה כמו מומחה בכיס לצמחים או אתרים היסטוריים.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול סריקה",
            content: "נסו לגרור את הטלפון מעל הסצנה. עמדו מעל הפרח כדי לראות מה ה-AI מגלה!",
            interactiveType: 'SIMULATED_LENS',
            interactiveData: {
              backgroundPrompt: "A vibrant garden with a large colorful flower and a bird.",
              targets: [
                { x: 50, y: 40, label: "פרח מגנוליה", desc: "פריחה אביבית יפהפייה." }
              ]
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
            content: "כשאתם רואים אייקון של 'מנעול' בשורת הכתובת, זה אומר שפרטי התשלום שלכם מוצפנים ובטוחים.",
            interactiveType: 'INFO'
          },
          {
            title: "תשלום מאובטח",
            content: "שימו לב למנעול למטה. תרגלו תשלום בטוח על ידי לחיצה על 'שלם עכשיו'.",
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
            content: "נוכלים מנסים לעיתים קרובות לגרום לכם להילחץ. בנקים אמיתיים כמעט אף פעם לא יבקשו סיסמה במייל.",
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
