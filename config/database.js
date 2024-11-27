const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuração do banco de dados SQLite
const dbPath = path.join(__dirname, '../doacoes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite');
    }
});

// Configurar para lançar erros em vez de silenciosamente falhar
db.on('error', (err) => {
    console.error('Erro no banco de dados:', err);
});

module.exports = db;