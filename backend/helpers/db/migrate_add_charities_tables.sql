-- Migration: add causes, regions, charities, charity_causes, charity_regions for existing DBs
-- Run before seed_charities_from_registry.js if your DB was created before these tables existed.
-- Usage: mysql -u <user> -p empact < backend/helpers/db/migrate_add_charities_tables.sql

USE empact;

CREATE TABLE IF NOT EXISTS causes (
  cause_slug VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS regions (
  region_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS charities (
  charity_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  donation_url VARCHAR(500),
  description TEXT,
  verified TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS charity_causes (
  charity_id VARCHAR(50),
  cause_slug VARCHAR(50),
  PRIMARY KEY (charity_id, cause_slug),
  FOREIGN KEY (charity_id) REFERENCES charities(charity_id) ON DELETE CASCADE,
  FOREIGN KEY (cause_slug) REFERENCES causes(cause_slug)
);

CREATE TABLE IF NOT EXISTS charity_regions (
  charity_id VARCHAR(50),
  region_id INT,
  PRIMARY KEY (charity_id, region_id),
  FOREIGN KEY (charity_id) REFERENCES charities(charity_id) ON DELETE CASCADE,
  FOREIGN KEY (region_id) REFERENCES regions(region_id)
);
