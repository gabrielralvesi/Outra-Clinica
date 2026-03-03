// ============================================
// CONFIGURAÇÕES GLOBAIS DO SISTEMA
// ============================================

const APP_VERSION = '11.0.0';
const CLINIC_NAME = "Gabriel Alves";
const CLINIC_SUBTITLE = "Fonoaudiologia Infantil";
const CLINIC_CRFA = "CRFa 5-13766";

// Chaves do localStorage
const STORAGE_KEYS = {
    PATIENTS: "gabriel_fono_patients_v11",
    SESSIONS: "gabriel_fono_sessions_v11",
    SCHEDULE: "gabriel_fono_schedule_v11",
    TOKENS: "gabriel_fono_tokens_v11",
    THEME: "gabriel_fono_theme_v11",
    VERSION: "gabriel_fono_version",
    NOTIFICATIONS: "gabriel_fono_notifications",
    PHOTOS: "gabriel_fono_photos",
    EVOLUCOES: "gabriel_fono_evolucoes",
    ULTIMO_RESET: "gabriel_fono_ultimo_reset"
};

// Dias da semana
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

// Cores por tipo de serviço
const SERVICE_COLORS = {
    "cassems": "slotGreen",
    "particular": "slotAmber",
    "unimed": "slotBlue",
    "outros": "slotPurple"
};

// Horários padrão
const DEFAULT_TIMES = [
    "07:00", "07:40", "08:20", "09:00", "09:40", "10:20", "11:00",
    "13:00", "13:40", "14:20", "15:00", "15:40", "16:20", "17:00", "17:40"
];

// Valor padrão para Cassems
const CASSEMS_DEFAULT_VALUE = 26;
