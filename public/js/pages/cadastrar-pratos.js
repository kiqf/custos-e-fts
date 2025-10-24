// Script específico para página de cadastrar pratos
document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('pratoForm')) return;

    let insumos = [];
    let insumoIndex = 0;

    await carregarInsumos();
    await renderPratos();
    configurarModal();

    // Funções da página
    async function carregarInsumos() {
        try {
            const response = await fetch('/api/insumos');
            insumos = await response.json();
        } catch (error) {
            console.error('Erro ao carregar insumos:', error);
        }
    }

    function configurarModal() {
        Modal.configurarBotoes('pratoModal', 'cancelModal', null);
        
        document.getElementById('novoPratoBtn').addEventListener('click', () => {
            abrirModal();
        });
        
        document.getElementById('addInsumoBtn').addEventListener('click', () => {
            const container = document.getElementById('insumosContainer');
            container.appendChild(criarLinhaInsumo(insumoIndex++));
        });

        document.getElementById('pratoForm').addEventListener('submit', salvarPrato);
    }

    function abrirModal(pratoId = null) {
        Modal.abrir('pratoModal');
        
        if (pratoId) {
            document.getElementById('modalTitle').textContent = 'Editar Prato';
            carregarPrato(pratoId);
        } else {
            document.getElementById('modalTitle').textContent = 'Novo Prato';
            document.getElementById('pratoForm').reset();
            document.getElementById('pratoId').value = '';
            document.getElementById('categoriaPrato').value = '';
            document.getElementById('operacaoPrato').value = '';
            document.getElementById('insumosContainer').innerHTML = '';
            document.getElementById('addInsumoBtn').click();
        }
    }
    
    async function carregarPrato(id) {
        try {
            const response = await fetch(`/api/pratos/${id}`);
            const prato = await response.json();
            
            document.getElementById('pratoId').value = prato.id;
            document.getElementById('nomePrato').value = prato.nome;
            document.getElementById('categoriaPrato').value = prato.categoria || '';
            document.getElementById('operacaoPrato').value = prato.operacao;
            
            const container = document.getElementById('insumosContainer');
            container.innerHTML = '';
            
            if (prato.insumos && prato.insumos.length > 0) {
                prato.insumos.forEach(insumo => {
                    const linha = criarLinhaInsumo(insumoIndex++);
                    const select = linha.querySelector('select');
                    const quantidadeInput = linha.querySelector('input[name="quantidade[]"]');
                    
                    select.value = insumo.insumo_id;
                    quantidadeInput.value = insumo.quantidade;
                    container.appendChild(linha);
                });
            } else {
                document.getElementById('addInsumoBtn').click();
            }
        } catch (error) {
            alert('Erro ao carregar prato: ' + error.message);
        }
    }

    function criarLinhaInsumo(index) {
        const div = document.createElement('div');
        div.className = 'flex gap-2 mb-2 items-end insumo-linha';
        div.dataset.index = index;
        
        const selectDiv = document.createElement('div');
        selectDiv.className = 'flex-1';
        
        const select = document.createElement('select');
        select.name = 'insumo_id[]';
        select.required = true;
        select.className = 'block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione um insumo';
        select.appendChild(defaultOption);
        
        insumos.forEach(insumo => {
            const option = document.createElement('option');
            option.value = insumo.id;
            option.textContent = `${insumo.nome} (${insumo.unidade})`;
            select.appendChild(option);
        });
        
        selectDiv.appendChild(select);
        
        const quantidadeDiv = document.createElement('div');
        quantidadeDiv.className = 'w-32';
        
        const quantidadeInput = document.createElement('input');
        quantidadeInput.type = 'number';
        quantidadeInput.name = 'quantidade[]';
        quantidadeInput.required = true;
        quantidadeInput.min = '0.01';
        quantidadeInput.step = '0.01';
        quantidadeInput.placeholder = 'Qtd';
        quantidadeInput.className = 'block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500';
        
        quantidadeDiv.appendChild(quantidadeInput);
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => div.remove());
        
        div.appendChild(selectDiv);
        div.appendChild(quantidadeDiv);
        div.appendChild(removeBtn);
        
        return div;
    }

    async function salvarPrato(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nome = document.getElementById('nomePrato').value;
        const categoria = document.getElementById('categoriaPrato').value;
        const pratoId = document.getElementById('pratoId').value;
        const insumoIds = formData.getAll('insumo_id[]');
        const quantidades = formData.getAll('quantidade[]');
        
        if (insumoIds.length === 0) {
            alert('Adicione pelo menos um insumo ao prato');
            return;
        }
        
        const prato = {
            nome,
            categoria: categoria || null,
            operacao: document.getElementById('operacaoPrato').value,
            insumos: insumoIds.map((id, i) => ({
                insumo_id: id,
                quantidade: parseFloat(quantidades[i].replace(',', '.'))
            }))
        };
        
        try {
            const url = pratoId ? `/api/pratos/${pratoId}` : '/api/pratos';
            const method = pratoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prato)
            });
            
            if (response.ok) {
                alert(pratoId ? 'Prato atualizado com sucesso!' : 'Prato cadastrado com sucesso!');
                Modal.fechar('pratoModal');
                await renderPratos();
            } else {
                throw new Error('Erro ao salvar prato');
            }
        } catch (error) {
            alert('Erro ao salvar prato: ' + error.message);
        }
    }

    async function renderPratos() {
        try {
            const response = await fetch('/api/pratos');
            const pratos = await response.json();
            const lista = document.getElementById('listaPratos');
            
            if (pratos.length === 0) {
                lista.innerHTML = '<p class="text-gray-500 p-4">Nenhum prato cadastrado.</p>';
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'min-w-full divide-y divide-gray-200';
            
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-50 sticky top-0 z-10';
            thead.innerHTML = `
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumos</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operação</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
            `;
            
            const tbody = document.createElement('tbody');
            tbody.className = 'bg-white divide-y divide-gray-200';
            
            let rowIndex = 0;
            pratos.forEach(prato => {
                prato.insumos.forEach(insumo => {
                    const tr = document.createElement('tr');
                    tr.className = rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    
                    const nomeCell = document.createElement('td');
                    nomeCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
                    nomeCell.textContent = prato.nome;
                    
                    const categoriaCell = document.createElement('td');
                    categoriaCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    categoriaCell.textContent = prato.categoria || '-';
                    
                    const insumoCell = document.createElement('td');
                    insumoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    insumoCell.textContent = `${insumo.nome} (${insumo.unidade})`;
                    
                    const quantidadeCell = document.createElement('td');
                    quantidadeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    quantidadeCell.textContent = formatarRendimento(insumo.quantidade);
                    
                    const precoCell = document.createElement('td');
                    precoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    precoCell.textContent = formatarMoeda(insumo.preco);
                    
                    const operacaoCell = document.createElement('td');
                    operacaoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    operacaoCell.textContent = prato.operacao;
                    
                    const acoesCell = document.createElement('td');
                    acoesCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'text-indigo-600 hover:text-indigo-900 mr-3';
                    editBtn.textContent = 'Editar';
                    editBtn.addEventListener('click', () => {
                        abrirModal(prato.id);
                    });
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'text-red-600 hover:text-red-900 mr-3';
                    removeBtn.textContent = 'Remover Insumo';
                    removeBtn.addEventListener('click', async () => {
                        if (confirm('Tem certeza que deseja remover este insumo do prato?')) {
                            try {
                                await fetch(`/api/pratos/${prato.id}/insumos/${insumo.insumo_id}`, {
                                    method: 'DELETE'
                                });
                                await renderPratos();
                            } catch (error) {
                                alert('Erro ao remover insumo: ' + error.message);
                            }
                        }
                    });
                    
                    const deletePratoBtn = document.createElement('button');
                    deletePratoBtn.className = 'text-red-800 hover:text-red-900';
                    deletePratoBtn.textContent = 'Excluir Prato';
                    deletePratoBtn.addEventListener('click', async () => {
                        if (confirm('Tem certeza que deseja excluir este prato completamente?')) {
                            try {
                                await fetch(`/api/pratos/${prato.id}`, {
                                    method: 'DELETE'
                                });
                                await renderPratos();
                                
                                // Notificar outras páginas sobre a exclusão
                                if (window.opener && !window.opener.closed) {
                                    window.opener.postMessage({ type: 'PRATO_DELETED', pratoId: prato.id }, '*');
                                }
                                
                                // Disparar evento customizado
                                window.dispatchEvent(new CustomEvent('pratoExcluido', { detail: { pratoId: prato.id } }));
                            } catch (error) {
                                alert('Erro ao excluir prato: ' + error.message);
                            }
                        }
                    });
                    
                    acoesCell.appendChild(editBtn);
                    acoesCell.appendChild(removeBtn);
                    acoesCell.appendChild(deletePratoBtn);
                    
                    tr.appendChild(nomeCell);
                    tr.appendChild(categoriaCell);
                    tr.appendChild(insumoCell);
                    tr.appendChild(quantidadeCell);
                    tr.appendChild(precoCell);
                    tr.appendChild(operacaoCell);
                    tr.appendChild(acoesCell);
                    tbody.appendChild(tr);
                    
                    rowIndex++;
                });
            });
            
            table.appendChild(thead);
            table.appendChild(tbody);
            lista.innerHTML = '';
            lista.appendChild(table);
            
        } catch (error) {
            console.error('Erro ao carregar pratos:', error);
        }
    }
});