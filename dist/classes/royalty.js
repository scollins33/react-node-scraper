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
class RoyaltyAccount {
    constructor(user, pass) {
        this.login = () => __awaiter(this, void 0, void 0, function* () {
            // first we need to get the CloudFlare cookie
            const baseURL = "***BASE_URL***";
            const baseResponse = yield node_fetch_1.default(baseURL, {
                method: "get",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
                }
            });
            const baseBody = yield baseResponse.text(); // await pauses the execution
            const baseCookie = baseResponse.headers.get("set-cookie"); // Header obj (class), ! makes TS trust this isn't null
            this.cookies.__cfduid = baseCookie.slice(0, baseCookie.indexOf(";") + 1);
            console.log("-----------------");
            console.log(baseResponse.status, baseBody.slice(0, 120) + "...");
            // console.log(baseResponse.headers.get("set-cookie"));
            console.log(this.cookies.__cfduid);
            // now we can try to log in and get a session going
            const loginURL = baseURL + "DGS/login.aspx";
            const loginResponse = yield node_fetch_1.default(loginURL, {
                method: "post",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Cookie": this.cookies.__cfduid,
                },
                body: `IdBook=&account=${this.account}&password=${this.password}`,
                redirect: "manual" // so that we get the 302 and stop
            });
            const loginResBody = yield loginResponse.text(); // await pauses the execution
            const loginCookie = loginResponse.headers.get("set-cookie"); // Header obj (class), ! makes TS trust this isn't null
            this.cookies.sessionId = loginCookie.slice(0, loginCookie.indexOf(";") + 1);
            console.log("-----------------");
            console.log(loginResponse.status, loginResBody.slice(0, 120) + "...");
            // console.log(...loginResponse.headers); // expand the headers class
            console.log(this.cookies.sessionId);
        });
        this.account = user;
        this.password = pass;
        // make the cookie jar
        const newJar = {
            __cfduid: "",
            sessionId: "",
            pl: "pl=",
        };
        this.cookies = newJar;
    }
}
exports.RoyaltyAccount = RoyaltyAccount;
