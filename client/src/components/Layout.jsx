import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const themeMode = useSelector((state) => state.theme.mode);
 


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
      </div>
    </div>
  );
};

export default Layout;
