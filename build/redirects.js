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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var redirectsBaseUrl = "https://www.mongodb.com/";
var applyReplacements = function (replacements, text) {
    return Object.entries(replacements).reduce(function (replacedText, _a) {
        var _b = __read(_a, 2), from = _b[0], to = _b[1];
        return replacedText.replace("${" + from + "}", to);
    }, text);
};
var unapplyReplacements = function (replacements, text) {
    return Object.entries(replacements)
        .reverse()
        .reduce(function (replacedText, _a) {
        var _b = __read(_a, 2), from = _b[0], to = _b[1];
        return replacedText.replace(to, "${" + from + "}");
    }, text);
};
var withTrailingSlash = function (text) {
    return text.replace(/\/?$/, "/");
};
var parseRedirects = function (text) {
    var result = {
        replacements: {},
        redirects: {},
        redirectCount: 0,
    };
    var lines = text.split("\n");
    lines.forEach(function (line) {
        if (/^\s*#/.test(line)) {
            // Comment
            return;
        }
        var matches = /^define:\s*([^\s]+)\s+([^\s]+)\s*$/.exec(line);
        if (matches != null) {
            result.replacements[matches[1]] = applyReplacements(result.replacements, matches[2]);
            return;
        }
        matches = /^raw:\s*([^\s]+)\s+->\s+([^\s]+)\s*$/.exec(line);
        if (matches != null) {
            ++result.redirectCount;
            result.redirects["".concat(redirectsBaseUrl).concat(matches[1])] = matches[2];
        }
    });
    result.redirects = Object.fromEntries(Object.entries(result.redirects).map(function (_a) {
        var _b = __read(_a, 2), from = _b[0], to = _b[1];
        return [
            withTrailingSlash(applyReplacements(result.replacements, from)),
            withTrailingSlash(applyReplacements(result.replacements, to)),
        ];
    }));
    return result;
};
var getUltimateDestination = function (redirects, target, chain) {
    // If any entry's destination is another entry's source, then copy that entry's destination.
    var nextTarget = redirects[target];
    if (nextTarget === undefined) {
        return target;
    }
    if (nextTarget === chain[0]) {
        throw new Error("Circular dependency detected: ".concat(chain.join(" -> "), " -> ").concat(target, " -> ").concat(nextTarget));
    }
    return getUltimateDestination(redirects, nextTarget, __spreadArray(__spreadArray([], __read(chain), false), [nextTarget], false));
};
var redirects = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var rawText, _a, redirects, replacements, redirectCount, condensedRedirects, header, body;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fs_1.promises.readFile(path, "utf8")];
            case 1:
                rawText = _b.sent();
                _a = parseRedirects(rawText), redirects = _a.redirects, replacements = _a.replacements, redirectCount = _a.redirectCount;
                console.log('checking', redirectCount, 'redirects.');
                condensedRedirects = Object.fromEntries(Object.entries(redirects).map(function (_a) {
                    var _b = __read(_a, 2), from = _b[0], to = _b[1];
                    var ultimateDestination = getUltimateDestination(redirects, to, [from]);
                    return [
                        unapplyReplacements(replacements, from.substring(redirectsBaseUrl.length)),
                        unapplyReplacements(replacements, ultimateDestination),
                    ];
                }));
                header = Object.entries(replacements)
                    .map(function (_a) {
                    var _b = __read(_a, 2), from = _b[0], to = _b[1];
                    return "define: ".concat(from, " ").concat(to);
                })
                    .join("\n");
                body = Object.entries(condensedRedirects)
                    .map(function (_a) {
                    var _b = __read(_a, 2), from = _b[0], to = _b[1];
                    return "raw: ".concat(from, " -> ").concat(to);
                })
                    .join("\n");
                return [2 /*return*/];
        }
    });
}); };
var commandModule = {
    command: "redirects <path>",
    handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var path, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    path = args.path;
                    return [4 /*yield*/, redirects(path)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    describe: "Fix up rST",
};
exports.default = commandModule;
