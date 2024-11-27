// Configurações de autenticação JWT
module.exports = {
    // Chave secreta para assinatura dos tokens (em produção, usar variável de ambiente)
    JWT_SECRET: 'sua_chave_secreta_jwt',
    
    // Tempo de expiração do token
    JWT_EXPIRATION: '1d' // 1 dia
};