/* ----------------------
    Module Imports
---------------------- */
import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

/* ----------------------
    Local Imports
---------------------- */
import { RoyaltyAccount } from "./classes/royalty";

/* ----------------------
    Custom Interfaces
---------------------- */
interface AccountList {
    [key: string]: RoyaltyAccount,
}

interface UrlObject {
    baseUrl: string,
    loginUrl: string,
    dataUrl: string,
}

/* ----------------------
    Globals
---------------------- */
const gAPP: Application = express();
const gACCOUNTS: AccountList = {};

// read in Sync mode since we are setting up the app and split it on the newlines
const accountsFile: string[] = fs.readFileSync(path.join(__dirname + "/../accounts.txt"), "utf8").split("\r\n");
const urlsFile: string[] = fs.readFileSync(path.join(__dirname + "/../urls.txt"), "utf8").split(",");

const urlObj: UrlObject = {
    baseUrl: urlsFile[1],
    loginUrl: urlsFile[2],
    dataUrl: urlsFile[3],
}

accountsFile.forEach(each => {
    // part0 = type, part1 = username, part2 = password
    const parts: string[] = each.split(",");
    if (parts[0] === "Royalty") gACCOUNTS[parts[1]] = new RoyaltyAccount(parts[1], parts[2], urlObj);
});

/* ----------------------
    App Setup
---------------------- */
gAPP.use("/node_modules", express.static(path.join(__dirname + "/../../node_modules")));
gAPP.use("/dist", express.static(path.join(__dirname + "/../../client/dist")));
gAPP.use("/css", express.static(path.join(__dirname + "/../../client")));

gAPP.get("/", (req: Request, res: Response, next: NextFunction) => {
    const indexPath = path.join(__dirname + "/../../client/index.html");
    console.log("serving index.html from", indexPath);
    res.sendFile(indexPath);
});

gAPP.get("/ping", (req: Request, res: Response, next: NextFunction) => {
    return res.send("pong");
});

/*      INFO ROUTES     */

gAPP.get("/api/info/accounts", async (req: Request, res: Response, next: NextFunction) => {
    const accArray = [];

    for (const account in gACCOUNTS) {
        accArray.push(gACCOUNTS[account].account);
    }

    res.json(accArray);
});

/*      DATA ROUTES     */

gAPP.get("/api/data/account/:account", async (req: Request, res: Response, next: NextFunction) => {
    let targetAccount: RoyaltyAccount;

    if (gACCOUNTS.hasOwnProperty(req.params.account)) {
        targetAccount = gACCOUNTS[req.params.account];
    }
    else return res.status(400).send("Account does not exist");
    
    await targetAccount.login();
    const data = await targetAccount.requestData();
    
    // console.log(data);
    res.json(data);
});

gAPP.get("/api/data/accounts", async (req: Request, res: Response, next: NextFunction) => {
    const jsonBundle: any = {};
    const accounts = Object.keys(gACCOUNTS);

    console.log("GETTING THE ACCOUNTS");

    // catch all of the promises in an array
    const promises = accounts.map(async account => {
        await gACCOUNTS[account].login();
        const data = await gACCOUNTS[account].requestData();

        jsonBundle[account] = data;
        return true;
    });

    // now we wait for all of the map's promises to complete
    await Promise.all(promises);
    res.json(jsonBundle);
});

// gAPP.get("/api/test", async (req: Request, res: Response, next: NextFunction) => {
//     const tester = gACCOUNTS[""];
//     await tester.bakeCloudflare();
//     await tester.bakeSessionId();
//     res.status(200).send("Tested");
// });

/* ----------------------
    Start 'er up!
---------------------- */
gAPP.listen(process.env.PORT || 8080, () => console.log(`Server running on ${process.env.PORT || 8080}`));
