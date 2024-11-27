const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurações do banco de dados
const DB_CONFIG = {
    path: process.env.DB_PATH || 'doacoes.db',
    verbose: true
};

// Inicialização do banco de dados
const dbPath = path.join(__dirname, '..', DB_CONFIG.path);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conectado ao banco de dados SQLite');
});

// Configuração de tratamento de erros
db.on('error', (err) => {
    console.error('Erro no banco de dados:', err);
    throw err; // Lança o erro para tratamento adequado
});

// Configuração de promisificação de queries (opcional)
db.asyncRun = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = db;