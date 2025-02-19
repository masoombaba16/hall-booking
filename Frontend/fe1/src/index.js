import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {store} from "./Store";
import App from "./App"; // Your main app component

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  </React.StrictMode>
);
