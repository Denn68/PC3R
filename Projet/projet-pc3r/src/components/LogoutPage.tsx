import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const LogoutPage: React.FC = () => {
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();
    const { logout } = useAuth(); // 👈 accès à la fonction logout du contexte

    const handleLogout = () => {
        logout(); // 👈 met à jour le contexte + supprime localStorage
        navigate("/");
    };

    const handleDelete = () => {

        if (password === "") {
            alert("Veuillez entrer votre mot de passe !");
            return;
        }

        const username = localStorage.getItem("username");
        if (username) {
            fetch(`https://pc3r.onrender.com/users/delete?username=${username}&password=${password}`)
                .then((res) => res.json())
                .then(() => {
                    alert("Compte supprimé avec succès !");
                    logout(); // 👈 met à jour le contexte + supprime localStorage
                    navigate("/");
                })
                .catch((err) => console.error("Erreur lors de la suppression :", err));
        }
    };

    return (
        <div className="logout-page">
            <h2>Se déconnecter</h2>
            <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
            </button>

            <h2>Supprimer</h2>
            <label className="login-label" htmlFor="password">
                Mot de passe
            </label>
            <input
                id="password"
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button className="delete-btn" onClick={handleDelete}>
                Supprimer
            </button>
        </div>
    );
};

export default LogoutPage;
