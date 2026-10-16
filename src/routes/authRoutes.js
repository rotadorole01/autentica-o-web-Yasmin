
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");

const {
  emitirTokenCsrf
} = require("../middlewares/csrfMiddleware");

const router = express.Router();

// Emite um token CSRF para o cliente.
router.get("/csrf-token", emitirTokenCsrf);

// Cadastro de usuários
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !nome.trim() ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos corretamente."
      });
    }

    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return res.status(400).json({
        mensagem: "Email inválido."
      });
    }

    if (
      senha.length < 8 ||
      Buffer.byteLength(senha, "utf8") > 72
    ) {
      return res.status(400).json({
        mensagem:
          "A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes."
      });
    }

    const usuarioExiste = db.prepare(
      "SELECT id FROM usuarios WHERE email = ?"
    ).get(emailNormalizado);

    if (usuarioExiste) {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const resultado = db.prepare(`
      INSERT INTO usuarios (nome, email, senha, tipo)
      VALUES (?, ?, ?, 'cliente')
    `).run(nomeNormalizado, emailNormalizado, senhaHash);

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: Number(resultado.lastInsertRowid),
        nome: nomeNormalizado,
        email: emailNormalizado,
        tipo: "cliente"
      }
    });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado."
      });
    }

    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário."
    });
  }
});

// Login com JWT armazenado em cookie HttpOnly
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        mensagem: "Informe email e senha."
      });
    }

    const usuario = db.prepare(
      "SELECT * FROM usuarios WHERE email = ?"
    ).get(email.trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos."
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos."
      });
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET não configurado corretamente."
      );
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "15m"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login."
    });
  }
});

// Logout protegido pelo middleware CSRF global
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  return res.status(200).json({
    mensagem: "Logout realizado com sucesso!"
  });
});

module.exports = router;
