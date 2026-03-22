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

const Constants = {
    AUTHOR: {
        name: "Nozakap FOSSI Frank Jordan",
        phone: "+237677831959",
    },
    get BASE_URL() {
        return localStorage.getItem('API_BASE_URL') || "http://brocante.local/api/v1";
    },
    get URL() {
        const baseUrl = localStorage.getItem('API_BASE_URL');
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

export default Constants;
