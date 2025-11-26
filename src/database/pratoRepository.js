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
                    'INSERT INTO pratos (id, nome, categoria, operacao, preco_venda, foto, link_documento, link_video) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [pratoId, prato.nome, prato.categoria, prato.operacao, prato.preco_venda || null, prato.foto, prato.link_documento, prato.link_video],
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
    static listarTodos(filtros = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT p.*, 
                       pi.quantidade,
                       pi.insumo_id,
                       i.nome as insumo_nome,
                       i.unidade as insumo_unidade,
                       i.preco as insumo_preco
                FROM pratos p
                LEFT JOIN prato_insumos pi ON p.id = pi.prato_id
                LEFT JOIN insumos i ON pi.insumo_id = i.id
            `;
            
            const params = [];
            const conditions = [];
            
            if (filtros.categoria) {
                conditions.push('p.categoria = ?');
                params.push(filtros.categoria);
            }
            
            if (filtros.operacao) {
                conditions.push('p.operacao = ?');
                params.push(filtros.operacao);
            }
            
            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }
            
            sql += ' ORDER BY p.nome, i.nome';
            
            db.all(sql, params, (err, rows) => {
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
                                preco_venda: row.preco_venda,
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
                        preco_venda: rows[0].preco_venda,
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

    // Atualizar preço de venda
    static atualizarPrecoVenda(id, precoVenda) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE pratos SET preco_venda = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(sql, [precoVenda, id], function(err) {
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
                    'UPDATE pratos SET nome = ?, categoria = ?, operacao = ?, preco_venda = ?, foto = ?, link_documento = ?, link_video = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [prato.nome, prato.categoria, prato.operacao, prato.preco_venda, prato.foto, prato.link_documento, prato.link_video, id],
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

    // Importar pratos via CSV
    static importarCSV(csvData) {
        return new Promise((resolve, reject) => {
            console.log('Iniciando importação CSV');
            const linhas = csvData.split('\n').filter(linha => linha.trim());
            console.log(`Total de linhas: ${linhas.length}`);
            if (linhas.length < 2) {
                return reject(new Error('CSV deve conter pelo menos cabeçalho e uma linha de dados'));
            }

            const cabecalho = linhas[0];
            const separador = cabecalho.includes(';') ? ';' : ',';
            const colunas = cabecalho.split(separador).map(col => col.trim());
            console.log('Colunas encontradas:', colunas);
            
            const pratosMap = new Map();
            const erros = [];
            let processados = 0;
            let criados = 0;

            // Processar cada linha
            for (let i = 1; i < linhas.length; i++) {
                const valores = linhas[i].split(separador).map(val => val.trim());
                console.log(`Linha ${i + 1}:`, valores);
                if (valores.length !== colunas.length) {
                    console.log(`Linha ${i + 1} ignorada: número de colunas incorreto`);
                    continue;
                }

                const linha = {};
                colunas.forEach((col, idx) => {
                    linha[col] = valores[idx];
                });
                console.log(`Dados da linha ${i + 1}:`, linha);

                const categoria = linha['Categoria de Prato'] || '';
                const nomePrato = linha['Prato'];
                const nomeInsumo = linha['Item'];
                const quantidadeStr = linha['Quantidade']?.trim() || '1';
                const quantidade = parseFloat(quantidadeStr.replace(',', '.')) || 1;
                console.log(`Quantidade processada: ${quantidade}`);
                const operacao = linha['Operação'] || linha['Operacao'] || 'Padrão';
                const unidade = linha['Unidade']?.trim() || 'KG';

                if (!nomePrato || !nomeInsumo) {
                    erros.push(`Linha ${i + 1}: prato ou insumo vazio`);
                    console.log(`Linha ${i + 1} pulada: prato='${nomePrato}', insumo='${nomeInsumo}'`);
                    continue;
                }
                console.log(`Linha ${i + 1} válida: processando...`);

                const chave = `${categoria}|${nomePrato}|${operacao}`;
                if (!pratosMap.has(chave)) {
                    console.log(`Criando prato: nome='${nomePrato}', categoria='${categoria}', operacao='${operacao}'`);
                    pratosMap.set(chave, {
                        nome: nomePrato,
                        categoria: categoria || null,
                        operacao: operacao,
                        insumos: []
                    });
                }

                pratosMap.get(chave).insumos.push({
                    nomeInsumo: nomeInsumo,
                    quantidade: quantidade
                });
                processados++;
            }
            
            console.log(`Processamento concluído. Processados: ${processados}, Pratos únicos: ${pratosMap.size}`);
            console.log('Erros encontrados:', erros);

            // Buscar insumos existentes
            db.all('SELECT id, nome FROM insumos', [], async (err, insumos) => {
                if (err) return reject(err);

                const insumosMap = new Map();
                insumos.forEach(insumo => {
                    insumosMap.set(insumo.nome.toLowerCase(), insumo.id);
                });

                // Coletar insumos únicos que precisam ser criados
                const insumosParaCriar = new Map();
                pratosMap.forEach(prato => {
                    prato.insumos.forEach(insumo => {
                        const nomeInsumo = insumo.nomeInsumo.toLowerCase();
                        if (!insumosMap.has(nomeInsumo) && !insumosParaCriar.has(nomeInsumo)) {
                            // Extrair dados do CSV para criar o insumo
                            const dadosInsumo = this.extrairDadosInsumo(csvData, insumo.nomeInsumo);
                            insumosParaCriar.set(nomeInsumo, {
                                nome: insumo.nomeInsumo,
                                unidade: dadosInsumo.unidade || 'UN',
                                preco: dadosInsumo.preco || 0,
                                rendimento: dadosInsumo.rendimento || 1
                            });
                        }
                    });
                });

                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    
                    // Criar insumos que não existem
                    let insumosCreated = 0;
                    const totalInsumosToCreate = insumosParaCriar.size;
                    
                    if (totalInsumosToCreate === 0) {
                        this.criarPratos(pratosMap, insumosMap, processados, criados, erros, resolve, reject);
                        return;
                    }
                    
                    insumosParaCriar.forEach((dadosInsumo, nomeInsumo) => {
                        const insumoId = uuidv4();
                        db.run(
                            'INSERT INTO insumos (id, nome, unidade, preco, rendimento) VALUES (?, ?, ?, ?, ?)',
                            [insumoId, dadosInsumo.nome, dadosInsumo.unidade, dadosInsumo.preco, dadosInsumo.rendimento],
                            function(err) {
                                if (err) {
                                    erros.push(`Erro ao criar insumo ${dadosInsumo.nome}: ${err.message}`);
                                } else {
                                    insumosMap.set(nomeInsumo, insumoId);
                                }
                                
                                insumosCreated++;
                                if (insumosCreated === totalInsumosToCreate) {
                                    PratoRepository.criarPratos(pratosMap, insumosMap, processados, criados, erros, resolve, reject);
                                }
                            }
                        );
                    });
                });
            });
        });
    }
    
    // Método auxiliar para extrair dados do insumo do CSV
    static extrairDadosInsumo(csvData, nomeInsumo) {
        const linhas = csvData.split('\n');
        const cabecalho = linhas[0];
        const separador = cabecalho.includes(';') ? ';' : ',';
        const colunas = cabecalho.split(separador).map(col => col.trim());
        
        for (let i = 1; i < linhas.length; i++) {
            const valores = linhas[i].split(separador).map(val => val.trim());
            const linha = {};
            colunas.forEach((col, idx) => {
                linha[col] = valores[idx];
            });
            
            if (linha['Item'] === nomeInsumo) {
                return {
                    unidade: linha['Unidade'] || 'UN',
                    preco: parseFloat((linha['Preço'] || linha['Preco'] || linha['Preço'] || '0').replace(',', '.')) || 0,
                    rendimento: parseFloat((linha['Rendimento'] || '1').replace(',', '.')) || 1
                };
            }
        }
        
        return { unidade: 'UN', preco: 0, rendimento: 1 };
    }
    
    // Método auxiliar para criar pratos
    static criarPratos(pratosMap, insumosMap, processados, criados, erros, resolve, reject) {
        let completed = 0;
        const total = pratosMap.size;
        
        if (total === 0) {
            db.run('COMMIT');
            return resolve({ processados, criados, erros });
        }

        pratosMap.forEach((prato, chave) => {
            // Mapear insumos para IDs
            const insumosValidos = [];
            prato.insumos.forEach(insumo => {
                const insumoId = insumosMap.get(insumo.nomeInsumo.toLowerCase());
                if (insumoId) {
                    insumosValidos.push({
                        insumo_id: insumoId,
                        quantidade: insumo.quantidade
                    });
                } else {
                    erros.push(`Insumo não encontrado: ${insumo.nomeInsumo}`);
                }
            });

            if (insumosValidos.length === 0) {
                completed++;
                if (completed === total) {
                    db.run('COMMIT');
                    resolve({ processados, criados, erros });
                }
                return;
            }

            const pratoId = uuidv4();
            console.log(`Inserindo prato no BD: nome='${prato.nome}', categoria='${prato.categoria}', operacao='${prato.operacao}'`);
            db.run(
                'INSERT INTO pratos (id, nome, categoria, operacao) VALUES (?, ?, ?, ?)',
                [pratoId, prato.nome, prato.categoria, prato.operacao],
                function(err) {
                    if (err) {
                        console.error(`Erro ao inserir prato ${prato.nome}:`, err);
                        erros.push(`Erro ao criar prato ${prato.nome}: ${err.message}`);
                        completed++;
                        if (completed === total) {
                            db.run('COMMIT');
                            resolve({ processados, criados, erros });
                        }
                        return;
                    }
                    console.log(`Prato ${prato.nome} inserido com sucesso`);

                    let insumoCompleted = 0;
                    const insumoTotal = insumosValidos.length;

                    insumosValidos.forEach(insumo => {
                        const insumoRelId = uuidv4();
                        db.run(
                            'INSERT INTO prato_insumos (id, prato_id, insumo_id, quantidade) VALUES (?, ?, ?, ?)',
                            [insumoRelId, pratoId, insumo.insumo_id, insumo.quantidade],
                            function(err) {
                                if (err) {
                                    erros.push(`Erro ao adicionar insumo ao prato ${prato.nome}: ${err.message}`);
                                }
                                
                                insumoCompleted++;
                                if (insumoCompleted === insumoTotal) {
                                    criados++;
                                    completed++;
                                    if (completed === total) {
                                        db.run('COMMIT');
                                        resolve({ processados, criados, erros });
                                    }
                                }
                            }
                        );
                    });
                }
            );
        });
    }

    // Listar categorias únicas
    static listarCategorias() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT DISTINCT categoria FROM pratos WHERE categoria IS NOT NULL ORDER BY categoria';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.categoria));
                }
            });
        });
    }

    // Listar operações únicas
    static listarOperacoes() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT DISTINCT operacao FROM pratos ORDER BY operacao';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.operacao));
                }
            });
        });
    }
}

module.exports = PratoRepository;