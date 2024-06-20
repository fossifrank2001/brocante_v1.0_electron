import React, { useState, useMemo } from 'react';
import PageLoadingIndicator from "Components/PageLoadingIndicator";
import Navbar from "@/partials/Navbar";
import Aside from "@/partials/Aside";
import Footer from "@/partials/Footer";
import { useAppContext } from "@/contexts/appContext";
import { IRole } from '@/Data/Interfaces';
import { Pages } from '@/Data/Objects/state';
import { useAppSelector } from '@/hooks';
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
import ShopPage from "@/pages/dashboard/shop/ShopPage.tsx";

const renderContent = (currentPage, id, param) => {
  switch (currentPage) {
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
    case Pages.SHOP:
      return <ShopPage />;
    default:
      return <Dashboard />;
  }
};

const Layout: React.FC = () => {
  const { pageLoading } = useAppContext();
  const [role, setRole] = useState<IRole | null>(null);
  const roleId = useMemo(() => role?.id ?? null, [role]);
  const { currentPage, id, param } = useAppSelector((state) => state.navigaton);

  return (
      <>
        <PageLoadingIndicator visible={pageLoading} />
        <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6"
             data-sidebartype="full" data-sidebar-position="fixed" data-header-position="fixed">
          <Aside role={roleId} />
          <div className="body-wrapper">
            <Navbar onHandleChangeRole={setRole} />
            <div className="container-fluid" style={{backgroundColor: "rgba(208,208,208,0.08)"}}>
              {renderContent(currentPage, id, param)}
              <Footer />
            </div>
          </div>
        </div>
      </>
  );
};

export default React.memo(Layout);
