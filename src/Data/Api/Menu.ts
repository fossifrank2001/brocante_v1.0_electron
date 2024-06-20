import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import { IMenuList } from "../Interfaces/Menu";

class MenuAPI{

    // Fetch all menus
    static async menus(_q=''): Promise<IMenuList> {
        try {
            const response = await axiosInstance.get<IMenuList>(`/menus?q=${_q}`);
            return response.data;
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
    static async menusByRole(role: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/menus/${role}/menus-by-role`);
            return response.data;
        } catch (error) {
            console.error("Error fetching menus by role:", error);
            throw error;
        }
    }
}

export default MenuAPI;
