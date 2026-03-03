// ============================================
// MODELO DE PACIENTES
// ============================================

const Patients = {
    // Obter todos os pacientes
    getAll() {
        return Storage.load(STORAGE_KEYS.PATIENTS, []);
    },

    // Salvar todos os pacientes
    save(patients) {
        return Storage.save(STORAGE_KEYS.PATIENTS, patients);
    },

    // Adicionar novo paciente
    add(patientData) {
        const patients = this.getAll();
        const newPatient = {
            id: Utils.uid(),
            ...patientData,
            anamnese: { queixa: "", historico: "", obs: "" },
            createdAt: new Date().toISOString()
        };
        patients.push(newPatient);
        this.save(patients);
        return newPatient;
    },

    // Atualizar paciente existente
    update(patientId, updates) {
        const patients = this.getAll();
        const index = patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            patients[index] = { ...patients[index], ...updates };
            this.save(patients);
            return patients[index];
        }
        return null;
    },

    // Remover paciente
    delete(patientId) {
        const patients = this.getAll().filter(p => p.id !== patientId);
        this.save(patients);
    },

    // Buscar paciente por ID
    getById(id) {
        return this.getAll().find(p => p.id === id);
    },

    // Buscar pacientes por nome
    search(term) {
        const patients = this.getAll();
        if (!term) return patients;
        return patients.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
    },

    // Obter anamnese do paciente
    getAnamnese(patientId) {
        const patient = this.getById(patientId);
        return patient?.anamnese || { queixa: "", historico: "", obs: "" };
    },

    // Salvar anamnese
    saveAnamnese(patientId, anamneseData) {
        return this.update(patientId, { anamnese: anamneseData });
    },

    // Verificar se paciente é Cassems
    isCassems(patientId) {
        const patient = this.getById(patientId);
        return patient?.serviceType === "cassems";
    },

    // Obter valor padrão da sessão
    getDefaultValue(patientId) {
        const patient = this.getById(patientId);
        if (patient?.serviceType === "cassems") return CASSEMS_DEFAULT_VALUE;
        return patient?.defaultValue || 0;
    }
};
