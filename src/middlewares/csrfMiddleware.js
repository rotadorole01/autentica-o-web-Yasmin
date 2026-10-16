
const crypto = require("crypto");
const { doubleCsrf } = require("csrf-csrf");

const segredoCsrf = process.env.JWT_SECRET;

if (!segredoCsrf || segredoCsrf.length < 32) {
  throw new Error(
    "JWT_SECRET precisa ter pelo menos 32 caracteres."
  );
}

const {
  generateToken,
  doubleCsrfProtection
} = doubleCsrf({
  getSecret: () => segredoCsrf,

  getSessionIdentifier: (req) => {
    return req.cookies?.csrf_session || "";
  },

  cookieName: "csrf-token",

  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 1000
  },

  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) => {
    return req.headers["x-csrf-token"];
  }
});

function prepararSessaoCsrf(req, res, next) {
  let identificador = req.cookies?.csrf_session;

  if (
    typeof identificador !== "string" ||
    !/^[a-f0-9]{64}$/.test(identificador)
  ) {
    identificador = crypto.randomBytes(32).toString("hex");

    res.cookie("csrf_session", identificador, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 1000
    });

    req.cookies.csrf_session = identificador;
  }

  next();
}

function emitirTokenCsrf(req, res) {
  const csrfToken = generateToken(req, res);

  res.set("Cache-Control", "no-store");

  return res.status(200).json({ csrfToken });
}

module.exports = {
  prepararSessaoCsrf,
  emitirTokenCsrf,
  doubleCsrfProtection
};
