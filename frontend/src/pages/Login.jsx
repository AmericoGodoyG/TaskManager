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

      console.log("Resposta do login:", res.data);

      // Salvar token e tipo no localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("tipo", res.data.user.tipo);

      console.log("Tipo salvo no localStorage:", localStorage.getItem("tipo"));

      if (res.data.user.tipo === "admin") {

        console.log("Redirecionando para o Admin");  // Verifique se o código chega aqui
        navigate("/admin");

      } else {

        console.log("Redirecionando para o Aluno");
        navigate("/aluno");
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
