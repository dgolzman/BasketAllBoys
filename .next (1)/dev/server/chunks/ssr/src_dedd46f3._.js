module.exports = [
"[project]/src/components/page-guide.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PageGuide
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function PageGuide({ title = "ℹ️ Guía Rápida", children }) {
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    if (!isVisible) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: ()=>setIsVisible(true),
            style: {
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: 'var(--primary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer'
            },
            children: "Mostrar Ayuda"
        }, void 0, false, {
            fileName: "[project]/src/components/page-guide.tsx",
            lineNumber: 15,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            marginBottom: '1.5rem',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: {
                            margin: 0,
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase'
                        },
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/page-guide.tsx",
                        lineNumber: 43,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsVisible(false),
                        style: {
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            color: 'var(--foreground)',
                            opacity: 0.5
                        },
                        title: "Ocultar ayuda",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/components/page-guide.tsx",
                        lineNumber: 44,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/page-guide.tsx",
                lineNumber: 42,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '0.85rem',
                    color: 'var(--foreground)',
                    lineHeight: '1.5'
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/page-guide.tsx",
                lineNumber: 59,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/page-guide.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluatePlayerStatus",
    ()=>evaluatePlayerStatus,
    "formatCurrency",
    ()=>formatCurrency,
    "getCategory",
    ()=>getCategory
]);
function getCategory(player, mappings) {
    // 1. Manual override priority
    if (player.category) return player.category;
    // 2. BirthDate logic
    if (!player.birthDate) return "REVISAR";
    const date = new Date(player.birthDate);
    if (isNaN(date.getTime()) || date.getTime() <= 0) return "REVISAR";
    const year = date.getFullYear();
    if (year <= 1970) return "REVISAR";
    if (mappings && mappings.length > 0) {
        const found = mappings.find((m)=>year >= m.minYear && year <= m.maxYear);
        if (found) return found.category;
    }
    const today = new Date();
    const currentYear = today.getFullYear();
    const age = currentYear - year;
    if (age < 9) return "Mosquitos";
    if (age <= 10) return "Pre-Mini";
    if (age <= 12) return "Mini";
    if (age <= 13) return "U13";
    if (age <= 15) return "U15";
    if (age <= 17) return "U17";
    if (age <= 19) return "U19";
    return "Primera";
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}
function evaluatePlayerStatus(currentStatus, dni, birthDate) {
    if (currentStatus !== 'REVISAR') return currentStatus;
    if (!dni || dni.startsWith('TEMP-')) return 'REVISAR';
    if (!birthDate) return 'REVISAR';
    const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (isNaN(date.getTime())) return 'REVISAR';
    const year = date.getFullYear();
    // Default/Legacy invalid years
    if (year <= 1970 || year === 1900) return 'REVISAR';
    // If we are here, data is real and complete. Auto-promote to ACTIVO.
    return 'ACTIVO';
}
}),
"[project]/src/lib/data:196ee6 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bulkUpdatePlayers",
    ()=>$$RSC_SERVER_ACTION_0
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"605e77fa7193052f6437ee7c223289f1becabdea3e":"bulkUpdatePlayers"},"src/lib/bulk-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("605e77fa7193052f6437ee7c223289f1becabdea3e", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkUpdatePlayers");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYnVsay1hY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc2VydmVyJztcclxuXHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcclxuaW1wb3J0IHsgcmV2YWxpZGF0ZVBhdGggfSBmcm9tIFwibmV4dC9jYWNoZVwiO1xyXG5pbXBvcnQgeyBldmFsdWF0ZVBsYXllclN0YXR1cyB9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa1VwZGF0ZVBsYXllcnMoXHJcbiAgICBwbGF5ZXJJZHM6IHN0cmluZ1tdLFxyXG4gICAgdXBkYXRlczoge1xyXG4gICAgICAgIGNhdGVnb3J5Pzogc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICB0aXJhPzogc3RyaW5nLFxyXG4gICAgICAgIHN0YXR1cz86IHN0cmluZyxcclxuICAgICAgICBzY2hvbGFyc2hpcD86IGJvb2xlYW4sXHJcbiAgICAgICAgcGxheXNQcmltZXJhPzogYm9vbGVhbixcclxuICAgICAgICBvYnNlcnZhdGlvbnM/OiBzdHJpbmcgfCBudWxsXHJcbiAgICB9XHJcbikge1xyXG4gICAgaWYgKCFwbGF5ZXJJZHMubGVuZ3RoKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJObyBzZSBzZWxlY2Npb25hcm9uIGp1Z2Fkb3Jlc1wiIH07XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBXZSBmZXRjaCBwbGF5ZXJzIHRvIGV2YWx1YXRlIHN0YXR1cyBjb3JyZWN0bHkgZm9yIGVhY2hcclxuICAgICAgICBjb25zdCBwbGF5ZXJzID0gYXdhaXQgcHJpc21hLnBsYXllci5maW5kTWFueSh7XHJcbiAgICAgICAgICAgIHdoZXJlOiB7IGlkOiB7IGluOiBwbGF5ZXJJZHMgfSB9LFxyXG4gICAgICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUsIHN0YXR1czogdHJ1ZSwgZG5pOiB0cnVlLCBiaXJ0aERhdGU6IHRydWUgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHBsYXllciBvZiBwbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IHVwZGF0ZXMuc3RhdHVzIHx8IHBsYXllci5zdGF0dXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsU3RhdHVzID0gZXZhbHVhdGVQbGF5ZXJTdGF0dXMobmV3U3RhdHVzLCBwbGF5ZXIuZG5pLCBwbGF5ZXIuYmlydGhEYXRlKTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHByaXNtYS5wbGF5ZXIudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBwbGF5ZXIuaWQgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi51cGRhdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogZmluYWxTdGF0dXNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXZhbGlkYXRlUGF0aChcIi9kYXNoYm9hcmQvcGxheWVyc1wiKTtcclxuICAgICAgICByZXZhbGlkYXRlUGF0aChcIi9kYXNoYm9hcmQvY2F0ZWdvcmllc1wiKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBgU2UgYWN0dWFsaXphcm9uICR7cGxheWVySWRzLmxlbmd0aH0ganVnYWRvcmVzLmAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJFcnJvciBlbiBhY3R1YWxpemFjacOzbiBtYXNpdmE6IFwiICsgZXJyb3IubWVzc2FnZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtEZWxldGVQbGF5ZXJzKHBsYXllcklkczogc3RyaW5nW10pIHtcclxuICAgIGlmICghcGxheWVySWRzLmxlbmd0aCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwiTm8gc2Ugc2VsZWNjaW9uYXJvbiBqdWdhZG9yZXNcIiB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gV2FybmluZzogVGhpcyBpcyBkZXN0cnVjdGl2ZS4gQWRtaW4gb25seSBjaGVjayBzaG91bGQgYmUgYXQgcm91dGUgbGV2ZWwuXHJcbiAgICAgICAgYXdhaXQgcHJpc21hLnBsYXllci5kZWxldGVNYW55KHtcclxuICAgICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgICAgIGlkOiB7IGluOiBwbGF5ZXJJZHMgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldmFsaWRhdGVQYXRoKFwiL2Rhc2hib2FyZC9wbGF5ZXJzXCIpO1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6IGBTZSBlbGltaW5hcm9uICR7cGxheWVySWRzLmxlbmd0aH0ganVnYWRvcmVzLmAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJFcnJvciBhbCBlbGltaW5hciBqdWdhZG9yZXM6IFwiICsgZXJyb3IubWVzc2FnZSB9O1xyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiNlJBTXNCLDhMQUFBIn0=
}),
"[project]/src/lib/data:de89d7 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bulkDeletePlayers",
    ()=>$$RSC_SERVER_ACTION_1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40a92a4d675b3b4d51ffbb58ef8a32e71f9d6f0ae5":"bulkDeletePlayers"},"src/lib/bulk-actions.ts",""] */ "use turbopack no side effects";
