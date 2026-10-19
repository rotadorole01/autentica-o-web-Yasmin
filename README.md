
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
git clone https://github.com/rotadorole01/autentica-o-web-Yasmin.git
cd autentica-o-web-Yasmin
npm install
npm start
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto, sem enviá-lo ao GitHub.

```env
PORT=3000
JWT_SECRET=COLOQUE_UM_SEGREDO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES
```

Gere um segredo aleatório forte para seu ambiente local. Não compartilhe o valor real de `JWT_SECRET`.

## Execução

```bash
npm start
```

A API será iniciada na porta 3000, salvo configuração diferente na variável `PORT`.

Verifique a API:

```bash
curl http://localhost:3000/
```

## Rotas principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica a API |
| GET | `/auth/csrf-token` | Emite token CSRF |
| POST | `/auth/cadastro` | Cadastra usuário |
| POST | `/auth/login` | Autentica usuário |
| POST | `/auth/logout` | Encerra autenticação |
| GET | `/perfil` | Exibe perfil autenticado |
| GET | `/admin` | Rota restrita a administradores |

## Testes

Antes das requisições POST de cadastro, login ou logout, obtenha um token CSRF:

```bash
curl -i -c cookies.txt http://localhost:3000/auth/csrf-token
```

Envie o valor `csrfToken` retornado no JSON no cabeçalho `X-CSRF-Token` e mantenha os cookies entre as requisições.

Para testar o perfil após o login:

```bash
curl -i -b cookies.txt http://localhost:3000/perfil
```

Para testar a rota administrativa:

```bash
curl -i -b cookies.txt http://localhost:3000/admin
```

O acesso administrativo depende do tipo de usuário autenticado.

## Segurança

- Senhas armazenadas com hash bcrypt.
- JWT com expiração.
- Cookie de autenticação com `HttpOnly` e `SameSite=Strict`.
- Verificação CSRF nas requisições que alteram dados.
- Verificação de autenticação e autorização em rotas protegidas.
- Segredos e arquivos locais excluídos do controle de versão.

## Contexto acadêmico

Este projeto é uma prova de conceito para a atividade prática de Segurança e Autenticação em Aplicações Web. Não substitui uma revisão de segurança completa antes de uso em produção.
