from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import requests
import uuid
import os
import json
import bcrypt
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET", "change-this-to-a-random-secret")

# Allow cross-origin requests flexibly
CORS(app, supports_credentials=True)

RASA_URL = os.environ.get("RASA_URL", "http://127.0.0.1:5005/webhooks/rest/webhook")


# -----------------------
# DB Helpers
# -----------------------
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "kpu_chatbot"),
    )


def get_sender_id() -> str:
    # One sender id per browser session (prevents slot carry-over issues)
    if "sender_id" not in session:
        session["sender_id"] = str(uuid.uuid4())
    return session["sender_id"]


def get_logged_in_user_id():
    # We'll store user_id in Flask session after login
    return session.get("user_id")


def get_or_create_conversation_session(db_conn, session_key: str, user_id):
    """
    session_key = your browser sender_id (UUID)
    user_id = None if user not logged in
    Returns: session_row_id (conversation_sessions.id)
    """
    cursor = db_conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, user_id FROM conversation_sessions WHERE session_key = %s",
        (session_key,),
    )
    row = cursor.fetchone()

    if row:
        # If user logs in later, attach user_id to the existing conversation session
        if user_id and row["user_id"] is None:
            cursor.execute(
                "UPDATE conversation_sessions SET user_id=%s WHERE id=%s",
                (user_id, row["id"]),
            )
            db_conn.commit()

        cursor.close()
        return row["id"]

    # Create new session
    cursor.execute(
        """
        INSERT INTO conversation_sessions (user_id, session_key, channel)
        VALUES (%s, %s, %s)
        """,
        (user_id, session_key, "web"),
    )
    db_conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    return new_id


def save_message(db_conn, session_id: int, sender: str, text: str, rasa_intent=None, confidence=None, metadata=None):
    cursor = db_conn.cursor()
    metadata_json = json.dumps(metadata) if metadata is not None else None

    cursor.execute(
        """
        INSERT INTO messages (session_id, sender, message_text, rasa_intent, confidence, metadata_json)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (session_id, sender, text, rasa_intent, confidence, metadata_json),
    )
    db_conn.commit()
    cursor.close()


# -----------------------
# Pages
# -----------------------
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# -----------------------
# Auth APIs
# -----------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users (email, full_name, password_hash, role)
            VALUES (%s, %s, %s, 'student')
            """,
            (email, full_name, pw_hash),
        )
        conn.commit()
        return jsonify({"message": "User created"}), 201

    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409

    finally:
        cursor.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, email, role, password_hash, full_name FROM users WHERE email=%s AND is_active=1", (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401

    # Save login in Flask session
    session["user_id"] = user["id"]
    session["role"] = user["role"]

    return jsonify({
        "message": "Login successful", 
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "full_name": user.get("full_name", "")
        }
    })


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    session.pop("role", None)
    return jsonify({"message": "Logged out"})


@app.route("/guest", methods=["POST"])
def guest():
    session["user_id"] = "guest"
    session["role"] = "guest"
    return jsonify({"message": "Guest login successful", "user_id": "guest", "role": "guest"})


@app.route("/me", methods=["GET"])
def me():
    if not session.get("user_id"):
        return jsonify({"logged_in": False})
    return jsonify({"logged_in": True, "user_id": session["user_id"], "role": session.get("role")})


