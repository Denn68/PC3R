import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";
//import Itineraires from "./components/Itineraire/Itineraires";
//import Statistiques from "./components/Statistique/Statistiques";
import Team from "./components/Team/Team";
//import PointsInteret from "./components/PointsInterets/PointsInteret";

// Définir les types pour les props de PointsInteret
interface PointsInteretProps {
  ajouterPointInteret: boolean;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/itineraires" element={<Itineraires />} />
        <Route path="/statistiques" element={<Statistiques />} /> */}
        {/* <Route
          path="/points_interet"
          element={<PointsInteret ajouterPointInteret={false} />}
        /> */}
        {/* <Route
          path="/ajouter_points_interet"
          element={<PointsInteret ajouterPointInteret={true} />}
        /> */}
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
