const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const next = require('next');

const app = express();
const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

app.use(express.json());

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect()
  .then(() => console.log('Conectado ao banco de dados com sucesso.'))
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });

app.post('/api/pets', async (req, res) => {
  const { nomeDono, telefoneDono, nomePet, especiePet, idadePet } = req.body;

  if (!nomeDono || !nomePet || !especiePet) {
    return res.status(400).json({ error: 'Nome do dono, nome e espécie do pet são obrigatórios.' });
  }

  try {
    await db.query('BEGIN');

    const donoResult = await db.query(
      'INSERT INTO donos (nome, telefone) VALUES ($1, $2) RETURNING id',
      [nomeDono, telefoneDono || null]
    );
    const donoId = donoResult.rows[0].id;

    await db.query(
      'INSERT INTO pets (nome, especie, idade, dono_id) VALUES ($1, $2, $3, $4)',
      [nomePet, especiePet, idadePet || null, donoId]
    );

    await db.query('COMMIT');

    res.status(201).json({ message: 'Cadastro do pet e dono realizado com sucesso!' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Erro ao cadastrar pet e dono:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/pets-list', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pets.id, pets.nome, pets.especie, pets.idade, donos.nome AS nome_dono
      FROM pets
      LEFT JOIN donos ON pets.dono_id = donos.id
      ORDER BY pets.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pets:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  const petId = req.params.id;

  try {
    const result = await db.query('DELETE FROM pets WHERE id = $1', [petId]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Pet deletado com sucesso!' });
    } else {
      res.status(404).json({ error: 'Pet não encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao deletar pet:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

nextApp.prepare().then(() => {
  app.all('*', (req, res) => handle(req, res));

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
});
