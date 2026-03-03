// ============================================
// MODELO DE TOKENS
// ============================================

const Tokens = {
    // Obter todos os tokens
    getAll() {
        return Storage.load(STORAGE_KEYS.TOKENS, {});
    },

    // Salvar tokens
    save(tokens) {
        return Storage.save(STORAGE_KEYS.TOKENS, tokens);
    },

    // Obter token por ID da sessão
    getBySession(sessionId) {
        const tokens = this.getAll();
        return tokens[sessionId] || null;
    },

    // Registrar token
    register(sessionId, tokenData) {
        const tokens = this.getAll();
        tokens[sessionId] = {
            ...tokenData,
            registeredAt: new Date().toISOString()
        };
        this.save(tokens);
        return tokens[sessionId];
    },

    // Atualizar status do token
    updateStatus(tokenId, newStatus) {
        const tokens = this.getAll();
        if (tokens[tokenId]) {
            tokens[tokenId].status = newStatus;
            this.save(tokens);
            return true;
        }
        return false;
    },

    // Remover token
    delete(tokenId) {
        const tokens = this.getAll();
        delete tokens[tokenId];
        this.save(tokens);
    },

    // Remover tokens por sessão
    deleteBySession(sessionId) {
        const tokens = this.getAll();
        delete tokens[sessionId];
        this.save(tokens);
    },

    // Adicionar token manual
    addManual(patientId, month) {
        const [ano, mes] = month.split('-');
        const data = `${ano}-${mes}-01`;
        
        const tokenId = Utils.uid();
        const tokens = this.getAll();
        
        tokens[tokenId] = {
            id: tokenId,
            patientId,
            date: data,
            code: '',
            status: 'pendente',
            manual: true,
            registeredAt: new Date().toISOString()
        };
        
        this.save(tokens);
        return tokens[tokenId];
    },

    // Obter tokens de um paciente
    getByPatient(patientId) {
        const tokens = this.getAll();
        const sessions = Sessions.getAll();
        const result = [];
        
        Object.entries(tokens).forEach(([sessionId, token]) => {
            const session = sessions.find(s => s.id === sessionId);
            if (session && session.patientId === patientId) {
                result.push({ id: sessionId, ...token, sessionDate: session.date });
            } else if (!session && token.patientId === patientId) {
                result.push({ id: sessionId, ...token });
            }
        });
        
        return result.sort((a, b) => b.date.localeCompare(a.date));
    },

    // Contar tokens por status e período
    countByPatient(patientId, status, month = null) {
        const tokens = this.getByPatient(patientId);
        const hoje = new Date();
        const mesAlvo = month || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
        
        return tokens.filter(t => {
            if (status && t.status !== status) return false;
            const dataToken = new Date(t.date + 'T12:00:00');
            const mesToken = `${dataToken.getFullYear()}-${String(dataToken.getMonth() + 1).padStart(2, '0')}`;
            return mesToken === mesAlvo;
        }).length;
    },

    // Contar total de tokens enviados no mês
    countTotalEnviados(month = null) {
        const tokens = this.getAll();
        const hoje = new Date();
        const mesAlvo = month || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
        
        return Object.values(tokens).filter(t => {
            if (t.status !== 'enviado') return false;
            const dataToken = new Date(t.date + 'T12:00:00');
            const mesToken = `${dataToken.getFullYear()}-${String(dataToken.getMonth() + 1).padStart(2, '0')}`;
            return mesToken === mesAlvo;
        }).length;
    },

    // Verificar e zerar tokens no início do mês
    verificarZerarMensal() {
        const hoje = new Date();
        const dia = hoje.getDate();
        const mes = hoje.getMonth();
        const ano = hoje.getFullYear();
        
        const ultimoReset = Storage.load(STORAGE_KEYS.ULTIMO_RESET);
        const chaveReset = `${ano}-${mes}`;
        
        if (dia === 1 && ultimoReset !== chaveReset) {
            const tokens = this.getAll();
            const tokensReset = {};
            
            Object.entries(tokens).forEach(([sessionId, token]) => {
                if (token.status === 'problema') {
                    tokensReset[sessionId] = token;
                }
            });
            
            this.save(tokensReset);
            Storage.save(STORAGE_KEYS.ULTIMO_RESET, chaveReset);
            
            Utils.showAlert('🔄 Tokens zerados para o novo mês!', 'info');
            return true;
        }
        return false;
    }
};
