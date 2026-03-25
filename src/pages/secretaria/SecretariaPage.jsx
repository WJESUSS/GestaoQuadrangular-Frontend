import { useState } from "react";

import Membros from "./Membros";
import Celulas from "./Celulas";
import Visitantes from "./Visitante";
import FichasEncontro from "./FichasEncontro";
import SecretariaCelulas from "./SecretariaCelulas";


export default function SecretariaPage() {
  const [moduloAtivo, setModuloAtivo] = useState("MEMBROS");

  const renderConteudo = () => {
    switch (moduloAtivo) {
      case "MEMBROS":
        return <Membros />;
      case "VISITANTES":
        return <Visitantes />;
      case "CELULAS":
        return <Celulas />;
      case "FICHAS":
        return <FichasEncontro />;
     case "SECRETARIACELULAS":
         return <SecretariaCelulas />;

      default:
        return null;
    }
  };

  const tituloModulo = {
    MEMBROS: "Gestão de Membros",
    VISITANTES: "Gestão de Visitantes",
    CELULAS: "Gestão de Células",
    FICHAS: "Fichas de Encontro com Deus",
    SECRETARIACELULAS: "Gestão de Células (Secretaria)",
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      <aside className="w-72 bg-white border-r shadow-lg p-6 flex flex-col shrink-0">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-8 tracking-tighter italic text-center">
          SECRETARIA
        </h1>

        <nav className="space-y-3">
          <button
            onClick={() => setModuloAtivo("MEMBROS")}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
              moduloAtivo === "MEMBROS"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            👥 Membros
          </button>

          <button
            onClick={() => setModuloAtivo("VISITANTES")}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
              moduloAtivo === "VISITANTES"
                ? "bg-purple-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🧾 Visitantes
          </button>

          <button
            onClick={() => setModuloAtivo("CELULAS")}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
              moduloAtivo === "CELULAS"
                ? "bg-green-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🏠 Células
          </button>

          <button
            onClick={() => setModuloAtivo("FICHAS")}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
              moduloAtivo === "FICHAS"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            📄 Fichas de Encontro
          </button>

          <button
            onClick={() => setModuloAtivo("SECRETARIACELULAS")}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition ${
              moduloAtivo === "SECRETARIACELULAS"
                ? "bg-teal-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🏢 Secretaria Células
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase italic">
            {tituloModulo[moduloAtivo]}
          </h2>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          {renderConteudo()}
        </div>
      </main>
    </div>
  );
}
