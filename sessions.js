// ============================================
// MODELO DE SESSÕES
// ============================================

const Sessions = {
    // Obter todas as sessões
    getAll() {
        return Storage.load(STORAGE_KEYS.SESSIONS, []);
    },

    // Salvar todas as sessões
    save(sessions) {
        return Storage.save(STORAGE_KEYS.SESSIONS, sessions);
    },

    // Adicionar nova sessão
    add(sessionData) {
        const sessions = this.getAll();
        const newSession = {
            id: Utils.uid(),
            ...sessionData
        };
        sessions.push(newSession);
        this.save(sessions);
        return newSession;
    },

    // Atualizar sessão
    update(sessionId, updates) {
        const sessions = this.getAll();
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates };
            this.save(sessions);
            return sessions[index];
        }
        return null;
    },

    // Remover sessão
    delete(sessionId) {
        const sessions = this.getAll().filter(s => s.id !== sessionId);
        this.save(sessions);
    },

    // Buscar sessão por ID
    getById(id) {
        return this.getAll().find(s => s.id === id);
    },

    // Buscar sessões por data
    getByDate(date) {
        return this.getAll().filter(s => s.date === date);
    },

    // Buscar sessões por paciente
    getByPatient(patientId) {
        return this.getAll().filter(s => s.patientId === patientId);
    },

    // Buscar sessões por mês
    getByMonth(month) {
        return this.getAll().filter(s => s.date.startsWith(month));
    },

    // Alternar status de presença
    toggleDid(sessionId) {
        const session = this.getById(sessionId);
        if (!session) return null;
        
        const newDid = session.did === "realizou" ? "nao" : "realizou";
        return this.update(sessionId, { 
            did: newDid,
            just: newDid === "nao" ? (session.just || "nao_justificada") : "na"
        });
    },

    // Alternar status de pagamento
    togglePaid(sessionId) {
        const session = this.getById(sessionId);
        if (!session) return null;
        
        const newPaid = session.paid === "pago" ? "nao_pago" : "pago";
        return this.update(sessionId, { paid: newPaid });
    },

    // Atualizar valor
    updateValue(sessionId, newValue) {
        return this.update(sessionId, { value: newValue });
    },

    // Estatísticas do paciente
    getPatientStats(patientId) {
        const sessions = this.getByPatient(patientId);
        return {
            total: sessions.length,
            realizadas: sessions.filter(s => s.did === "realizou").length,
            faltas: sessions.filter(s => s.did === "nao").length,
            debt: sessions.filter(s => s.paid !== "pago").reduce((sum, s) => sum + (Number(s.value) || 0), 0)
        };
    },

    // Estatísticas do mês
    getMonthStats(month) {
        const sessions = this.getByMonth(month);
        const realizadas = sessions.filter(s => s.did === "realizou");
        const faltas = sessions.filter(s => s.did === "nao");
        
        return {
            total: sessions.length,
            realizadas: realizadas.length,
            faltas: faltas.length,
            faturamento: realizadas.reduce((sum, s) => sum + (Number(s.value) || 0), 0),
            aReceber: sessions.filter(s => s.paid !== "pago").reduce((sum, s) => sum + (Number(s.value) || 0), 0)
        };
    }
};
