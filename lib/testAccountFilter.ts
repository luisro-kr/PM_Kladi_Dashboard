import { Company } from '../types/dashboard';

/**
 * Determines if a company is a test/internal account that should be excluded from the dashboard
 * @param company - The company to check
 * @param manualOverrides - Optional manual overrides from Google Sheets (empresa_id => is_test)
 */
export function isTestAccount(company: Company, manualOverrides?: Record<string, boolean>): boolean {
    const empresaId = company.empresa_id;

    // Check manual override first (highest priority)
    if (manualOverrides && empresaId in manualOverrides) {
        const isTest = manualOverrides[empresaId];
        // Only log if it's an override that differs from auto-detection or is explicit
        if (isTest) {
            // console.log(`🔧 Manual override for ${company.nombre_empresa}: TEST`);
        }
        return isTest;
    }

    const empresa = (company.nombre_empresa || '').toLowerCase();
    const admin = (company.nombre_administrador || '').toLowerCase();
    const email = (company.correo || '').toLowerCase();
    const idStr = String(company.empresa_id || '');

    // 1) Override: Ferretería Gallegos
    if (empresa.includes('ferreteria gallegos') || empresa.includes('ferretería gallegos')) {
        // Excluir si es Eduardo Test
        if (admin.includes('eduardo test')) {
            console.log(`🚫 Excluded (Ferretería Gallegos - Eduardo Test): ${company.nombre_empresa}`);
            return true;
        }
        // Incluir si contiene "GALLEGOS" (cuenta real)
        if (admin.includes('gallegos')) {
            // console.log(`✅ Included (Ferretería Gallegos - Real): ${company.nombre_empresa}`);
            return false;
        }
    }

    // 2) Dominios internos/desechables
    const bannedDomains = ['@microsip.com', '@kladi.mx', '@mailinator.com'];
    if (bannedDomains.some(domain => email.endsWith(domain))) {
        console.log(`🚫 Excluded (Banned domain): ${company.nombre_empresa} (${email})`);
        return true;
    }

    // 3) Rangos de IDs de prueba (>= 100000000)
    const idNum = Number(idStr);
    if (!Number.isNaN(idNum) && idNum >= 100000000) {
        console.log(`🚫 Excluded (Test ID range): ${company.nombre_empresa} (ID: ${idStr})`);
        return true;
    }

    // 4) Keywords de prueba
    const keywords = ['test', 'prueba', 'dev', 'prod', 'migracion', 'migración', 'qa', 'demo', 'sandbox'];
    const hasKeyword = keywords.some(keyword =>
        empresa.includes(keyword) || admin.includes(keyword)
    );

    if (hasKeyword) {
        console.log(`🚫 Excluded (Test keyword): ${company.nombre_empresa}`);
        return true;
    }

    // No es cuenta de prueba
    return false;
}

/**
 * Filters out test accounts from a list of companies
 * @param companies - List of companies to filter
 * @param manualOverrides - Optional manual overrides from Google Sheets
 */
export function filterTestAccounts(companies: Company[], manualOverrides?: Record<string, boolean>): Company[] {
    const filtered = companies.filter(company => !isTestAccount(company, manualOverrides));

    const excludedCount = companies.length - filtered.length;
    if (excludedCount > 0) {
        console.log(`📊 Filtered ${excludedCount} test accounts. Remaining: ${filtered.length} real companies`);
    }

    return filtered;
}

/**
 * Gets only test accounts (for admin panel)
 */
export function getTestAccounts(companies: Company[]): Company[] {
    return companies.filter(company => isTestAccount(company));
}

/**
 * Loads manual test account overrides from Google Apps Script
 */
export async function loadManualOverrides(): Promise<Record<string, boolean>> {
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbySPrxTlDEQ0DgE23xSYNbn_Ac-9HfiUEV9p3o3rT6m2CT_BAb0AIqaG4V-eCnCbHLCTA/exec';

    try {
        const response = await fetch(`${WEBHOOK_URL}?action=get_flags`);
        const data = await response.json();

        if (data.ok && data.flags) {
            console.log(`✅ Loaded ${data.count} manual test account flags from Google Sheets`);
            return data.flags;
        }

        return {};
    } catch (error) {
        console.error('Failed to load manual test account flags:', error);
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('test_account_overrides');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }

        return {};
    }
}
