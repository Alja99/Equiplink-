import { Link } from "react-router-dom";
import { companyContact } from "../../data/company.js";
import { navigation } from "../../data/navigation.js";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-top">
        <Link className="app-logo" to="/" aria-label="EquipLink International Inc. home">
          <span className="app-logo-artwork">
            <img className="app-logo-symbol" src="/images/equiplink-symbol.png" alt="" />
            <img className="app-logo-wordmark" src="/images/equiplink-wordmark.png" alt="" />
          </span>
        </Link>
        <nav className="app-footer-links" aria-label="Footer navigation">
          {navigation.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>
      </div>
      <div className="app-footer-bottom">
        <span>© {new Date().getFullYear()} EquipLink Liberia Inc.</span>
        <div className="app-footer-contact">
          <span>{companyContact.address}</span>
          {companyContact.phones.map((phone) => <a key={phone.href} href={phone.href}>{phone.label}</a>)}
          <a href={companyContact.emailHref}>{companyContact.email}</a>
          <a href={companyContact.websiteHref}>{companyContact.website}</a>
        </div>
      </div>
    </footer>
  );
}
