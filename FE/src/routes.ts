import LandingPage from "./pages/LandingPage";
import ManualFormPage from "./pages/ManualFormPage";
import ChatbotPage from "./pages/ChatbotPage";

const routes = [
  { path: "/", element: LandingPage },
  { path: "/ManualForm", element: ManualFormPage },
  { path: "/AutoForm", element: ChatbotPage }
]

export default routes;