import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import axios from "axios";

axios.defaults.baseURL =
    "https://tddc88-company1-ht24.kubernetes-public.it.liu.se/api";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
