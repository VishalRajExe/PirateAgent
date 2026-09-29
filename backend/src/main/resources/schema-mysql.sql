-- ============================================================
-- PirateAgent - Production MySQL Database Schema
-- Compatible with MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS pirate_agent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pirate_agent;

-- 1. Tasks
CREATE TABLE IF NOT EXISTS intelligence_tasks (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(100) DEFAULT 'captain',
    user_prompt TEXT,
    status VARCHAR(32) NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    current_step VARCHAR(255),
    permitted_sources TEXT,
    created_at DATETIME,
    completed_at DATETIME,
    error_message TEXT,
    workflow_plan_json LONGTEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Datasets
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    task_id VARCHAR(64) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    schema_json LONGTEXT,
    total_records INT NOT NULL DEFAULT 0,
    duplicate_count INT NOT NULL DEFAULT 0,
    average_confidence DOUBLE NOT NULL DEFAULT 0.0,
    created_at DATETIME,
    CONSTRAINT fk_datasets_task FOREIGN KEY (task_id) REFERENCES intelligence_tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Records
CREATE TABLE IF NOT EXISTS dataset_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    data_json LONGTEXT NOT NULL,
    source_url TEXT,
    source_title VARCHAR(512),
    citation_snippet TEXT,
    confidence_score DOUBLE DEFAULT 0.95,
    is_valid BOOLEAN DEFAULT TRUE,
    INDEX idx_record_dataset (dataset_id),
    CONSTRAINT fk_records_dataset FOREIGN KEY (dataset_id) REFERENCES datasets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Source Citations
CREATE TABLE IF NOT EXISTS source_citations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL,
    url TEXT NOT NULL,
    domain VARCHAR(255),
    title VARCHAR(512),
    snippet TEXT,
    records_extracted INT DEFAULT 0,
    INDEX idx_citations_dataset (dataset_id),
    CONSTRAINT fk_citations_dataset FOREIGN KEY (dataset_id) REFERENCES datasets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Task Logs
CREATE TABLE IF NOT EXISTS task_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    timestamp DATETIME,
    step VARCHAR(64),
    message TEXT,
    level VARCHAR(16),
    INDEX idx_logs_task (task_id),
    CONSTRAINT fk_logs_task FOREIGN KEY (task_id) REFERENCES intelligence_tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
