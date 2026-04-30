import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  UserPlus,
  Users,
  ShieldCheck,
  Power,
  Trash2,
  LogOut,
  Mail,
  Key,
  User,
  Shield,
  Loader2,
  RefreshCcw,
  Pencil,
  X
} from "lucide-react";

const perfis = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [erro, setErro] = useState("");

  // Estados para Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Form State (compartilhado entre criação e edição)
  const [form, setForm] = useState({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("usuarios");
      setUsuarios(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      setErro("Não foi possível sincronizar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  // Função para Criar Usuário
  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setSending(true);
    setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      setErro("Falha ao criar novo acesso.");
    } finally {
      setSending(false);
    }
  };

  // Função para abrir o modal e preencher o form
  const abrirEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setIsEditModalOpen(true);
  };

  // Função para salvar a atualização (PUT)
  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setIsEditModalOpen(false);
      setEditandoId(null);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      setErro("Erro ao atualizar dados.");
    } finally {
      setSending(false);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try {
      await api.delete(`usuarios/${id}`);
      carregarUsuarios();
    } catch (err) { setErro("Erro ao deletar."); }
  };

  const alternarStatus = async (id) => {
    try {
      await api.patch(`usuarios/${id}/status`);
      carregarUsuarios();
    } catch (err) { setErro("Erro ao alterar status."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 animate-in fade-in duration-700">

        {/* HEADER */}
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic flex items-center gap-3">
              <div className="p-2 bg-rose-600 rounded-2xl shadow-lg shadow-rose-500/30">
                <ShieldCheck size={32} className="text-white" />
              </div>
              SISTEMA <span className="text-rose-600">ROOT</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">Controle de Privilégios e Acessos</p>
          </div>

          <button onClick={handleLogout} className="group flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Encerrar Sessão
          </button>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LADO ESQUERDO: FORMULÁRIO DE CRIAÇÃO */}
          <section className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Novo Acesso</h2>
              </div>

              <form onSubmit={adicionarUsuario} className="space-y-5">
                <div className="space-y-4">
                  <InputIcon icon={<User size={18}/>} placeholder="Nome do Usuário" value={form.nome} onChange={v => setForm({...form, nome: v})} />
                  <InputIcon icon={<Mail size={18}/>} type="email" placeholder="E-mail Institucional" value={form.email} onChange={v => setForm({...form, email: v})} />
                  <InputIcon icon={<Key size={18}/>} type="password" placeholder="Senha de Acesso" value={form.senha} onChange={v => setForm({...form, senha: v})} />
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none cursor-pointer" value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                      {perfis.map(p => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={sending} className="w-full bg-slate-900 dark:bg-rose-600 hover:bg-black dark:hover:bg-rose-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                  {sending ? <Loader2 className="animate-spin" /> : "Liberar Acesso"}
                </button>
              </form>
            </div>
          </section>

          {/* LADO DIREITO: LISTAGEM COM BOTÃO DE ATUALIZAR */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="text-rose-600" size={24} />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Base de Usuários</h2>
                </div>
                <button onClick={carregarUsuarios} className="text-slate-400 hover:text-rose-600 transition-colors">
                  <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-5 text-left">Identidade</th>
                    <th className="px-6 py-5 text-left">Nível</th>
                    <th className="px-6 py-5 text-left">Estado</th>
                    <th className="px-8 py-5 text-right">Controles</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && usuarios.length === 0 ? (
                      <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-600" size={40} /></td></tr>
                  ) : (
                      usuarios.map((u) => (
                          <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500">{u.nome?.charAt(0)}</div>
                                <div>
                                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{u.nome}</p>
                                  <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-tighter">{u.perfil}</span>
                            </td>
                            <td className="px-6 py-6">
                              <div className={`flex items-center gap-2 text-xs font-bold ${u.ativo ? 'text-emerald-500' : 'text-slate-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                {u.ativo ? "ATIVO" : "SUSPENSO"}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right space-x-1">
                              {/* BOTÃO ATUALIZAR (Lápis) */}
                              <button onClick={() => abrirEdicao(u)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Editar Usuário">
                                <Pencil size={18} />
                              </button>

                              <button onClick={() => alternarStatus(u.id)} className={`p-2 rounded-xl transition-all ${u.ativo ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title="Alternar Status">
                                <Power size={18} />
                              </button>

                              <button onClick={() => deletarUsuario(u.id)} className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100" title="Excluir Permanentemente">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>

        {/* MODAL DE ATUALIZAÇÃO (PREMIUM) */}
        {isEditModalOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                      Atualizar <span className="text-blue-600">Acesso</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID do Registro: {editandoId}</p>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={salvarEdicao} className="space-y-4">
                  <InputIcon icon={<User size={18}/>} placeholder="Nome" value={form.nome} onChange={v => setForm({...form, nome: v})} />
                  <InputIcon icon={<Mail size={18}/>} type="email" placeholder="E-mail" value={form.email} onChange={v => setForm({...form, email: v})} />
                  <InputIcon icon={<Key size={18}/>} type="password" placeholder="Nova Senha (deixe vazio para manter)" value={form.senha} onChange={v => setForm({...form, senha: v})} />

                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        value={form.perfil}
                        onChange={e => setForm({...form, perfil: e.target.value})}
                    >
                      {perfis.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={sending}
                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 className="animate-spin" size={18} /> : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Notificação de Erro Flutuante */}
        {erro && !isEditModalOpen && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-bounce flex items-center gap-3 z-50">
              <Power size={20} /> {erro}
              <button onClick={() => setErro("")} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
            </div>
        )}
      </div>
  );
}

function InputIcon({ icon, ...props }) {
  return (
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
          {icon}
        </div>
        <input
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-inner"
        />
      </div>
  );
}