function normalizar(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    return texto
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, ' ')
        .trim();
}

function compararNomes(nome1, nome2) {
    return normalizar(nome1) === normalizar(nome2);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizar, compararNomes };
} else {
    window.normalizar = normalizar;
    window.compararNomes = compararNomes;
}