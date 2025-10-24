document.addEventListener('DOMContentLoaded', async function() {
    await renderFichasTecnicas();

    async function renderFichasTecnicas() {
        try {
            const response = await fetch('/api/pratos');
            const pratos = await response.json();
            const container = document.getElementById('fichasContainer');
            
            if (pratos.length === 0) {
                container.innerHTML = '<p class="text-gray-500 p-4">Nenhum prato cadastrado.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            pratos.forEach(prato => {
                const fichaDiv = document.createElement('div');
                fichaDiv.className = 'bg-white rounded-lg shadow p-6';
                
                const titulo = document.createElement('h2');
                titulo.className = 'text-xl font-semibold mb-4 text-gray-800';
                titulo.textContent = prato.nome;
                
                const table = document.createElement('table');
                table.className = 'min-w-full divide-y divide-gray-200';
                
                const thead = document.createElement('thead');
                thead.className = 'bg-gray-50';
                thead.innerHTML = `
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome do Insumo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    </tr>
                `;
                
                const tbody = document.createElement('tbody');
                tbody.className = 'bg-white divide-y divide-gray-200';
                
                prato.insumos.forEach((insumo, index) => {
                    const tr = document.createElement('tr');
                    tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    
                    const nomeCell = document.createElement('td');
                    nomeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    nomeCell.textContent = `${insumo.nome} (${insumo.unidade})`;
                    
                    const quantidadeCell = document.createElement('td');
                    quantidadeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    quantidadeCell.textContent = formatarRendimento(insumo.quantidade);
                    
                    tr.appendChild(nomeCell);
                    tr.appendChild(quantidadeCell);
                    tbody.appendChild(tr);
                });
                
                table.appendChild(thead);
                table.appendChild(tbody);
                
                fichaDiv.appendChild(titulo);
                fichaDiv.appendChild(table);
                container.appendChild(fichaDiv);
            });
            
        } catch (error) {
            console.error('Erro ao carregar fichas técnicas:', error);
        }
    }
});