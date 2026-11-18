import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export function MainLayout({ children }) {
  return <div className="app-shell"><Navbar /><main className="app-main">{children}</main><Footer /></div>;
}

export default MainLayout;
