-- Migration: merge interests + global_issues into single global_issues; rename user_interests -> user_issues
--
-- Run on existing DBs that have the old schema (interests, user_interests, global_issues with sort_order).
-- Idempotent: safe to run again after migration (skips data steps when old tables are gone).
--
-- From project root:  mysql -u <user> -p empact < backend/helpers/db/migrate_interests_to_global_issues.sql
-- Or in MySQL client:  SOURCE /path/to/migrate_interests_to_global_issues.sql;

USE empact;

-- 1. Drop sort_order from global_issues if present
SET @dbname = DATABASE();
SET @drop_sort = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'global_issues' AND COLUMN_NAME = 'sort_order'
);
SET @sql = IF(@drop_sort > 0, 'ALTER TABLE global_issues DROP COLUMN sort_order', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Merge interest names into global_issues and copy user_interests -> user_issues (only if old tables exist)
DELIMITER //
CREATE PROCEDURE _migrate_interests_data()
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'interests') > 0 THEN
    INSERT INTO global_issues (name, icon)
    SELECT i.name, NULL FROM interests i
    WHERE NOT EXISTS (SELECT 1 FROM global_issues g WHERE g.name = i.name);
  END IF;

  CREATE TABLE IF NOT EXISTS user_issues (
    user_id INT,
    issue_id INT,
    PRIMARY KEY (user_id, issue_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES global_issues(issue_id)
  );

  IF (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_interests') > 0 THEN
    INSERT IGNORE INTO user_issues (user_id, issue_id)
    SELECT ui.user_id, g.issue_id
    FROM user_interests ui
    JOIN interests i ON i.interest_id = ui.interest_id
    JOIN global_issues g ON g.name = i.name;
  END IF;

  DROP TABLE IF EXISTS user_interests;
  DROP TABLE IF EXISTS interests;
END//
DELIMITER ;
CALL _migrate_interests_data();
DROP PROCEDURE _migrate_interests_data;
