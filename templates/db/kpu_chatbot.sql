CREATE DATABASE IF NOT EXISTS kpu_chatbot
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE kpu_chatbot;

-- USERS: student + admin
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NULL,
  role          ENUM('student','admin') NOT NULL DEFAULT 'student',
  password_hash VARCHAR(255) NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB;

-- CHAT SESSION
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NULL,
  session_key  CHAR(36) NOT NULL,          -- UUID from backend
  channel      VARCHAR(50) NULL,           -- "web", "rest", etc
  started_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at     TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_session_key (session_key),
  KEY idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id    BIGINT UNSIGNED NOT NULL,
  sender        ENUM('user','bot','system') NOT NULL,
  message_text  TEXT NOT NULL,
  rasa_intent   VARCHAR(100) NULL,
  confidence    DECIMAL(5,4) NULL,
  metadata_json JSON NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_session_time (session_id, created_at),
  KEY idx_messages_sender (sender),
  CONSTRAINT fk_messages_session
    FOREIGN KEY (session_id) REFERENCES conversation_sessions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;