const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken } = require('../middlewares/auth');

// Funções auxiliares
async function buscarUsuarioPorEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
            if (err) reject(err);
            else resolve(usuario);
        });
    });
}

async function validarSenha(senha, hashSenha) {
    return await bcrypt.compare(senha, hashSenha);
}

function gerarRespostaLogin(usuario, token) {
    return {
        token,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
    };
}

// Rotas
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        const usuario = await buscarUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const senhaCorreta = await validarSenha(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo
        });

        res.json(gerarRespostaLogin(usuario, token));

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/verificar', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.json({ valid: false });
    }
});

module.exports = router;