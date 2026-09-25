// Демо-конфиг: студия косметологии "ШЁЛК" (вымышленный бренд для портфолио).
window.quizConfig = {
  projectTitle: "ШЁЛК",
  projectSubtitle: "Мини-диагностика кожи: подбираем процедуру спокойно и по делу",
  projectTagline: "Диагностика кожи · 7 вопросов",
  startButtonText: "Начать диагностику",
  restartButtonText: "Пройти еще раз",
  footerText: "ШЁЛК — вымышленный бренд. Демо-квиз для портфолио, работает локально без сервера.",

  startBenefits: [
    "Спросим про тип кожи, цель и чувствительность",
    "Назовём процедуру, с которой стоит начать",
    "Ничего не навязываем — решение остаётся за вами"
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
      background: "#fdf3f5",
      surface: "#fffafb",
      surfaceMuted: "#fbe6ec",
      text: "#3c2029",
      muted: "#9c7480",
      primary: "#c9587a",
      primaryDark: "#a53d5f",
      accent: "#e7b96f",
      border: "#f3d5de",
      success: "#6f9478"
    }
  },

  leadForm: {
    title: "Записаться на подбор процедуры",
    description: "Оставьте контакт — косметолог «Шёлка» подскажет, с чего начать именно вам.",
    nameLabel: "Имя",
    namePlaceholder: "Например, Алексей",
    contactLabel: "Телефон или Telegram",
    contactPlaceholder: "+7 999 000-00-00 или @username",
    commentLabel: "Комментарий",
    commentPlaceholder: "Коротко опишите, что хотите улучшить",
    submitButtonText: "Оставить заявку",
    successMessage: "Заявка сохранена. В реальном проекте её можно подключить к CRM студии или Telegram."
  },

  questions: [
    {
      id: "goal",
      text: "Что вы хотите улучшить в первую очередь?",
      hint: "Выберите то, что беспокоит больше всего прямо сейчас.",
      answers: [
        { text: "Увлажнение и свежесть", points: { gentleCare: 3 } },
        { text: "Высыпания", points: { skinProblem: 3 } },
        { text: "Морщины и тонус", points: { antiAge: 3 } },
        { text: "Пигментацию или неровный тон", points: { skinProblem: 2, antiAge: 1 } }
      ]
    },
    {
      id: "skin_type",
      text: "Какой у вас тип кожи?",
      hint: "Это влияет на выбор подходящей процедуры.",
      answers: [
        { text: "Сухая", points: { gentleCare: 2 } },
        { text: "Жирная", points: { skinProblem: 2 } },
        { text: "Комбинированная", points: { gentleCare: 1, skinProblem: 1 } },
        { text: "Не знаю", points: { consultation: 2 } }
      ]
    },
    {
      id: "sensitivity",
      text: "Есть ли чувствительность?",
      hint: "Чувствительная кожа требует более бережного подхода.",
      answers: [
        { text: "Да, кожа часто реагирует", points: { gentleCare: 3 } },
        { text: "Иногда", points: { gentleCare: 1, skinProblem: 1 } },
        { text: "Почти нет", points: { antiAge: 1 } },
        { text: "Не замечала", points: { consultation: 1 } }
      ]
    },
    {
      id: "frequency",
      text: "Как часто вы ходите к косметологу?",
      hint: "Так специалисту проще понять точку старта.",
      answers: [
        { text: "Регулярно", points: { antiAge: 2 } },
        { text: "Пару раз в год", points: { gentleCare: 1, skinProblem: 1 } },
        { text: "Давно не была", points: { consultation: 2 } },
        { text: "Никогда не была", points: { consultation: 3 } }
      ]
    },
    {
      id: "desired_result",
      text: "Какой результат хотите?",
      hint: "Выберите то, что ближе всего к вашей цели.",
      answers: [
        { text: "Быстрый свежий вид", points: { gentleCare: 3 } },
        { text: "Решить конкретную проблему", points: { skinProblem: 3 } },
        { text: "Антивозрастной уход", points: { antiAge: 3 } },
        { text: "Подобрать план ухода", points: { consultation: 3 } }
      ]
    },
    {
      id: "blocker",
      text: "Что вас останавливает?",
      hint: "Это поможет специалисту снять ваши сомнения заранее.",
      answers: [
        { text: "Боюсь ошибиться с процедурой", points: { consultation: 3 } },
        { text: "Не знаю цену", points: { consultation: 2 } },
        { text: "Боюсь боли", points: { gentleCare: 2 } },
        { text: "Нет времени", points: { gentleCare: 1, skinProblem: 1 } }
      ]
    },
    {
      id: "readiness",
      text: "Когда готовы прийти?",
      hint: "Так проще подобрать удобную запись.",
      answers: [
        { text: "В ближайшие дни", points: { skinProblem: 2, antiAge: 1 } },
        { text: "На этой или следующей неделе", points: { gentleCare: 2 } },
        { text: "В течение месяца", points: { antiAge: 2 } },
        { text: "Пока выбираю", points: { consultation: 2 } }
      ]
    }
  ],

  results: {
    gentleCare: {
      title: "Нужен мягкий уход",
      description: "Вам подойдет бережная процедура: увлажнение, восстановление и базовая диагностика.",
      recommendations: [
        "Начните с базовой диагностики кожи у косметолога.",
        "Выберите щадящую процедуру: увлажнение или легкий пилинг.",
        "Заведите простой уходовый ритуал на каждый день."
      ],
      ctaText: "Оставьте заявку, и специалист подберет мягкую процедуру под вашу кожу."
    },
    skinProblem: {
      title: "Нужно решить проблему кожи",
      description: "У вас есть запрос на высыпания, пигментацию, чувствительность или неровный тон.",
      recommendations: [
        "Опишите специалисту, когда и как часто появляется проблема.",
        "Не начинайте агрессивные процедуры без диагностики.",
        "Составьте с косметологом курс из нескольких процедур, а не разовый визит."
      ],
      ctaText: "Оставьте заявку, и специалист подберет процедуру под вашу проблему."
    },
    antiAge: {
      title: "Антивозрастной запрос",
      description: "Вы хотите поработать с тонусом, морщинами и общим качеством кожи.",
      recommendations: [
        "Уточните у косметолога, какие процедуры дают эффект именно для вашего возраста.",
        "Спланируйте курс процедур, а не одно разовое посещение.",
        "Спросите про поддерживающий уход между процедурами."
      ],
      ctaText: "Оставьте заявку, и специалист подберет антивозрастную программу."
    },
    consultation: {
      title: "Кандидат на консультацию",
      description: "Вы не уверены в процедуре, и вам нужен очный подбор.",
      recommendations: [
        "Придите на консультацию без ожиданий конкретной процедуры.",
        "Расскажите специалисту о своих целях и опасениях.",
        "Попросите объяснить простыми словами, что происходит на каждом этапе."
      ],
      ctaText: "Оставьте заявку, и специалист поможет разобраться, с чего начать."
    }
  }
};
