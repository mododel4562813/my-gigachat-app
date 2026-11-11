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
// ЛОКАЛИЗАЦИЯ (ru / en / be / zh)
// ========================================================
let currentLang = 'ru';
try { currentLang = localStorage.getItem('site_lang') || 'ru'; } catch (e) {}
if (!['ru', 'en', 'be', 'zh'].includes(currentLang)) currentLang = 'ru';

const I18N = {
    ru: {
        title: 'Перепроверим — Не верь, а проверь',
        slogan: 'Не верь, а проверь',
        attention: 'Внимание!',
        nav_home: '🔍 Проверка мифов', nav_game: '🎮 Миф vs Правда',
        nav_reviews: '💬 Обсуждение', nav_report: '⚠️ Сообщить об ошибке', nav_profile: '👤 Аккаунт',
        disclaimer: 'Это не медицинская консультация. При проблемах со здоровьем обязательно обратитесь к врачу.',
        hero_title: 'Не уверен, правда это или миф?',
        hero_sub: 'Введи сомнительное медицинское утверждение — Вера разберёт его с опорой на надёжные источники.',
        placeholder_check: 'Например: вакцины вызывают аутизм...',
        check: 'Проверить факт', checking: 'Проверяю...',
        input_short: 'Введите хотя бы несколько слов 🙂',
        net_error: 'Ой, кажется связь с сервером пропала 📡',
        rating_q: 'Насколько полезен ответ?', rating_thanks: 'Спасибо за оценку! 💙',
        challenge_open: '⚔️ Оспорить ответ',
        challenge_h3: 'Не согласны с Верой? Оспорьте её!',
        challenge_ph: 'Напишите, почему вы не согласны — Вера перепроверит факт...',
        challenge_send: 'Отправить на перепроверку', challenge_checking: 'Вера перепроверяет...',
        challenge_short: 'Опишите чуть подробнее, почему вы не согласны 🙂',
        challenge_fail: 'Не получилось получить ответ.',
        challenge_net: 'Сервис перепроверки недоступен. Попробуйте позже!',
        suggest_title: '✨ Знаете миф, которого у нас нет?',
        suggest_desc: 'Предложите его — мы проверим и добавим в базу!',
        suggest_name: 'Как вас зовут?', suggest_myth: 'Например: «от фото на телефон мутнеет зрение»',
        suggest_btn: 'Предложить миф', suggest_sending: 'Отправляем...',
        suggest_ok: 'Спасибо! Мы проверим ваш миф 💜',
        suggest_fail: 'Не получилось отправить. Попробуйте ещё раз!',
        game_title: '🎮 Миф vs Правда',
        game_sub: 'Проверьте свою интуицию — знаете ли вы, где миф, а где правда?',
        btn_myth: '❌ Миф', btn_truth: '✅ Правда', btn_next: 'Следующий миф →',
        game_loading: 'Загружаем вопрос…',
        game_right: 'Верно! 🎉', game_wrong: 'Мимо 😅',
        game_true: 'Это правда', game_myth: 'Это миф',
        game_level_tpl: 'Уровень: ',
        score_word: 'Счёт:', streak_word: 'Серия:',
        comments_title: '💬 Комментарии', comments_sub: 'Что думают другие?',
        comment_name: 'Твоё имя', comment_text: 'Твой комментарий...', send: 'Отправить',
        error_title: '🛠 Сообщить об ошибке',
        error_sub: 'Нашли опечатку или неточность? Напишите нам!',
        error_ph: 'Опишите ошибку: где увидели и что не так...',
        error_ok: 'Спасибо, сообщение отправлено! Разберёмся 💙',
        error_fail: 'Не получилось отправить сообщение 📡',
        login: 'Вход', register: 'Регистрация',
        username_ph: 'Имя пользователя', password_ph: 'Пароль (от 4 символов)',
        enter: 'Войти', reg_btn: 'Зарегистрироваться',
        auth_short: 'Введите имя и пароль от 4 символов',
        welcome: 'Добро пожаловать!', created: 'Аккаунт создан!',
        auth_fail: 'Не получилось, попробуйте ещё раз', server_down: 'Сервер недоступен',
        cabinet_title: 'Личный кабинет',
        cabinet_sub: 'Войдите, чтобы копить очки, серию дней, достижения и аватар, который увидят все!',
        logout: 'Выйти',
        progress_label: 'До следующего уровня', progress_max: 'Максимум!',
        stat_checked: 'Проверено', stat_suggested: 'Предложено', stat_points: 'Очки',
        activity_title: '📊 Активность за неделю',
        achv_title: '🏆 Достижения', history_title: '🕘 Последние проверки',
        history_empty: 'Пока нет проверок — проверьте свой первый миф на главной! 🚀',
        streak_tpl: '🔥 Серия: {n} дн.',
        guest: 'Гость',
        anonymous: 'Аноним',
        checks_word: 'Проверок',
        avatar_loading: 'Загружаем...', avatar_ok: 'Аватар обновлён! ✨', avatar_err: 'Ошибка соединения'
    },
    en: {
        title: 'Double-Check — Don\u2019t Believe, Verify',
        slogan: "DON'T BELIEVE, VERIFY",
        attention: 'Attention!',
        nav_home: '🔍 Myth Check', nav_game: '🎮 Myth vs Truth',
        nav_reviews: '💬 Discussions', nav_report: '⚠️ Report an Error', nav_profile: '👤 Account',
        disclaimer: 'This is not medical advice. For health issues, please consult a doctor.',
        hero_title: 'Not sure if it\u2019s true or a myth?',
        hero_sub: 'Type a questionable medical claim — Vera will break it down using reliable sources.',
        placeholder_check: 'For example: vaccines cause autism...',
        check: 'Check the Fact', checking: 'Checking...',
        input_short: 'Please enter at least a few words 🙂',
        net_error: 'Oops, looks like the server connection is lost 📡',
        rating_q: 'How helpful was the answer?', rating_thanks: 'Thanks for your feedback! 💙',
        challenge_open: '⚔️ Challenge the Answer',
        challenge_h3: 'Disagree with Vera? Challenge her!',
        challenge_ph: 'Explain why you disagree — Vera will re-check the fact...',
        challenge_send: 'Send for re-check', challenge_checking: 'Vera is re-checking...',
        challenge_short: 'Please describe a bit more why you disagree 🙂',
        challenge_fail: "Couldn't get an answer.",
        challenge_net: 'The re-check service is unavailable. Try again later!',
        suggest_title: '✨ Know a myth we don\u2019t have?',
        suggest_desc: 'Suggest it — we\u2019ll verify it and add it to the database!',
        suggest_name: "What's your name?", suggest_myth: "For example: 'phone photos blur your vision'",
        suggest_btn: 'Suggest a Myth', suggest_sending: 'Sending...',
        suggest_ok: 'Thanks! We\u2019ll check your myth 💜',
        suggest_fail: "Couldn't send it. Please try again!",
        game_title: '🎮 Myth vs Truth',
        game_sub: 'Test your intuition — do you know what\u2019s a myth and what\u2019s true?',
        btn_myth: '❌ Myth', btn_truth: '✅ Truth', btn_next: 'Next myth →',
        game_loading: 'Loading a question…',
        game_right: 'Correct! 🎉', game_wrong: 'Missed 😅',
        game_true: "It's true", game_myth: "It's a myth",
        game_level_tpl: 'Level: ',
        score_word: 'Score:', streak_word: 'Streak:',
        comments_title: '💬 Comments', comments_sub: 'What do others think?',
        comment_name: 'Your name', comment_text: 'Your comment...', send: 'Send',
        error_title: '🛠 Report an Error',
        error_sub: 'Found a typo or an inaccuracy? Tell us!',
        error_ph: 'Describe the error: where you saw it and what\u2019s wrong...',
        error_ok: 'Thanks, your message has been sent! We\u2019ll look into it 💙',
        error_fail: "Couldn't send the message 📡",
        login: 'Login', register: 'Sign Up',
        username_ph: 'Username', password_ph: 'Password (4+ characters)',
        enter: 'Sign In', reg_btn: 'Sign Up',
        auth_short: 'Enter a name and a password of 4+ characters',
        welcome: 'Welcome!', created: 'Account created!',
        auth_fail: "Couldn't do it, please try again", server_down: 'Server unavailable',
        cabinet_title: 'Personal Account',
        cabinet_sub: 'Sign in to collect points, daily streaks, achievements and an avatar everyone will see!',
        logout: 'Log Out',
        progress_label: 'To the next level', progress_max: 'Maximum!',
        stat_checked: 'Checked', stat_suggested: 'Suggested', stat_points: 'Points',
        activity_title: '📊 Weekly Activity',
        achv_title: '🏆 Achievements', history_title: '🕘 Recent Checks',
        history_empty: 'No checks yet — check your first myth on the main page! 🚀',
        streak_tpl: '🔥 Streak: {n} days',
        guest: 'Guest',
        anonymous: 'Anonymous',
        checks_word: 'Checks',
        avatar_loading: 'Uploading...', avatar_ok: 'Avatar updated! ✨', avatar_err: 'Connection error'
    },
    be: {
        title: 'Пераправерым — Не веры, а правер',
        slogan: 'НЕ ВЕРЫ, А ПРАВЕР',
        attention: 'Увага!',
        nav_home: '🔍 Праверка міфаў', nav_game: '🎮 Міф супраць Праўды',
        nav_reviews: '💬 Абмеркаванне', nav_report: '⚠️ Паведаміць пра памылку', nav_profile: '👤 Акаўнт',
        disclaimer: 'Гэта не медыцынская кансультацыя. Пры праблемах са здароўем абавязкова звярніцеся да лекара.',
        hero_title: 'Не ўпэўнены, праўда гэта ці міф?',
        hero_sub: 'Увядзіце сумнеўнае медыцынскае сцверджанне — Вера разбярэ яго з апорай на надзейныя крыніцы.',
        placeholder_check: 'Напрыклад: вакцыны выклікаюць аўтызм...',
        check: 'Праверыць факт', checking: 'Правяраю...',
        input_short: 'Увядзіце хоць некалькі слоў 🙂',
        net_error: 'Ой, здаецца, сувязь з серверам знікла 📡',
        rating_q: 'Наколькі карысны адказ?', rating_thanks: 'Дзякуй за ацэнку! 💙',
        challenge_open: '⚔️ Аспрэчыць адказ',
        challenge_h3: 'Не згодныя з Верай? Аспрэчце яе!',
        challenge_ph: 'Напішыце, чаму вы не згодныя — Вера пераправерыць факт...',
        challenge_send: 'Адправіць на пераправерку', challenge_checking: 'Вера пераправярае...',
        challenge_short: 'Апішыце крыху падрабязней, чаму вы не згодныя 🙂',
        challenge_fail: 'Не атрымалася атрымаць адказ.',
        challenge_net: 'Сэрвіс пераправеркі недаступны. Паспрабуйце пазней!',
        suggest_title: '✨ Ведаеце міф, якога ў нас няма?',
        suggest_desc: 'Прапануйце яго — мы праверым і дадамо ў базу!',
        suggest_name: 'Як вас завуць?', suggest_myth: 'Напрыклад: «ад фота на тэлефон мутнее зрок»',
        suggest_btn: 'Прапанаваць міф', suggest_sending: 'Адпраўляем...',
        suggest_ok: 'Дзякуй! Мы праверым ваш міф 💜',
        suggest_fail: 'Не атрымалася адправіць. Паспрабуйце яшчэ раз!',
        game_title: '🎮 Міф супраць Праўды',
        game_sub: 'Праверце сваю інтуіцыю — ці ведаеце вы, дзе міф, а дзе праўда?',
        btn_myth: '❌ Міф', btn_truth: '✅ Праўда', btn_next: 'Наступны міф →',
        game_loading: 'Загружаем пытанне…',
        game_right: 'Правільна! 🎉', game_wrong: 'Міма 😅',
        game_true: 'Гэта праўда', game_myth: 'Гэта міф',
        game_level_tpl: 'Узровень: ',
        score_word: 'Рахунак:', streak_word: 'Серыя:',
        comments_title: '💬 Каментарыі', comments_sub: 'Што думаюць іншыя?',
        comment_name: 'Тваё імя', comment_text: 'Твой каментар...', send: 'Адправіць',
        error_title: '🛠 Паведаміць пра памылку',
        error_sub: 'Знайшлі памылку ці недакладнасць? Напішыце нам!',
        error_ph: 'Апішыце памылку: дзе ўбачылі і што не так...',
        error_ok: 'Дзякуй, паведамленне адпраўлена! Разбяромся 💙',
        error_fail: 'Не атрымалася адправіць паведамленне 📡',
        login: 'Уваход', register: 'Рэгістрацыя',
        username_ph: 'Імя карыстальніка', password_ph: 'Пароль (ад 4 знакаў)',
        enter: 'Увайсці', reg_btn: 'Зарэгістравацца',
        auth_short: 'Увядзіце імя і пароль ад 4 знакаў',
        welcome: 'Сардэчна запрашаем!', created: 'Акаўнт створаны!',
        auth_fail: 'Не атрымалася, паспрабуйце яшчэ раз', server_down: 'Сервер недаступны',
        cabinet_title: 'Асабісты кабінет',
        cabinet_sub: 'Увайдзіце, каб збіраць ачкі, серыю дзён, дасягненні і аватар, які ўбачаць усе!',
        logout: 'Выйсці',
        progress_label: 'Да наступнага ўзроўню', progress_max: 'Максімум!',
        stat_checked: 'Праверана', stat_suggested: 'Прапанавана', stat_points: 'Ачкі',
        activity_title: '📊 Актыўнасць за тыдзень',
        achv_title: '🏆 Дасягненні', history_title: '🕘 Апошнія праверкі',
        history_empty: 'Пакуль няма праверак — праверце свой першы міф на галоўнай! 🚀',
        streak_tpl: '🔥 Серыя: {n} дз.',
        guest: 'Госць',
        anonymous: 'Ананім',
        checks_word: 'Праверак',
        avatar_loading: 'Загружаем...', avatar_ok: 'Аватар абноўлены! ✨', avatar_err: 'Памылка злучэння'
    },
    zh: {
        title: '重新核实 — 不要相信，要验证',
        slogan: '不要相信，要验证',
        attention: '注意！',
        nav_home: '🔍 事实核查', nav_game: '🎮 谣言 vs 真相',
        nav_reviews: '💬 讨论', nav_report: '⚠️ 报告错误', nav_profile: '👤 账户',
        disclaimer: '这不是医疗建议。如有健康问题，请务必咨询医生。',
        hero_title: '不确定这是真相还是谣言？',
        hero_sub: '输入可疑的医学说法——薇拉会依据可靠来源为你分析。',
        placeholder_check: '例如：疫苗会导致自闭症……',
        check: '核实事实', checking: '正在核实……',
        input_short: '请至少输入几个字 🙂',
        net_error: '哎呀，与服务器的连接好像断了 📡',
        rating_q: '这个回答有多少帮助？', rating_thanks: '感谢你的评价！💙',
        challenge_open: '⚔️ 挑战回答',
        challenge_h3: '不同意薇拉的观点？来挑战她！',
        challenge_ph: '写下你不同意的原因——薇拉会重新核查……',
        challenge_send: '提交重新核查', challenge_checking: '薇拉正在重新核查……',
        challenge_short: '请稍微详细描述一下你不同意的原因 🙂',
        challenge_fail: '未能获取回答。',
        challenge_net: '重新核查服务暂不可用，请稍后再试！',
        suggest_title: '✨ 知道我们没有的谣言吗？',
        suggest_desc: '提出来——我们会核实并加入数据库！',
        suggest_name: '你的名字？', suggest_myth: '例如：“看手机照片会让视力变模糊”',
        suggest_btn: '提交谣言', suggest_sending: '正在发送……',
        suggest_ok: '谢谢！我们会核实你的谣言 💜',
        suggest_fail: '发送失败，请再试一次！',
        game_title: '🎮 谣言 vs 真相',
        game_sub: '测试你的直觉——你知道哪是谣言，哪是真相吗？',
        btn_myth: '❌ 谣言', btn_truth: '✅ 真相', btn_next: '下一个谣言 →',
        game_loading: '正在加载问题……',
        game_right: '答对了！🎉', game_wrong: '差一点 😅',
        game_true: '这是真相', game_myth: '这是谣言',
        game_level_tpl: '等级：',
        score_word: '分数：', streak_word: '连胜：',
        comments_title: '💬 评论', comments_sub: '大家怎么看？',
        comment_name: '你的名字', comment_text: '你的评论……', send: '发送',
        error_title: '🛠 报告错误',
        error_sub: '发现错别字或不准确之处？请告诉我们！',
        error_ph: '描述错误：在哪里看到的、哪里不对……',
        error_ok: '谢谢，消息已发送！我们会处理 💙',
        error_fail: '消息发送失败 📡',
        login: '登录', register: '注册',
        username_ph: '用户名', password_ph: '密码（至少 4 个字符）',
        enter: '登录', reg_btn: '注册',
        auth_short: '请输入用户名和至少 4 个字符的密码',
        welcome: '欢迎回来！', created: '账户已创建！',
        auth_fail: '没有成功，请再试一次', server_down: '服务器不可用',
        cabinet_title: '个人账户',
        cabinet_sub: '登录后可以攒积分、连续签到、解锁成就，还有大家都能看到的头像！',
        logout: '退出',
        progress_label: '距离下一等级', progress_max: '已达最高！',
        stat_checked: '已核查', stat_suggested: '已提交', stat_points: '积分',
        activity_title: '📊 本周活跃度',
        achv_title: '🏆 成就', history_title: '🕘 最近的核查',
        history_empty: '还没有核查记录——去主页核查你的第一个谣言吧！🚀',
        streak_tpl: '🔥 连续签到：{n} 天',
        guest: '游客',
        anonymous: '匿名',
        checks_word: '次核查',
        avatar_loading: '正在上传……', avatar_ok: '头像已更新！✨', avatar_err: '连接错误'
    }
};

