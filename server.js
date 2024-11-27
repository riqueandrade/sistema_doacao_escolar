const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const Excel = require('exceljs');

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
app.get('/api/relatorio', async (req, res) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM doacoes ORDER BY data_cadastro DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Criar uma nova planilha
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Doações');

        // Definir cabeçalhos
        worksheet.columns = [
            { header: 'Data', key: 'data', width: 20 },
            { header: 'Nome', key: 'nome', width: 30 },
            { header: 'Contato', key: 'contato', width: 25 },
            { header: 'Tipo de Doação', key: 'tipo', width: 20 },
            { header: 'Entrega', key: 'entrega', width: 20 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Estilizar cabeçalhos
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0D6EFD' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Adicionar dados
        rows.forEach(row => {
            worksheet.addRow({
                data: new Date(row.data_cadastro).toLocaleString('pt-BR'),
                nome: row.nome,
                contato: row.contato,
                tipo: formatarTipoDoacao(row.tipo_doacao),
                entrega: row.preferencia_entrega === 'escola' ? 'Entregar na escola' : 'Solicitar coleta',
                status: row.status === 'pendente' ? 'Pendente' : 'Recebido'
            });
        });

        // Adicionar bordas
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Adicionar filtros
        worksheet.autoFilter = {
            from: 'A1',
            to: 'F1'
        };

        // Congelar primeira linha
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1 }
        ];

        // Adicionar rodapé com totais
        const totalRow = worksheet.addRow({
            data: 'Total de Doações:',
            nome: rows.length,
            contato: '',
            tipo: `Pendentes: ${rows.filter(r => r.status === 'pendente').length}`,
            entrega: `Recebidas: ${rows.filter(r => r.status === 'recebido').length}`,
            status: ''
        });
        totalRow.font = { bold: true };

        // Configurar resposta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-doacoes.xlsx');

        // Enviar arquivo
        await workbook.xlsx.write(res);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

// Função auxiliar para formatar tipo de doação
function formatarTipoDoacao(tipo) {
    const tipos = {
        material_escolar: 'Material Escolar',
        alimentos: 'Alimentos',
        livros: 'Livros',
        roupas: 'Roupas',
        outros: 'Outros'
    };
    return tipos[tipo] || tipo;
}

// Rota para obter estatísticas
app.get('/api/doacoes/estatisticas', async (req, res) => {
    try {
        const stats = await new Promise((resolve, reject) => {
            db.all('SELECT status, preferencia_entrega, COUNT(*) as count FROM doacoes GROUP BY status, preferencia_entrega', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const estatisticas = {
            total: 0,
            pendentes: 0,
            recebidas: 0,
            coletas: 0
        };

        stats.forEach(row => {
            estatisticas.total += row.count;
            
            if (row.status === 'pendente') {
                estatisticas.pendentes += row.count;
            } else if (row.status === 'recebido') {
                estatisticas.recebidas += row.count;
            }

            if (row.preferencia_entrega === 'coleta') {
                estatisticas.coletas += row.count;
            }
        });

        res.json(estatisticas);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Rota para buscar uma doação específica
app.get('/api/doacoes/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM doacoes WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Doação não encontrada' });
            return;
        }
        res.json(row);
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