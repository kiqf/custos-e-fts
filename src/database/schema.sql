-- Criação da tabela de insumos
CREATE TABLE IF NOT EXISTS insumos (
    id TEXT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    unidade VARCHAR(10) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    rendimento INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de pratos
CREATE TABLE IF NOT EXISTS pratos (
    id TEXT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    operacao VARCHAR(100) NOT NULL,
    preco_venda DECIMAL(10,2),
    foto TEXT,
    link_documento TEXT,
    link_video TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Criação da tabela de relacionamento prato-insumo
CREATE TABLE IF NOT EXISTS prato_insumos (
    id TEXT PRIMARY KEY,
    prato_id TEXT NOT NULL,
    insumo_id TEXT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
);