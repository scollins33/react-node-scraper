import * as React from "react";

interface iProps {
    name: string,
    date: string,
    description: string,
}

export class Entry extends React.Component<iProps> {

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