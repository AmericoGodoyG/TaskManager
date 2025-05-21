import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      senha,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("tipo", res.data.user.tipo);
    localStorage.setItem("nome", res.data.user.nome);

    // Redireciona direto (sem depender da rota protegida)
    if (res.data.user.tipo === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/aluno";
    }

  } catch (err) {
    setErro(err.response?.data?.erro || "Erro ao fazer login");
  }
};


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {erro && <p className="erro">{erro}</p>}

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

        <button type="submit">Entrar</button>

        <p>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
