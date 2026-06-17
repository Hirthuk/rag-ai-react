import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Amplify } from "aws-amplify";
import cognitoConfig from "./configuration/cognito-config.js";

Amplify.configure(cognitoConfig);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
