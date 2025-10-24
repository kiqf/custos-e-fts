// Utilitários para formatação de moeda
function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function converterMoeda(valorString) {
    return Number(valorString.replace(',', '.')) || 0;
}

function formatarRendimento(valor) {
    return Number(valor).toString().replace('.', ',');
}