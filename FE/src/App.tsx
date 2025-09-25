import { BrowserRouter, Routes, Route } from "react-router-dom"
import routes from './routes';
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <BrowserRouter>
      <Toaster
        reverseOrder={false}
        toastOptions={{
          style: { background: "#010409", border: "2px solid #3d444d", fontSize: "14px", color: "#f0f6fc", direction: "rtl" },
        }}
      />
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
