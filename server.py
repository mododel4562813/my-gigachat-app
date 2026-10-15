import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import urllib3
import base64

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Считываем два раздельных ключа из настроек Render
GIGACHAT_CLIENT_ID = os.getenv("GIGACHAT_CLIENT_ID")
GIGACHAT_CLIENT_SECRET = os.getenv("GIGACHAT_CLIENT_SECRET")

GIGACHAT_AUTH_URL = "https://sberbank.ru"
GIGACHAT_API_URL = "https://sberbank.ru"

# Настройки прокси
proxy_url = os.getenv("PROXY_URL")
proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None

# Заглушка, если Сбер недоступен
MOCK_FACTS = {
    "вакцины вызывают аутизм": {
        "verdict": "МИФ",
        "explanation": "Многочисленные исследования опровергли эту связь. Исследование 1998 года было отозвано из-за фальсификации данных."
    },
    "витамин с лечит простуду": {
        "verdict": "ЧАСТИЧНО ПРАВДА",
        "explanation": "Витамин C не предотвращает простуду, но может немного сократить её длительность."
    }
}

def get_gigachat_token():
    """Автоматическая сборка токена из раздельных ID и Секрета"""
    if not GIGACHAT_CLIENT_ID or not GIGACHAT_CLIENT_SECRET:
        print("[ERROR] Не заполнены GIGACHAT_CLIENT_ID или GIGACHAT_CLIENT_SECRET")
        return None
        
    # Python сам кодирует голые ID и Секрет через двоеточие в формат Base64
    raw_auth = f"{GIGACHAT_CLIENT_ID}:{GIGACHAT_CLIENT_SECRET}"
    encoded_auth = base64.b64encode(raw_auth.encode('utf-8')).decode('utf-8')

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '12345678-1234-1234-1234-123456789012',
        'Authorization': f'Basic {encoded_auth}'
    }
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
        print(f"[ERROR] Ошибка авторизации: {e}")
        return None

def ask_gigachat(user_text):
    token = get_gigachat_token()
    if not token:
        for key, value in MOCK_FACTS.items():
            if key in user_text.lower():
                return value
        return {"verdict": "НЕЗНАЮ", "explanation": "Я не компетентна в этом вопросе, пожалуйста, обратитесь к специалисту. (GigaChat временно недоступен)"}

    prompt = f'Ты — строгий медицинский фактчекер. Пользователь утверждает: "{user_text}". Проверь это утверждение с научной точки зрения. Верни ответ СТРОГО в формате JSON без markdown-разметки: {{"verdict": "МИФ" | "ПРАВДА" | "СПОРНО" | "НЕЗНАЮ", "explanation": "Подробное объяснение"}}'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    payload = {
        "model": "GigaChat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
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
        content = response.json()['choices']['message']['content']
        content = content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        print(f"[ERROR] Ошибка запроса текста: {e}")
        for key, value in MOCK_FACTS.items():
            if key in user_text.lower():
                return value
        return {"verdict": "НЕЗНАЮ", "explanation": "Я не компетентна в этом вопросе, пожалуйста, обратитесь к специалисту."}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/check', methods=['POST'])
def check_claim():
    data = request.get_json()
    user_text = data.get('text', '').lower().strip()
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
