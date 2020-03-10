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
const royalty_1 = require("./classes/royalty");
const gPORT = 3000;
const gAPP = express_1.default();
gAPP.get("/", (req, res, next) => res.send("I'm listening, what is your command?"));
const tester = new royalty_1.RoyaltyAccount("***REMOVED***", "***REMOVED***");
console.table(tester);
gAPP.get("/tester", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield tester.login();
    console.log("WEESAH LOGGED IN");
    // const tableString = await tester.pullData();
    res.send("It is done my lord.");
}));
gAPP.listen(gPORT, () => console.log(`Server running on ${gPORT}`));
