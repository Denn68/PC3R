import requests
import psycopg2
from psycopg2 import Error
from datetime import datetime

# Ta clé API TMDb
api_key = "7b69381946b3a49fc73a1da79e332a9f"

# Informations de connexion à ta base de données PostgreSQL
db_config = {
    'host': 'dpg-d0bt4imuk2gs7384e86g-a.frankfurt-postgres.render.com',
    'user': 'filmdb_1s5v_user',
    'password': 'MI2FmSsc1zWuyfGEmJEmf8fE69S3tNpp',
    'database': 'filmdb_1s5v'
}

def get_latest_release_date():
    connection = None
    latest_date = None
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("SELECT MAX(release_date) FROM films;")
        result = cursor.fetchone()
        if result and result[0]:
            latest_date = result[0]
        cursor.close()
    except Exception as e:
        print(f"Erreur en récupérant la dernière date de sortie : {e}")
    finally:
        if connection:
            connection.close()
    return latest_date


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
def get_all_popular_movies(api_key, last_release_date=None):
    all_movies = []
    page = 1
    today = datetime.today().date()

    while True:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&page={page}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            results = data['results']

            # Filtrer pour ne garder que les films déjà sortis
            released_movies = [
                movie for movie in results
                if movie.get('release_date') and datetime.strptime(movie['release_date'], '%Y-%m-%d').date() <= today
            ]

            # Filtrer ceux dont la date est > last_release_date si défini
            if last_release_date:
                released_movies = [
                    movie for movie in released_movies
                    if datetime.strptime(movie['release_date'], '%Y-%m-%d').date() > last_release_date
                ]

                # Si aucun film plus récent, on arrête la pagination
                if not released_movies:
                    break

            all_movies.extend(released_movies)

            if page >= data.get('total_pages', 1):
                break

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
        #print("Insertion film\n")
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

        #print("Insertion avec catégorie.\n")

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
        #print(f"Film '{movie['title']}' inséré dans la base de données.\n")

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

last_date = get_latest_release_date()
print(f"Dernière date de sortie enregistrée : {last_date}")

movies = get_all_popular_movies(api_key, last_release_date=last_date)

print(f"Nombre total de nouveaux films récupérés : {len(movies)}")

for movie in movies:
    insert_movie_to_db(movie)

