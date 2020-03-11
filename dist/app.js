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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const royalty_1 = require("./classes/royalty");
const gPORT = 3000;
const gAPP = express_1.default();
const gACCOUNTS = {
    "***REMOVED***": new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    "***REMOVED***": new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***"),
    // "***REMOVED***": new RoyaltyAccount("***REMOVED***", "***REMOVED***"), // bad login
    "***REMOVED***": new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***"),
};
gAPP.use(express_1.default.static(path_1.default.join(__dirname + "/../dist/public")));
gAPP.get("/", (req, res, next) => {
    console.log("serving index.html from", __dirname);
    res.sendFile(path_1.default.join(__dirname + "/public/index.html"));
});
gAPP.get("/api/data/account/:account", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let targetAccount;
    if (gACCOUNTS.hasOwnProperty(req.params.account)) {
        targetAccount = gACCOUNTS[req.params.account];
    }
    else
        return res.status(400).send("Account does not exist");
    yield targetAccount.login();
    const data = yield targetAccount.requestData();
    // console.log(data);
    res.json(data);
}));
gAPP.get("/api/data/accounts", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jsonBundle = {};
    const accounts = Object.keys(gACCOUNTS);
    // catch all of the promises in an array
    const promises = accounts.map((account) => __awaiter(void 0, void 0, void 0, function* () {
        yield gACCOUNTS[account].login();
        const data = yield gACCOUNTS[account].requestData();
        jsonBundle[account] = data;
        return true;
    }));
    // now we wait for all of the map's promises to complete
    yield Promise.all(promises);
    res.json(jsonBundle);
}));
gAPP.get("/api/test", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // const tester = gACCOUNTS["***REMOVED***"];
    // console.table(tester);
    yield tester.bakeCloudflare();
    yield tester.bakeSessionId();
    res.status(200).send("Tested");
}));
gAPP.listen(gPORT, () => console.log(`Server running on ${gPORT}`));
