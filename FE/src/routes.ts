import LandingPage from "./pages/LandingPage";
import ManualFormPage from "./pages/ManualFormPage";
import ChatbotPage from "./pages/ChatbotPage";
import LoginPage from "./pages/LoginPage";
import OTPPage from "./pages/OTPPage";

const routes = [
  { path: "/", element: LandingPage },
  { path: "/ManualForm", element: ManualFormPage },
  { path: "/AutoForm", element: ChatbotPage },
  { path: "/Login", element: LoginPage },
  { path: "/otp/:username", element: OTPPage }
]

export default routes;