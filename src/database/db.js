const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        
        // Ler e executar o arquivo schema.sql
        const fs = require('fs');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        db.exec(schema, (err) => {
            if (err) {
                console.error('Erro ao criar tabelas:', err);
            } else {
                console.log('Tabelas criadas com sucesso');
            }
        });
    }
});

module.exports = db;