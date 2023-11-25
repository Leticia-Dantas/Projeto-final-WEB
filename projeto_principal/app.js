const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
// Configurar o middleware para analisar dados JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar o banco de dados SQLite
const db = new sqlite3.Database('usuarios.db');

// Criar a tabela de usuários se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT
  )
`);

// Rota de cadastro de usuários
app.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body;

  // Inserir dados no banco de dados
  db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }

    res.json({ success: true });
  });
});

// Rota de cadastro de produtos
app.post('/cadastrar-produto', (req, res) => {
  const { nome, descricao, preco } = req.body;

  // Inserir dados no banco de dados
  db.run('INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)', [nome, descricao, preco], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao cadastrar produto' });
    }

    res.json({ success: true, message: 'Produto cadastrado com sucesso' });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Consultar usuário no banco de dados
  db.get('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao realizar login' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ success: true, usuario: row });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
