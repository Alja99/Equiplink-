import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigation } from "../../data/navigation.js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="app-header">
      <NavLink className="app-logo" to="/" aria-label="EquipLink home" onClick={() => setMenuOpen(false)}>
        <span className="app-logo-artwork">
          <img className="app-logo-symbol" src="/images/equiplink-symbol.png" alt="" />
          <img className="app-logo-wordmark" src="/images/equiplink-wordmark.png" alt="" />
        </span>
      </NavLink>
      <button className="app-menu" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={`app-nav${menuOpen ? " app-nav-open" : ""}`} aria-label="Main navigation">
        {navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
        <NavLink className="app-nav-cta" to="/contact" onClick={() => setMenuOpen(false)}>Request a service <ArrowRight size={14} /></NavLink>
      </nav>
    </header>
  );
}
