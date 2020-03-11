import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";

import { RoyaltyAccount } from "./classes/royalty";

interface AccountList {
    [key: string]: RoyaltyAccount,
}

const gPORT: number = 3000;
const gAPP: Application = express();

const gACCOUNTS: AccountList = {
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    // "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"), // bad login
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
};

gAPP.use(express.static(path.join(__dirname + "/../dist/public")));

gAPP.get("/", (req: Request, res: Response, next: NextFunction) => {
    console.log("serving index.html from", __dirname);
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

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

gAPP.get("/api/test", async (req: Request, res: Response, next: NextFunction) => {
    const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // console.table(tester);

    await tester.bakeCloudflare();
    await tester.bakeSessionId();

    res.status(200).send("Tested");
});

gAPP.listen(gPORT, () => console.log(`Server running on ${gPORT}`));
