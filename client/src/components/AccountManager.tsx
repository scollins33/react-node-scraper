import * as React from "react";
import { Account } from "./Account";

interface iProps {
    compiler: string;
    framework: string;
}

interface iState {
    accounts: string[];
}

export class AccountManager extends React.Component<iProps, iState> {
    constructor(props: iProps) {
        super(props);

        this.state = {
            accounts: []
        }
    }

    getAccounts = () => {
        console.log("AccountManager getAccounts");
        fetch("/api/info/accounts")
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
        const children:JSX.Element[] = [];

        this.state.accounts.forEach((account:string, index:number) => {
            console.log(index, account);
            children.push(<Account key={index} name={account} />);
        });

        return children;
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 
    
    render() {
        return (
            <div>
                <button id="refresh" onClick={this.getAccounts}>Refresh All</button>

                <div id="accounts">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        console.log("AccountManager componentDidMount");
        this.getAccounts();
    }
} 