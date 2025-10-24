/**
 * Calcula taxas baseadas no preço de venda
 */

// Taxas padrão
const TAXAS = {
    IFOOD: 0.22,      // 22%
    SIMPLES: 0.11,    // 11%
    ROYALTIES: 0.04,  // 4%
    FUP: 0.01,        // 1%
    CARTAO: 0.035     // 3.5% (estimativa padrão)
};

/**
 * Calcula Taxa iFood (22%)
 */
function calcularTaxaIfood(precoVenda) {
    return precoVenda * TAXAS.IFOOD;
}

/**
 * Calcula Simples Nacional (11%)
 */
function calcularSimples(precoVenda) {
    return precoVenda * TAXAS.SIMPLES;
}

/**
 * Calcula Royalties (4%)
 */
function calcularRoyalties(precoVenda) {
    return precoVenda * TAXAS.ROYALTIES;
}

/**
 * Calcula FUP (1%)
 */
function calcularFup(precoVenda) {
    return precoVenda * TAXAS.FUP;
}

/**
 * Calcula Taxa de Cartão (3.5%)
 */
function calcularTaxaCartao(precoVenda) {
    return precoVenda * TAXAS.CARTAO;
}

/**
 * Calcula total de deduções de venda
 */
function calcularTotalDeducoes(precoVenda) {
    return calcularTaxaIfood(precoVenda) + 
           calcularSimples(precoVenda) + 
           calcularRoyalties(precoVenda) + 
           calcularFup(precoVenda);
}

/**
 * Calcula todas as taxas de uma vez
 */
function calcularTodasTaxas(precoVenda) {
    return {
        ifood: {
            reais: calcularTaxaIfood(precoVenda),
            percentual: TAXAS.IFOOD * 100
        },
        simples: {
            reais: calcularSimples(precoVenda),
            percentual: TAXAS.SIMPLES * 100
        },
        royalties: {
            reais: calcularRoyalties(precoVenda),
            percentual: TAXAS.ROYALTIES * 100
        },
        fup: {
            reais: calcularFup(precoVenda),
            percentual: TAXAS.FUP * 100
        },
        cartao: {
            reais: calcularTaxaCartao(precoVenda),
            percentual: TAXAS.CARTAO * 100
        },
        totalDeducoes: {
            reais: calcularTotalDeducoes(precoVenda),
            percentual: (TAXAS.IFOOD + TAXAS.SIMPLES + TAXAS.ROYALTIES + TAXAS.FUP) * 100
        }
    };
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calcularTaxaIfood,
        calcularSimples,
        calcularRoyalties,
        calcularFup,
        calcularTaxaCartao,
        calcularTotalDeducoes,
        calcularTodasTaxas,
        TAXAS
    };
}