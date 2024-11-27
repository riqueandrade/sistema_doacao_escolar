const express = require('express');
const router = express.Router();
const DoacaoController = require('../controllers/DoacaoController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Rotas públicas
router.post('/', DoacaoController.cadastrar);

// Rotas administrativas
router.get('/', authMiddleware, adminMiddleware, DoacaoController.listar);
router.get('/estatisticas', authMiddleware, adminMiddleware, DoacaoController.estatisticas);
router.put('/:id/status', authMiddleware, adminMiddleware, DoacaoController.alterarStatus);

module.exports = router;