import os
from pathlib import Path
from functools import wraps
from random import random

from flask import Flask, json, request, jsonify, g
import bcrypt
import sqlite3
from flask_cors import CORS
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import smtplib
from email.message import EmailMessage


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
DB_PATH = BASE_DIR / "db.sqlite3"
URL_MAP_PATH = BASE_DIR / "urlverificationkey.json"

load_dotenv(dotenv_path=ENV_PATH)
JWT_SECRET = os.getenv("jwt_key")
JWT_EXP_HOURS = int(os.getenv("jwt_exp_hours", "24"))
EMAIL_ADDRESS = os.getenv("email_address")
APP_PASSWORD = os.getenv("app_password") # Use the app password here

verification_code = None

app = Flask(__name__)
CORS(app)

#initialize the url map for verification
def load_url_map():
    with open(URL_MAP_PATH, encoding="utf-8") as f:
        return json.load(f)

def save_url_map(data):
    with open(URL_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


#URL_MAP = url_map = load_url_map()


def validate_client_request():
    origin = request.headers.get("origin")

    if not origin:
        return None, jsonify({"message": "Missing origin header"}), 403

    
    URL_MAP = load_url_map()

    # Find the company whose allowed origin matches the request origin
    company_id = next(
        (corp for corp, allowed_origin in URL_MAP.items() if allowed_origin == origin),
        None
    )

    if not company_id:
        return None, jsonify({"message": "Unknown or unauthorized origin"}), 403

    return company_id, None, None

def build_token(username, email, client_id):
    if not JWT_SECRET:
        return None, jsonify({"message": "Missing jwt_key in environment"}), 500

    issued_at = datetime.now(timezone.utc).replace(tzinfo=None)
    payload = {
        "user_id": username,
        "email": email,
        "client_id": client_id,
        "iat": issued_at,
        "exp": issued_at + timedelta(hours=JWT_EXP_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256"), None, None


def extract_bearer_token():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None, jsonify({"message": "Missing Bearer token"}), 401

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None, jsonify({"message": "Missing Bearer token"}), 401

    return token, None, None


def decode_token(token):
    if not JWT_SECRET:
        return None, jsonify({"message": "Missing jwt_key in environment"}), 500

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"message": "Invalid token"}), 401

    return payload, None, None


def verify_authenticated_request():
    company_id, error_response, status_code = validate_client_request()
    if error_response:
        return None, None, error_response, status_code

    token, error_response, status_code = extract_bearer_token()
    if error_response:
        return None, None, error_response, status_code

    payload, error_response, status_code = decode_token(token)
    if error_response:
        return None, None, error_response, status_code

    if payload.get("client_id") != company_id:
        return None, None, jsonify({"message": "Token client does not match request"}), 401

    stored_token = get_saved_token(payload.get("email"), company_id)
    if not stored_token or stored_token != token:
        return None, None, jsonify({"message": "Token is not active"}), 401

    return company_id, payload, None, None


def jwt_required(route_handler):
    @wraps(route_handler)
    def wrapped(*args, **kwargs):
        company_id, payload, error_response, status_code = verify_authenticated_request()
        if error_response:
            return error_response, status_code

        g.company_id = company_id
        g.jwt_payload = payload
        return route_handler(*args, **kwargs)

    return wrapped


def init_db():

    #initialize the database connection
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    cursor = conn.cursor()

    #create the tables
    cursor.execute('''
    CREATE TABLE sessions (
        email TEXT NOT NULL,
        company_id TEXT NOT NULL,
        token TEXT NOT NULL,
        PRIMARY KEY (email, company_id)
    );                   
    ''')

    cursor.execute("PRAGMA table_info(users)")
    existing_columns = {row[1] for row in cursor.fetchall()}

    if "auth_token" not in existing_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_token TEXT")

    conn.commit()
    conn.close()
    
init_db()


def save_user_token(email, client_id, token):
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    cursor = conn.cursor()

    try:
        cursor.execute("""
        UPDATE users
        SET auth_token = ?
        WHERE email = ? AND client_id = ?
        """, (token, email, client_id))
        conn.commit()
    finally:
        conn.close()


def get_saved_token(email, client_id):
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    cursor = conn.cursor()

    try:
        cursor.execute("""
        SELECT auth_token
        FROM users
        WHERE email = ? AND client_id = ?
        """, (email, client_id))
        row = cursor.fetchone()
    finally:
        conn.close()

    if not row:
        return None

    return row[0]


def clear_user_token(email, client_id):
    save_user_token(email, client_id, None)

@app.route('/api/createaccount', methods=['POST'])
def createaccount():
    company_id, error_response, status_code = validate_client_request()
    if error_response:
        return error_response, status_code

    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # no need to validate the data here, the client should have already done that
    # lets parse the data here 

    # database logic implimentation

    #password hashing 
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO users (username, email, password_hash, client_id)
        VALUES (?, ?, ?, ?)
        """, (username, email, password_hash, company_id))

        conn.commit()

    except sqlite3.IntegrityError:
        return jsonify({"message": "User already exists"}), 400

    finally:
        conn.close()

    token, error_response, status_code = build_token(username, email, company_id)
    if error_response:
        return error_response, status_code

    save_user_token(email, company_id, token)

    return jsonify({"token": token})  


@app.route('/api/login', methods=['POST'])
def login():
    try:
        company_id, error_response, status_code = validate_client_request()
        if error_response:
            return error_response, status_code

        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        conn = sqlite3.connect(DB_PATH, timeout=10.0)
        cursor = conn.cursor()

        try:
            cursor.execute("""
            SELECT username, email, password_hash
            FROM users
            WHERE username = ? AND client_id = ?
            """, (username, company_id))
            user = cursor.fetchone()
        finally:
            conn.close()

        if not user:
            return jsonify({"message": "Invalid username or password"}), 401

        stored_username, email, password_hash = user

        if not bcrypt.checkpw(password.encode(), password_hash.encode()):
            return jsonify({"message": "Invalid username or password"}), 401

        token, error_response, status_code = build_token(stored_username, email, company_id)
        if error_response:
            return error_response, status_code

        save_user_token(email, company_id, token)

        return jsonify({"token": token})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500 


@app.route('/api/verify-token', methods=['GET'])
@jwt_required
def verify_token():
    return jsonify({
        "valid": True,
        "user_id": g.jwt_payload.get("user_id"),
        "email": g.jwt_payload.get("email"),
        "client_id": g.jwt_payload.get("client_id"),
        "expires_at": g.jwt_payload.get("exp")
    })


@app.route('/api/logout', methods=['POST'])
@jwt_required
def logout():
    clear_user_token(g.jwt_payload.get("email"), g.company_id)
    return jsonify({"message": "Logged out"})

@app.route('/api/get-company', methods=['GET'])
def get_company():
    company_id, error_response, status_code = validate_client_request()
    if error_response:
        return error_response, status_code
    
    return jsonify({"company_id": company_id})
    
@app.route('/api/me', methods=['GET'])
@jwt_required
def me():
    return jsonify({
        "username": g.jwt_payload.get("user_id"),
        "email": g.jwt_payload.get("email"),
        "company_id": g.company_id
    })

@app.route('/api/dashboard', methods=['GET'])
@jwt_required
def dashboard():
    url_map = load_url_map()
    origin = url_map.get(g.company_id)

    return jsonify({
        "username": g.jwt_payload.get("user_id"),
        "company_id": g.company_id,
        "origin": origin
    })

@app.route('/api/origin', methods=['POST'])
@jwt_required
def set_origin():
    data = request.get_json()
    new_origin = data.get("origin")

    if not new_origin:
        return jsonify({"message": "Origin required"}), 400

    url_map = load_url_map()
    url_map[g.company_id] = new_origin
    save_url_map(url_map)

    return jsonify({
        "message": "Origin saved",
        "origin": new_origin
    })

@app.route('/api/origin', methods=['DELETE'])
@jwt_required
def delete_origin():
    url_map = load_url_map()

    if g.company_id in url_map:
        del url_map[g.company_id]
        save_url_map(url_map)

    return jsonify({"message": "Origin deleted"})

# here we would add the password less auth

def load_url_map():
    with open(URL_MAP_PATH, encoding="utf-8") as f:
        return json.load(f)  # {"corp1": "https://a.com"}
    
def get_company_from_origin(origin: str):
    if not origin:
        return None

    url_map = load_url_map()

    for company_id, allowed_origin in url_map.items():
        if allowed_origin == origin:
            return company_id

    return None

def send_verification_email(to_email, verification_code, company_id):
    msg = EmailMessage()
    msg['Subject'] = 'verification code for logging into ' + company_id
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Hi i am Saaransh from the wisp team</h2>
            <p>{company_id} requested a verification code</p>
            <h1>{verification_code}</h1>
            <p>If you didnt request this, ignore this email.</p>
        </body>
    </html>
    """

    msg.set_content(f"Your verification code is {verification_code}")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_ADDRESS, APP_PASSWORD)
            smtp.send_message(msg)
        return "Email sent successfully!"
    except Exception as e:
        print(f"Error: {e}")
        return "Failed to send email"

