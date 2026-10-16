
const jwt = require("jsonwebtoken");
const db = require("../database");

function verificarToken(req, res, next) {
  const authorization = req.headers.authorization;

  // Aceita o cookie ou o cabeçalho Bearer
  const tokenDoHeader =
    authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

  const token = req.cookies?.token || tokenDoHeader;

  if (!token) {
    return res.status(401).json({
      mensagem: "Acesso negado. Token não informado."
    });
  }

  try {
    const dados = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Consulta a permissão atual no banco
    const usuario = db.prepare(`
      SELECT id, nome, email, tipo
      FROM usuarios
      WHERE id = ?
    `).get(dados.id);

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Usuário não encontrado."
      });
    }

    req.usuario = usuario;

    next();

  } catch (erro) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado."
    });
  }
}

module.exports = verificarToken;
