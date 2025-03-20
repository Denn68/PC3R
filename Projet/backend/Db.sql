CREATE TABLE IF NOT EXISTS films (
    id SERIAL PRIMARY KEY,  
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    release_date DATE,
    poster_path VARCHAR(255),
    average_rate DECIMAL(3,1) CHECK(average_rate >= 1.0 AND average_rate <= 10.0),
    nb_rate INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS film_categories (
    film_id INT,
    category_id INT,
    PRIMARY KEY (film_id, category_id),
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
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
    PRIMARY KEY (user_id, film_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE
);
