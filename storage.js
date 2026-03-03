// ============================================
// GERENCIAMENTO DE ARMAZENAMENTO LOCAL
// ============================================

const Storage = {
    // Salvar dados no localStorage
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            Utils.showAlert('❌ Erro ao salvar dados. Verifique o espaço disponível.', 'error');
            return false;
        }
    },

    // Carregar dados do localStorage
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    // Remover dados
    remove(key) {
        localStorage.removeItem(key);
    },

    // Limpar todos os dados
    clear() {
        localStorage.clear();
    },

    // Exportar todos os dados para backup
    exportAll() {
        try {
            const dados = {
                pacientes: Patients.getAll(),
                sessoes: Sessions.getAll(),
                agenda: Schedule.get(),
                tokens: Tokens.getAll(),
                fotos: Photos.getAll(),
                evolucoes: Evolucoes.getAll(),
                dataExport: new Date().toISOString(),
                versao: APP_VERSION
            };
            
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_clinica_${Utils.todayISO()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            Utils.showAlert('✅ Dados exportados com sucesso!', 'success');
        } catch (erro) {
            console.error('Erro ao exportar:', erro);
            Utils.showAlert('❌ Erro ao exportar dados', 'error');
        }
    },

    // Importar dados de backup
    importFromFile(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                
                if (dados.pacientes) Storage.save(STORAGE_KEYS.PATIENTS, dados.pacientes);
                if (dados.sessoes) Storage.save(STORAGE_KEYS.SESSIONS, dados.sessoes);
                if (dados.agenda) Storage.save(STORAGE_KEYS.SCHEDULE, dados.agenda);
                if (dados.tokens) Storage.save(STORAGE_KEYS.TOKENS, dados.tokens);
                if (dados.fotos) Storage.save(STORAGE_KEYS.PHOTOS, dados.fotos);
                if (dados.evolucoes) Storage.save(STORAGE_KEYS.EVOLUCOES, dados.evolucoes);
                
                Utils.showAlert('✅ Dados importados com sucesso!', 'success');
                
                if (callback) setTimeout(callback, 1500);
                
            } catch (erro) {
                console.error('Erro ao importar:', erro);
                Utils.showAlert('❌ Arquivo inválido', 'error');
            }
        };
        reader.readAsText(file);
    },

    // Verificar versão e migrar se necessário
    checkVersion() {
        const lastVersion = Storage.load(STORAGE_KEYS.VERSION);
        if (lastVersion !== APP_VERSION) {
            Storage.save(STORAGE_KEYS.VERSION, APP_VERSION);
            // Aqui podem ser adicionadas migrações de dados entre versões
        }
    }
};

// ============================================
// GERENCIAMENTO DE FOTOS
// ============================================

const Photos = {
    getAll() {
        return Storage.load(STORAGE_KEYS.PHOTOS, {});
    },

    save(photos) {
        return Storage.save(STORAGE_KEYS.PHOTOS, photos);
    },

    get(patientId) {
        const photos = this.getAll();
        return photos[patientId] || null;
    },

    set(patientId, photoData) {
        const photos = this.getAll();
        photos[patientId] = photoData;
        this.save(photos);
    },

    remove(patientId) {
        const photos = this.getAll();
        delete photos[patientId];
        this.save(photos);
    }
};
