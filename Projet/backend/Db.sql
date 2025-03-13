CREATE TABLE films (
    film_id SERIAL PRIMARY KEY,  
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    release_date DATE,
    category TEXT,
    poster_path VARCHAR(255)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,  
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE ratings (
    user_id INT,
    film_id INT,
    rating INT CHECK(rating >= 1 AND rating <= 10),
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, film_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE
);
