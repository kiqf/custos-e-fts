const express = require('express');
const path = require('path');
const InsumoRepository = require('./database/insumoRepository');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3001;

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com"]
        }
    }
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// Middleware para processar JSON
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Rotas para insumos
app.get('/api/insumos', async (req, res) => {
    try {
        const insumos = await InsumoRepository.listarTodos();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/insumos/:id', async (req, res) => {
    try {
        const insumo = await InsumoRepository.buscarPorId(req.params.id);
        if (!insumo) {
            return res.status(404).json({ error: 'Insumo não encontrado' });
        }
        res.json(insumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/insumos', async (req, res) => {
    try {
        const insumo = await InsumoRepository.criar(req.body);
        res.status(201).json(insumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/insumos/:id', async (req, res) => {
    try {
        const insumo = await InsumoRepository.atualizar(req.params.id, req.body);
        res.json(insumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/insumos/:id', async (req, res) => {
    try {
        await InsumoRepository.excluir(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota padrão para servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});