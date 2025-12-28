import React from 'react';
import { Lesson, Language, LessonCategory } from '../types';
import { Mail, Search, ShieldCheck, Cpu, Map, Video, Fingerprint, QrCode, Mic, MousePointer2, Zap, Radio } from 'lucide-react';

export const getLocalizedLessons = (lang: Language): Lesson[] => {
  const content: Record<Language, Lesson[]> = {
    en: [
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
        id: 'ai-truth-1',
        category: 'AI_BASICS',
        title: 'Real or AI?',
        shortDesc: 'How to spot pictures made by a computer.',
        icon: <Cpu size={24} />,
        steps: [
          {
            title: "The AI Glitches",
            content: "Computers are smart, but they often make small mistakes in photos. Look at the hands—sometimes they have 6 fingers! Or look at text in the background—it might look like gibberish.",
            interactiveType: 'INFO'
          },
          {
            title: "Spot the Fake",
            content: "A photo shows a person with three arms holding a newspaper with unreadable letters. Is this a real photo or made by AI?",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "What is your diagnosis?",
              options: ["Real Photo", "AI Generated", "I can't tell"],
              correctIndex: 1
            }
          }
        ]
      },
      {
        id: 'internet-search-1',
        category: 'INTERNET_SKILLS',
        title: 'Mastering the Search Bar',
        shortDesc: 'Find anything in the world just by typing a few words.',
        icon: <Search size={24} />,
        steps: [
          {
            title: "Keywords are Key",
            content: "You don't need to be polite to a search engine! Instead of typing 'Please show me a map of the nearest pharmacy in London', you can just type 'Pharmacy London'. It's faster and more accurate.",
            interactiveType: 'INFO'
          },
          {
            title: "Practice Searching",
            content: "Try finding a recipe for apple pie. What words would you type into the box below?",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: {
              placeholder: 'Type keywords here...',
              targetKeywords: ['apple', 'pie', 'recipe']
            }
          }
        ]
      },
      {
        id: 'internet-email-1',
        category: 'INTERNET_SKILLS',
        title: 'Practice Sending an Email',
        shortDesc: 'Learn how to write and send a digital letter.',
        icon: <Mail size={24} />,
        steps: [
          {
            title: "The Parts of an Email",
            content: "An email is just like a letter. It needs a destination (To), a quick summary of why you are writing (Subject), and your actual message.",
            interactiveType: 'INFO'
          },
          {
            title: "Try Sending One",
            content: "Try filling out this letter to your grandson, Timmy. His email is timmy@family.com.",
            interactiveType: 'SIMULATED_EMAIL',
            interactiveData: {
              recipient: 'timmy@family.com'
            }
          }
        ]
      },
      {
        id: 'internet-maps-1',
        category: 'INTERNET_SKILLS',
        title: 'Getting Around with Maps',
        shortDesc: 'Never get lost again using the maps on your phone.',
        icon: <Map size={24} />,
        steps: [
          {
            title: "Your Digital Compass",
            content: "Digital maps show you exactly where you are with a blue dot. You can search for a destination, and it will give you step-by-step directions for walking, driving, or taking the bus.",
            interactiveType: 'INFO'
          },
          {
            title: "Finding a Local Spot",
            content: "Let's practice! Imagine you want to visit a park. Type 'Park' in the map search bar below, find a result, and click 'Directions' to see how to get there.",
            interactiveType: 'SIMULATED_MAP',
            interactiveData: {
              targetSearch: 'park'
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
        id: 'internet-voice-1',
        category: 'INTERNET_SKILLS',
        title: 'Voice Power',
        shortDesc: 'Stop typing and start talking to your device.',
        icon: <Mic size={24} />,
        steps: [
          {
            title: "Talking to Google or Siri",
            content: "Typing on small screens is hard! You can use your voice to set timers, ask about the weather, or send a text. Look for the small microphone icon whenever you see a keyboard.",
            interactiveType: 'INFO'
          },
          {
            title: "Try a Voice Command",
            content: "Try telling the device: 'Set a timer for 10 minutes'. Practice pressing the microphone button first.",
            interactiveType: 'SIMULATED_VOICE',
            interactiveData: {
              targetCommand: 'timer'
            }
          }
        ]
      },
      {
        id: 'internet-video-1',
        category: 'INTERNET_SKILLS',
        title: 'Video Calls with Family',
        shortDesc: 'See your loved ones clearly, even from miles away.',
        icon: <Video size={24} />,
        steps: [
          {
            title: "The Camera and Microphone",
            content: "On every video call, there are three important buttons. The **Camera** button turns your video on. The **Microphone** button lets people hear you. The **Red Phone** button ends the call.",
            interactiveType: 'INFO'
          },
          {
            title: "Practice a Call",
            content: "Grandkid Timmy is calling you! Can you find the 'Unmute' button and the 'Start Video' button to say hello?",
            interactiveType: 'SIMULATED_VIDEO_CALL',
            interactiveData: {
              callerName: 'Timmy'
            }
          }
        ]
      },
      {
        id: 'safety-secure-1',
        category: 'SAFETY',
        title: 'Safe Online Shopping',
        shortDesc: 'Is this website safe? Look for the Padlock.',
        icon: <Fingerprint size={24} />,
        steps: [
          {
            title: "The Golden Padlock",
            content: "Before you ever enter your name or credit card on a website, look at the top bar. You should see a small padlock icon 🔒 next to the web address. This means the connection is 'Secure'.",
            interactiveType: 'INFO'
          },
          {
            title: "Check for Safety",
            content: "Look at this simulated checkout page. Is it safe to enter your information?",
            interactiveType: 'SECURE_CHECKOUT',
            interactiveData: {
              isSecure: true,
              siteName: 'Family Pharmacy'
            }
          }
        ]
      },
      {
        id: 'safety-ads-1',
        category: 'SAFETY',
        title: "Don't Click the 'Ad'",
        shortDesc: 'Learn to distinguish between real results and paid commercials.',
        icon: <MousePointer2 size={24} />,
        steps: [
          {
            title: "Sponsored Results",
            content: "When you search for something, companies pay to be at the top. These results usually have the word **'Sponsored'** or **'Ad'** in small letters. Often, the best result is just below these paid ones.",
            interactiveType: 'INFO'
          },
          {
            title: "Spot the Ad",
            content: "Look at these three search results. Which one is a paid advertisement that you might want to skip?",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "Which result is an Ad?",
              options: [
                "Sponsored: Buy Cheap Shoes Now",
                "Wikipedia: History of Footwear",
                "BBC News: New Shoe Trends"
              ],
              correctIndex: 0
            }
          }
        ]
      }
    ],
    he: [
      {
        id: 'ai-intro-1',
        category: 'AI_BASICS',
        title: 'מה זה בכלל בינה מלאכותית (AI)?',
        shortDesc: 'חשבו על AI כעל סטודנט דיגיטלי שעוזר ולומד מדוגמאות.',
        icon: <Cpu size={24} />,
        steps: [
          {
            title: "העוזר הדיגיטלי",
            content: "בינה מלאכותית (AI) היא לא רובוט מסרט. היא דומה יותר לסטודנט מהיר מאוד. בדיוק כפי שלמדתם לזהות חתול על ידי ראיית הרבה חתולים, ה-AI מסתכל על מיליוני תמונות כדי ללמוד איך חתול נראה.",
            interactiveType: 'INFO'
          },
          {
            title: "מנועי המלצות",
            content: "תהיתם פעם איך נטפליקס יודעת שאתם אוהבים סרטי בלשים? זה ה-AI 'מנוע המלצות'. זה כמו חנווני שזוכר כל מה שאי פעם קניתם ומציע דברים שאולי תאהבו אחר כך.",
            interactiveType: 'QUIZ',
            interactiveData: {
              question: "אם ה-AI מבחין שאתם תמיד קוראים מתכונים לפשטידות, מה הוא כנראה יציע בהמשך?",
              options: ["מדריך לתיקון רכב", "מתכון חדש לעוגה", "ספר היסטוריה על מלחמות"],
              correctIndex: 1
            }
          }
        ]
      },
      {
        id: 'internet-search-1',
        category: 'INTERNET_SKILLS',
        title: 'שליטה בשורת החיפוש',
        shortDesc: 'מצאו כל דבר בעולם פשוט על ידי הקלדת כמה מילים.',
        icon: <Search size={24} />,
        steps: [
          {
            title: "מילות מפתח הן המפתח",
            content: "אתם לא צריכים להיות מנומסים למנוע החיפוש! במקום להקליד 'בבקשה תראה לי מפה של בית המרקחת הקרוב ביותר בתל אביב', אפשר פשוט להקליד 'בית מרקחת תל אביב'. זה מהיר ומדויק יותר.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול חיפוש",
            content: "נסו למצוא מתכון לעוגת תפוחים. אילו מילים הייתם מקלידים בתיבה למטה?",
            interactiveType: 'SIMULATED_SEARCH',
            interactiveData: {
              placeholder: 'הקלידו מילות מפתח כאן...',
              targetKeywords: ['עוגה', 'תפוחים', 'מתכון']
            }
          }
        ]
      },
      {
        id: 'internet-email-1',
        category: 'INTERNET_SKILLS',
        title: 'תרגול שליחת מייל',
        shortDesc: 'למדו איך לכתוב ולשלוח מכתב דיגיטלי.',
        icon: <Mail size={24} />,
        steps: [
          {
            title: "חלקי המייל",
            content: "מייל הוא ממש כמו מכתב. הוא צריך יעד (אל:), נושא קצר שמסביר למה אתם כותבים (נושא:), ואת ההודעה שלכם.",
            interactiveType: 'INFO'
          },
          {
            title: "נסו לשלוח אחד",
            content: "נסו למלא את המכתב הזה לנכד שלכם, טימי. המייל שלו הוא timmy@family.com.",
            interactiveType: 'SIMULATED_EMAIL',
            interactiveData: {
              recipient: 'timmy@family.com'
            }
          }
        ]
      },
      {
        id: 'internet-maps-1',
        category: 'INTERNET_SKILLS',
        title: 'להתמצא עם מפות',
        shortDesc: 'לעולם אל תלכו לאיבוד שוב בעזרת המפות בטלפון שלכם.',
        icon: <Map size={24} />,
        steps: [
          {
            title: "המצפן הדיגיטלי שלכם",
            content: "מפות דיגיטליות מראות לכם בדיוק איפה אתם נמצאים עם נקודה כחולה. אתם יכולים לחפש יעד, וזה ייתן לכם הוראות שלב אחר שלב להליכה, נסיעה ברכב או באוטובוס.",
            interactiveType: 'INFO'
          },
          {
            title: "מציאת מקום קרוב",
            content: "בואו נתרגל! דמיינו שאתם רוצים לבקר בפארק. הקלידו 'פארק' בשורת החיפוש למטה, מצאו תוצאה, ולחצו על 'הוראות' כדי לראות איך מגיעים.",
            interactiveType: 'SIMULATED_MAP',
            interactiveData: {
              targetSearch: 'פארק'
            }
          }
        ]
      },
      {
        id: 'internet-qr-1',
        category: 'INTERNET_SKILLS',
        title: 'קודי QR: הריבוע הקסום',
        shortDesc: 'סרקו את הריבועים בשחור-לבן כדי לראות תפריטים או אתרים.',
        icon: <QrCode size={24} />,
        steps: [
          {
            title: "מה זה קוד QR?",
            content: "רואים אותם בכל מקום - על שולחנות במסעדות, במגזינים ואפילו אצל הרופא. זהו קוד מיוחד שהמצלמה של הטלפון יכולה לקרוא כדי לקחת אתכם ישירות לאתר אינטרנט בלי להקליד.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול סריקה",
            content: "דמיינו שהטלפון שלכם הוא סורק. הזיזו את הריבוע על המסך מעל קוד ה-QR כדי 'לקרוא' את התפריט!",
            interactiveType: 'SIMULATED_QR',
            interactiveData: {
              target: 'תפריט מסעדה'
            }
          }
        ]
      },
      {
        id: 'internet-video-1',
        category: 'INTERNET_SKILLS',
        title: 'שיחות וידאו עם המשפחה',
        shortDesc: 'ראו את היקרים לכם בבירור, גם ממרחק קילומטרים.',
        icon: <Video size={24} />,
        steps: [
          {
            title: "המצלמה והמיקרופון",
            content: "בכל שיחת וידאו, ישנם שלושה כפתורים חשובים. כפתור ה**מצלמה** מפעיל את הוידאו שלכם. כפתור ה**מיקרופון** מאפשר לאנשים לשמוע אתכם. כפתור ה**טלפון האדום** מסיים את השיחה.",
            interactiveType: 'INFO'
          },
          {
            title: "תרגול שיחה",
            content: "הנכד טימי מתקשר אליכם! האם אתם יכולים למצוא את כפתור 'הפעל מיקרופון' ו-'הפעל וידאו' כדי להגיד שלום?",
            interactiveType: 'SIMULATED_VIDEO_CALL',
            interactiveData: {
              callerName: 'טימי'
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
    ar: { AI_BASICS: 'الذكاء الاصטناعي ببساطة', INTERNET_SKILLS: 'الإنترنت اليومي', SAFETY: 'البقاء آمناً' }
  };
  
  const currentLabels = labels[lang] || labels['en'];

  return [
    { id: 'AI_BASICS', label: currentLabels.AI_BASICS, icon: <Zap size={20} />, color: 'bg-purple-100 text-purple-700' },
    { id: 'INTERNET_SKILLS', label: currentLabels.INTERNET_SKILLS, icon: <Radio size={20} />, color: 'bg-green-100 text-green-700' },
    { id: 'SAFETY', label: currentLabels.SAFETY, icon: <ShieldCheck size={20} />, color: 'bg-red-100 text-red-700' },
  ];
};
