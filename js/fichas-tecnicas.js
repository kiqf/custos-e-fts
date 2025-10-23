// Script para fichas técnicas
let pratosUnicos = [];
let precosVenda = {};

document.addEventListener('DOMContentLoaded', async function() {
    await carregarFichasTecnicas();
    configurarModal();
});

function configurarModal() {
    document.getElementById('cancelPreco').addEventListener('click', () => {
        document.getElementById('precoModal').classList.add('hidden');
        document.getElementById('precoModal').classList.remove('flex');
    });
    
    document.getElementById('salvarPreco').addEventListener('click', () => {
        const pratoIndex = document.getElementById('precoInput').dataset.pratoIndex;
        const preco = parseFloat(document.getElementById('precoInput').value) || 0;
        
        precosVenda[pratoIndex] = preco;
        
        // Atualizar célula
        const celula = document.querySelector(`[data-prato-index="${pratoIndex}"]`);
        celula.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
        
        // Fechar modal
        document.getElementById('precoModal').classList.add('hidden');
        document.getElementById('precoModal').classList.remove('flex');
    });
}

function abrirModalPreco(pratoIndex) {
    const prato = pratosUnicos[pratoIndex];
    const precoAtual = precosVenda[pratoIndex] || 0;
    
    document.getElementById('nomePratoModal').textContent = prato.nome;
    document.getElementById('precoInput').value = precoAtual;
    document.getElementById('precoInput').dataset.pratoIndex = pratoIndex;
    
    document.getElementById('precoModal').classList.remove('hidden');
    document.getElementById('precoModal').classList.add('flex');
}

async function carregarFichasTecnicas() {
    try {
        // Carregar pratos com insumos
        const response = await fetch('/api/pratos');
        const pratos = await response.json();
        
        if (pratos.length === 0) {
            document.getElementById('headerSecundario').innerHTML = '<div class="px-4 flex items-center text-gray-500">Nenhum prato cadastrado</div>';
            return;
        }
        
        // Criar cabeçalho secundário com nomes únicos dos pratos
        const headerSecundario = document.getElementById('headerSecundario');
        headerSecundario.innerHTML = '';
        
        pratosUnicos = [];
        const nomesVistos = new Set();
        
        pratos.forEach(prato => {
            if (!nomesVistos.has(prato.nome)) {
                nomesVistos.add(prato.nome);
                pratosUnicos.push(prato);
            }
        });
        
        pratosUnicos.forEach(prato => {
            // Container do prato
            const pratoContainer = document.createElement('div');
            pratoContainer.className = 'flex flex-col items-center border-r';
            pratoContainer.style.width = '192px';
            
            // Nome do prato
            const divNome = document.createElement('div');
            divNome.className = 'text-center font-medium text-gray-700 whitespace-nowrap mb-1';
            divNome.textContent = prato.nome;
            
            // Container R$ e %
            const subContainer = document.createElement('div');
            subContainer.className = 'flex w-full';
            
            const divReal = document.createElement('div');
            divReal.className = 'flex-1 text-center font-medium text-gray-700 border-r';
            divReal.textContent = 'R$';
            
            const divPercent = document.createElement('div');
            divPercent.className = 'flex-1 text-center font-medium text-gray-700';
            divPercent.textContent = '%';
            
            subContainer.appendChild(divReal);
            subContainer.appendChild(divPercent);
            pratoContainer.appendChild(divNome);
            pratoContainer.appendChild(subContainer);
            headerSecundario.appendChild(pratoContainer);
        });
        
        // Criar linhas de dados (2 colunas por prato: R$, %)
        const totalColunas = pratosUnicos.length * 2;
        criarLinhaDados('linhaPrecoVenda', totalColunas);
        criarLinhaDados('linhaFrete', totalColunas);
        criarLinhaDados('linhaTaxaIfood', totalColunas);
        criarLinhaDados('linhaSimples', totalColunas);
        criarLinhaDados('linhaRoyalties', totalColunas);
        criarLinhaDados('linhaFup', totalColunas);
        criarLinhaDados('linhaTaxaCartao', totalColunas);
        criarLinhaDados('linhaTotalDeducoes', totalColunas);
        criarLinhaDados('linhaEmbalagem', totalColunas);
        criarLinhaDados('linhaDescartaveis', totalColunas);
        criarLinhaDados('linhaLacre', totalColunas);
        criarLinhaDados('linhaCustoProduto', totalColunas);
        
    } catch (error) {
        console.error('Erro ao carregar fichas técnicas:', error);
    }
}

function criarLinhaDados(elementId, totalColunas) {
    const linha = document.getElementById(elementId);
    linha.innerHTML = '';
    
    for (let i = 0; i < totalColunas; i++) {
        const div = document.createElement('div');
        const isRealColumn = i % 2 === 0;  // Coluna R$ (par)
        const isPercentColumn = i % 2 === 1; // Coluna % (ímpar)
        
        div.className = 'min-w-24 px-2 flex items-center justify-center text-gray-600 border-r text-sm';
        
        if (elementId === 'linhaPrecoVenda' && isRealColumn) {
            div.className = 'min-w-24 px-2 flex items-center justify-center text-gray-600 border-r text-sm cursor-pointer hover:bg-yellow-300 bg-yellow-100 font-medium';
            div.textContent = 'R$ 0,00';
            div.dataset.pratoIndex = Math.floor(i / 2);
            div.addEventListener('click', () => abrirModalPreco(Math.floor(i / 2)));
        } else if (elementId === 'linhaTotalDeducoes') {
            div.className += ' font-medium bg-gray-50';
            div.textContent = isPercentColumn ? '0%' : 'R$ 0,00';
        } else if (elementId === 'linhaCustoProduto') {
            div.className += ' font-medium bg-yellow-100';
            div.textContent = isPercentColumn ? '0%' : 'R$ 0,00';
        } else {
            div.textContent = isPercentColumn ? '0%' : 'R$ 0,00';
        }
        
        linha.appendChild(div);
    }
}