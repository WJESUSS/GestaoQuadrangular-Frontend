import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../auth/AuthContext";

export default function Usuarios() {
  const { logout } = useAuth();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get("/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch(() => logout());
  }, []);

  return (
    <div>
      <h2>Usuários</h2>

      <button onClick={logout}>Logout</button>

      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>{u.email}</li>
        ))}
      </ul>
    </div>
  );
}
