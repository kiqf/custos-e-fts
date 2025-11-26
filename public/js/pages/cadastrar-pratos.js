// Script específico para página de cadastrar pratos
document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('pratoForm')) return;

    let insumos = [];
    let insumoIndex = 0;

    await carregarInsumos();
    configurarModal();
    await renderPratos();
    await Filtros.criarFiltros('filtrosContainer', aplicarFiltros);

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
        
        document.getElementById('importPratoBtn').addEventListener('click', () => {
            Modal.abrir('importModal');
        });
        
        setTimeout(() => {
            Modal.configurarBotoes('importModal', 'cancelImportPrato', null);
            document.getElementById('processImportPrato').addEventListener('click', () => {
                document.getElementById('csvFilePrato').click();
            });
        }, 100);
        
        document.getElementById('csvFilePrato').addEventListener('change', importarCSV);
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

    let filtrosAtuais = {};
    
    async function aplicarFiltros(filtros) {
        filtrosAtuais = filtros;
        await renderPratos();
    }

    async function renderPratos() {
        try {
            const params = new URLSearchParams();
            if (filtrosAtuais.categoria) params.append('categoria', filtrosAtuais.categoria);
            if (filtrosAtuais.operacao) params.append('operacao', filtrosAtuais.operacao);
            
            const response = await fetch(`/api/pratos?${params}`);
            const pratos = await response.json();
            const lista = document.getElementById('listaPratos');
            
            if (pratos.length === 0) {
                lista.innerHTML = '<p class="text-gray-500 p-4">Nenhum prato cadastrado.</p>';
                return;
            }
            
            lista.innerHTML = '';
            
            pratos.forEach(prato => {
                const pratoDiv = document.createElement('div');
                pratoDiv.className = 'border border-gray-200 rounded-lg p-4 mb-4 bg-white';
                
                const header = document.createElement('div');
                header.className = 'flex justify-between items-start mb-3';
                
                const infoDiv = document.createElement('div');
                
                const nomeH3 = document.createElement('h3');
                nomeH3.className = 'text-lg font-semibold text-gray-900';
                nomeH3.textContent = prato.nome;
                
                const metaDiv = document.createElement('div');
                metaDiv.className = 'text-sm text-gray-600 mt-1';
                metaDiv.innerHTML = `
                    <span class="mr-4">Categoria: ${prato.categoria || 'Não informada'}</span>
                    <span>Operação: ${prato.operacao}</span>
                `;
                
                infoDiv.appendChild(nomeH3);
                infoDiv.appendChild(metaDiv);
                
                const acoesDiv = document.createElement('div');
                acoesDiv.className = 'flex gap-2';
                
                const editBtn = document.createElement('button');
                editBtn.className = 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm';
                editBtn.textContent = 'Editar';
                editBtn.addEventListener('click', () => abrirModal(prato.id));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm';
                deleteBtn.textContent = 'Excluir Prato';
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Tem certeza que deseja excluir este prato completamente?')) {
                        try {
                            await fetch(`/api/pratos/${prato.id}`, { method: 'DELETE' });
                            await renderPratos();
                            
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage({ type: 'PRATO_DELETED', pratoId: prato.id }, '*');
                            }
                            
                            window.dispatchEvent(new CustomEvent('pratoExcluido', { detail: { pratoId: prato.id } }));
                        } catch (error) {
                            alert('Erro ao excluir prato: ' + error.message);
                        }
                    }
                });
                
                acoesDiv.appendChild(editBtn);
                acoesDiv.appendChild(deleteBtn);
                
                header.appendChild(infoDiv);
                header.appendChild(acoesDiv);
                
                const insumosDiv = document.createElement('div');
                insumosDiv.className = 'border-t pt-3';
                
                const insumosTitle = document.createElement('h4');
                insumosTitle.className = 'text-sm font-medium text-gray-700 mb-2';
                insumosTitle.textContent = 'Insumos:';
                
                const insumosList = document.createElement('div');
                insumosList.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2';
                
                prato.insumos.forEach(insumo => {
                    const insumoItem = document.createElement('div');
                    insumoItem.className = 'bg-gray-50 p-2 rounded text-sm';
                    insumoItem.innerHTML = `
                        <div class="font-medium">${insumo.nome}</div>
                        <div class="text-gray-600">${formatarRendimento(insumo.quantidade)} ${insumo.unidade} - ${formatarMoeda(insumo.preco)}</div>
                    `;
                    insumosList.appendChild(insumoItem);
                });
                
                insumosDiv.appendChild(insumosTitle);
                insumosDiv.appendChild(insumosList);
                
                pratoDiv.appendChild(header);
                pratoDiv.appendChild(insumosDiv);
                
                lista.appendChild(pratoDiv);
            });
            
        } catch (error) {
            console.error('Erro ao carregar pratos:', error);
        }
    }
    
    async function importarCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        showLoading(true);
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const csvData = e.target.result;
                
                const response = await fetch('/api/pratos/importar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csvData })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    let mensagem = `Importação concluída! Linhas processadas: ${result.processados}, Pratos criados: ${result.criados}`;
                    
                    if (result.erros.length > 0) {
                        mensagem += `. Erros encontrados: ${result.erros.length}`;
                    }
                    
                    showNotification(mensagem, 'success');
                    Modal.fechar('importModal');
                    await renderPratos();
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                showNotification('Erro ao importar CSV: ' + error.message, 'error');
            } finally {
                showLoading(false);
            }
        };
        
        reader.readAsText(file, 'UTF-8');
        event.target.value = '';
    }
    
    function showLoading(show) {
        const processText = document.getElementById('processTextPrato');
        const loadingSpinner = document.getElementById('loadingSpinnerPrato');
        const processBtn = document.getElementById('processImportPrato');
        
        if (show) {
            processText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            processBtn.disabled = true;
        } else {
            processText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            processBtn.disabled = false;
        }
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const notificationDiv = notification.querySelector('div');
        
        notificationText.textContent = message;
        notificationDiv.className = type === 'success' 
            ? 'bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg'
            : 'bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
        
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 4000);
    }
});