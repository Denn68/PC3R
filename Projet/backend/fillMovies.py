import requests
import psycopg2
from psycopg2 import Error

# Ta clé API TMDb
api_key = "7b69381946b3a49fc73a1da79e332a9f"

# Informations de connexion à ta base de données PostgreSQL
db_config = {
    'host': 'localhost',  # Adresse de ton serveur PostgreSQL
    'user': 'postgres',   # Utilisateur PostgreSQL
    'password': 'pc3rfilms',  # Ton mot de passe PostgreSQL
    'database': 'filmdb'  # Le nom de ta base de données
}

# Fonction pour récupérer les catégories de films
def get_all_categories(api_key):
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data['genres']
    else:
        print(f"Erreur: {response.status_code}")
        return []

# Fonction pour récupérer les films populaires
def get_all_popular_movies(api_key):
    all_movies = []
    page = 1
    while True:
        # URL de la requête pour les films populaires
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&page={page}"
        
        # Faire la requête HTTP
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            all_movies.extend(data['results'])  # Ajouter les films de cette page à la liste
            print(f"Page {page} : {len(data['results'])} films récupérés.")
            page += 1
        else:
            print(f"Erreur: {response.status_code}")
            break
            
    return all_movies

# Fonction pour insérer les catégories dans la base de données
def insert_categories_to_db(categories):
    connection = None
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        for category in categories:
            # Vérifie si la catégorie existe déjà
            check_query = "SELECT 1 FROM categories WHERE id = %s;"
            cursor.execute(check_query, (category['id'],))
            exists = cursor.fetchone()

            if exists:
                print(f"Catégorie '{category['name']}' déjà présente. Insertion ignorée.")
                continue

            # Insertion si elle n'existe pas
            insert_query = "INSERT INTO categories (id, name) VALUES (%s, %s);"
            cursor.execute(insert_query, (category['id'], category['name']))
            print(f"Catégorie '{category['name']}' insérée.")

        connection.commit()
        print("Catégories insérées dans la base de données.\n")

    except Exception as e:
        print(f"Erreur lors de l'insertion dans la base de données : {e}")

    finally:
        if connection:
            cursor.close()
            connection.close()


# Fonction pour insérer un film dans la base de données
def insert_movie_to_db(movie):
    connection = None
    try:
        print("Insertion film\n")
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Vérifier si le film existe déjà dans la base de données (par titre)
        check_query = "SELECT id FROM films WHERE title = %s;"
        cursor.execute(check_query, (movie['title'],))
        existing = cursor.fetchone()

        if existing:
            print(f"Le film '{movie['title']}' existe déjà dans la base. Insertion annulée.\n")
            return  # Le film existe déjà, on ne fait rien

        # Insertion du film
        insert_movie_query = """
            INSERT INTO films (title, overview, release_date, poster_path, average_rate, nb_rate)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        movie_data = (
            movie['title'], 
            movie['overview'], 
            movie['release_date'], 
            movie['poster_path'],
            0,
            0
        )
        cursor.execute(insert_movie_query, movie_data)
        movie_id = cursor.fetchone()[0]
        connection.commit()

        print("Insertion avec catégorie.\n")

        # Lier aux catégories existantes
        genre_ids = movie.get('genre_ids', [])
        for genre_id in genre_ids:
            insert_category_query = """
                INSERT INTO film_categories (film_id, category_id)
                SELECT %s, %s
                WHERE EXISTS (SELECT 1 FROM categories WHERE id = %s);
            """
            cursor.execute(insert_category_query, (movie_id, genre_id, genre_id))

        connection.commit()
        print(f"Film '{movie['title']}' inséré dans la base de données.\n")

    except Exception as e:
        print(f"Erreur lors de l'insertion dans la base de données : {e}")

    finally:
        if connection:
            cursor.close()
            connection.close()

            
# Récupérer toutes les catégories de films
categories = get_all_categories(api_key)
# Afficher les catégories récupérées et les insérer dans la base de données
for category in categories:
    print(f"Category ID: {category['id']}, Name: {category['name']}")
    # Insérer la catégorie dans la base de données
    insert_categories_to_db([category])

# Récupérer tous les films populaires
movies = get_all_popular_movies(api_key)

# Afficher les titres des films récupérés et les insérer dans la base de données
for movie in movies:
    print(f"Title: {movie['title']}")
    print(f"Overview: {movie['overview']}")
    print(f"Release Date: {movie['release_date']}")
    print('-' * 50)
    print(f"Vote : {movie.get('vote_average', 0)}")

    # Insérer le film dans la base de données
    insert_movie_to_db(movie)
