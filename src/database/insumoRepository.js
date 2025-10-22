const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class InsumoRepository {
    // Inserir um novo insumo
    static criar(insumo) {
        return new Promise((resolve, reject) => {
            const id = uuidv4();
            const sql = `INSERT INTO insumos (id, nome, unidade, preco, rendimento) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [id, insumo.nome, insumo.unidade, insumo.preco, insumo.rendimento], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, ...insumo });
                }
            });
        });
    }

    // Listar todos os insumos
    static listarTodos() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM insumos ORDER BY nome`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Buscar um insumo por ID
    static buscarPorId(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM insumos WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Atualizar um insumo
    static atualizar(id, insumo) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE insumos 
                        SET nome = ?, unidade = ?, preco = ?, rendimento = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?`;
            db.run(sql, [insumo.nome, insumo.unidade, insumo.preco, insumo.rendimento, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, ...insumo });
                }
            });
        });
    }

    // Excluir um insumo
    static excluir(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM insumos WHERE id = ?`;
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

module.exports = InsumoRepository;