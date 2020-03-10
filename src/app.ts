import express, { Application, Request, Response, NextFunction } from "express";
import cheerio from "cheerio";

import { RoyaltyAccount } from "./classes/royalty";

interface AccountList {
    [key: string]: RoyaltyAccount,
}

const gPORT: number = 3000;
const gAPP: Application = express();

gAPP.get("/", (req: Request, res: Response, next: NextFunction) => res.send("I'm listening, what is your command?"));

const accounts: AccountList = {
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"),
};
// const tester = accounts["***REMOVED***"];
// const tester = accounts["***REMOVED***"];
// console.table(tester);

gAPP.get("/api/data/:account", async (req: Request, res: Response, next: NextFunction) => {
    let targetAccount: RoyaltyAccount;

    if (accounts.hasOwnProperty(req.params.account)) {
        targetAccount = accounts[req.params.account];
    }
    else return res.status(400).send("Account does not exist");
    
    await targetAccount.login();
    console.log("WEESAH LOGGED IN");

    let htmlString = await targetAccount.pullData();
    
    // clear the old data
    targetAccount.data = {};

    const $ = cheerio.load(htmlString);
    const $table = $("#content table");
    const $bodyRows = $table.find("tbody tr");
    
    // each row
    $bodyRows.each(function(this: CheerioElement, i: number, row: CheerioElement) {
        const $tableCells = $(this).children("td");
        targetAccount.data[i] = {}; // initialize the row in the object

        // each cell
        $tableCells.each(function(this: CheerioElement, j: number, cell: CheerioElement) {
            const cellType = targetAccount.dataTypes[j];
            let text = $(this).text();

            text = text.replace(/(\r\n|\n|\r|\t)/gm,""); // get rid of line breaks
            text = text.replace(/\s+/g," "); // remove all extra whitespace
            if (cellType === "GameDate") text = text.slice(text.length-16, text.length); // remove Ticket#

            if (text === "No Open Bets") console.log("..... NO BETS!!!");

            targetAccount.data[i][cellType] = text;
        });

    });

    // console.log(data);
    res.send(targetAccount.data);
});

gAPP.listen(gPORT, () => console.log(`Server running on ${gPORT}`));
