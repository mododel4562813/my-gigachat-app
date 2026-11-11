/* ========================================================
   «Перепроверим» — static/script.js
   ======================================================== */

// ---------- Тема ----------
const themeBtn = document.getElementById('themeBtn');

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.remove('dark-preload');
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

applyTheme(localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

if (themeBtn) {
    themeBtn.addEventListener('click', function () {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ---------- Меню и вкладки ----------
const menuBtn = document.getElementById('menuBtn');
const menuEl = document.getElementById('menu');

function toggleMenu() { menuEl.classList.toggle('open'); }
function closeMenu()  { menuEl.classList.remove('open'); }

menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
});
document.addEventListener('click', function (e) {
    if (!menuEl.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
});

const PANELS = ['Home', 'Game', 'Reviews', 'Report', 'Profile'];

function showPanel(name) {
    PANELS.forEach(function (p) {
        const el = document.getElementById('panel' + p);
        if (el) el.classList.toggle('active', p === name);
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
        a.classList.toggle('active', a.dataset.tab === name);
    });
}

function switchTab(name) {
    closeMenu();
    if (name === 'suggest') {
        showPanel('Home');
        const s = document.getElementById('suggest');
        if (s) s.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    const map = { home: 'Home', game: 'Game', reviews: 'Reviews', report: 'Report', profile: 'Profile' };
    showPanel(map[name] || 'Home');
    if (name === 'game') loadGameOnce();
}

document.querySelectorAll('.menu a').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(link.dataset.tab);
    });
});

// ---------- Маскот Вера ----------
const mascot = document.getElementById('mascot');
const mascotImage = document.getElementById('mascotImage');
const speech = document.getElementById('mascotSpeech');

let currentUser = localStorage.getItem('veraUser') || null;

const PHRASES = {
    hello:  "Привет! Я <b>Вера</b> — медицинский фактчекер команды «Единый пульс». Напишите сомнительное утверждение — я разберу его на миф и правду!",
    true:   "Разоблачено — правда! Всё проверено, спи спокойно 💚",
    false:  "Осторожно, это миф! Я нашла подтверждение, что так думать не стоит 🚫",
    unsure: "Честно? Точного ответа у меня нет — лучше уточнить у специалиста 🤔",
    sporno: "Данные противоречивы — разберём нюансы честно 🤔"
};

function setMascotImage(name) {
    mascotImage.src = '/static/' + name + '.png';
}

function react(verdict) {
    const v = (verdict || '').toUpperCase();
    if (v.includes('ПРАВДА')) {
        setMascotImage('vera_true');
        mascot.classList.add('mood-true'); mascot.classList.remove('mood-false');
        speech.innerHTML = PHRASES.true;
    } else if (v.includes('МИФ')) {
        setMascotImage('vera_false');
        mascot.classList.add('mood-false'); mascot.classList.remove('mood-true');
        speech.innerHTML = PHRASES.false;
    } else if (v.includes('СПОРНО')) {
        setMascotImage('vera_hello');
        mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = PHRASES.sporno;
    } else {
        setMascotImage('vera_hello');
        mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = PHRASES.unsure;
    }
}

speech.innerHTML = PHRASES.hello;

if (currentUser) {
    document.getElementById('authBox').classList.add('hidden');
    document.getElementById('userBox').classList.remove('hidden');
    document.getElementById('userChip').textContent = '👋 ' + currentUser;
}

// ---------- Проверка факта ----------
let lastClaim = '';
let lastVerdictFull = '';

function sendCheck() {
    const text = document.getElementById('userText').value.trim();
    if (text.length < 5) {
        speech.innerHTML = 'Введите хотя бы несколько слов 🙂';
        return;
    }

    const btn = document.getElementById('checkBtn');
    const btnText = document.getElementById('btnText');

    btn.disabled = true;
    btnText.textContent = 'Проверяю...';

    fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, username: currentUser || '' })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        lastClaim = text;
        lastVerdictFull = (data.verdict || 'НЕЗНАЮ') + '. ' + (data.explanation || '');
        document.getElementById('result').classList.remove('hidden');
        const badge = document.getElementById('verdictBadge');
        const verdict = (data.verdict || 'НЕЗНАЮ').toUpperCase();
        badge.textContent = verdict;
        badge.className = 'verdict-badge';
        if (verdict.includes('ПРАВДА')) badge.classList.add('pravda');
        else if (verdict.includes('МИФ')) badge.classList.add('mif');
        else if (verdict.includes('СПОРНО')) badge.classList.add('sporno');
        else badge.classList.add('neznayu');

        document.getElementById('claimText').textContent = text;
        document.getElementById('explanationText').textContent = data.explanation || data.answer || '';
        react(data.verdict || '');
        document.getElementById('challengeOpen').hidden = false;
    })
    .catch(function () {
        speech.innerHTML = 'Ой, кажется связь с сервером пропала 📡';
    })
    .finally(function () {
        btn.disabled = false;
        btnText.textContent = 'Проверить факт';
    });
}

