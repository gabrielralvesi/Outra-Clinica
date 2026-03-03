// ============================================
// VIEW DO DASHBOARD
// ============================================

const DashboardView = {
    // Renderizar dashboard completo
    render() {
        Tokens.verificarZerarMensal();
        
        const hoje = Utils.todayISO();
        const agora = Utils.nowTime();
        const hojeSessions = Sessions.getByDate(hoje);
        
        this.renderHoje(hojeSessions);
        this.renderProximos(agora);
        this.renderFinanceiro(hojeSessions);
        this.renderTaxaFaltas(hoje);
        this.renderTokens(hojeSessions);
        this.renderAniversariantes();
        this.renderProximosAtendimentos();
    },

    // Renderizar seção "Hoje"
    renderHoje(sessions) {
        const realizadas = sessions.filter(s => s.did === "realizou").length;
        const faltas = sessions.filter(s => s.did === "nao").length;
        
        Utils.$("dashHoje").textContent = sessions.length;
        Utils.$("dashHojeDetalhe").innerHTML = `✅ ${realizadas} realizadas • ❌ ${faltas} faltas`;
    },

    // Renderizar próximos atendimentos em 15min
    renderProximos(agora) {
        const hojeDay = new Date().getDay();
        const schedule = Schedule.get();
        const proximos = [];
        
        Object.entries(schedule.recurring || {}).forEach(([key, entry]) => {
            const [day, time] = key.split("|");
            if (parseInt(day) === hojeDay) {
                const [h1, m1] = time.split(":").map(Number);
                const [h2, m2] = agora.split(":").map(Number);
                const diffMinutes = (h1 * 60 + m1) - (h2 * 60 + m2);
                
                if (diffMinutes > 0 && diffMinutes <= 15) {
                    const patient = Patients.getById(entry.patientId);
                    proximos.push({ name: patient?.name || "?", time });
                }
            }
        });
        
        Utils.$("dashProximos").textContent = proximos.length;
        Utils.$("dashProximosNomes").innerHTML = proximos.map(p => `${p.time} - ${p.name}`).join("<br>") || "Nenhum";
    },

    // Renderizar financeiro do dia
    renderFinanceiro(sessions) {
        const faturamento = sessions
            .filter(s => s.did === "realizou" && s.paid === "pago")
            .reduce((sum, s) => sum + (Number(s.value) || 0), 0);
        
        const aReceber = sessions
            .filter(s => s.did === "realizou" && s.paid !== "pago")
            .reduce((sum, s) => sum + (Number(s.value) || 0), 0);
        
        Utils.$("dashFaturamento").textContent = Utils.fmtMoney(faturamento);
        Utils.$("dashFaturamentoDetalhe").innerHTML = `💰 Recebido: ${Utils.fmtMoney(faturamento)}<br>💸 A receber: ${Utils.fmtMoney(aReceber)}`;
    },

    // Renderizar taxa de faltas do mês
    renderTaxaFaltas(hoje) {
        const currentMonth = hoje.slice(0, 7);
        const monthStats = Sessions.getMonthStats(currentMonth);
        const taxa = monthStats.total ? (monthStats.faltas / monthStats.total * 100).toFixed(1) : 0;
        
        Utils.$("dashTaxaFaltas").textContent = `${taxa}%`;
        Utils.$("dashProgresso").style.width = `${taxa}%`;
    },

    // Renderizar tokens do dia
    renderTokens(sessions) {
        const patients = Patients.getAll();
        
        const cassemsHoje = sessions.filter(s => {
            const p = patients.find(pat => pat.id === s.patientId);
            return p?.serviceType === "cassems";
        });

        const tokens = Tokens.getAll();
        const tokensHoje = cassemsHoje.map(s => ({
            session: s,
            token: tokens[s.id]
        }));

        const tokensEnviados = tokensHoje.filter(t => t.token?.status === "enviado").length;
        const tokensPendentes = cassemsHoje.length - tokensEnviados;

        Utils.$("tokensHoje").textContent = cassemsHoje.length;
        Utils.$("tokensHojeDetalhe").innerHTML = `${cassemsHoje.length} pacientes Cassems hoje`;
        Utils.$("tokensEnviados").textContent = tokensEnviados;
        Utils.$("tokensEnviadosDetalhe").innerHTML = `${tokensEnviados} tokens registrados`;
        Utils.$("tokensPendentes").textContent = tokensPendentes;
        Utils.$("tokensPendentesDetalhe").innerHTML = `${tokensPendentes} aguardando token`;
    },

    // Renderizar aniversariantes do mês
    renderAniversariantes() {
        const currentMonthNum = new Date().getMonth() + 1;
        const patients = Patients.getAll();
        
        const aniversariantes = patients.filter(p => {
            if (!p.birth) return false;
            const month = parseInt(p.birth.split("-")[1]);
            return month === currentMonthNum;
        });
        
        const container = Utils.$("aniversariantes");
        if (!container) return;
        
        if (aniversariantes.length === 0) {
            container.innerHTML = "<div class='muted'>Nenhum aniversariante este mês</div>";
        } else {
            container.innerHTML = aniversariantes.map(p => Components.aniversarianteCard(p)).join('');
        }
    },

    // Renderizar próximos atendimentos
    renderProximosAtendimentos() {
        const proximos = Schedule.getUpcoming(5);
        const container = Utils.$("proximosAtendimentos");
        
        if (!container) return;
        
        if (proximos.length === 0) {
            container.innerHTML = "<div class='muted'>Nenhum agendamento</div>";
        } else {
            container.innerHTML = proximos.map(item => Components.proximoAtendimentoCard(item)).join('');
        }
    }
};dashboard.js