;
const $$RSC_SERVER_ACTION_1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40a92a4d675b3b4d51ffbb58ef8a32e71f9d6f0ae5", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkDeletePlayers");
;
 //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYnVsay1hY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc2VydmVyJztcclxuXHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcclxuaW1wb3J0IHsgcmV2YWxpZGF0ZVBhdGggfSBmcm9tIFwibmV4dC9jYWNoZVwiO1xyXG5pbXBvcnQgeyBldmFsdWF0ZVBsYXllclN0YXR1cyB9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa1VwZGF0ZVBsYXllcnMoXHJcbiAgICBwbGF5ZXJJZHM6IHN0cmluZ1tdLFxyXG4gICAgdXBkYXRlczoge1xyXG4gICAgICAgIGNhdGVnb3J5Pzogc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICB0aXJhPzogc3RyaW5nLFxyXG4gICAgICAgIHN0YXR1cz86IHN0cmluZyxcclxuICAgICAgICBzY2hvbGFyc2hpcD86IGJvb2xlYW4sXHJcbiAgICAgICAgcGxheXNQcmltZXJhPzogYm9vbGVhbixcclxuICAgICAgICBvYnNlcnZhdGlvbnM/OiBzdHJpbmcgfCBudWxsXHJcbiAgICB9XHJcbikge1xyXG4gICAgaWYgKCFwbGF5ZXJJZHMubGVuZ3RoKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJObyBzZSBzZWxlY2Npb25hcm9uIGp1Z2Fkb3Jlc1wiIH07XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBXZSBmZXRjaCBwbGF5ZXJzIHRvIGV2YWx1YXRlIHN0YXR1cyBjb3JyZWN0bHkgZm9yIGVhY2hcclxuICAgICAgICBjb25zdCBwbGF5ZXJzID0gYXdhaXQgcHJpc21hLnBsYXllci5maW5kTWFueSh7XHJcbiAgICAgICAgICAgIHdoZXJlOiB7IGlkOiB7IGluOiBwbGF5ZXJJZHMgfSB9LFxyXG4gICAgICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUsIHN0YXR1czogdHJ1ZSwgZG5pOiB0cnVlLCBiaXJ0aERhdGU6IHRydWUgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHBsYXllciBvZiBwbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IHVwZGF0ZXMuc3RhdHVzIHx8IHBsYXllci5zdGF0dXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsU3RhdHVzID0gZXZhbHVhdGVQbGF5ZXJTdGF0dXMobmV3U3RhdHVzLCBwbGF5ZXIuZG5pLCBwbGF5ZXIuYmlydGhEYXRlKTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHByaXNtYS5wbGF5ZXIudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiBwbGF5ZXIuaWQgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi51cGRhdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogZmluYWxTdGF0dXNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXZhbGlkYXRlUGF0aChcIi9kYXNoYm9hcmQvcGxheWVyc1wiKTtcclxuICAgICAgICByZXZhbGlkYXRlUGF0aChcIi9kYXNoYm9hcmQvY2F0ZWdvcmllc1wiKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBgU2UgYWN0dWFsaXphcm9uICR7cGxheWVySWRzLmxlbmd0aH0ganVnYWRvcmVzLmAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJFcnJvciBlbiBhY3R1YWxpemFjacOzbiBtYXNpdmE6IFwiICsgZXJyb3IubWVzc2FnZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtEZWxldGVQbGF5ZXJzKHBsYXllcklkczogc3RyaW5nW10pIHtcclxuICAgIGlmICghcGxheWVySWRzLmxlbmd0aCkgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IFwiTm8gc2Ugc2VsZWNjaW9uYXJvbiBqdWdhZG9yZXNcIiB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gV2FybmluZzogVGhpcyBpcyBkZXN0cnVjdGl2ZS4gQWRtaW4gb25seSBjaGVjayBzaG91bGQgYmUgYXQgcm91dGUgbGV2ZWwuXHJcbiAgICAgICAgYXdhaXQgcHJpc21hLnBsYXllci5kZWxldGVNYW55KHtcclxuICAgICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgICAgIGlkOiB7IGluOiBwbGF5ZXJJZHMgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldmFsaWRhdGVQYXRoKFwiL2Rhc2hib2FyZC9wbGF5ZXJzXCIpO1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6IGBTZSBlbGltaW5hcm9uICR7cGxheWVySWRzLmxlbmd0aH0ganVnYWRvcmVzLmAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogXCJFcnJvciBhbCBlbGltaW5hciBqdWdhZG9yZXM6IFwiICsgZXJyb3IubWVzc2FnZSB9O1xyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiNlJBZ0RzQiw4TEFBQSJ9
}),
"[project]/src/components/sortable-header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SortableHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
function SortableHeader({ label, value, currentSort, currentOrder, className }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const handleSort = ()=>{
        const params = new URLSearchParams(searchParams.toString());
        if (currentSort === value) {
            params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            params.set('sort', value);
            params.set('sortOrder', 'asc');
        }
        router.push(`?${params.toString()}`);
    };
    const isSorted = currentSort === value;
    const arrow = isSorted ? currentOrder === 'asc' ? ' ↑' : ' ↓' : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
        className: className,
        style: {
            padding: '1rem',
            color: 'var(--foreground)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none'
        },
        onClick: handleSort,
        children: [
            label,
            arrow
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/sortable-header.tsx",
        lineNumber: 32,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/app/dashboard/players/player-list.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$3a$196ee6__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/lib/data:196ee6 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$3a$de89d7__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/lib/data:de89d7 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/sortable-header.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
function PlayerList({ initialPlayers, role, categories, mappings, currentSort, currentOrder }) {
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [players, setPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialPlayers);
    const [isUpdating, setIsUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const canEdit = role === 'ADMIN' || role === 'OPERADOR';
    // Helper to preserve filters when navigating to edit
    const getEditLink = (playerId)=>{
        const currentFilters = searchParams.toString();
        return currentFilters ? `/dashboard/players/${playerId}/edit?returnFilters=${encodeURIComponent(currentFilters)}` : `/dashboard/players/${playerId}/edit`;
    };
    const toggleSelectAll = ()=>{
        if (selectedIds.length === players.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(players.map((p)=>p.id));
        }
    };
    const toggleSelect = (id)=>{
        setSelectedIds((prev)=>prev.includes(id) ? prev.filter((i)=>i !== id) : [
                ...prev,
                id
            ]);
    };
    const handleBulkUpdate = async (updates)=>{
        if (!selectedIds.length) return;
        if (!confirm(`¿Estás seguro de actualizar ${selectedIds.length} jugadores?`)) return;
        setIsUpdating(true);
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$3a$196ee6__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkUpdatePlayers"])(selectedIds, updates);
        if (res.success) {
            alert(res.message);
            window.location.reload(); // Quickest way to sync server state
        } else {
            alert(res.message);
        }
        setIsUpdating(false);
    };
    const handleBulkDelete = async ()=>{
        if (!selectedIds.length || !canEdit) return;
        if (!confirm(`⚠️ PELIGRO: ¿Estás seguro de ELIMINAR permanentemente a ${selectedIds.length} jugadores?`)) return;
        setIsUpdating(true);
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$3a$de89d7__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkDeletePlayers"])(selectedIds);
        if (res.success) {
            alert(res.message);
            window.location.reload();
        } else {
            alert(res.message);
        }
        setIsUpdating(false);
    };
    const getWhatsAppLink = (phone)=>{
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            selectedIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--secondary)',
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 100,
                    border: '1px solid var(--border)',
                    animation: 'slideUp 0.3s ease-out',
                    color: 'var(--foreground)',
                    width: '90%',
                    maxWidth: '800px'
                },
                className: "jsx-8553baf8a826d52f",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: 'bold',
                            width: '100%',
                            textAlign: 'center',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '0.5rem'
                        },
                        className: "jsx-8553baf8a826d52f",
                        children: [
                            selectedIds.length,
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--foreground)',
                                    fontWeight: 'normal'
                                },
                                className: "jsx-8553baf8a826d52f",
                                children: "jugadores seleccionados"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 114,
                                columnNumber: 46
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                        lineNumber: 113,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        },
                        className: "jsx-8553baf8a826d52f",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                style: {
                                    padding: '0.4rem',
                                    fontSize: '0.85rem',
                                    width: 'auto',
                                    background: 'var(--input)',
                                    border: '1px solid var(--border)',
                                    height: '36px'
                                },
                                onChange: (e)=>{
                                    if (e.target.value) {
                                        handleBulkUpdate({
                                            tira: e.target.value
                                        });
                                        e.target.value = "";
                                    }
                                },
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "input",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Tira..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 129,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Masculino A",
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Masc A"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 130,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Masculino B",
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Masc B"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 131,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Femenino",
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Fem"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 132,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 118,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                style: {
                                    padding: '0.4rem',
                                    fontSize: '0.85rem',
                                    width: 'auto',
                                    background: 'var(--input)',
                                    border: '1px solid var(--border)',
                                    height: '36px'
                                },
                                onChange: (e)=>{
                                    if (e.target.value) {
                                        handleBulkUpdate({
                                            category: e.target.value
                                        });
                                        e.target.value = "";
                                    }
                                },
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "input",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Categoría..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 146,
                                        columnNumber: 29
                                    }, this),
                                    categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c,
                                            className: "jsx-8553baf8a826d52f",
                                            children: c
                                        }, c, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 148,
                                            columnNumber: 33
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 135,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    height: '36px',
                                    background: 'var(--secondary)',
                                    color: 'var(--foreground)'
                                },
                                onClick: ()=>{
                                    const obs = prompt("Ingrese observaciones para todos los seleccionados:");
                                    if (obs !== null) handleBulkUpdate({
                                        observations: obs
                                    });
                                },
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "btn btn-secondary",
                                children: "📝 Obs"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 152,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '1px',
                                    height: '24px',
                                    background: 'var(--border)',
                                    margin: '0 0.5rem'
                                },
                                className: "jsx-8553baf8a826d52f"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 164,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    height: '36px',
                                    background: '#064e3b',
                                    color: '#6ee7b7',
                                    border: 'none'
                                },
                                onClick: ()=>handleBulkUpdate({
                                        status: 'ACTIVO'
                                    }),
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "btn btn-secondary",
                                children: "Activar"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 166,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    height: '36px',
                                    background: '#450a0a',
                                    color: '#fca5a5',
                                    border: 'none'
                                },
                                onClick: ()=>handleBulkUpdate({
                                        status: 'INACTIVO'
                                    }),
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "btn btn-secondary",
                                children: "Inactivar"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 175,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    height: '36px',
                                    background: '#78350f',
                                    color: '#fcd34d',
                                    border: 'none'
                                },
                                onClick: ()=>handleBulkUpdate({
                                        status: 'REVISAR'
                                    }),
                                disabled: isUpdating,
                                className: "jsx-8553baf8a826d52f" + " " + "btn btn-secondary",
                                children: "Revisar"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 184,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                        lineNumber: 117,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                lineNumber: 93,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowX: 'auto',
                    maxHeight: 'calc(100vh - 250px)',
                    overflowY: 'auto',
                    padding: 0
                },
                className: "jsx-8553baf8a826d52f" + " " + "card",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    },
                    className: "jsx-8553baf8a826d52f" + " " + "players-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            style: {
                                position: 'sticky',
                                top: 0,
                                background: 'var(--secondary)',
                                zIndex: 10
                            },
                            className: "jsx-8553baf8a826d52f",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    borderBottom: '2px solid var(--border)'
                                },
                                className: "jsx-8553baf8a826d52f",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            width: '40px',
                                            color: 'var(--foreground)'
                                        },
                                        className: "jsx-8553baf8a826d52f" + " " + "col-checkbox",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: selectedIds.length === players.length && players.length > 0,
                                            onChange: toggleSelectAll,
                                            className: "jsx-8553baf8a826d52f"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 201,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 200,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: "Jugador",
                                        value: "lastName",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 207,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-dni",
                                        label: "DNI",
                                        value: "dni",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 208,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: "Categoría",
                                        value: "category",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 209,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-primera",
                                        label: "Primera",
                                        value: "playsPrimera",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 210,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: "Tira",
                                        value: "tira",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 211,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-socio",
                                        label: "Socio",
                                        value: "partnerNumber",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 212,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-camiseta",
                                        label: "Camiseta",
                                        value: "shirtNumber",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 213,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-contacto",
                                        label: "Contacto",
                                        value: "phone",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 214,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "col-alta",
                                        label: "Alta",
                                        value: "registrationDate",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 215,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sortable$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: "Estado",
                                        value: "status",
                                        currentSort: currentSort,
                                        currentOrder: currentOrder
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 216,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: '1rem',
                                            color: 'var(--foreground)'
                                        },
                                        className: "jsx-8553baf8a826d52f",
                                        children: "Acciones"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                        lineNumber: 217,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                lineNumber: 199,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                            lineNumber: 198,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "jsx-8553baf8a826d52f",
                            children: players.map((player)=>{
                                const calculatedCat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCategory"])(player, mappings);
                                const isSelected = selectedIds.includes(player.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        borderBottom: '1px solid var(--border)',
                                        background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                    },
                                    className: "jsx-8553baf8a826d52f",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-checkbox",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: isSelected,
                                                onChange: ()=>toggleSelect(player.id),
                                                className: "jsx-8553baf8a826d52f"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 234,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 233,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--foreground)'
                                                },
                                                className: "jsx-8553baf8a826d52f",
                                                children: [
                                                    player.lastName,
                                                    ", ",
                                                    player.firstName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 241,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 240,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontSize: '0.9rem',
                                                color: 'var(--foreground)'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-dni",
                                            children: player.dni
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 243,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontWeight: 600,
                                                color: 'var(--foreground)'
                                            },
                                            className: "jsx-8553baf8a826d52f",
                                            children: calculatedCat
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 244,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                textAlign: 'center',
                                                color: 'var(--foreground)'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-primera",
                                            children: player.playsPrimera ? '✅' : '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 245,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: 'var(--secondary)',
                                                    border: '1px solid var(--border)',
                                                    color: 'var(--foreground)'
                                                },
                                                className: "jsx-8553baf8a826d52f",
                                                children: player.tira
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 247,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 246,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontSize: '0.9rem',
                                                color: 'var(--foreground)',
                                                textAlign: 'center'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-socio",
                                            children: player.partnerNumber || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 258,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                fontSize: '0.9rem',
                                                color: 'var(--foreground)',
                                                textAlign: 'center'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-camiseta",
                                            children: player.shirtNumber || '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 261,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-contacto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '0.8rem',
                                                    color: 'var(--foreground)'
                                                },
                                                className: "jsx-8553baf8a826d52f",
                                                children: [
                                                    player.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: '0.25rem'
                                                        },
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: getWhatsAppLink(player.phone),
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            style: {
                                                                color: 'var(--foreground)',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            },
                                                            title: "Enviar WhatsApp",
                                                            className: "jsx-8553baf8a826d52f",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-8553baf8a826d52f",
                                                                    children: "📞"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                                    lineNumber: 275,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        textDecoration: 'underline',
                                                                        textDecorationStyle: 'dotted',
                                                                        textUnderlineOffset: '3px'
                                                                    },
                                                                    className: "jsx-8553baf8a826d52f",
                                                                    children: player.phone
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                                    lineNumber: 276,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                            lineNumber: 268,
                                                            columnNumber: 53
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 267,
                                                        columnNumber: 49
                                                    }, this),
                                                    player.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            maxWidth: '120px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        title: player.email,
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: [
                                                            "✉️ ",
                                                            player.email
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 62
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 265,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 264,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.85rem',
                                                color: 'var(--foreground)'
                                            },
                                            className: "jsx-8553baf8a826d52f" + " " + "col-alta",
                                            children: player.registrationDate ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(player.registrationDate), 'dd/MM/yyyy') : '-'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 283,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '0.35rem',
                                                    flexWrap: 'wrap'
                                                },
                                                className: "jsx-8553baf8a826d52f",
                                                children: [
                                                    player.status === 'REVISAR' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.2rem'
                                                        },
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    background: '#78350f',
                                                                    color: '#fcd34d',
                                                                    padding: '0.1rem 0.4rem',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'center'
                                                                },
                                                                className: "jsx-8553baf8a826d52f",
                                                                children: "REVISAR"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                                lineNumber: 290,
                                                                columnNumber: 53
                                                            }, this),
                                                            player.dni.startsWith('TEMP-') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.6rem',
                                                                    color: '#fca5a5',
                                                                    fontWeight: 600
                                                                },
                                                                className: "jsx-8553baf8a826d52f",
                                                                children: "⚠️ Falta DNI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                                lineNumber: 292,
                                                                columnNumber: 57
                                                            }, this),
                                                            player.birthDate && (new Date(player.birthDate).getFullYear() <= 1970 || new Date(player.birthDate).getFullYear() === 1900) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.6rem',
                                                                    color: '#fca5a5',
                                                                    fontWeight: 600
                                                                },
                                                                className: "jsx-8553baf8a826d52f",
                                                                children: "⚠️ Falta Nacimiento"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                                lineNumber: 295,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 289,
                                                        columnNumber: 49
                                                    }, this),
                                                    player.scholarship && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            background: '#1e3a8a',
                                                            color: '#93c5fd',
                                                            padding: '0.1rem 0.4rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 'bold'
                                                        },
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: "BECA"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 49
                                                    }, this),
                                                    player.status === 'ACTIVO' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            background: '#064e3b',
                                                            color: '#6ee7b7',
                                                            padding: '0.1rem 0.4rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 'bold'
                                                        },
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: "ACTIVO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 49
                                                    }, this) : player.status === 'INACTIVO' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            background: '#450a0a',
                                                            color: '#fca5a5',
                                                            padding: '0.1rem 0.4rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 'bold'
                                                        },
                                                        className: "jsx-8553baf8a826d52f",
                                                        children: "INACTIVO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 49
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 287,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 286,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            style: {
                                                padding: '1rem'
                                            },
                                            className: "jsx-8553baf8a826d52f",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: getEditLink(player.id),
                                                style: {
                                                    color: 'var(--accent)',
                                                    fontWeight: 500,
                                                    fontSize: '0.85rem'
                                                },
                                                children: "Editar"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                                lineNumber: 311,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                            lineNumber: 310,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, player.id, true, {
                                    fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                                    lineNumber: 226,
                                    columnNumber: 33
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                            lineNumber: 220,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                    lineNumber: 197,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/players/player-list.tsx",
                lineNumber: 196,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "8553baf8a826d52f",
                children: "@keyframes slideUp{0%{opacity:0;transform:translate(-50%,100%)}to{opacity:1;transform:translate(-50%)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/lib/export-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportAttendanceToExcel",
    ()=>exportAttendanceToExcel,
    "exportCoachesToExcel",
    ()=>exportCoachesToExcel,
    "exportPaymentsToExcel",
    ()=>exportPaymentsToExcel,
    "exportPlayersToExcel",
    ()=>exportPlayersToExcel,
    "exportSalariesToExcel",
    ()=>exportSalariesToExcel,
    "exportToExcel",
    ()=>exportToExcel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
function exportToExcel(data, filename, sheetName = 'Datos') {
    try {
        // Create a new workbook
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_new();
        // Convert data to worksheet
        const worksheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(data);
        // Add worksheet to workbook
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, worksheet, sheetName);
        // Generate Excel file buffer
        const excelBuffer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["write"](workbook, {
            bookType: 'xlsx',
            type: 'array'
        });
        // Create Blob
        const dataBlob = new Blob([
            excelBuffer
        ], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });
        // Trigger download
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveAs"])(dataBlob, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error al generar el archivo Excel.');
    }
}
function exportPlayersToExcel(players, mappings) {
    const exportData = players.map((player)=>{
        const calculatedCategory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCategory"])(player, mappings);
        // Audit logic for Excel
        const year = player.birthDate instanceof Date ? player.birthDate.getFullYear() : new Date(player.birthDate).getFullYear();
        const isInvalidDate = year <= 1970 || year === 1900;
        const isTempDni = player.dni.startsWith('TEMP-');
        const auditNotes = [];
        if (isInvalidDate) auditNotes.push('FALTA NACIMIENTO');
        if (isTempDni) auditNotes.push('DNI TEMPORAL');
        if (!player.phone && !player.email) auditNotes.push('SIN CONTACTO');
        return {
            'Apellido': player.lastName,
            'Nombre': player.firstName,
            'DNI': isTempDni ? 'SIN DNI' : player.dni,
            'Fecha Nacimiento': isInvalidDate ? 'SIN FECHA' : player.birthDate instanceof Date ? player.birthDate.toLocaleDateString('es-AR') : new Date(player.birthDate).toLocaleDateString('es-AR'),
            'Categoría': calculatedCategory,
            'Tira': player.tira,
            'Auditoría': auditNotes.join(' | ') || 'OK',
            'Socio': player.partnerNumber || '',
            'Camiseta': player.shirtNumber || '',
            'Teléfono': player.phone || '',
            'Email': player.email || '',
            'Estado': player.status,
            'Beca': player.scholarship ? 'Sí' : 'No',
            'Juega Primera': player.playsPrimera ? 'Sí' : 'No',
            'Fecha Alta': player.registrationDate ? new Date(player.registrationDate).toLocaleDateString('es-AR') : '',
            'Observaciones': player.observations || ''
        };
    });
    exportToExcel(exportData, `jugadores_${new Date().toISOString().split('T')[0]}`);
}
function exportCoachesToExcel(coaches) {
    const exportData = coaches.map((coach)=>({
            'Nombre': coach.name,
            'DNI': coach.dni || '',
            'Fecha Nacimiento': coach.birthDate || '',
            'Teléfono': coach.phone || '',
            'Email': coach.email || '',
            'Rol': coach.role || '',
            'Categorías': coach.category || '',
            'Tira': coach.tira || '',
            'Estado': coach.status || 'ACTIVO',
            'Salario': coach.salary || 0,
            'Fecha Alta': coach.registrationDate || '',
            'Fecha Baja': coach.withdrawalDate || '',
            'Observaciones': coach.observations || ''
        }));
    exportToExcel(exportData, `entrenadores_${new Date().toISOString().split('T')[0]}`);
}
function exportAttendanceToExcel(data) {
    const exportData = data.map((row)=>{
        // Format date dd/MM/yyyy
        const date = new Date(row.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        return {
            'Fecha': formattedDate,
            'Categoría': row.category,
            'Tira': row.tira,
            'Entrenador': row.coachName || '-',
            'Presentes': row.presentCount,
            'Total': row.totalCount,
            'Porcentaje': `${Math.round(row.presentCount / row.totalCount * 100)}%`,
            'Jugadores Presentes': row.presentPlayers.join(', ')
        };
    });
    exportToExcel(exportData, `asistencia_${new Date().toISOString().split('T')[0]}`);
}
function exportSalariesToExcel(coaches, year) {
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ];
    const exportData = coaches.map((coach)=>{
        const row = {
            'Entrenador': coach.name
        };
        coach.months.forEach((amount, idx)=>{
            row[months[idx]] = amount;
        });
        row['TOTAL'] = coach.total;
        return row;
    });
    // Add Totals Row
    const totalsRow = {
        'Entrenador': 'TOTAL MENSUAL'
    };
    let grandTotal = 0;
    // Calculate totals columns
    for(let i = 0; i < 12; i++){
        const monthTotal = coaches.reduce((sum, c)=>sum + (c.months[i] || 0), 0);
        totalsRow[months[i]] = monthTotal;
        grandTotal += monthTotal;
    }
    totalsRow['TOTAL'] = grandTotal;
    exportData.push(totalsRow);
    exportToExcel(exportData, `sueldos_${year}_${new Date().toISOString().split('T')[0]}`);
}
function exportPaymentsToExcel(players) {
    const exportData = players.map((p)=>{
        const currentYear = new Date().getFullYear();
        const currentYearMonth = parseInt(new Date().toISOString().slice(0, 7).replace('-', ''));
        const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
        const activityOk = p.scholarship || p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth;
        const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';
        let status = 'AL DÍA';
        if (!socialOk && !activityOk && !federationOk) status = 'DEUDA TOTAL';
        else if (!socialOk) status = 'DEUDA SOCIAL';
        else if (!activityOk) status = 'DEUDA ACTIVIDAD';
        else if (!federationOk) status = 'DEUDA FEDERACIÓN';
        return {
            'Jugador': p.name,
            'Categoría': p.category,
            'Tira': p.tira,
            'Estado': status,
            'Últ. Pago Social': p.lastSocialPayment || '-',
            'Últ. Pago Actividad': p.scholarship ? 'BECADO' : p.lastActivityPayment || '-',
            'Federación/Seguro': p.federationYear ? `${p.federationYear} - ${p.federationInstallments}` : '-'
        };
    });
    exportToExcel(exportData, `pagos_${new Date().toISOString().split('T')[0]}`);
}
}),
"[project]/src/app/dashboard/players/export-button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExportPlayersButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$export$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/export-utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
function ExportPlayersButton({ players, mappings }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$export$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportPlayersToExcel"])(players, mappings),
        className: "btn btn-outline",
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        children: "📊 Exportar Excel"
    }, void 0, false, {
        fileName: "[project]/src/app/dashboard/players/export-button.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/app/dashboard/players/filter-persistence.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterPersistence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
function FilterPersistence() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const hasRestoredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Reset restoration flag when leaving the page
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (pathname !== '/dashboard/players') {
            hasRestoredRef.current = false;
        }
    }, [
        pathname
    ]);
    // Restore filters logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Only run on the players page
        if (pathname !== '/dashboard/players') return;
        // If already restored this session, don't do it again
        if (hasRestoredRef.current) return;
        const currentParams = searchParams.toString();
        // If there are already params, we consider the restoration "done"
        if (currentParams) {
            hasRestoredRef.current = true;
            return;
        }
        // No params present, try to restore from storage
        const savedFilters = sessionStorage.getItem('playerFilters');
        if (savedFilters) {
            // Avoid infinite loop if we are already at the target state
            if (currentParams === savedFilters) {
                hasRestoredRef.current = true;
                return;
            }
            hasRestoredRef.current = true;
            router.replace(`/dashboard/players?${savedFilters}`);
        } else {
            // Nothing to restore, mark as checked
            hasRestoredRef.current = true;
        }
    }, [
        pathname,
        searchParams,
        router
    ]);
    // Save filters logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const paramsStr = searchParams.toString();
        if (paramsStr) {
            sessionStorage.setItem('playerFilters', paramsStr);
        } else {
            // If filters are cleared, clear the storage too
            sessionStorage.removeItem('playerFilters');
        }
    }, [
        searchParams
    ]);
    return null;
}
}),
];

//# sourceMappingURL=src_dedd46f3._.js.map