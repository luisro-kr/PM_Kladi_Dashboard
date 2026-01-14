import { Company } from '../types/dashboard';

/**
 * Determines if a company is a test/internal account that should be excluded from the dashboard
 * @param company - The company to check
 * @param manualOverrides - Optional manual overrides from Google Sheets (empresa_id => is_test)
 */
/**
 * Generates a unique key for a company to handle duplicates with same ID but different admin
 */
export function getCompanyUniqueId(company: Company): string {
    const id = company.empresa_id || 'unknown';
    const admin = (company.nombre_administrador || 'unknown').trim().toLowerCase().replace(/\s+/g, '_');
    return `${id}_${admin}`;
}

export function isTestAccount(company: Company, manualOverrides?: Record<string, boolean>): boolean {
    const empresaId = company.empresa_id;
    const uniqueKey = getCompanyUniqueId(company);

    // 1. Check manual override first (highest priority)
    if (manualOverrides) {
        if (uniqueKey in manualOverrides) return manualOverrides[uniqueKey];
        if (empresaId in manualOverrides) return manualOverrides[empresaId];
    }

    // 2. Strict Email Domain Rule
    // Only mark as test if email ends with specific domains
    const email = (company.correo || '').toLowerCase();
    const bannedDomains = ['@microsip.com', '@kladi.mx', '@mailinator.com'];

    if (bannedDomains.some(domain => email.endsWith(domain))) {
        // console.log(`🚫 Excluded (Test Domain): ${company.nombre_empresa} (${email})`);
        return true;
    }

    // Otherwise, it's a REAL account
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
    // Use local API proxy to avoid CORS
    const WEBHOOK_URL = '/api/data';

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
