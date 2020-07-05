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
    /* Account Manager Interface */
    childrenRefs: React.RefObject<Account>[]; 

    /* Account Manager Class */
    constructor(props: iProps) {
        super(props);

        this.state = {
            accounts: [],
            refreshing: true,
        }

        this.childrenRefs = [];
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

                if(this.state.refreshing) {
                    // start the refresh timeouts
                    this.childrenRefs.forEach((child:React.RefObject<Account>, index:number) => {
                        child.current?.runUpdate();
                    });
                }
                else {
                    // kill the refresh timeouts
                    this.childrenRefs.forEach((child:React.RefObject<Account>, index:number) => {
                        child.current?.stopUpdate();
                    });
                }
            }
        );
    }

    buildChildren = (): JSX.Element[] => {
        console.log("AccountManager running buildChildren");
        const children:JSX.Element[] = [];

        this.state.accounts.forEach((account:string, index:number) => {
            const childRef = React.createRef<Account>();
            this.childrenRefs.push(childRef);

            children.push(<Account key={index} name={account} ref={childRef} />);
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