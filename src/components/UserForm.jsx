import { useState, useEffect } from "react";
import api from "../services/api.js";

export default function UserForm({ fetchUsuarios, editingUser, setEditingUser }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("ADMIN");
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState("55");

  useEffect(() => {
    if (editingUser) {
      setEmail(editingUser.email);
      setSenha(""); // não mostrar senha
      setPerfil(editingUser.perfil);
      setTelefoneWhatsapp(editingUser.telefoneWhatsapp || "55");
    } else {
      setEmail("");
      setSenha("");
      setPerfil("ADMIN");
      setTelefoneWhatsapp("55");
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tel = telefoneWhatsapp ? telefoneWhatsapp.replace(/\D/g, "") : "";
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, { email, senha, perfil, telefoneWhatsapp: tel });
        setEditingUser(null);
      } else {
        await api.post("/usuarios", { email, senha, perfil, telefoneWhatsapp: tel });
      }
      setEmail("");
      setSenha("");
      setPerfil("ADMIN");
      setTelefoneWhatsapp("55");
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar usuário!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required={!editingUser}
      />
      <input
        type="tel"
        placeholder="WhatsApp"
        value={telefoneWhatsapp}
        onChange={(e) => setTelefoneWhatsapp(e.target.value)}
      />
      <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
        <option value="ADMIN">ADMIN</option>
        <option value="PASTOR">PASTOR</option>
        <option value="LIDER_CELULA">LIDER_CELULA</option>
        <option value="SECRETARIO">SECRETARIO</option>
        <option value="TESOUREIRO">TESOUREIRO</option>
      </select>
      <button type="submit">{editingUser ? "Atualizar" : "Cadastrar"}</button>
      {editingUser && <button onClick={() => setEditingUser(null)}>Cancelar</button>}
    </form>
  );
}
