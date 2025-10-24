const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class PratoRepository {
    // Criar um novo prato com seus insumos
    static criar(prato) {
        return new Promise((resolve, reject) => {
            const pratoId = uuidv4();
            
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                // Inserir prato
                db.run(
                    'INSERT INTO pratos (id, nome, categoria, operacao) VALUES (?, ?, ?, ?)',
                    [pratoId, prato.nome, prato.categoria, prato.operacao],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        
                        // Inserir insumos do prato
                        let completed = 0;
                        const total = prato.insumos.length;
                        
                        prato.insumos.forEach(insumo => {
                            const insumoId = uuidv4();
                            db.run(
                                'INSERT INTO prato_insumos (id, prato_id, insumo_id, quantidade) VALUES (?, ?, ?, ?)',
                                [insumoId, pratoId, insumo.insumo_id, insumo.quantidade],
                                function(err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
                                    
                                    completed++;
                                    if (completed === total) {
                                        db.run('COMMIT');
                                        resolve({ id: pratoId, ...prato });
                                    }
                                }
                            );
                        });
                    }
                );
            });
        });
    }

    // Listar todos os pratos
    static listarTodos() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       pi.quantidade,
                       pi.insumo_id,
                       i.nome as insumo_nome,
                       i.unidade as insumo_unidade,
                       i.preco as insumo_preco
                FROM pratos p
                LEFT JOIN prato_insumos pi ON p.id = pi.prato_id
                LEFT JOIN insumos i ON pi.insumo_id = i.id
                ORDER BY p.nome, i.nome
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Agrupar insumos por prato
                    const pratos = {};
                    rows.forEach(row => {
                        if (!pratos[row.id]) {
                            pratos[row.id] = {
                                id: row.id,
                                nome: row.nome,
                                categoria: row.categoria,
                                operacao: row.operacao,
                                created_at: row.created_at,
                                updated_at: row.updated_at,
                                insumos: []
                            };
                        }
                        
                        if (row.insumo_nome) {
                            pratos[row.id].insumos.push({
                                insumo_id: row.insumo_id,
                                nome: row.insumo_nome,
                                unidade: row.insumo_unidade,
                                preco: row.insumo_preco,
                                quantidade: row.quantidade
                            });
                        }
                    });
                    
                    resolve(Object.values(pratos));
                }
            });
        });
    }

    // Buscar prato por ID
    static buscarPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       pi.quantidade,
                       pi.insumo_id,
                       i.nome as insumo_nome,
                       i.unidade as insumo_unidade,
                       i.preco as insumo_preco
                FROM pratos p
                LEFT JOIN prato_insumos pi ON p.id = pi.prato_id
                LEFT JOIN insumos i ON pi.insumo_id = i.id
                WHERE p.id = ?
                ORDER BY i.nome
            `;
            
            db.all(sql, [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (rows.length === 0) {
                    resolve(null);
                } else {
                    const prato = {
                        id: rows[0].id,
                        nome: rows[0].nome,
                        categoria: rows[0].categoria,
                        operacao: rows[0].operacao,
                        created_at: rows[0].created_at,
                        updated_at: rows[0].updated_at,
                        insumos: []
                    };
                    
                    rows.forEach(row => {
                        if (row.insumo_nome) {
                            prato.insumos.push({
                                insumo_id: row.insumo_id,
                                nome: row.insumo_nome,
                                unidade: row.insumo_unidade,
                                preco: row.insumo_preco,
                                quantidade: row.quantidade
                            });
                        }
                    });
                    
                    resolve(prato);
                }
            });
        });
    }

    // Atualizar quantidade de insumo
    static atualizarQuantidadeInsumo(pratoId, insumoId, quantidade) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE prato_insumos SET quantidade = ? WHERE prato_id = ? AND insumo_id = ?';
            db.run(sql, [quantidade, pratoId, insumoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // Remover insumo de um prato
    static removerInsumo(pratoId, insumoId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM prato_insumos WHERE prato_id = ? AND insumo_id = ?';
            db.run(sql, [pratoId, insumoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // Atualizar prato
    static atualizar(id, prato) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                // Atualizar prato
                db.run(
                    'UPDATE pratos SET nome = ?, categoria = ?, operacao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [prato.nome, prato.categoria, prato.operacao, id],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        
                        // Remover insumos existentes
                        db.run('DELETE FROM prato_insumos WHERE prato_id = ?', [id], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            
                            // Inserir novos insumos
                            let completed = 0;
                            const total = prato.insumos.length;
                            
                            if (total === 0) {
                                db.run('COMMIT');
                                return resolve({ id, ...prato });
                            }
                            
                            prato.insumos.forEach(insumo => {
                                const { v4: uuidv4 } = require('uuid');
                                const insumoId = uuidv4();
                                db.run(
                                    'INSERT INTO prato_insumos (id, prato_id, insumo_id, quantidade) VALUES (?, ?, ?, ?)',
                                    [insumoId, id, insumo.insumo_id, insumo.quantidade],
                                    function(err) {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return reject(err);
                                        }
                                        
                                        completed++;
                                        if (completed === total) {
                                            db.run('COMMIT');
                                            resolve({ id, ...prato });
                                        }
                                    }
                                );
                            });
                        });
                    }
                );
            });
        });
    }

    // Excluir prato
    static excluir(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM pratos WHERE id = ?';
            db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

module.exports = PratoRepository;