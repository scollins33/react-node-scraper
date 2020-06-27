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

export class AccountManager extends React.Component<iProps, iState> {
    constructor(props: iProps) {
        super(props);

        this.state = {
            accounts: {}
        }
    }

    refreshData = () => {
        console.log("AccountManager refreshData");
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
        console.log("AccountManager running buildChildren");
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
    
    render() {
        return (
            <div>
                <button id="refresh" onClick={this.refreshData}>Refresh All</button>

                <div id="accounts">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        console.log("AccountManager componentDidMount");
        this.refreshData();
    }
} 