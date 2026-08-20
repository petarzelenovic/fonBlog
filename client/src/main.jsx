import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "./components/ThemeProvider.jsx";
import { CategoriesProvider } from "./contexts/CategoriesContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider>
        <ToastProvider>
          <CategoriesProvider>
            <App />
          </CategoriesProvider>
        </ToastProvider>
      </ThemeProvider>
    </PersistGate>
  </Provider>,
);
