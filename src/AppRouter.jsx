import { Route, Routes } from "react-router-dom";
import LegacyPageLayout from "./components/layout/LegacyPageLayout.jsx";
import { MainLayout } from "./components/layout/MainLayout.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";
import PartnerWithUs from "./pages/PartnerWithUs.jsx";
import ConsultancyPage from "./pages/consultancy/ConsultancyPage.jsx";
import EquipmentDetails from "./pages/equipment/EquipmentDetails.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import ProcurementPage from "./pages/procurement/ProcurementPage.jsx";
import { AdminPage } from "./pages/admin/AdminPage.jsx";

function NotFound() {
  return (
    <MainLayout>
      <main className="app-content app-not-found">
        <p className="app-eyebrow">404 · PAGE NOT FOUND</p>
        <h1>We couldn&apos;t find that page.</h1>
        <p>Try one of the EquipLink service pages or return to the homepage.</p>
      </main>
    </MainLayout>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LegacyPageLayout><Home /></LegacyPageLayout>} />
      <Route path="/about" element={<About />} />
      <Route path="/equipment-mobility" element={<LegacyPageLayout><EquipmentPage /></LegacyPageLayout>} />
      <Route path="/equipment-mobility/:id" element={<EquipmentDetails />} />
      <Route path="/business-consultancy" element={<ConsultancyPage />} />
      <Route path="/procurement-supply" element={<ProcurementPage />} />
      <Route path="/partner-with-us" element={<PartnerWithUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/equipment" element={<LegacyPageLayout><EquipmentPage /></LegacyPageLayout>} />
      <Route path="/consultancy" element={<ConsultancyPage />} />
      <Route path="/procurement" element={<ProcurementPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
