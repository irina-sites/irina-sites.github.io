// Демо-конфиг: юридическая компания "СТАТУС" (вымышленный бренд для портфолио).
window.quizConfig = {
  projectTitle: "СТАТУС",
  projectSubtitle: "Оценим вашу ситуацию и подскажем, какой шаг сделать первым",
  projectTagline: "Предварительная оценка · 7 вопросов",
  startButtonText: "Оценить ситуацию",
  restartButtonText: "Пройти еще раз",
  footerText: "СТАТУС — вымышленный бренд. Демо-квиз для портфолио, работает локально без сервера.",

  startBenefits: [
    "Уточним суть ситуации, сроки и документы",
    "Определим, насколько срочно нужна помощь",
    "Подскажем следующий шаг до консультации"
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
      background: "#f2eee5",
      surface: "#fffdf8",
      surfaceMuted: "#ece7db",
      text: "#1c1f26",
      muted: "#6b6a63",
      primary: "#6f2232",
      primaryDark: "#4d1523",
      accent: "#b08a4a",
      border: "#d8d2c4",
      success: "#2f6b4f"
    }
  },

  leadForm: {
    title: "Записаться на консультацию",
    description: "Оставьте контакт — юрист «Статуса» свяжется и подскажет план действий.",
    nameLabel: "Имя",
    namePlaceholder: "Например, Алексей",
    contactLabel: "Телефон или Telegram",
    contactPlaceholder: "+7 999 000-00-00 или @username",
    commentLabel: "Комментарий",
    commentPlaceholder: "Коротко опишите вашу ситуацию",
    submitButtonText: "Оставить заявку",
    successMessage: "Заявка сохранена. В реальном проекте её можно подключить к CRM или почте юриста."
  },

  questions: [
    {
      id: "situation",
      text: "Какая у вас ситуация?",
      hint: "Выберите то, что ближе всего к вашему случаю.",
      answers: [
        { text: "Спор с человеком или компанией", points: { disputeStrategy: 3 } },
        { text: "Документы или договор", points: { documentsPrep: 3 } },
        { text: "Суд или претензия", points: { urgentHelp: 3 } },
        { text: "Хочу заранее защититься", points: { preventiveConsultation: 3 } }
      ]
    },
    {
      id: "deadline",
      text: "Есть ли сроки?",
      hint: "Сроки влияют на то, как быстро нужно действовать.",
      answers: [
        { text: "Срок горит", points: { urgentHelp: 3 } },
        { text: "Есть несколько дней", points: { urgentHelp: 2, disputeStrategy: 1 } },
        { text: "Есть несколько недель", points: { documentsPrep: 2 } },
        { text: "Сроков пока нет", points: { preventiveConsultation: 2 } }
      ]
    },
    {
      id: "documents",
      text: "Есть ли документы?",
      hint: "Это поможет юристу понять объем подготовки.",
      answers: [
        { text: "Да, все есть", points: { documentsPrep: 2, disputeStrategy: 1 } },
        { text: "Часть документов есть", points: { documentsPrep: 2 } },
        { text: "Документов мало", points: { urgentHelp: 1, documentsPrep: 1 } },
        { text: "Не знаю, что нужно", points: { preventiveConsultation: 2 } }
      ]
    },
    {
      id: "prior_lawyer",
      text: "Вы уже обращались к юристу?",
      hint: "Так специалист поймет контекст вашего вопроса.",
      answers: [
        { text: "Да, нужен второй взгляд", points: { disputeStrategy: 2 } },
        { text: "Нет", points: { preventiveConsultation: 1, documentsPrep: 1 } },
        { text: "Была консультация, но не помогла", points: { disputeStrategy: 2, urgentHelp: 1 } },
        { text: "Только ищу варианты", points: { preventiveConsultation: 2 } }
      ]
    },
    {
      id: "desired_result",
      text: "Что хотите получить?",
      hint: "Выберите то, что ближе всего к вашей цели.",
      answers: [
        { text: "Понять риски", points: { preventiveConsultation: 3 } },
        { text: "Подготовить документы", points: { documentsPrep: 3 } },
        { text: "Вести спор", points: { disputeStrategy: 3 } },
        { text: "Получить план действий", points: { urgentHelp: 1, preventiveConsultation: 1 } }
      ]
    },
    {
      id: "financial_weight",
      text: "Насколько ситуация важна финансово?",
      hint: "Это влияет на то, какая стратегия оправдана.",
      answers: [
        { text: "Сумма большая", points: { disputeStrategy: 3 } },
        { text: "Сумма средняя", points: { documentsPrep: 1, disputeStrategy: 1 } },
        { text: "Больше важен принцип", points: { disputeStrategy: 2 } },
        { text: "Пока не понимаю риски", points: { preventiveConsultation: 2 } }
      ]
    },
    {
      id: "readiness",
      text: "Готовы обсудить ситуацию на консультации?",
      hint: "Так юрист поймет, насколько быстро стоит связаться.",
      answers: [
        { text: "Да, чем быстрее, тем лучше", points: { urgentHelp: 3 } },
        { text: "Да, но хочу понять стоимость", points: { documentsPrep: 1, disputeStrategy: 1 } },
        { text: "Возможно", points: { preventiveConsultation: 2 } },
        { text: "Пока просто изучаю", points: { preventiveConsultation: 2 } }
      ]
    }
  ],

  results: {
    urgentHelp: {
      title: "Срочная юридическая помощь",
      description: "У вас есть сроки, риски или конфликт. Нужно быстро разобрать документы.",
      recommendations: [
        "Соберите все документы и переписку по ситуации до консультации.",
        "Не подписывайте и не отправляйте ничего до разговора с юристом.",
        "Зафиксируйте точные даты и сроки, которые у вас есть."
      ],
      ctaText: "Оставьте заявку, и юрист свяжется с вами в приоритетном порядке."
    },
    documentsPrep: {
      title: "Подготовка документов",
      description: "Ситуация не горит, но нужен договор, претензия, заявление или правка документов.",
      recommendations: [
        "Опишите юристу цель документа и с кем вы взаимодействуете.",
        "Соберите вводные данные: стороны, суммы, сроки, договоренности.",
        "Уточните, нужна ли дополнительная проверка документа второй стороной."
      ],
      ctaText: "Оставьте заявку, и юрист поможет подготовить нужный документ."
    },
    disputeStrategy: {
      title: "Стратегия по спору",
      description: "У вас есть конфликт, суд или серьезные финансовые последствия.",
      recommendations: [
        "Соберите хронологию событий и все доказательства по делу.",
        "Обсудите с юристом реалистичные сценарии исхода, а не только лучший.",
        "Уточните примерные сроки и стоимость ведения дела."
      ],
      ctaText: "Оставьте заявку, и юрист поможет выстроить стратегию по вашему делу."
    },
    preventiveConsultation: {
      title: "Профилактическая консультация",
      description: "Вы хотите заранее понять риски и не наломать дров.",
      recommendations: [
        "Опишите юристу ситуацию и то, чего вы хотите избежать.",
        "Уточните, какие риски реальны, а какие маловероятны.",
        "Попросите короткий план действий на случай, если ситуация изменится."
      ],
      ctaText: "Оставьте заявку, и юрист поможет разобрать риски заранее."
    }
  }
};
