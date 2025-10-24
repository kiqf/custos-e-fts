document.addEventListener('DOMContentLoaded', async function() {
    let pratos = [];
    let precos = {};

    await carregarPratos();
    renderizarTabela();
    configurarModal();

    async function carregarPratos() {
        try {
            const response = await fetch('/api/pratos');
            pratos = await response.json();
        } catch (error) {
            console.error('Erro ao carregar pratos:', error);
        }
    }

    function renderizarTabela() {
        if (pratos.length === 0) {
            document.getElementById('headerSecundario').innerHTML = '<p class="text-gray-500 p-4">Nenhum prato cadastrado.</p>';
            return;
        }

        renderizarCabecalho();
        renderizarLinhas();
    }

    function renderizarCabecalho() {
        const header = document.getElementById('headerSecundario');
        header.innerHTML = '';

        pratos.forEach(prato => {
            const pratoContainer = document.createElement('div');
            pratoContainer.className = 'flex-shrink-0 w-40 border-r';
            
            const nomeDiv = document.createElement('div');
            nomeDiv.className = 'text-xs font-medium text-gray-700 text-center py-1 border-b';
            nomeDiv.textContent = prato.nome;
            
            const subHeader = document.createElement('div');
            subHeader.className = 'flex';
            
            const realDiv = document.createElement('div');
            realDiv.className = 'flex-1 text-xs text-gray-500 text-center py-1 border-r';
            realDiv.textContent = '$';
            
            const percDiv = document.createElement('div');
            percDiv.className = 'flex-1 text-xs text-gray-500 text-center py-1';
            percDiv.textContent = '%';
            
            subHeader.appendChild(realDiv);
            subHeader.appendChild(percDiv);
            
            pratoContainer.appendChild(nomeDiv);
            pratoContainer.appendChild(subHeader);
            header.appendChild(pratoContainer);
        });
    }

    function renderizarLinhas() {
        renderizarLinhaPrecoVenda();
        renderizarLinhaFrete();
        renderizarLinhasTaxas();
        renderizarLinhasCustos();
    }

    function renderizarLinhaPrecoVenda() {
        const linha = document.getElementById('linhaPrecoVenda');
        linha.innerHTML = '';

        pratos.forEach(prato => {
            // Coluna R$
            const cellReal = document.createElement('div');
            cellReal.className = 'flex-shrink-0 w-20 px-1 h-8 flex items-center justify-center text-sm cursor-pointer hover:bg-yellow-100 border-r';
            cellReal.textContent = precos[prato.id] ? formatarMoeda(precos[prato.id]) : '-';
            cellReal.addEventListener('click', () => abrirModalPreco(prato));
            
            // Coluna %
            const cellPerc = document.createElement('div');
            cellPerc.className = 'flex-shrink-0 w-20 px-1 h-8 flex items-center justify-center text-sm';
            cellPerc.textContent = '-';
            
            linha.appendChild(cellReal);
            linha.appendChild(cellPerc);
        });
    }

    function renderizarLinhaFrete() {
        const linha = document.getElementById('linhaFrete');
        linha.innerHTML = '';

        pratos.forEach(() => {
            // Coluna R$
            const cellReal = document.createElement('div');
            cellReal.className = 'flex-shrink-0 w-20 px-1 h-8 flex items-center justify-center text-sm border-r';
            cellReal.textContent = '-';
            
            // Coluna %
            const cellPerc = document.createElement('div');
            cellPerc.className = 'flex-shrink-0 w-20 px-1 h-8 flex items-center justify-center text-sm';
            cellPerc.textContent = '-';
            
            linha.appendChild(cellReal);
            linha.appendChild(cellPerc);
        });
    }

    function renderizarLinhasTaxas() {
        const linhas = ['linhaTaxaIfood', 'linhaSimples', 'linhaRoyalties', 'linhaFup', 'linhaTaxaCartao', 'linhaTotalDeducoes'];
        
        linhas.forEach(linhaId => {
            const linha = document.getElementById(linhaId);
            linha.innerHTML = '';

            pratos.forEach(() => {
                const pratoContainer = document.createElement('div');
                pratoContainer.className = 'flex-shrink-0 w-40 border-r flex';
                
                const cellReal = document.createElement('div');
                cellReal.className = 'flex-1 h-8 flex items-center justify-center text-sm border-r';
                cellReal.textContent = '-';
                
                const cellPerc = document.createElement('div');
                cellPerc.className = 'flex-1 h-8 flex items-center justify-center text-sm';
                cellPerc.textContent = '-';
                
                pratoContainer.appendChild(cellReal);
                pratoContainer.appendChild(cellPerc);
                linha.appendChild(pratoContainer);
            });
        });
    }

    function renderizarLinhasCustos() {
        const linhas = ['linhaEmbalagem', 'linhaDescartaveis', 'linhaLacre', 'linhaCustoProduto'];
        
        linhas.forEach(linhaId => {
            const linha = document.getElementById(linhaId);
            linha.innerHTML = '';

            pratos.forEach(() => {
                const pratoContainer = document.createElement('div');
                pratoContainer.className = 'flex-shrink-0 w-40 border-r flex';
                
                const cellReal = document.createElement('div');
                cellReal.className = 'flex-1 h-8 flex items-center justify-center text-sm border-r';
                cellReal.textContent = '-';
                
                const cellPerc = document.createElement('div');
                cellPerc.className = 'flex-1 h-8 flex items-center justify-center text-sm';
                cellPerc.textContent = '-';
                
                pratoContainer.appendChild(cellReal);
                pratoContainer.appendChild(cellPerc);
                linha.appendChild(pratoContainer);
            });
        });
    }

    function configurarModal() {
        Modal.configurarBotoes('precoModal', 'cancelPreco', null);
        
        document.getElementById('salvarPreco').addEventListener('click', salvarPreco);
    }

    function abrirModalPreco(prato) {
        document.getElementById('nomePratoModal').textContent = prato.nome;
        document.getElementById('precoInput').value = precos[prato.id] || '';
        document.getElementById('precoInput').dataset.pratoId = prato.id;
        Modal.abrir('precoModal');
    }

    function salvarPreco() {
        const input = document.getElementById('precoInput');
        const pratoId = input.dataset.pratoId;
        const preco = parseFloat(input.value);

        if (preco > 0) {
            precos[pratoId] = preco;
            renderizarLinhaPrecoVenda();
            Modal.fechar('precoModal');
        }
    }
});