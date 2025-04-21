import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface FilmDetail {
    id: number;
    title: string;
    release_date: string;
    poster: string;
    average_rate: number;
    categories: string[];
    overview: string;
}

const FilmDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [filmData, setFilmData] = useState<FilmDetail | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [hasRated, setHasRated] = useState(false);
    const [rating, setRating] = useState<number>(0);

    const fetchFilmData = () => {
        fetch(`http://localhost:8080/films/getById?film_id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Données récupérées :", data);
                setFilmData(data);
            })
            .catch((err) => console.error("Erreur lors de la récupération :", err));
    };

    useEffect(() => {
        if (!id) return;
        fetchFilmData();

        const username = localStorage.getItem("username");
        if (username) {
            setIsConnected(true);
            fetch(`http://localhost:8080/films/checkIfRated?film_id=${id}&username=${username}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data) {
                        setSelectedRating(data);
                        setHasRated(true);
                    }
                })
                .catch((err) => console.error("Erreur lors de la récupération :", err));
        }
    }, []);

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (!id || !username) return;

        fetch(`http://localhost:8080/films/getRating?film_id=${id}&username=${username}`)
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setRating(data);
                }
            })
            .catch((err) => console.error("Erreur lors de la récupération :", err));
    }, [hasRated]);

    const handleRatingSubmit = () => {
        const username = localStorage.getItem("username");
        if (!username || !id || selectedRating < 1 || selectedRating > 10) {
            setMessage("Merci de choisir une note entre 1 et 10.");
            return;
        }

        fetch(`http://localhost:8080/films/rate?film_id=${id}&username=${username}&rating=${selectedRating}`)
            .then((res) => {
                if (res.ok) {
                    setMessage("Merci pour votre note !");
                    setHasRated(true);
                    setRating(selectedRating);
                    fetchFilmData(); // <-- mise à jour de la moyenne
                } else {
                    setMessage("Une erreur est survenue.");
                }
            })
            .catch(() => {
                setMessage("Impossible d'envoyer la note.");
            });
    };

    if (!filmData) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="film-detail-container">
            <div className="poster">
                <img
                    src={"data:image/jpeg;base64," + filmData.poster}
                    alt={filmData.title}
                    className="poster-img"
                />
            </div>
            <div className="film-info">
                <h1 className="film-title">{filmData.title}</h1>
                <p className="film-date">
                    <strong>Date de sortie :</strong>{" "}
                    {new Date(filmData.release_date).toLocaleDateString("fr-FR")}
                </p>
                {filmData.categories && filmData.categories.length > 0 && (
                    <p className="film-genres">
                        <strong>Genres :</strong> {filmData.categories.join(", ")}
                    </p>
                )}
                <p className="film-average-rate">
                    <strong>Note moyenne :</strong>{" "}
                    <span
                        className={`note ${filmData.average_rate >= 8
                            ? "note-high"
                            : filmData.average_rate >= 5
                                ? "note-medium"
                                : "note-low"
                            }`}
                    >
                        {filmData.average_rate.toFixed(1)} / 10
                    </span>
                </p>
                <p className="film-overview">{filmData.overview}</p>

                {isConnected && (
                    !hasRated ? (
                        <div className="film-rating">
                            <strong>Notez ce film :</strong>
                            <div className="rating-buttons">
                                {[...Array(10)].map((_, i) => {
                                    const note = i + 1;
                                    return (
                                        <button
                                            key={note}
                                            className={`rating-button ${selectedRating >= note ? "selected" : ""}`}
                                            onClick={() => setSelectedRating(note)}
                                        >
                                            {note}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={handleRatingSubmit} className="submit-button">Envoyer</button>
                            {message && <p className="rating-message">{message}</p>}
                        </div>
                    ) : (
                        <div className="film-rating">
                            <strong>Vous avez noté ce film :</strong>
                            <p>{rating} / 10</p>
                            <p className="rating-message">Merci pour votre note !</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default FilmDetail;
