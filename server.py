import os
import base64
import urllib3
import requests
from flask import Flask, render_template, request, jsonify

# Отключаем предупреждения об отсутствии SSL-верификации (если это необходимо)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Пытаемся загрузить переменные из .env (полезно при локальной разработке)
try:
    from dotenv import load_env
    load_env()
except ImportError:
    pass

app = Flask(__name__)

# Считываем авторизационные данные ИИ-агента
GIGACHAT_CLIENT_ID = os.getenv("GIGACHAT_CLIENT_ID")
GIGACHAT_CLIENT_SECRET = os.getenv("GIGACHAT_CLIENT_SECRET")

# ИСПРАВЛЕНО: Официальные рабочие эндпоинты API GigaChat
GIGACHAT_AUTH_URL = "https://sberbank.ru"
GIGACHAT_API_URL = "https://giga.chat"

proxy_url = os.getenv("PROXY_URL")
proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None

def get_gigachat_token():
    if not GIGACHAT_CLIENT_ID or not GIGACHAT_CLIENT_SECRET:
        return None
        
    raw_auth = f"{GIGACHAT_CLIENT_ID}:{GIGACHAT_CLIENT_SECRET}"
    encoded_auth = base64.b64encode(raw_auth.encode('utf-8')).decode('utf-8')

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '12345678-1234-1234-1234-123456789012',
        'Authorization': f'Basic {encoded_auth}'
    }
    # Используем базовый scope для физлиц. Для бизнеса замените на GIGACHAT_API_CORP
    payload = {'scope': 'GIGACHAT_API_PERS'}
    
    try:
        response = requests.post(
            GIGACHAT_AUTH_URL, 
            headers=headers, 
            data=payload, 
            verify='russia_trusted_root.pem', 
            proxies=proxies
        )
        response.raise_for_status()
        return response.json().get('access_token')
    except Exception as e:
        print(f"Ошибка при получении токена: {e}")
        return None

def ask_gigachat(user_text):
    token = get_gigachat_token()
    if not token:
        return {"verdict": "ОШИБКА", "explanation": "Нет соединения с сервером авторизации. Проверьте ключи и прокси."}

    prompt = (
        f"Ты медицинский фактчекер. Проверь утверждение пользователя: '{user_text}'. "
        f"Напиши в начале 'Вердикт: МИФ', 'Вердикт: ПРАВДА' или 'Вердикт: СПОРНО', "
        f"а затем подробно объясни почему с научной точки зрения."
    )

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    payload = {
        "model": "GigaChat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }
    
    try:
        response = requests.post(
            GIGACHAT_API_URL, 
            headers=headers, 
            json=payload, 
            verify='russia_trusted_root.pem', 
            proxies=proxies
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        
        # Определяем вердикт для отображения плашки на фронтенде
        verdict = "НЕЗНАЮ"
        if "миф" in content.lower(): 
            verdict = "МИФ"
        elif "правда" in content.lower(): 
            verdict = "ПРАВДА"
        elif "спорно" in content.lower(): 
            verdict = "СПОРНО"
        
        return {"verdict": verdict, "explanation": content}
    except Exception as e:
        return {"verdict": "ОШИБКА", "explanation": f"Ошибка запроса к ИИ: {e}"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/check', methods=['POST'])
def check_claim():
    data = request.get_json()
    user_text = data.get('text', '').strip()
    if not user_text:
        return jsonify({"error": "Пустой запрос"}), 400
    result = ask_gigachat(user_text)
    return jsonify(result)

@app.route('/api/rate', methods=['POST'])
def rate_answer(): 
    return jsonify({"status": "ok"})

@app.route('/api/review', methods=['POST'])
def submit_review(): 
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
