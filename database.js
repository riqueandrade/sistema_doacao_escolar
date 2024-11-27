const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Configuração do banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'doacoes.db'), async (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Conectado ao banco de dados SQLite.');
    
    // Inicialização das tabelas e dados
    inicializarBancoDeDados();
});

// Função para criar as tabelas do banco
function criarTabelas(db) {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'doador',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de doações
    db.run(`CREATE TABLE IF NOT EXISTS doacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        contato TEXT NOT NULL,
        tipo_doacao TEXT NOT NULL,
        preferencia_entrega TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// Função para criar usuário admin padrão
function criarUsuarioAdmin(db) {
    const adminEmail = 'admin@escola.com';
    bcrypt.hash('admin123', 10, (err, hash) => {
        if (err) {
            console.error('Erro ao criar hash da senha:', err);
            return;
        }

        db.get('SELECT id FROM usuarios WHERE email = ?', [adminEmail], (err, row) => {
            if (err) {
                console.error('Erro ao verificar usuário admin:', err);
                return;
            }

            if (!row) {
                db.run(
                    'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
                    ['Administrador', adminEmail, hash, 'admin'],
                    (err) => {
                        if (err) {
                            console.error('Erro ao criar usuário admin:', err);
                        } else {
                            console.log('Usuário admin criado com sucesso');
                        }
                    }
                );
            }
        });
    });
}

// Função principal de inicialização
function inicializarBancoDeDados() {
    db.serialize(() => {
        criarTabelas(db);
        criarUsuarioAdmin(db);
    });
}

module.exports = db;