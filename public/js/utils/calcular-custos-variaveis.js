/**
 * Calcula custos variáveis baseados no preço de venda
 */

// Custos variáveis padrão
const CUSTOS_VARIAVEIS = {
    EMBALAGEM_ECONOMICA: 1.76,
    SACO_PAPEL_KRAFT: 0.48,
    GUARDANAPO: 0.09,
    SAL_SACHE: 0.01,
    TALHERES_PLASTICO: 0.19,
    PALITO: 0.01,
    LACRE: 0.02,
    FRETE: 0
};

/**
 * Calcula custo de Embalagem + Saco
 */
function calcularEmbalagemSaco() {
    return CUSTOS_VARIAVEIS.EMBALAGEM_ECONOMICA + CUSTOS_VARIAVEIS.SACO_PAPEL_KRAFT;
}

/**
 * Calcula Outros Descartáveis
 */
function calcularOutrosDescartaveis() {
    return CUSTOS_VARIAVEIS.GUARDANAPO + 
           CUSTOS_VARIAVEIS.SAL_SACHE + 
           CUSTOS_VARIAVEIS.TALHERES_PLASTICO + 
           CUSTOS_VARIAVEIS.PALITO;
}

/**
 * Calcula custo do Lacre (Lacre * 3)
 */
function calcularLacre() {
    return CUSTOS_VARIAVEIS.LACRE * 3;
}

/**
 * Calcula total de custos variáveis
 */
function calcularTotalCustosVariaveis() {
    return calcularEmbalagemSaco() + 
           calcularOutrosDescartaveis() + 
           calcularLacre() + 
           CUSTOS_VARIAVEIS.FRETE;
}

/**
 * Calcula todos os custos variáveis com percentuais
 */
function calcularTodosCustosVariaveis(precoVenda) {
    const embalagemSaco = calcularEmbalagemSaco();
    const outrosDescartaveis = calcularOutrosDescartaveis();
    const lacre = calcularLacre();
    const total = calcularTotalCustosVariaveis();

    return {
        embalagemSaco: {
            reais: embalagemSaco,
            percentual: (embalagemSaco / precoVenda) * 100
        },
        outrosDescartaveis: {
            reais: outrosDescartaveis,
            percentual: (outrosDescartaveis / precoVenda) * 100
        },
        lacre: {
            reais: lacre,
            percentual: (lacre / precoVenda) * 100
        },
        frete: {
            reais: CUSTOS_VARIAVEIS.FRETE,
            percentual: (CUSTOS_VARIAVEIS.FRETE / precoVenda) * 100
        },
        total: {
            reais: total,
            percentual: (total / precoVenda) * 100
        }
    };
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calcularEmbalagemSaco,
        calcularOutrosDescartaveis,
        calcularLacre,
        calcularTotalCustosVariaveis,
        calcularTodosCustosVariaveis,
        CUSTOS_VARIAVEIS
    };
}