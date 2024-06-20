import { createSelector } from "@reduxjs/toolkit";
import { State, UserState } from "Data/Objects/state";

const getUserState = (state: State): UserState => state.user;

export const getAuthToken = createSelector(
    [getUserState],
    (state: UserState) => state.token
);

export const getAuthUserConnected = createSelector(
    getUserState,
    (state: UserState) => state
)
