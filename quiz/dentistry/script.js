const config = window.quizConfig;

const state = {
  currentQuestionIndex: 0,
  scores: {},
  selectedAnswers: [],
  resultKey: null
};

const elements = {
  headerTitle: document.getElementById("headerTitle"),
  headerSubtitle: document.getElementById("headerSubtitle"),
  projectTagline: document.getElementById("projectTagline"),
  startTitle: document.getElementById("startTitle"),
  startSubtitle: document.getElementById("startSubtitle"),
  startBenefits: document.getElementById("startBenefits"),
  startButton: document.getElementById("startButton"),
  startScreen: document.getElementById("startScreen"),
  questionScreen: document.getElementById("questionScreen"),
  questionCounter: document.getElementById("questionCounter"),
  progressBar: document.getElementById("progressBar"),
  questionTitle: document.getElementById("questionTitle"),
  questionHint: document.getElementById("questionHint"),
  answerList: document.getElementById("answerList"),
  resultScreen: document.getElementById("resultScreen"),
  resultKicker: document.getElementById("resultKicker"),
  resultTitle: document.getElementById("resultTitle"),
  resultDescription: document.getElementById("resultDescription"),
  recommendationsTitle: document.getElementById("recommendationsTitle"),
  recommendationsList: document.getElementById("recommendationsList"),
  resultCta: document.getElementById("resultCta"),
  leadForm: document.getElementById("leadForm"),
  formTitle: document.getElementById("formTitle"),
  formDescription: document.getElementById("formDescription"),
  nameLabel: document.getElementById("nameLabel"),
  contactLabel: document.getElementById("contactLabel"),
  commentLabel: document.getElementById("commentLabel"),
  leadName: document.getElementById("leadName"),
  leadContact: document.getElementById("leadContact"),
  leadComment: document.getElementById("leadComment"),
  leadConsent: document.getElementById("leadConsent"),
  submitButton: document.getElementById("submitButton"),
  successMessage: document.getElementById("successMessage"),
  restartButton: document.getElementById("restartButton"),
  footerText: document.getElementById("footerText")
};

function initQuiz() {
  if (!config) {
    console.error("Не найден config.js. Проверьте, что файл подключен перед script.js.");
    return;
  }

  applyTheme();
  renderStaticText();
  bindEvents();
  resetQuiz();
}

function applyTheme() {
  const colors = config.theme && config.theme.colors ? config.theme.colors : {};
  const root = document.documentElement;

  Object.keys(colors).forEach((colorName) => {
    root.style.setProperty(`--${colorName}`, colors[colorName]);
  });
}

function renderStaticText() {
  document.title = config.projectTitle;

  elements.headerTitle.textContent = config.projectTitle;
  elements.headerSubtitle.textContent = config.projectSubtitle;
  elements.projectTagline.textContent = config.projectTagline;
  elements.startTitle.textContent = config.projectTitle;
  elements.startSubtitle.textContent = config.projectSubtitle;
  elements.startButton.textContent = config.startButtonText;
  elements.resultKicker.textContent = config.uiText.resultKicker;
  elements.recommendationsTitle.textContent = config.uiText.recommendationsTitle;
  elements.formTitle.textContent = config.leadForm.title;
  elements.formDescription.textContent = config.leadForm.description;
  elements.nameLabel.textContent = config.leadForm.nameLabel;
  elements.contactLabel.textContent = config.leadForm.contactLabel;
  elements.commentLabel.textContent = config.leadForm.commentLabel;
  elements.leadName.placeholder = config.leadForm.namePlaceholder;
  elements.leadContact.placeholder = config.leadForm.contactPlaceholder;
  elements.leadComment.placeholder = config.leadForm.commentPlaceholder;
  elements.submitButton.textContent = config.leadForm.submitButtonText;
  elements.restartButton.textContent = config.restartButtonText;
  elements.footerText.textContent = config.footerText;

  elements.startBenefits.innerHTML = "";
  config.startBenefits.forEach((benefit) => {
    const item = document.createElement("li");
    item.textContent = benefit;
    elements.startBenefits.appendChild(item);
  });
}

function bindEvents() {
  elements.startButton.addEventListener("click", startQuiz);
  elements.restartButton.addEventListener("click", restartQuiz);
  elements.leadForm.addEventListener("submit", handleLeadSubmit);
}

