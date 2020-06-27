import * as React from "react";
import { Entry } from "./Entry";

interface DataRow {
    [key: string]: string,
}

interface iProps {
    name: string,
}

interface iState {
    rows: DataRow[],
    refreshRange: number[],
}


export class Account extends React.Component<iProps, iState> {
    /* Account Interface */
    dataUrl: string;
    timeoutID: number;

    constructor(props: iProps) {
        super(props);

        // set the default refresh rate
        this.state = {
            rows: [],
            refreshRange: [10000, 20000]
        }

        this.dataUrl = "/api/data/account/" + this.props.name;
        this.timeoutID = 0;
    }

    requestData = () => {
        console.log(this.props.name, "requestData", this.dataUrl);
        fetch(this.dataUrl)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                this.setState({
                    rows: data
                });
            });
    }

    runUpdate = () => {
        // first we do the refresh
        this.requestData();

        // now we set up for the next update (recursive timeouts baby!)
        const newTime = Math.floor(Math.random() * (this.state.refreshRange[1] - this.state.refreshRange[0])) + this.state.refreshRange[0];
        console.log(this.props.name, "runUpdate", newTime);
        this.timeoutID = window.setTimeout(this.runUpdate, newTime);
    }

    buildChildren = (): JSX.Element[] => {
        console.log("Account", this.props.name, "running buildChildren");
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
                <div className="accountHeader">{this.props.name}</div>
                <div className="accountBody">
                    {this.buildChildren()}
                </div>
            </div>
        );
    }

    componentDidMount() {
        console.log("Account", this.props.name, "componentDidMount");
        this.runUpdate();
    }
}