function T(key) {
    const pack = I18N[currentLang] || I18N.ru;
    return (pack[key] !== undefined) ? pack[key] : (I18N.ru[key] !== undefined ? I18N.ru[key] : key);
}

function setText(el, text) {
    if (el) el.textContent = text;
}

// Применение языка ко всей статичной разметке
function setLanguage(lang) {
    if (!I18N[lang]) lang = 'ru';
    currentLang = lang;

    document.title = T('title');

    // Меню
    setText(document.querySelector('.menu a[data-tab="home"]'), T('nav_home'));
    setText(document.querySelector('.menu a[data-tab="game"]'), T('nav_game'));
    setText(document.querySelector('.menu a[data-tab="reviews"]'), T('nav_reviews'));
    setText(document.querySelector('.menu a[data-tab="report"]'), T('nav_report'));
    setText(document.querySelector('.menu a[data-tab="profile"]'), T('nav_profile'));

    // Слоган и дисклеймер
    setText(document.querySelector('.slogan'), T('slogan'));
    const disc = document.querySelector('.disclaimer p');
    if (disc) {
        disc.innerHTML = '<span class="warn-icon">⚠️</span> <strong>' +
            T('attention') + '</strong> ' + T('disclaimer');
    }

    // Главная: заголовок, подзаголовок, форма проверки
    setText(document.querySelector('.hero-title'), T('hero_title'));
    setText(document.querySelector('.hero-subtitle'), T('hero_sub'));
    const userText = document.getElementById('userText');
    if (userText) userText.placeholder = T('placeholder_check');
    setText(document.getElementById('btnText'), T('check'));

    // Оценка и оспаривание
    const ratingP = document.querySelector('.rating-section p');
    if (ratingP) ratingP.textContent = T('rating_q');
    setText(document.getElementById('challengeOpen'), T('challenge_open'));
    const chH = document.querySelector('.challenge h3');
    if (chH) chH.textContent = T('challenge_h3');
    const chReason = document.getElementById('challengeReason');
    if (chReason) chReason.placeholder = T('challenge_ph');
    setText(document.getElementById('challengeSend'), T('challenge_send'));

    // Предложить миф (форма на главной)
    const sugH = document.querySelector('.suggest-section h3');
    if (sugH) sugH.textContent = T('suggest_title');
    const sugSub = document.querySelector('.suggest-section .review-subtitle');
    if (sugSub) sugSub.textContent = T('suggest_desc');
    const sugName = document.getElementById('suggestName');
    if (sugName) sugName.placeholder = T('suggest_name');
    const sugMyth = document.getElementById('suggestMyth');
    if (sugMyth) sugMyth.placeholder = T('suggest_myth');
    const sugBtn = document.querySelector('#suggestForm button');
    if (sugBtn) sugBtn.textContent = T('suggest_btn');

    // Игра
    const gameH = document.querySelector('.game-section h3');
    if (gameH) gameH.textContent = T('game_title');
    const gameSub = document.querySelector('.game-subtitle');
    if (gameSub) gameSub.textContent = T('game_sub');
    setText(btnMyth, T('btn_myth'));
    setText(btnTruth, T('btn_truth'));
    setText(btnNext, T('btn_next'));
    // Подписи счёта: меняем только текстовый узел, <b> с ID не трогаем
    const scoreSpan = gameScoreEl ? gameScoreEl.parentElement : null;
    if (scoreSpan && scoreSpan.firstChild) scoreSpan.firstChild.textContent = T('score_word') + ' ';
    const streakSpan = gameStreakEl ? gameStreakEl.parentElement : null;
    if (streakSpan && streakSpan.firstChild) streakSpan.firstChild.textContent = T('streak_word') + ' ';
    if (!gameLoaded && currentQuestion === null && gameStatement) {
        gameStatement.textContent = T('game_loading');
    }

    // Обсуждение
    const comH = document.querySelector('.comments-section h3');
    if (comH) comH.textContent = T('comments_title');
    const comSub = document.querySelector('.comments-subtitle');
    if (comSub) comSub.textContent = T('comments_sub');
    const comName = document.getElementById('commentName');
    if (comName) comName.placeholder = T('comment_name');
    const comText = document.getElementById('commentText');
    if (comText) comText.placeholder = T('comment_text');
    const comBtn = document.querySelector('.comments-section .btn-secondary');
    if (comBtn) comBtn.textContent = T('send');

    // Сообщить об ошибке
    const errH = document.querySelector('.review-section h3');
    if (errH) errH.textContent = T('error_title');
    const errSub = document.querySelector('.review-section .review-subtitle');
    if (errSub) errSub.textContent = T('error_sub');
    const errText = document.getElementById('errorText');
    if (errText) errText.placeholder = T('error_ph');
    const errBtn = document.querySelector('.review-section .btn-secondary');
    if (errBtn) errBtn.textContent = T('send');

    // Аккаунт: форма входа/регистрации
    setText(document.getElementById('tabLogin'), T('login'));
    setText(document.getElementById('tabRegister'), T('register'));
    const authUser = document.getElementById('authUsername');
    if (authUser) authUser.placeholder = T('username_ph');
    const authPass = document.getElementById('authPassword');
    if (authPass) authPass.placeholder = T('password_ph');
    setText(document.getElementById('authBtn'), authMode === 'login' ? T('enter') : T('reg_btn'));

    // Кабинет
    const cabH = document.querySelector('.profile-welcome h3');
    if (cabH) cabH.textContent = T('cabinet_title');
    const cabSub = document.querySelector('.profile-welcome .review-subtitle');
    if (cabSub) cabSub.textContent = T('cabinet_sub');
    setText(document.querySelector('.btn-logout'), T('logout'));

    const progLabel = document.querySelector('.cabinet-progress-label span');
    if (progLabel) progLabel.textContent = T('progress_label');

    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = T('stat_checked');
        statLabels[1].textContent = T('stat_suggested');
        statLabels[2].textContent = T('stat_points');
    }

    setText(document.querySelector('.cabinet-activity h4'), T('activity_title'));
    setText(document.querySelector('.cabinet-achievements h4'), T('achv_title'));
    setText(document.querySelector('.cabinet-history h4'), T('history_title'));

    // Приветствие Веры на текущем языке
    if (speech) speech.innerHTML = mascotPhrase('hello');

    // Сохраняем выбор и синхронизируем селект
    try { localStorage.setItem('site_lang', lang); } catch (e) {}
    const sel = document.getElementById('langSelect');
    if (sel && sel.value !== lang) sel.value = lang;
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
// МАСКОТ ВЕРА (фразы на текущем языке)
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

