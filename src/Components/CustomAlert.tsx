import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography} from "@mui/material";
import { useTranslation } from 'react-i18next';

interface IAlert{
    openDetailModal: boolean;
    onHandleOpenDetail: ()=>void;
    content: {
        style?:string;
        icon?: string;
        message?: string
    };
    onHandleDelete: () => void
    inProgress: boolean;
    successMessageButton?: string
    iconClasseBtn?: string
}

const CustomAlert = (props: IAlert) => {
  const { t } = useTranslation();
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
                {t('common.cancel')}
            </button>
            <button disabled={props.inProgress} className={`btn  btn-${props.iconClasseBtn?? 'danger'}`} onClick={() => props.onHandleDelete()}>
                {props.successMessageButton ?? t('common.delete')}
            </button>
        </DialogActions>
    </Dialog>
}

export default CustomAlert