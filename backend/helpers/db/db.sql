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
  stripe_customer_id VARCHAR(255)
  password VARCHAR(50) NOT NULL
);

CREATE TABLE interests (
  interest_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_interests (
  user_id INT,
  interest_id INT,
  PRIMARY KEY (user_id, interest_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(interest_id)
);

CREATE TABLE user_locations (
  user_id INT,
  location_id INT,
  PRIMARY KEY (user_id, location_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);
