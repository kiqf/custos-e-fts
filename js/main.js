// Arquivo principal de JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização da aplicação
    console.log('Aplicação iniciada');
});

// Função para criar uma linha de insumo
function criarLinhaInsumo(index) {
    return `
    <div class="flex flex-wrap gap-2 mb-4 items-end insumo-row" data-index="${index}">
        <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" name="nome[]" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Nome do insumo">
        </div>
        <div class="w-32">
            <label class="block text-sm font-medium text-gray-700">Unidade</label>
            <select name="unidade[]" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="Kg">Kg</option>
                <option value="g">g</option>
                <option value="Lt">Lt</option>
                <option value="ml">ml</option>
                <option value="un">un</option>
                <option value="cx">cx</option>
                <option value="pct">pct</option>
            </select>
        </div>
        <div class="w-32">
            <label class="block text-sm font-medium text-gray-700">Preço</label>
                <input type="text" name="preco[]" required pattern="^\\d*[,.]?\\d{0,2}$" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="0,00" onkeyup="this.value = this.value.replace(/[^0-9,]/g, '').replace(/(,.*?),/g, '$1')" />
        </div>
        <div class="w-28">
            <label class="block text-sm font-medium text-gray-700">Rendimento</label>
            <input type="number" name="rendimento[]" required min="1" step="1" value="1" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
        <button type="button" class="removeInsumoBtn ml-2 px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Remover">&times;</button>
    </div>
    `;
}

// Função para adicionar uma nova linha
function adicionarLinha() {
    const container = document.getElementById('insumosContainer');
    const index = container.querySelectorAll('.insumo-row').length;
    container.insertAdjacentHTML('beforeend', criarLinhaInsumo(index));
}

// Função para remover uma linha do formulário
function removerLinha(event) {
    if (event.target.classList.contains('removeInsumoBtn')) {
        event.target.closest('.insumo-row').remove();
    }
}

// Função para editar um insumo salvo
async function editarInsumo(id) {
    try {
        const insumo = await fetch(`/api/insumos/${id}`).then(r => r.json());
        
        // Limpa o formulário atual
        document.getElementById('insumosContainer').innerHTML = '';
        
        // Adiciona uma nova linha com os dados do insumo
        const container = document.getElementById('insumosContainer');
        container.insertAdjacentHTML('beforeend', criarLinhaInsumo(0));
        
        // Preenche os campos com os dados do insumo
        const linha = container.querySelector('.insumo-row');
        linha.querySelector('input[name="nome[]"]').value = insumo.nome;
        linha.querySelector('select[name="unidade[]"]').value = insumo.unidade;
        linha.querySelector('input[name="preco[]"]').value = Number(insumo.preco).toFixed(2).replace('.', ',');
        linha.querySelector('input[name="rendimento[]"]').value = insumo.rendimento;
        
        // Atualiza a tabela
        await renderSalvos();
    } catch (error) {
        alert('Erro ao carregar insumo para edição: ' + error.message);
    }
}

// Função para remover um insumo salvo
async function removerInsumo(id) {
    if (confirm('Tem certeza que deseja remover este insumo?')) {
        try {
            await excluirInsumo(id);
            await renderSalvos();
        } catch (error) {
            alert('Erro ao remover insumo: ' + error.message);
        }
    }
}

