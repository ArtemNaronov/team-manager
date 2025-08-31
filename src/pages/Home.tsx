import TeamWorks from "../components/TeamWorks";
import "../styles/global.scss";

export default function Home() {
  return (
    <div className="app-container">
      <header className="glass">
        <div className="header-content">
          <h1>Team Manager</h1>
          <p className="header-subtitle">Управление проектами и задачами</p>
        </div>
      </header>

      <main className="content-wrapper">
        <TeamWorks />
      </main>
    </div>
  );
}
