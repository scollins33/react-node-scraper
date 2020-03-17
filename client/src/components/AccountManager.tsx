import * as React from "react";
import { Account } from "./Account";

interface iProps {
    compiler: string;
    framework: string;
}

interface iState {
    accounts: {
        [key: string]: [] // account name
    };
}

// export const Hello = (props: HelloProps) => {
//     <h1>Hello from {props.compiler} and {props.framework}!</h1>;
// }

export class AccountManager extends React.Component<iProps, iState> {
    constructor(props: iProps) {
        super(props);

        this.state = {
            accounts: {}
        }
    }

    refreshData = () => {
        console.log("refreshData");
        fetch("/api/data/accounts")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                this.setState({
                    accounts: data
                });
                console.log(this.state);
            });
    }

    buildChildren = (): JSX.Element[] => {
        console.log("running buildChildren AccountManager");
        const children: JSX.Element[] = [];

        for (let account in this.state.accounts) {
            console.log(account);
            const info = this.state.accounts[account];

            // passing DataRow[] from royalty account
            children.push(<Account key={account} name={account} rows={info} />);
        }

        return children;
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 

    componentDidMount() {
        console.log("componentDidMount");
        this.refreshData();
    }

    render() {
        return (
            <div>
                <button id="refresh" onClick={this.refreshData}>Refresh</button>

                <div id="accounts">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }
} 