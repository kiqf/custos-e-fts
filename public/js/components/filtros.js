// Componente de filtros
class Filtros {
    static async criarFiltros(containerId, onFiltroChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const [categorias, operacoes] = await Promise.all([
                fetch('/api/filtros/categorias').then(r => r.json()),
                fetch('/api/filtros/operacoes').then(r => r.json())
            ]);

            const filtrosDiv = document.createElement('div');
            filtrosDiv.className = 'flex gap-4 mb-4 justify-end';
            filtrosDiv.innerHTML = `
                <select id="filtroCategoria" class="px-3 py-2 border rounded">
                    <option value="">Todas as Categorias</option>
                    ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
                <select id="filtroOperacao" class="px-3 py-2 border rounded">
                    <option value="">Todas as Operações</option>
                    ${operacoes.map(op => `<option value="${op}">${op}</option>`).join('')}
                </select>
                <button id="limparFiltros" class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Limpar</button>
            `;

            container.appendChild(filtrosDiv);

            // Event listeners
            const categoriaSelect = document.getElementById('filtroCategoria');
            const operacaoSelect = document.getElementById('filtroOperacao');
            const limparBtn = document.getElementById('limparFiltros');

            const aplicarFiltros = () => {
                const filtros = {
                    categoria: categoriaSelect.value,
                    operacao: operacaoSelect.value
                };
                onFiltroChange(filtros);
            };

            categoriaSelect.addEventListener('change', aplicarFiltros);
            operacaoSelect.addEventListener('change', aplicarFiltros);
            
            limparBtn.addEventListener('click', () => {
                categoriaSelect.value = '';
                operacaoSelect.value = '';
                aplicarFiltros();
            });

        } catch (error) {
            console.error('Erro ao carregar filtros:', error);
        }
    }
}