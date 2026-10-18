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
            body: JSON.stringify({ text: userText })
        });

        const data = await response.json();

        document.getElementById('claimText').innerText = userText;
        document.getElementById('explanationText').innerText = data.explanation;

        const badge = document.getElementById('verdictBadge');
        badge.className = 'verdict-badge ' + data.verdict.toLowerCase();
        badge.innerText = data.verdict;

        resultDiv.classList.remove('hidden');
    } catch (error) {
        alert('Ошибка при проверке факта');
        console.error(error);
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
            body: JSON.stringify({ claim: claim, rating: value })
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
                    <span class="comment-author">
