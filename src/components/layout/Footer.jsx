import { Link } from "react-router-dom";
import { navigation } from "../../data/navigation.js";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-top">
        <Link className="app-logo" to="/">
          <span className="app-logo-mark">E</span>
          <span className="app-logo-copy"><strong>Equip<span>Link</span></strong><small>HEAVY LOGISTICS &amp; TRADE</small></span>
        </Link>
        <nav className="app-footer-links" aria-label="Footer navigation">
          {navigation.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>
      </div>
      <div className="app-footer-bottom"><span>© {new Date().getFullYear()} EquipLink Liberia Inc.</span><span>Monrovia, Liberia · +231 77 000 0000</span></div>
    </footer>
  );
}
