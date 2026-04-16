from app import app, bcrypt, get_db_connection

with app.app_context():
    pw_hash = bcrypt.generate_password_hash("admin123").decode('utf-8')
    db_conn = get_db_connection()
    cursor = db_conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, full_name, password_hash, role) VALUES (%s, %s, %s, %s)",
        ("admin@kpu.ca", "System Admin", pw_hash, "admin")
    )
    db_conn.commit()
    print("Admin inserted!")