function resetQuiz() {
  state.currentQuestionIndex = 0;
  state.selectedAnswers = [];
  state.resultKey = null;
  state.scores = {};

  Object.keys(config.results).forEach((resultKey) => {
    state.scores[resultKey] = 0;
  });

  elements.progressBar.style.width = "0%";
  elements.successMessage.classList.add("is-hidden");
  elements.successMessage.textContent = "";
  elements.leadForm.reset();
  elements.leadForm.classList.remove("is-hidden");
}

function startQuiz() {
  resetQuiz();
  showScreen("question");
  renderQuestion();
}

function renderQuestion() {
  const question = config.questions[state.currentQuestionIndex];
  const questionNumber = state.currentQuestionIndex + 1;
  const totalQuestions = config.questions.length;
  const progress = ((state.currentQuestionIndex) / totalQuestions) * 100;

  elements.questionCounter.textContent = `${config.uiText.questionCounter} ${questionNumber} из ${totalQuestions}`;
  elements.progressBar.style.width = `${progress}%`;
  elements.questionTitle.textContent = question.text;
  elements.questionHint.textContent = question.hint || "";
  elements.answerList.innerHTML = "";

  question.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = answer.text;
    button.setAttribute(
      "aria-label",
      `${config.uiText.answerButtonAriaPrefix}: ${answer.text}`
    );
    button.addEventListener("click", () => selectAnswer(answer, answerIndex));

    elements.answerList.appendChild(button);
  });
}

function selectAnswer(answer, answerIndex) {
  addPoints(answer.points);

  state.selectedAnswers.push({
    questionId: config.questions[state.currentQuestionIndex].id,
    answerIndex,
    answerText: answer.text,
    points: answer.points
  });

  state.currentQuestionIndex += 1;

  if (state.currentQuestionIndex >= config.questions.length) {
    showResult();
    return;
  }

  renderQuestion();
}

function addPoints(points) {
  Object.keys(points).forEach((resultKey) => {
    if (state.scores[resultKey] === undefined) {
      state.scores[resultKey] = 0;
    }

    state.scores[resultKey] += points[resultKey];
  });
}

function getWinningResultKey() {
  let winningKey = Object.keys(state.scores)[0];
  let winningScore = state.scores[winningKey];

  Object.keys(state.scores).forEach((resultKey) => {
    if (state.scores[resultKey] > winningScore) {
      winningKey = resultKey;
      winningScore = state.scores[resultKey];
    }
  });

  return winningKey;
}

function showResult() {
  state.resultKey = getWinningResultKey();
  const result = config.results[state.resultKey];

  elements.progressBar.style.width = "100%";
  elements.resultTitle.textContent = result.title;
  elements.resultDescription.textContent = result.description;
  elements.resultCta.textContent = result.ctaText;
  elements.recommendationsList.innerHTML = "";

  result.recommendations.forEach((recommendation) => {
    const item = document.createElement("li");
    item.textContent = recommendation;
    elements.recommendationsList.appendChild(item);
  });

  showScreen("result");
}

function handleLeadSubmit(event) {
  event.preventDefault();

  const leadData = {
    projectTitle: config.projectTitle,
    resultKey: state.resultKey,
    resultTitle: config.results[state.resultKey].title,
    name: elements.leadName.value.trim(),
    contact: elements.leadContact.value.trim(),
    comment: elements.leadComment.value.trim(),
    // факт согласия пишем в заявку: заказчику это нужно как доказательство
    consentGiven: elements.leadConsent.checked,
    consentText: elements.leadConsent.closest(".lead-consent").innerText.trim(),
    answers: state.selectedAnswers,
    createdAt: new Date().toISOString()
  };

  console.log("Новая заявка из квиза:", leadData);

  elements.leadForm.classList.add("is-hidden");
  elements.successMessage.textContent = config.leadForm.successMessage;
  elements.successMessage.classList.remove("is-hidden");
}

function restartQuiz() {
  resetQuiz();
  showScreen("start");
}

function showScreen(screenName) {
  elements.startScreen.classList.toggle("is-hidden", screenName !== "start");
  elements.questionScreen.classList.toggle("is-hidden", screenName !== "question");
  elements.resultScreen.classList.toggle("is-hidden", screenName !== "result");
}

document.addEventListener("DOMContentLoaded", initQuiz);
