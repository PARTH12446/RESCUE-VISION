import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Predictions from "./pages/Predictions";
import Resources from "./pages/Resources";
import MapView from "./pages/MapView";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import { ProfilePage } from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ReportedDisasters from "./pages/ReportedDisasters";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Index />
      </RequireAuth>
    ),
  },
  {
    path: "/predictions",
    element: (
      <RequireAuth>
        <Predictions />
      </RequireAuth>
    ),
  },
  {
    path: "/resources",
    element: (
      <RequireAuth allowedRoles={["admin", "responder"]}>
        <Resources />
      </RequireAuth>
    ),
  },
  {
    path: "/map",
    element: (
      <RequireAuth allowedRoles={["admin", "responder"]}>
        <MapView />
      </RequireAuth>
    ),
  },
  {
    path: "/alerts",
    element: (
      <RequireAuth allowedRoles={["admin", "responder"]}>
        <Alerts />
      </RequireAuth>
    ),
  },
  {
    path: "/analytics",
    element: (
      <RequireAuth allowedRoles={["admin"]}>
        <Analytics />
      </RequireAuth>
    ),
  },
  {
    path: "/insights",
    element: (
      <RequireAuth>
        <Insights />
      </RequireAuth>
    ),
  },
  {
    path: "/reports",
    element: (
      <RequireAuth>
        <ReportedDisasters />
      </RequireAuth>
    ),
  },
  {
    path: "/settings",
    element: (
      <RequireAuth allowedRoles={["admin"]}>
        <Settings />
      </RequireAuth>
    ),
  },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;