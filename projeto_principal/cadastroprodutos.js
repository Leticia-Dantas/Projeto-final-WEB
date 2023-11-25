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

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
