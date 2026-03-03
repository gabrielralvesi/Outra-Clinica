// ============================================
// MODELO DE AGENDA
// ============================================

const Schedule = {
    // Obter agenda completa
    get() {
        return Storage.load(STORAGE_KEYS.SCHEDULE, { times: DEFAULT_TIMES, recurring: {} });
    },

    // Salvar agenda
    save(schedule) {
        return Storage.save(STORAGE_KEYS.SCHEDULE, schedule);
    },

    // Obter horários
    getTimes() {
        return this.get().times || [];
    },

    // Adicionar horário
    addTime(time) {
        const schedule = this.get();
        if (!schedule.times.includes(time)) {
            schedule.times.push(time);
            schedule.times.sort();
            this.save(schedule);
            return true;
        }
        return false;
    },

    // Remover horário
    removeTime(time) {
        const schedule = this.get();
        schedule.times = schedule.times.filter(t => t !== time);
        this.save(schedule);
    },

    // Restaurar horários padrão
    resetTimes() {
        const schedule = this.get();
        schedule.times = DEFAULT_TIMES;
        this.save(schedule);
    },

    // Obter agendamentos recorrentes
    getRecurring() {
        return this.get().recurring || {};
    },

    // Adicionar agendamento recorrente
    addRecurring(day, time, patientId, serviceType) {
        const schedule = this.get();
        if (!schedule.recurring) schedule.recurring = {};
        
        const key = Utils.recurKey(day, time);
        schedule.recurring[key] = {
            patientId,
            serviceType,
            startDate: Utils.todayISO()
        };
        
        this.save(schedule);
    },

    // Remover agendamento recorrente
    removeRecurring(day, time) {
        const schedule = this.get();
        const key = Utils.recurKey(day, time);
        if (schedule.recurring) {
            delete schedule.recurring[key];
            this.save(schedule);
        }
    },

    // Obter agendamento por dia/horário
    getByDayTime(day, time) {
        const recurring = this.getRecurring();
        const key = Utils.recurKey(day, time);
        return recurring[key] || null;
    },

    // Verificar se horário está ocupado
    isOccupied(day, time) {
        return !!this.getByDayTime(day, time);
    },

    // Obter todos os agendamentos de um paciente
    getByPatient(patientId) {
        const recurring = this.getRecurring();
        const result = [];
        
        Object.entries(recurring).forEach(([key, entry]) => {
            if (entry.patientId === patientId) {
                const [day, time] = key.split("|");
                result.push({ day: parseInt(day), time, ...entry });
            }
        });
        
        return result;
    },

    // Remover todos os agendamentos de um paciente
    removeByPatient(patientId) {
        const schedule = this.get();
        if (schedule.recurring) {
            Object.keys(schedule.recurring).forEach(key => {
                if (schedule.recurring[key].patientId === patientId) {
                    delete schedule.recurring[key];
                }
            });
            this.save(schedule);
        }
    },

    // Obter próximos atendimentos
    getUpcoming(limit = 5) {
        const agora = Utils.nowTime();
        const refDay = new Date().getDay();
        const recurring = this.getRecurring();
        const patients = Patients.getAll();
        const result = [];
        
        Object.entries(recurring).forEach(([key, entry]) => {
            const [day, time] = key.split("|");
            const dayNum = parseInt(day);
            const patient = patients.find(p => p.id === entry.patientId);
            
            let daysToAdd = dayNum - refDay;
            if (daysToAdd < 0) daysToAdd += 7;
            if (daysToAdd === 0 && time < agora) daysToAdd += 7;
            
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            
            result.push({
                date: nextDate,
                time,
                patient: patient?.name || "?",
                patientId: entry.patientId,
                days: daysToAdd
            });
        });
        
        return result.sort((a, b) => a.days - b.days).slice(0, limit);
    }
};
