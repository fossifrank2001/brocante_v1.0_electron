import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { State } from "Data/Objects/state";


export type asyncDispatch = ThunkDispatch<State, never, UnknownAction>