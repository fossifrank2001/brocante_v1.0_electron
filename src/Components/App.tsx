import 'Styles/App.less'
import { AppContextProvider } from '@/contexts/appContext'
import '@/assets/css/styles.min.css';

import { Pages } from 'Data/Objects/state'
import React, { useEffect, useState } from 'react';
import { setActivePage } from 'Data/Slices/NavigationSlice';
import CustomAlert from './CustomAlert';
import HomePage from "@/pages/Home/HomePage";
import CartPage from "@/pages/Home/cart/CartPage.tsx";
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';
import AuthPages from '@/Components/auth';
import { useAppDispatch, useAppSelector } from '@/hooks';
import Access from '@/pages/Access';
import Layout from '@/layout';
import LockScreen from "Components/LockScreen.tsx";

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
    await dispatch(loadAuthorizationAsync({access_id}));
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
  const [isOk] = useState(false);
  const [isAuth, setIsAuth] = useState(false)

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
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') && Boolean(localStorage.getItem('hasSeenOnboarding'));
      if (!hasSeenOnboarding) {
        if (currentPage !== Pages.ONBOARDING) {
          dispatch(setActivePage({ page: Pages.ONBOARDING }));
        }
        return;
      }

      if (token && authUser) {
        setIsAuth(true)
        if (currentPage === Pages.LOGIN) {
          if (authUser.accesses.length > 1) {
            dispatch(setActivePage({ page: Pages.USER_ACCESS_PAGE }));
          } else if (authUser.accesses.length === 1) {
            await handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
          }
        }
      }
    })()
  }, [token, authUser, currentPage, dispatch]);

  const renderMainContent = () => {
    const authPages = [Pages.LOGIN, Pages.FORGOT_PAGE, Pages.RESET_PAGE];

    if (authPages.includes(currentPage)) {
      return <AuthPages />;
    }

    switch (currentPage) {
      case Pages.ONBOARDING:
        return <OnboardingLayout />;
      case Pages.HOME:
        return <HomePage />;
      case Pages.CART_PAGE:
        return <CartPage />;
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
        {isAuth && <LockScreen/>}
        {renderMainContent()}

        {isOk && <CustomAlert
            openDetailModal={openDetailModal}
            content={{
              style: 'ti ti-info-circle text text-info',
              icon: 'Info',
              message: 'This is your first connexion so you should change your generated password for more security.'
            }}
            onHandleDelete={handleRedirectToResetPage}
            onHandleOpenDetail={() => setOpenDetailModal(false)}
            inProgress={false}
            successMessageButton="ok"
            iconClasseBtn="info"
        />}
      </AppContextProvider>
  );
}

export default React.memo(App);
