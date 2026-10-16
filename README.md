cat > README.md <<'EOF'
# Autenticação Web

Projeto prático de segurança e autenticação web desenvolvido com Node.js, Express, SQLite e JWT.

## Funcionalidades

- Cadastro de usuários com senhas protegidas por hash bcrypt.
- Login com token JWT armazenado em cookie HttpOnly.
- Proteção CSRF para requisições que alteram dados.
- Rota protegida de perfil do usuário.
- Controle de acesso por tipo de usuário: cliente e administrador.
- Logout com limpeza do cookie de autenticação.
- Banco de dados SQLite.

## Requisitos

- Node.js e npm instalados.

## Instalação

Clone o repositório:

```bash
git clone https://github.com/Gustavo18henrique/autenticacao-web.git
cd autenticacao-web