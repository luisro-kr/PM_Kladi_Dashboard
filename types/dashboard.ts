export interface Company {
    fecha_creacion_empresa: string | null;
    empresa_id: string;
    plan_suscripcion: string;
    estatus_suscripcion: string;
    nombre_empresa: string;
    nombre_administrador: string;
    telefono: string;
    correo: string;
    nuevos_tickets_7d: number;
    nuevos_clientes_7d: number;
    nuevos_articulos_7d: number;
    total_tickets: number;
    total_clientes: number;
    total_articulos: number;
    last_update: string;

    // Derivados
    dias_desde_creacion: number | null;
    fecha_fin_trial: string | null;
    en_trial: boolean;
    trial_expirado: boolean;
    activado_en_7d: boolean;
    empresa_inactiva_7d: boolean;
    precio_plan_mensual: number;
    mrr_estimado: number;
    // Helper fields from backend
    trial_vence_7d: boolean;
    is_paying: boolean;
}

export interface KPIs {
    total_empresas: number;
    pagando: number;
    en_trial: number;
    trial_expirado: number;
    trial_vence_7d: number;
    inactivas_7d: number;
    mrr_total: number;
    por_plan: {
        plata: number;
        oro: number;
        titanio: number;
        otro: number;
    };
    por_estatus: Record<string, number>;
}

export interface DashboardData {
    ok: boolean;
    generated_at: string;
    kpis: KPIs;
    rows: Company[];
}

// ============================================
// PM POS 2026 Dashboard - Enhanced Types
// ============================================

export type PlanType = 'plata' | 'oro' | 'titanio' | 'all';
export type StatusType = 'pagando' | 'trial' | 'expirado' | 'all';

export interface FilterState {
    plan: PlanType;
    status: StatusType;
    dateFrom: string | null;
    dateTo: string | null;
    searchQuery: string;
}

export interface ChartDataPoint {
    name: string;
    value: number;
    percentage?: number;
    color?: string;
}

export interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
    conversionRate?: number;
}

export interface FunnelData {
    created: number;
    activated: number;
    trialEnd: number;
    paid: number;
    stages: FunnelStage[];
}

export interface UsagePercentiles {
    metric: string;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    avg: number;
    max: number;
}

export interface UsageMetrics {
    tickets: UsagePercentiles;
    clientes: UsagePercentiles;
    articulos: UsagePercentiles;
}

export interface TrialCompany extends Company {
    dias_restantes: number;
    prioridad: 'alta' | 'media' | 'baja';
}

export interface RiskCompany extends Company {
    risk_score: number;
    risk_factors: string[];
}

export interface ProcessedDashboardData {
    companies: Company[];
    filteredCompanies: Company[];
    kpis: KPIs;
    funnel: FunnelData;
    usage: UsageMetrics;
    trialCompanies: TrialCompany[];
    riskCompanies: RiskCompany[];
}
