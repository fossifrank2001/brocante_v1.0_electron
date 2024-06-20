import {useAppContext} from "@/contexts/appContext";
import { useAppSelector } from "@/hooks";

export default function IsAuth({children}) {
    const context = useAppContext();
    const {token} = useAppSelector(state => state.user)

    if (!token){
        context.togglePageLoading(true)
        //return <Navigate to={constants.LOGIN_PAGE} />
    }
    return children
}
