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
    BASE_URL: "http://brocante.app/api/v1",
    URL: "http://brocante.app",
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
