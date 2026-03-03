// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

const Utils = {
    // Selecionar elemento por ID
    $(id) {
        return document.getElementById(id);
    },

    // Gerar ID único
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Data atual no formato ISO
    todayISO() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },

    // Hora atual
    nowTime() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    },

    // Converter string para número (formato brasileiro)
    parseMoney(val) {
        if (!val) return 0;
        return Number(String(val).replace(/\./g, "").replace(",", ".")) || 0;
    },

    // Formatar número para moeda brasileira
    fmtMoney(val) {
        return Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    // Escapar HTML para evitar XSS
    escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Chave para agenda recorrente
    recurKey(day, time) {
        return `${day}|${time}`;
    },

    // Adicionar dias a uma data
    addDays(dateStr, days) {
        const date = new Date(dateStr + 'T12:00:00');
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    },

    // Mostrar alerta na tela
    showAlert(message, type = "info", duration = 3000) {
        if (window.alertTimeout) clearTimeout(window.alertTimeout);
        
        const alert = document.createElement("div");
        alert.className = `alert alert-${type}`;
        alert.innerHTML = message;
        
        // Estilo dinâmico baseado no tipo
        const colors = {
            success: { bg: "rgba(44,122,90,.2)", border: "#2C7A5A" },
            warning: { bg: "rgba(232,198,106,.2)", border: "#E8C66A" },
            error: { bg: "rgba(239,68,68,.2)", border: "#EF4444" },
            info: { bg: "rgba(44,122,90,.2)", border: "#2C7A5A" }
        };
        
        alert.style.background = colors[type]?.bg || colors.info.bg;
        alert.style.borderColor = colors[type]?.border || colors.info.border;
        
        document.body.appendChild(alert);
        
        window.alertTimeout = setTimeout(() => {
            if (alert.parentNode) alert.remove();
        }, duration);
    },

    // Debounce para evitar múltiplas chamadas
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para limitar taxa de chamadas
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Atalho global para $
window.$ = Utils.$;
