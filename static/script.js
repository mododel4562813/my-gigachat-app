/* ========================================================
   ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
   ======================================================== */
const themeBtn = document.getElementById('themeBtn');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

applyTheme(localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'));

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/* ========================================================
   МЕНЮ С ТРЕМЯ ТОЧКАМИ
   ======================================================== */
const menuBtn = document.getElementById('menuBtn');
const menuEl = document.getElementById('menu');

if (menuBtn && menuEl) {
    menuBtn.addEventListener('click', () => menuEl.classList.toggle('open'));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menuEl.classList.remove('open');
    });
    document.addEventListener('click', (e) => {
        if (!menuEl.contains(e.target) && !menuBtn.contains(e.target)) {
            menuEl.classList.remove('open');
        }
    });
}

// ---------- Вход / регистрация ----------
let currentUser = localStorage.getItem("veraUser") || null;

function switchTab(tab) {
    document.getElementById("tabLogin").classList.toggle("active", tab === "login");
    document.getElementById("tabRegister").classList.toggle("active", tab === "register");
    document.getElementById("authBtn").innerText = tab === "login" ? "Войти" : "Зарегистрироваться";
    document.getElementById("authBtn").onclick = doAuth;
    document.getElementById("authStatus").innerText = "";
}

async function doAuth() {
    const isLogin = document.getElementById("tabLogin").classList.contains("active");
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    const status = document.getElementById("authStatus");

    if (!username || !password) {
        status.className = "auth-status err";
        status.innerText = "Заполните оба поля";
        return;
    }

    try {
        const resp = await fetch(isLogin ? "/api/login" : "/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password })
        });
        const data = await resp.json();

        if (data.error) {
            status.className = "auth-status err";
            status.innerText = data.error;
        } else {
            currentUser = data.username;
            localStorage.setItem("veraUser", currentUser);
            showUser();
            status.className = "auth-status ok";
            status.innerText = isLogin ? "Добро пожаловать!" : "Аккаунт создан!";
        }
    } catch (e) {
        status.className = "auth-status err";
        status.innerText = "Ошибка соединения";
    }
}

function showUser() {
    const authBox = document.getElementById("authBox");
    const userBox = document.getElementById("userBox");
    if (currentUser) {
        document.getElementById("userNameChip").innerText = currentUser;
        authBox.classList.add("hidden");
        userBox.classList.remove("hidden");
        document.getElementById("reviewName").value = currentUser;
    } else {
        authBox.classList.remove("hidden");
        userBox.classList.add("hidden");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem("veraUser");
    document.getElementById("reviewName").value = "";
    showUser();
}

// ---------- Проверка факта ----------
window.lastCheckedClaim = null;
window.lastVerdict = null;

async function sendCheck() {
    const userText = document.getElementById('userText').value.trim();
    if (!userText) return;

    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('btnSpinner');
    const checkBtn = document.getElementById('checkBtn');
    const resultDiv = document.getElementById('result');

    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    checkBtn.disabled = true;

    try {
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: userText, username: currentUser || '' })
        });

        const data = await response.json();

        document.getElementById('claimText').innerText = userText;
        document.getElementById('explanationText').innerText = data.explanation;

        const badge = document.getElementById('verdictBadge');
        badge.className = 'verdict-badge ' + data.verdict.toLowerCase();
        badge.innerText = data.verdict;

        resultDiv.classList.remove('hidden');

        window.lastCheckedClaim = userText;
        window.lastVerdict = data.verdict + '. ' + data.explanation;
        const challengeOpen = document.getElementById('challengeOpen');
        if (challengeOpen) challengeOpen.hidden = false;
    } catch (error) {
        console.error(error);
        alert('Ошибка при проверке факта. Проверьте консоль и соединение с API.');
    } finally {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        checkBtn.disabled = false;
    }
}

// ---------- Рейтинг ----------
async function rate(value) {
    const claim = document.getElementById('claimText').innerText;
    const msgDiv = document.getElementById('ratingMessage');

    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((h, idx) => {
        if (idx < value) h.classList.add('active');
        else h.classList.remove('active');
    });

    try {
        await fetch('/api/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claim: claim, rating: value, username: currentUser || '' })
        });
        msgDiv.innerText = 'Спасибо за оценку!';
    } catch (e) {
        console.error(e);
    }
}

// ---------- Отзывы и комментарии ----------
async function submitReview() {
    const name = currentUser || document.getElementById('reviewName').value.trim() || 'Аноним';
    const review = document.getElementById('reviewText').value.trim();
    if (!review) return;

    try {
        await fetch('/api/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, review: review })
        });
        alert('Отзыв успешно отправлен!');
        document.getElementById('reviewText').value = '';
        loadReviews();
    } catch (e) {
        alert('Не удалось отправить отзыв');
        console.error(e);
    }
}

