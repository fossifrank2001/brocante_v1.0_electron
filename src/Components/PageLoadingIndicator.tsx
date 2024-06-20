import {LinearProgress} from "@mui/material";

interface IPropsPageLoading {
    visible : boolean;
}

const PageLoadingIndicator = (props : IPropsPageLoading) => {

    return props.visible ? (
        <>
            <LinearProgress style={{zIndex: 100000, position: 'fixed', top: 0, left: 0, width: '100%'}} color="secondary"/>
        </>
    ) :
        <></>;
};

export default PageLoadingIndicator;