import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <main>
        <Outlet /> {/* Здесь будут вставляться страницы */}
      </main>
      <footer>Подвал сайта</footer>
    </>
  );
}