@app.route("/settings/profile", methods=["PUT"])
def update_profile():
    user_id = get_logged_in_user_id()
    if not user_id or user_id == "guest":
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True) or {}
    full_name = (data.get("full_name") or "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET full_name=%s WHERE id=%s", (full_name, user_id))
        conn.commit()
        return jsonify({"message": "Profile updated successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": "Failed to update profile", "details": str(err)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/settings/password", methods=["PUT"])
def update_password():
    user_id = get_logged_in_user_id()
    if not user_id or user_id == "guest":
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True) or {}
    current_pw = data.get("current_password") or ""
    new_pw = data.get("new_password") or ""

    if not current_pw or not new_pw:
        return jsonify({"error": "Current and new passwords are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT password_hash FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        
        if not user or not bcrypt.checkpw(current_pw.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Incorrect current password"}), 401

        new_hash = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute("UPDATE users SET password_hash=%s WHERE id=%s", (new_hash, user_id))
        conn.commit()
        
        return jsonify({"message": "Password updated successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": "Database error", "details": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# -----------------------
# Chat API (logs conversation)
# -----------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    message = (data.get("message") or "").strip()

    # Use session sender id by default
    sender_key = data.get("sender") or get_sender_id()

    if not message:
        return jsonify({"error": "message is required"}), 400

    user_id = get_logged_in_user_id()
    if user_id == "guest":
        user_id = None

    db_conn = None
    try:
        db_conn = get_db_connection()

        # Create / retrieve DB conversation session
        conv_session_id = get_or_create_conversation_session(db_conn, sender_key, user_id)

        # Save user message
        save_message(db_conn, conv_session_id, "user", message)

        # Send to Rasa
        r = requests.post(
            RASA_URL,
            json={"sender": sender_key, "message": message},
            timeout=15
        )
        r.raise_for_status()
        rasa_messages = r.json()  # usually a list of { "text": "...", ... }

        # Save bot messages
        if isinstance(rasa_messages, list):
            for m in rasa_messages:
                bot_text = (m.get("text") or "").strip()
                if bot_text:
                    save_message(db_conn, conv_session_id, "bot", bot_text, metadata=m)
        else:
            # Fallback if Rasa returned unexpected structure
            save_message(db_conn, conv_session_id, "bot", json.dumps(rasa_messages), metadata=rasa_messages)

        return jsonify(rasa_messages)

    except mysql.connector.Error as err:
        return jsonify({"error": "Database error", "details": str(err)}), 500

    except requests.exceptions.ConnectionError as e:
        with open("flask_debug.log", "a") as f: f.write(f"ConnectionError: {str(e)}\n")
        return jsonify({"error": "Rasa is not reachable. Is it running on port 5005?"}), 502
    except requests.exceptions.Timeout as e:
        with open("flask_debug.log", "a") as f: f.write(f"Timeout: {str(e)}\n")
        return jsonify({"error": "Rasa request timed out."}), 504
    except requests.exceptions.HTTPError as e:
        with open("flask_debug.log", "a") as f: f.write(f"HTTPError: {str(e)}\n")
        return jsonify({"error": "Rasa returned an error.", "details": str(e)}), 502
    except Exception as e:
        import traceback
        with open("flask_debug.log", "a") as f: f.write(f"Exception: {traceback.format_exc()}\n")
        return jsonify({"error": "Unexpected server error", "details": str(e)}), 500
    finally:
        if db_conn:
            db_conn.close()


@app.route("/admin/faqs", methods=["GET", "POST"])
def admin_faqs():
    user_id = get_logged_in_user_id()
    if not user_id or session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if request.method == "GET":
        cursor.execute("SELECT * FROM faqs ORDER BY id DESC")
        faqs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(faqs)
        
    if request.method == "POST":
        data = request.get_json(force=True) or {}
        try:
            cursor.execute(
                "INSERT INTO faqs (question, answer, category, tags, published) VALUES (%s, %s, %s, %s, %s)",
                (data.get("question", ""), data.get("answer", ""), data.get("category", ""), data.get("tags", ""), int(data.get("published", True)))
            )
            conn.commit()
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            conn.close()

@app.route("/admin/faqs/<int:faq_id>", methods=["DELETE"])
def delete_faq(faq_id):
    user_id = get_logged_in_user_id()
    if not user_id or session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM faqs WHERE id=%s", (faq_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"success": True})

@app.route("/admin/reindex_faqs", methods=["POST"])
def reindex_faqs():
    user_id = get_logged_in_user_id()
    if not user_id or session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    return jsonify({"success": True})

@app.route("/history", methods=["GET"])
def history():
    user_id = get_logged_in_user_id()
    if not user_id or user_id == "guest":
        return jsonify({"error": "Must be logged in to view history"}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT m.id, m.sender, m.message_text, m.created_at
            FROM messages m
            JOIN conversation_sessions cs ON m.session_id = cs.id
            WHERE cs.user_id = %s
            ORDER BY m.created_at ASC
        """, (user_id,))
        messages = cursor.fetchall()
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)