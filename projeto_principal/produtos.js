const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('usuarios.db');

// Rota para obter produtos por nome
app.get('/produtos', async (req, res) => {
    const { id } = req.query;

    if (id) {
        // Se houver um ID na consulta, busca produto por ID
        try {
            const produto = await getProdutoById(id);
            if (produto) {
                res.json(produto);
            } else {
                res.status(404).json({ message: 'Produto não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        // Se não houver o ID, retorna todos os produtos
        try {
            const produtos = await getAllProdutos();
            res.json(produtos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
});


// Rota para obter um produto por ID
app.get('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const produto = await getProdutoById(id);
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para adicionar um novo produto
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
  

// Rota para editar um produto por ID
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;
  try {
    const produtoAtualizado = await updateProduto(id, nome, descricao, preco);
    if (produtoAtualizado) {
      res.json(produtoAtualizado);
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para excluir um produto por ID
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteProduto(id);
    if (result) {
      res.json({ message: 'Produto excluído com sucesso' });
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função para obter todos os produtos
function getAllProdutos() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM produtos', (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

// Função para obter um produto por ID
function getProdutoById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM produtos WHERE id = ?', [id], (error, row) => {
            if (error) {
                reject(error);
            } else {
                resolve(row);
            }
        });
    });
}

// Função para adicionar um novo produto
function addProduto(nome, descricao, preco) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)', [nome, descricao, preco], function (error) {
      if (error) {
        reject(error);
      } else {
        const novoProduto = {
          id: this.lastID,
          nome,
          descricao,
          preco
        };
        resolve(novoProduto);
      }
    });
  });
}

// Função para editar um produto por ID
function updateProduto(id, nome, descricao, preco) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?', [nome, descricao, preco, id], function (error) {
      if (error) {
        reject(error);
      } else if (this.changes === 0) {
        resolve(null); // Nenhum produto foi atualizado (produto não encontrado)
      } else {
        const produtoAtualizado = {
          id,
          nome,
          descricao,
          preco
        };
        resolve(produtoAtualizado);
      }
    });
  });
}

// Função para excluir um produto por ID
function deleteProduto(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM produtos WHERE id = ?', [id], function (error) {
      if (error) {
        reject(error);
      } else if (this.changes === 0) {
        resolve(null); // Nenhum produto foi excluído (produto não encontrado)
      } else {

        resolve(true);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
