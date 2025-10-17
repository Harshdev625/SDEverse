import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const themeMode = useSelector((state) => state.theme.mode);
  const location = useLocation();

  const showScrollToTopRoutes = [
    '/algorithms',
    '/data-structures',
    '/algorithm-details',
    '/data-structure-detail',
    '/admin/analytics'
  ];

  const shouldShowScrollToTop = showScrollToTopRoutes.some(route =>
    location.pathname.startsWith(route)
  );
 


  return (
    <div 
      className="flex min-h-screen"
      style={{
        backgroundColor: themeMode === 'dark' ? '#030712' : '#f3f4f6',
        color: themeMode === 'dark' ? '#ffffff' : '#111827'
      }}
    >
      <Sidebar />
      <div
        className="flex flex-col flex-1 md:ml-64 max-md:mt-6"
        style={{ overflowX: "hidden" }}
      >
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <div>
          <Footer />
        </div>
        {shouldShowScrollToTop && <ScrollToTop />}
      </div>
    </div>
  );
};

export default Layout;
