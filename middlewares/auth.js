const jwt = require('jsonwebtoken');

const JWT_SECRET = 'sua_chave_secreta_aqui'; // Em produção, use variáveis de ambiente

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET }; 