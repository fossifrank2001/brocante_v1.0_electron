import { Typography } from "@mui/material";

interface IInfoItem {
    label: string
    value: any
    second?: any
}

const InfoItem = (props: IInfoItem) => {
  return (
    <div className="__flex-row __two"> 
      <div className="d-flex  align-items-center">
        <Typography color="secondary" className=" my-1"   fontWeight="medium">
          {props.label}&nbsp;:&nbsp;
        </Typography>
        <Typography color="secondary" className="text-dark my-1"  >
          {props.value}
        </Typography>
      </div>
      {props.second ? (
        <div className="d-flex  align-items-center">
          <Typography color="secondary" className=" my-1"   fontWeight="medium">
            {props.second.label}&nbsp;:&nbsp;
          </Typography>
          <Typography color="secondary" className="text-dark my-1"  >
            {props.second.value}
          </Typography>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InfoItem;
