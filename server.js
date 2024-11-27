// Importações
const express = require('express');
const cors = require('cors');
const path = require('path');

// Rotas
const doacoesRoutes = require('./routes/doacoes');
const authRoutes = require('./routes/auth');
const relatoriosRoutes = require('./routes/relatorios');

// Configurações
const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/doacoes', doacoesRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/relatorios', relatoriosRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});