// Funções globais para API
window.excluirInsumo = async function(id) {
    const response = await fetch(`/api/insumos/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao excluir insumo');
};

window.renderSalvos = async function() {
    const lista = document.getElementById('listaSalvos');
    const response = await fetch('/api/insumos');
    if (!response.ok) throw new Error('Erro ao buscar insumos');
    const insumos = await response.json();
    lista.innerHTML = '';

    if (!insumos.length) {
        lista.innerHTML = '<p class="text-gray-500">Nenhum insumo salvo na sessão.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimento</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    insumos.forEach((insumo, idx) => {
        const tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        const nomeCell = document.createElement('td');
        nomeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        nomeCell.textContent = insumo.nome;
        
        const unidadeCell = document.createElement('td');
        unidadeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        unidadeCell.textContent = insumo.unidade;
        
        const precoCell = document.createElement('td');
        precoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        precoCell.textContent = `R$ ${Number(insumo.preco).toFixed(2).replace('.', ',')}`;
        
        const rendimentoCell = document.createElement('td');
        rendimentoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        rendimentoCell.textContent = insumo.rendimento;
        
        const acoesCell = document.createElement('td');
        acoesCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'text-indigo-600 hover:text-indigo-900 mr-3';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => editarInsumo(insumo.id));
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-red-600 hover:text-red-900';
        removeBtn.textContent = 'Remover';
        removeBtn.addEventListener('click', () => removerInsumo(insumo.id));
        
        acoesCell.appendChild(editBtn);
        acoesCell.appendChild(removeBtn);
        
        tr.appendChild(nomeCell);
        tr.appendChild(unidadeCell);
        tr.appendChild(precoCell);
        tr.appendChild(rendimentoCell);
        tr.appendChild(acoesCell);
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    lista.appendChild(table);
};

window.editarInsumo = async function(id) {
    try {
        const response = await fetch(`/api/insumos/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar insumo');
        const insumo = await response.json();
        
        document.getElementById('editId').value = insumo.id;
        document.getElementById('editNome').value = insumo.nome;
        document.getElementById('editUnidade').value = insumo.unidade;
        document.getElementById('editPreco').value = Number(insumo.preco).toFixed(2).replace('.', ',');
        document.getElementById('editRendimento').value = insumo.rendimento;
        
        document.getElementById('editModal').classList.remove('hidden');
        document.getElementById('editModal').classList.add('flex');
    } catch (error) {
        alert('Erro ao carregar insumo para edição: ' + error.message);
    }
};

window.removerInsumo = async function(id) {
    if (confirm('Tem certeza que deseja remover este insumo?')) {
        try {
            await excluirInsumo(id);
            await renderSalvos();
        } catch (error) {
            alert('Erro ao remover insumo: ' + error.message);
        }
    }
};

// Inicialização para cadastrar-insumos.html
document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('insumosForm')) {
        adicionarLinha(); // Adiciona a primeira linha por padrão
        document.getElementById('addInsumoBtn').addEventListener('click', adicionarLinha);
        document.getElementById('insumosContainer').addEventListener('click', removerLinha);

        // Funções para interagir com a API
        async function getInsumos() {
            const response = await fetch('/api/insumos');
            if (!response.ok) throw new Error('Erro ao buscar insumos');
            return response.json();
        }

        async function salvarInsumo(insumo) {
            const response = await fetch('/api/insumos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(insumo)
            });
            if (!response.ok) throw new Error('Erro ao salvar insumo');
            return response.json();
        }

        async function atualizarInsumo(id, insumo) {
            const response = await fetch(`/api/insumos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(insumo)
            });
            if (!response.ok) throw new Error('Erro ao atualizar insumo');
            return response.json();
        }

        async function excluirInsumo(id) {
            const response = await fetch(`/api/insumos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao excluir insumo');
        }



        document.getElementById('insumosForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const nomes = formData.getAll('nome[]');
            const unidades = formData.getAll('unidade[]');
            const precos = formData.getAll('preco[]');
            const rendimentos = formData.getAll('rendimento[]');

            const novos = nomes.map((nome, i) => ({
                nome: nome.trim(),
                unidade: unidades[i],
                preco: Number(precos[i].replace(',', '.')) || 0,
                rendimento: Number(rendimentos[i]) || 1
            }));

            try {
                for (const insumo of novos) {
                    await salvarInsumo(insumo);
                }
                alert(`${novos.length} insumo(s) salvos com sucesso.`);
                this.reset();
                document.getElementById('insumosContainer').innerHTML = '';
                adicionarLinha();
                await renderSalvos();
            } catch (error) {
                alert('Erro ao salvar insumos: ' + error.message);
            }
        });

        // Modal handlers
        document.getElementById('cancelEdit').addEventListener('click', () => {
            document.getElementById('editModal').classList.add('hidden');
            document.getElementById('editModal').classList.remove('flex');
        });

        document.getElementById('editForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const insumo = {
                nome: document.getElementById('editNome').value,
                unidade: document.getElementById('editUnidade').value,
                preco: Number(document.getElementById('editPreco').value.replace(',', '.')),
                rendimento: Number(document.getElementById('editRendimento').value)
            };
            
            try {
                await atualizarInsumo(id, insumo);
                document.getElementById('editModal').classList.add('hidden');
                document.getElementById('editModal').classList.remove('flex');
                await renderSalvos();
                alert('Insumo atualizado com sucesso!');
            } catch (error) {
                alert('Erro ao atualizar insumo: ' + error.message);
            }
        });

        // Render inicial dos salvos
        if (typeof renderSalvos === 'function') {
            renderSalvos();
        }
    }
});