import 'Styles/App.less'
import { AppContextProvider } from '@/contexts/appContext'
import '@/assets/css/styles.min.css';

import { Pages } from 'Data/Objects/state'
import React, { useEffect, useState } from 'react';
import { setActivePage, redirectToLogin } from 'Data/Slices/NavigationSlice';
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
  '/assets/libs/jquery/dist/jquery.min.js',
  '/assets/js/sidebarmenu.js',
  '/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js',
  '/assets/js/app.min.js',
  '/assets/libs/apexcharts/dist/apexcharts.min.js',
  '/assets/libs/simplebar/dist/simplebar.js',
  '/assets/js/dashboard.js'
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

    // Vérifier si un état complet a été sauvegardé
    const savedStateStr = localStorage.getItem('savedStateBeforeLogin');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        localStorage.removeItem('savedStateBeforeLogin');
        localStorage.removeItem('lastVisitedPage');

        dispatch(setActivePage({
          page: savedState.page,
          id: savedState.id,
          param: savedState.param,
          search: savedState.search
        }));
        return;
      } catch (error) {
        console.error('Error parsing saved navigation state:', error);
      }
    }

    // Fallback à l'ancienne méthode
    const lastVisitedPage = localStorage.getItem('lastVisitedPage');
    console.log('Last visited Page ::: APP', lastVisitedPage)
    if (lastVisitedPage) {
      dispatch(setActivePage({ page: lastVisitedPage as any }));
      localStorage.removeItem('lastVisitedPage');
    } else {
      dispatch(setActivePage({ page: Pages.DASHBOARD }));
    }
  } catch (e) {
    console.error(e)
  } finally {
    console.warn('Finally process')
  }
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, authUser } = useAppSelector((state) => state.user);
  const { currentPage, lastPageBeforeLogin } = useAppSelector((state) => state.navigaton);
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
          // Si une page était mémorisée avant le 401, y retourner directement
          if (lastPageBeforeLogin && lastPageBeforeLogin !== Pages.LOGIN) {
            console.log('Restoring last page before login:', lastPageBeforeLogin);
            dispatch(setActivePage({ page: lastPageBeforeLogin }));
            dispatch({ type: 'navigation/resetLastPageBeforeLogin' });
          }
          // Sinon, comportement par défaut selon le nombre d'accès
          else if (authUser.accesses.length > 1) {
            dispatch(setActivePage({ page: Pages.USER_ACCESS_PAGE }));
          } else if (authUser.accesses.length === 1) {
            await handleRedirectToDashboard(authUser.accesses[0].id, dispatch);
          }
        }
      } else if (!token && currentPage !== Pages.LOGIN && currentPage !== Pages.ONBOARDING && currentPage !== Pages.HOME && currentPage !== Pages.FORGOT_PAGE && currentPage !== Pages.RESET_PAGE) {
        // Si pas de token et qu'on est sur une page protégée, rediriger vers login
        dispatch(redirectToLogin());
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

  // Pages où le LockScreen ne doit PAS apparaître
  const publicPages = [Pages.HOME, Pages.LOGIN, Pages.FORGOT_PAGE, Pages.RESET_PAGE, Pages.ONBOARDING];
  const shouldShowLockScreen = isAuth && !publicPages.includes(currentPage);

  return (
    <AppContextProvider>
      {shouldShowLockScreen && <LockScreen />}
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
