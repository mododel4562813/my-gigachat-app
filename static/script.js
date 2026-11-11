// ========================================================
// «Перепроверим» — static/script.js
// Команда «Единый пульс» · Чемпионат «Медицина 2050»
// ========================================================

// ========================================================
// ТЕМА (класс вешается на body — так же, как в CSS)
// ========================================================
const themeBtn = document.getElementById('themeBtn');

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.remove('dark-preload');
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

let savedTheme = 'light';
try {
    savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch (e) {}

applyTheme(savedTheme);

if (themeBtn) {
    themeBtn.addEventListener('click', function () {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
        try { localStorage.setItem('theme', newTheme); } catch (e) {}
    });
}

// ========================================================
// МЕНЮ (слева) и ВКЛАДКИ
// ========================================================
const menuBtn = document.getElementById('menuBtn');
const menuEl = document.getElementById('menu');

function toggleMenu() { if (menuEl) menuEl.classList.toggle('open'); }
function closeMenu() { if (menuEl) menuEl.classList.remove('open'); }

if (menuBtn && menuEl) {
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
}

const PANELS = ['Home', 'Game', 'Reviews', 'Report', 'Profile'];

function showPanel(name) {
    PANELS.forEach(function (p) {
        const el = document.getElementById('panel' + p);
        if (el) el.classList.toggle('active', p === name);
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
        a.classList.toggle('active',
            a.dataset.tab === name ||
            (name === 'Home' && a.dataset.tab === 'home'));
    });
}

function switchTab(name) {
    closeMenu();
    if (name !== 'game') saveGameRound();  // ушли с игры — сохраняем партиальный раунд
    if (name === 'suggest') {
        // «Предложить миф» живёт на главной — показываем главную и прокручиваем к форме
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

// ========================================================
// МАСКОТ ВЕРА
// ========================================================
const mascot = document.getElementById('mascot');
const mascotImage = document.getElementById('mascotImage');
const speech = document.getElementById('mascotSpeech');

// Если картинок маскота нет в static — прячем изображение,
// чтобы вместо него не висел «сломанный» значок
if (mascotImage) {
    mascotImage.addEventListener('error', function () {
        mascotImage.style.display = 'none';
    });
}

let currentUser = null;
try { currentUser = localStorage.getItem('veraUser') || null; } catch (e) {}

const PHRASES = {
    hello:  "Привет! Я <span class=\"vera-name\">Вера</span> — медицинский фактчекер команды «Единый пульс». Напишите сомнительное утверждение — я разберу его на миф и правду!",
    true:   "Разоблачено — правда! Всё проверено, спи спокойно 💚",
    false:  "Осторожно, это миф! Я нашла подтверждение, что так думать не стоит 🚫",
    unsure: "Честно? Точного ответа у меня нет — лучше уточнить у специалиста 🤔",
    sporno: "Данные противоречивы — разберём нюансы честно 🤔"
};

function setMascotImage(name) {
    if (!mascotImage) return;
    mascotImage.style.display = '';
    mascotImage.src = '/static/' + name + '.png';
}

function react(verdict) {
    if (!speech) return;
    const v = (verdict || '').toUpperCase();
    if (v.includes('ПРАВДА')) {
        setMascotImage('vera_true');
        if (mascot) { mascot.classList.add('mood-true'); mascot.classList.remove('mood-false'); }
        speech.innerHTML = PHRASES.true;
    } else if (v.includes('МИФ')) {
        setMascotImage('vera_false');
        if (mascot) { mascot.classList.add('mood-false'); mascot.classList.remove('mood-true'); }
        speech.innerHTML = PHRASES.false;
    } else if (v.includes('СПОРНО')) {
        setMascotImage('vera_hello');
        if (mascot) mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = PHRASES.sporno;
    } else {
        setMascotImage('vera_hello');
        if (mascot) mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = PHRASES.unsure;
    }
}

if (speech) speech.innerHTML = PHRASES.hello;

// ========================================================
// ПРОВЕРКА ФАКТА (настоящий API /api/check)
// ========================================================
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
        addHistory(text, verdict);   // запись в историю кабинета
    })
    .catch(function () {
        speech.innerHTML = 'Ой, кажется связь с сервером пропала 📡';
    })
    .finally(function () {
        btn.disabled = false;
        btnText.textContent = 'Проверить факт';
    });
}

// ========================================================
// СЕРДЕЧКИ
// ========================================================
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

// ========================================================
// ОСПОРИТЬ ВЕРУ
// ========================================================
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

// ========================================================
// ПРЕДЛОЖИТЬ СВОЙ МИФ (настоящий API /api/suggest)
// ========================================================
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

// ========================================================
// СООБЩИТЬ ОБ ОШИБКЕ
// ========================================================
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

