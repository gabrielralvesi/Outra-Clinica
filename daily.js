// ============================================
// VIEW DO DIÁRIO
// ============================================

const DailyView = {
    // Renderizar diário completo
    render() {
        Tokens.verificarZerarMensal();
        
        const date = Utils.$("date")?.value || Utils.todayISO();
        const search = Utils.$("search")?.value.toLowerCase() || "";
        
        this.renderSessionsList(date, search);
        this.renderSummary(date);
        this.renderCassemsCount(date);
    },

    // Renderizar lista de sessões
    renderSessionsList(date, search) {
        const sessions = Sessions.getByDate(date);
        const patients = Patients.getAll();
        const tokens = Tokens.getAll();
        
        const filtered = sessions.filter(s => {
            const p = patients.find(pat => pat.id === s.patientId);
            return !search || (p?.name || "").toLowerCase().includes(search);
        });
        
        const list = Utils.$("dayList");
        if (!list) return;
        
        if (filtered.length === 0) {
            list.innerHTML = '<div class="muted" style="text-align:center; padding:20px;">Nenhuma sessão neste dia</div>';
            return;
        }
        
        list.innerHTML = filtered.map(s => {
            const p = patients.find(pat => pat.id === s.patientId);
            const token = tokens[s.id];
            const photo = Photos.get(s.patientId);
            return Components.sessionCard(s, p, token, photo, true);
        }).join('');
    },

    // Renderizar resumo do dia
    renderSummary(date) {
        const sessions = Sessions.getByDate(date);
        
        const total = sessions.length;
        const totalValue = sessions.reduce((s, r) => s + (Number(r.value) || 0), 0);
        const faltas = sessions.filter(s => s.did === "nao").length;
        
        Utils.$("sumDay").innerHTML = `Total: ${total}`;
        Utils.$("sumMoney").innerHTML = `Total: ${Utils.fmtMoney(totalValue)}`;
        Utils.$("sumAbsences").innerHTML = faltas.toString();
    },

    // Renderizar contagem de Cassems no dia
    renderCassemsCount(date) {
        const sessions = Sessions.getByDate(date);
        const patients = Patients.getAll();
        const tokens = Tokens.getAll();
        
        const cassemsHoje = sessions.filter(s => {
            const p = patients.find(pat => pat.id === s.patientId);
            return p?.serviceType === "cassems";
        });

        const tokensHojeEnviados = cassemsHoje.filter(s => tokens[s.id]?.status === "enviado").length;
        const tokensHojePendentes = cassemsHoje.filter(s => !tokens[s.id] || tokens[s.id]?.status === "pendente").length;

        Utils.$("cassemsHoje").textContent = cassemsHoje.length;
        Utils.$("tokensEnviadosHoje").textContent = tokensHojeEnviados;
        Utils.$("tokensPendentesHoje").textContent = tokensHojePendentes;
    },

    // Atualizar hint de valor padrão
    updateDefaultHint() {
        const pid = Utils.$("pPatient")?.value;
        const p = Patients.getById(pid);
        const hint = Utils.$("hintDefault");
        
        if (!hint) return;
        
        if (!p) {
            hint.textContent = "";
            return;
        }
        
        hint.textContent = `${p.serviceType || "Particular"} • Valor: ${Utils.fmtMoney(p.defaultValue || 0)}`;
    },

    // Renderizar select de pacientes
    renderPatientSelect() {
        const pats = Patients.getAll();
        const sel = Utils.$("pPatient");
        if (!sel) return;
        
        sel.innerHTML = pats.length ?
            pats.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)}${p.serviceType === 'cassems' ? ' (Cassems)' : ''}</option>`).join("") :
            `<option value="">(Cadastre pacientes)</option>`;
        
        this.updateDefaultHint();
    },

    // Limpar dia
    clearDay() {
        const date = Utils.$("date")?.value;
        if (!date) return;
        
        if (confirm(`Limpar todas as sessões de ${date}?`)) {
            // Remover sessões
            const sessions = Sessions.getAll().filter(s => s.date !== date);
            Sessions.save(sessions);
            
            // Remover tokens das sessões removidas
            const sessionsToRemove = Sessions.getByDate(date);
            sessionsToRemove.forEach(s => Tokens.deleteBySession(s.id));
            
            this.render();
            DashboardView.render();
            ScheduleView.render();
            Utils.showAlert("🗑️ Dia limpo!", "success");
        }
    },

    // Encontrar paciente no dia
    findInDay() {
        const term = Utils.$("search")?.value.toLowerCase() || "";
        const patient = Patients.getAll().find(p => p.name.toLowerCase().includes(term));
        
        if (patient) {
            Utils.$("pPatient").value = patient.id;
            this.updateDefaultHint();
            Utils.showAlert(`🔍 ${patient.name} selecionado`, "success");
        }
        
        this.render();
    }
};