const MASCOT_PHRASES = {
    ru: {
        hello:  "Привет! Я <span class=\"vera-name\">Вера</span> — медицинский фактчекер команды «Единый пульс». Напишите сомнительное утверждение — я разберу его на миф и правду!",
        true:   "Разоблачено — правда! Всё проверено, спи спокойно 💚",
        false:  "Осторожно, это миф! Я нашла подтверждение, что так думать не стоит 🚫",
        unsure: "Честно? Точного ответа у меня нет — лучше уточнить у специалиста 🤔",
        sporno: "Данные противоречивы — разберём нюансы честно 🤔"
    },
    en: {
        hello:  "Hi! I'm <span class=\"vera-name\">Vera</span> — the medical fact-checker of Team “Unified Pulse”. Type a questionable claim and I'll sort it into myth or truth!",
        true:   "Debunked as true! Everything is verified — sleep easy 💚",
        false:  "Careful, that's a myth! I found evidence you shouldn't think so 🚫",
        unsure: "Honestly? I don't have an exact answer — better check with a specialist 🤔",
        sporno: "The data is contradictory — let's look at the nuances honestly 🤔"
    },
    be: {
        hello:  "Прывітанне! Я <span class=\"vera-name\">Вера</span> — медыцынскі фактчэкер каманды «Адзіны пульс». Напішыце сумнеўнае сцверджанне — я разбяру яго на міф і праўду!",
        true:   "Разаблачана — праўда! Усё праверана, спакойна адпачывай 💚",
        false:  "Асцярожна, гэта міф! Я знайшла пацвержанне, што так думаць не варта 🚫",
        unsure: "Шчыра? Дакладнага адказу ў мяне няма — лепш удакладніце ў спецыяліста 🤔",
        sporno: "Даныя супярэчаць адзін аднаму — разбяром нюансы сумленна 🤔"
    },
    zh: {
        hello:  "你好！我是<span class=\"vera-name\">薇拉</span>——“同一脉搏”团队的医学事实核查员。请输入可疑的说法，我会帮你分辨是谣言还是真相！",
        true:   "查实了——是真的！都已核实，放心吧 💚",
        false:  "小心，这是谣言！我找到了证据，不要这么想 🚫",
        unsure: "说实话？我没有确切答案——最好咨询专业医生 🤔",
        sporno: "数据相互矛盾——我们诚实地分析一下细节 🤔"
    }
};

