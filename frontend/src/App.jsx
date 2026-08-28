import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/layout/SiteLayout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import ProductListing from "./pages/ProductListing";
import RouteFallback from "./components/layout/RouteFallback";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import RequireAdminAuth from "./admin/components/RequireAdminAuth";

// Home, Product Listing and Product Detail stay eager — they're the
// highest-traffic entry points. Everything else loads on demand so a
// homepage visitor isn't paying for Customization Studio's code.
const CustomizationStudio = lazy(() => import("./pages/CustomizationStudio"));
const CorporateGifting = lazy(() => import("./pages/CorporateGifting"));
const Solutions = lazy(() => import("./pages/Solutions"));
const SolutionDetail = lazy(() => import("./pages/SolutionDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

// Internal staff tooling — a completely separate bundle/shell from the
// customer site (Phase 3 §27), never mixed into the customer Header/Footer.
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const LeadsInbox = lazy(() => import("./admin/pages/LeadsInbox"));
const LeadDetail = lazy(() => import("./admin/pages/LeadDetail"));
const RfqsInbox = lazy(() => import("./admin/pages/RfqsInbox"));
const RfqDetail = lazy(() => import("./admin/pages/RfqDetail"));
const QuotationEditor = lazy(() => import("./admin/pages/QuotationEditor"));

// Catalogue Admin (Phase 5) — same admin shell/bundle, not a separate app.
const ProductsList = lazy(() => import("./admin/pages/catalog/ProductsList"));
const NewProduct = lazy(() => import("./admin/pages/catalog/NewProduct"));
const ProductEditor = lazy(() => import("./admin/pages/catalog/ProductEditor"));
const CategoriesAdmin = lazy(() => import("./admin/pages/catalog/CategoriesAdmin"));
const ColorsAdmin = lazy(() => import("./admin/pages/catalog/ColorsAdmin"));
const SolutionsAdmin = lazy(() => import("./admin/pages/catalog/SolutionsAdmin"));
const SolutionEditor = lazy(() => import("./admin/pages/catalog/SolutionEditor"));

// Token-gated customer quotation page — its own lightweight branded shell,
// never the customer SiteLayout (Header/Footer) or the admin shell (Phase
// 4 §8).
const CustomerQuote = lazy(() => import("./pages/CustomerQuote"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/customize/:productId" element={<CustomizationStudio />} />
            <Route path="/corporate-gifting" element={<CorporateGifting />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:slug" element={<SolutionDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/quote/:token" element={<CustomerQuote />} />

          <Route path="/admin" element={<AdminAuthProvider><Outlet /></AdminAuthProvider>}>
            <Route path="login" element={<AdminLogin />} />
            <Route element={<RequireAdminAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="rfqs" replace />} />
                <Route path="leads" element={<LeadsInbox />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="rfqs" element={<RfqsInbox />} />
                <Route path="rfqs/:id" element={<RfqDetail />} />
                <Route path="quotations/:id" element={<QuotationEditor />} />
                <Route path="catalog" element={<Navigate to="catalog/products" replace />} />
                <Route path="catalog/products" element={<ProductsList />} />
                <Route path="catalog/products/new" element={<NewProduct />} />
                <Route path="catalog/products/:id" element={<ProductEditor />} />
                <Route path="catalog/categories" element={<CategoriesAdmin />} />
                <Route path="catalog/colors" element={<ColorsAdmin />} />
                <Route path="catalog/solutions" element={<SolutionsAdmin />} />
                <Route path="catalog/solutions/:id" element={<SolutionEditor />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