// ---------- Сердечки ----------
document.querySelectorAll('.heart').forEach(function (h) {
    h.addEventListener('click', function () {
        const val = h.dataset.value;
        document.querySelectorAll('.heart').forEach(function (x) {
            x.classList.toggle('active', Number(x.dataset.value) <= Number(val));
        });
        document.getElementById('ratingMessage').textContent = 'Спасибо за оценку! 💙';
        fetch('/api/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claim: lastClaim, rating: Number(val), username: currentUser || '' })
        }).catch(function () {});
    });
});

// ---------- Оспорить Веру ----------
const challengeOpen = document.getElementById('challengeOpen');
const challengeBlock = document.getElementById('challengeBlock');
const challengeSend = document.getElementById('challengeSend');
const challengeReason = document.getElementById('challengeReason');
const challengeResult = document.getElementById('challengeResult');

if (challengeOpen) {
    challengeOpen.addEventListener('click', function () {
        challengeBlock.hidden = !challengeBlock.hidden;
    });
}

if (challengeSend) {
    challengeSend.addEventListener('click', function () {
        const reason = challengeReason.value.trim();
        if (reason.length < 5) {
            challengeResult.hidden = false;
            challengeResult.textContent = 'Опишите чуть подробнее, почему вы не согласны 🙂';
            return;
        }

        challengeSend.disabled = true;
        challengeSend.textContent = 'Вера перепроверяет...';
        challengeResult.hidden = true;

        fetch('/api/challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                claim: lastClaim || '',
                verdict: lastVerdictFull || '',
                reason: reason
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            challengeResult.hidden = false;
            challengeResult.textContent = data.answer || data.error || 'Не получилось получить ответ.';
        })
        .catch(function () {
            challengeResult.hidden = false;
            challengeResult.textContent = 'Сервис перепроверки недоступен. Попробуйте позже!';
        })
        .finally(function () {
            challengeSend.disabled = false;
            challengeSend.textContent = 'Отправить на перепроверку';
        });
    });
}

// ---------- Предложить свой миф ----------
const suggestForm = document.getElementById('suggestForm');

if (suggestForm) {
    suggestForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const status = document.getElementById('suggestStatus');
        const btn = suggestForm.querySelector('button');

        btn.disabled = true;
        btn.textContent = 'Отправляем...';

        fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: currentUser
                    || document.getElementById('suggestName').value.trim()
                    || 'Аноним',
                myth: document.getElementById('suggestMyth').value.trim()
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            status.textContent = data.message || data.error || 'Спасибо! Мы проверим ваш миф 💜';
            if (!data.error) suggestForm.reset();
        })
        .catch(function () {
            status.textContent = 'Не получилось отправить. Попробуйте ещё раз!';
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Предложить миф';
        });
    });
}

// ---------- Сообщить об ошибке ----------
function sendError() {
    const text = document.getElementById('errorText').value.trim();
    if (!text) return;
    fetch('/api/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    })
    .then(function () {
        document.getElementById('errorText').value = '';
        alert('Спасибо, сообщение отправлено! Разберёмся 💙');
    })
    .catch(function () {
        alert('Не получилось отправить сообщение 📡');
    });
}

// ---------- Аккаунт ----------
let authMode = 'login';

function switchAuthMode(mode) {
    authMode = mode;
    document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
    document.getElementById('authBtn').textContent = (mode === 'login') ? 'Войти' : 'Зарегистрироваться';
}

function doAuth() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const status = document.getElementById('authStatus');
    if (!username || password.length < 4) {
        status.textContent = 'Введите имя и пароль от 4 символов';
        status.className = 'auth-status err';
        return;
    }
    const url = (authMode === 'login') ? '/api/login' : '/api/register';
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data.status === 'ok' || data.username) {
            status.textContent = authMode === 'login' ? 'Добро пожаловать!' : 'Аккаунт создан!';
            status.className = 'auth-status ok';
            currentUser = data.username || username;
            localStorage.setItem('veraUser', currentUser);
            document.getElementById('authBox').classList.add('hidden');
            document.getElementById('userBox').classList.remove('hidden');
            document.getElementById('userChip').textContent = '👋 ' + currentUser;
        } else {
            status.textContent = data.error || 'Не получилось, попробуйте ещё раз';
            status.className = 'auth-status err';
        }
    })
    .catch(function () {
        status.textContent = 'Сервер недоступен';
        status.className = 'auth-status err';
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('veraUser');
    document.getElementById('userBox').classList.add('hidden');
    document.getElementById('authBox').classList.remove('hidden');
    document.getElementById('authUsername').value = '';
    document.getElementById('authPassword').value = '';
}

// ---------- Обсуждение ----------
function sendComment() {
    const name = currentUser
        || document.getElementById('commentName').value.trim()
        || 'Гость';
    const text = document.getElementById('commentText').value.trim();
    if (!text) return;
    fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, review: text })
    })
    .then(function () {
        document.getElementById('commentText').value = '';
        loadComments();
    })
    .catch(function () {});
}

