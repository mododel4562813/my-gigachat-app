async function sendCheck() {
    const userText = document.getElementById('userText').value.trim();
    if (!userText) return;

    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('btnSpinner');
    const checkBtn = document.getElementById('checkBtn');
    const resultDiv = document.getElementById('result');

    // Включаем загрузку
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
        
        // Показываем результат
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
        // Выключаем загрузку
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        checkBtn.disabled = false;
    }
}

async function rate(value) {
    const claim = document.getElementById('claimText').innerText;
    const msgDiv = document.getElementById('ratingMessage');
    
    // Активируем сердечки визуально
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

async function submitReview() {
    const name = document.getElementById('reviewName').value.trim();
    const review = document.getElementById('reviewText').value.trim();
    if (!review) return;

    try {
        await fetch('/api/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name || 'Аноним', review: review })
        });
        alert('Отзыв успешно отправлен!');
        document.getElementById('reviewName').value = '';
        document.getElementById('reviewText').value = '';
    } catch (e) {
        alert('Не удалось отправить отзыв');
        console.error(e);
    }
}
