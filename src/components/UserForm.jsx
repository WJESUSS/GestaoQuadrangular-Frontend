import { useState, useEffect } from "react";
import api from "../api/api";

export default function UserForm({ fetchUsuarios, editingUser, setEditingUser }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("ADMIN");

  useEffect(() => {
    if (editingUser) {
      setEmail(editingUser.email);
      setSenha(""); // não mostrar senha
      setPerfil(editingUser.perfil);
    } else {
      setEmail("");
      setSenha("");
      setPerfil("ADMIN");
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, { email, senha, perfil });
        setEditingUser(null);
      } else {
        await api.post("/usuarios", { email, senha, perfil });
      }
      setEmail("");
      setSenha("");
      setPerfil("ADMIN");
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
        required={!editingUser} // obrigatório apenas para novo usuário
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
