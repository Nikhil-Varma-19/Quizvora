import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Join from "../pages/Join/Join";
import HostDashboard from "../pages/HostDashboard/HostDashboard";
import Lobby from "../pages/Lobby/Lobby";
import HostConsole from "../pages/HostConsole/HostConsole";
import Play from "../pages/Play/Play";
import Results from "../pages/Results/Results";
import Terms from "../pages/Info/Terms";
import Privacy from "../pages/Info/Privacy";
import Help from "../pages/Info/Help";
import Safety from "../pages/Info/Safety";
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
    JOIN_PAGE: {
      path: "/join",
      element: <Join />,
    },
    REGISTER_PAGE: {
      path: "/register",
      element: <Register />,
    },
  },
  infoRoutes: {
    TERMS: { path: "/terms", element: <Terms /> },
    PRIVACY: { path: "/privacy", element: <Privacy /> },
    HELP: { path: "/help", element: <Help /> },
    SAFETY: { path: "/safety", element: <Safety /> },
  },
  // Quiz screens. Each page guards itself against missing room/identity state.
  gameRoutes: {
    HOST_DASHBOARD: {
      path: "/host",
      element: <HostDashboard />,
    },
    LOBBY: {
      path: "/lobby",
      element: <Lobby />,
    },
    HOST_CONSOLE: {
      path: "/host-console",
      element: <HostConsole />,
    },
    PLAY: {
      path: "/play",
      element: <Play />,
    },
    RESULTS: {
      path: "/results",
      element: <Results />,
    },
  },
};

export default routes;
