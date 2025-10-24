document.addEventListener('DOMContentLoaded', async function() {
    await renderFichasTecnicas();

    async function renderFichasTecnicas() {
        try {
            const [pratosResponse, insumosResponse] = await Promise.all([
                fetch('/api/pratos'),
                fetch('/api/insumos')
            ]);
            const pratos = await pratosResponse.json();
            const insumos = await insumosResponse.json();
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
                table.className = 'w-full table-fixed divide-y divide-gray-200';
                
                const thead = document.createElement('thead');
                thead.className = 'bg-gray-50';
                thead.innerHTML = `
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-80">Nome do Insumo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Quantidade</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Preço</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Rendimento</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">FC</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Quant. Bruta</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Valor Total</th>
                    </tr>
                `;
                
                const tbody = document.createElement('tbody');
                tbody.className = 'bg-white divide-y divide-gray-200';
                
                let custoTotal = 0;
                
                prato.insumos.forEach((insumo, index) => {
                    const insumoCompleto = insumos.find(i => i.id === insumo.insumo_id);
                    
                    const tr = document.createElement('tr');
                    tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    
                    const nomeCell = document.createElement('td');
                    nomeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    nomeCell.textContent = `${insumo.nome} (${insumo.unidade})`;
                    
                    const quantidadeCell = document.createElement('td');
                    quantidadeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    quantidadeCell.textContent = formatarRendimento(insumo.quantidade);
                    
                    const precoCell = document.createElement('td');
                    precoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    precoCell.textContent = formatarMoeda(insumo.preco);
                    
                    const rendimentoCell = document.createElement('td');
                    rendimentoCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    rendimentoCell.textContent = insumoCompleto ? formatarRendimento(insumoCompleto.rendimento) : '-';
                    
                    const fcCell = document.createElement('td');
                    fcCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    const fcValue = insumoCompleto ? (1 / parseFloat(insumoCompleto.rendimento)) : 0;
                    fcCell.textContent = insumoCompleto ? fcValue.toFixed(4).replace('.', ',') : '-';
                    
                    const quantBrutaCell = document.createElement('td');
                    quantBrutaCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    const quantBruta = insumoCompleto ? (fcValue * parseFloat(insumo.quantidade)) : 0;
                    quantBrutaCell.textContent = insumoCompleto ? quantBruta.toFixed(4).replace('.', ',') : '-';
                    
                    const valorTotalCell = document.createElement('td');
                    valorTotalCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                    const valorTotal = insumoCompleto ? (quantBruta * parseFloat(insumo.preco)) : 0;
                    valorTotalCell.textContent = insumoCompleto ? formatarMoeda(valorTotal) : '-';
                    
                    custoTotal += valorTotal;
                    
                    tr.appendChild(nomeCell);
                    tr.appendChild(quantidadeCell);
                    tr.appendChild(precoCell);
                    tr.appendChild(rendimentoCell);
                    tr.appendChild(fcCell);
                    tr.appendChild(quantBrutaCell);
                    tr.appendChild(valorTotalCell);
                    tbody.appendChild(tr);
                });
                
                table.appendChild(thead);
                table.appendChild(tbody);
                
                const custoDiv = document.createElement('div');
                custoDiv.className = 'mt-4 text-right';
                custoDiv.innerHTML = `<strong>Custo da Preparação: ${formatarMoeda(custoTotal)}</strong>`;
                
                fichaDiv.appendChild(titulo);
                fichaDiv.appendChild(table);
                fichaDiv.appendChild(custoDiv);
                container.appendChild(fichaDiv);
            });
            
        } catch (error) {
            console.error('Erro ao carregar fichas técnicas:', error);
        }
    }
});