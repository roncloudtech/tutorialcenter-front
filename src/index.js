import "./index.css";
import App from "./App.js";
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals.js";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StaffAuthProvider } from "./context/StaffAuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <StaffAuthProvider>
            <App />
          </StaffAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
