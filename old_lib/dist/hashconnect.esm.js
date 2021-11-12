import { getBootstrapNodes, Waku, WakuMessage } from 'js-waku';
import { BehaviorSubject } from 'rxjs';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var test = function (test) {
    console.log("Hi");
};

var protons = require('protons');
var sayHi = function (test) {
    console.log("Hi");
};
var ContentTopic = "/waku/2/default-waku/proto";
var proto = protons("\nmessage SimpleChatMessage {\n  uint64 timestamp = 1;\n  string text = 2;\n}\n");
var waku;
var messageSource = new BehaviorSubject('');
var currentMessage = messageSource.asObservable();
var initWaku = function () { return __awaiter(void 0, void 0, void 0, function () {
    var nodes, processIncMsg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Waku.create({ bootstrap: true })];
            case 1:
                waku = _a.sent();
                return [4 /*yield*/, getBootstrapNodes()];
            case 2:
                nodes = _a.sent();
                return [4 /*yield*/, Promise.all(nodes.map(function (addr) { return waku.dial(addr); }))];
            case 3:
                _a.sent();
                console.log("Waiting for peer...");
                return [4 /*yield*/, waku.waitForConnectedPeer()];
            case 4:
                _a.sent();
                processIncMsg = function (wakuMessage) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, timestamp, text;
                    return __generator(this, function (_b) {
                        if (!wakuMessage.payload)
                            return [2 /*return*/];
                        _a = proto.SimpleChatMessage.decode(wakuMessage.payload), timestamp = _a.timestamp, text = _a.text;
                        console.log("Message Received: " + text + ", sent at " + timestamp.toString());
                        messageSource.next(text);
                        return [2 /*return*/];
                    });
                }); };
                waku.relay.addObserver(processIncMsg, [ContentTopic]);
                console.log("init done");
                return [2 /*return*/];
        }
    });
}); };
var sendMessage = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, wakuMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = proto.SimpleChatMessage.encode({
                    timestamp: Date.now(),
                    text: message
                });
                return [4 /*yield*/, WakuMessage.fromBytes(payload, ContentTopic)];
            case 1:
                wakuMessage = _a.sent();
                console.log("Sending payload");
                return [4 /*yield*/, waku.relay.send(wakuMessage)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };

export { currentMessage, initWaku, sayHi, sendMessage, test };
