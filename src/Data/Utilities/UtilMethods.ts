import { IHabilitation } from "Data/Interfaces/Habilitation";
import store from "Data/Objects/store";
import Constants from "Data/Utilities/constants";
import ProductAPI from "Data/Api/Product.ts";
import NotificationsAPI from "Data/Api/Notifications.ts";
import SellAPI from "Data/Api/Sell.ts";
import {IUser} from "Interfaces";

export default class UtilMethods {

    static INACTIVE = 'inactive'
    static ACTIVE = 'active'

     static getHabilitations(habilitations: IHabilitation[], label: string)
     {
         const filteredHabilitations =
         habilitations?.filter(
             authorization =>
             authorization.permission.label === "create " + label ||
             authorization.permission.label === "delete " + label ||
             authorization.permission.label === "read " + label ||
             authorization.permission.label === "update " + label ||
             authorization.permission.label === "approve " + label ||
             authorization.permission.label === "reject " + label ||
             authorization.permission.label === "validate " + label ||
             authorization.permission.label === "pay " + label ||
             authorization.permission.label === "accept " + label ||
             authorization.permission.label === "export " + label||
             authorization.permission.label === "disable " + label,
         ) || [];

         return {
            canExport: !!filteredHabilitations.find(authorization => authorization.permission.label === "export " + label,),
            canRead: !!filteredHabilitations.find(authorization => authorization.permission.label === "read " + label),
            canCreate: !!filteredHabilitations.find(authorization => authorization.permission.label === "create " + label),
            canUpdate: !!filteredHabilitations.find(authorization => authorization.permission.label === "update " + label),
            canDelete: !!filteredHabilitations.find(authorization => authorization.permission.label === "delete " + label),
            canApprove: !!filteredHabilitations.find(authorization => authorization.permission.label === "approve " + label),
            canAccept: !!filteredHabilitations.find(authorization => authorization.permission.label === "accept " + label),
            canReject: !!filteredHabilitations.find(authorization => authorization.permission.label === "reject " + label),
            canValidate: !!filteredHabilitations.find(authorization => authorization.permission.label === "validate " + label),
            canPay: !!filteredHabilitations.find(authorization => authorization.permission.label === "pay " + label),
            canDisable: !!filteredHabilitations.find(authorization => authorization.permission.label === "disable " + label),
            canReadCollection: !!filteredHabilitations.find(authorization => authorization.permission.label === "read collection " + label),
         };
     }


    static isoToEmoji(code: string): string {
        return code
            ?.split("")
            .map((letter: string) => (letter.charCodeAt(0) % 32) + 0x1f1e5)
            .map((n) => String.fromCodePoint(n))
            .join("");
    }

    static buildQueryString(params: { [key: string]: string }): string {
        return Object.keys(params)
            .filter(key => params[key] !== "")
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join("&");
    }

    static setStatusParam(value: string, param: string = "status"): void {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has(param)) {
            queryParams.set(param, value);
            const newUrl = window.location.pathname + '?' + queryParams.toString();
            window.history.replaceState({}, '', newUrl);
        }
    }

    static delai(second :number = 1) {
        return new Promise(resolve => setTimeout(resolve, second * 1000));
    }

    static getAuthRole(access_id: number | string): string {
        const accesses = store.getState()?.user?.authUser?.accesses

        if(accesses?.length > 1){
            return accesses?.find(access => access.id === access_id).role.label
        }

        return  accesses[0].role.label
    }

    static capitalizeFirstLetter(str: string):string {
        if (!str) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formatDate(date: string | undefined): string {
        if (!date) return '';
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Date(date).toLocaleDateString('en-US', options);
    }

    static formatTableFilters = (columnFilters = []) => {
        return (columnFilters ?? [])
        .map(column => {
            const values = new Map([[column.id, column.value]]);
            return Object.fromEntries(values);
        })
        .reduce((acc, item) => {
            acc = Object.assign(item, acc);
            return acc;
        }, {});
    };
    
    static formatTableSorting = (sorting = []) => {
        return (sorting ?? [])
        .map(column => {
            const values = new Map([[column.id, column.desc]]);
            return Object.fromEntries(values);
        })
        .reduce((acc, item) => {
            acc = Object.assign(item, acc);
            return acc;
        }, {});
    };

    static authEmail = (): string => {
        const auth = store.getState()?.user?.authUser

        return  auth?.email ?? ''
    }

    static authUser(): IUser{
        const user = store.getState()?.user?.authUser
        console.log("Connected User  ::: ", user)
        return user
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getStatus(status: string | null, _test?: never): string{
        const statusText: string = status;
    
        let elmt = '';
    
        switch (statusText) {
            case 'active':
            case SellAPI.PAID:
            case NotificationsAPI.READ:
            case ProductAPI.STOCK:
                elmt = 'mb-1 badge text-bg-success';
                break;
            case 'inactive':
            case SellAPI.CANCELLED:
            case ProductAPI.OUT_OF_STOCK:
            case NotificationsAPI.UNREAD:
                elmt = 'mb-1 badge text-bg-danger';
                break;
            case SellAPI.PARTIALLY_PAID:
                elmt = 'mb-1 badge text-bg-warning';
                break;
            default:
                elmt = 'mb-1 badge text-bg-light';
                break;
        }
    
        return elmt;
    }
    
    static isAdmin (){
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {auth_access_id} = store.getState()?.userAuthorizing
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {authUser} = store.getState()?.user

        const access = authUser.accesses?.find(access => access.id === auth_access_id)

        if(access.role.code === Constants.ROLES.ADMIN){
            return true
        }

        return false;
    }
        
    static isSeller (){
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {auth_access_id} = store.getState()?.userAuthorizing
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {authUser} = store.getState()?.user

        const access = authUser.accesses?.find(access => access.id === auth_access_id)

        if(access.role.code === Constants.ROLES.SELLER){
            return true
        }

        return false;
    }
    
    static isActiveAccess (access_id: number){
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {auth_access_id} = store.getState()?.userAuthorizing
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {authUser} = store.getState()?.user

        const access = authUser.accesses?.find(access => access.id === auth_access_id)

        return access_id === access.id;
    }
    
    static isOneOfAuthAccess (access_id: number){
        // eslint-disable-next-line no-unsafe-optional-chaining
        const {authUser} = store.getState()?.user

        const access = authUser.accesses?.find(access => access.id === access_id)

        return !!access
    }
    
    static isAuth (user_id: number){

        return store.getState()?.user.authUser.id === user_id
    }

    static formatNumber(value: number)
    {
        if (value === undefined || value == null || isNaN(<number>value)) {
            return 'N/A';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
        }).format(value);
    }
    
}
