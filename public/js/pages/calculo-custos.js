document.addEventListener('DOMContentLoaded', async function() {
    let pratos = [];
    let precos = {};
    let filtrosAtuais = {};

    await Filtros.criarFiltros('filtrosContainer', aplicarFiltros);
    await carregarPratos();
    renderizarTabela();
    configurarModal();
    
    async function aplicarFiltros(filtros) {
        filtrosAtuais = filtros;
        await carregarPratos();
        renderizarTabela();
    }
    
    // Escutar eventos de exclusão de pratos
    window.addEventListener('pratoExcluido', async (event) => {
        const pratoId = event.detail.pratoId;
        delete precos[pratoId];
        await carregarPratos();
        renderizarTabela();
    });
    
    window.addEventListener('message', async (event) => {
        if (event.data.type === 'PRATO_DELETED') {
            const pratoId = event.data.pratoId;
            delete precos[pratoId];
            await carregarPratos();
            renderizarTabela();
        }
    });

    async function carregarPratos() {
        try {
            const params = new URLSearchParams();
            if (filtrosAtuais.categoria) params.append('categoria', filtrosAtuais.categoria);
            if (filtrosAtuais.operacao) params.append('operacao', filtrosAtuais.operacao);
            
            const [pratosResponse, insumosResponse] = await Promise.all([
                fetch(`/api/pratos?${params}`),
                fetch('/api/insumos')
            ]);
            pratos = await pratosResponse.json();
            const insumos = await insumosResponse.json();
            
            // Calcular custo de cada prato e carregar preços
            pratos.forEach(prato => {
                let custoTotal = 0;
                prato.insumos.forEach(insumo => {
                    const insumoCompleto = insumos.find(i => i.id === insumo.insumo_id);
                    if (insumoCompleto) {
                        const fcValue = 1 / parseFloat(insumoCompleto.rendimento);
                        const quantBruta = fcValue * parseFloat(insumo.quantidade);
                        const valorTotal = quantBruta * parseFloat(insumo.preco);
                        custoTotal += valorTotal;
                    }
                });
                prato.custoProduto = custoTotal;
                
                // Carregar preço de venda do banco
                if (prato.preco_venda) {
                    precos[prato.id] = parseFloat(prato.preco_venda);
                }
            });
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
        const linhas = ['linhaTaxaIfood', 'linhaSimples', 'linhaRoyalties', 'linhaFup', 'linhaTotalDeducoes', 'linhaFaturamentoLiquido'];
        
        linhas.forEach(linhaId => {
            const linha = document.getElementById(linhaId);
            linha.innerHTML = '';

            pratos.forEach(prato => {
                const pratoContainer = document.createElement('div');
                pratoContainer.className = 'flex-shrink-0 w-40 border-r flex';
                
                const cellReal = document.createElement('div');
                cellReal.className = 'flex-1 h-8 flex items-center justify-center text-sm border-r';
                
                const cellPerc = document.createElement('div');
                cellPerc.className = 'flex-1 h-8 flex items-center justify-center text-sm';
                
                if (precos[prato.id]) {
                    const precoVenda = precos[prato.id];
                    let taxaReal = 0;
                    let taxaPerc = 0;
                    
                    switch(linhaId) {
                        case 'linhaTaxaIfood':
                            taxaReal = calcularTaxaIfood(precoVenda);
                            taxaPerc = TAXAS.IFOOD * 100;
                            break;
                        case 'linhaSimples':
                            taxaReal = calcularSimples(precoVenda);
                            taxaPerc = TAXAS.SIMPLES * 100;
                            break;
                        case 'linhaRoyalties':
                            taxaReal = calcularRoyalties(precoVenda);
                            taxaPerc = TAXAS.ROYALTIES * 100;
                            break;
                        case 'linhaFup':
                            taxaReal = calcularFup(precoVenda);
                            taxaPerc = TAXAS.FUP * 100;
                            break;

                        case 'linhaTotalDeducoes':
                            taxaReal = calcularTotalDeducoes(precoVenda);
                            taxaPerc = (TAXAS.IFOOD + TAXAS.SIMPLES + TAXAS.ROYALTIES + TAXAS.FUP) * 100;
                            break;
                        case 'linhaFaturamentoLiquido':
                            taxaReal = precoVenda - calcularTotalDeducoes(precoVenda);
                            taxaPerc = (taxaReal / precoVenda) * 100;
                            break;
                        default:
                            taxaReal = 0;
                            taxaPerc = 0;
                    }
                    
                    if (taxaReal > 0) {
                        cellReal.textContent = formatarMoeda(taxaReal);
                        cellPerc.textContent = taxaPerc.toFixed(2).replace('.', ',') + '%';
                    } else {
                        cellReal.textContent = '-';
                        cellPerc.textContent = '-';
                    }
                } else {
                    cellReal.textContent = '-';
                    cellPerc.textContent = '-';
                }
                
                pratoContainer.appendChild(cellReal);
                pratoContainer.appendChild(cellPerc);
                linha.appendChild(pratoContainer);
            });
        });
    }

    function renderizarLinhasCustos() {
        const linhas = ['linhaEmbalagem', 'linhaDescartaveis', 'linhaLacre', 'linhaCustoProduto', 'linhaCmvTotal', 'linhaLucroBruto'];
        
        linhas.forEach(linhaId => {
            const linha = document.getElementById(linhaId);
            linha.innerHTML = '';

            pratos.forEach(prato => {
                const pratoContainer = document.createElement('div');
                pratoContainer.className = 'flex-shrink-0 w-40 border-r flex';
                
                const cellReal = document.createElement('div');
                cellReal.className = 'flex-1 h-8 flex items-center justify-center text-sm border-r';
                
                const cellPerc = document.createElement('div');
                cellPerc.className = 'flex-1 h-8 flex items-center justify-center text-sm';
                
                if (precos[prato.id]) {
                    const precoVenda = precos[prato.id];
                    const custosVariaveis = calcularTodosCustosVariaveis(precoVenda);
                    
                    switch(linhaId) {
                        case 'linhaEmbalagem':
                            cellReal.textContent = formatarMoeda(custosVariaveis.embalagemSaco.reais);
                            cellPerc.textContent = custosVariaveis.embalagemSaco.percentual.toFixed(2).replace('.', ',') + '%';
                            break;
                        case 'linhaDescartaveis':
                            cellReal.textContent = formatarMoeda(custosVariaveis.outrosDescartaveis.reais);
                            cellPerc.textContent = custosVariaveis.outrosDescartaveis.percentual.toFixed(2).replace('.', ',') + '%';
                            break;
                        case 'linhaLacre':
                            cellReal.textContent = formatarMoeda(custosVariaveis.lacre.reais);
                            cellPerc.textContent = custosVariaveis.lacre.percentual.toFixed(2).replace('.', ',') + '%';
                            break;
                        case 'linhaCustoProduto':
                            cellReal.textContent = formatarMoeda(prato.custoProduto || 0);
                            if (precoVenda > 0) {
                                const percentualCusto = (prato.custoProduto / precoVenda) * 100;
                                cellPerc.textContent = percentualCusto.toFixed(2).replace('.', ',') + '%';
                            } else {
                                cellPerc.textContent = '-';
                            }
                            break;
                        case 'linhaCmvTotal':
                            const cmvTotal = custosVariaveis.embalagemSaco.reais + custosVariaveis.outrosDescartaveis.reais + custosVariaveis.lacre.reais + (prato.custoProduto || 0) + custosVariaveis.frete.reais;
                            cellReal.textContent = formatarMoeda(cmvTotal);
                            const percentualCmv = (cmvTotal / precoVenda) * 100;
                            cellPerc.textContent = percentualCmv.toFixed(2).replace('.', ',') + '%';
                            break;
                        case 'linhaLucroBruto':
                            const faturamentoLiquido = precoVenda - calcularTotalDeducoes(precoVenda);
                            const cmvTotalCalc = custosVariaveis.embalagemSaco.reais + custosVariaveis.outrosDescartaveis.reais + custosVariaveis.lacre.reais + (prato.custoProduto || 0) + custosVariaveis.frete.reais;
                            const lucroBruto = faturamentoLiquido - cmvTotalCalc;
                            const percentualLucro = (lucroBruto / precoVenda) * 100;
                            
                            cellReal.textContent = formatarMoeda(lucroBruto);
                            cellPerc.textContent = percentualLucro.toFixed(2).replace('.', ',') + '%';
                            
                            const cor = lucroBruto >= 0 ? 'text-green-600' : 'text-red-600';
                            cellReal.className = cellReal.className.replace(/text-\w+-\d+/, '') + ' ' + cor;
                            cellPerc.className = cellPerc.className.replace(/text-\w+-\d+/, '') + ' ' + cor;
                            break;
                    }
                } else {
                    cellReal.textContent = '-';
                    cellPerc.textContent = '-';
                }
                
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

    async function salvarPreco() {
        const input = document.getElementById('precoInput');
        const pratoId = input.dataset.pratoId;
        const preco = parseFloat(input.value);

        if (preco > 0) {
            try {
                await fetch(`/api/pratos/${pratoId}/preco`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ preco_venda: preco })
                });
                
                precos[pratoId] = preco;
                renderizarLinhaPrecoVenda();
                renderizarLinhasTaxas();
                renderizarLinhasCustos();
                Modal.fechar('precoModal');
            } catch (error) {
                console.error('Erro ao salvar preço:', error);
                alert('Erro ao salvar preço. Tente novamente.');
            }
        }
    }
});