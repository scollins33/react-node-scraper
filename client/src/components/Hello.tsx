import * as React from "react";
import { DiffieHellman } from "crypto";

export interface HelloProps {
    compiler: string;
    framework: string;
}

// export const Hello = (props: HelloProps) => {
//     <h1>Hello from {props.compiler} and {props.framework}!</h1>;
// }

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class Hello extends React.Component<HelloProps> {
    constructor(props: HelloProps) {
        super(props);

        console.log("testing testing");
        fetch("/api/data/accounts")
            .then((response) => {
            return response.json();
        })
            .then((data) => {
            console.log(data);
        });
    }
    
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
    }
}