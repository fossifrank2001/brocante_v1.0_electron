import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import Navbar from "@/partials/Navbar";
import Aside from "@/partials/Aside";
import Footer from "@/partials/Footer";
import { useAppContext } from "@/contexts/appContext";
import { IRole } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { useAppDispatch, useAppSelector } from '@/hooks';
import Dashboard from '@/pages/dashboard/Dashboard';
import IndexMenu from '@/Components/dashboard/menus';
import IndexUser from '@/Components/dashboard/users';
import ReadUserPage from '@/pages/dashboard/users/UserDetail';
import UserCreatePage from '@/pages/dashboard/users/UserCreate';
import UpdateUserPage from '@/pages/dashboard/users/UserUpdate';
import IndexAccess from '@/Components/dashboard/accesses';
import AccessCreatePage from '@/pages/dashboard/accesses/AccessCreate';
import AccessUpdatePage from '@/pages/dashboard/accesses/AccessUpdate';
import IndexRole from '@/Components/dashboard/roles';
import IndexAuthorization from '@/Components/dashboard/authorizations';
import IndexCategory from '@/Components/dashboard/categories';
import AuthorizationCreatePage from '@/pages/dashboard/authorization/AuthorizationCreate';
import CategoryCreatePage from '@/pages/dashboard/categories/CategoryCreate';
import CategoryUpdatePage from "@/pages/dashboard/categories/CategoryUpdate.tsx";
import ProductCreate from "Components/dashboard/products/create.tsx";
import IndexProduct from "Components/dashboard/products";
import ReadProductPage from "@/pages/dashboard/products/ReadProductPage.tsx";
import AuthorizationUpdatePage from "@/pages/dashboard/authorization/AuthorizationUpdate.tsx";
import UpdateProductPage from "@/pages/dashboard/products/UpdateProductPage.tsx";
import NotificationPage from "@/pages/dashboard/notifications/NotificationPage.tsx";
import IndexCustomer from "Components/dashboard/customers";
import IndexSell from "Components/dashboard/sells";
import ReadSellPage from "@/pages/dashboard/sells/SellDetail.tsx";
import IndexSupply from "Components/dashboard/suppliers";
import IndexInvoice from "Components/dashboard/invoices";
import ReadInvoicePage from "@/pages/dashboard/invoices/InvoiceDetail.tsx";
import ProfileComponent from "@/Components/profile/ProfileComponent";
import { setCurrentRole } from "Data/Slices/MenuRoleSlice.ts";
import ComingSoon from "Components/ComingSoon.tsx";
import ActivityLogsViewer from "@/Components/admin/ActivityLogsViewer";
import PosExpress from "@/Components/dashboard/pos/PosExpress";
import SuccessSellPage from "@/pages/Home/SuccessSellPage";
import StoreSettingsPage from "@/Components/dashboard/settings/StoreSettingsPage";
import StockMovementsPage from "@/Components/dashboard/stock/StockMovementsPage";
import TemplateBuilder from "@/Components/dashboard/templates/TemplateBuilder";

const renderContent = (currentPage, id, param) => {
  switch (currentPage) {
    case Pages.PROFILE:
      return <ProfileComponent />;
    case Pages.ROLE:
      if (!id && !param) return <IndexRole />;
      break;
    case Pages.ACCESS:
      if (!id && !param) return <IndexAccess />;
      if (param.sub_page === 'UPDATE') return <AccessUpdatePage />;
      return <AccessCreatePage />;
    case Pages.ACCOUNT:
      if (!id && !param) return <IndexUser />;
      if (param.sub_page === 'UPDATE') return <UpdateUserPage />;
      if (param.sub_page === 'READ') return <ReadUserPage />;
      return <UserCreatePage />;
    case Pages.MENU:
      return <IndexMenu />;
    case Pages.ARTICLE:
      if (!id && !param) return <IndexProduct />;
      if (param.sub_page === 'UPDATE') return <UpdateProductPage />;
      if (param.sub_page === 'READ') return <ReadProductPage />;
      return <ProductCreate />;
    case Pages.CATEGORY:
      if (!id && !param) return <IndexCategory />;
      if (param.sub_page === 'UPDATE') return <CategoryUpdatePage />;
      return <CategoryCreatePage />;
    case Pages.HABILITATION:
      if (!id && !param) return <IndexAuthorization />;
      if (param.sub_page === 'UPDATE') return <AuthorizationUpdatePage />;
      return <AuthorizationCreatePage />;
    case Pages.NOTIFICATION:
      return <NotificationPage />; 
    case Pages.CUSTOMER:
      return <IndexCustomer />;
    case Pages.SUPPLIER:
      return <IndexSupply />;
    case Pages.SELL:
      if (!id && !param) return <IndexSell />;
      if (param.sub_page === 'UPDATE') return null;
      if (param.sub_page === 'READ') return <ReadSellPage />;
      return null;
    case Pages.BILL:
    case Pages.INVOICE:
      if (!id && !param) return <IndexInvoice />;
      if (param.sub_page === 'READ') return <ReadInvoicePage />;
      return null;
    case Pages.ACTIVITY_LOGS:
      return <ActivityLogsViewer />;
    case Pages.POS_EXPRESS:
      return <PosExpress />;
    case Pages.SETTINGS:
      return <StoreSettingsPage />;
    case Pages.STOCK_MOVEMENTS:
      return <StockMovementsPage />;
    case Pages.PRODUCT_TEMPLATES:
      return <TemplateBuilder />;
    case Pages.SUCCESS_ORDER:
      return <SuccessSellPage />;
    case Pages.DASHBOARD:
      return <Dashboard />;
    default:
      return <ComingSoon />;
  }
};

const Layout: React.FC = () => {
  const { pageLoading } = useAppContext();
  const [role, setRole] = useState<IRole | null>(null);
  const roleId = useMemo(() => role?.id ?? null, [role]);
  const dispatch = useAppDispatch()
  const {
    currentPage,
    id,
    param
  } = useAppSelector((state) => state.navigaton);

  const [isSidebarOpen, setIsSidebarOpen] = useState(currentPage !== Pages.POS_EXPRESS);

  // Auto-collapse sidebar on POS page
  React.useEffect(() => {
    if (currentPage === Pages.POS_EXPRESS) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [currentPage]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <PageLoadingIndicator visible={pageLoading} />
      <div className={`page-wrapper ${!isSidebarOpen ? 'mini-sidebar' : ''}`} id="main-wrapper" data-layout="vertical" data-navbarbg="skin6"
        data-sidebartype={isSidebarOpen ? "full" : "mini-sidebar"} data-sidebar-position="fixed" data-header-position="fixed"
      >
        <Aside role={roleId} isSidebarOpen={isSidebarOpen} />
        <div className="body-wrapper" style={{
          backgroundColor: "var(--bg-primary)",
          transition: 'margin-left 0.2s ease-in-out, background-color 0.3s ease'
        }}>
          <Navbar
            onHandleChangeRole={(_role) => {
              dispatch(setCurrentRole(_role?.code));
              setRole(_role)
            }}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          {currentPage === Pages.POS_EXPRESS ? (
            <Box sx={{
              display: 'flex',
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              overflow: 'hidden'
            }}>
              {renderContent(currentPage, id, param)}
            </Box>
          ) : (
            <div className='container' style={{ minHeight: '100vh', paddingTop: '75px', position: 'relative' }}>
              {renderContent(currentPage, id, param)}
              <Footer />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Layout);
