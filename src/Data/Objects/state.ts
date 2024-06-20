import { IMenu, IMenus, IUser } from "Interfaces"
import { IHabilitation } from "../Interfaces/Habilitation"

export enum Pages{
    LOGIN = "LOGIN",
    DASHBOARD = "DASHBOARD",
    USER_ACCESS_PAGE = "USER ACCESS",
    FORGOT_PAGE = "FORGOT PAGE",
    RESET_PAGE = "RESET PAGE",
    ROLE = "ROLE",
    ADMINISTRATION = "ADMINISTRATION",
    ACCOUNT = "ACCOUNT",
    ACCESS = "ACCESS",
    HABILITATION = "HABILITATION",
    MENU = "MENU",
    SHOP = "SHOP",
    CATEGORY = "CATEGORY",
    ARTICLE = "ARTICLE",
    BILL = "BILL",
    SELL = "SELL",
    NOTIFICATION = "NOTIFICATION",
}

export class State{
    constructor(){
        this.user = new UserState()
        this.navigaton = new NavigationState()
        this.user_authorization = new UserAuthorizationState()
        this.forgot = new ForgotState()
        this.reset = new ResetState()
        this.resendToken = new ResendTokenState()
        this.menus_role = new MenuRoleState()
        this.menus = new MenusState()
    }

    user : UserState
    navigaton : NavigationState 
    user_authorization :  UserAuthorizationState
    forgot : ForgotState
    reset: ResetState 
    resendToken: ResendTokenState 
    menus_role: MenuRoleState  
    menus: MenusState  
}

export class UserState{
    token : string
    message : string
    authUser : IUser
}

export class NavigationState{
    currentPage : Pages
    id?: number| null
    param?: any | Object | null 
}

export class UserAuthorizationState{
    authorizations : IHabilitation[]
    auth_access_id : number | string
}

export class ForgotState{
    reset_token : string
    message : string
    username : string
}

export class ResetState{
    message : string
}

export class ResendTokenState{
    message : string 
    reset_token : string
}

export class MenuRoleState{
    menus_role : IMenu[]
}

export class MenusState{
    isLoading: boolean
    menus : IMenus
}
