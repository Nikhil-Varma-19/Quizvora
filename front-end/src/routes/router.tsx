import { createBrowserRouter } from "react-router";
import routes from "./route";

const router = createBrowserRouter([
	routes.publicRoutes.LANDIND_PAGE,
	routes.publicRoutes.LOGIN_PAGE,
	routes.publicRoutes.REGISTER_PAGE,
	routes.publicRoutes.FORGOT_PASSWORD_PAGE,
	routes.publicRoutes.RESET_PASSWORD_PAGE,
	routes.fallbackRoutes.NOT_FOUND
])


export default router;