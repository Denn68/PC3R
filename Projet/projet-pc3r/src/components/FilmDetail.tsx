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

    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:8080/films/getById?film_id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Données récupérées :", data);
                setFilmData(data);
            })
            .catch((err) => console.error("Erreur lors de la récupération :", err));
    }, [id]);

    if (!filmData) {
        return <div>Loading...</div>;
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
                <p className="film-overview">{filmData.overview}</p>
            </div>
        </div>
    );
};

export default FilmDetail;
