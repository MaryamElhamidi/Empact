CREATE DATABASE empact;

USE empact;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  stripe_customer_id VARCHAR(255),
  password VARCHAR(255) NOT NULL
);

CREATE TABLE locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

/*
Global issues (replaces interests; used for user preferences and discover counts)
*/
CREATE TABLE global_issues (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(20)
);

CREATE TABLE user_issues (
  user_id INT,
  issue_id INT,
  PRIMARY KEY (user_id, issue_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (issue_id) REFERENCES global_issues(issue_id)
);

CREATE TABLE user_locations (
  user_id INT,
  location_id INT,
  PRIMARY KEY (user_id, location_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

/*
Donations (user_id, campaign_url, amount, currency, country for impact stats)
*/
CREATE TABLE donations (
  donation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_url VARCHAR(500),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  country VARCHAR(100),
  people_helped INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

/*
Opportunities (shape matches opportunities.json)
*/
CREATE TABLE opportunities (
  opportunity_id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  cause VARCHAR(500),
  region VARCHAR(255),
  org_name VARCHAR(255),
  org_website VARCHAR(500),
  org_verified TINYINT(1) DEFAULT 1,
  donation_url VARCHAR(500),
  suggested_amounts JSON,
  `values` JSON,
  ai_confidence_score DECIMAL(3,2),
  date_discovered VARCHAR(50),
  source_url VARCHAR(500)
);

/*
Notifications (per user)
*/
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target VARCHAR(255),
  user_name VARCHAR(255),
  user_avatar VARCHAR(500),
  user_fallback VARCHAR(10),
  is_read TINYINT(1) DEFAULT 0,
  actions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

/*
Wallet balance per user
*/
CREATE TABLE wallets (
  wallet_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  balance_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

/*
Payment methods (cards)
*/
CREATE TABLE payment_methods (
  payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  last_four VARCHAR(4) NOT NULL,
  exp_month TINYINT NOT NULL,
  exp_year SMALLINT NOT NULL,
  stripe_payment_method_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
