// Utilitários para validação de campos
function validarPreco(preco) {
    const regex = /^\d+[,]\d{1,2}$|^\d+$/;
    return regex.test(preco);
}

function limparPreco(preco) {
    return preco.replace(/[^0-9,.]/g, '').replace(/(,.*?),/g, '$1');
}

function validarRendimento(rendimento) {
    return !isNaN(rendimento) && rendimento > 0;
}