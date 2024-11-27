const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const db = require('../config/database');
const { formatarTipoDoacao, formatarStatus } = require('../utils/formatters');

// Funções auxiliares
async function buscarDoacoes() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM doacoes ORDER BY data_cadastro DESC', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function formatarDadosDoacao(doacao) {
    return {
        data: new Date(doacao.data_cadastro).toLocaleDateString('pt-BR'),
        nome: doacao.nome,
        contato: doacao.contato,
        tipo_doacao: formatarTipoDoacao(doacao.tipo_doacao),
        preferencia_entrega: doacao.preferencia_entrega === 'escola' ? 'Entregar na escola' : 'Solicitar coleta',
        status: formatarStatus(doacao.status)
    };
}

// Configuração do Excel
function configurarWorksheet(worksheet) {
    worksheet.columns = [
        { header: 'Data', key: 'data', width: 15 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Contato', key: 'contato', width: 25 },
        { header: 'Tipo de Doação', key: 'tipo_doacao', width: 20 },
        { header: 'Preferência de Entrega', key: 'preferencia_entrega', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
    ];

    // Estilizar cabeçalhos
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D6EFD' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
}

// Rotas
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Doações');

        configurarWorksheet(worksheet);

        const doacoes = await buscarDoacoes();
        doacoes.forEach(doacao => {
            worksheet.addRow(formatarDadosDoacao(doacao));
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-doacoes.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

router.get('/pdf', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const doacoes = await buscarDoacoes();
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-doacoes.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório de Doações', { align: 'center' });
        doc.moveDown();

        const table = {
            title: 'Doações Registradas',
            headers: ['Data', 'Nome', 'Contato', 'Tipo', 'Entrega', 'Status'],
            rows: doacoes.map(doacao => {
                const dados = formatarDadosDoacao(doacao);
                return [
                    dados.data,
                    dados.nome,
                    dados.contato,
                    dados.tipo_doacao,
                    dados.preferencia_entrega,
                    dados.status
                ];
            })
        };

        await doc.table(table, {
            prepareHeader: () => doc.fontSize(10),
            prepareRow: () => doc.fontSize(10)
        });

        doc.end();

    } catch (error) {
        console.error('Erro ao gerar relatório PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
    }
});

module.exports = router;