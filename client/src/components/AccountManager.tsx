import * as React from "react";
import { Account } from "./Account";

interface iProps {
    compiler: string;
    framework: string;
}

interface iState {
    accounts: string[];
    refreshing: boolean;
}

export class AccountManager extends React.Component<iProps, iState> {
    constructor(props: iProps) {
        super(props);

        this.state = {
            accounts: [],
            refreshing: true,
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
                }, () => console.log(this.state)); // console.log as a callback since setState is async
            });
    }

    toggleRefresh = () => {
        this.setState(
            prevState => {
                return { refreshing: !prevState.refreshing }; // shallow copy the updated refreshing param
            }, 
            ()=> {
                const toggleButton = document.getElementById("toggleDatarefresh")!;
                toggleButton.innerHTML = (this.state.refreshing ? "Stop" : "Start") + " Data Refresh";
                console.log(this.state); // console.log as a callback since setState is async
            }
        );
    }

    buildChildren = (): JSX.Element[] => {
        console.log("AccountManager running buildChildren");
        const children:JSX.Element[] = [];

        this.state.accounts.forEach((account:string, index:number) => {
            children.push(<Account key={index} name={account} runRefresh={this.state.refreshing} />);
        });

        return children;
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 
    
    render() {
        return (
            <div>
                <button id="refreshAccounts" onClick={this.getAccounts}>Refresh Account List</button>
                <button id="toggleDatarefresh" onClick={this.toggleRefresh}>Stop Data Refresh</button>

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