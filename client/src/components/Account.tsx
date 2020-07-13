import * as React from "react";
import { Entry } from "./Entry";

interface DataRow {
    [key: string]: string,
}

interface iProps {
    name: string,
}

interface iState {
    headerClasses: string,
    rows: DataRow[],
    refreshRange: number[],
}


export class Account extends React.Component<iProps, iState> {
    /* Account Interface */
    dataUrl: string;
    timeoutID: number;

    /* Account Class */
    constructor(props: iProps) {
        super(props);

        // set the default refresh rate
        this.state = {
            headerClasses: "accountHeader",
            rows: [],
            refreshRange: [10000, 20000],
        }

        this.dataUrl = "/api/data/account/" + this.props.name;
        this.timeoutID = 0;
    }

    requestData = () => {
        fetch(this.dataUrl)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                this.setState({
                    headerClasses: "accountHeader flash",
                    rows: data
                },
                () => {
                    // callback to create timeout to remove flash class
                    window.setTimeout(() => {
                        this.setState({ headerClasses: "accountHeader" });
                    }, 1000);
                });
            });
    }

    runUpdate = () => {
        this.requestData();

        // now we set up for the next update (recursive timeouts baby!)
        const newTime = Math.floor(Math.random() * (this.state.refreshRange[1] - this.state.refreshRange[0])) + this.state.refreshRange[0];
        this.timeoutID = window.setTimeout(this.runUpdate, newTime);
        // console.log(this.props.name, "runUpdate", newTime, "as ID", this.timeoutID);
    }

    stopUpdate = () => {
        // console.log(this.props.name, "stopUpdate as ID", this.timeoutID);
        window.clearTimeout(this.timeoutID);
    }

    buildChildren = (): JSX.Element[] => {
        const children: JSX.Element[] = [];
        
        for (let i = 0; i < this.state.rows.length; i++) {
            const thisRow = this.state.rows[i];

            if (thisRow.GameDate === "No Open Bets") {
                children.push(<Entry key={i} name={this.props.name+"-"+i} date={""} description={thisRow.GameDate} />);
            }
            else if (thisRow.DatePlaced != null && thisRow.Description != null) {
                children.push(<Entry key={i} name={this.props.name+"-"+i} date={thisRow.DatePlaced} description={thisRow.Description} />);
            }
            else children.push(<div key={i}>{" -- Error getting data --"}</div>);
        }
        return children;
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 

    render() {
        return (
            <div id={this.props.name} className="account">
                <div className={this.state.headerClasses}>{this.props.name}</div>
                <div className="accountBody">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.runUpdate(); // kick off the update timeout
    }
}