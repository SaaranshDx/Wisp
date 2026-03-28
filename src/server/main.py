import os
from pathlib import Path

from flask import Flask, json, request, jsonify
import bcrypt
import sqlite3
from flask_cors import CORS
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
DB_PATH = BASE_DIR / "db.sqlite3"
URL_MAP_PATH = BASE_DIR / "urlverificationkey.json"

load_dotenv(dotenv_path=ENV_PATH)
JWT_SECRET = os.getenv("jwt_key")

app = Flask(__name__)
CORS(app)

#initialize the url map for verification
with open(URL_MAP_PATH, encoding="utf-8") as f:
    URL_MAP = json.load(f)


def init_db():

    #initialize the database connection
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    #create the tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        client_id TEXT NOT NULL,
        UNIQUE(email, client_id)
    );
    ''')

    conn.commit()
    conn.close()
    
init_db()

@app.route('/api/createaccount', methods=['POST'])
def createaccount():

    #parse verifiaction headers
    company_id = request.headers.get("company-id")
    origin = request.headers.get("origin")

    print(origin)

    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # no need to validate the data here, the client should have already done that
    # lets parse the data here 

    # validate the origin of the request to give the client access to the database 

    allowed = URL_MAP.get(company_id)

    if not allowed:
        return jsonify({"message": "Unknown company"}), 403

    # basic check
    if origin != allowed:
        return jsonify({"message": "Invalid origin"}), 403

    # database logic implimentation

    #password hashing 
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    conn = sqlite3.connect(DB_PATH)
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

    # token encoding with jwt
    if not JWT_SECRET:
        return jsonify({"message": "Missing jwt_key in environment"}), 500

    payload = {
        "user_id": username,
        "email": email,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token})  

if __name__ == '__main__':
    app.run(debug=True)
