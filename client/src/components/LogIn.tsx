import * as React from "react";

interface iProps {} // empty props placeholder

interface iState {
    username: string;
    password: string;
}

export class LogIn extends React.Component<iProps, iState> {

    /* LogIn Class */
    constructor(props: iProps) {
        super(props);

        this.state = {
            username: "",
            password: ""
        }

        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.attemptLogin = this.attemptLogin.bind(this);
    }

    updateUsername(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ username: event.currentTarget.value });
    }

    updatePassword(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ password: event.currentTarget.value });
    }

    // POST username and password to the server
    attemptLogin = () => {
        fetch("/login", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        })
        .then((res) => { return res.json(); })
        .then((resJson) => {
            if (resJson.status === true) sessionStorage.setItem("loggedIn", "true");
        });
    }

    /* ------------------
        LIFECYCLE
    ------------------ */
    render() {
        return (
            <div>
                <form id="loginForm" onSubmit={this.attemptLogin}>
                    <label id="usernameLabel">
                        Username <br/>
                        <input id="usernameText" type="text" value={this.state.username} onChange={this.updateUsername} />
                    </label>
                    <label id="passwordLabel">
                        Password <br/>
                        <input id="passwordText" type="password" value={this.state.password} onChange={this.updatePassword} />
                    </label>
                    <input id="loginButton" type="submit" value="Log me in!"/>
                </form>
            </div>
        );
    }
}