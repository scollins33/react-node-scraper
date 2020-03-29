import * as React from "react";

interface DataRow {
    [key: string]: string,
}

interface iProps {
    name: string,
    rows: DataRow[],
}

// use iProps for props and state since they will be the same interface
export class Account extends React.Component<iProps> {
    constructor(props: iProps) {
        super(props);
    }

    buildChildren = (): JSX.Element[] => {
        const children: JSX.Element[] = [];
        
        for (let i = 0; i < this.props.rows.length; i++) {
            const thisRow = this.props.rows[i];

            if (thisRow.GameDate === "No Open Bets") {
                children.push(<div key={i}>{`${thisRow.GameDate}`}</div>);
            }
            else if (thisRow.DatePlaced != null && thisRow.Description != null) {
                children.push(<div key={i}>{`${thisRow.DatePlaced} | ${thisRow.Description}`}</div>);
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
}