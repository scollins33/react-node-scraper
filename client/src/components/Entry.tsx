import * as React from "react";

interface iProps {
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
                <div className="entryDate">{this.props.name}</div>
                <div className="entryDescript">{this.props.name}</div>
            </div>
        );
    }
}