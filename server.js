const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const Excel = require('exceljs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminMiddleware, JWT_SECRET } = require('./middlewares/auth');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para cadastrar nova doação
app.post('/api/doacoes', authMiddleware, (req, res) => {
    const { nome, contato, tipo_doacao, preferencia_entrega } = req.body;
    const usuario_id = req.usuario.id;
    
    db.run(`INSERT INTO doacoes (usuario_id, nome, contato, tipo_doacao, preferencia_entrega, status) 
            VALUES (?, ?, ?, ?, ?, 'pendente')`, 
            [usuario_id, nome, contato, tipo_doacao, preferencia_entrega], 
            function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Rota para listar todas as doações
app.get('/api/doacoes', authMiddleware, adminMiddleware, (req, res) => {
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
app.put('/api/doacoes/:id/status', authMiddleware, adminMiddleware, (req, res) => {
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
app.get('/api/relatorio', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM doacoes ORDER BY data_cadastro DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Doações');

        // Definir cabeçalhos com estilo melhorado
        worksheet.columns = [
            { header: 'Data', key: 'data', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm' } },
            { header: 'Nome', key: 'nome', width: 35 },
            { header: 'Contato', key: 'contato', width: 25 },
            { header: 'Tipo de Doação', key: 'tipo', width: 20 },
            { header: 'Entrega', key: 'entrega', width: 25 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Estilizar cabeçalhos
        const headerRow = worksheet.getRow(1);
        headerRow.font = { 
            bold: true, 
            color: { argb: 'FFFFFFFF' },
            size: 12
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0D6EFD' }
        };
        headerRow.alignment = { 
            vertical: 'middle', 
            horizontal: 'center'
        };
        headerRow.height = 30;

        // Adicionar dados com estilos alternados
        rows.forEach((row, index) => {
            const dataRow = worksheet.addRow({
                data: new Date(row.data_cadastro).toLocaleString('pt-BR'),
                nome: row.nome,
                contato: row.contato,
                tipo: formatarTipoDoacao(row.tipo_doacao),
                entrega: row.preferencia_entrega === 'escola' ? 'Entregar na escola' : 'Solicitar coleta',
                status: row.status === 'pendente' ? 'Pendente' : 'Recebido'
            });

            // Estilo zebrado
            if (index % 2 === 0) {
                dataRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8F9FA' }
                };
            }

            // Estilo do status
            const statusCell = dataRow.getCell(6);
            if (row.status === 'pendente') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFF3CD' }
                };
                statusCell.font = { color: { argb: 'FF856404' } };
            } else {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD4EDDA' }
                };
                statusCell.font = { color: { argb: 'FF155724' } };
            }

            // Alinhamento das células
            dataRow.alignment = { vertical: 'middle' };
            dataRow.height = 25;
        });

        // Adicionar linha em branco antes do resumo
        worksheet.addRow([]);
        
        // Criar a linha de resumo
        const headerResumo = worksheet.addRow({
            data: 'Resumo das Doações',
            nome: '',
            contato: '',
            tipo: '',
            entrega: '',
            status: ''
        });

        // Aplicar bordas
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF999999' } },
                    left: { style: 'thin', color: { argb: 'FF999999' } },
                    bottom: { style: 'thin', color: { argb: 'FF999999' } },
                    right: { style: 'thin', color: { argb: 'FF999999' } }
                };
            });

            if (rowNumber === 1 || rowNumber === headerResumo.number) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'medium', color: { argb: 'FF666666' } },
                        left: { style: 'medium', color: { argb: 'FF666666' } },
                        bottom: { style: 'medium', color: { argb: 'FF666666' } },
                        right: { style: 'medium', color: { argb: 'FF666666' } }
                    };
                });
            }
        });

        // Ajustar estilo das células de dados
        rows.forEach((row, index) => {
            const dataRow = worksheet.getRow(index + 2); // +2 porque a primeira linha é o cabeçalho
            
            // Alinhar células
            dataRow.eachCell((cell, colNumber) => {
                // Alinhar números à direita
                if (colNumber === 1) { // Data
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                } else if (colNumber === 2 || colNumber === 3) { // Nome e Contato
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                } else { // Outras colunas
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
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

        // Adicionar rodapé com totais (usando nome diferente para a variável)
        worksheet.addRow([]); // Linha em branco
        const resumoRow = worksheet.addRow({
            data: 'Total de Doações:',
            nome: rows.length,
            contato: '',
            tipo: `Pendentes: ${rows.filter(r => r.status === 'pendente').length}`,
            entrega: `Recebidas: ${rows.filter(r => r.status === 'recebido').length}`,
            status: ''
        });

        // Mesclar células do título do resumo
        worksheet.mergeCells(`A${headerResumo.number}:F${headerResumo.number}`);
        headerResumo.alignment = { horizontal: 'center' };

        // Estilizar linha do resumo
        resumoRow.font = { bold: true, size: 12 };
        resumoRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0D6EFD' }
        };
        resumoRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Adicionar estatísticas
        worksheet.addRow({
            data: 'Total de Doações:',
            nome: rows.length,
            contato: '',
            tipo: `Pendentes: ${rows.filter(r => r.status === 'pendente').length}`,
            entrega: `Recebidas: ${rows.filter(r => r.status === 'recebido').length}`,
            status: ''
        });

        // Mesclar células do título do resumo
        worksheet.mergeCells(`A${resumoRow.number}:F${resumoRow.number}`);
        resumoRow.alignment = { horizontal: 'center' };

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