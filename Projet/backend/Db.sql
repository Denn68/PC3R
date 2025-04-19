-- Clear the database
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS film_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS films;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS films (
    id SERIAL PRIMARY KEY,  
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    release_date DATE,
    poster_path VARCHAR(255),
    average_rate DECIMAL(3,1) CHECK(average_rate >= 0.0 AND average_rate <= 10.0),
    nb_rate INT DEFAULT 0
);

-- Ajouter une contrainte d'unicité sur le titre des films
ALTER TABLE films ADD CONSTRAINT films_title_unique UNIQUE (title);

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS film_categories (
    film_id INT,
    category_id INT,
    PRIMARY KEY (film_id, category_id),
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,  
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash BYTEA NOT NULL  
);

CREATE TABLE IF NOT EXISTS ratings (
    user_id VARCHAR(255),
    film_id INT,
    rating INT CHECK(rating >= 1 AND rating <= 10),
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notice TEXT,
    PRIMARY KEY (user_id, film_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);
