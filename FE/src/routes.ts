import LandingPage from "./pages/LandingPage";
import ManualFormPage from "./pages/ManualFormPage";
import ChatbotPage from "./pages/ChatbotPage";
import LoginPage from "./pages/LoginPage";
import OTPPage from "./pages/OTPPage";
import DashboardPage from "./pages/DahsboardPage";

const routes: { path: string; Component: React.FC; isProtected?: boolean }[] = [
  { path: "/", Component: LandingPage },
  { path: "/ManualForm", Component: ManualFormPage },
  { path: "/AutoForm", Component: ChatbotPage },
  { path: "/Login", Component: LoginPage },
  { path: "/otp/:username", Component: OTPPage },
  { path: "/home", Component: DashboardPage, isProtected: true }
]

export default routes;