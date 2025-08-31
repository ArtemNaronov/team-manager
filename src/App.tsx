import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import "./App.css";
import "./styles/global.scss";

function App() {
  // Получаем базовый путь для GitHub Pages
  // В development режиме basename должен быть пустым
  const basename = import.meta.env.MODE === "production" ? "/team-manager" : "";

  return (
    <Router basename={basename}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
