import { createSelector } from "@reduxjs/toolkit";
import { State, NavigationState } from "Data/Objects/state";

const getNavigationState = (state : State) =>{
    return state?.navigaton
}

const currentPage = (state : NavigationState) =>{
    return state?.currentPage
}

export const getPageCurrent = createSelector(
    getNavigationState,
    currentPage
)