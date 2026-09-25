// Демо-конфиг: студия тренировок "ПУЛЬС" (вымышленный бренд для портфолио).
window.quizConfig = {
  projectTitle: "ПУЛЬС",
  projectSubtitle: "Подберём старт: тренировки, питание или всё вместе",
  projectTagline: "8 вопросов · без фанатизма",
  startButtonText: "Погнали",
  restartButtonText: "Пройти еще раз",
  footerText: "ПУЛЬС — вымышленный бренд. Демо-квиз для портфолио, работает локально без сервера.",

  startBenefits: [
    "Разберём цель, режим и ограничения",
    "Скажем, с чего начать, чтобы не перегореть",
    "Подберём программу под ваш график"
  ],

  uiText: {
    questionCounter: "Вопрос",
    resultKicker: "Ваш результат",
    recommendationsTitle: "3 рекомендации",
    scoreLabel: "Сегмент",
    answerButtonAriaPrefix: "Выбрать ответ"
  },

  theme: {
    colors: {
      background: "#0d0f12",
      surface: "#16191f",
      surfaceMuted: "#1d2128",
      text: "#ffffff",
      muted: "#98a1ad",
      primary: "#c8ff2f",
      primaryDark: "#a8e017",
      accent: "#ff5c28",
      border: "#262b33",
      success: "#7ee787"
    }
  },

  leadForm: {
    title: "Забрать программу",
    description: "Оставьте контакт — тренер «Пульса» подскажет, с чего начать именно вам.",
    nameLabel: "Имя",
    namePlaceholder: "Например, Алексей",
    contactLabel: "Телефон или Telegram",
    contactPlaceholder: "+7 999 000-00-00 или @username",
    commentLabel: "Комментарий",
    commentPlaceholder: "Коротко опишите вашу цель",
    submitButtonText: "Оставить заявку",
    successMessage: "Заявка сохранена. В реальном проекте её можно подключить к CRM или Telegram тренера."
  },

  questions: [
    {
      id: "main_goal",
      text: "Какая главная цель?",
      hint: "Выберите то, что важнее всего прямо сейчас.",
      answers: [
        { text: "Похудеть", points: { nutritionFocus: 2, complexProgram: 1 } },
        { text: "Набрать форму", points: { startMotion: 2, complexProgram: 1 } },
        { text: "Улучшить питание", points: { nutritionFocus: 3 } },
        { text: "Вернуть энергию", points: { startMotion: 3 } }
      ]
    },
    {
      id: "current_routine",
      text: "Какой у вас текущий режим?",
      hint: "Это поможет понять, с какой нагрузки начать.",
      answers: [
        { text: "Тренируюсь регулярно", points: { complexProgram: 2 } },
        { text: "Иногда тренируюсь", points: { startMotion: 2 } },
        { text: "Почти не двигаюсь", points: { startMotion: 3 } },
        { text: "Хаотичный режим", points: { consultation: 2, startMotion: 1 } }
      ]
    },
    {
      id: "hardest_part",
      text: "Что сложнее всего?",
      hint: "Так тренер поймет, на чем сделать акцент.",
      answers: [
        { text: "Питание", points: { nutritionFocus: 3 } },
        { text: "Дисциплина", points: { startMotion: 2 } },
        { text: "Нехватка времени", points: { startMotion: 1, nutritionFocus: 1 } },
        { text: "Не знаю, что делать", points: { consultation: 3 } }
      ]
    },
    {
      id: "health_limits",
      text: "Есть ли ограничения по здоровью?",
      hint: "Это важно учесть перед началом тренировок.",
      answers: [
        { text: "Да, есть", points: { consultation: 3 } },
        { text: "Возможно, нужно уточнить", points: { consultation: 2 } },
        { text: "Нет", points: { complexProgram: 1, startMotion: 1 } },
        { text: "Не знаю", points: { consultation: 1 } }
      ]
    },
    {
      id: "time_available",
      text: "Сколько времени готовы выделять?",
      hint: "Так проще подобрать реалистичный график.",
      answers: [
        { text: "2 раза в неделю", points: { startMotion: 2 } },
        { text: "3–4 раза в неделю", points: { complexProgram: 2 } },
        { text: "Каждый день по чуть-чуть", points: { nutritionFocus: 1, startMotion: 1 } },
        { text: "Пока не понимаю", points: { consultation: 2 } }
      ]
    },
    {
      id: "format",
      text: "Какой формат удобнее?",
      hint: "Выберите то, что реально впишется в ваш график.",
      answers: [
        { text: "Зал", points: { complexProgram: 2 } },
        { text: "Дом", points: { startMotion: 2 } },
        { text: "Онлайн", points: { nutritionFocus: 1, startMotion: 1 } },
        { text: "Смешанный формат", points: { complexProgram: 2 } }
      ]
    },
    {
      id: "month_result",
      text: "Что хотите получить через месяц?",
      hint: "Это поможет сформулировать первую цель.",
      answers: [
        { text: "Минус вес", points: { nutritionFocus: 2 } },
        { text: "Больше энергии", points: { startMotion: 2 } },
        { text: "Понятное питание", points: { nutritionFocus: 3 } },
        { text: "Привычку тренироваться", points: { startMotion: 2, complexProgram: 1 } }
      ]
    },
    {
      id: "readiness",
      text: "Когда готовы начать?",
      hint: "Так специалист поймет, насколько срочно вам нужна программа.",
      answers: [
        { text: "Сейчас", points: { complexProgram: 2 } },
        { text: "На этой неделе", points: { startMotion: 2 } },
        { text: "В течение месяца", points: { nutritionFocus: 1, consultation: 1 } },
        { text: "Пока присматриваюсь", points: { consultation: 3 } }
      ]
    }
  ],

  results: {
    startMotion: {
      title: "Старт с движения",
      description: "Вам нужно мягко войти в режим и не перегореть в первую неделю.",
      recommendations: [
        "Начните с 2 коротких тренировок в неделю, не больше.",
        "Выберите формат, который реально впишется в график: дом или зал.",
        "Отслеживайте не вес, а факт тренировки — это удержит мотивацию."
      ],
      ctaText: "Оставьте заявку, и тренер поможет с мягким стартом без перегруза."
    },
    nutritionFocus: {
      title: "Фокус на питании",
      description: "Главная точка роста — рацион, режим и понятные пищевые привычки.",
      recommendations: [
        "Начните с дневника питания на 3–5 дней, без изменений в рационе.",
        "Уберите 1–2 самые очевидные проблемы в питании, а не всё сразу.",
        "Обсудите с нутрициологом реальный, а не идеальный рацион."
      ],
      ctaText: "Оставьте заявку, и нутрициолог поможет выстроить понятное питание."
    },
    complexProgram: {
      title: "Комплексная программа",
      description: "Вам нужны тренировки, питание и сопровождение в одной системе.",
      recommendations: [
        "Определите одну главную цель на ближайшие 1–2 месяца.",
        "Согласуйте с тренером связку: тренировки + питание + контроль прогресса.",
        "Планируйте регулярные точки сверки результата, а не только тренировки."
      ],
      ctaText: "Оставьте заявку, и тренер соберет комплексную программу под вашу цель."
    },
    consultation: {
      title: "Кандидат на консультацию",
      description: "У вас есть ограничения, сомнения или непонятная стартовая точка.",
      recommendations: [
        "Расскажите тренеру про ограничения по здоровью до начала тренировок.",
        "Обсудите реалистичный график, который вы сможете держать.",
        "Попросите объяснить, с чего начать именно в вашем случае."
      ],
      ctaText: "Оставьте заявку, и специалист поможет разобраться, с чего начать безопасно."
    }
  }
};
