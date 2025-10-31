document.addEventListener('DOMContentLoaded', async function() {
    let filtrosAtuais = {};
    
    await Filtros.criarFiltros('filtrosContainer', aplicarFiltros);
    await carregarResumo();
    
    async function aplicarFiltros(filtros) {
        filtrosAtuais = filtros;
        await carregarResumo();
    }
    
    async function carregarResumo() {
        try {
            const params = new URLSearchParams();
            if (filtrosAtuais.categoria) params.append('categoria', filtrosAtuais.categoria);
            if (filtrosAtuais.operacao) params.append('operacao', filtrosAtuais.operacao);
            
            const response = await fetch(`/api/pratos?${params}`);
            const pratos = await response.json();
            
            // Implementar exibição do resumo aqui
            console.log('Pratos filtrados:', pratos);
        } catch (error) {
            console.error('Erro ao carregar resumo:', error);
        }
    }
});