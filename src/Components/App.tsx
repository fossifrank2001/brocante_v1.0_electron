import 'Styles/App.less'
import { AppContextProvider } from '@/contexts/appContext'
import '@/assets/css/styles.min.css';

import { Pages } from 'Data/Objects/state'
import React, { useEffect, useState } from 'react';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import Forgot from '@/pages/auth/Forgot'
import Reset from '@/pages/auth/Reset'
import Login from '@/pages/auth/Login'
import Access from '@/pages/Access';
import { useAppDispatch, useAppSelector } from '@/hooks';
import Layout from '@/layout';
import CustomAlert from './CustomAlert';
import HomePage from "@/pages/Home/HomePage.tsx";
import CartPage from "@/pages/Home/cart/CartPage.tsx";
import SuccessSellPage from "@/pages/Home/SuccessSellPage.tsx";

const scripts = [
  '@/assets/libs/jquery/dist/jquery.min.js',
  '@/assets/js/sidebarmenu.js',
  '@/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js',
  '@/assets/js/app.min.js',
  '@/assets/libs/apexcharts/dist/apexcharts.min.js',
  '@/assets/libs/simplebar/dist/simplebar.js',
  '@/assets/js/dashboard.js'
];

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

export const handleRedirectToDashboard = async (access_id: number | string, dispatch) => {
  try {

    const { loadAuthorizationAsync } = await import('Data/Slices/auth/authorizationSlice');
    await dispatch(loadAuthorizationAsync({ access_id }));
    const lastVisitedPage = localStorage.getItem('lastVisitedPage');

    console.log('Last visited Page ::: APP', lastVisitedPage)
    if (lastVisitedPage) {
      dispatch(setActivePage({ page: lastVisitedPage }));
    } else {
      dispatch(setActivePage({page: Pages.DASHBOARD}));
    }
    localStorage.removeItem('lastVisitedPage');
  } catch (e) {
    console.error(e)
  } finally {
    console.warn('Finally process')
  }
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, authUser } = useAppSelector((state) => state.user);
  const { currentPage } = useAppSelector((state) => state.navigaton);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [isOk, setIsOk] = useState(false);

  useEffect(() => {
    (async () => {
      const loadScripts = async () => {
        for (const script of scripts) {
          await loadScript(script);
        }
      };
      await loadScripts();
    })()
  }, []);

  useEffect(() => {
    const handleNavigationHome = () => {
      dispatch(setActivePage({ page: Pages.HOME }));
    };

    if (window.ipcRenderer) {
      window.ipcRenderer.on('navigate-home', handleNavigationHome);
    }

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.off('navigate-home', handleNavigationHome);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      if (!token || !authUser) {
        if(currentPage !== Pages.LOGIN){
          return;
        }else{
          dispatch(setActivePage({page: Pages.LOGIN}));
        }
      }else {
        if (currentPage === Pages.DASHBOARD) {
          return
        }else{
          if (currentPage !== Pages.LOGIN) {
            return
          }else{
            if (authUser.first_connexion) {
              setIsOk(true)
              setOpenDetailModal(true)
            } else {
              if (authUser.accesses.length > 1) {
                const lastVisitedPage = localStorage.getItem('lastVisitedPage');

                console.log('Last visited Page ::: APP', lastVisitedPage)
                if (lastVisitedPage) {
                  dispatch(setActivePage({ page: lastVisitedPage }));
                } else {
                  dispatch(setActivePage({page: Pages.USER_ACCESS_PAGE}));
                }
                localStorage.removeItem('lastVisitedPage');
              } else {
                await handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
              }
            }
          }
        }
      }
    })()
  }, [token, authUser, currentPage, dispatch]);


  const renderMainContent = () => {
    switch (currentPage) {
      case Pages.HOME:
        return <HomePage />;
      case Pages.CART_PAGE:
        return <CartPage />;
      case Pages.SUCCESS_ORDER:
        return <SuccessSellPage />;
      case Pages.LOGIN:
        return <Login />;
      case Pages.FORGOT_PAGE:
        return <Forgot />
      case Pages.RESET_PAGE:
        return <Reset />
      case Pages.USER_ACCESS_PAGE:
        return <Access />;
      default:
        return <Layout />
    }
  };  

  const handleRedirectToResetPage = async () => {
    setOpenDetailModal(false)
    dispatch(setActivePage({
        page: Pages.FORGOT_PAGE
    }))

}

  return (
    <AppContextProvider>
      {renderMainContent()}
      
      {isOk && <CustomAlert
        openDetailModal={openDetailModal} 
        content={{style: 'ti ti-info-circle text text-info',
            icon: 'Info',
            message: 'This is your first connexion so you should change your generated password for more security.'
        }}  
        onHandleDelete={handleRedirectToResetPage}
        onHandleOpenDetail={() => setOpenDetailModal(false)}
        inProgress= {false}
        successMessageButton="ok"
        iconClasseBtn="info"
      />}
    </AppContextProvider>
  )
}

export default React.memo(App);