function loadComments() {
    fetch('/api/reviews')
    .then(function (r) { return r.json(); })
    .then(function (data) {
        const list = document.getElementById('commentsList');
        list.innerHTML = '';
        (data.reviews || []).forEach(function (c) {
            const div = document.createElement('div');
            div.className = 'comment';
            const head = document.createElement('div');
            head.className = 'comment-header';
            const author = document.createElement('span');
            author.className = 'comment-author';
            author.textContent = c.name || 'Гость';
            const time = document.createElement('span');
            time.textContent = c.date || '';
            head.appendChild(author); head.appendChild(time);
            const body = document.createElement('div');
            body.className = 'comment-text';
            body.textContent = c.text || '';
            div.appendChild(head); div.appendChild(body);
            list.appendChild(div);
        });
    })
    .catch(function () {});
}
loadComments();

// ---------- Игра «Миф vs Правда» ----------
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
let gameQueue = [];
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
const btnMyth = document.getElementById('btnMyth');
const btnTruth = document.getElementById('btnTruth');

function currentLevel() { return LEVELS[levelIndex]; }

function maybeLevelUp() {
    const next = LEVELS[levelIndex + 1];
    if (next && correctTotal >= next.correctNeeded) {
        levelIndex++;
        showLevelUp();
    }
}

function showLevelUp() {
    const lvl = currentLevel();
    gameLevelEl.textContent = 'Уровень: ' + lvl.emoji + ' ' + lvl.name;
    gameLevelEl.classList.remove('levelup');
    void gameLevelEl.offsetWidth;
    gameLevelEl.classList.add('levelup');
}

function pickNextQuestion() {
    const maxDiff = currentLevel().maxDifficulty;
    const allowed = gameQueue.filter(function (q) { return (q.difficulty || 1) <= maxDiff; });
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
    btnMyth.disabled = false;
    btnTruth.disabled = false;
}

function answer(userSaysTruth) {
    const correct = userSaysTruth === currentQuestion.truth;
    btnMyth.disabled = true;
    btnTruth.disabled = true;

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
    gameExplain.textContent = realVerdict + '. ' + currentQuestion.explain;

    gameFeedback.hidden = false;
    btnNext.hidden = false;
}

function loadGameQuestions() {
    fetch('/api/game/questions')
    .then(function (r) { return r.json(); })
    .then(function (data) {
        gameQueue = (data.questions && data.questions.length) ? data.questions : QUESTIONS_FALLBACK;
        showLevelUp();
        nextQuestion();
    })
    .catch(function () {
        gameQueue = QUESTIONS_FALLBACK;
        showLevelUp();
        nextQuestion();
    });
}

function loadGameOnce() {
    if (!gameLoaded) {
        gameLoaded = true;
        loadGameQuestions();
    }
}

btnMyth.addEventListener('click', function () { answer(false); });
btnTruth.addEventListener('click', function () { answer(true); });
btnNext.addEventListener('click', nextQuestion);

// ---------- Личный кабинет (если есть блок статистики) ----------
function loadProfile(username) {
    const statChecked = document.getElementById('statChecked');
    if (!statChecked) return;

    fetch('/api/profile?username=' + encodeURIComponent(username))
    .then(function (r) { return r.json(); })
    .then(function (data) {
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.innerText = username;
        statChecked.innerText = data.checked ?? 0;
        const statSuggested = document.getElementById('statSuggested');
        const statPoints = document.getElementById('statPoints');
        if (statSuggested) statSuggested.innerText = data.suggested ?? 0;
        if (statPoints) statPoints.innerText = data.points ?? 0;
        const profileLevel = document.getElementById('profileLevel');
        if (profileLevel) profileLevel.innerText = 'Уровень: ' + (data.level || '🌱 Новичок');

        const activityBars = document.getElementById('activityBars');
        if (activityBars) {
            activityBars.innerHTML = '';
            const days = data.activity || [0, 0, 0, 0, 0, 0, 0];
            const maxCount = Math.max.apply(null, days.concat([1]));
            days.forEach(function (count) {
                const bar = document.createElement('div');
                bar.className = 'activity-bar';
                bar.style.height = Math.max(6, Math.round(count / maxCount * 100)) + '%';
                activityBars.appendChild(bar);
            });
        }
    })
    .catch(function () {});
}

if (currentUser && document.getElementById('statChecked')) {
    loadProfile(currentUser);
}
