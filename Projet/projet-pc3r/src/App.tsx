import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";
import Team from "./components/Team/Team";
import Categories from "./components/Categories";
import Alphabetic from "./components/Alphabetic";
import MovieDetail from "./components/FilmDetail";
import LoginPage from "./components/LoginPage";
import LogoutPage from "./components/LogoutPage";
import { AuthProvider } from "./components/context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/alphabetic" element={<Alphabetic />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/film/:id" element={<FilmDetail />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
