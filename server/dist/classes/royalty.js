"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
class RoyaltyAccount {
    constructor(user, pass) {
        this.bakeCloudflare = () => __awaiter(this, void 0, void 0, function* () {
            // first we need to get the CloudFlare cookie
            const response = yield node_fetch_1.default("***BASE_URL***", {
                method: "get",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
                }
            });
            // const baseBody = await response.text(); // await pauses the execution
            const cookieHeader = response.headers.get("set-cookie"); // Header obj (class), ! makes TS trust this isn't null
            this.cookies.__cfduid = cookieHeader.slice(0, cookieHeader.indexOf(";") + 1);
            // console.log("-----------------");
            // console.log(response.status, baseBody.slice(0,120) + "...");
            // console.log(response.headers.get("set-cookie"));
            // console.log(this.cookies.__cfduid);
            // console.log("got that cloudflare cookie");
            return true;
        });
        this.bakeSessionId = () => __awaiter(this, void 0, void 0, function* () {
            if (this.cookies.__cfduid === "")
                throw new Error("Missing CloudFlare cookie.");
            // now we can try to log in and get a session going
            const response = yield node_fetch_1.default("***LOGIN_URL***", {
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
            const cookieHeader = response.headers.get("set-cookie"); // Header obj (class), ! makes TS trust this isn't null
            // null means we failed the login (wrong password etc)
            if (cookieHeader == null)
                throw new Error("Failed login, did not get a set-cookie header.");
            this.cookies.sessionId = cookieHeader.slice(0, cookieHeader.indexOf(";") + 1);
            // console.log("-----------------");
            // console.log(response.status, loginResBody.slice(0,120) + "...");
            // console.log(...response.headers); // expand the headers class
            // console.log(this.cookies.sessionId);
            // console.log("and now I got the session cookie");
            return true;
        });
        this.login = () => __awaiter(this, void 0, void 0, function* () {
            if (this.loggedIn)
                return true;
            console.log("logging in to", this.account);
            try {
                yield this.bakeCloudflare();
                yield this.bakeSessionId();
                this.loggedIn = true;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        });
        this.requestData = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default("***DATA_URL***", {
                method: "get",
                headers: {
                    "Cookie": this.cookies.__cfduid + this.cookies.sessionId + this.cookies.pl,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                }
            });
            const body = yield response.text(); // await pauses the execution
            return this.parseData(body);
        });
        this.account = user;
        this.password = pass;
        this.loggedIn = false;
        // make the cookie jar
        const newJar = {
            __cfduid: "",
            sessionId: "",
            pl: "pl=",
        };
        this.cookies = newJar;
        // set up the data structures
        const theseTypes = {
            0: "GameDate",
            1: "User",
            2: "DatePlaced",
            3: "Sport",
            4: "Description",
            5: "RiskWin",
        };
        this.dataTypes = theseTypes;
        const newData = {};
        this.data = newData;
    }
    parseData(dataString) {
        // clear the old data
        this.data = {};
        const $ = cheerio_1.default.load(dataString);
        const $table = $("#content table");
        const $bodyRows = $table.find("tbody tr");
        // each row
        $bodyRows.each((i, row) => {
            const $tableCells = $(row).children("td");
            this.data[i] = {}; // initialize the row in the object
            // each cell
            $tableCells.each((j, cell) => {
                const cellType = this.dataTypes[j];
                let text = $(cell).text();
                text = text.replace(/(\r\n|\n|\r|\t)/gm, ""); // get rid of line breaks
                text = text.replace(/\s+/g, " "); // remove all extra whitespace
                if (cellType === "GameDate" && text !== "No Open Bets") {
                    text = text.slice(text.length - 16, text.length); // remove Ticket#
                }
                this.data[i][cellType] = text;
            }); // end cell
        }); // end row
        return this.data;
    }
    getData() {
        return this.data;
    }
}
exports.RoyaltyAccount = RoyaltyAccount;
