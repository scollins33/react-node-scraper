import fetch from "node-fetch";
import cheerio from "cheerio";

interface CookieJar {
    __cfduid: string;
    sessionId: string;
    pl: string;
}

// @TODO shouldn't use an indexer but complicated to refactor with DataTypings
interface DataRow {
    // GameDate: string,
    // User: string,
    // DatePlaced: string,
    // Sport: string,
    // Description: string,
    // RiskWin: string,
    [key: string]: string,
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
    data: DataRow[];
    
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

        const newData: DataRow[] = [];
        this.data = newData;

    }

    bakeCloudflare = async () => {
        // first we need to get the CloudFlare cookie
        const response = await fetch("***BASE_URL***", {
            method: "get",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });
        
        // const baseBody = await response.text(); // await pauses the execution
        const cookieHeader = response.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        this.cookies.__cfduid = cookieHeader.slice(0, cookieHeader.indexOf(";")+1);
        // console.log("-----------------");
        // console.log(response.status, baseBody.slice(0,120) + "...");
        // console.log(response.headers.get("set-cookie"));
        // console.log(this.cookies.__cfduid);
        // console.log("got that cloudflare cookie");

        return true;
    }

    bakeSessionId = async () => {
        if (this.cookies.__cfduid === "") throw new Error("Missing CloudFlare cookie.");

        // now we can try to log in and get a session going
        const response = await fetch("***LOGIN_URL***", {
            method: "post",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.cookies.__cfduid,
            },
            body: `IdBook=&account=${this.account}&password=${this.password}`,
            redirect: "manual" // so that we get the 302 and stop
        });
        
        // const loginResBody = await response.text(); // await pauses the execution
        const cookieHeader = response.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        
        // null means we failed the login (wrong password etc)
        if (cookieHeader == null) throw new Error("Failed login, did not get a set-cookie header.");

        this.cookies.sessionId = cookieHeader.slice(0, cookieHeader.indexOf(";")+1);
        // console.log("-----------------");
        // console.log(response.status, loginResBody.slice(0,120) + "...");
        // console.log(...response.headers); // expand the headers class
        // console.log(this.cookies.sessionId);
        // console.log("and now I got the session cookie");

        return true;
    }

    login = async () => {
        if (this.loggedIn) return true;
        console.log("logging in to", this.account);

        try {
            await this.bakeCloudflare();
            await this.bakeSessionId();

            this.loggedIn = true;
        }
        catch(err) {
            console.error(err);
            return false;
        }

    }

    requestData = async (): Promise<any> => {
        const response = await fetch("***DATA_URL***", {
            method: "get",
            headers: {
                "Cookie": this.cookies.__cfduid + this.cookies.sessionId + this.cookies.pl,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            }
        });
        
        const body = await response.text(); // await pauses the execution

        return this.parseData(body);
    }

    parseData(dataString: string): DataRow[] {
        // clear the old data
        this.data = [];

        const $ = cheerio.load(dataString);
        const $table = $("#content table");
        const $bodyRows = $table.find("tbody tr");
        const data: DataRow[] = [];
        
        // each row
        $bodyRows.each((i: number, row: CheerioElement) => {
            const $tableCells = $(row).children("td");
            const thisRow: DataRow = {};

            // each cell
            $tableCells.each((j: number, cell: CheerioElement) => {
                const cellType = this.dataTypes[j];
                let text = $(cell).text();
                
                // text = text.replace(/(\r\n|\n|\r|\t)/gm,""); // get rid of line breaks
                // text = text.replace(/\s+/g," "); // remove all extra whitespace

                // if (cellType === "GameDate" && text !== "No Open Bets") {
                //     text = text.slice(text.length-16, text.length); // remove Ticket#
                // }

                thisRow[cellType] = text;
            }); // end cell

            data.push(thisRow); // push the row to the array
        }); // end row

        this.data = data;
        return this.data;
    }

    getData(): DataRow[] {
        return this.data;
    }
}