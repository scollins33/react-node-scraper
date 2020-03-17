import * as React from "react";
import * as ReactDOM from "react-dom";

import { AccountManager } from "./components/AccountManager";

ReactDOM.render(
    <AccountManager compiler="TypeScript" framework="React" />,
    document.getElementById("index")
);