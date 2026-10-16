
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const db = require("./database");

const authRoutes = require("./routes/authRoutes");
const verificarToken = require("./middlewares/authMiddleware");
const autorizar = require("./middlewares/autorizar");

const {
  prepararSessaoCsrf,
  doubleCsrfProtection
} = require("./middlewares/csrfMiddleware");

app.disable("x-powered-by");

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Prepara o identificador usado para vincular o token CSRF.
app.use(prepararSessaoCsrf);

// Protege todas as requisições que alteram estado.
// GET, HEAD e OPTIONS são ignoradas pela configuração CSRF.
app.use(doubleCsrfProtection);

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rota pública para verificar a API
app.get("/", (req, res) => {
  res.json({
    mensagem: "API de autenticação funcionando!",
    banco: "SQLite conectado"
  });
});

// Rota protegida
app.get("/perfil", verificarToken, (req, res) => {
  const usuario = db.prepare(`
    SELECT id, nome, email, tipo
    FROM usuarios
    WHERE id = ?
  `).get(req.usuario.id);

  if (!usuario) {
    return res.status(401).json({
      mensagem: "Usuário não encontrado."
    });
  }

  return res.json({
    mensagem: "Você acessou uma rota protegida!",
    usuario
  });
});

// Rota exclusiva para administradores
app.get(
  "/admin",
  verificarToken,
  autorizar("admin"),
  (req, res) => {
    res.json({
      mensagem: "Bem-vindo à área administrativa!"
    });
  }
);

// Tratamento específico de erro CSRF
app.use((erro, req, res, next) => {
  if (erro && erro.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      mensagem: "Requisição bloqueada: token CSRF ausente ou inválido."
    });
  }

  return next(erro);
});

// Tratamento genérico de erros
app.use((erro, req, res, next) => {
  console.error(erro);

  if (res.headersSent) {
    return next(erro);
  }

  return res.status(500).json({
    mensagem: "Erro interno no servidor."
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
