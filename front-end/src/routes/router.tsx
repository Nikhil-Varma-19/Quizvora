import { createBrowserRouter } from "react-router";
import SocketProvider from "../providers/SocketProvider";
import routes from "./route";

// SocketProvider is the root layout so socket listeners live above every page.
const router = createBrowserRouter([
  {
    element: <SocketProvider />,
    children: [
      routes.publicRoutes.LANDIND_PAGE,
      routes.publicRoutes.LOGIN_PAGE,
      routes.publicRoutes.REGISTER_PAGE,
      routes.publicRoutes.JOIN_PAGE,
      routes.publicRoutes.FORGOT_PASSWORD_PAGE,
      routes.publicRoutes.RESET_PASSWORD_PAGE,
      routes.gameRoutes.HOST_DASHBOARD,
      routes.gameRoutes.LOBBY,
      routes.gameRoutes.HOST_CONSOLE,
      routes.gameRoutes.PLAY,
      routes.gameRoutes.RESULTS,
      routes.infoRoutes.TERMS,
      routes.infoRoutes.PRIVACY,
      routes.infoRoutes.HELP,
      routes.infoRoutes.SAFETY,
      routes.fallbackRoutes.NOT_FOUND,
    ],
  },
]);

export default router;
