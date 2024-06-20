import { createSelector } from "@reduxjs/toolkit";
import { ForgotState, State } from "Data/Objects/state";


const getForgotState = (state : State) =>{
    return state?.forgot
}


const getReseToken = (state : ForgotState) =>{
    return state?.reset_token
}


const getForgUsername = (state : ForgotState) =>{
    return state?.username
}

export const getResetToken = createSelector(
    getForgotState,
    getReseToken
)

export const getForgotUsername= createSelector(
    getForgotState,
    getForgUsername
)