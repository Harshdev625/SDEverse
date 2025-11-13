import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import QuickActions from "./QuickActions";
import NoteEditor from "./NoteEditor";

const Layout = () => {
  const themeMode = useSelector((state) => state.theme.mode);
  const location = useLocation();

  const showQuickActionsRoutes = [
    '/algorithms',
    '/data-structures',
    '/blogs'
  ];

  const shouldShowQuickActions = showQuickActionsRoutes.some(route =>
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
        className="flex flex-col flex-1 md:ml-64"
        style={{ overflowX: "hidden" }}
      >
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <div>
          <Footer />
        </div>
  {shouldShowQuickActions && <QuickActions />}
  {/* Global NoteEditor listener (hidden floating button) */}
  <NoteEditor showFloatingButton={false} />
      </div>
    </div>
  );
};

export default Layout;
