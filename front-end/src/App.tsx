import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import router from "./routes/router";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
