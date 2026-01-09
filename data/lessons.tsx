
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
  if (localized.initialPrompt && typeof localized.initialPrompt === 'object') {
    localized.initialPrompt = localize(localized.initialPrompt, lang);
  }
  if (localized.examplePrompt && typeof localized.examplePrompt === 'object') {
    localized.examplePrompt = localize(localized.examplePrompt, lang);
  }
  return localized;
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
    // --- AI BASICS LESSONS ---
    {
      id: 'what-is-ai',
      category: 'AI_BASICS' as LessonCategory,
      title: { en: 'What is AI?', he: 'מה זה AI?' },
      shortDesc: { en: 'Understand what Artificial Intelligence is and how it helps.', he: 'הבינו מהי בינה מלאכותית ואיך היא עוזרת.' },
      icon: <Sparkles size={20} />,
      steps: [
        {
          title: { en: 'What is AI? A Smart Helper', he: 'מה זה AI? עוזר חכם' },
          content: { en: 'AI stands for Artificial Intelligence. Think of it as a very smart computer program that can learn, understand, and help solve problems, much like a clever apprentice. It\'s designed to make tasks easier for you, from answering questions to organizing information.', he: 'AI מייצג בינה מלאכותית. חשבו על זה כעל תוכנת מחשב חכמה מאוד שיכולה ללמוד, להבין ולעזור בפתרון בעיות, בדומה לחניך פיקח. היא נועדה להקל עליכם במשימות, החל ממענה על שאלות ועד ארגון מידע.' },
        },
        {
          title: { en: 'How Does AI Learn?', he: 'איך AI לומד?' },
          content: { en: 'AI learns by looking at many examples, just like we learn from experience. For instance, to recognize a cat, AI looks at thousands of cat pictures until it understands what a cat looks like. The more examples it sees, the smarter it becomes at recognizing patterns and making decisions.', he: 'AI לומד על ידי התבוננות בדוגמאות רבות, בדיוק כמו שאנחנו לומדים מניסיון. לדוגמה, כדי לזהות חתול, AI בוחן אלפי תמונות של חתולים עד שהוא מבין איך חתול נראה. ככל שהוא רואה יותר דוגמאות, כך הוא הופך לחכם יותר בזיהוי תבניות וקבלת החלטות.' },
        },
        {
          title: { en: 'AI All Around Us', he: 'AI בכל מקום סביבנו' },
          content: { en: 'You might be using AI every day without even realizing it! When your phone suggests what word to type next, when a streaming service recommends a movie, or when your email filters out spam, that\'s AI at work. It\'s in navigation apps that find the best route, and even in some smart devices in your home that respond to your voice.', he: 'אתם עשויים להשתמש ב-AI בכל יום מבלי לשים לב! כשהטלפון שלכם מציע מילה להקליד הבאה, כשאפליקציית סטרימינג ממליצה על סרט, או כשהאימייל שלכם מסנן הודעות ספאם – זהו AI בפעולה. הוא נמצא באפליקציות ניווט שמוצאות את הדרך הטובה ביותר, ואפילו במכשירים חכמים מסוימים בביתכם שמגיבים לקולכם.' },
        }
      ]
    },
    {
      id: 'talking-to-ai',
      category: 'AI_BASICS' as LessonCategory,
      title: { en: 'Talking to AI', he: 'שיחה עם AI' },
      shortDesc: { en: 'Practice asking questions and getting answers from Dori.', he: 'תרגלו לשאול שאלות ולקבל תשובות מדורי.' },
      icon: <MessageCircleMore size={20} />,
      steps: [
        {
          title: { en: 'Your Conversational Buddy', he: 'החבר המדבר שלך' },
          content: { en: 'Dori is a special kind of AI called a "conversational AI" or "chatbot." This means you can talk to her just like you would to a person, by typing your questions. Dori can help you with general information, write short messages for you, or simply chat about your day. She\'s here to assist you in a friendly and patient way.', he: 'דורי היא סוג מיוחד של AI הנקרא "AI שיחתי" או "צ\'אטבוט". זה אומר שאתם יכולים לדבר איתה בדיוק כמו עם אדם, על ידי הקלדת שאלותיכם. דורי יכולה לעזור לכם במידע כללי, לכתוב עבורכם הודעות קצרות, או פשוט לשוחח על יומכם. היא כאן כדי לסייע לכם בצורה ידידותית וסבלנית.' },
        },
        {
          title: { en: 'Tips for Clear Communication', he: 'טיפים לתקשורת ברורה' },
          content: { en: 'To get the best answers from Dori, it helps to be clear and specific in your questions. Imagine you\'re asking a helpful friend. For example, instead of just "Weather," try "What\'s the weather like in Tel Aviv tomorrow?" The more details you give, the better Dori can understand and respond accurately. Don\'t be afraid to ask follow-up questions if something isn\'t clear!', he: 'כדי לקבל את התשובות הטובות ביותר מדורי, כדאי להיות ברורים וממוקדים בשאלותיכם. דמיינו שאתם שואלים חבר מועיל. לדוגמה, במקום רק "מזג אוויר", נסו "איך מזג האוויר בתל אביב מחר?". ככל שתתנו יותר פרטים, כך דורי תוכל להבין טוב יותר ולהגיב במדויק. אל תהססו לשאול שאלות המשך אם משהו לא ברור!' },
        },
        {
          title: { en: 'Practice Asking Dori Questions', he: 'תרגלו שאלות לדורי' },
          content: { en: 'Now it\'s your turn to chat with Dori! In the box below, you can type any question you have. Remember the tips for clear communication. Try asking "How do I send a text message?" or "Tell me a simple recipe for cookies."', he: 'עכשיו תורכם לשוחח עם דורי! בתיבה למטה, תוכלו להקליד כל שאלה שיש לכם. זכרו את הטיפים לתקשורת ברורה. נסו לשאול "איך שולחים הודעת טקסט?" או "ספרי לי מתכון פשוט לעוגיות."' },
          interactiveType: 'LIVE_AI_CHAT',
          interactiveData: { initialPrompt: { en: 'Hello! I am Dori. How can I help you learn about AI?', he: 'שלום! אני דורי. איך אוכל לעזור לך ללמוד על AI?' }}
        },
        {
          title: { en: 'What AI Can (and Cannot) Do', he: 'מה AI יכול (ומה לא)' },
          content: { en: 'While Dori is incredibly smart and helpful, it\'s important to remember a few things. AI doesn\'t have feelings or personal opinions, and it learns from information it has been given. This means it might not always know about very recent events, or it could sometimes make a mistake. It\'s a tool to assist you, not a human, so always use your judgment with the information it provides.', he: 'אף שדורי חכמה ומועילה להפליא, חשוב לזכור כמה דברים. ל-AI אין רגשות או דעות אישיות, והוא לומד ממידע שניתן לו. זה אומר שהוא לא תמיד יידע על אירועים עדכניים מאוד, או שהוא עלול לפעמים לטעות. זהו כלי שנועד לסייע לכם, לא בן אדם, אז תמיד השתמשו בשיקול דעתכם עם המידע שהוא מספק.' },
        }
      ]
    },
    {
      id: 'ai-for-creativity',
      category: 'AI_BASICS' as LessonCategory,
      title: { en: 'AI for Creativity', he: 'AI ליצירתיות' },
      shortDesc: { en: 'Discover how AI can create amazing pictures from your words.', he: 'גלו איך AI יכול ליצור תמונות מדהימות מהמילים שלכם.' },
      icon: <Wand2 size={20} />,
      steps: [
        {
          title: { en: 'AI as an Artist: Making Pictures with Words', he: 'AI כאמן: יצירת תמונות ממילים' },
          content: { en: 'Imagine you want to see a picture of something that doesn\'t exist, like "a blue elephant wearing a party hat." AI can make that image for you! You simply describe what you want, and the AI acts like a digital artist, bringing your words to life on a canvas. No need for paint, brushes, or special drawing skills – just your imagination!', he: 'דמיינו שאתם רוצים לראות תמונה של משהו שאינו קיים, כמו "פיל כחול עם כובע מסיבה". AI יכול ליצור עבורכם את התמונה הזו! אתם פשוט מתארים מה אתם רוצים לראות, וה-AI פועל כאמן דיגיטלי, מחיֵה את המילים שלכם על קנבס. אין צורך בצבע, מכחולים או כישורי ציור מיוחדים – רק בדמיונכם!' },
        },
        {
          title: { en: 'Giving AI Good Instructions', he: 'מתן הנחיות טובות ל-AI' },
          content: { en: 'To help AI create the best picture, it\'s helpful to be very descriptive in your words. Think about colors, objects, settings, and even feelings. For example, instead of "a dog," try "a fluffy golden retriever sitting happily in a sunny field with yellow flowers." The more vivid your description, the closer the AI will get to what you imagine.', he: 'כדי לעזור ל-AI ליצור את התמונה הטובה ביותר, כדאי להיות מאוד תיאוריים במילים שלכם. חשבו על צבעים, אובייקטים, תפאורה ואפילו רגשות. לדוגמה, במקום "כלב", נסו "גולדן רטריבר פרוותי יושב בשמחה בשדה שטוף שמש עם פרחים צהובים". ככל שהתיאור שלכם יהיה חי יותר, כך ה-AI יתקרב יותר למה שאתם מדמיינים.' },
        },
        {
          title: { en: 'Your Creative Playground', he: 'מגרש המשחקים היצירתי שלך' },
          content: { en: 'Now, let\'s try creating your own picture! In the box below, type a description of an image you\'d like AI to generate. Remember to be specific and use descriptive words to help the AI understand your vision. You can try something simple like "a calm beach at sunset" or "a colorful bird singing on a branch."', he: 'עכשיו, בואו ננסה ליצור תמונה משלכם! בתיבה למטה, הקלידו תיאור של תמונה שתרצו שה-AI יפיק. זכרו להיות ספציפיים ולהשתמש במילים תיאוריות כדי לעזור ל-AI להבין את החזון שלכם. אתם יכולים לנסות משהו פשוט כמו "חוף רגוע בשקיעה" או "ציפור צבעונית שרה על ענף."' },
          interactiveType: 'SIMULATED_IMAGE_GENERATION',
          interactiveData: { placeholder: { en: 'Describe your picture here...', he: 'תארו את התמונה כאן...' }, examplePrompt: { en: 'A tranquil forest with a sparkling river.', he: 'יער שליו עם נהר מנצנץ.' } }
        },
        {
          title: { en: 'AI to Edit Photos', he: 'AI לעריכת תמונות' },
          content: { en: 'Beyond creating new pictures, AI can also help you change existing photos! Imagine you have a picture of your garden, and you wish there was a cute dog sitting on the grass. You could tell AI to "add a small brown dog to the center of the lawn," and it would intelligently make that change for you. It\'s like having a digital photo editor that understands your spoken or typed instructions.', he: 'מעבר ליצירת תמונות חדשות, AI יכול גם לעזור לכם לשנות תמונות קיימות! דמיינו שיש לכם תמונה של הגינה שלכם, והייתם רוצים שיהיה בה כלב חמוד יושב על הדשא. תוכלו לומר ל-AI "הוסף כלב קטן וחום למרכז הדשא", והוא יבצע את השינוי הזה עבורכם בצורה חכמה. זה כמו שיש לכם עורך תמונות דיגיטלי שמבין את ההוראות שלכם בקול או בהקלדה.' },
        }
      ]
    },

    // --- INTERNET SKILLS LESSONS ---
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
      id: 'qr-codes',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Scanning QR Codes', he: 'סריקת קודי QR' },
      shortDesc: { en: 'Master menus, tickets, and tracking.', he: 'שלטו בתפריטים, כרטיסים ומעקב.' },
      icon: <QrCode size={20} />,
      steps: [
        { title: { en: 'Scan', he: 'סריקה' }, content: { en: 'QR codes are smart barcodes you scan with your camera.', he: 'קודי QR הם ברקודים חכמים שסורקים עם המצלמה.' } },
        { title: { en: 'Practice', he: 'תרגול' }, content: { en: 'Try scanning the code on this table.', he: 'נסו לסרוק את הקוד על השולחן.' }, interactiveType: 'SIMULATED_QR', interactiveData: { backgroundPrompt: "A minimalist vector illustration of a restaurant table with a QR code.", actions: [{ id: 'MENU', label: { en: 'Menu', he: 'תפריט' }, overlayTitle: { en: 'Specials', he: 'מיוחדים' }, overlayContent: { en: 'Delicious food here!', he: 'אוכל טעים כאן!' } }] } }
      ]
    },
    {
      id: 'online-shopping',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Safe Online Shopping', he: 'קניות בטוחות באינטרנט' },
      shortDesc: { en: 'Learn to buy items securely from your phone.', he: 'למדו לקנות פריטים בבטחה מהטלפון.' },
      icon: <ShoppingCart size={20} />,
      steps: [
        { title: { en: 'The Digital Cart', he: 'העגלה הדיגיטלית' }, content: { en: 'Add items to your cart just like in a real store.', he: 'הוסיפו פריטים לעגלה ממש כמו בחנות אמיתית.' } },
        { title: { en: 'Secure Checkout', he: 'תשלום מאובטח' }, content: { en: 'Learn how to enter payment details safely.', he: 'למדו איך להזין פרטי תשלום בבטחה.' }, interactiveType: 'SECURE_CHECKOUT' },
      ]
    },
    {
      id: 'finding-your-way',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Finding Your Way', he: 'מצאו את דרככם' },
      shortDesc: { en: 'Never get lost again with Digital Maps.', he: 'לעולם אל תלכו לאיבוד עם מפות דיגיטליות.' },
      icon: <MapIcon size={20} />,
      steps: [
        { title: { en: 'The Digital Map', he: 'המפה הדיגיטלית' }, content: { en: 'Find any place by typing its name.', he: 'מצאו כל מקום על ידי הקלדת שמו.' } },
        { title: { en: 'Search for a Spot', he: 'חפשו מקום' }, content: { en: 'Try searching for "Library" or "Pharmacy".', he: 'נסו לחפש "ספרייה" או "בית מרקחת".' }, interactiveType: 'SIMULATED_MAP' },
      ]
    },
    {
      id: 'bus-payments',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Digital Bus Payments', he: 'תשלום באוטובוס' },
      shortDesc: { en: 'Pay for your ride with your phone.', he: 'שלמו על הנסיעה עם הטלפון.' },
      icon: <Bus size={20} />,
      steps: [
        { title: { en: 'No Cash?', he: 'אין מזומן?' }, content: { en: 'Many buses now use QR codes for payment.', he: 'אוטובוסים רבים משתמשים כיום בקודי QR לתשלום.' } },
        {
          title: { en: 'Pay', he: 'תשלום' },
          content: { en: 'Scan the bus pole code.', he: 'סרקו את הקוד שעל עמוד האוטובוס.' },
          interactiveType: 'SIMULATED_BUS_PAYMENT',
          interactiveData: {
            backgroundPrompt: "A clean graphic illustration of a city bus interior showing a bright yellow payment pole with a QR code scanner. Vector style, flat design, high contrast."
          }
        },
      ],
    },

    // --- SAFETY LESSONS ---
    {
      id: 'spotting-scams',
      category: 'SAFETY' as LessonCategory,
      title: { en: 'Spotting Scams', he: 'זיהוי הונאות' },
      shortDesc: { en: 'Identify fake messages and AI fakes.', he: 'זהו הודעות מזויפות וזיופי AI.' },
      icon: <ShieldAlert size={20} />,
      steps: [
        { title: { en: 'Digital Detectives', he: 'בלשים דיגיטליים' }, content: { en: 'Scammers try to trick people. Dori helps you find the red flags.', he: 'נוכלים מנסים להונות אנשים. דורי עוזרת לכם למצוא את סימני האזהרה.' } },
        { title: { en: 'Find the Fake', he: 'מצאו את הזיוף' }, content: { en: 'Move the lens to find AI mistakes in this photo.', he: 'הזיזו את העדשה למציאת טעויות AI בתמונה זו.' }, interactiveType: 'SIMULATED_LENS', interactiveData: { backgroundPrompt: "A photo of people where one person has 6 fingers and the clock is warped.", targets: [{ x: 30, y: 55, label: { en: 'AI Error!', he: 'טעות AI!' } }] } },
      ],
    },

    // --- LIFE ADMIN LESSONS ---
    {
      id: 'digital-pharmacy',
      category: 'LIFE_ADMIN' as LessonCategory,
      title: { en: 'Pharmacy Refills', he: 'חידוש תרופות' },
      shortDesc: { en: 'Refill your prescriptions without the long phone wait.', he: 'חדשו מרשמים בלי המתנה ארוכה בטלפון.' },
      icon: <Pill size={20} />,
      steps: [
        { title: { en: 'Skip the Line', he: 'דלגו על התור' }, content: { en: 'Your pharmacy has an app. Let\'s practice ordering a refill.', he: 'לבית המרקחת שלכם יש אפליקציה. בואו נתרגל הזמנת חידוש.' } },
        { title: { en: 'Order Refill', he: 'הזמן חידוש' }, content: { en: 'Enter your RX number to start.', he: 'הזינו את מספר המרשם כדי להתחיל.' }, interactiveType: 'SIMULATED_PHARMACY' },
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
      id: 'mirror-world-practice',
      category: 'LIFE_ADMIN' as LessonCategory,
      title: { en: 'Mirror World Practice', he: 'תרגול בעולם המראה' },
      shortDesc: { en: 'Practice any online task safely before doing it for real.', he: 'תרגלו כל משימה מקוונת בבטחה לפני ביצועה באמת.' },
      icon: <Layout size={20} />,
      steps: [
        {
          title: { en: 'Safe Practice Zone', he: 'אזור תרגול בטוח' },
          content: { en: 'Dori\'s Mirror World lets you practice tricky online tasks without any real risks. Perfect for building confidence!', he: 'עולם המראה של דורי מאפשר לך לתרגל משימות מקוונות מסובכות ללא סיכונים אמיתיים. מושלם לבניית ביטחון!' },
        },
        {
          title: { en: 'Your Custom Task', he: 'המשימה המותאמת אישית שלך' },
          content: { en: 'Tell Dori what you want to practice, like "booking a doctor appointment" or "renewing a library card." You can find this on your dashboard.', he: 'ספרו לדורי מה אתם רוצים לתרגל, כמו "קביעת תור לרופא" או "חידוש כרטיס ספרייה". תוכלו למצוא זאת בלוח המחוונים שלכם.' },
        }
      ]
    },
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