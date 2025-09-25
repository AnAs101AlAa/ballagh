import { BrowserRouter, Routes, Route } from "react-router-dom"
import routes from './routes';
import { Toaster } from "react-hot-toast";
import LoggedInRoute from "./routing/ProtectedRoutes";

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
        {routes.map(({path, Component, isProtected}) =>
          isProtected ? (
            <Route
              key={path}
              path={path}
              element={
                <LoggedInRoute>
                  <Component/>
                </LoggedInRoute>
              }
            />
          ) : Component ? (
            <Route
              key={path}
              path={path}
              element={<Component/>}
            />
          ) : null
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
