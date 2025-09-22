import { BrowserRouter, Routes, Route } from "react-router-dom"
import routes from './routes';
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
