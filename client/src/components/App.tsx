import * as React from "react";
import { AccountManager } from "./AccountManager";
import { LogIn } from "./LogIn";

export const App = () => {
    const loggedIn = sessionStorage.getItem("loggedIn");

    // REMEMBER ITS A STRING NOT A BOOLEAN
    if (loggedIn === "true") return (<AccountManager />);
    else return (<LogIn />);
} 