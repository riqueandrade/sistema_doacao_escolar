const jwt = require('jsonwebtoken');
const db = require('../database');

// Usar a chave secreta do .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

/**
 * Funções auxiliares
 */

// Função para gerar token JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION
    });
};

// Função para validar formato do token
const validarFormatoToken = (authHeader) => {
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        throw new Error('Token mal formatado');
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        throw new Error('Token mal formatado');
    }

    return token;
};

/**
 * Middlewares
 */

// Middleware para verificar autenticação
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = validarFormatoToken(authHeader);

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Token inválido' });
            }

            req.usuario = decoded;
            return next();
        });
    } catch (error) {
        return res.status(401).json({ error: error.message || 'Erro ao autenticar token' });
    }
};

// Middleware para verificar se é admin
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        db.get('SELECT tipo FROM usuarios WHERE id = ?', [req.usuario.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao verificar permissões' });
            }

            if (!row || row.tipo !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware, 
    generateToken,
    JWT_SECRET
};