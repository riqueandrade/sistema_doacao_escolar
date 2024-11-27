require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Rotas
const doacoesRoutes = require('./routes/doacoes');
const authRoutes = require('./routes/auth');
const relatoriosRoutes = require('./routes/relatorios');

// Configurações
const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200
}));

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/doacoes', doacoesRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/relatorios', relatoriosRoutes);

// Rate Limiting (nova implementação)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS
});

app.use('/api/', limiter);

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
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
});