function mascotPhrase(kind) {
    const pack = MASCOT_PHRASES[currentLang] || MASCOT_PHRASES.ru;
    return pack[kind] !== undefined ? pack[kind] : MASCOT_PHRASES.ru[kind];
}

function setMascotImage(name) {
    if (!mascotImage) return;
    mascotImage.style.display = '';
    mascotImage.src = '/static/' + name + '.png';
}

function react(verdict) {
    if (!speech) return;
    const v = (verdict || '').toUpperCase();
    if (v.includes('ПРАВДА') || v.includes('TRUTH')) {
        setMascotImage('vera_true');
        if (mascot) { mascot.classList.add('mood-true'); mascot.classList.remove('mood-false'); }
        speech.innerHTML = mascotPhrase('true');
    } else if (v.includes('МИФ') || v.includes('MYTH')) {
        setMascotImage('vera_false');
        if (mascot) { mascot.classList.add('mood-false'); mascot.classList.remove('mood-true'); }
        speech.innerHTML = mascotPhrase('false');
    } else if (v.includes('СПОРНО') || v.includes('DISPUT')) {
        setMascotImage('vera_hello');
        if (mascot) mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = mascotPhrase('sporno');
    } else {
        setMascotImage('vera_hello');
        if (mascot) mascot.classList.remove('mood-true', 'mood-false');
        speech.innerHTML = mascotPhrase('unsure');
    }
}

