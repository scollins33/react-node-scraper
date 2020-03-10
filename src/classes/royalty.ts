import fetch from "node-fetch";

interface CookieJar {
    __cfduid: string;
    sessionId: string;
    pl: string;
}
interface DataStorage {
    [key: number]: { // row
        [key: string]: string, // cell
    },
}
interface DataTypings {
    [key: number]: string,
}

export class RoyaltyAccount {
    account: string;
    password: string;
    loggedIn: boolean;
    cookies: CookieJar;
    dataTypes: DataTypings;
    data: DataStorage;
    
    constructor(user: string, pass: string) {
        this.account = user;
        this.password = pass;
        this.loggedIn = false;

        // make the cookie jar
        const newJar: CookieJar = {
            __cfduid: "",
            sessionId: "",
            pl: "pl=",
        }
        this.cookies = newJar;

        // set up the data structures
        const theseTypes: DataTypings = {
            0: "GameDate",
            1: "User",
            2: "DatePlaced",
            3: "Sport",
            4: "Description",
            5: "RiskWin",
        }
        this.dataTypes = theseTypes;

        const newData: DataStorage = {};
        this.data = newData;

    }

    login = async () => {
        if (this.loggedIn) return true;

        // first we need to get the CloudFlare cookie
        const baseURL = "***BASE_URL***";
        const baseResponse = await fetch(baseURL, {
            method: "get",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });
        
        const baseBody = await baseResponse.text(); // await pauses the execution
        const baseCookie = baseResponse.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        this.cookies.__cfduid = baseCookie.slice(0, baseCookie.indexOf(";")+1);
        // console.log("-----------------");
        // console.log(baseResponse.status, baseBody.slice(0,120) + "...");
        // console.log(baseResponse.headers.get("set-cookie"));
        // console.log(this.cookies.__cfduid);

        console.log("got that cloudflare cookie");

        // now we can try to log in and get a session going
        const loginURL: string = baseURL + "DGS/login.aspx";
        const loginResponse = await fetch(loginURL, {
            method: "post",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.cookies.__cfduid,
            },
            body: `IdBook=&account=${this.account}&password=${this.password}`,
            redirect: "manual" // so that we get the 302 and stop
        });
        
        const loginResBody = await loginResponse.text(); // await pauses the execution
        const loginCookie = loginResponse.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        this.cookies.sessionId = loginCookie.slice(0, loginCookie.indexOf(";")+1);
        // console.log("-----------------");
        // console.log(loginResponse.status, loginResBody.slice(0,120) + "...");
        // console.log(...loginResponse.headers); // expand the headers class
        // console.log(this.cookies.sessionId);

        console.log("and now I got the session cookie");

        this.loggedIn = true;
    }

    pullData = async (): Promise<any> => {
        const baseURL = "***DATA_URL***";
        const baseResponse = await fetch(baseURL, {
            method: "get",
            headers: {
                "Cookie": this.cookies.__cfduid + this.cookies.sessionId + this.cookies.pl,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            }
        });
        
        const baseBody = await baseResponse.text(); // await pauses the execution
        
        return baseBody;
    }

    // static parseData(dataString: string): any {
    //
    // }
}