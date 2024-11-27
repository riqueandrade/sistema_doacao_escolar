const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'doacoes.db'), (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite.');
    
    // Criar tabela de doações se não existir
    db.run(`CREATE TABLE IF NOT EXISTS doacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        contato TEXT NOT NULL,
        tipo_doacao TEXT NOT NULL,
        preferencia_entrega TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db; 