import express, { Application, Request, Response, NextFunction } from "express";
import request from "request";
import rp from "request-promise";

import { RoyaltyAccount } from "./classes/royalty";

const gPORT: number = 3000;
const gAPP: Application = express();

gAPP.get("/", (req: Request, res: Response, next: NextFunction) => res.send("I'm listening, what is your command?"));

const tester = new RoyaltyAccount("***REMOVED***", "***REMOVED***");
console.table(tester);
gAPP.get("/tester", async (req: Request, res: Response, next: NextFunction) => {
    await tester.login()
    // .then(() => {
        console.log("WEESAH LOGGED IN");
        res.send("It is done my lord.");
    // });
});

gAPP.listen(gPORT, () => console.log(`Server running on ${gPORT}`));
