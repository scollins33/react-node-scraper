import * as React from "react";

interface iProps {
    name: string,
    date: string,
    description: string,
}

export class Entry extends React.Component<iProps> {
    constructor(props: iProps) {
        super(props);
    }

    // if we have no bets don't show an empty text string
    buildDate = (): JSX.Element => {
        if (this.props.date === "") return <div className="entryDate"></div>;
        else return <div className="entryDate">{this.props.date}</div>
    }

    /* ------------------
        LIFECYCLE
    ------------------ */ 

    render() {
        return (
            <div id={this.props.name} className="entry">
                <div className="entryDate">{this.props.date}</div>
                <div className="entryDescript">{this.props.description}</div>
            </div>
        );
    }
}