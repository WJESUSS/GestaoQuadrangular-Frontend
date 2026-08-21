import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { AURA, theme } from "./liderTheme";

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function BoasVindasLider({ usuarioLogado, celula, isDark, onClose }) {
    const t = theme(isDark);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={onClose}
                style={{
                    position:"fixed", inset:0,
                    background: isDark?"rgba(10,6,8,.92)":"rgba(0,0,0,.78)",
                    backdropFilter:"blur(24px)", zIndex:50, overflowY:"auto",
                }}
            >
                <div style={{ minHeight:"100%", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px" }}>
                    {/* ── Card principal ── */}
                    <motion.div
                        initial={{ opacity:0, scale:.88, y:40 }}
                        animate={{ opacity:1, scale:1, y:0 }}
                        exit={{ opacity:0, scale:.88, y:40 }}
                        transition={{ type:"spring", damping:25, stiffness:300 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: t.bgEl, borderRadius:24,
                            border:`1px solid ${t.border}`,
                            padding:"40px 32px",
                            maxWidth:540, width:"100%",
                            boxShadow:`0 24px 64px rgba(0,0,0,${isDark?.4:.18})`,
                            position:"relative",
                        }}
                    >
                        {/* Faixa topo */}
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"24px 24px 0 0",
                            background:`linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})` }} />

                        {/* Botão fechar */}
                        <button onClick={onClose} style={{
                            position:"absolute", top:16, right:16,
                            background:"none", border:"none", cursor:"pointer",
                            color:t.textMuted, padding:8, borderRadius:8, display:"flex",
                            transition:"all .2s",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background=isDark?"rgba(255,255,255,.08)":"rgba(200,16,46,.08)"; e.currentTarget.style.color=AURA.red; }}
                                onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=t.textMuted; }}>
                            <X size={20} />
                        </button>

                        {/* ── Cabeçalho ── */}
                        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                                    style={{ textAlign:"center", marginBottom:32 }}>
                            <motion.div animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:"linear" }}
                                        style={{ display:"inline-block", marginBottom:14 }}>
                                <Sparkles size={36} style={{ color:AURA.yellow, filter:"drop-shadow(0 0 10px rgba(253,184,19,.35))" }} />
                            </motion.div>
                            <h1 style={{
                                fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,5vw,28px)",
                                fontWeight:600, letterSpacing:".05em",
                                background:`linear-gradient(90deg,${AURA.redDark},${AURA.red},${AURA.yellow},${AURA.blue})`,
                                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                                margin:"0 0 10px",
                            }}>Bem-vindo, líder!</h1>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:500, color:t.text, margin:0 }}>
                                {usuarioLogado?.nome || "Líder"}
                            </p>
                            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:300, color:t.textSec, margin:"6px 0 0" }}>
                                Célula {celula?.nome || "---"}
                            </p>
                        </motion.div>

                        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${t.border},transparent)`, margin:"0 0 28px" }} />

                        {/* ── Mensagem ── */}


                        {/* ── Imagem pequena de destaque ── */}
                        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
                                    style={{ display:"flex", justifyContent:"center", marginTop:20 }}>
                            <img
                                src="/40dias-milagres.png"
                                alt="40 Dias de Milagres — Avante e Sem Parar"
                                style={{
                                    width:400, height:"auto", borderRadius:14,
                                    border:`1px solid ${t.border}`,
                                    boxShadow:`0 8px 24px rgba(0,0,0,${isDark?.35:.15})`,
                                }}
                            />
                        </motion.div>

                        {/* ── Botão fechar (rodapé) ── */}
                        <button onClick={onClose} style={{
                            width:"100%", marginTop:24,
                            fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600,
                            letterSpacing:".16em", textTransform:"uppercase",
                            background:`linear-gradient(135deg,${AURA.blue},${AURA.blueDark})`, color:"#fff",
                            border:"none", borderRadius:14, padding:"15px 20px",
                            cursor:"pointer", transition:"all .25s",
                            boxShadow:"0 6px 24px rgba(0,61,165,.25)",
                        }}
                                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.filter="brightness(1.12)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.filter="brightness(1)"; }}>
                            Entendido! Vamos começar
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}