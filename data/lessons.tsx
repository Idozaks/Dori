
import React from 'react';
import { Lesson, Language, LessonCategory } from '../types';
import { Mail, Search, ShieldCheck, Cpu, Map as MapIcon, Video, QrCode, Mic, Zap, Radio, Eye, Lock, ShoppingCart, Ghost, Users, Navigation, Bus, MessageSquare, Phone, Sparkles, Utensils, Image as ImageIcon, Wand2, FileText, Star, Package, Book, Ticket, Globe, Camera, CreditCard, Heart, MessageCircleMore, ShieldAlert, Pill, Headphones, Gift, Calendar, UserCheck, Truck, MessageCircle, Info } from 'lucide-react';

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
  // Localize actions array for QR codes
  if (localized.actions && Array.isArray(localized.actions)) {
    localized.actions = localized.actions.map((action: any) => ({
      ...action,
      label: typeof action.label === 'object' ? localize(action.label, lang) : action.label,
      overlayTitle: typeof action.overlayTitle === 'object' ? localize(action.overlayTitle, lang) : action.overlayTitle,
      overlayContent: typeof action.overlayContent === 'object' ? localize(action.overlayContent, lang) : action.overlayContent,
    }));
  }
  // Localize pharmacy fields
  if (localized.productName && typeof localized.productName === 'object') localized.productName = localize(localized.productName, lang);
  if (localized.billingPlaceholder && typeof localized.billingPlaceholder === 'object') localized.billingPlaceholder = localize(localized.billingPlaceholder, lang);
  if (localized.addressPlaceholder && typeof localized.addressPlaceholder === 'object') localized.addressPlaceholder = localize(localized.addressPlaceholder, lang);
  if (localized.cardPlaceholder && typeof localized.cardPlaceholder === 'object') localized.cardPlaceholder = localize(localized.cardPlaceholder, lang);
  if (localized.cvvPlaceholder && typeof localized.cvvPlaceholder === 'object') localized.cvvPlaceholder = localize(localized.cvvPlaceholder, lang);
  if (localized.payButton && typeof localized.payButton === 'object') localized.payButton = localize(localized.payButton, lang);

  return localized;
};

const findCategoryIcon = (category: LessonCategory) => {
  switch (category) {
    case 'AI_BASICS': return <Cpu size={20} />;
    case 'INTERNET_SKILLS': return <Navigation size={20} />;
    case 'SAFETY': return <ShieldCheck size={20} />;
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
  };
  return Object.values(categories);
};

