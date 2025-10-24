// Componente Modal - Funções reutilizáveis para modais
class Modal {
    static abrir(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    static fechar(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    static configurarBotoes(modalId, cancelBtnId, salvarBtnId, onSalvar) {
        document.getElementById(cancelBtnId).addEventListener('click', () => {
            Modal.fechar(modalId);
        });

        if (onSalvar) {
            document.getElementById(salvarBtnId).addEventListener('click', onSalvar);
        }
    }
}