// ========================================================
// АККАУНТ (настоящий API /api/login и /api/register)
// ========================================================
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
            try { localStorage.setItem('veraUser', currentUser); } catch (e) {}
            showCabinet(currentUser);
            loadProfile(currentUser);
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
    saveGameRound();  // если раунд не докончен — сохраняем перед выходом
    currentUser = null;
    try { localStorage.removeItem('veraUser'); } catch (e) {}
    document.getElementById('cabinet').classList.add('hidden');
    document.getElementById('authBox').classList.remove('hidden');
    document.getElementById('authUsername').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('authStatus').textContent = '';
}

// ========================================================
// ЛИЧНЫЙ КАБИНЕТ — уровни, прогресс, статистика
// ========================================================
const LEVELS_INFO = [
    { name: '🌱 Новичок',            needed: 0,  next: 20 },
    { name: '🔍 Доказатель',         needed: 20, next: 60 },
    { name: '👑 Хранитель истины',   needed: 60, next: null }
];

function showCabinet(name) {
    document.getElementById('authBox').classList.add('hidden');
    document.getElementById('cabinet').classList.remove('hidden');
    document.getElementById('cabinetName').textContent = name;
    // Аватар появится после загрузки профиля; пока — первая буква имени
    setAvatar(null);
}

// ========================================================
// СИСТЕМА ДОСТИЖЕНИЙ (серверная серия дней)
// ========================================================
let myVisits = { streak: 0, best_streak: 0, total_days: 0 };
let myAvatar = null;

