const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'doacoes.db'), async (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite.');
    
    // Criar tabela de usuários
    await db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'doador',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Criar tabela de doações com referência ao usuário
    await db.run(`CREATE TABLE IF NOT EXISTS doacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        contato TEXT NOT NULL,
        tipo_doacao TEXT NOT NULL,
        preferencia_entrega TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    // Criar usuário admin padrão se não existir
    const adminEmail = 'admin@escola.com';
    const adminSenha = await bcrypt.hash('admin123', 10);
    
    db.get('SELECT id FROM usuarios WHERE email = ?', [adminEmail], (err, row) => {
        if (!row) {
            db.run(`INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)`,
                ['Administrador', adminEmail, adminSenha, 'admin']);
        }
    });
});

module.exports = db; 