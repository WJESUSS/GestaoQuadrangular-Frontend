import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Users, BarChart3 } from "lucide-react";

const IEQ = {
    red: "#C8102E",
    yellow: "#FDB813",
    blue: "#003DA5",
    dark: "#0A0608",
};

export default function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>IEQ Gestão - Sistema para Igrejas em Células</title>

                <meta
                    name="description"
                    content="Sistema completo para gestão de igrejas em células. Controle membros, discipulado, relatórios e financeiro com eficiência."
                />

                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="IEQ Gestão" />
                <meta property="og:description" content="Gestão completa de igrejas" />
                <meta property="og:type" content="website" />
            </Helmet>

            <div style={{ fontFamily: "Arial, sans-serif" }}>

                {/* HERO */}
                <section style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    background: IEQ.dark,
                    color: "#fff",
                    textAlign: "center",
                    padding: "40px"
                }}>
                    <h1 style={{
                        fontSize: "48px",
                        marginBottom: "20px",
                        background: `linear-gradient(90deg, ${IEQ.red}, ${IEQ.yellow}, ${IEQ.blue})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        IEQ Gestão
                    </h1>

                    <p style={{ maxWidth: 600, opacity: 0.8 }}>
                        Sistema completo para gerenciamento de igrejas em células.
                        Controle membros, discipulado, relatórios e muito mais.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            marginTop: 30,
                            padding: "15px 30px",
                            border: "none",
                            borderRadius: 6,
                            background: IEQ.red,
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10
                        }}
                    >
                        Acessar Sistema <ArrowRight size={18} />
                    </button>
                </section>

                {/* FEATURES */}
                <section style={{
                    padding: "80px 20px",
                    textAlign: "center"
                }}>
                    <h2>Funcionalidades</h2>

                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 30,
                        marginTop: 40
                    }}>

                        <Card icon={<Users />} title="Gestão de Membros" desc="Controle completo dos membros da igreja." />
                        <Card icon={<BarChart3 />} title="Relatórios" desc="Acompanhe crescimento e desempenho." />
                        <Card icon={<ShieldCheck />} title="Segurança" desc="Sistema protegido e confiável." />

                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    padding: "60px",
                    background: IEQ.red,
                    color: "#fff",
                    textAlign: "center"
                }}>
                    <h2>Pronto para transformar sua gestão?</h2>

                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            marginTop: 20,
                            padding: "15px 30px",
                            border: "none",
                            borderRadius: 6,
                            background: "#fff",
                            color: IEQ.red,
                            cursor: "pointer"
                        }}
                    >
                        Entrar no Sistema
                    </button>
                </section>

                {/* FOOTER */}
                <footer style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 12,
                    background: "#111",
                    color: "#aaa"
                }}>
                    © {new Date().getFullYear()} IEQ Gestão • Sistema Eclesiástico
                </footer>
            </div>
        </>
    );
}

function Card({ icon, title, desc }) {
    return (
        <div style={{
            width: 250,
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
            <div style={{ marginBottom: 10 }}>{icon}</div>
            <h3>{title}</h3>
            <p style={{ fontSize: 14, opacity: 0.7 }}>{desc}</p>
        </div>
    );
}