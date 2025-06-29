import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IMenu, IMenuList } from 'Interfaces';

class MenuAPI{

    // Fetch all menus
    static async menus(_q=''): Promise<IMenuList> {
        try {
            const response = await axiosInstance.get<IMenuList>(`/menus?q=${_q}`);
            return response.data as any;
        } catch (error) {
            console.error("Error fetching menus:", error);
            throw error;
        }
    }

    /**
     * Get menus by role
     *
     * @param role {number}
     * @return {Promise<IApiResponse>}
     */
    static async menusByRole(role: number): Promise<IApiResponseBase<{
        message: string;
        menus_role: IMenu[]
    }>> {
        try {
            const response = await axiosInstance.get<IApiResponseBase<{
                message: string;
                menus_role: IMenu[]
            }>>(`/menus/${role}/menus-by-role`);
            return response.data as any;
        } catch (error) {
            console.error("Error fetching menus by role:", error);
            throw error;
        }
    }
}

export default MenuAPI;
