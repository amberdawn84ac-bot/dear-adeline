#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Configuration - update these with your actual values
var API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Helper function to make API calls
function callAPI(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, options) {
        var url, response;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(API_BASE_URL).concat(endpoint);
                    return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { headers: __assign({ 'Content-Type': 'application/json' }, options.headers) }))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("API call failed: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Create the MCP server
var server = new index_js_1.Server({
    name: 'dear-adeline',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: [
                    {
                        name: 'generate_personalized_lesson',
                        description: 'Generate a personalized lesson for a student based on their interests and learning level. Requires topic, grade level, and optional student interests.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                topic: {
                                    type: 'string',
                                    description: 'The topic or subject for the lesson',
                                },
                                gradeLevel: {
                                    type: 'string',
                                    description: 'Student grade level (e.g., "5th grade", "high school")',
                                },
                                interests: {
                                    type: 'string',
                                    description: 'Optional: Student interests to personalize the lesson',
                                },
                            },
                            required: ['topic', 'gradeLevel'],
                        },
                    },
                    {
                        name: 'chat_with_adeline',
                        description: 'Send a message to Adeline, the AI learning companion, and get a response. Use this for educational questions, learning support, or conversation.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'The message to send to Adeline',
                                },
                                userId: {
                                    type: 'string',
                                    description: 'Optional: User ID for personalized responses',
                                },
                            },
                            required: ['message'],
                        },
                    },
                    {
                        name: 'get_student_interests',
                        description: 'Retrieve saved interests for a student to help personalize learning content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userId: {
                                    type: 'string',
                                    description: 'The student user ID',
                                },
                            },
                            required: ['userId'],
                        },
                    },
                    {
                        name: 'save_student_interests',
                        description: 'Save or update interests for a student profile',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userId: {
                                    type: 'string',
                                    description: 'The student user ID',
                                },
                                interests: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: 'List of student interests',
                                },
                            },
                            required: ['userId', 'interests'],
                        },
                    },
                    {
                        name: 'list_library_projects',
                        description: 'Get a list of available projects from the Art, Farm, and Science library',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    enum: ['art', 'farm', 'science', 'all'],
                                    description: 'Filter by project category',
                                },
                            },
                        },
                    },
                ],
            }];
    });
}); });
// Handle tool execution
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, _b, result, result, result, result, category, endpoint, result, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                if (!args) {
                    throw new Error('Missing arguments');
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 14, , 15]);
                _b = name;
                switch (_b) {
                    case 'generate_personalized_lesson': return [3 /*break*/, 2];
                    case 'chat_with_adeline': return [3 /*break*/, 4];
                    case 'get_student_interests': return [3 /*break*/, 6];
                    case 'save_student_interests': return [3 /*break*/, 8];
                    case 'list_library_projects': return [3 /*break*/, 10];
                }
                return [3 /*break*/, 12];
            case 2: return [4 /*yield*/, callAPI('/api/adeline/generate-lesson', {
                    method: 'POST',
                    body: JSON.stringify({
                        topic: args.topic,
                        gradeLevel: args.gradeLevel,
                        interests: args.interests,
                    }),
                })];
            case 3:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 4: return [4 /*yield*/, callAPI('/api/chat', {
                    method: 'POST',
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: args.message }],
                        userId: args.userId,
                    }),
                })];
            case 5:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 6: return [4 /*yield*/, callAPI("/api/student-interests/get?userId=".concat(args.userId))];
            case 7:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 8: return [4 /*yield*/, callAPI('/api/student-interests/save', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: args.userId,
                        interests: args.interests,
                    }),
                })];
            case 9:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 10:
                category = args.category || 'all';
                endpoint = category === 'all'
                    ? '/api/library/projects'
                    : "/api/library/projects?category=".concat(category);
                return [4 /*yield*/, callAPI(endpoint)];
            case 11:
                result = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    }];
            case 12: throw new Error("Unknown tool: ".concat(name));
            case 13: return [3 /*break*/, 15];
            case 14:
                error_1 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: "Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)),
                            },
                        ],
                        isError: true,
                    }];
            case 15: return [2 /*return*/];
        }
    });
}); });
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error('Dear Adeline MCP Server running on stdio');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error('Server error:', error);
    process.exit(1);
});