import jwt

SECRET = os.getenv("jwt_key")

def build_token(email, company_id):
    payload = {
        "email": email,
        "company_id": company_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    return token

def save_session(email, company_id, token):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO sessions (email, company_id, token)
    VALUES (?, ?, ?)
    ON CONFLICT(email, company_id)
    DO UPDATE SET token = excluded.token
    """, (email, company_id, token))

    conn.commit()
    conn.close()

def clear_session(email, company_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    DELETE FROM sessions WHERE email = ? AND company_id = ?
    """, (email, company_id))

    conn.commit()
    conn.close()

@app.route('/api/auth/magics', methods=['POST'])
def send_magic_link():
    origin = request.headers.get("origin")
    company_id = get_company_from_origin(origin)

    if not origin:
        return jsonify({"message": "Missing origin header"}), 401

    if not company_id:
        return jsonify({"message": "Unauthorized origin"}), 401    

    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email required"}), 400

    verification_code = str(random.randint(0, 999999)).zfill(6)

    verification_store[email] = {
        "code": verification_code,
        "expires": datetime.utcnow() + timedelta(minutes=5),
        "company_id": company_id
    }

    status = send_verification_email(email, verification_code, company_id)

    return jsonify({"message": status})

@app.route('/api/auth/magics/verify', methods=['POST'])
def verify_magic():
    origin = request.headers.get("origin")
    company_id = get_company_from_origin(origin)

    if not origin:
        return jsonify({"message": "Missing origin header"}), 401

    if not company_id:
        return jsonify({"message": "Unauthorized origin"}), 401

    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    record = verification_store.get(email)

    if not record:
        return jsonify({"message": "No code found"}), 400

    if record["company_id"] != company_id:
        return jsonify({"message": "Company mismatch"}), 401

    if record["expires"] < datetime.utcnow():
        return jsonify({"message": "Code expired"}), 400

    if record["code"] != code:
        return jsonify({"message": "Invalid code"}), 401

    # remove code
    del verification_store[email]

    # 🔥 create token
    token = build_token(email, company_id)

    # 🔥 save session
    save_session(email, company_id, token)

    return jsonify({"token": token})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    origin = request.headers.get("origin")
    company_id = get_company_from_origin(origin)

    if not origin:
        return jsonify({"message": "Missing origin header"}), 401

    if not company_id:
        return jsonify({"message": "Unauthorized origin"}), 401

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        email = payload.get("email")
    except:
        return jsonify({"message": "Invalid token"}), 401

    clear_session(email, company_id)

    return jsonify({"message": "Logged out"})

if __name__ == '__main__':
    app.run(debug=True)

