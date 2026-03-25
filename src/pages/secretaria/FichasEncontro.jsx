import { useEffect, useState } from "react";
import api from "../../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function FichasEncontro() {

  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fichaSelecionada, setFichaSelecionada] = useState(null);

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });

  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ===============================
  // CARREGAR FICHAS
  // ===============================
  const carregarFichas = async () => {
    try {
      setLoading(true);
      setFichaSelecionada(null);

      if (dataInicio && dataFim && dataFim < dataInicio) {
        alert("A data fim não pode ser menor que a data início");
        setLoading(false);
        return;
      }

      const params = { inicio: dataInicio, fim: dataFim };

      const res = await api.get("/relatorios/encontro/periodo", { params });

      setFichas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar fichas", err);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFichas();
  }, []);

  // ===============================
  // PDF RELATÓRIO TABELA BONITO
  // ===============================
  const gerarPDFCompleto = () => {

    const doc = new jsPDF("p", "mm", "a4");

    // HEADER
    doc.setFillColor(5,150,105);
    doc.rect(0,0,210,30,"F");

    doc.setTextColor(255,255,255);
    doc.setFontSize(18);
    doc.text("RELATÓRIO DE ENCONTRISTAS", 14,18);

    doc.setFontSize(10);
    doc.text(
      `${new Date(dataInicio).toLocaleDateString("pt-BR")} até ${new Date(dataFim).toLocaleDateString("pt-BR")}`,
      14,
      25
    );

    // INFO
    doc.setTextColor(60);
    doc.setFontSize(11);
    doc.text(`Total de registros: ${fichas.length}`, 14, 40);

    const dadosTabela = fichas.map((f) => [
      f.nomeConvidado || f.nome || "N/A",
      f.telefone || "N/A",
      f.liderResponsavel || f.nomeLiderCelula || "N/A",
      f.dataInicio
        ? new Date(f.dataInicio).toLocaleDateString("pt-BR")
        : "S/D",
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Nome", "Telefone", "Líder", "Data"]],
      body: dadosTabela,
      headStyles: {
        fillColor: [5,150,105],
        textColor: [255,255,255]
      },
      alternateRowStyles: {
        fillColor: [240,253,244]
      }
    });

    doc.save(`Relatorio_Encontristas_${dataInicio}.pdf`);
  };

  // ===============================
  // PDF FICHA INDIVIDUAL BONITA
  // ===============================
  const gerarPDFFichaIndividual = () => {

    const doc = new jsPDF("p","mm","a4");

    const verde = [5,150,105];
    const cinza = [55,65,81];
    const fundoBloco = [240,253,244];

    fichas.forEach((f,index)=>{

      if(index>0) doc.addPage();

      // HEADER
      doc.setFillColor(...verde);
      doc.rect(0,0,210,30,"F");

      doc.setTextColor(255,255,255);
      doc.setFontSize(16);
      doc.text("FICHA DO ENCONTRISTA",14,18);

      doc.setFontSize(10);
      doc.text(
        `${f.tipoEncontro || "ENCONTRO"} - ${f.nomeEncontro || ""}`,
        14,
        25
      );

      // NOME
      doc.setTextColor(...cinza);
      doc.setFontSize(14);
      doc.text(f.nomeConvidado || f.nome || "Sem nome",14,45);

      let y = 55;

      const bloco = (titulo, campos) => {

        doc.setFillColor(...fundoBloco);
        doc.roundedRect(14, y-6, 182, 8, 2,2,"F");

        doc.setTextColor(...verde);
        doc.setFontSize(11);
        doc.text(titulo,16,y);

        y+=8;

        doc.setTextColor(...cinza);
        doc.setFontSize(10);

        campos.forEach(([l,v])=>{
          doc.text(`${l}: ${v || "N/A"}`,16,y);
          y+=6;
        });

        y+=6;
      };

      bloco("DADOS PESSOAIS",[
        ["RG",f.rg],
        ["Sexo",f.sexo],
        ["Estado Civil",f.estadoCivil],
        ["Nascimento",
          f.dataNascimento
          ? `${new Date(f.dataNascimento).toLocaleDateString("pt-BR")} (${calcularIdade(f.dataNascimento)} anos)`
          : "N/A"
        ],
        ["Cidade/Estado",`${f.cidade || ""} - ${f.estado || ""}`]
      ]);

      bloco("CONTATOS",[
        ["Telefone",f.telefone],
        ["Contato Emergência",f.nomeFamiliarContato],
        ["Tel Emergência",f.telefoneFamiliarContato]
      ]);

      bloco("SAÚDE",[
        ["Peso",f.peso ? `${f.peso} kg` : ""],
        ["Altura",f.altura ? `${f.altura} m` : ""],
        ["Medicamento",f.tomaMedicamento ? f.qualMedicamento : "Não utiliza"]
      ]);

      bloco("INFORMAÇÕES ECLESIÁSTICAS",[
        ["Líder",f.liderResponsavel || f.nomeLiderCelula],
        ["Convidador",f.nomeConvidador],
        ["Data Encontro",
          f.dataInicio
          ? new Date(f.dataInicio).toLocaleDateString("pt-BR")
          : "N/A"
        ]
      ]);

      // RODAPÉ
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        290
      );

    });

    doc.save(`Fichas_Encontristas_${dataInicio}.pdf`);
  };

  // ===============================
  // UTIL
  // ===============================
  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return "?";

    const hoje = new Date();
    const nasc = new Date(dataNasc);

    let idade = hoje.getFullYear() - nasc.getFullYear();

    if (
      hoje.getMonth() < nasc.getMonth() ||
      (hoje.getMonth() === nasc.getMonth() &&
        hoje.getDate() < nasc.getDate())
    ) {
      idade--;
    }

    return idade;
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="p-20 text-center font-black text-emerald-600 animate-pulse">
        CARREGANDO DADOS...
      </div>
    );
  }

  // ===============================
  // JSX
  // ===============================
  return (
    <div className="space-y-6 p-4">

      <div className="flex justify-between items-center">

        <h3 className="text-xl font-black text-gray-800 uppercase italic">
          📄 Gestão de Encontristas
        </h3>

        <div className="flex gap-2">

          <button
            onClick={gerarPDFCompleto}
            disabled={fichas.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs"
          >
            PDF Relatório
          </button>

          <button
            onClick={gerarPDFFichaIndividual}
            disabled={fichas.length === 0}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs"
          >
            PDF Fichas
          </button>

          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            {fichas.length} Encontristas
          </span>

        </div>
      </div>

      {/* FILTRO */}
      <div className="flex gap-3 flex-wrap">

        <input
          type="date"
          value={dataInicio}
          onChange={(e)=>setDataInicio(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={dataFim}
          onChange={(e)=>setDataFim(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={carregarFichas}
          className="bg-emerald-600 text-white px-6 py-2 rounded"
        >
          Filtrar
        </button>

      </div>

      {/* LISTA */}
      {fichas.length === 0 ? (
        <div className="text-center text-gray-400 font-bold py-20">
          Nenhuma ficha encontrada.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {fichas.map((f)=>(
            <div
              key={f.id}
              onClick={()=>setFichaSelecionada(f)}
              className="border rounded-xl p-4 cursor-pointer hover:shadow"
            >
              <p className="font-bold">
                {f.nomeConvidado || f.nome}
              </p>

              <p className="text-sm text-gray-500">
                {f.telefone}
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
