import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import NotFound from "../pages/NotFound/NotFound";

const routes = {
  fallbackRoutes: {
    NOT_FOUND: {
      path: "*",
      element: <NotFound />,
    },
  },
  publicRoutes: {
    LANDIND_PAGE: {
      path: "/",
      element: <Landing />,
    },
    LOGIN_PAGE: {
      path: "/login",
      element: <Login />,
    },
    FORGOT_PASSWORD_PAGE: {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    RESET_PASSWORD_PAGE: {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    REGISTER_PAGE: {
      path: "/register",
      element: <Register />,
    },
  },
};

export default routes;
