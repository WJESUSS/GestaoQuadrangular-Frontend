import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * Página pública — /cadastro
 * O pastor informa nome, e-mail, senha, nome da igreja
 * e o NÚMERO DA REGIÃO. Ao enviar, o sistema cria a conta
 * como pendente e notifica o superintendente da região.
 */
export default function CadastroIgreja() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nomePastor:   "",
        email:        "",
        senha:        "",
        nomeIgreja:   "",
        numeroRegiao: "",
    });

    const [erro,    setErro]    = useState("");
    const [sucesso, setSucesso] = useState(null); // objeto da resposta
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErro("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");

        if (form.senha.length < 8) {
            setErro("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (!form.numeroRegiao || isNaN(Number(form.numeroRegiao))) {
            setErro("Informe um número de região válido.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/registrar-igreja", {
                ...form,
                numeroRegiao: Number(form.numeroRegiao),
            });

            // Sem token — exibe tela de "aguardando aprovação"
            setSucesso(data);

        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "Erro ao criar conta. Verifique os dados e tente novamente.";
            setErro(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    }

    // ── Tela de sucesso ────────────────────────────────────────────────────────
    if (sucesso) {
        return (
            <div style={s.pagina}>
                <div style={s.card}>
                    <div style={s.checkCircle}>✓</div>
                    <h2 style={s.titulo}>Cadastro enviado!</h2>
                    <p style={s.textoSucesso}>{sucesso.mensagem}</p>

                    <div style={s.infoBox}>
                        <div style={s.infoLinha}>
                            <span style={s.infoLabel}>Igreja</span>
                            <span style={s.infoValor}>{sucesso.nomeIgreja}</span>
                        </div>
                        <div style={s.infoLinha}>
                            <span style={s.infoLabel}>Região</span>
                            <span style={s.infoValor}>
                {sucesso.numeroRegiao} — {sucesso.nomeRegiao}
              </span>
                        </div>
                        <div style={s.infoLinha}>
                            <span style={s.infoLabel}>E-mail</span>
                            <span style={s.infoValor}>{sucesso.email}</span>
                        </div>
                    </div>

                    <p style={s.rodapeInfo}>
                        Você receberá uma notificação assim que o
                        superintendente aprovar seu cadastro.
                    </p>

                    <button style={s.botaoSecundario} onClick={() => navigate("/login")}>
                        Ir para o login
                    </button>
                </div>
            </div>
        );
    }

    // ── Formulário ─────────────────────────────────────────────────────────────
    return (
        <div style={s.pagina}>
            <div style={s.card}>

                <div style={s.logo}>
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                        <rect x="38" y="4"  width="24" height="92" rx="3" fill="#C8102E" />
                        <rect x="4"  y="38" width="92" height="24" rx="3" fill="#003DA5" />
                        <rect x="38" y="38" width="24" height="24" rx="2" fill="#FDB813" />
                    </svg>
                </div>

                <h1 style={s.titulo}>Criar conta</h1>
                <p style={s.subtitulo}>O superintendente da sua região aprovará o acesso</p>

                <form onSubmit={handleSubmit} style={s.form}>

                    <label style={s.label}>Número da região</label>
                    <input
                        name="numeroRegiao"
                        type="number"
                        min="1"
                        value={form.numeroRegiao}
                        onChange={handleChange}
                        placeholder="Ex: 12"
                        required
                        style={s.input}
                    />
                    <p style={s.hint}>O número oficial da sua região na denominação</p>

                    <label style={s.label}>Nome da sua igreja</label>
                    <input
                        name="nomeIgreja"
                        value={form.nomeIgreja}
                        onChange={handleChange}
                        placeholder="Ex: IEQ Vila Nova"
                        required
                        style={s.input}
                    />

                    <label style={s.label}>Seu nome (pastor)</label>
                    <input
                        name="nomePastor"
                        value={form.nomePastor}
                        onChange={handleChange}
                        placeholder="Ex: João Silva"
                        required
                        style={s.input}
                    />

                    <label style={s.label}>E-mail</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="joao@suaigreja.com.br"
                        required
                        style={s.input}
                    />

                    <label style={s.label}>Senha (mín. 8 caracteres)</label>
                    <input
                        name="senha"
                        type="password"
                        value={form.senha}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        style={s.input}
                    />

                    {erro && <p style={s.erro}>{erro}</p>}

                    <button type="submit" disabled={loading} style={s.botao}>
                        {loading ? "Enviando..." : "Solicitar cadastro →"}
                    </button>

                </form>

                <p style={s.rodape}>
                    Já tem conta?{" "}
                    <span style={s.link} onClick={() => navigate("/login")}>
            Fazer login
          </span>
                </p>

            </div>
        </div>
    );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = {
    pagina: {
        minHeight: "100vh",
        background: "#0A0608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
    },
    card: {
        background: "#13100F",
        border: "1px solid rgba(200,16,46,.2)",
        borderRadius: 16,
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    checkCircle: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "rgba(29,158,117,.15)",
        border: "1px solid rgba(29,158,117,.4)",
        color: "#1D9E75",
        fontSize: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1rem",
    },
    logo:      { marginBottom: "1.25rem" },
    titulo:    { color: "#fff", fontSize: 22, fontWeight: 500, margin: "0 0 4px", textAlign: "center" },
    subtitulo: { color: "rgba(255,255,255,.45)", fontSize: 13, margin: "0 0 1.5rem", textAlign: "center" },
    form:      { width: "100%", display: "flex", flexDirection: "column" },
    label:     { color: "rgba(255,255,255,.6)", fontSize: 12, marginBottom: 4, marginTop: 14 },
    hint:      { color: "rgba(255,255,255,.3)", fontSize: 11, margin: "4px 0 0" },
    input: {
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 8,
        color: "#fff",
        fontSize: 14,
        padding: "10px 14px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
    },
    erro: { color: "#ff6b6b", fontSize: 13, marginTop: 10, textAlign: "center" },
    botao: {
        marginTop: 24,
        background: "#C8102E",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "12px",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        width: "100%",
    },
    botaoSecundario: {
        marginTop: 20,
        background: "transparent",
        color: "rgba(255,255,255,.6)",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: 8,
        padding: "10px",
        fontSize: 14,
        cursor: "pointer",
        width: "100%",
    },
    rodape:      { color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: "1.5rem" },
    link:        { color: "#C8102E", cursor: "pointer", textDecoration: "underline" },
    textoSucesso:{ color: "rgba(255,255,255,.7)", fontSize: 14, textAlign: "center", margin: "0 0 1.5rem", lineHeight: 1.6 },
    infoBox: {
        width: "100%",
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 16,
    },
    infoLinha:  { display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.06)" },
    infoLabel:  { color: "rgba(255,255,255,.4)", fontSize: 12 },
    infoValor:  { color: "#fff", fontSize: 12, fontWeight: 500 },
    rodapeInfo: { color: "rgba(255,255,255,.35)", fontSize: 12, textAlign: "center", lineHeight: 1.6, margin: "0 0 1rem" },
};