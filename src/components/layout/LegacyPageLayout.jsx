import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export default function LegacyPageLayout({ children }) {
  return (
    <div className="app-shell app-legacy-shell">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