function renderAchievements(checked, suggested, visits) {
    visits = visits || { streak: 0, best_streak: 0, total_days: 0 };
    const streak = visits.streak || 0;
    const best = visits.best_streak || 0;
    const total = visits.total_days || 0;

    const ACHIEVEMENTS = [
        // --- За проверки ---
        { emoji: '🌟', name: 'Первый факт',     desc: 'Проверить 1 миф',     ok: checked >= 1 },
        { emoji: '🔍', name: 'Разгадатель',     desc: '5 проверок',          ok: checked >= 5 },
        { emoji: '🎓', name: 'Знаток',          desc: '10 проверок',         ok: checked >= 10 },
        { emoji: '🛡️', name: 'Страж правды',   desc: '25 проверок',         ok: checked >= 25, rarity: 'rare' },
        { emoji: '🥇', name: 'Профи',           desc: 'Проверить 100 мифов', ok: checked >= 100, rarity: 'rare' },
        { emoji: '👑', name: 'Легенда фактов',  desc: '250 проверок',        ok: checked >= 250, rarity: 'legendary' },

        // --- За предложения ---
        { emoji: '💡', name: 'Автор мифа',      desc: 'Предложить 1 миф',    ok: suggested >= 1 },
        { emoji: '📝', name: 'Идеолог',         desc: '10 предложений',      ok: suggested >= 10 },
        { emoji: '🚀', name: 'Фонтан идей',     desc: '25 предложений',      ok: suggested >= 25, rarity: 'rare' },
        { emoji: '🦸', name: 'Герой',           desc: 'Отправить 50 мифов',  ok: suggested >= 50, rarity: 'legendary' },

        // --- За серии дней (только зарегистрированные) ---
        { emoji: '🔥', name: 'Разогрев',        desc: '3 дня подряд',        ok: streak >= 3 },
        { emoji: '📅', name: 'Неделя в строю',  desc: '7 дней подряд',       ok: streak >= 7, rarity: 'rare' },
        { emoji: '🌙', name: 'Месяц верности',  desc: '30 дней подряд',      ok: streak >= 30, rarity: 'rare' },
        { emoji: '💎', name: '100 дней в сети', desc: '100 дней подряд',     ok: streak >= 100, rarity: 'legendary' },
        { emoji: '🏃', name: 'Марафонец',       desc: '50 дней всего',       ok: total >= 50 },
        { emoji: '🏅', name: 'Рекордсмен',      desc: 'Личная серия: ' + best, ok: best >= 14, rarity: 'rare' }
    ];

    const box = document.getElementById('badges');
    if (!box) return;
    const unlocked = ACHIEVEMENTS.filter(a => a.ok).length;
    const header = document.querySelector('.cabinet-achievements h4');
    if (header) header.textContent = '🏆 Достижения · ' + unlocked + ' из ' + ACHIEVEMENTS.length;

    box.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="badge ${a.ok ? 'unlocked' : 'locked'} ${a.rarity || ''}" title="${a.desc}">
            <span class="badge-emoji">${a.emoji}</span>
            <span class="badge-name">${a.name}</span>
            <span class="badge-desc">${a.desc}</span>
        </div>
    `).join('');
}

// Отметка визита на сервере — серия копится только у зарегистрированных
function syncVisit() {
    if (!currentUser) return;
    fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data.status === 'ok') {
            myVisits = {
                streak: data.streak,
                best_streak: data.best_streak,
                total_days: data.total_days
            };
            if (data.avatar) {
                myAvatar = data.avatar;
                setAvatar(myAvatar);
            }
            const chip = document.getElementById('cabinetStreakChip');
            if (chip) chip.textContent = '🔥 Серия: ' + (myVisits.streak || 0) + ' дн.';
            renderAchievements(
                parseInt(document.getElementById('statChecked').textContent) || 0,
                parseInt(document.getElementById('statSuggested').textContent) || 0,
                myVisits
            );
        }
    })
    .catch(function () {});
}

// ========================================================
// АВАТАР
// ========================================================
function setAvatar(url) {
    const av = document.getElementById('cabinetAvatar');
    if (!av) return;
    if (url) {
        av.style.backgroundImage = 'url("' + url + '")';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.textContent = '';
    } else {
        av.style.backgroundImage = '';
        av.textContent = (currentUser || 'В').charAt(0).toUpperCase();
    }
}

function uploadAvatar(file) {
    if (!currentUser) return;
    const fd = new FormData();
    fd.append('username', currentUser);
    fd.append('avatar', file);

    const status = document.getElementById('avatarStatus');
    status.textContent = 'Загружаем...';

    fetch('/api/avatar', { method: 'POST', body: fd })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data.avatar) {
            myAvatar = data.avatar;
            setAvatar(myAvatar);
            status.textContent = 'Аватар обновлён! ✨';
        } else {
            status.textContent = data.error || 'Не получилось загрузить';
        }
    })
    .catch(function () { status.textContent = 'Ошибка соединения'; });
}

const avatarInput = document.getElementById('avatarInput');
if (avatarInput) {
    avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) uploadAvatar(this.files[0]);
    });
}

// ========================================================
// ИСТОРИЯ ПРОВЕРОК (хранится в браузере)
// ========================================================
function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    let items = [];
    try {
        items = JSON.parse(localStorage.getItem('veraHistory') || '[]');
    } catch (e) { items = []; }
    if (!items.length) {
        list.innerHTML = '<p class="history-empty">Пока нет проверок — проверьте свой первый миф на главной! 🚀</p>';
        return;
    }
    list.innerHTML = items.slice(0, 10).map(function () {
        return `
        <div class="history-item">
            <div class="history-verdict"></div>
            <div class="history-body">
                <div class="history-claim"></div>
                <div class="history-date"></div>
            </div>
        </div>`;
    }).join('');

    // Пользовательский текст вставляем через textContent — безопасно
    const nodes = list.querySelectorAll('.history-item');
    items.slice(0, 10).forEach(function (h, i) {
        const item = nodes[i];   // было nodes[I] — из-за большой буквы история ломалась
        if (!item) return;
        const v = (h.verdict || '').toUpperCase();
        const cls = v.includes('ПРАВДА') ? 'pravda'
                  : v.includes('МИФ') ? 'mif' : 'other';
        const icon = cls === 'pravda' ? '✅' : cls === 'mif' ? '🚫' : '🤔';
        const ver = item.querySelector('.history-verdict');
        if (ver) { ver.classList.add(cls); ver.textContent = icon; }
        item.querySelector('.history-claim').textContent = h.claim;
        item.querySelector('.history-date').textContent = h.date + ' · ' + h.verdict;
    });
}

function addHistory(claim, verdict) {
    try {
        const items = JSON.parse(localStorage.getItem('veraHistory') || '[]');
        items.unshift({
            claim: claim.length > 80 ? claim.slice(0, 80) + '…' : claim,
            verdict: verdict,
            date: new Date().toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })
        });
        localStorage.setItem('veraHistory', JSON.stringify(items.slice(0, 20)));
        renderHistory();
    } catch (e) { /* история не критична */ }
}

// ========================================================
// ЗАГРУЗКА ПРОФИЛЯ С СЕРВЕРА
// ========================================================
function loadProfile(username) {
    fetch('/api/profile?username=' + encodeURIComponent(username))
    .then(function (r) { return r.json(); })
    .then(function (data) {
        const checked = data.checked || 0;
        const suggested = data.suggested || 0;
        const points = data.points || 0;

        document.getElementById('statChecked').textContent = checked;
        document.getElementById('statSuggested').textContent = suggested;
        document.getElementById('statPoints').textContent = points;

        // Уровень: берём с сервера, иначе считаем по очкам
        const level = data.level ||
            LEVELS_INFO[points >= 60 ? 2 : points >= 20 ? 1 : 0].name;
        document.getElementById('cabinetLevelChip').textContent = level;

        // Прогресс до следующего уровня
        let li = 0;
        if (points >= 60) li = 2; else if (points >= 20) li = 1;
        const lvl = LEVELS_INFO[li];
        if (lvl.next === null) {
            document.getElementById('progressText').textContent = 'Максимум!';
            document.getElementById('progressFill').style.width = '100%';
        } else {
            const inLvl = points - lvl.needed;
            const span = lvl.next - lvl.needed;
            document.getElementById('progressText').textContent = inLvl + ' / ' + span;
            document.getElementById('progressFill').style.width =
                Math.min(100, Math.round(inLvl / span * 100)) + '%';
        }

        // Полоски активности за 7 дней
        const activityBars = document.getElementById('activityBars');
        if (activityBars) {
            activityBars.innerHTML = '';
            const days = data.activity || [0, 0, 0, 0, 0, 0, 0];
            const maxCount = Math.max.apply(null, days.concat([1]));
            days.forEach(function (count) {
                const bar = document.createElement('div');
                bar.className = 'activity-bar';
                bar.style.height = Math.max(6, Math.round(count / maxCount * 100)) + '%';
                bar.title = 'Проверок: ' + count;
                activityBars.appendChild(bar);
            });
        }

        // Серия дней и аватар с сервера
        myVisits = {
            streak: data.streak || 0,
            best_streak: data.best_streak || 0,
            total_days: data.total_days || 0
        };
        document.getElementById('cabinetStreakChip').textContent =
            '🔥 Серия: ' + myVisits.streak + ' дн.';
        if (data.avatar) {
            myAvatar = data.avatar;
            setAvatar(myAvatar);
        }

        renderAchievements(checked, suggested, myVisits);
        syncVisit();   // отметка сегодняшнего визита + свежая серия
    })
    .catch(function () {
        renderAchievements(0, 0, myVisits);
    });
}

// Если пользователь уже вошёл — сразу открываем кабинет
if (currentUser) {
    showCabinet(currentUser);
    loadProfile(currentUser);
    renderHistory();
}

// ========================================================
// ОБСУЖДЕНИЕ (настоящий API /api/review и /api/reviews)
// ========================================================
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
        if (!list) return;
        list.innerHTML = '';
        (data.reviews || []).forEach(function (c) {
            const div = document.createElement('div');
            div.className = 'comment';

            // Аватар автора (если есть)
            const avat = document.createElement('div');
            avat.className = 'comment-avatar';
            if (c.avatar) {
                avat.style.backgroundImage = 'url("' + c.avatar + '")';
                avat.style.backgroundSize = 'cover';
                avat.style.backgroundPosition = 'center';
            } else {
                avat.textContent = (c.name || 'Г').charAt(0).toUpperCase();
            }
            div.appendChild(avat);

            const bodyWrap = document.createElement('div');
            bodyWrap.style.flex = '1';
            bodyWrap.style.minWidth = '0';

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

            bodyWrap.appendChild(head); bodyWrap.appendChild(body);
            div.appendChild(bodyWrap);
            list.appendChild(div);
        });
    })
    .catch(function () {});
}
loadComments();

// ========================================================
// ИГРА «МИФ VS ПРАВДА» С УРОВНЯМИ (настоящий API + запасной набор)
// ========================================================
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

// Раунд для отправки на сервер: копим ответы, каждые 5 — сохраняем
let roundScore = 0;
let roundTotal = 0;

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
    if (!gameLevelEl) return;
    const lvl = currentLevel();
    gameLevelEl.textContent = 'Уровень: ' + lvl.emoji + ' ' + lvl.name;
    gameLevelEl.classList.remove('levelup');
    void gameLevelEl.offsetWidth;   // перезапуск CSS-анимации
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
    if (!gameStatement) return;
    currentQuestion = pickNextQuestion();
    gameStatement.textContent = currentQuestion.statement;
    if (gameFeedback) gameFeedback.hidden = true;
    if (btnNext) btnNext.hidden = true;
    if (btnMyth) btnMyth.disabled = false;
    if (btnTruth) btnTruth.disabled = false;
}

// Сохранение результата раунда на сервер (только у зарегистрированных)
function saveGameRound() {
    if (!currentUser || roundTotal === 0) return;
    fetch('/api/game/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser,
            score: roundScore,
            total: roundTotal
        })
    }).catch(function () {});
    roundScore = 0;
    roundTotal = 0;
}

function answer(userSaysTruth) {
    if (!currentQuestion) return;
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

    // Считаем раунд: каждые 5 ответов — отправляем результат на сервер
    roundTotal++;
    if (correct) roundScore++;
    if (roundTotal >= 5) saveGameRound();

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

if (btnMyth) btnMyth.addEventListener('click', function () { answer(false); });
if (btnTruth) btnTruth.addEventListener('click', function () { answer(true); });
if (btnNext) btnNext.addEventListener('click', nextQuestion);
