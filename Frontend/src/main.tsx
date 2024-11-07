import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = baseURL;

    //"https://tddc88-company1-ht24.kubernetes-public.it.liu.se/api";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
