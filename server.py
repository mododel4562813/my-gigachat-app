import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import urllib3

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Библиотека python-dotenv не установлена. Установите: pip install python-dotenv")

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

GIGACHAT_CLIENT_ID = os.getenv("GIGACHAT_CLIENT_ID")
GIGACHAT_CLIENT_SECRET = os.getenv("GIGACHAT_CLIENT_SECRET")
GIGACHAT_AUTH_URL = "https://sberbank.ru"
GIGACHAT_API_URL = "https://sberbank.ru"

# --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ПРОКСИ ДЛЯ RENDER ---
proxy_url = os.getenv("PROXY_URL")
proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None

USE_GOOGLE_SHEETS = os.path.exists("credentials.json")

if USE_GOOGLE_SHEETS:
    try:
        import gspread
        from oauth2client.service_account import ServiceAccountCredentials
        print("Google Таблицы подключены. Данные будут сохраняться.")
    except ImportError:
        print("Ошибка: Установите gspread и oauth2client для работы с Google Sheets")
        USE_GOOGLE_SHEETS = False
else:
    print("Google Таблицы не подключены (нет credentials.json).")
    print("Оценки и отзывы будут выводиться в консоль. Это нормально для этапа разработки!")

# --- ЛОКАЛЬНАЯ БАЗА ФАКТОВ (РАБОТАЕТ ВСЕГДА) ---
MOCK_FACTS = {
    "вакцины вызывают аутизм": {
        "verdict": "МИФ",
        "explanation": "Многочисленные исследования опровергли эту связь. Исследование 1998 года было отозвано из-за фальсификации данных."
    },
    "витамин с лечит простуду": {
        "verdict": "ЧАСТИЧНО ПРАВДА",
        "explanation": "Витамин C не предотвращает простуду, но может немного сократить её длительность."
    },
    "коровье молоко вредно": {
        "verdict": "МИФ",
        "explanation": "Для большинства людей без лактазной недостаточности молоко безопасно и полезно. Оно является источником кальция и белка."
    }
}

def get_gsheet_client():
    """Подключение к Google Таблицам (вернет None, если нет ключей)"""
    if not USE_GOOGLE_SHEETS:
        return None
    try:
        scope = ["https://google.com", "https://googleapis.com"]
        creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
        client = gspread.authorize(creds)
        return client.open(os.getenv("SHEET_NAME", "Фактчек_Медицина_2050"))
    except Exception as e:
        print(f"Ошибка подключения к Google Sheets: {e}")
        return None

def get_gigachat_token():
    """Получение токена доступа к GigaChat"""
    if not GIGACHAT_CLIENT_ID or not GIGACHAT_CLIENT_SECRET:
        return None
        
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '12345678-1234-1234-1234-123456789012',
        'Authorization': f'Basic {GIGACHAT_CLIENT_ID}'
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
        print(f"Ошибка авторизации в GigaChat: {e}")
        return None

def ask_gigachat(user_text):
    """Запрос к нейросети GigaChat"""
    token = get_gigachat_token()
    if not token:
        for key, value in MOCK_FACTS.items():
            if key in user_text.lower():
                return value
        return {"verdict": "НЕЗНАЮ", "explanation": "Я не компетентна в этом вопросе, пожалуйста, обратитесь к специалисту. (GigaChat временно недоступен)"}

    prompt = f"""Ты — строгий медицинский фактчекер. Пользователь утверждает: "{user_text}".
    Твоя задача — проверить это утверждение с научной точки зрения.
    Верни ответ СТРОГО в формате JSON (без markdown-разметки, только чистый JSON):
    {{
        "verdict": "МИФ" | "ПРАВДА" | "СПОРНО" | "НЕЗНАЮ",
        "explanation": "Подробное объяснение с указанием причин. Если не знаешь или вопрос требует индивидуальной консультации врача, напиши 'Я не компетентна в этом вопросе, пожалуйста, обратитесь к специалисту.'"
    }}
    Не давай медицинских назначений."""

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
        content = response.json()['choices'][0]['message']['content']
        content = content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        print(f"Техническая ошибка. Уже все чиним!: {e}")
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

    result = None
    sheet = get_gsheet_client()

    if sheet:
        try:
            facts_sheet = sheet.worksheet("Facts")
            records = facts_sheet.get_all_records()
            for row in records:
                if user_text in str(row.get('Утверждение', '')).lower():
                    result = {"verdict": row.get('Вердикт', 'НЕЗНАЮ'), "explanation": row.get('Объяснение', '')}
                    break
        except Exception as e:
            print(f"Ошибка чтения Google Sheets: {e}")

    if not result:
        result = ask_gigachat(user_text)

    if sheet:
        try:
            log_sheet = sheet.worksheet("Logs")
            log_sheet.append_row([user_text, result['verdict'], datetime.now().strftime("%Y-%m-%d %H:%M")])
        except Exception as e:
            print(f"Ошибка логирования в Sheets: {e}")
    else:
        print(f"[LOG] Запрос: '{user_text}' -> Вердикт: {result['verdict']}")

    return jsonify(result)

@app.route('/api/rate', methods=['POST'])
def rate_answer():
    data = request.get_json()
    claim = data.get('claim')
    rating = data.get('rating')
    
    if not claim or not rating:
        return jsonify({"error": "Недостаточно данных"}), 400

    sheet = get_gsheet_client()
    if sheet:
        try:
            rating_sheet = sheet.worksheet("Ratings")
            rating_sheet.append_row([claim, rating, datetime.now().strftime("%Y-%m-%d %H:%M")])
            print(f"⭐ Оценка {rating}/5 сохранена в Google Таблицу для: '{claim}'")
        except Exception as e:
            print(f"Ошибка сохранения оценки в Sheets: {e}")
    else:
        print(f"⭐ [ОЦЕНКА] Утверждение: '{claim}' | Оценка: {rating}/5 | Время: {datetime.now().strftime('%H:%M:%S')}")
            
    return jsonify({"status": "ok"})

@app.route('/api/review', methods=['POST'])
def submit_review():
    data = request.get_json()
    name = data.get('name', 'Аноним')
    review_text = data.get('review', '').strip()
    
    if not review_text:
        return jsonify({"error": "Пустой отзыв"}), 400

    sheet = get_gsheet_client()
    if sheet:
        try:
            review_sheet = sheet.worksheet("Reviews")
            review_sheet.append_row([name, review_text, datetime.now().strftime("%Y-%m-%d %H:%M")])
            print(f"💬 Отзыв от {name} сохранен в Google Таблицу")
        except Exception as e:
            print(f"Ошибка сохранения отзыва в Sheets: {e}")
    else:
        print(f"💬 [ОТЗЫВ] Имя: {name} | Текст: {review_text} | Время: {datetime.now().strftime('%H:%M:%S')}")
            
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print("🚀 Сервер запущен на http://127.0.0.1:8080")
    app.run(debug=True, port=8080)
