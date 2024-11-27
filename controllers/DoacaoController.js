const DoacaoService = require('../services/DoacaoService');

class DoacaoController {
    // Métodos de consulta
    async listar(req, res) {
        try {
            const { status, tipo, ordem } = req.query;
            const doacoes = await DoacaoService.listar(status, tipo, ordem);
            res.json(doacoes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async estatisticas(req, res) {
        try {
            const stats = await DoacaoService.obterEstatisticas();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Métodos de manipulação
    async cadastrar(req, res) {
        try {
            const { nome, contato, tipo_doacao, preferencia_entrega } = req.body;
            const doacao = await DoacaoService.cadastrar({
                nome, contato, tipo_doacao, preferencia_entrega
            });
            res.json(doacao);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async alterarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['pendente', 'recebido'].includes(status)) {
                return res.status(400).json({ error: 'Status inválido' });
            }

            const doacao = await DoacaoService.alterarStatus(id, status);
            res.json(doacao);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DoacaoController();