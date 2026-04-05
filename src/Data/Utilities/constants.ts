export enum Roles {
    ADMIN = "ADMIN",
    SELLER = "SELLER",
}

export enum StatusAccess {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

enum LocalStorageKeys {
    LANG = "i18nextLng",
    CURRENCY = "XAF",
}

// Internal mutable state for the API URL (set at startup)
let _apiBaseUrl: string | null = null;

const Constants = {
    AUTHOR: {
        name: "Nozakap FOSSI Frank Jordan",
        phone: "+237677831959",
    },
    get BASE_URL() {
        // Priority: 1) IPC-resolved URL (set at startup), 2) default dev URL
        // localStorage override removed to prevent brocante.local issues in production
        return _apiBaseUrl || "http://brocante.local/api/v1";
    },
    get URL() {
        const baseUrl = _apiBaseUrl;
        return baseUrl ? baseUrl.replace(/\/api\/v1\/?$/, '') : "http://brocante.local";
    },
    PER_PAGE: 15,
    APP_NAME: 'Brocante V1.0',
    defaultStoredValue: JSON.stringify({
        token: null,
        authorizations: [],
        access: [],
    }),
    IMAGE_QUALITY: 0.6,
    ROLES : Roles,
    STATUS_ACCESS: StatusAccess,
    LOCAL_STORAGE_KEYS: LocalStorageKeys,
};

/**
 * Initialize the API base URL from the Electron main process.
 * Must be called once at app startup (before any API calls).
 * In portable/production mode, the URL comes from the embedded PHP server.
 */
export async function initApiUrl(): Promise<void> {
    try {
        if ((window as any).ipcRenderer?.getApiUrl) {
            const result = await (window as any).ipcRenderer.getApiUrl();
            if (result?.baseUrl) {
                _apiBaseUrl = result.baseUrl;
                console.log(`[Constants] API URL initialized: ${_apiBaseUrl}`);
            }
        }
    } catch (e) {
        console.warn('[Constants] Could not get API URL from main process, using default:', e);
    }
}

export default Constants;