// ========================================================
// ПРОВЕРКА ФАКТА (настоящий API /api/check)
// ========================================================
let lastClaim = '';
let lastVerdictFull = '';

function sendCheck() {
    const text = document.getElementById('userText').value.trim();
    if (text.length < 5) {
        speech.innerHTML = T('input_short');
        return;
    }

    const btn = document.getElementById('checkBtn');
    const btnText = document.getElementById('btnText');

    btn.disabled = true;
    btnText.textContent = T('checking');

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
        speech.innerHTML = T('net_error');
    })
    .finally(function () {
        btn.disabled = false;
        btnText.textContent = T('check');
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
        const msg = document.getElementById('ratingMessage');
        if (msg) msg.textContent = T('rating_thanks');
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
            challengeResult.textContent = T('challenge_short');
            return;
        }

        challengeSend.disabled = true;
        challengeSend.textContent = T('challenge_checking');
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
            challengeResult.textContent = data.answer || data.error || T('challenge_fail');
        })
        .catch(function () {
            challengeResult.hidden = false;
            challengeResult.textContent = T('challenge_net');
        })
        .finally(function () {
            challengeSend.disabled = false;
            challengeSend.textContent = T('challenge_send');
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
        btn.textContent = T('suggest_sending');

        fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: currentUser
                    || document.getElementById('suggestName').value.trim()
                    || T('anonymous'),
                myth: document.getElementById('suggestMyth').value.trim()
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            status.textContent = data.message || data.error || T('suggest_ok');
            if (!data.error) suggestForm.reset();
        })
        .catch(function () {
            status.textContent = T('suggest_fail');
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = T('suggest_btn');
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
        alert(T('error_ok'));
    })
    .catch(function () {
        alert(T('error_fail'));
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
    document.getElementById('authBtn').textContent = (mode === 'login') ? T('enter') : T('reg_btn');
}

function doAuth() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const status = document.getElementById('authStatus');
    if (!username || password.length < 4) {
        status.textContent = T('auth_short');
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
            status.textContent = authMode === 'login' ? T('welcome') : T('created');
            status.className = 'auth-status ok';
            currentUser = data.username || username;
            try { localStorage.setItem('veraUser', currentUser); } catch (e) {}
            showCabinet(currentUser);
            loadProfile(currentUser);
        } else {
            status.textContent = data.error || T('auth_fail');
            status.className = 'auth-status err';
        }
    })
    .catch(function () {
        status.textContent = T('server_down');
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
    { name: { ru: '🌱 Новичок', en: '🌱 Beginner', be: '🌱 Пачатковец', zh: '🌱 新手' }, needed: 0,  next: 20 },
    { name: { ru: '🔍 Доказатель', en: '🔍 Investigator', be: '🔍 Доказчык', zh: '🔍 调查员' }, needed: 20, next: 60 },
    { name: { ru: '👑 Хранитель истины', en: '👑 Truth Keeper', be: '👑 Абаронца праўды', zh: '👑 真相守护者' }, needed: 60, next: null }
];

function cabinetLevelName(lvl) {
    return (lvl.name && lvl.name[currentLang]) ? lvl.name[currentLang] : lvl.name.ru;
}

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

    // Названия и описания ачивок пока на русском — как и вердикты сервера
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
    if (header) header.textContent = T('achv_title') + ' · ' + unlocked + ' / ' + ACHIEVEMENTS.length;

    box.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="badge ${a.ok ? 'unlocked' : 'locked'} ${a.rarity || ''}" title="${a.desc}">
            <span class="badge-emoji">${a.emoji}</span>
            <span class="badge-name">${a.name}</span>
            <span class="badge-desc">${a.desc}</span>
        </div>
    `).join('');
}

function streakChipText(n) {
    return T('streak_tpl').replace('{n}', String(n || 0));
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
            if (chip) chip.textContent = streakChipText(myVisits.streak);
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
    status.textContent = T('avatar_loading');

    fetch('/api/avatar', { method: 'POST', body: fd })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data.avatar) {
            myAvatar = data.avatar;
            setAvatar(myAvatar);
            status.textContent = T('avatar_ok');
        } else {
            status.textContent = data.error || T('avatar_err');
        }
    })
    .catch(function () { status.textContent = T('avatar_err'); });
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
        list.innerHTML = '<p class="history-empty">' + T('history_empty') + '</p>';
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
        const item = nodes[i];   // именно маленькая «i» — иначе ReferenceError
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
            date: new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ru-RU', {
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
        const level = data.level || cabinetLevelName(LEVELS_INFO[points >= 60 ? 2 : points >= 20 ? 1 : 0]);
        document.getElementById('cabinetLevelChip').textContent = level;

        // Прогресс до следующего уровня
        let li = 0;
        if (points >= 60) li = 2; else if (points >= 20) li = 1;
        const lvl = LEVELS_INFO[li];
        if (lvl.next === null) {
            document.getElementById('progressText').textContent = T('progress_max');
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
                bar.title = T('stat_checked') + ': ' + count;
                activityBars.appendChild(bar);
            });
        }

        // Серия дней и аватар с сервера
        myVisits = {
            streak: data.streak || 0,
            best_streak: data.best_streak || 0,
            total_days: data.total_days || 0
        };
        document.getElementById('cabinetStreakChip').textContent = streakChipText(myVisits.streak);
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
        || T('guest');
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
                avat.textContent = (c.name || T('guest')).charAt(0).toUpperCase();
            }
            div.appendChild(avat);

            const bodyWrap = document.createElement('div');
            bodyWrap.style.flex = '1';
            bodyWrap.style.minWidth = '0';

            const head = document.createElement('div');
            head.className = 'comment-header';
            const author = document.createElement('span');
            author.className = 'comment-author';
            author.textContent = c.name || T('guest');   // было T('send') — подписывало «Отправить»
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

const GAME_LEVELS = [
    { name: { ru: '🌱 Новичок', en: '🌱 Beginner', be: '🌱 Пачатковец', zh: '🌱 新手' },
      correctNeeded: 0,  maxDifficulty: 1 },
    { name: { ru: '🔥 Знаток', en: '🔥 Expert', be: '🔥 Знаток', zh: '🔥 专家' },
      correctNeeded: 8,  maxDifficulty: 2 },
    { name: { ru: '👑 Профессор', en: '👑 Professor', be: '👑 Прафесар', zh: '👑 教授' },
      correctNeeded: 15, maxDifficulty: 3 }
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

function currentLevel() { return GAME_LEVELS[levelIndex]; }

function gameLevelName(lvl) {
    return (lvl.name && lvl.name[currentLang]) ? lvl.name[currentLang] : lvl.name.ru;
}

function maybeLevelUp() {
    const next = GAME_LEVELS[levelIndex + 1];
    if (next && correctTotal >= next.correctNeeded) {
        levelIndex++;
        showLevelUp();
    }
}

function showLevelUp() {
    if (!gameLevelEl) return;
    const lvl = currentLevel();
    gameLevelEl.textContent = T('game_level_tpl') + gameLevelName(lvl);
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

    gameVerdict.textContent = correct ? T('game_right') : T('game_wrong');
    gameVerdict.className = 'game-verdict ' + (correct ? 'right' : 'wrong');

    const realVerdict = currentQuestion.truth ? T('game_true') : T('game_myth');
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

// ========================================================
// ИНИЦИАЛИЗАЦИЯ ЯЗЫКА (селект в меню)
// ========================================================
const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', function () {
        setLanguage(this.value);
    });
}
setLanguage(currentLang);
