import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function TesourariaDizimistas() {
  const [fieis, setFieis] = useState([]);
  const [infieis, setInfieis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get("/tesouraria/fieis-infieis-mes");
        setFieis(res.data.fieis || []);
        setInfieis(res.data.infieis || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Dízimistas do Mês</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-4">Fiéis</h3>
          {fieis.length === 0 ? (
            <p>Nenhum pagamento registrado neste mês.</p>
          ) : (
            <ul className="list-disc list-inside">
              {fieis.map(m => <li key={m.id}>{m.nome}</li>)}
            </ul>
          )}
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-4">Infieis</h3>
          {infieis.length === 0 ? (
            <p>Todos pagaram este mês!</p>
          ) : (
            <ul className="list-disc list-inside">
              {infieis.map(m => <li key={m.id}>{m.nome}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
