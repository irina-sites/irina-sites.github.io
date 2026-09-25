// Демо-конфиг: онлайн-школа "МАСТЕРСКАЯ" (вымышленный бренд для портфолио).
window.quizConfig = {
  projectTitle: "МАСТЕРСКАЯ",
  projectSubtitle: "Подберём формат обучения под вашу цель, опыт и свободное время",
  projectTagline: "7 вопросов · 2 минуты",
  startButtonText: "Подобрать формат",
  restartButtonText: "Пройти еще раз",
  footerText: "МАСТЕРСКАЯ — вымышленный бренд. Демо-квиз для портфолио, работает локально без сервера.",

  startBenefits: [
    "Поймём, с какого уровня вы стартуете",
    "Подберём формат: записи, созвоны или сопровождение",
    "Скажем, сколько времени реально понадобится"
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
      background: "#f4f2ff",
      surface: "#ffffff",
      surfaceMuted: "#efebff",
      text: "#1b1338",
      muted: "#6d6795",
      primary: "#6c3ef4",
      primaryDark: "#5429d6",
      accent: "#ffd166",
      border: "#1b1338",
      success: "#10916a"
    }
  },

  leadForm: {
    title: "Получить подбор программы",
    description: "Оставьте контакт — куратор «Мастерской» подскажет, какой формат подойдёт именно вам.",
    nameLabel: "Имя",
    namePlaceholder: "Например, Алексей",
    contactLabel: "Телефон или Telegram",
    contactPlaceholder: "+7 999 000-00-00 или @username",
    commentLabel: "Комментарий",
    commentPlaceholder: "Коротко опишите, чего хотите добиться",
    submitButtonText: "Оставить заявку",
    successMessage: "Заявка сохранена. В реальном проекте её можно подключить к CRM школы или Telegram."
  },

  questions: [
    {
      id: "main_goal",
      text: "Какая у вас главная цель?",
      hint: "Выберите то, что ближе всего к вашей ситуации.",
      answers: [
        { text: "Разобраться с нуля", points: { beginner: 3 } },
        { text: "Начать применять на практике", points: { practitioner: 2, readyForProgram: 1 } },
        { text: "Получить клиентов", points: { readyForProgram: 2, consultation: 1 } },
        { text: "Выстроить систему", points: { readyForProgram: 3 } }
      ]
    },
    {
      id: "experience",
      text: "Какой опыт уже есть?",
      hint: "Это поможет подобрать подходящий уровень программы.",
      answers: [
        { text: "Почти нет", points: { beginner: 3 } },
        { text: "Смотрел бесплатные материалы", points: { beginner: 2, practitioner: 1 } },
        { text: "Уже пробовал, но хаотично", points: { practitioner: 3 } },
        { text: "Есть результаты, хочу усилить", points: { readyForProgram: 2, consultation: 1 } }
      ]
    },
    {
      id: "blocker",
      text: "Что сейчас мешает?",
      hint: "Так проще понять, чего вам не хватает.",
      answers: [
        { text: "Не понимаю, с чего начать", points: { beginner: 3 } },
        { text: "Много информации", points: { practitioner: 2 } },
        { text: "Нет системы", points: { practitioner: 2, readyForProgram: 1 } },
        { text: "Не хватает обратной связи", points: { readyForProgram: 2, consultation: 1 } }
      ]
    },
    {
      id: "time_available",
      text: "Сколько времени готовы выделять?",
      hint: "Так проще подобрать реалистичный темп обучения.",
      answers: [
        { text: "2–3 часа в неделю", points: { beginner: 2 } },
        { text: "4–6 часов в неделю", points: { practitioner: 2 } },
        { text: "Почти каждый день", points: { readyForProgram: 2 } },
        { text: "Готов интенсивно, если будет результат", points: { readyForProgram: 2, consultation: 1 } }
      ]
    },
    {
      id: "priority",
      text: "Что для вас важнее?",
      hint: "Выберите то, что важнее всего в обучении.",
      answers: [
        { text: "Простые объяснения", points: { beginner: 3 } },
        { text: "Практика", points: { practitioner: 3 } },
        { text: "Поддержка", points: { readyForProgram: 2, consultation: 1 } },
        { text: "Быстрый результат", points: { consultation: 2, readyForProgram: 1 } }
      ]
    },
    {
      id: "format",
      text: "Какой формат удобнее?",
      hint: "Так проще подобрать подходящую программу.",
      answers: [
        { text: "Уроки в записи", points: { beginner: 2 } },
        { text: "Живые созвоны", points: { practitioner: 2 } },
        { text: "Задания и проверка", points: { readyForProgram: 2 } },
        { text: "Личное сопровождение", points: { consultation: 3 } }
      ]
    },
    {
      id: "readiness",
      text: "Когда хотите начать?",
      hint: "Это поможет понять, насколько срочно вам нужна программа.",
      answers: [
        { text: "Сейчас", points: { readyForProgram: 2, consultation: 1 } },
        { text: "В ближайшие дни", points: { practitioner: 2 } },
        { text: "В течение месяца", points: { beginner: 2 } },
        { text: "Пока изучаю варианты", points: { consultation: 2, beginner: 1 } }
      ]
    }
  ],

  results: {
    beginner: {
      title: "Новичок",
      description: "Вам нужна простая дорожная карта без перегруза.",
      recommendations: [
        "Начните с одного простого шага, а не всей программы сразу.",
        "Выберите формат с четкой структурой: урок → задание → результат.",
        "Не сравнивайте себя с продвинутыми учениками на старте."
      ],
      ctaText: "Оставьте заявку, и мы подберем понятный вводный формат обучения."
    },
    practitioner: {
      title: "Практик",
      description: "Вы уже пробовали, но вам не хватает структуры и регулярной практики.",
      recommendations: [
        "Определите 2–3 конкретных пробела, которые мешают двигаться дальше.",
        "Выберите формат с обратной связью, а не только уроки в записи.",
        "Договоритесь с собой о регулярной практике 2–3 раза в неделю."
      ],
      ctaText: "Оставьте заявку, и мы поможем выстроить систему вместо хаотичной практики."
    },
    readyForProgram: {
      title: "Готов к программе",
      description: "У вас есть цель, время и желание двигаться по системе.",
      recommendations: [
        "Выберите программу с четким результатом на выходе, а не просто набором уроков.",
        "Заложите регулярное время в календарь заранее.",
        "Обсудите с куратором, как будет выглядеть прогресс по неделям."
      ],
      ctaText: "Оставьте заявку, и мы подберем программу под вашу цель и темп."
    },
    consultation: {
      title: "Кандидат на консультацию",
      description: "У вас есть конкретная задача, и лучше сначала разобрать ситуацию на созвоне.",
      recommendations: [
        "Сформулируйте одну главную задачу, которую хотите решить.",
        "Подготовьте вопросы про формат, сроки и стоимость обучения.",
        "Обсудите на созвоне, какой формат даст нужный результат быстрее всего."
      ],
      ctaText: "Оставьте заявку, и мы разберем вашу задачу на бесплатной консультации."
    }
  }
};
