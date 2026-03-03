// ============================================
// MODELO DE EVOLUÇÕES
// ============================================

const Evolucoes = {
    // Obter todas as evoluções
    getAll() {
        return Storage.load(STORAGE_KEYS.EVOLUCOES, {});
    },

    // Salvar evoluções
    save(evolucoes) {
        return Storage.save(STORAGE_KEYS.EVOLUCOES, evolucoes);
    },

    // Obter evoluções de um paciente
    getByPatient(patientId) {
        const evolucoes = this.getAll();
        return evolucoes[patientId] || [];
    },

    // Adicionar evolução
    add(patientId, evolucaoData) {
        const evolucoes = this.getAll();
        if (!evolucoes[patientId]) {
            evolucoes[patientId] = [];
        }
        
        const newEvolucao = {
            id: Utils.uid(),
            ...evolucaoData,
            createdAt: new Date().toISOString()
        };
        
        evolucoes[patientId].push(newEvolucao);
        evolucoes[patientId].sort((a, b) => b.date.localeCompare(a.date));
        this.save(evolucoes);
        return newEvolucao;
    },

    // Atualizar evolução
    update(patientId, evolucaoId, updates) {
        const evolucoes = this.getAll();
        if (!evolucoes[patientId]) return null;
        
        const index = evolucoes[patientId].findIndex(e => e.id === evolucaoId);
        if (index !== -1) {
            evolucoes[patientId][index] = {
                ...evolucoes[patientId][index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save(evolucoes);
            return evolucoes[patientId][index];
        }
        return null;
    },

    // Remover evolução
    delete(patientId, evolucaoId) {
        const evolucoes = this.getAll();
        if (evolucoes[patientId]) {
            evolucoes[patientId] = evolucoes[patientId].filter(e => e.id !== evolucaoId);
            if (evolucoes[patientId].length === 0) {
                delete evolucoes[patientId];
            }
            this.save(evolucoes);
        }
    }
};
