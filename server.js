const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const db = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Atividades
 *     description: Gerenciamento de atividades de equilíbrio vida-trabalho
 */

/**
 * @swagger
 * /atividades:
 *   get:
 *     summary: Lista todas as atividades ou filtra pelo criador
 *     tags: [Atividades]
 *     parameters:
 *       - in: query
 *         name: creatorName
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome do criador para filtrar as atividades
 *     responses:
 *       200:
 *         description: Lista de atividades (todas ou filtradas)
 */
app.get("/atividades", (req, res) => {
  const { creatorName } = req.query;

  // Se o filtro foi informado, aplica
  if (creatorName) {
    const filtradas = db.atividades.filter(
      (a) => a.creatorName.toLowerCase() === creatorName.toLowerCase()
    );
    return res.json(filtradas);
  }

  // Caso contrário retorna todas
  res.json(db.atividades);
});

/**
 * @swagger
 * /atividades/{id}:
 *   get:
 *     summary: Busca uma atividade pelo ID
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atividade encontrada
 *       404:
 *         description: Atividade não encontrada
 */
app.get("/atividades/:id", (req, res) => {
  const atividade = db.atividades.find((a) => a.id === Number(req.params.id));
  if (!atividade) {
    return res.status(404).json({ erro: "Atividade não encontrada" });
  }
  res.json(atividade);
});

/**
 * @swagger
 * /atividades:
 *   post:
 *     summary: Cadastra uma nova atividade
 *     tags: [Atividades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               descricao: { type: string }
 *               duracaoMin: { type: integer }
 *               categoria: { type: string }
 *               criador: { type: string }
 *     responses:
 *       201:
 *         description: Atividade criada
 */
app.post("/atividades", (req, res) => {
  const nova = {
    id: db.atividades.length + 1,
    ...req.body,
  };
  db.atividades.push(nova);
  res.status(201).json(nova);
});

/**
 * @swagger
 * /atividades/{id}:
 *   delete:
 *     summary: Remove uma atividade
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Atividade removida
 */
app.delete("/atividades/:id", (req, res) => {
  const index = db.atividades.findIndex((a) => a.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ erro: "Atividade não encontrada" });
  }
  const removida = db.atividades.splice(index, 1);
  res.json({ mensagem: "Atividade removida", removida });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Swagger: http://localhost:${PORT}/docs`);
});

/**
 * @swagger
 * /atividades/{id}/join:
 *   post:
 *     summary: Participar de uma atividade
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: rm
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participação registrada com sucesso
 *       400:
 *         description: Usuário já está participando
 *       404:
 *         description: Atividade não encontrada
 */
app.post("/atividades/:id/join", (req, res) => {
  const atividadeId = Number(req.params.id);
  const rm = Number(req.query.rm);

  const atividade = db.atividades.find((a) => a.id === atividadeId);
  if (!atividade) {
    return res.status(404).json({ erro: "Atividade não encontrada" });
  }

  const jaParticipa = db.participacoes.find(
    (p) => p.rm === rm && p.atividadeId === atividadeId
  );

  if (jaParticipa) {
    return res
      .status(400)
      .json({ erro: "Usuário já participa desta atividade" });
  }

  db.participacoes.push({ rm, atividadeId });

  res.json({
    mensagem: "Entrada na atividade realizada com sucesso",
    atividade,
  });
});

/**
 * @swagger
 * /atividades/{id}/join:
 *   post:
 *     summary: Participar de uma atividade
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rm:
 *                 type: integer
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Participação registrada com sucesso
 *       400:
 *         description: Usuário já participa
 *       404:
 *         description: Atividade não encontrada
 */
app.post("/atividades/:id/join", (req, res) => {
  const atividadeId = Number(req.params.id);
  const { rm } = req.body;

  const atividade = db.atividades.find((a) => a.id === atividadeId);
  if (!atividade) {
    return res.status(404).json({ erro: "Atividade não encontrada" });
  }

  const jaParticipa = db.participacoes.find(
    (p) => p.rm === rm && p.atividadeId === atividadeId
  );

  if (jaParticipa) {
    return res.status(400).json({
      erro: "Usuário já participa desta atividade",
    });
  }

  db.participacoes.push({ rm, atividadeId });

  res.json({
    mensagem: "Entrada na atividade realizada com sucesso",
    atividadeId,
    rm,
  });
});

/**
 * @swagger
 * /atividades/{id}/leave:
 *   delete:
 *     summary: Sair de uma atividade
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rm:
 *                 type: integer
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Saída realizada com sucesso
 *       404:
 *         description: Participação não encontrada
 */
app.delete("/atividades/:id/leave", (req, res) => {
  const atividadeId = Number(req.params.id);
  const { rm } = req.body;

  const index = db.participacoes.findIndex(
    (p) => p.rm === rm && p.atividadeId === atividadeId
  );

  if (index === -1) {
    return res.status(404).json({
      erro: "Usuário não participa desta atividade",
    });
  }

  db.participacoes.splice(index, 1);

  res.json({
    mensagem: "Usuário saiu da atividade com sucesso",
    atividadeId,
    rm,
  });
});
