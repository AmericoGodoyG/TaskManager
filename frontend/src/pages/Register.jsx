import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";


function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("aluno");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/registrar", {
        nome,
        email,
        senha,
        tipo,
      });

      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao cadastrar");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Cadastro</h2>

        {erro && <p className="erro">{erro}</p>}

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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
          required
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="mb-3"
        >
          <option value="aluno">Aluno</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Cadastrar</button>

        <p>
          Já tem uma conta? <Link to="/">Faça login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