async function loadReviews() {
    try {
        const resp = await fetch('/api/reviews');
        const data = await resp.json();
        const list = document.getElementById('reviewsList');

        if (!data.reviews || data.reviews.length === 0) {
            list.innerHTML = '<p class="review-subtitle">Пока нет ни одного отзыва — будьте первым!</p>';
            return;
        }

        list.innerHTML = data.reviews.map(r => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">\${r.name}</span>
                    <span class="comment-date">\${r.date}</span>
                </div>
                <p class="comment-text">\${r.text}</p>
            </div>
        `).join('');
    } catch (e) {
        console.error('Не удалось загрузить отзывы:', e);
    }
}

/* ========================================================
   ОСПОРИТЬ ВЕРУ
   ======================================================== */
const challengeOpen = document.getElementById('challengeOpen');
const challengeBlock = document.getElementById('challengeBlock');
const challengeSend = document.getElementById('challengeSend');
const challengeReason = document.getElementById('challengeReason');
const challengeResult = document.getElementById('challengeResult');

if (challengeOpen) {
    challengeOpen.addEventListener('click', () => {
        challengeBlock.hidden = !challengeBlock.hidden;
    });
}

if (challengeSend) {
    challengeSend.addEventListener('click', async () => {
        const reason = challengeReason.value.trim();
        if (reason.length < 5) {
            challengeResult.hidden = false;
            challengeResult.textContent = 'Опишите чуть подробнее, почему вы не согласны 🙂';
            return;
        }

        challengeSend.disabled = true;
        challengeSend.textContent = 'Вера перепроверяет…';
        challengeResult.hidden = true;

        try {
            const res = await fetch('/api/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    claim: window.lastCheckedClaim || '',
                    verdict: window.lastVerdict || '',
                    reason: reason
                })
            });
            const data = await res.json();
            challengeResult.hidden = false;
            challengeResult.textContent = data.answer || data.error || 'Не получилось получить ответ.';
        } catch {
            challengeResult.hidden = false;
            challengeResult.textContent = 'Сервис перепроверки недоступен. Попробуйте позже!';
        } finally {
            challengeSend.disabled = false;
            challengeSend.textContent = 'Отправить на перепроверку';
        }
    });
}

/* ========================================================
   ПРЕДЛОЖИТЬ СВОЙ МИФ
   ======================================================== */
const suggestForm = document.getElementById('suggestForm');

if (suggestForm) {
    suggestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('suggestStatus');
        const btn = suggestForm.querySelector('button');

        btn.disabled = true;
        btn.textContent = 'Отправляем…';

        try {
            const res = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentUser || document.getElementById('suggestName').value.trim() || 'Аноним',
                    myth: document.getElementById('suggestMyth').value.trim()
                })
            });
            const data = await res.json();
            status.textContent = data.message || data.error || 'Спасибо! Мы проверим ваш миф 💜';
            if (!data.error) suggestForm.reset();
        } catch {
            status.textContent = 'Не получилось отправить. Попробуйте ещё раз!';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Предложить миф ✨';
        }
    });
}

/* ========================================================
   ИГРА «МИФ VS ПРАВДА» С УРОВНЯМИ
   ======================================================== */
const QUESTIONS_FALLBACK = [
    { statement: 'От долгого чтения в темноте портится зрение', truth: false, difficulty: 1,
      explain: 'В темноте глаза устают быстрее, но зрение от этого не портится.' },
    { statement: 'Свежий воздух помогает при простуде', truth: true, difficulty: 1,
      explain: 'Проветривание снижает концентрацию вирусов в помещении.' },
    { statement: 'Соль в больших количествах вредит здоровью', truth: true, difficulty: 1,
      explain: 'ВОЗ рекомендует не более 5 г соли в день — избыток повышает давление.' },
    { statement: 'Морковка улучшает зрение', truth: false, difficulty: 1,
      explain: 'Морковь полезна, но вернуть остроту зрения не может — миф времён британской пропаганды.' },
    { statement: 'Регулярная физическая активность снижает риск сердечных болезней', truth: true, difficulty: 2,
      explain: 'Одна из самых доказанных истин в медицине.' },
    { statement: 'От холодной погоды можно простудиться напрямую', truth: false, difficulty: 2,
      explain: 'Простуду вызывают вирусы, а не мороз — холод лишь ослабляет местный иммунитет носа.' },
    { statement: 'Приём витамина C предотвращает простуду у всех людей', truth: false, difficulty: 3,
      explain: 'Исследования показывают лишь небольшое сокращение длительности болезни, но не профилактику.' },
    { statement: 'Недостаток сна влияет на иммунитет', truth: true, difficulty: 3,
      explain: 'Хронический недосып снижает выработку защитных клеток крови.' }
];

const LEVELS = [
    { name: '🌱 Новичок',   emoji: '🌱', correctNeeded: 0,  maxDifficulty: 1 },
    { name: '🔥 Знаток',    emoji: '🔥', correctNeeded: 8,  maxDifficulty: 2 },
    { name: '👑 Профессор', emoji: '👑', correctNeeded: 15, maxDifficulty: 3 }
];

let gameScore = 0;
let gameStreak = 0;
let correctTotal = 0;
let levelIndex = 0;
let gameQueue = ;
let currentQuestion = null;
let gameLoaded = false;

const gameStatement = document.getElementById('gameStatement');
const gameFeedback = document.getElementById('gameFeedback');
const gameVerdict = document.getElementById('gameVerdict');
const gameExplain = document.getElementById('gameExplain');
const gameScoreEl = document.getElementById('gameScore');
const gameStreakEl = document.getElementById('gameStreak');
const gameLevelEl = document.getElementById('gameLevel');
const btnNext = document.getElementById('btnNext');

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function currentLevel() {
    return LEVELS[levelIndex];
}

function maybeLevelUp() {
    const next = LEVELS[levelIndex + 1];
    if (next && correctTotal >= next.correctNeeded) {
        levelIndex++;
        showLevelUp();
    }
}

function showLevelUp() {
    if (!gameLevelEl) return;
    const lvl = currentLevel();
    gameLevelEl.textContent = `Уровень: ${lvl.emoji} ${lvl.name}`;
    gameLevelEl.classList.remove('levelup');
    void gameLevelEl.offsetWidth;
    gameLevelEl.classList.add('levelup');
}

function pickNextQuestion() {
    const maxDiff = currentLevel().maxDifficulty;
    const allowed = gameQueue.filter(q => (q.difficulty || 1) <= maxDiff);
    const pool = allowed.length ? allowed : gameQueue;
    if (!pool.length) {
        return QUESTIONS_FALLBACK[Math.floor(Math.random() * QUESTIONS_FALLBACK.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

function nextQuestion() {
    currentQuestion = pickNextQuestion();
    gameStatement.textContent = currentQuestion.statement;
    gameFeedback.hidden = true;
    btnNext.hidden = true;
    document.getElementById('btnMyth').disabled = false;
    document.getElementById('btnTruth').disabled = false;
}

function answer(userSaysTruth) {
    const correct = userSaysTruth === currentQuestion.truth;
    document.getElementById('btnMyth').disabled = true;
    document.getElementById('btnTruth').disabled = true;

    if (correct) {
        gameScore++;
        gameStreak++;
        correctTotal++;
    } else {
        gameStreak = 0;
    }
    gameScoreEl.textContent = gameScore;
    gameStreakEl.textContent = gameStreak;

    maybeLevelUp();

    gameVerdict.textContent = correct ? 'Верно! 🎉' : 'Мимо 😅';
    gameVerdict.className = 'game-verdict ' + (correct ? 'right' : 'wrong');

    const realVerdict = currentQuestion.truth ? 'Это правда' : 'Это миф';
    gameExplain.textContent = `${realVerdict}. ${currentQuestion.explain}`;

    gameFeedback.hidden = false;
    btnNext.hidden = false;
}

async function loadGameQuestions() {
    try {
        const res = await fetch('/api/game/questions');
        const data = await res.json();
        gameQueue = data.questions && data.questions.length ? data.questions : QUESTIONS_FALLBACK;
    } catch {
        gameQueue = QUESTIONS_FALLBACK;
    }
    showLevelUp();
    nextQuestion();
}

const btnMythEl = document.getElementById('btnMyth');
const btnTruthEl = document.getElementById('btnTruth');

if (btnMythEl && btnTruthEl) {
    btnMythEl.addEventListener('click', () => answer(false));
    btnTruthEl.addEventListener('click', () => answer(true));
    btnNext.addEventListener('click', nextQuestion);

    const gameSection = document.getElementById('game');
    gameSection.addEventListener('click', () => {
        if (!gameLoaded) { gameLoaded = true; loadGameQuestions(); }
    });
}

/* ========================================================
   ЛИЧНЫЙ КАБИНЕТ — загрузка статистики
   ======================================================== */
async function loadProfile(username) {
    const statChecked = document.getElementById('statChecked');
    const statSuggested = document.getElementById('statSuggested');
    const statPoints = document.getElementById('statPoints');
    const profileLevel = document.getElementById('profileLevel');
    const activityBars = document.getElementById('activityBars');
    const profileName = document.getElementById('profileName');

    if (!statChecked) return;

    try {
        const resp = await fetch('/api/profile?username=' + encodeURIComponent(username));
        const data = await resp.json();

        profileName.innerText = username;
        statChecked.innerText = data.checked ?? 0;
        statSuggested.innerText = data.suggested ?? 0;
        statPoints.innerText = data.points ?? 0;
        profileLevel.innerText = 'Уровень: ' + (data.level || '🌱 Новичок');

        activityBars.innerHTML = '';
        const maxCount = Math.max(...(data.activity ||), 1);
        (data.activity || [0, 0, 0, 0, 0, 0, 0]).forEach(count => {
            const bar = document.createElement('div');
            bar.className = 'activity-bar';
            bar.style.height = Math.max(6, Math.round(count / maxCount * 100)) + '%';
            activityBars.appendChild(bar);
        });
    } catch (e) {
        console.error('Не удалось загрузить профиль:', e);
    }
}

if (currentUser && document.getElementById('statChecked')) {
    loadProfile(currentUser);
}
