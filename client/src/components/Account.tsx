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
        console.log("running buildChildren Account", );
        const children: JSX.Element[] = [];
        for (let i = 0; i < this.props.rows.length; i++) {
            const thisRow = this.props.rows[i];

            if (thisRow.GameDate === "No Open Bets") {
                children.push(<p key={i}>{`${thisRow.GameDate}`}</p>);
            }
            else if (thisRow.DatePlaced != null && thisRow.Description != null) {
                children.push(<p key={i}>{`${thisRow.DatePlaced} | ${thisRow.Description}`}</p>);
            }
            else children.push(<p key={i}>{" -- Error getting data --"}</p>);
        }
        return children;
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 

    render() {
        return (
            <div style={{"display": "block"}} id={this.props.name}>
                <h1>{this.props.name}</h1>
                {this.buildChildren()}
            </div>
        );
    }
}