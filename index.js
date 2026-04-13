const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// ----------------------
// ROTA TESTE
// ----------------------
app.get('/', (req, res) => {
  res.send('API com PostgreSQL no Render funcionando!');
});

// ----------------------
// GET - LISTAR TODOS
// ----------------------
app.get('/alunos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alunos ORDER BY id');
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao consultar banco:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// ----------------------
// GET - BUSCAR POR ID
// ----------------------
app.get('/alunos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM alunos WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ----------------------
// POST - INSERIR
// ----------------------
app.post('/alunos', async (req, res) => {
  const { id, nome, curso } = req.body;

  // Validação simples
  if (!nome || !curso) {
    return res.status(400).json({
      erro: 'Nome e curso são obrigatórios'
    });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO alunos (id, nome, curso) VALUES ($1, $2, $3) RETURNING *',
      [nome, curso]
    );

    res.status(201).json({
      mensagem: 'Aluno criado com sucesso',
      aluno: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
});

// ----------------------
// PUT - ATUALIZAR
// ----------------------
app.put('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, curso } = req.body;

  if (!nome || !curso) {
    return res.status(400).json({
      erro: 'Nome e curso são obrigatórios'
    });
  }

  try {
    const resultado = await pool.query(
      'UPDATE alunos SET nome=$1, curso=$2 WHERE id=$3 RETURNING *',
      [nome, curso, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json({
      mensagem: 'Aluno atualizado',
      aluno: resultado.rows[0]
    });

  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ----------------------
// DELETE - EXCLUIR
// ----------------------
app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM alunos WHERE id=$1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json({
      mensagem: 'Aluno excluído com sucesso',
      aluno: resultado.rows[0]
    });

  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ----------------------
// START SERVER
// ----------------------
app.listen(process.env.PORT || 10000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 10000}`);
});