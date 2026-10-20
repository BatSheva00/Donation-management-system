import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import ThemeWrapper from "./shared/components/shared/ThemeWrapper";
import ErrorBoundary from "./shared/components/shared/ErrorBoundary";
import i18n from "./i18n";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeWrapper>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <ToastContainer
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={i18n.language?.startsWith("he")}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={true}
            theme="colored"
            limit={1}
          />
        </ThemeWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  </I18nextProvider>
);
