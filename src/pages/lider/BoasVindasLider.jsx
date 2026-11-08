import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { AURA } from "./liderTheme";
import VersiculoAleatorio from "../../components/VersiculoAleatorio.jsx";

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function BoasVindasLider({ usuarioLogado, celula, isDark, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={onClose}
                style={{
                    position:"fixed", inset:0,
                    background:"rgba(0,0,0,.78)",
                    backdropFilter:"blur(8px)", zIndex:50, overflowY:"auto",
                }}
            >
                <div style={{ minHeight:"100%", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px" }}>
                    {/* ── Card principal ── */}
                    <motion.div
                        initial={{ opacity:0, scale:.9, y:40 }}
                        animate={{ opacity:1, scale:1, y:0 }}
                        exit={{ opacity:0, scale:.9, y:40 }}
                        transition={{ type:"spring", damping:25, stiffness:300 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background:"var(--dl-bg-el)", borderRadius:0,
                            border:"2px solid var(--dl-card-border)",
                            padding:"40px 32px 32px",
                            maxWidth:540, width:"100%",
                            boxShadow:"14px 14px 0 var(--dl-shadow-color)",
                            position:"relative",
                        }}
                    >
                        {/* Faixa quadrangular */}
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:6,
                            background:"linear-gradient(90deg,#FF7A00 0 25%,#FFD400 25% 50%,#1E4FD8 50% 75%,#C2187A 75% 100%)" }} />

                        {/* Botão fechar */}
                        <button onClick={onClose} style={{
                            position:"absolute", top:16, right:16,
                            background:"none", border:"2px solid var(--dl-border)", borderRadius:0, cursor:"pointer",
                            color:"var(--dl-text)", padding:6, display:"flex",
                            transition:"all .2s",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background="#FFD400"; e.currentTarget.style.borderColor="#FFD400"; e.currentTarget.style.color="#2A0306"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="var(--dl-border)"; e.currentTarget.style.color="var(--dl-text)"; }}>
                            <X size={18} />
                        </button>

                        {/* ── Cabeçalho ── */}
                        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                                    style={{ textAlign:"center", marginBottom:30 }}>
                            <motion.div animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:"linear" }}
                                        style={{ display:"inline-block", marginBottom:14 }}>
                                <Sparkles size={34} style={{ color:"var(--dl-accent)", filter:"drop-shadow(0 0 10px rgba(255,212,0,.45))" }} />
                            </motion.div>
                            <h1 style={{
                                fontFamily:"'Anton','Inter',sans-serif", fontSize:"clamp(24px,5vw,32px)",
                                fontWeight:400, letterSpacing:".04em", textTransform:"uppercase",
                                color:"var(--dl-text)", textShadow:"3px 3px 0 var(--dl-title-shadow)",
                                margin:"0 0 10px",
                            }}>Bem-vindo, líder!</h1>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:17, fontWeight:700, color:"var(--dl-accent)", margin:0 }}>
                                {usuarioLogado?.nome || "Líder"}
                            </p>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color:"var(--dl-text-sec)", margin:"8px 0 0" }}>
                                Célula {celula?.nome || "---"}
                            </p>
                        </motion.div>

                        <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--dl-accent),transparent)", margin:"0 0 26px" }} />

                        {/* ── Texto bíblico ── */}
                        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
                                    style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
                            <VersiculoAleatorio isDark={isDark} accent={AURA.yellow} />
                        </motion.div>

                        {/* ── Botão fechar (rodapé) ── */}
                        <button onClick={onClose} style={{
                            width:"100%", marginTop:24,
                            fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:800,
                            letterSpacing:".16em", textTransform:"uppercase",
                            background:"#FFD400", color:"#2A0306",
                            border:"2px solid #FFD400", borderRadius:0, padding:"15px 20px",
                            cursor:"pointer", transition:"all .2s",
                            boxShadow:"6px 6px 0 var(--dl-shadow-color)",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.transform="translate(-2px,-2px)"; e.currentTarget.style.boxShadow="8px 8px 0 var(--dl-shadow-color)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform="translate(0,0)"; e.currentTarget.style.boxShadow="6px 6px 0 var(--dl-shadow-color)"; }}>
                            Entendido! Vamos começar
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
