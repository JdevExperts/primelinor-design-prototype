import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/layout/SiteLayout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CorporateGifting from "./pages/CorporateGifting";
import CustomizationStudio from "./pages/CustomizationStudio";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import ProductListing from "./pages/ProductListing";
import SolutionDetail from "./pages/SolutionDetail";
import Solutions from "./pages/Solutions";

export default function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}
