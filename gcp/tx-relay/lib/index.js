"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var tslib_1 = require("tslib");
var express_1 = tslib_1.__importDefault(require("express"));
var Signer_1 = require("./Signer");
var gae_env_secrets_1 = require("gae-env-secrets");
var DEFAULT_SERVICE_PORT = "8000";
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var app, port;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, gae_env_secrets_1.getEnvSecrets)({ autoDetect: true })];
                case 1:
                    _a.sent();
                    if (!process.env.AUTH_TOKEN) {
                        throw Error("AUTH_TOKEN not defined");
                    }
                    app = (0, express_1.default)();
                    port = parseInt(process.env.SERVICE_PORT || DEFAULT_SERVICE_PORT);
                    app.use(express_1.default.json());
                    app.get("/", function (_, res) {
                        res.send("OK");
                    });
                    app.get("/v1/signers", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c, _d;
                        return tslib_1.__generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (req.headers["x-auth-token"] !== process.env.AUTH_TOKEN) {
                                        res.status(401).send("Unauthorized");
                                        return [2 /*return*/];
                                    }
                                    res.setHeader("Content-Type", "application/json");
                                    _b = (_a = res).end;
                                    _d = (_c = JSON).stringify;
                                    return [4 /*yield*/, (0, Signer_1.getAllSignerAddresses)()];
                                case 1:
                                    _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/v1/txes/:network", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var network, result, e_1;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (req.headers["x-auth-token"] !== process.env.AUTH_TOKEN) {
                                        res.status(401).send("Unauthorized");
                                        return [2 /*return*/];
                                    }
                                    network = req.params["network"];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, Signer_1.sendTransaction)({
                                            to: req.body["to"],
                                            data: req.body["data"],
                                            gasLimit: Number(req.body["gasLimit"]),
                                            network: network,
                                        })];
                                case 2:
                                    result = _a.sent();
                                    res.status(200).send(JSON.stringify(result));
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_1 = _a.sent();
                                    console.log(e_1);
                                    res.status(500).send(JSON.stringify(e_1));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.listen(port, function () {
                        console.log("Listening on port ".concat(port));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
if (require.main === module) {
    require("dotenv").config();
    main();
}
//# sourceMappingURL=index.js.map