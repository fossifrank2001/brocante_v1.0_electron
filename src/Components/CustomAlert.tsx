import {Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Stack, Typography} from "@mui/material";
import React from 'react'

interface IAlert{
    openDetailModal: boolean;
    onHandleOpenDetail: ()=>{} | any;
    content: {
        style?:string;
        icon?: string;
        message?: string
    };
    onHandleDelete: () =>{}
    inProgress: boolean;
    successMessageButton?: string
    iconClasseBtn?: string
}

const CustomAlert = (props: IAlert) => {
  return <Dialog
            open={props.openDetailModal}
            onClose={() => props.onHandleOpenDetail()}
            aria-labelledby="alert-delete-access"
            aria-describedby="confirm-delete-access">
        <DialogTitle id="alert-dialog-title">
            <Stack className='fs-8' direction='row' alignItems="center">
            <i className={`${props.content.style}`} style={{marginRight: '12px'}} ></i>
            <Typography variant="h5" className= {`text fw-bolder text-${props.iconClasseBtn?? 'danger'}`}>
                {props.content.icon}
            </Typography>
            </Stack>
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {props.content.message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <button disabled={props.inProgress} className='btn btn-light text-dark' onClick={() => props.onHandleOpenDetail()}>
                cancel
            </button>
            <button disabled={props.inProgress} className={`btn  btn-${props.iconClasseBtn?? 'danger'}`} onClick={() => props.onHandleDelete()}>
                {props.successMessageButton??'delete'}
            </button>
        </DialogActions>
    </Dialog>
}

export default CustomAlert