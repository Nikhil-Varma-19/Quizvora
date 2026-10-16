import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
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
    REGISTER_PAGE: {
      path: "/register",
      element: <Register />,
    },
  },
};

export default routes;
