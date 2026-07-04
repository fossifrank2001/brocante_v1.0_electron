import { configureStore } from "@reduxjs/toolkit";
import userReducer from "Data/Slices/auth/userSlice";
import forgotReducer from "Data/Slices/auth/forgotSlice";
import navReducer from "Data/Slices/NavigationSlice";
import userAuthorizingReducer from "Data/Slices/auth/authorizationSlice";
import resetReducer from "Data/Slices/auth/resetSlice";
import resendTokenReducer from "Data/Slices/auth/resendTokenSlice";
import menuRoleReducer from "Data/Slices/MenuRoleSlice";
import menusReducer from "Data/Slices/dashboard/admin/MenusSlice";
import cartReducer from "Data/Slices/dashboard/seller/cartSlice.ts"
import checkoutReducer from "Data/Slices/dashboard/seller/checkoutSlice.ts"
import cashSessionReducer from "Data/Slices/dashboard/cashSessionSlice.ts"
import heldOrdersReducer from "Data/Slices/dashboard/seller/heldOrdersSlice.ts"
 
const reducerMap = {
    navigaton : navReducer,
    checkout : checkoutReducer,
    user : userReducer,
    cart : cartReducer,
    heldOrders : heldOrdersReducer,
    cashSession : cashSessionReducer,
    forgot : forgotReducer,
    reset : resetReducer,
    resendToken : resendTokenReducer,
    userAuthorizing : userAuthorizingReducer,
    menus_role : menuRoleReducer,
    menus : menusReducer,
}

const store = configureStore({
    reducer: reducerMap,
    devTools: true
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;