// Configurações de autenticação JWT
const config = {
    // Chave secreta para assinatura dos tokens
    JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_secreta_jwt',
    
    // Tempo de expiração do token (1 dia)
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d'
};

module.exports = config;