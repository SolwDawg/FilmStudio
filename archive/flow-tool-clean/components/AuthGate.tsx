// virtual:components/AuthGate.tsx
import { useState as useState2 } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var AuthGate = ({ children, deviceId, auth }) => {
  const { authState, verify, performInitialSync } = auth;
  const [licenseKey, setLicenseKey] = useState2("");
  const [copyStatus, setCopyStatus] = useState2(false);
  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    await verify(licenseKey);
  };
  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2e3);
  };
  const handleRetrySync = () => {
    performInitialSync(5);
  };
  if (authState.isAuthorized) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[9999] bg-[#070709] flex items-center justify-center p-4 font-sans overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-[0.03]", style: { backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-[320px] bg-[#131318]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col items-center text-center animate-dropdown", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 relative", children: [
        /* @__PURE__ */ jsx("span", { className: "material-symbols-outlined text-[24px] text-pink-500", children: "lock" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-black tracking-[-0.5px] mb-1 uppercase", children: "MLT Guard" }),
      /* @__PURE__ */ jsx("p", { className: "text-[9px] text-white/30 uppercase tracking-[1.5px] mb-4", children: "H\u1EC7 th\u1ED1ng b\u1EA3n quy\u1EC1n Client v3.1.6" }),
      /* @__PURE__ */ jsxs("div", { className: `w-full flex items-center justify-center gap-2 px-3 h-8 rounded-full border mb-4 transition-all ${authState.isSyncing ? "bg-blue-500/20 border-blue-400 animate-pulse" : authState.syncError ? "bg-red-500/10 border-red-500/40" : "bg-blue-500/5 border-blue-500/20"}`, children: [
        /* @__PURE__ */ jsx("span", { className: `material-symbols-outlined text-[14px] ${authState.syncError ? "text-red-500" : "text-blue-400"} ${authState.isSyncing ? "animate-spin" : ""}`, children: authState.syncError ? "sync_problem" : "cloud_sync" }),
        /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black uppercase tracking-[0.5px] truncate ${authState.syncError ? "text-red-400" : "text-blue-400"}`, children: authState.serverTimeDisplay || (authState.isSyncing ? "GOOGLE SYNCING..." : authState.syncError ? "L\u1ED6I \u0110\u1ED2NG B\u1ED8" : "WAITING FOR SYNC...") })
      ] }),
      authState.syncError && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleRetrySync,
          className: "mb-4 flex items-center gap-1.5 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-lg text-[9px] font-black text-red-400 uppercase tracking-widest hover:bg-red-600/30 transition-all",
          children: [
            /* @__PURE__ */ jsx("span", { className: "material-symbols-outlined text-[12px]", children: "refresh" }),
            "Th\u1EED l\u1EA1i \u0111\u1ED3ng b\u1ED9"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "w-full bg-black/40 border border-white/5 rounded-xl p-3 mb-4 group", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5 px-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[7px] font-black text-white/20 uppercase tracking-[1px]", children: "Device Identity" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleCopyId,
              className: "flex items-center gap-1 text-blue-400/80 hover:text-blue-300 transition-colors",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase", children: copyStatus ? "OK" : "Copy" }),
                /* @__PURE__ */ jsx("span", { className: "material-symbols-outlined text-[12px]", children: copyStatus ? "done" : "content_copy" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-1 border-t border-white/5", children: /* @__PURE__ */ jsx("span", { className: "text-[12px] font-mono font-bold tracking-[1.5px] text-white/70 uppercase truncate", children: deviceId }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col gap-3 mb-5", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: licenseKey,
            onChange: (e) => setLicenseKey(e.target.value),
            placeholder: "M\xE3 k\xEDch ho\u1EA1t...",
            className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-[11px] outline-none focus:border-pink-500/40 transition-all text-center placeholder:text-white/15 font-mono",
            onKeyDown: (e) => e.key === "Enter" && handleActivate()
          }
        ) }),
        authState.error && /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-shake", children: [
          /* @__PURE__ */ jsx("span", { className: "material-symbols-outlined text-[14px] text-red-500", children: "error" }),
          /* @__PURE__ */ jsx("p", { className: "text-[9px] text-red-400 font-bold uppercase tracking-wider text-left leading-tight", children: authState.error === "DEVICE_NOT_MATCH" ? "Kh\xF4ng kh\u1EDBp thi\u1EBFt b\u1ECB." : authState.error === "LICENSE_EXPIRED" ? "M\xE3 \u0111\xE3 h\u1EBFt h\u1EA1n." : authState.error === "LICENSE_FORMAT_INVALID" ? "M\xE3 kh\xF4ng h\u1EE3p l\u1EC7." : authState.error === "NETWORK_TIME_ERROR" ? "L\u1ED7i \u0111\u1ED3ng b\u1ED9 AI Time." : "K\xEDch ho\u1EA1t th\u1EA5t b\u1EA1i." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleActivate,
            disabled: authState.loading || !licenseKey.trim() || authState.syncError,
            className: "w-full h-11 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[1.5px] hover:bg-pink-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-all active:scale-[0.98]",
            children: authState.loading ? authState.isSyncing ? "GOOGLE SYNCING..." : "X\xE1c th\u1EF1c..." : "K\xEDch ho\u1EA1t"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 opacity-10", children: /* @__PURE__ */ jsx("p", { className: "text-[7px] font-mono uppercase", children: "Authorized Users Only" }) })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      ` } })
  ] });
};

