// Script específico para página de cadastrar insumos
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('insumosForm')) return;

    adicionarLinha();
    document.getElementById('addInsumoBtn').addEventListener('click', adicionarLinha);
    document.getElementById('insumosContainer').addEventListener('click', removerLinha);

    // Configurar modal de edição
    Modal.configurarBotoes('editModal', 'cancelEdit', null);

    // Import CSV handler
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('csvFile').click();
    });

    document.getElementById('csvFile').addEventListener('change', importarCSV);
    document.getElementById('insumosForm').addEventListener('submit', salvarInsumos);
    document.getElementById('editForm').addEventListener('submit', atualizarInsumo);

    // Render inicial
    if (typeof renderSalvos === 'function') {
        renderSalvos();
    }
});

// Funções específicas da página
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
                <option value="KG">KG</option>
                <option value="G">G</option>
                <option value="LT">LT</option>
                <option value="ML">ML</option>
                <option value="UN">UN</option>
                <option value="CX">CX</option>
                <option value="PCT">PCT</option>
            </select>
        </div>
        <div class="w-32">
            <label class="block text-sm font-medium text-gray-700">Preço</label>
            <input type="text" name="preco[]" required pattern="^\\d+[,]\\d{1,2}$|^\\d+$" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="0,00" onkeyup="this.value = this.value.replace(/[^0-9,]/g, '').replace(/(,.*?),/g, '$1')" />
        </div>
        <div class="w-28">
            <label class="block text-sm font-medium text-gray-700">Rendimento</label>
            <input type="number" name="rendimento[]" required min="0.01" step="0.01" value="1" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
        <button type="button" class="removeInsumoBtn ml-2 px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Remover">&times;</button>
    </div>
    `;
}

function adicionarLinha() {
    const container = document.getElementById('insumosContainer');
    const index = container.querySelectorAll('.insumo-row').length;
    container.insertAdjacentHTML('beforeend', criarLinhaInsumo(index));
}

function removerLinha(event) {
    if (event.target.classList.contains('removeInsumoBtn')) {
        event.target.closest('.insumo-row').remove();
    }
}

async function importarCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        alert('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados.');
        return;
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const header = lines[0].split(separator).map(h => h.trim().toUpperCase());
    
    const nomeIdx = header.findIndex(h => h === 'NOME');
    const unidadeIdx = header.findIndex(h => h === 'UNIDADE');
    const precoIdx = header.findIndex(h => h === 'PREÇO' || h === 'PRECO');
    const rendimentoIdx = header.findIndex(h => h === 'RENDIMENTO');
    
    if (nomeIdx === -1 || unidadeIdx === -1 || precoIdx === -1 || rendimentoIdx === -1) {
        alert('Cabeçalho deve conter: NOME, UNIDADE, PRECO (ou PREÇO), RENDIMENTO');
        return;
    }

    const insumos = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator).map(v => v.trim());
        const precoLimpo = values[precoIdx].replace(/[^0-9,.]/g, '').replace(/(,.*?),/g, '$1');
        if (values.length > Math.max(nomeIdx, unidadeIdx, precoIdx, rendimentoIdx)) {
            insumos.push({
                nome: values[nomeIdx],
                unidade: values[unidadeIdx],
                preco: Number(precoLimpo.replace(',', '.')) || 0,
                rendimento: parseFloat(values[rendimentoIdx].replace(',', '.')) || 1
            });
        }
    }

    try {
        for (const insumo of insumos) {
            await salvarInsumo(insumo);
        }
        alert(`${insumos.length} insumo(s) importados com sucesso.`);
        await renderSalvos();
    } catch (error) {
        alert('Erro ao importar insumos: ' + error.message);
    }

    e.target.value = '';
}

async function salvarInsumos(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nomes = formData.getAll('nome[]');
    const unidades = formData.getAll('unidade[]');
    const precos = formData.getAll('preco[]');
    const rendimentos = formData.getAll('rendimento[]');

    const novos = nomes.map((nome, i) => ({
        nome: nome.trim(),
        unidade: unidades[i],
        preco: converterMoeda(precos[i]),
        rendimento: Number(rendimentos[i]) || 1
    }));

    try {
        for (const insumo of novos) {
            await salvarInsumo(insumo);
        }
        alert(`${novos.length} insumo(s) salvos com sucesso.`);
        e.target.reset();
        document.getElementById('insumosContainer').innerHTML = '';
        adicionarLinha();
        await renderSalvos();
    } catch (error) {
        alert('Erro ao salvar insumos: ' + error.message);
    }
}

async function atualizarInsumo(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const insumo = {
        nome: document.getElementById('editNome').value,
        unidade: document.getElementById('editUnidade').value,
        preco: converterMoeda(document.getElementById('editPreco').value),
        rendimento: Number(document.getElementById('editRendimento').value)
    };
    
    try {
        const response = await fetch(`/api/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumo)
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar insumo');
        
        Modal.fechar('editModal');
        await renderSalvos();
        alert('Insumo atualizado com sucesso!');
    } catch (error) {
        alert('Erro ao atualizar insumo: ' + error.message);
    }
}

// API functions
async function salvarInsumo(insumo) {
    const response = await fetch('/api/insumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insumo)
    });
    if (!response.ok) throw new Error('Erro ao salvar insumo');
    return response.json();
}