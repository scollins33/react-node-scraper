import * as React from "react";
import { Account } from "./Account";

interface iProps {
    // compiler: string;
    // framework: string;
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
        fetch("/api/info/accounts")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                this.setState({ accounts: data });
            });
    }

    toggleRefresh = () => {
        this.setState(
            prevState => {
                return { refreshing: !prevState.refreshing }; // shallow copy the updated refreshing param
            }, 
            ()=> {
                // doing all this as a callback since setState is async
                const toggleButton = document.getElementById("toggleDataRefresh")!;
                toggleButton.innerHTML = (this.state.refreshing ? "Stop" : "Start") + " Data Refresh";
                
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

    refreshOnDemand = () => {
        const pullDataButton = document.getElementById("pullData")! as HTMLInputElement; // cast Input Element for "disabled"
        pullDataButton.disabled = true; // disable the button

        this.childrenRefs.forEach((child:React.RefObject<Account>, index:number) => {
            // if we're currently refereshing regularly we want to kill the time out and 
            // leverage runUpdate to immediately request again AND seamlessly start a new Timeout
            if (this.state.refreshing) {
                child.current?.stopUpdate(); // kill the timeout
                child.current?.runUpdate(); // start new timeout
            }
            // otherwise just do a data pull but don't start a new Timeout (separate functionality)
            else child.current?.requestData(); // do the independent data pull
        });

        // re-enable the button after 1 second to prevent spamming
        window.setTimeout(() => {
            pullDataButton.disabled = false;
        }, 1100);
    }

    buildChildren = (): JSX.Element[] => {
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
                <button id="pullData" onClick={this.refreshOnDemand}>Pull Data Now</button>
                <button id="toggleDataRefresh" onClick={this.toggleRefresh}>Stop Data Refresh</button>

                <div id="accounts">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.getAccounts();
    }
} 