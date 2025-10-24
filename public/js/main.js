// Arquivo principal de JavaScript - Funções globais e inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação iniciada');
    destacarPaginaAtiva();
});

// Função para destacar a página ativa na navegação
function destacarPaginaAtiva() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('bg-gray-700');
        
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('bg-gray-700');
        }
    });
}

// Funções globais para API de insumos
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
    thead.className = 'bg-gray-50 sticky top-0 z-10';
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
        precoCell.textContent = formatarMoeda(insumo.preco);
        
        const rendimentoCell = document.createElement('td');
        rendimentoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        rendimentoCell.textContent = formatarRendimento(insumo.rendimento);
        
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
        document.getElementById('editPreco').value = formatarRendimento(insumo.preco);
        document.getElementById('editRendimento').value = insumo.rendimento;
        
        Modal.abrir('editModal');
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