export const getLocalizedLessons = (lang: Language): Lesson[] => {
  const categories = getLocalizedCategories(lang);
  const allLessonsData = [
    {
      id: 'qr-codes',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Scanning QR Codes', he: 'סריקת קודי QR' },
      shortDesc: { en: 'Master menus, tickets, and tracking.', he: 'שלטו בתפריטים, כרטיסים ומעקב.' },
      icon: <QrCode size={20} />,
      steps: [
        {
          title: { en: 'What are QR Codes?', he: 'מהם קודי QR?' },
          content: { en: 'QR codes are smart barcodes you scan with your camera to access websites, menus, or tickets instantly.', he: 'קודי QR הם ברקודים חכמים שסורקים עם המצלמה כדי לגשת לאתרים, תפריטים או כרטיסים באופן מיידי.' },
        },
        {
          title: { en: 'Level 1: Restaurant Menu', he: 'שלב 1: תפריט במסעדה' },
          content: { en: 'Scan the code on the table. You can view the menu, read reviews, or join the waitlist.', he: 'סרקו את הקוד שעל השולחן. תוכלו לצפות בתפריט, לקרוא ביקורות או להצטרף לרשימת ההמתנה.' },
          interactiveType: 'SIMULATED_QR',
          interactiveData: {
            backgroundPrompt: "A high-quality photo of a wooden restaurant table. In the center of the table, there is a prominent square QR code printed on a small acrylic stand. Modern cafe vibe.",
            actions: [
              {
                id: 'VIEW_MENU',
                label: { en: 'View Menu', he: 'תפריט' },
                iconName: 'FileText',
                overlayTitle: { en: 'Today\'s Specials', he: 'המיוחדים של היום' },
                overlayContent: { 
                  en: `### Starters\n**Fresh Garden Salad** — $12\n_Organic greens, cherry tomatoes, and house vinaigrette_\n\n### Main Course\n**Hearty Beef Stew** — $22\n_Slow-cooked with root vegetables and fresh herbs_`, 
                  he: `### מנות ראשונות\n**סלט ירוק טרי** — 42 ₪\n_עלים אורגניים, עגבניות שרי ורוטב ויניגרט ביתי_\n\n### מנות עיקריות\n**תבשיל בקר דשן** — 84 ₪\n_בישול איטי עם ירקות שורש ועשבי תיבול טריים_` 
                },
              },
              {
                id: 'REVIEWS',
                label: { en: 'Reviews', he: 'ביקורות' },
                iconName: 'Star',
                overlayTitle: { en: 'Customer Reviews', he: 'ביקורות לקוחות' },
                overlayContent: { 
                  en: `### Top Rated\n**Goldie:** "The best service I've had in years! The staff was so patient and kind. 5/5"`, 
                  he: `### דירוג גבוה\n**גולדי:** "השירות הטוב ביותר שקיבלתי מזה שנים! הצוות היה כל כך סבלני ואדיב. 5/5"` 
                },
              },
              {
                id: 'WAITLIST',
                label: { en: 'Waitlist', he: 'תור' },
                iconName: 'Users',
                overlayTitle: { en: 'Virtual Waitlist', he: 'תור וירטואלי' },
                overlayContent: { 
                  en: `**Current Wait:** 5 mins\n\nYou are next in line for a table for 2! We'll text you when it's ready.`, 
                  he: `**זמן המתנה:** 5 דקות\n\nאתה הבא בתור לשולחן ל-2! נשלח לך הודעה כשהוא יהיה מוכן.` 
                },
              },
            ]
          },
        },
        {
          title: { en: 'Level 2: Museum Entry', he: 'שלב 2: כניסה למוזיאון' },
          content: { en: 'Scan your digital ticket to enter. Explore audio guides and exhibition maps.', he: 'סרקו את הכרטיס הדיגיטלי שלכם כדי להיכנס. חקרו מדריכים קוליים ומפות תערוכה.' },
          interactiveType: 'SIMULATED_QR',
          interactiveData: {
            backgroundPrompt: "A photo of a modern museum entrance. A sleek metal pedestal with a glowing scanner screen is visible. The background shows a blurry art gallery.",
            actions: [
              {
                id: 'SCAN_TICKET',
                label: { en: 'Scan Ticket', he: 'סרוק כרטיס' },
                iconName: 'Ticket',
                overlayTitle: { en: 'Ticket Valid!', he: 'כרטיס בתוקף!' },
                overlayContent: { 
                  en: `**Entry Granted:** 1 Adult\n\nEnjoy your visit to the Museum of Modern Art!`, 
                  he: `**הכניסה אושרה:** מבוגר 1\n\nתהנו מהביקור במוזיאון לאמנות מודרנית!` 
                },
              },
              {
                id: 'AUDIO_GUIDE',
                label: { en: 'Audio Guide', he: 'מדריך קולי' },
                iconName: 'Headphones',
                overlayTitle: { en: 'Museum Audio Guide', he: 'מדריך קולי למוזיאון' },
                overlayContent: { 
                  en: `### Now Playing\n**Chapter 1:** The Renaissance Era\n_Listen as our curator explains the techniques of the masters._`, 
                  he: `### מנגן כעת\n**פרק 1:** עידן הרנסנס\n_האזינו לאוצרת המסבירה את הטכניקות של גדולי האמנים._` 
                },
              },
              {
                id: 'VIEW_MAP',
                label: { en: 'Venue Map', he: 'מפת המקום' },
                iconName: 'MapIcon',
                overlayTitle: { en: 'Museum Guide', he: 'מדריך המוזיאון' },
                overlayContent: { 
                  en: `### Floor Plan\n* **Level 1:** Impressionism\n* **Level 2:** Sculpture Garden`, 
                  he: `### תוכנית קומות\n* **קומה 1:** אימפרסיוניזם\n* **קומה 2:** גן הפסלים` 
                },
              },
              {
                id: 'GIFT_SHOP',
                label: { en: 'Gift Shop', he: 'חנות מתנות' },
                iconName: 'Gift',
                overlayTitle: { en: 'Museum Shop', he: 'חנות המוזיאון' },
                overlayContent: { 
                  en: `### Today's Offers\n* **Postcard Set:** $5\n* **Art Book:** 20% Discount for Seniors!`, 
                  he: `### המבצעים שלנו\n* **סט גלויות:** 18 ₪\n* **ספר אמנות:** 20% הנחה לבני גיל הזהב!` 
                },
              },
            ]
          },
        },
        {
          title: { en: 'Level 3: Package Tracking', he: 'שלב 3: מעקב חבילה' },
          content: { en: 'Scan the code on the delivery box to track your parcel, send feedback, or contact the driver.', he: 'סרקו את הקוד שעל קופסת המשלוח כדי לעקוב אחר החבילה, לשלוח משוב או ליצור קשר עם השליח.' },
          interactiveType: 'SIMULATED_QR',
          interactiveData: {
            backgroundPrompt: "A photo of a cardboard delivery package sitting on a front porch rug. A large QR code sticker is on the box.",
            actions: [
              {
                id: 'TRACK',
                label: { en: 'Track Status', he: 'מצב משלוח' },
                iconName: 'Package',
                overlayTitle: { en: 'Tracking Info', he: 'פרטי מעקב' },
                overlayContent: { 
                  en: `**Status:** Delivered to Porch\n**Time:** 2:15 PM today`, 
                  he: `**סטטוס:** נמסר לכניסה\n**שעה:** 14:15 היום` 
                },
              },
              {
                id: 'FEEDBACK',
                label: { en: 'Rate Delivery', he: 'דרג משלוח' },
                iconName: 'Star',
                overlayTitle: { en: 'How did we do?', he: 'איך היינו?' },
                overlayContent: { 
                  en: `Thank you for your order! Please rate your experience: ⭐⭐⭐⭐⭐`, 
                  he: `תודה על ההזמנה! נשמח לדירוג החוויה שלך: ⭐⭐⭐⭐⭐` 
                },
              },
              {
                id: 'CONTACT',
                label: { en: 'Call Driver', he: 'צור קשר' },
                iconName: 'Phone',
                overlayTitle: { en: 'Contact Courier', he: 'יצירת קשר' },
                overlayContent: { 
                  en: `Connecting you to your driver... Your courier "Dan" is in your area.`, 
                  he: `מערכת יוצרת קשר עם השליח... השליח "דני" נמצא באזורך.` 
                },
              },
              {
                id: 'REPORT',
                label: { en: 'Report Issue', he: 'דווח' },
                iconName: 'ShieldAlert',
                overlayTitle: { en: 'Help Center', he: 'מרכז עזרה' },
                overlayContent: { 
                  en: `Need help? Contact our support line or report if the box is damaged.`, 
                  he: `צריכים עזרה? צרו קשר עם מוקד התמיכה או דווחו אם הקופסה ניזוקה.` 
                },
              },
            ]
          },
        },
        {
          title: { en: 'Level 4: Library Return', he: 'שלב 4: החזרת ספר' },
          content: { en: 'Scan the book cover to return it. Check your account status or upcoming events.', he: 'סרקו את כריכת הספר כדי להחזיר אותו. בדקו את מצב החשבון או אירועים קרובים.' },
          interactiveType: 'SIMULATED_QR',
          interactiveData: {
            backgroundPrompt: "A high-resolution photo of a library book titled 'The Old Man and the Sea'. A library QR sticker is attached to the back cover.",
            actions: [
              {
                id: 'RETURN',
                label: { en: 'Return Book', he: 'החזר ספר' },
                iconName: 'Book',
                overlayTitle: { en: 'Book Returned!', he: 'הספר הוחזר!' },
                overlayContent: { 
                  en: `**Confirmed:** "The Old Man and the Sea"\n\nThank you for returning it on time!`, 
                  he: `**אושר:** "הזקן והים"\n\nתודה שהחזרת בזמן!` 
                },
              },
              {
                id: 'ACCOUNT',
                label: { en: 'My Account', he: 'החשבון שלי' },
                iconName: 'UserCheck',
                overlayTitle: { en: 'Library Account', he: 'סטטוס חשבון' },
                overlayContent: { 
                  en: `**Items Out:** 1\n**Overdue:** 0\n**Next Due Date:** Feb 20, 2025`, 
                  he: `**ספרים אצלך:** 1\n**איחורים:** 0\n**תאריך החזרה קרוב:** 20 בפברואר, 2025` 
                },
              },
              {
                id: 'CALENDAR',
                label: { en: 'Events', he: 'אירועים' },
                iconName: 'Calendar',
                overlayTitle: { en: 'Library Calendar', he: 'לוח אירועים' },
                overlayContent: { 
                  en: `### Join Us\n* **Mon:** Knitting Workshop (10 AM)\n* **Wed:** Digital Skills for Seniors (2 PM)`, 
                  he: `### בואו להשתתף\n* **שני:** סדנת סריגה (10:00)\n* **רביעי:** כישורים דיגיטליים לגיל הזהב (14:00)` 
                },
              },
              {
                id: 'SUGGEST',
                label: { en: 'Similar Books', he: 'ספרים דומים' },
                iconName: 'Sparkles',
                overlayTitle: { en: 'You Might Like...', he: 'אולי תאהבו גם...' },
                overlayContent: { 
                  en: `### Recommended for You\n* **"For Whom the Bell Tolls"** by Ernest Hemingway\n* **"Moby Dick"** by Herman Melville`, 
                  he: `### מומלץ עבורך\n* **"למי צלצלו הפעמונים"** מאת ארנסט המינגוויי\n* **"מובי דיק"** מאת הרמן מלוויל` 
                },
              },
            ]
          },
        },
      ],
    },
    {
      id: 'photo-journey',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'The Secret Life of a Photo', he: 'החיים הסודיים של תמונה' },
      shortDesc: { en: 'From camera to message.', he: 'מהמצלמה ועד להודעה.' },
      icon: <Camera size={20} />,
      steps: [
        { title: { en: 'Capture', he: 'צילום' }, content: { en: 'Learn how to take and share photos.', he: 'למדו איך לצלם ולשתף תמונות.' } },
        { title: { en: 'Try it', he: 'נסו זאת' }, content: { en: 'Interactive camera experience.', he: 'חוויית מצלמה אינטראקטיבית.' }, interactiveType: 'SIMULATED_PHOTO_JOURNEY' },
      ],
    },
    {
      id: 'digital-pharmacy',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'The Digital Pharmacy Refill', he: 'המרשם הדיגיטלי: חידוש תרופות' },
      shortDesc: { en: 'Learn to order medication refills from your phone.', he: 'למדו להזמין חידוש תרופות מהטלפון.' },
      icon: <Pill size={20} />,
      steps: [
        { title: { en: 'No More Waiting', he: 'לא מחכים יותר' }, content: { en: 'You can refill prescriptions online safely.', he: 'ניתן לחדש מרשמים באינטרנט בבטחה.' } },
        { title: { en: 'Place Your Order', he: 'בצעו את ההזמנה' }, content: { en: 'Enter the RX number and choose delivery.', he: 'הזינו את מספר המרשם ובחרו משלוח.' }, interactiveType: 'SIMULATED_PHARMACY' },
      ],
    },
    {
      id: 'online-maps',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Finding Your Way', he: 'מצאו את דרככם' },
      shortDesc: { en: 'Explore the world with digital maps.', he: 'חקרו את העולם עם מפות דיגיטליות.' },
      icon: <MapIcon size={20} />,
      steps: [
        { title: { en: 'Explore', he: 'חקרו' }, content: { en: 'Online maps help you find anything nearby.', he: 'מפות אונליין עוזרות לכם למצוא הכל בסביבה.' } },
        { title: { en: 'Search', he: 'חפשו' }, content: { en: 'Try searching for a local spot.', he: 'נסו לחפש מקום מקומי.' }, interactiveType: 'SIMULATED_MAP', interactiveData: { searchPlaceholder: { en: 'Search...', he: 'חפש...' } } },
      ],
    },
    {
      id: 'online-shopping',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Your First Online Purchase', he: 'הרכישה המקוונת הראשונה' },
      shortDesc: { en: 'Learn to safely buy items online.', he: 'למדו לקנות בבטחה באינטרנט.' },
      icon: <ShoppingCart size={20} />,
      steps: [
        { title: { en: 'Shopping', he: 'קניות' }, content: { en: 'Add items to your cart safely.', he: 'הוסיפו פריטים לעגלה בבטחה.' } },
        { title: { en: 'Checkout', he: 'תשלום' }, content: { en: 'Enter details for a secure payment.', he: 'הזינו פרטים לתשלום מאובטח.' }, interactiveType: 'SECURE_CHECKOUT', interactiveData: { productName: { en: 'Guide Book', he: 'ספר הדרכה' }, productPrice: '$19.99', billingPlaceholder: { en: 'Name', he: 'שם' }, addressPlaceholder: { en: 'Address', he: 'כתובת' }, cardPlaceholder: { en: 'Card', he: 'כרטיס' }, cvvPlaceholder: { en: 'CVV', he: 'קוד' }, payButton: { en: 'Pay', he: 'שלם' } } },
      ],
    },
    {
      id: 'spotting-scams',
      category: 'SAFETY' as LessonCategory,
      title: { en: 'Staying Safe: Spotting Scams', he: 'נשארים בטוחים: זיהוי הונאות' },
      shortDesc: { en: 'Identify fake messages and AI fakes.', he: 'זהו הודעות מזויפות וזיופי AI.' },
      icon: <ShieldAlert size={20} />,
      steps: [
        { title: { en: 'Detectives', he: 'בלשים' }, content: { en: 'Learn how to spot digital tricks.', he: 'למדו לזהות טריקים דיגיטליים.' } },
        { title: { en: 'Is it Real?', he: 'זה אמיתי?' }, content: { en: 'Move the lens to find AI mistakes.', he: 'הזיזו את העדשה למציאת טעויות AI.' }, interactiveType: 'SIMULATED_LENS', interactiveData: { backgroundPrompt: "A photo of people where one person has 6 fingers and the clock is warped.", targets: [{ x: 30, y: 55, label: { en: 'AI Error!', he: 'טעות AI!' } }] } },
        { title: { en: 'Quiz', he: 'בוחן' }, content: { en: 'What is the safest choice?', he: 'מהי הבחירה הבטוחה ביותר?' }, interactiveType: 'QUIZ', interactiveData: { question: { en: 'Stranger asks for money?', he: 'זר מבקש כסף?' }, options: [{ en: 'Send money', he: 'שלח כסף' }, { en: 'Call family to verify', he: 'התקשר למשפחה לוודא' }], correctAnswer: 1 } },
      ],
    },
    {
      id: 'ai-chat-intro',
      category: 'AI_BASICS' as LessonCategory,
      title: { en: 'Talking to AI', he: 'שיחה עם AI' },
      shortDesc: { en: 'Talk to an AI assistant.', he: 'שוחחו עם עוזר AI.' },
      icon: findCategoryIcon('AI_BASICS'),
      steps: [
        { title: { en: 'Introduction', he: 'הקדמה' }, content: { en: 'AI can help you with anything.', he: 'AI יכול לעזור לכם בכל דבר.' } },
        { title: { en: 'Chatting', he: 'שיחה' }, content: { en: 'Type your question.', he: 'הקלידו את שאלתכם.' }, interactiveType: 'LIVE_AI_CHAT', interactiveData: { placeholder: { en: 'Type here...', he: 'הקלידו כאן...' } } },
      ],
    },
    {
      id: 'ai-image-analysis',
      category: 'AI_BASICS' as LessonCategory,
      title: { en: 'AI Explains Pictures', he: 'AI מסביר תמונות' },
      shortDesc: { en: 'How AI sees the world.', he: 'איך ה-AI רואה את העולם.' },
      icon: <Eye size={20} />,
      steps: [
        { title: { en: 'AI Sight', he: 'ראיית AI' }, content: { en: 'AI can understand photos.', he: 'AI יכול להבין תמונות.' } },
        { title: { en: 'Identify', he: 'זיהוי' }, content: { en: 'Move the lens to identify objects.', he: 'הזיזו את העדשה לזיהוי חפצים.' }, interactiveType: 'SIMULATED_LENS', interactiveData: { backgroundPrompt: "A vibrant market scene with fruits.", targets: [{ x: 25, y: 40, label: { en: 'Apples', he: 'תפוחים' } }] } },
      ],
    },
    {
      id: 'bus-payments',
      category: 'INTERNET_SKILLS' as LessonCategory,
      title: { en: 'Digital Bus Payments', he: 'תשלום באוטובוס' },
      shortDesc: { en: 'Pay for your ride with your phone.', he: 'שלמו על הנסיעה עם הטלפון.' },
      icon: <Bus size={20} />,
      steps: [
        { title: { en: 'No Cash?', he: 'אין מזומן?' }, content: { en: 'Many buses now use QR codes for payment.', he: 'אוטובוסים רבים משתמשים כיום בקודי QR לתשלום.' } },
        { title: 'Pay', content: 'Scan the bus pole code.', interactiveType: 'SIMULATED_BUS_PAYMENT', interactiveData: { backgroundPrompt: "City bus interior with a yellow pole and QR code." } },
      ],
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
