import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === "" || password === "") {
            alert("Veuillez entrer un nom d'utilisateur et un mot de passe !");
            return;
        }

        fetch(`http://localhost:8080/users/getAccount?username=${username}&password=${password}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data) {
                    alert("Nom d'utilisateur ou mot de passe incorrect !");
                    return;
                } else {
                    alert("Connexion réussie !");
                    localStorage.setItem("id", data);
                    login(username); // 👈 mise à jour du contexte
                    navigate("/");
                }
            })
            .catch((err) => console.error("Erreur lors de la récupération :", err));
    };

    const goToRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (username === "" || password === "") {
            alert("Veuillez entrer un nom d'utilisateur et un mot de passe !");
            return;
        }

        try {
            const resCheck = await fetch(`http://localhost:8080/users/checkUsername?username=${username}`);
            const dataCheck = await resCheck.json();

            if (dataCheck === "Username déjà pris") {
                alert("Ce nom d'utilisateur existe déjà !");
                return;
            }

            const resCreate = await fetch(`http://localhost:8080/users/create?username=${username}&password=${password}`);
            const dataCreate = await resCreate.json();

            if (dataCreate) {
                alert("Inscription réussie !");
                localStorage.setItem("id", dataCreate);
                login(username); // 👈 mise à jour du contexte
                navigate("/");
            }
        } catch (err) {
            console.error("Erreur lors de l'inscription :", err);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form">
                <h2 className="login-title">Connexion</h2>

                <label className="login-label" htmlFor="username">
                    Nom d'utilisateur
                </label>
                <input
                    id="username"
                    type="text"
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

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

                <button type="submit" className="login-button" onClick={handleLogin}>
                    Se connecter
                </button>

                <button type="button" className="login-button" onClick={goToRegister}>
                    S'inscrire
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
