/* ----------------------
    Module Imports
---------------------- */
import fetch from "node-fetch";
import cheerio from "cheerio";

/* ----------------------
    Custom Interfaces
---------------------- */
interface UrlObject {
    baseUrl: string,
    loginUrl: string,
    dataUrl: string,
}

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

/* ----------------------
    Class Definition
---------------------- */
export class RoyaltyAccount {
    account: string;
    password: string;
    urls: UrlObject;
    loggedIn: boolean;
    cookies: CookieJar;
    dataTypes: DataTypings;
    data: DataRow[];
    
    constructor(user: string, pass: string, urlObject: UrlObject) {
        this.account = user;
        this.password = pass;
        this.urls = urlObject;
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
        console.log(this.account, "bakeCloudflare start");
        // first we need to get the CloudFlare cookie
        const response = await fetch(this.urls.baseUrl, {
            method: "get",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });
        
        await response.text(); // await pauses the execution, await the text so we know we have the full response
        const cookieHeader = response.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        this.cookies.__cfduid = cookieHeader.slice(0, cookieHeader.indexOf(";")+1);

        console.log(this.account, "this.cookies.__cfduid", this.cookies.__cfduid);
        console.log(this.account, "bakeCloudflare end");

        return true;
    }

    bakeSessionId = async () => {
        console.log(this.account, "bakeSessionId start");
        if (this.cookies.__cfduid === "") throw new Error("Missing CloudFlare cookie.");

        // now we can try to log in and get a session going
        const response = await fetch(this.urls.loginUrl, {
            method: "post",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.cookies.__cfduid,
            },
            body: `IdBook=&account=${this.account}&password=${this.password}`,
            redirect: "manual" // so that we get the 302 and stop
        });
        
        await response.text(); // await pauses the execution, await the text so we know we have the full response
        const cookieHeader = response.headers.get("set-cookie")!; // Header obj (class), ! makes TS trust this isn't null
        
        // null means we failed the login (wrong password etc)
        if (cookieHeader == null) throw new Error("Failed login, did not get a set-cookie header.");

        this.cookies.sessionId = cookieHeader.slice(0, cookieHeader.indexOf(";")+1);

        console.log(this.account, "this.cookies.sessionId", this.cookies.sessionId);
        console.log(this.account, "bakeSessionId end");
        return true;
    }

    login = async () => {
        console.log(this.account, "login start");
        if (this.loggedIn) return true;
        
        try {
            console.log(this.account, "login trying to bake cookies");
            await this.bakeCloudflare();
            await this.bakeSessionId();

            console.log(this.account, "login cookies baked:", this.cookies.__cfduid, this.cookies.sessionId);
            
            // timeout to "log out" after 15 minutes
            setTimeout(() => {
                console.log(this.account, "setting loggedIn to false");
                this.loggedIn = false;
            }, 900000);

            this.loggedIn = true;
            console.log(this.account, "login end");
            return true;
        }
        catch(err) {
            console.error("LOGIN ERROR: " + err);
            return false;
        }

    }

    requestData = async (): Promise<any> => {
        console.log(this.account, "requestData start");
        const response = await fetch(this.urls.dataUrl, {
            method: "get",
            headers: {
                "Cookie": this.cookies.__cfduid + this.cookies.sessionId + this.cookies.pl,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            }
        });
        
        const body = await response.text(); // await pauses the execution
        console.log(this.account, this.cookies.sessionId, this.cookies.__cfduid, this.cookies.pl);
        
        console.log(this.account, "requestData end");
        return this.parseData(body);
    }

    parseData(dataString: string): DataRow[] {
        console.log(this.account, "parseData start", this.data);
        // clear the old data
        this.data = [];
        console.log(this.account, "parseData cleared", this.data);

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
                
                text = text.replace(/(\r\n|\n|\r|\t)/gm,""); // get rid of line breaks
                text = text.replace(/\s+/g," "); // remove all extra whitespace

                if (cellType === "GameDate" && text !== "No Open Bets") {
                    text = text.slice(text.length-16, text.length); // remove Ticket#
                }

                thisRow[cellType] = text;
                console.log(this.account, i, j, text);
            }); // end cell

            data.push(thisRow); // push the row to the array
        }); // end row

        this.data = data;
        console.log(this.account, "parseData parsed", data);
        console.log(this.account, "parseData end", this.data);
        return this.data;
    }

    getData(): DataRow[] {
        console.log(this.account, "getData triggered");
        return this.data;
    }
}