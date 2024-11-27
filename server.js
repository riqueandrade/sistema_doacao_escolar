const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para cadastrar nova doação
app.post('/api/doacoes', (req, res) => {
    const { nome, contato, tipo_doacao, preferencia_entrega } = req.body;
    
    db.run(`INSERT INTO doacoes (nome, contato, tipo_doacao, preferencia_entrega, status) 
            VALUES (?, ?, ?, ?, 'pendente')`, 
            [nome, contato, tipo_doacao, preferencia_entrega], 
            function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Rota para listar todas as doações
app.get('/api/doacoes', (req, res) => {
    const { status, tipo } = req.query;
    let sql = 'SELECT * FROM doacoes WHERE 1=1';
    const params = [];
    
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (tipo) {
        sql += ' AND tipo_doacao = ?';
        params.push(tipo);
    }
    
    sql += ' ORDER BY data_cadastro DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota para atualizar status da doação
app.put('/api/doacoes/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run('UPDATE doacoes SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Status atualizado com sucesso' });
    });
});

// Rota para gerar relatório
app.get('/api/relatorio', (req, res) => {
    db.all('SELECT * FROM doacoes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const csv = [
            'Data,Nome,Contato,Tipo,Preferência de Entrega,Status',
            ...rows.map(row => `${row.data_cadastro},${row.nome},${row.contato},${row.tipo_doacao},${row.preferencia_entrega},${row.status}`)
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-doacoes.csv');
        res.send(csv);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 