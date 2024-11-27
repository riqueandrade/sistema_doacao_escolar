const db = require('../config/database');
const { formatarTipoDoacao } = require('../utils/formatters');

class DoacaoService {
    // Métodos principais
    cadastrar(dados) {
        return new Promise((resolve, reject) => {
            const { nome, contato, tipo_doacao, preferencia_entrega } = dados;
            
            const sql = `
                INSERT INTO doacoes 
                (nome, contato, tipo_doacao, preferencia_entrega, status, data_cadastro) 
                VALUES (?, ?, ?, ?, 'pendente', CURRENT_TIMESTAMP)
            `;
            
            const params = [nome, contato, tipo_doacao, preferencia_entrega];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Buscar a doação recém cadastrada
                db.get('SELECT * FROM doacoes WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            ...row,
                            tipo_doacao_formatado: formatarTipoDoacao(row.tipo_doacao)
                        });
                    }
                });
            });
        });
    }

    listar(status, tipo, ordem) {
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
        
        sql += this._montarOrdenacao(ordem);
        
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else {
                    const doacoesFormatadas = rows.map(doacao => ({
                        ...doacao,
                        tipo_doacao_formatado: formatarTipoDoacao(doacao.tipo_doacao)
                    }));
                    resolve(doacoesFormatadas);
                }
            });
        });
    }

    alterarStatus(id, novoStatus) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE doacoes SET status = ? WHERE id = ?';
            
            db.run(sql, [novoStatus, id], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (this.changes === 0) {
                    reject(new Error('Doação não encontrada'));
                    return;
                }
                
                // Buscar a doação atualizada
                db.get('SELECT * FROM doacoes WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            ...row,
                            tipo_doacao_formatado: formatarTipoDoacao(row.tipo_doacao)
                        });
                    }
                });
            });
        });
    }

    obterEstatisticas() {
        return new Promise((resolve, reject) => {
            const queries = {
                total: 'SELECT COUNT(*) as count FROM doacoes',
                pendentes: 'SELECT COUNT(*) as count FROM doacoes WHERE status = "pendente"',
                recebidas: 'SELECT COUNT(*) as count FROM doacoes WHERE status = "recebido"',
                coletas: 'SELECT COUNT(*) as count FROM doacoes WHERE preferencia_entrega = "coleta"'
            };

            Promise.all([
                this._executarContagem(queries.total),
                this._executarContagem(queries.pendentes),
                this._executarContagem(queries.recebidas),
                this._executarContagem(queries.coletas)
            ])
            .then(([total, pendentes, recebidas, coletas]) => {
                resolve({
                    total,
                    pendentes,
                    recebidas,
                    coletas
                });
            })
            .catch(reject);
        });
    }

    // Métodos auxiliares
    _executarContagem(sql) {
        return new Promise((resolve, reject) => {
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }

    _montarOrdenacao(ordem) {
        switch (ordem) {
            case 'data_desc':
                return ' ORDER BY data_cadastro DESC';
            case 'data_asc':
                return ' ORDER BY data_cadastro ASC';
            case 'nome':
                return ' ORDER BY nome';
            default:
                return ' ORDER BY data_cadastro DESC';
        }
    }
}

module.exports = new DoacaoService();