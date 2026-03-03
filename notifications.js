// ============================================
// GERENCIAMENTO DE NOTIFICAÇÕES
// ============================================

const Notifications = {
    enabled: false,
    interval: null,

    // Solicitar permissão
    async requestPermission() {
        if (!("Notification" in window)) {
            Utils.showAlert("❌ Seu navegador não suporta notificações", "error");
            return false;
        }
        
        const permission = await Notification.requestPermission();
        this.enabled = permission === "granted";
        
        if (this.enabled) {
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, "granted");
            this.startChecker();
            Utils.showAlert("✅ Notificações ativadas com sucesso!", "success");
            Utils.$("notificationModal")?.classList.add("hidden");
        }
        
        return this.enabled;
    },

    // Iniciar verificação periódica
    startChecker() {
        if (this.interval) clearInterval(this.interval);
        
        this.interval = setInterval(() => {
            this.checkUpcoming();
        }, 60000); // Verificar a cada minuto
    },

    // Verificar próximos atendimentos
    checkUpcoming() {
        if (!this.enabled) return;
        
        const agora = Utils.nowTime();
        const hoje = new Date().getDay();
        const schedule = Schedule.get();
        
        Object.entries(schedule.recurring || {}).forEach(([key, entry]) => {
            const [day, time] = key.split("|");
            if (parseInt(day) === hoje) {
                const [h1, m1] = time.split(":").map(Number);
                const [h2, m2] = agora.split(":").map(Number);
                const diffMinutes = (h1 * 60 + m1) - (h2 * 60 + m2);
                
                if (diffMinutes === 15) {
                    const patient = Patients.getById(entry.patientId);
                    if (patient) {
                        new Notification("🔔 Próximo atendimento!", {
                            body: `${patient.name} em 15 minutos (${time})`,
                            icon: "/icon-192.png",
                            silent: false
                        });
                    }
                }
            }
        });
    },

    // Inicializar estado
    init() {
        const status = Storage.load(STORAGE_KEYS.NOTIFICATIONS);
        if (status === "granted") {
            this.enabled = true;
            this.startChecker();
        } else if (window.Notification && Notification.permission === "granted") {
            this.enabled = true;
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, "granted");
            this.startChecker();
        } else if (window.Notification && Notification.permission !== "denied") {
            // Mostrar modal após 30 segundos
            setTimeout(() => Utils.$("notificationModal")?.classList.remove("hidden"), 30000);
        }
    }
};
