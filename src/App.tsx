import { useRoutes } from "react-router-dom"
import routes from './routes/routes';
import "./Assets/index.css"
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
