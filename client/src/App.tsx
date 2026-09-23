import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AdminWpcPage from "./pages/AdminWpcPage";
import { CartPage, ContactPage, FaqPage, LoginPage, MatcherPage, ModelPage, OemSearchPage, PartsPage, PrivacyPage, ProductPage, ReturnsPage, ShippingPage, TrackingPage, VehiclesPage } from "./pages/StorePages";

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster position="bottom-left" /><Switch>
    <Route path="/" component={Home} />
    <Route path="/parts" component={PartsPage} />
    <Route path="/parts/:id" component={ProductPage} />
    <Route path="/cart" component={CartPage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/vehicles" component={VehiclesPage} />
    <Route path="/oem-search" component={OemSearchPage} />
    <Route path="/matcher" component={MatcherPage} />
    <Route path="/tracking" component={TrackingPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/faq" component={FaqPage} />
    <Route path="/models/:model" component={ModelPage} />
    <Route path="/shipping-policy" component={ShippingPage} />
    <Route path="/returns-policy" component={ReturnsPage} />
    <Route path="/privacy-policy" component={PrivacyPage} />
    <Route path="/admin/wpc-research" component={AdminWpcPage} />
    <Route component={NotFound} />
  </Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
