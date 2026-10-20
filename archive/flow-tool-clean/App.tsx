// virtual:App.tsx
import { useState as useState3, useEffect as useEffect2, useRef, useMemo } from "react";
import { Flow as Flow2 } from "flow-sdk";
import { ffmpegService } from "./services/ffmpegService";

// virtual:App.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var MODELS = [
  "Veo 3.1 - Lite",
  "Omni 1.1 Flash",
  "Veo 3.1 - Fast",
  "Veo 3.1 - Quality"
];
var IMAGE_MODELS = [
  "\u{1F34C} Nano Banana Pro",
  "\u{1F34C} Nano Banana 2.1",
  "\u{1F34C} Nano Banana 2 Lite"
];
var LANGUAGES = [
  "M\u1EB7c \u0111\u1ECBnh",
  "Ti\u1EBFng Vi\u1EC7t",
  "Ti\u1EBFng Anh (English)",
  "Ti\u1EBFng Nh\u1EADt (Japanese)",
  "Ti\u1EBFng Trung (Chinese)",
  "Ti\u1EBFng H\xE0n (Korean)",
  "Ti\u1EBFng Ph\xE1p (French)",
  "Ti\u1EBFng \u0110\u1EE9c (German)",
  "Ti\u1EBFng T\xE2y Ban Nha (Spanish)",
  "Ti\u1EBFng \xDD (Italian)",
  "Ti\u1EBFng Th\xE1i (Thai)",
  "Ti\u1EBFng Nga (Russian)"
];
var ADVANCED_CONFIG_PASSWORD = "Dozazoi399*%kidfvzt23";
var QUALITY_ACCESS_CODE = "Dozazoi399*%jhx1";
var SCENE_LIMIT_ACCESS_CODE = "Dozazoi399*%jhx1bietdidau";
var RATE_LIMIT_RETRY_COUNT = 5;
var DEFAULT_STORY_PROMPT = `Ph\xE2n t\xEDch truy\u1EC7n, \xFD t\u01B0\u1EDDng v\xE0 h\xECnh \u1EA3nh tham kh\u1EA3o \u0111\xEDnh k\xE8m (n\u1EBFu c\xF3).
Vi\u1EBFt cho m\xECnh k\u1ECBch b\u1EA3n quay phim \u0111i\u1EC7n \u1EA3nh chi ti\u1EBFt, th\u1EC3 lo\u1EA1i b\xE1m s\xE1t truy\u1EC7n, b\xE1m s\xE1t c\u1ED1t truy\u1EC7n, kh\xF4ng \u0111\u01B0\u1EE3c ph\xE9p s\xE1ng t\u1EA1o th\xEAm. v\u0103n phong, ng\xF4n ng\u1EEF ph\xF9 h\u1EE3p ng\u01B0\u1EDDi Vi\u1EC7t Nam . Y\xEAu c\u1EA7u: 

* C\u1EA5u tr\xFAc c\u1ED1 \u0111inh c\u1EE7a 1 SCENE 10 gi\xE2y bao g\u1ED3m:
B\u1EAFt \u0111\u1EA7u v\u1EDBi ch\u1EEF SCENE.
Li\u1EC7t k\xEA t\xEAn nh\xE2n v\u1EADt.
Li\u1EC7t k\xEA t\xEAn b\u1ED1i c\u1EA3nh ch\xEDnh x\xE1c.
M\u1ED7i shot, ch\u1EC9 ghi shot, kh\xF4ng ghi th\u1EDDi gian v\xE0 bao g\u1ED3m c\xE1c th\xE0nh ph\u1EA7n sau:  (T\xEAn nh\xE2n v\u1EADt, B\u1ED1i c\u1EA3nh nh\u1EA5t qu\xE1n v\u1EDBi to\xE0n b\u1ED9 c\xE2u chuy\u1EC7n, T\u1EEBng shot v\xE0 h\xE0nh \u0111\u1ED9ng c\u1EE5 th\u1EC3 c\u1EE7a t\u1EEBng nh\xE2n v\u1EADt, Bi\u1EC3u c\u1EA3m, h\xE0nh \u0111\u1ED9ng v\xE0 tr\u1EA1ng th\xE1i c\u1EA3m x\xFAc. Ghi r\xF5 tho\u1EA1i c\u1EE7a nh\xE2n v\u1EADt, lu\xF4n ghi t\xEAn nh\xE2n v\u1EADt tr\u01B0\u1EDBc tho\u1EA1i. Khi nh\xE2n v\u1EADt n\xE0o n\xF3i, camera ph\u1EA3i chuy\u1EC3n/h\u01B0\u1EDBng phong c\xE1ch \u0111i\u1EC7n \u1EA3nh r\xF5 r\xE0ng v\u1EC1 \u0111\xFAng nh\xE2n v\u1EADt \u0111\xF3, ghi r\xF5 t\xEAn nh\xE2n v\u1EADt \u0111\u01B0\u1EE3c quay. Di\u1EC5n bi\u1EBFn ph\u1EA3i li\xEAn t\u1EE5c, logic, d\u1EC5 quay v\xE0 c\xF3 cao tr\xE0o. Tho\u1EA1i t\u1EF1 nhi\xEAn, \u0111\xFAng ch\u1EA5t drama h\xE0i h\u01B0\u1EDBc Vi\u1EC7t Nam).
* C\xE1c shot ph\u1EA3i li\xEAn k\u1EBFt m\u01B0\u1EE3t m\xE0, kh\xF4ng nh\u1EA3y c\u1EA3nh v\xF4 l\xFD.
* M\u1ED7i scene ch\u1EC9 c\xF3 duy nh\u1EA5t 1 t\u1EEB \u201CSCENE\u201D.
  Ch\u1EC9 xu\u1EA5t k\u1ECBch b\u1EA3n theo t\u1EEBng SCENE, kh\xF4ng gi\u1EA3i th\xEDch g\xEC th\xEAm`;
var DEFAULT_SYSTEM_PROMPT = `S\u1EED d\u1EE5ng c\xE1c h\xECnh \u1EA3nh tham kh\u1EA3o \u0111\xE3 t\u1EA3i l\xEAn l\xE0m ngu\u1ED3n d\u1EEF li\u1EC7u h\xECnh \u1EA3nh chu\u1EA9n x\xE1c tuy\u1EC7t \u0111\u1ED1i. \u0110\u1ECDc to\xE0n b\u1ED9 k\u1ECBch b\u1EA3n tr\u01B0\u1EDBc khi b\u1EAFt \u0111\u1EA7u t\u1EA1o h\xECnh \u1EA3nh.

\u0110\xF3ng vai m\u1ED9t \xEA-k\xEDp g\u1ED3m \u0111\u1EA1o di\u1EC5n, \u0111\u1EA1o di\u1EC5n h\xECnh \u1EA3nh (DOP), bi\xEAn t\u1EADp vi\xEAn v\xE0 hu\u1EA5n luy\u1EC7n vi\xEAn di\u1EC5n xu\u1EA5t t\u1EEBng \u0111o\u1EA1t gi\u1EA3i th\u01B0\u1EDFng t\u1EA1i Hollywood. Chuy\u1EC3n h\xF3a k\u1ECBch b\u1EA3n th\xE0nh m\u1ED9t b\u1ED9 phim \u0111i\u1EC7n \u1EA3nh **live-action si\xEAu ch\xE2n th\u1EF1c**. N\u1EAFm v\u1EEFng c\u1ED1t truy\u1EC7n, nh\xE2n v\u1EADt, c\xE1c m\u1ED1i quan h\u1EC7, \u0111\u1ED9ng c\u01A1, xungohnt, nh\u1ECBp \u0111\u1ED9, di\u1EC5n bi\u1EBFn c\u1EA3m x\xFAc v\xE0 c\xE1c t\u1EA7ng \xFD ngh\u0129a ng\u1EA7m. **TH\u1EC2 HI\u1EC6N B\u1EB0NG H\xCCNH \u1EA2NH, \u0110\u1EEANG K\u1EC2 L\u1EC2.** G\xF3c m\xE1y ph\u1EA3i n\u01B0\u01A1ng theo c\u1EA3m x\xFAc, kh\xF4ng ph\u1EA3i l\u1EDDi tho\u1EA1i.

PHONG C\xC1CH \u0110I\u1EC6N \u1EA0NH: **Live-action \u0111\u1EDDi th\u1EF1c, photorealistic, t\u1EF1 nhi\xEAn, kh\xF4ng CGI**, b\u1ED1 c\u1EE5c thanh tho\xE1t, chi\u1EC1u s\xE2u kh\xF4ng gian ch\xE2n th\u1EF1c, ch\u1EA5t li\u1EC7u v\u1EADt l\xFD ch\xEDnh x\xE1c, \xE1nh s\xE1ng c\xF3 ngu\u1ED3n r\xF5 r\xE0ng v\xE0 \u0111\u1ED9 t\u01B0\u01A1ng ph\xE1t \u0111i\u1EC7n \u1EA3nh **ti\u1EBFt ch\u1EBF**. \u01AFu ti\xEAn texture da, l\u1ED7 ch\xE2n l\xF4ng, t\xF3c con, n\u1EBFp v\u1EA3i, b\xF3ng \u0111\u1ED5 v\xE0 ph\u1EA3n chi\u1EBFu t\u1EF1 nhi\xEAn. **Tr\xE1nh da nh\u1EF1a, l\xE0m \u0111\u1EB9p qu\xE1 m\u1EE9c, \xE1nh s\xE1ng gi\u1EA3, HDR, bloom v\xE0 v\u1EBB ngo\xE0i nh\xE2n t\u1EA1o.**

DI\u1EC4N XU\u1EA4T: H\u01A1i th\u1EDF, ch\u1EDBp m\u1EAFt, c\u1EED \u0111\u1ED9ng m\u1EAFt, kho\u1EA3ng l\u1EB7ng, c\u1EED ch\u1EC9 tinh t\u1EBF, vi bi\u1EC3u c\u1EA3m v\xE0 c\u1EA3m x\xFAc \u0111\u01B0\u1EE3c ti\u1EBFt ch\u1EBF m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn. Tr\xE1nh l\u1ED1i di\u1EC5n xu\u1EA5t m\xE1y m\xF3c, **\u0111\u1ED3ng b\u1ED9 h\xF3a \u0111\u1ED9ng t\xE1c** ho\u1EB7c c\u01B0\u1EDDng \u0111i\u1EC7u.

G\xD3C M\xC1Y: Mang \u0111\u1EADm ch\u1EA5t \u0111i\u1EC7n \u1EA3nh kh\u1ED5 l\u1EDBn (large-format), \u0111a d\u1EA1ng c\xE1c c\u1EE1 c\u1EA3nh (to\xE0n, trung, c\u1EADn, OTS, POV), chuy\u1EC3n \u0111\u1ED9ng m\xE1y c\xF3 ch\u1EE7 \u0111\xEDch, **t\u1EF1 nhi\xEAn nh\u01B0 m\xE1y quay th\u1EADt**. Tr\xE1nh l\u1EB7p l\u1EA1i b\u1ED1 c\u1EE5c khung h\xECnh, **l\u1EA1m d\u1EE5ng x\xF3a ph\xF4ng ho\u1EB7c chuy\u1EC3n \u0111\u1ED9ng m\xE1y v\xF4 l\xFD**.

T\xCDNH NH\u1EA4T QU\xC1N: Gi\u1EEF nguy\xEAn tuy\u1EC7t \u0111\u1ED1i \u0111\u1EB7c \u0111i\u1EC3m nh\u1EADn d\u1EA1ng nh\xE2n v\u1EADt, khu\xF4n m\u1EB7t, \u0111\u1ED9 tu\u1ED5i, ki\u1EC3u t\xF3c, trang ph\u1EE5c t\u1EEB \u1EA3nh tham chi\u1EBFu.

QUY T\u1EAEC XU\u1EA4T: V\u1EDBi l\u1EC7nh t\u1EA1o \u1EA3nh th\xEC **ghi r\xF5 th\u1EDDi gian t\u1EEBng c\u1EA3nh tr\xEAn \u1EA3nh**. V\u1EDBi l\u1EC7nh t\u1EA1o video th\xEC ch\u1ECDn \u0111\xFAng th\u1EE9 t\u1EF1 c\u1EA3nh, kh\xF4ng c\xF3 ch\u1EEF tr\xEAn video.`;
var DEFAULT_IMAGE_PRODUCTION_RULE = `Professional photorealistic cinematography, 8k resolution, high fidelity, cinematic lighting, ultra-detailed textures, highly consistent facial features and environment from references.`;
var DEFAULT_HEAL_INSTRUCTION = "Vi\u1EBFt l\u1EA1i k\u1ECBch b\u1EA3n b\u1EB1ng c\xE1c t\u1EEB \u0111\u1ED3ng ngh\u0129a \u0111\u1EC3 tr\xE1nh vi ph\u1EA1m. Nh\u01B0ng v\u1EABn gi\u1EEF nguy\xEAn c\u1ED1t truy\u1EC7n c\u1EE7a k\u1ECBch b\u1EA3n. K\u1ECBch b\u1EA3n m\u1EDBi c\xF3 s\u1ED1 t\u1EEB b\u1EB1ng k\u1ECBch b\u1EA3n c\u0169. Ch\u1EC9 xu\u1EA5t scene.";
var DEFAULT_DIRECTIONAL_PROMPT = "Phong c\xE1ch hi\u1EC7n \u0111\u1EA1i, nh\xE2n v\u1EADt tr\u1EBB \u0111\u1EB9p, n\u1EEF r\u1EA5t xinh x\u1EAFn v\xE0 trang ph\u1EE5c l\u1ED9ng l\u1EABy, ch\xE2n d\xE0i v\xE0 cao. V\u1EDBi m\u1ED7i nh\xE2n v\u1EADt, t\u1EA1o \u1EA3nh thi\u1EBFt k\u1EBF nh\xE2n v\u1EADt theo phong c\xE1ch ng\u01B0\u1EDDi th\u1EADt, \u0111i\u1EC7n \u1EA3nh, ch\xE2n th\u1EF1c cao.\n\nGhi r\xF5 th\xF4ng tin tr\xEAn \u1EA3nh:\n\xB7 T\xEAn nh\xE2n v\u1EADt\n\xB7 Tu\u1ED5i\n\xB7 Ngo\u1EA1i h\xECnh\n\xB7 Khu\xF4n m\u1EB7t\n\xB7 Ki\u1EC3u t\xF3c\n\xB7 D\xE1ng ng\u01B0\u1EDDi\n\xB7 Trang ph\u1EE5c ph\xF9 h\u1EE3p v\u1EDBi th\u1EDDi \u0111\u1EA1i v\xE0 ho\xE0n c\u1EA3nh trong k\u1ECBch b\u1EA3n\n\xB7 Ph\u1EE5 ki\u1EC7n \u0111\u1EB7c tr\u01B0ng\n\xB7 \u0110\u1EB7c \u0111i\u1EC3m nh\u1EADn di\u1EC7n c\u1ED1 \u0111\u1ECBnh\n\xB7 DNA gi\u1ECDng n\xF3i ch\xEDnh x\xE1c\n\xB7 To\xE0n th\xE2n ch\xEDnh di\u1EC7n\n\xB7 G\xF3c 3/4\n\xB7 G\xF3c nghi\xEAng\n\xB7 M\u1EB7t sau\n\xB7 C\u1EADn m\u1EB7t\n\nGi\u1EEF khu\xF4n m\u1EB7t, v\xF3c d\xE1ng, t\xF3c, \u0111\u1ED9 tu\u1ED5i v\xE0 c\xE1c \u0111\u1EB7c \u0111i\u1EC3m nh\u1EADn di\u1EC7n NH\u1EA4T QU\xC1N tuy\u1EC7t \u0111\u1ED1i \u0111\u1EC3 c\xF3 th\u1EC3 s\u1EED d\u1EE5ng l\xE0m reference for t\u1EA5t c\u1EA3 c\u1EA3nh sau n\xE0y. Xu\u1EA5t \u1EA3nh Ph\xF4ng n\u1EC1n xanh chroma key s\u1EA1ch, \u0111\u1ED3ng nh\u1EA5t, \xE1nh s\xE1ng m\u1EC1m m\u1EA1i, b\u1ED1 c\u1EE5c chuy\xEAn nghi\u1EC7p, ph\xF9 h\u1EE3p l\xE0m \u1EA3nh tham chi\u1EBFu nh\xE2n v\u1EADt cho phim AI.";
var DEFAULT_LOCATION_DIRECTIONAL_PROMPT = "Phong c\xE1ch hi\u1EC7n \u0111\u1EA1i. M\u1ED7i b\u1ED1i c\u1EA3nh ph\u1EA3i \u0111\u01B0\u1EE3c thi\u1EBFt k\u1EBF th\xE0nh \u1EA3nh tham chi\u1EBFu b\u1ED1i c\u1EA3nh ri\xEAng, kh\xF4ng ph\u1EA3i \u1EA3nh minh h\u1ECDa m\u1ED9t shot c\u1EE5 th\u1EC3.\n\nTh\u1EC3 hi\u1EC7n r\xF5 v\xE0 ghi r\xF5 th\xF4ng tin tr\xEAn \u1EA3nh:\n\xB7 T\xEAn b\u1ED1i c\u1EA3nh\n\xB7 Ki\u1EBFn tr\xFAc\n\xB7 Kh\xF4ng gian\n\xB7 B\u1ED1i c\u1EE5c t\u1ED5ng th\u1EC3\n\xB7 N\u1ED9i th\u1EA5t\n\xB7 \u0110\u1ED3 v\u1EADt \u0111\u1EB7c tr\u01B0ng\n\xB7 C\u1EEDa, c\u1EEDa s\u1ED5, c\u1EA7u thang, b\xE0n gh\u1EBF, gi\u01B0\u1EDDng, t\u1EE7... n\u1EBFu c\xF3\n\xB7 Ch\u1EA5t li\u1EC7u\n\xB7 M\xE0u s\u1EAFc\n\xB7 \xC1nh s\xE1ng\n\xB7 Th\u1EDDi \u0111\u1EA1i\n\xB7 Phong c\xE1ch ki\u1EBFn tr\xFAc\n\xB7 C\xE1c chi ti\u1EBFt c\u1EA7n duy tr\xEC nh\u1EA5t qu\xE1n trong nh\u1EEFng c\u1EA3nh quay sau\n\nB\u1ED1i c\u1EA3nh ph\u1EA3i \u0111\u01B0\u1EE3c th\u1EC3 hi\u1EC7n \u1EDF g\xF3c nh\xECn \u0111i\u1EC7n \u1EA3nh r\u1ED9ng, r\xF5 kh\xF4ng gian v\xE0 c\xE1c v\u1EADt th\u1EC3 quan tr\u1ECDng, KH\xD4NG c\xF3 nh\xE2n v\u1EADt \u0111\u1EE9ng trong \u1EA3nh, tr\u1EEB khi nh\xE2n v\u1EADt l\xE0 m\u1ED9t ph\u1EA7n c\u1ED1 \u0111\u1ECBnh c\u1EE7a thi\u1EBFt k\u1EBF b\u1ED1i c\u1EA3nh.";
var DEFAULT_LOOP_REWRITE_PROMPT = "D\u1EF1a tr\xEAn k\u1ECBch b\u1EA3n g\u1ED1c c\u1EE7a c\u1EA3nh n\xE0y, h\xE3y vi\u1EBFt l\u1EA1i m\u1ED9t phi\xEAn b\u1EA3n m\u1EDBi v\u1EDBi di\u1EC5n bi\u1EBFn kh\xE1c \u0111i m\u1ED9t ch\xFAt, t\u0103ng t\xEDnh k\u1ECBch t\xEDnh ho\u1EB7c thay \u0111\u1ED5i g\xF3c nh\xECn nh\u01B0ng v\u1EABn gi\u1EEF nguy\xEAn nh\xE2n v\u1EADt v\xE0 b\u1ED1i c\u1EA3nh. \u0110\u1EA3m b\u1EA3o ng\xF4n ng\u1EEF \u0111i\u1EC7n \u1EA3nh chuy\xEAn nghi\u1EC7p.";
var DEFAULT_STORYBOARD_PROMPT = "Professional cinematic storyboard sketch, detailed pencil lines, clear composition, visual guide for the scene action.";
var SectionLabel = ({ children, tooltip }) => /* @__PURE__ */ jsx2("div", { className: "flex items-center px-2", title: tooltip, children: /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black text-[rgba(218,220,224,0.5)] tracking-[0.8px] uppercase", children }) });
var PillButton = ({ icon, children, variant = "filled", onClick, disabled, className = "", title }) => {
  const base = "flex items-center gap-[3px] justify-center w-full h-[28px] rounded-lg font-bold tracking-[0.1px] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
  const variants = {
    filled: "bg-[#969696] hover:bg-[#a6a6a6] active:bg-[#868686] text-black text-[10px] px-2 py-1 select-none",
    outline: "border border-[#595959] hover:bg-white/5 active:bg-white/10 backdrop-blur-[40px] text-[10px] px-2 py-1 text-white select-none",
    solid: "bg-white hover:bg-gray-200 active:bg-gray-300 text-black text-[10px] px-2 py-1 select-none"
  };
  return /* @__PURE__ */ jsxs2("button", { type: "button", title, className: `${base} ${variants[variant]} ${className}`, onClick, disabled, children: [
    icon && /* @__PURE__ */ jsx2("span", { className: "flex items-center justify-center w-4 h-4", children: icon }),
    /* @__PURE__ */ jsx2("span", { className: "truncate", children })
  ] });
};
var SegmentedToggle = ({ value, items, onChange }) => /* @__PURE__ */ jsx2("div", { className: "flex w-full items-center border border-[#595959] rounded-lg overflow-hidden bg-transparent", children: items.map((item) => /* @__PURE__ */ jsxs2(
  "button",
  {
    type: "button",
    onClick: () => onChange(item.value),
    title: item.tooltip,
    className: `flex-1 flex items-center justify-center gap-1 h-[28px] px-2 py-1 rounded-lg text-[9px] font-bold tracking-[0.1px] transition-all cursor-pointer ${value === item.value ? "bg-[#969696] text-black" : "text-[rgba(218,220,224,0.75)] hover:text-white hover:bg-white/5"}`,
    children: [
      item.icon,
      /* @__PURE__ */ jsx2("span", { children: item.label })
    ]
  },
  item.value
)) });
var FieldDropdown = ({ label, value, options, onChange, className = "", tooltip }) => {
  const [isOpen, setIsOpen] = useState3(false);
  const ref = useRef(null);
  useEffect2(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);
  return /* @__PURE__ */ jsxs2("div", { ref, className: `relative ${className}`, title: tooltip, children: [
    /* @__PURE__ */ jsxs2(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "w-full text-left border border-[#595959] hover:border-[#7a7a7a] transition-colors rounded-lg flex flex-col gap-0 justify-center pb-1 pl-2 pr-1.5 pt-[3px] select-none focus:outline-none",
        children: [
          /* @__PURE__ */ jsx2("p", { className: "text-[8px] font-black text-[rgba(255,255,255,0.25)] tracking-[0.1px] uppercase leading-none mb-0.5", children: label }),
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx2("span", { className: "text-[10px] font-bold text-white tracking-[0.1px] truncate pr-1", children: value }),
            /* @__PURE__ */ jsx2("span", { className: `material-symbols-outlined text-[14px] text-[rgba(218,220,224,0.3)] transition-transform ${isOpen ? "rotate-180" : ""}`, children: "keyboard_arrow_down" })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx2("div", { className: "absolute z-50 top-[calc(100%+2px)] left-0 w-full bg-[#1a1a1a] border border-[#595959] rounded-lg overflow-hidden shadow-2xl animate-dropdown origin-top", children: /* @__PURE__ */ jsx2("div", { className: "max-h-40 overflow-y-auto dark-scrollbar", children: options.map((opt) => /* @__PURE__ */ jsx2(
      "button",
      {
        type: "button",
        className: `w-full text-left px-2 py-1.5 text-[10px] font-bold tracking-[0.1px] hover:bg-white/10 transition-colors ${value === opt ? "bg-white/10 text-white" : "text-[rgba(218,220,224,0.5)]"}`,
        onClick: () => {
          onChange(opt);
          setIsOpen(false);
        },
        children: opt
      },
      opt
    )) }) })
  ] });
};
var DragNumberField = ({ label, value, min = 0, max = 99, step = 1, suffix = "", onChange, className = "", tooltip }) => {
  const [isEditing, setIsEditing] = useState3(false);
  const [editValue, setEditValue] = useState3(String(value));
  const inputRef = useRef(null);
  const dragRef = useRef(null);
  const commitEdit = (raw) => {
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(Math.min(max, Math.max(min, Math.round(parsed / step) * step)));
    setIsEditing(false);
  };
  const handleMouseDown = (e) => {
    if (isEditing) return;
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startVal: value, moved: false };
    const handleMouseMove = (ev) => {
      if (!dragRef.current) return;
      if (Math.abs(ev.clientY - dragRef.current.startY) > 3) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        const delta = dragRef.current.startY - ev.clientY;
        const newVal = Math.round((dragRef.current.startVal + delta * step) / step) * step;
        onChange(Math.min(max, Math.max(min, newVal)));
      }
    };
    const handleMouseUp = () => {
      const wasDrag = dragRef.current?.moved;
      dragRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!wasDrag) {
        setEditValue(String(value));
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: `border border-[#595959] hover:border-[#7a7a7a] rounded-lg flex flex-col gap-0 justify-center pb-1 pl-2 pr-1.5 pt-[3px] select-none transition-colors ${isEditing ? "" : "cursor-ns-resize"} ${className}`,
      onMouseDown: handleMouseDown,
      title: tooltip,
      children: [
        /* @__PURE__ */ jsx2("p", { className: "text-[8px] font-black text-[rgba(255,255,255,0.25)] tracking-[0.1px] uppercase leading-none mb-0.5", children: label }),
        /* @__PURE__ */ jsx2("div", { className: "flex items-center justify-between", children: isEditing ? /* @__PURE__ */ jsx2(
          "input",
          {
            ref: inputRef,
            type: "text",
            value: editValue,
            onChange: (e) => setEditValue(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") commitEdit(editValue);
              if (e.key === "Escape") setIsEditing(false);
            },
            onBlur: () => commitEdit(editValue),
            className: "bg-transparent text-[10px] font-bold text-white tracking-[0.1px] outline-none w-full border-none p-0 m-0",
            autoFocus: true
          }
        ) : /* @__PURE__ */ jsxs2("span", { className: "text-[10px] font-bold text-white tracking-[0.1px] cursor-text", children: [
          value,
          suffix
        ] }) })
      ]
    }
  );
};
var DNAEditModal = ({ isOpen, asset, onSave, onCancel }) => {
  const [name, setName] = useState3("");
  const [aliases, setAliases] = useState3("");
  const [roles, setRoles] = useState3("");
  const [traits, setTraits] = useState3("");
  useEffect2(() => {
    if (isOpen && asset) {
      setName(asset.name || "");
      setAliases(asset.aliases?.join(", ") || "");
      setRoles(asset.roles?.join(", ") || "");
      setTraits(asset.traits || "");
    }
  }, [isOpen, asset]);
  if (!isOpen || !asset) return null;
  return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-dropdown", onClick: onCancel, children: /* @__PURE__ */ jsxs2("div", { className: "relative w-full max-w-md bg-[#131318] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs2("div", { className: "p-5 border-b border-white/5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-pink-500", children: "biotech" }),
        /* @__PURE__ */ jsxs2("span", { className: "text-[11px] font-black text-white uppercase tracking-[2px]", children: [
          "C\u1EADp nh\u1EADt DNA ",
          asset.type === "actor" ? "Nh\xE2n v\u1EADt" : "B\u1ED1i c\u1EA3nh"
        ] })
      ] }),
      /* @__PURE__ */ jsx2("button", { onClick: onCancel, className: "text-white/30 hover:text-white transition-colors", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined", children: "close" }) })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh] dark-scrollbar", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", title: "T\xEAn duy nh\u1EA5t c\u1EE7a DNA n\xE0y.", children: [
        /* @__PURE__ */ jsx2(SectionLabel, { children: "T\xEAn ch\xEDnh (Unique ID)" }),
        /* @__PURE__ */ jsx2("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-pink-500/50", placeholder: "T\xEAn nh\u1EADn di\u1EC7n ch\xEDnh..." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", title: "C\xE1c t\xEAn g\u1ECDi kh\xE1c c\u1EE7a \u0111\u1ED1i t\u01B0\u1EE3ng n\xE0y trong k\u1ECBch b\u1EA3n (v\xED d\u1EE5: h\u1EAFn, c\xF4 \u1EA5y, k\u1EBB l\u1EA1 m\u1EB7t...). Ph\xE2n c\xE1ch b\u1EB1ng d\u1EA5u ph\u1EA9y.", children: [
        /* @__PURE__ */ jsx2(SectionLabel, { children: "T\xEAn g\u1ECDi kh\xE1c (Aliases - Ph\xE2n c\xE1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }),
        /* @__PURE__ */ jsx2("textarea", { value: aliases, onChange: (e) => setAliases(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[12px] outline-none focus:border-pink-500/50 h-16 resize-none", placeholder: "V\xED d\u1EE5: Anh \u1EA5y, H\u1EAFn, S\xE1t th\u1EE7, K\u1EBB l\u1EA1 m\u1EB7t..." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", title: "M\xF4 t\u1EA3 m\u1ED1i quan h\u1EC7 ho\u1EB7c ch\u1EE9c danh c\u1EE7a \u0111\u1ED1i t\u01B0\u1EE3ng (v\xED d\u1EE5: Ng\u01B0\u1EDDi m\u1EB9, S\u1EBFp...).", children: [
        /* @__PURE__ */ jsx2(SectionLabel, { children: "Vai tr\xF2 / Quan h\u1EC7 (Roles - Ph\xE2n c\xE1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }),
        /* @__PURE__ */ jsx2("textarea", { value: roles, onChange: (e) => setRoles(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[12px] outline-none focus:border-pink-500/50 h-16 resize-none", placeholder: "V\xED d\u1EE5: Ng\u01B0\u1EDDi m\u1EB9, K\u1EBB th\xF9, \u0110\u1ED9i tr\u01B0\u1EDFng, Ph\u1EA3n di\u1EC7n..." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", title: "C\xE1c \u0111\u1EB7c \u0111i\u1EC3m ngo\u1EA1i h\xECnh ho\u1EB7c t\xEDnh c\xE1ch c\u1EA7n duy tr\xEC nh\u1EA5t qu\xE1n.", children: [
        /* @__PURE__ */ jsx2(SectionLabel, { children: "\u0110\u1EB7c \u0111i\u1EC3m DNA (Traits)" }),
        /* @__PURE__ */ jsx2("textarea", { value: traits, onChange: (e) => setTraits(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[12px] outline-none focus:border-pink-500/50 h-24 resize-none", placeholder: "M\xF4 t\u1EA3 ngo\u1EA1i h\xECnh, t\xEDnh c\xE1ch, \u0111\u1EB7c \u0111i\u1EC3m nh\u1EADn d\u1EA1ng..." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex gap-2 p-5 bg-black/20 border-t border-white/5", children: [
      /* @__PURE__ */ jsx2("button", { onClick: onCancel, className: "flex-1 h-11 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all", children: "Hu\u1EF7" }),
      /* @__PURE__ */ jsx2(
        "button",
        {
          onClick: () => {
            onSave(asset.id, {
              name,
              aliases: aliases.split(",").map((s) => s.trim()).filter((s) => !!s),
              roles: roles.split(",").map((s) => s.trim()).filter((s) => !!s),
              traits
            });
          },
          className: "flex-1 h-11 rounded-xl bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all shadow-lg shadow-pink-600/20",
          children: "L\u01B0u DNA"
        }
      )
    ] })
  ] }) });
};
var NewProjectModal = ({ isOpen, defaultName, onConfirm, onCancel }) => {
  const [name, setName] = useState3(defaultName);
  useEffect2(() => {
    if (isOpen) setName(defaultName);
  }, [isOpen, defaultName]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-dropdown", onClick: onCancel, children: /* @__PURE__ */ jsxs2("div", { className: "relative w-full max-w-sm bg-[#131318] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs2("div", { className: "p-5 border-b border-white/5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-blue-500", children: "add_circle" }),
        /* @__PURE__ */ jsx2("span", { className: "text-[11px] font-black text-white uppercase tracking-[2px]", children: "T\u1EA1o d\u1EF1 \xE1n m\u1EDBi" })
      ] }),
      /* @__PURE__ */ jsx2("button", { onClick: onCancel, className: "text-white/30 hover:text-white transition-colors", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined", children: "close" }) })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: "p-6 flex flex-col gap-4", children: /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx2(SectionLabel, { children: "T\xEAn d\u1EF1 \xE1n" }),
      /* @__PURE__ */ jsx2(
        "input",
        {
          value: name,
          onChange: (e) => setName(e.target.value),
          className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-blue-500/50",
          placeholder: "Nh\u1EADp t\xEAn d\u1EF1 \xE1n...",
          autoFocus: true,
          onKeyDown: (e) => e.key === "Enter" && name.trim() && onConfirm(name.trim())
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs2("div", { className: "flex gap-2 p-5 bg-black/20 border-t border-white/5", children: [
      /* @__PURE__ */ jsx2("button", { onClick: onCancel, className: "flex-1 h-11 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all", children: "Hu\u1EF7" }),
      /* @__PURE__ */ jsx2(
        "button",
        {
          onClick: () => name.trim() && onConfirm(name.trim()),
          disabled: !name.trim(),
          className: "flex-1 h-11 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-30",
          children: "T\u1EA1o ngay"
        }
      )
    ] })
  ] }) });
};
var ProjectManagerModal = ({ isOpen, projects, currentId, onSelect, onDelete, onClose }) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-dropdown", onClick: onClose, children: /* @__PURE__ */ jsxs2("div", { className: "relative w-full max-w-lg bg-[#131318] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs2("div", { className: "p-5 border-b border-white/5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-blue-500", children: "folder_shared" }),
        /* @__PURE__ */ jsx2("span", { className: "text-[11px] font-black text-white uppercase tracking-[2px]", children: "Danh s\xE1ch D\u1EF1 \xE1n con" })
      ] }),
      /* @__PURE__ */ jsx2("button", { onClick: onClose, className: "text-white/30 hover:text-white transition-colors", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined", children: "close" }) })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: "p-4 flex flex-col gap-2 overflow-y-auto max-h-[60vh] dark-scrollbar", children: projects.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "py-12 flex flex-col items-center justify-center text-white/10 gap-2", children: [
      /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-4xl", children: "inventory_2" }),
      /* @__PURE__ */ jsx2("p", { className: "text-[10px] uppercase font-bold tracking-widest", children: "Ch\u01B0a c\xF3 d\u1EF1 \xE1n n\xE0o \u0111\u01B0\u1EE3c l\u01B0u" })
    ] }) : projects.sort((a, b) => b.lastModified - a.lastModified).map((p) => /* @__PURE__ */ jsxs2(
      "div",
      {
        className: `group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${currentId === p.id ? "bg-blue-600/10 border-blue-500/40" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"}`,
        onClick: () => onSelect(p),
        children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsx2("span", { className: `text-[12px] font-bold ${currentId === p.id ? "text-blue-400" : "text-white"}`, children: p.name }),
            /* @__PURE__ */ jsxs2("span", { className: "text-[8px] text-white/30 uppercase tracking-widest", children: [
              "S\u1EEDa l\xFAc: ",
              new Date(p.lastModified).toLocaleString("vi-VN")
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "flex gap-2 mt-1", children: [
              /* @__PURE__ */ jsxs2("span", { className: "text-[7px] bg-white/5 px-1 rounded text-white/40 uppercase font-black", children: [
                p.data.scenes.length,
                " Scenes"
              ] }),
              /* @__PURE__ */ jsxs2("span", { className: "text-[7px] bg-white/5 px-1 rounded text-white/40 uppercase font-black", children: [
                p.data.actors.length,
                " Actors"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsx2("button", { onClick: (e) => {
              e.stopPropagation();
              onDelete(p.id);
            }, className: "w-8 h-8 flex items-center justify-center rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600/40 transition-all", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[18px]", children: "delete" }) }),
            /* @__PURE__ */ jsx2("button", { className: "w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[18px]", children: "play_arrow" }) })
          ] })
        ]
      },
      p.id
    )) }),
    /* @__PURE__ */ jsx2("div", { className: "p-4 bg-black/20 border-t border-white/5 text-center", children: /* @__PURE__ */ jsx2("p", { className: "text-[9px] text-white/20 italic", children: 'C\xE1c d\u1EF1 \xE1n con \u0111\u01B0\u1EE3c l\u01B0u trong file Bundle khi nh\u1EA5n "L\u01B0u d\u1EF1 \xE1n (PC)".' }) })
  ] }) });
};
var FrameSelector = ({ source, startSource, endSource, onSetStart, onSetEnd }) => /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
  /* @__PURE__ */ jsx2(
    "button",
    {
      onClick: () => onSetStart(startSource === source ? "none" : source),
      className: `w-5 h-5 rounded flex items-center justify-center text-[8px] font-black transition-all shadow-sm ${startSource === source ? "bg-blue-600 text-white border border-blue-400" : "bg-white/5 text-white/20 border border-white/5 hover:text-white/40"}`,
      title: "D\xF9ng l\xE0m Khung h\xECnh B\u1EAFt \u0111\u1EA7u (Start Frame)",
      children: "S"
    }
  ),
  /* @__PURE__ */ jsx2(
    "button",
    {
      onClick: () => onSetEnd(endSource === source ? "none" : source),
      className: `w-5 h-5 rounded flex items-center justify-center text-[8px] font-black transition-all shadow-sm ${endSource === source ? "bg-pink-600 text-white border border-pink-400" : "bg-white/5 text-white/20 border border-white/5 hover:text-white/40"}`,
      title: "D\xF9ng l\xE0m Khung h\xECnh K\u1EBFt th\xFAc (End Frame - Interpolation)",
      children: "E"
    }
  )
] });
var extractNameFromMedia = (filename) => {
  const base = filename.split(/[\\/]/).pop() || filename;
  return base.replace(/\.[^/.]+$/, "").trim();
};
var fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};
var escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
var getErrorMessage = (err) => {
  if (!err) return "L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};
var isSafetyError = (msg) => {
  const lowerMsg = msg.toLowerCase();
  const safetyKeywords = [
    "safety",
    "policy",
    "content",
    "filter",
    "violation",
    "flagged",
    "blocked",
    "unsafe",
    "harmful",
    "sensitive",
    "prohibited",
    "an to\xE0n",
    "ch\xEDnh s\xE1ch",
    "vi ph\u1EA1m",
    "t\u1EEB ch\u1ED1i",
    "b\u1ED9 l\u1ECDc",
    "nh\u1EA1y c\u1EA3m",
    "gi\u1EDBi h\u1EA1n",
    "ng\xF4n ng\u1EEF",
    "h\xECnh \u1EA3nh",
    "celebrity",
    "famous person",
    "safety celebrity"
  ];
  return safetyKeywords.some((kw) => lowerMsg.includes(kw));
};
var callWithRateLimitRetry = async (fn, onRetryCountdown, retries = RATE_LIMIT_RETRY_COUNT) => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      if (onRetryCountdown) onRetryCountdown(null);
      return await fn();
    } catch (err) {
      const errMsg = getErrorMessage(err).toLowerCase();
      if (isSafetyError(errMsg) || errMsg.includes("balance") || errMsg.includes("insufficient")) {
        throw err;
      }
      const isRetryable = errMsg.includes("rate limit") || errMsg.includes("429") || errMsg.includes("busy") || errMsg.includes("server error") || errMsg.includes("500") || errMsg.includes("timeout") || errMsg.includes("internal error") || errMsg.includes("network");
      if (isRetryable && attempt < retries) {
        attempt++;
        const totalDelay = Math.pow(2, attempt) * 2e3 + Math.random() * 1e3;
        let remaining = Math.round(totalDelay / 1e3);
        while (remaining > 0) {
          if (onRetryCountdown) onRetryCountdown(remaining);
          await new Promise((r) => setTimeout(r, 1e3));
          remaining--;
        }
        continue;
      }
      throw err;
    }
  }
  throw new Error("V\u01B0\u1EE3t qu\xE1 s\u1ED1 l\u1EA7n th\u1EED l\u1EA1i h\u1EC7 th\u1ED1ng.");
};
var extractLastFrame = async (videoBase64) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.style.opacity = "0";
    video.style.position = "absolute";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.pointerEvents = "none";
    const bytes = Uint8Array.from(atob(videoBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    let hasSeeked = false;
    const timeout = setTimeout(() => {
      console.warn("[extractLastFrame] Timeout after 15s");
      URL.revokeObjectURL(url);
      video.remove();
      reject(new Error("extractLastFrame timed out"));
    }, 15000);
    const doSeek = () => {
      if (hasSeeked) return;
      if (Number.isFinite(video.duration) && video.duration > 0) {
        hasSeeked = true;
        video.currentTime = Math.max(0, video.duration - 0.05);
      }
    };
    video.onloadedmetadata = doSeek;
    video.onloadeddata = doSeek;
    video.oncanplay = doSeek;
    video.onseeked = async () => {
      clearTimeout(timeout);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
        try {
          const { mediaId } = await Flow2.upload({
            base64,
            mimeType: "image/jpeg",
            name: `Scene_LastFrame_${Date.now()}`
          });
          console.log("[extractLastFrame] Uploaded last frame successfully, mediaId:", mediaId);
          URL.revokeObjectURL(url);
          video.remove();
          resolve({ base64, mediaId });
        } catch (e) {
          URL.revokeObjectURL(url);
          video.remove();
          reject(e);
        }
      } else {
        URL.revokeObjectURL(url);
        video.remove();
        reject(new Error("Canvas context failed"));
      }
    };
    video.onerror = (e) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      video.remove();
      reject(new Error("Video loading error: " + String(e)));
    };
    document.body.appendChild(video);
  });
};
var checkMatch = (assetName, text) => {
  const escapedName = escapeRegExp(assetName.toLowerCase());
  const pattern = `(^|[^a-z0-9\xE0\xE1\u1EA1\u1EA3\xE3\xE2\u1EA7\u1EA5\u1EAD\u1EA9\u1EAB\u0103\u1EB1\u1EAF\u1EB7\u1EB3\u1EB5\xE8\xE9\u1EB9\u1EBB\u1EBD\xEA\u1EC1\u1EBF\u1EC7\u1EC3\u1EC5\xEC\xED\u1ECB\u1EC9\u0129\xF2\xF3\u1ECD\u1ECF\xF5\xF4\u1ED3\u1ED1\u1ED9\u1ED5\u1ED7\u01A1\u1EDD\u1EDB\u1EE3\u1EDF\u1EE1\xF9\xFA\u1EE5\u1EE7\u0169\u01B0\u1EEB\u1EE9\u1EF1\u1EED\u1EEF\u1EF3\xFD\u1EF5\u1EF7\u1EF9])` + escapedName + `([^a-z0-9\xE0\xE1\u1EA1\u1EA3\xE3\xE2\u1EA7\u1EA5\u1EAD\u1EA9\u1EAB\u0103\u1EB1\u1EAF\u1EB7\u1EB3\u1EB5\xE8\xE9\u1EB9\u1EBB\u1EBD\xEA\u1EC1\u1EBF\u1EC7\u1EC3\u1EC5\xEC\xED\u1ECB\u1EC9\u0129\xF2\xF3\u1ECD\u1ECF\xF5\xF4\u1ED3\u1ED1\u1ED9\u1ED5\u1ED7\u01A1\u1EDD\u1EDB\u1EE3\u1EDF\u1EE1\xF9\xFA\u1EE5\u1EE7\u0169\u01B0\u1EEB\u1EE9\u1EF1\u1EED\u1EEF\u1EF3\xFD\u1EF5\u1EF7\u1EF9]|$)`;
  const regex = new RegExp(pattern, "i");
  return regex.test(text.toLowerCase());
};
var checkAssetMatch = (asset, text) => {
  if (checkMatch(asset.name, text)) return true;
  if (asset.aliases && asset.aliases.some((alias) => checkMatch(alias, text))) return true;
  if (asset.roles && asset.roles.some((role) => checkMatch(role, text))) return true;
  return false;
};
var parseChunks = (text) => {
  const raw = text.trim();
  if (!raw) return [];
  const parts = raw.split(/SCENE\s+/i).filter((p) => p.trim() !== "");
  return parts.map((p, i) => `SCENE ${p.trim()}`);
};
function MainAppContent({ auth }) {
  const [copyStatus, setCopyStatus] = useState3(false);
  const [isAdvancedConfigUnlocked, setIsAdvancedConfigUnlocked] = useState3(true);
  const [advancedPasswordInput, setAdvancedPasswordInput] = useState3("");
  const [isLockVisible, setIsLockVisible] = useState3(false);
  const lockClickCountRef = useRef(0);
  const lockClickTimerRef = useRef(null);
  const handleLockIconClick = () => {
    lockClickCountRef.current += 1;
    if (lockClickTimerRef.current) clearTimeout(lockClickTimerRef.current);
    if (lockClickCountRef.current >= 4) {
      setIsLockVisible(true);
      lockClickCountRef.current = 0;
    } else {
      lockClickTimerRef.current = setTimeout(() => {
        lockClickCountRef.current = 0;
      }, 1500);
    }
  };
  const [fullScript, setFullScript] = useState3("");
  const [storyText, setStoryText] = useState3("");
  const [storyImages, setStoryImages] = useState3([]);
  const [storyAnalysisPrompt, setStoryAnalysisPrompt] = useState3(DEFAULT_STORY_PROMPT);
  const [storyChunkSize, setStoryChunkSize] = useState3(150);
  const [storyConcurrency, setStoryConcurrency] = useState3(1);
  const [storyDelay, setStoryDelay] = useState3(1);
  const [isAnalyzingStory, setIsAnalyzingStory] = useState3(false);
  const [storyAnalysisPercent, setStoryAnalysisPercent] = useState3(0);
  const [actors, setActors] = useState3([]);
  const [locations, setLocations] = useState3([]);
  const [masterStyle, setMasterStyle] = useState3([]);
  const [scenes, setScenes] = useState3([]);
  const [statusMsg, setStatusMsg] = useState3("Ch\u1EDD k\u1ECBch b\u1EA3n...");
  const [selectedModel, setSelectedModel] = useState3("Omni 1.1 Flash");
  const [selectedImageModel, setSelectedImageModel] = useState3("\u{1F34C} Nano Banana Pro");
  const [globalDuration, setGlobalDuration] = useState3("8");
  const [aspectRatio, setAspectRatio] = useState3("16:9");
  const [resolution, setResolution] = useState3("720p");
  const [selectedLanguage, setSelectedLanguage] = useState3("M\u1EB7c \u0111\u1ECBnh");
  const [skipImageGen, setSkipImageGen] = useState3(false);
  const [useLastFrameAsReference, setUseLastFrameAsReference] = useState3(true);
  const [renderFromShotOnly, setRenderFromShotOnly] = useState3(false);
  const [shotCount, setShotCount] = useState3(1);
  const [shotPrompts, setShotPrompts] = useState3([""]);
  const [connectShot, setConnectShot] = useState3(false);
  const [connectScene, setConnectScene] = useState3(false);
  const [isStoryboardEnabled, setIsStoryboardEnabled] = useState3(false);
  const [isStoryboardCropEnabled, setIsStoryboardCropEnabled] = useState3(false);
  const [storyboardRows, setStoryboardRows] = useState3(2);
  const [storyboardCols, setStoryboardCols] = useState3(2);
  const [storyboardPrompt, setStoryboardPrompt] = useState3(DEFAULT_STORYBOARD_PROMPT);
  const [autoMerge, setAutoMerge] = useState3(false);
  const [videoGenMode, setVideoGenMode] = useState3("r2v");
  const [startFrameSource, setStartFrameSource] = useState3("none");
  const [endFrameSource, setEndFrameSource] = useState3("none");
  const [globalProductionRule, setGlobalProductionRule] = useState3(DEFAULT_SYSTEM_PROMPT);
  const [imageProductionRule, setImageProductionRule] = useState3(DEFAULT_IMAGE_PRODUCTION_RULE);
  const [healInstruction, setHealInstruction] = useState3(DEFAULT_HEAL_INSTRUCTION);
  const [directionalPrompt, setDirectionalPrompt] = useState3(DEFAULT_DIRECTIONAL_PROMPT);
  const [locationDirectionalPrompt, setLocationDirectionalPrompt] = useState3(DEFAULT_LOCATION_DIRECTIONAL_PROMPT);
  const [strictActorMatch, setStrictActorMatch] = useState3(false);
  const [strictLocationMatch, setStrictLocationMatch] = useState3(false);
  const [isAutoLoopEnabled, setIsAutoLoopEnabled] = useState3(false);
  const [autoLoopLimit, setAutoLoopLimit] = useState3(3);
  const [currentLoopCount, setCurrentLoopCount] = useState3(0);
  const [isAutoLooping, setIsAutoLooping] = useState3(false);
  const [loopRewritePrompt, setLoopRewritePrompt] = useState3(DEFAULT_LOOP_REWRITE_PROMPT);
  const [isLoopAllEnabled, setIsLoopAllEnabled] = useState3(false);
  const [loopAllLimit, setLoopAllLimit] = useState3(3);
  const [currentLoopAllCount, setCurrentLoopAllCount] = useState3(0);
  const [autoStory, setAutoStory] = useState3(false);
  const [autoDNA, setAutoDNA] = useState3(false);
  const [autoRender, setAutoRender] = useState3(false);
  const [isRunningAll, setIsRunningAll] = useState3(false);
  const [sceneScale, setSceneScale] = useState3(1);
  const [isAutoHealEnabled, setIsAutoHealEnabled] = useState3(true);
  const [isCelebrityCheckEnabled, setIsCelebrityCheckEnabled] = useState3(false);
  const [renderTimeout, setRenderTimeout] = useState3(300);
  const [retryDelay, setRetryDelay] = useState3(99);
  const [maxRetries, setMaxRetries] = useState3(0);
  const [maxAutoRetries, setMaxAutoRetries] = useState3(5);
  const [isQualityUnlocked, setIsQualityUnlocked] = useState3(true);
  const [accessInput, setAccessInput] = useState3("");
  const [maxScenes, setMaxScenes] = useState3(999);
  const [isSceneLimitUnlocked, setIsSceneLimitUnlocked] = useState3(true);
  const [sceneAccessInput, setSceneAccessInput] = useState3("");
  const [maxConcurrentRenders, setMaxConcurrentRenders] = useState3(1);
  const [renderDelay, setRenderDelay] = useState3(2);
  const [dnaMaxConcurrent, setDnaMaxConcurrent] = useState3(1);
  const [dnaDelay, setDnaDelay] = useState3(1.2);
  const [isProcessing, setIsProcessing] = useState3(false);
  const [isBatchRendering, setIsBatchRendering] = useState3(false);
  const [isPaused, setIsPaused] = useState3(false);
  const isPausedRef = useRef(false);
  const isBatchRenderingRef = useRef(false);
  const isAnalyzingStoryRef = useRef(false);
  const isScanningRef = useRef(false);
  const isRunningAllRef = useRef(false);
  const [isScanning, setIsScanning] = useState3(false);
  const [isSyncingToFlow, setIsSyncingToFlow] = useState3(false);
  const [dnaEditTarget, setDnaEditTarget] = useState3(null);
  const [saveState, setSaveState] = useState3("idle");
  const [renderProgress, setRenderProgress] = useState3({
    activeSceneIndex: null,
    phase: "idle",
    percent: 0,
    totalScenes: 0,
    completedScenes: 0
  });
  const [subProjects, setSubProjects] = useState3([]);
  const [currentProjectName, setCurrentProjectName] = useState3("D\u1EF1 \xE1n m\u1EB7c \u0111\u1ECBnh");
  const [currentProjectId, setCurrentProjectId] = useState3(null);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState3(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState3(false);
  const fullScriptRef = useRef(fullScript);
  const actorsRef = useRef(actors);
  const locationsRef = useRef(locations);
  const masterStyleRef = useRef(masterStyle);
  const scenesRef = useRef(scenes);
  const useLastFrameAsReferenceRef = useRef(useLastFrameAsReference);
  const renderFromShotOnlyRef = useRef(renderFromShotOnly);
  const shotCountRef = useRef(shotCount);
  const shotPromptsRef = useRef(shotPrompts);
  const connectShotRef = useRef(connectShot);
  const connectSceneRef = useRef(connectScene);
  const isStoryboardEnabledRef = useRef(isStoryboardEnabled);
  const isStoryboardCropEnabledRef = useRef(isStoryboardCropEnabled);
  const storyboardRowsRef = useRef(storyboardRows);
  const storyboardColsRef = useRef(storyboardCols);
  const storyboardPromptRef = useRef(storyboardPrompt);
  const autoMergeRef = useRef(autoMerge);
  const resolutionRef = useRef(resolution);
  const selectedLanguageRef = useRef(selectedLanguage);
  const videoGenModeRef = useRef(videoGenMode);
  const strictActorMatchRef = useRef(strictActorMatch);
  const strictLocationMatchRef = useRef(strictLocationMatch);
  const imageProductionRuleRef = useRef(imageProductionRule);
  const selectedImageModelRef = useRef(selectedImageModel);
  const startFrameSourceRef = useRef(startFrameSource);
  const endFrameSourceRef = useRef(endFrameSource);
  const isAutoHealEnabledRef = useRef(isAutoHealEnabled);
  const isCelebrityCheckEnabledRef = useRef(isCelebrityCheckEnabled);
  const renderTimeoutRef = useRef(renderTimeout);
  const retryDelayRef = useRef(retryDelay);
  const maxRetriesRef = useRef(maxRetries);
  const maxAutoRetriesRef = useRef(maxAutoRetries);
  const isAutoLoopEnabledRef = useRef(isAutoLoopEnabled);
  const autoLoopLimitRef = useRef(autoLoopLimit);
  const currentLoopCountRef = useRef(currentLoopCount);
  const isAutoLoopingRef = useRef(isAutoLooping);
  const isLoopAllEnabledRef = useRef(isLoopAllEnabled);
  const loopAllLimitRef = useRef(loopAllLimit);
  const maxConcurrentRendersRef = useRef(maxConcurrentRenders);
  const renderDelayRef = useRef(renderDelay);
  const dnaMaxConcurrentRef = useRef(dnaMaxConcurrent);
  const dnaDelayRef = useRef(dnaDelay);
  useEffect2(() => {
    fullScriptRef.current = fullScript;
  }, [fullScript]);
  useEffect2(() => {
    actorsRef.current = actors;
  }, [actors]);
  useEffect2(() => {
    locationsRef.current = locations;
  }, [locations]);
  useEffect2(() => {
    masterStyleRef.current = masterStyle;
  }, [masterStyle]);
  useEffect2(() => {
    scenesRef.current = scenes;
  }, [scenes]);
  useEffect2(() => {
    useLastFrameAsReferenceRef.current = useLastFrameAsReference;
  }, [useLastFrameAsReference]);
  useEffect2(() => {
    renderFromShotOnlyRef.current = renderFromShotOnly;
  }, [renderFromShotOnly]);
  useEffect2(() => {
    shotCountRef.current = shotCount;
  }, [shotCount]);
  useEffect2(() => {
    shotPromptsRef.current = shotPrompts;
  }, [shotPrompts]);
  useEffect2(() => {
    connectShotRef.current = connectShot;
  }, [connectShot]);
  useEffect2(() => {
    connectSceneRef.current = connectScene;
  }, [connectScene]);
  useEffect2(() => {
    isStoryboardEnabledRef.current = isStoryboardEnabled;
  }, [isStoryboardEnabled]);
  useEffect2(() => {
    isStoryboardCropEnabledRef.current = isStoryboardCropEnabled;
  }, [isStoryboardCropEnabled]);
  useEffect2(() => {
    storyboardRowsRef.current = storyboardRows;
  }, [storyboardRows]);
  useEffect2(() => {
    storyboardColsRef.current = storyboardCols;
  }, [storyboardCols]);
  useEffect2(() => {
    storyboardPromptRef.current = storyboardPrompt;
  }, [storyboardPrompt]);
  useEffect2(() => {
    autoMergeRef.current = autoMerge;
  }, [autoMerge]);
  useEffect2(() => {
    resolutionRef.current = resolution;
  }, [resolution]);
  useEffect2(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);
  useEffect2(() => {
    videoGenModeRef.current = videoGenMode;
  }, [videoGenMode]);
  useEffect2(() => {
    strictActorMatchRef.current = strictActorMatch;
  }, [strictActorMatch]);
  useEffect2(() => {
    strictLocationMatchRef.current = strictLocationMatch;
  }, [strictLocationMatch]);
  useEffect2(() => {
    imageProductionRuleRef.current = imageProductionRule;
  }, [imageProductionRule]);
  useEffect2(() => {
    selectedImageModelRef.current = selectedImageModel;
  }, [selectedImageModel]);
  useEffect2(() => {
    startFrameSourceRef.current = startFrameSource;
  }, [startFrameSource]);
  useEffect2(() => {
    endFrameSourceRef.current = endFrameSource;
  }, [endFrameSource]);
  useEffect2(() => {
    isAutoHealEnabledRef.current = isAutoHealEnabled;
  }, [isAutoHealEnabled]);
  useEffect2(() => {
    isCelebrityCheckEnabledRef.current = isCelebrityCheckEnabled;
  }, [isCelebrityCheckEnabled]);
  useEffect2(() => {
    renderTimeoutRef.current = renderTimeout;
  }, [renderTimeout]);
  useEffect2(() => {
    retryDelayRef.current = retryDelay;
  }, [retryDelay]);
  useEffect2(() => {
    maxRetriesRef.current = maxRetries;
  }, [maxRetries]);
  useEffect2(() => {
    maxAutoRetriesRef.current = maxAutoRetries;
  }, [maxAutoRetries]);
  useEffect2(() => {
    isAutoLoopEnabledRef.current = isAutoLoopEnabled;
  }, [isAutoLoopEnabled]);
  useEffect2(() => {
    autoLoopLimitRef.current = autoLoopLimit;
  }, [autoLoopLimit]);
  useEffect2(() => {
    currentLoopCountRef.current = currentLoopCount;
  }, [currentLoopCount]);
  useEffect2(() => {
    isAutoLoopingRef.current = isAutoLooping;
  }, [isAutoLooping]);
  useEffect2(() => {
    isLoopAllEnabledRef.current = isLoopAllEnabled;
  }, [isLoopAllEnabled]);
  useEffect2(() => {
    loopAllLimitRef.current = loopAllLimit;
  }, [loopAllLimit]);
  useEffect2(() => {
    maxConcurrentRendersRef.current = maxConcurrentRenders;
  }, [maxConcurrentRenders]);
  useEffect2(() => {
    renderDelayRef.current = renderDelay;
  }, [renderDelay]);
  useEffect2(() => {
    dnaMaxConcurrentRef.current = dnaMaxConcurrent;
  }, [dnaMaxConcurrent]);
  useEffect2(() => {
    dnaDelayRef.current = dnaDelay;
  }, [dnaDelay]);
  useEffect2(() => {
    isAnalyzingStoryRef.current = isAnalyzingStory;
  }, [isAnalyzingStory]);
  useEffect2(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);
  useEffect2(() => {
    isRunningAllRef.current = isRunningAll;
  }, [isRunningAll]);
  const handleUnlockAdvancedConfig = () => {
    if (advancedPasswordInput === ADVANCED_CONFIG_PASSWORD) {
      setIsAdvancedConfigUnlocked(true);
      setStatusMsg("\u0110\xE3 m\u1EDF kho\xE1 c\u1EA5u h\xECnh n\xE2ng cao.");
      setAdvancedPasswordInput("");
    } else {
      setStatusMsg("M\u1EADt kh\u1EA9u c\u1EA5u h\xECnh sai.");
      setAdvancedPasswordInput("");
    }
  };
  const handleCopyId = () => {
    auth.getDeviceId().then((id) => {
      navigator.clipboard.writeText(id);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2e3);
    });
  };
  const scriptChunks = useMemo(() => parseChunks(fullScript), [fullScript]);
  useEffect2(() => {
    const id = "flow-app-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        .dark-scrollbar::-webkit-scrollbar { width: 4px; }
        .dark-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
        @keyframes dropdown-enter { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-dropdown { animation: dropdown-enter 0.15s ease-out forwards; }
        html, body, #root { background: #0e0e0e; color: white; font-family: 'Google Sans Text', sans-serif; height: 100%; margin: 0; overflow: hidden; letter-spacing: 0.1px; }
        @keyframes pulse-ring { 0% { transform: scale(0.33); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: scale(1); opacity: 0; } }
        .shimmer { background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `;
      document.head.appendChild(style);
    }
    ffmpegService.load().catch((e) => console.error("FFmpeg Load Error", e));
  }, []);
  const getCurrentProjectData = () => ({
    version: "1.0.4",
    fullScript,
    storyText,
    storyImages,
    storyAnalysisPrompt,
    storyChunkSize,
    storyConcurrency,
    storyDelay,
    actors,
    locations,
    masterStyle,
    scenes,
    settings: {
      selectedModel,
      selectedImageModel,
      globalDuration,
      aspectRatio,
      resolution,
      selectedLanguage,
      globalProductionRule,
      imageProductionRule,
      healInstruction,
      directionalPrompt,
      locationDirectionalPrompt,
      isAutoLoopEnabled,
      autoLoopLimit,
      isLoopAllEnabled,
      loopAllLimit,
      loopRewritePrompt,
      maxAutoRetries,
      maxScenes,
      isQualityUnlocked,
      isSceneSettingUnlocked: isSceneLimitUnlocked,
      maxConcurrentRenders,
      renderDelay,
      dnaMaxConcurrent,
      dnaDelay,
      skipImageGen,
      useLastFrameAsReference,
      renderFromShotOnly,
      shotCount,
      shotPrompts,
      connectShot,
      connectScene,
      isStoryboardEnabled,
      isStoryboardCropEnabled,
      storyboardRows,
      storyboardCols,
      storyboardPrompt,
      autoMerge,
      videoGenMode,
      startFrameSource,
      endFrameSource,
      autoStory,
      autoDNA,
      autoRender,
      strictActorMatch,
      strictLocationMatch,
      isAutoHealEnabled,
      isCelebrityCheckEnabled,
      renderTimeout,
      retryDelay,
      maxRetries
    }
  });
  const loadProjectData = (project) => {
    setFullScript(project.fullScript || "");
    fullScriptRef.current = project.fullScript || "";
    setStoryText(project.storyText || "");
    setStoryImages(project.storyImages || []);
    setStoryAnalysisPrompt(project.storyAnalysisPrompt || DEFAULT_STORY_PROMPT);
    setStoryChunkSize(project.storyChunkSize || 150);
    setStoryConcurrency(project.storyConcurrency || 1);
    setStoryDelay(project.storyDelay || 1);
    setActors(project.actors || []);
    setLocations(project.locations || []);
    setMasterStyle(project.masterStyle || []);
    setScenes(project.scenes || []);
    if (project.settings) {
      const s = project.settings;
      setSelectedModel(s.selectedModel || "Veo 3.1 - Lite");
      setSelectedImageModel(s.selectedImageModel || "\u{1F34C} Nano Banana Pro");
      setGlobalDuration(s.globalDuration || "8");
      setAspectRatio(s.aspectRatio || "16:9");
      setResolution(s.resolution || "720p");
      setSelectedLanguage(s.selectedLanguage || "M\u1EB7c \u0111\u1ECBnh");
      selectedLanguageRef.current = s.selectedLanguage || "M\u1EB7c \u0111\u1ECBnh";
      setGlobalProductionRule(s.globalProductionRule || DEFAULT_SYSTEM_PROMPT);
      setImageProductionRule(s.imageProductionRule || DEFAULT_IMAGE_PRODUCTION_RULE);
      setHealInstruction(s.healInstruction || DEFAULT_HEAL_INSTRUCTION);
      setDirectionalPrompt(s.directionalPrompt || DEFAULT_DIRECTIONAL_PROMPT);
      setLocationDirectionalPrompt(s.locationDirectionalPrompt || DEFAULT_LOCATION_DIRECTIONAL_PROMPT);
      setIsAutoLoopEnabled(!!s.isAutoLoopEnabled);
      setAutoLoopLimit(s.autoLoopLimit || 3);
      setIsLoopAllEnabled(!!s.isLoopAllEnabled);
      setLoopAllLimit(s.loopAllLimit || 3);
      setLoopRewritePrompt(s.loopRewritePrompt || DEFAULT_LOOP_REWRITE_PROMPT);
      setMaxAutoRetries(s.maxAutoRetries ?? 5);
      setMaxScenes(s.maxScenes || 6);
      setIsQualityUnlocked(!!s.isQualityUnlocked);
      setIsSceneLimitUnlocked(!!s.isSceneSettingUnlocked);
      setMaxConcurrentRenders(s.maxConcurrentRenders || 1);
      setRenderDelay(s.renderDelay || 2);
      setDnaMaxConcurrent(s.dnaMaxConcurrent || 1);
      setDnaDelay(s.dnaDelay || 1.2);
      setSkipImageGen(!!s.skipImageGen);
      setUseLastFrameAsReference(!!s.useLastFrameAsReference);
      setRenderFromShotOnly(!!s.renderFromShotOnly);
      setShotCount(s.shotCount || 1);
      setShotPrompts(s.shotPrompts || [""]);
      setConnectShot(!!s.connectShot);
      setConnectScene(!!s.connectScene);
      setIsStoryboardEnabled(!!s.isStoryboardEnabled);
      setIsStoryboardCropEnabled(!!s.isStoryboardCropEnabled);
      setStoryboardRows(s.storyboardRows || 2);
      setStoryboardCols(s.storyboardCols || 2);
      setStoryboardPrompt(s.storyboardPrompt || DEFAULT_STORYBOARD_PROMPT);
      setAutoMerge(!!s.autoMerge);
      setVideoGenMode(s.videoGenMode || "r2v");
      setStartFrameSource(s.startFrameSource || "none");
      setEndFrameSource(s.endFrameSource || "none");
      setAutoStory(!!s.autoStory);
      setAutoDNA(!!s.autoDNA);
      setAutoRender(!!s.autoRender);
      setStrictActorMatch(!!s.strictActorMatch);
      setStrictLocationMatch(!!s.strictLocationMatch);
      setIsAutoHealEnabled(s.isAutoHealEnabled ?? true);
      setIsCelebrityCheckEnabled(!!s.isCelebrityCheckEnabled);
      setRenderTimeout(s.renderTimeout || 300);
      setRetryDelay(s.retryDelay || 99);
      setMaxRetries(s.maxRetries ?? 0);
    }
  };
  const importScript = () => {
    const currentScript = fullScriptRef.current;
    const currentChunks = parseChunks(currentScript);
    if (currentChunks.length === 0) return;
    const visibleChunks = currentChunks.slice(0, maxScenes);
    const newScenes = visibleChunks.map((text, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      chunkIndex: idx,
      rawText: text,
      storyboardStatus: "idle",
      imageStatus: "idle",
      status: "idle",
      retryCount: 0,
      localPercent: 0,
      localStatusDetail: "S\u1EB5n s\xE0ng"
    }));
    setScenes(newScenes);
    scenesRef.current = newScenes;
    setCurrentLoopCount(0);
    setIsAutoLooping(false);
    if (currentChunks.length > maxScenes) {
      setStatusMsg(`Ch\u1EC9 nh\u1EADp ${maxScenes}/${currentChunks.length} c\u1EA3nh.`);
    } else {
      setStatusMsg(`\u0110\xE3 nh\u1EADn ${newScenes.length} c\u1EA3nh.`);
    }
  };
  const handleResetScript = () => {
    setFullScript("");
    fullScriptRef.current = "";
    setScenes([]);
    scenesRef.current = [];
    setCurrentLoopCount(0);
    setIsAutoLooping(false);
    setStatusMsg("\u0110\xE3 Reset Timeline.");
  };
  const analyzeStory = async () => {
    if (!storyText.trim()) return;
    setIsAnalyzingStory(true);
    isAnalyzingStoryRef.current = true;
    setStoryAnalysisPercent(0);
    setStatusMsg("B\u1EAFt \u0111\u1EA7u ph\xE2n t\xEDch truy\u1EC7n & \u1EA3nh...");
    try {
      const words = storyText.trim().split(/\s+/);
      const chunks = [];
      for (let i = 0; i < words.length; i += storyChunkSize) {
        chunks.push(words.slice(i, i + storyChunkSize).join(" "));
      }
      const total = chunks.length;
      let completed = 0;
      let finalScript = "";
      const storyImageContext = storyImages.map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType
      }));
      const processChunk = async (chunk, index) => {
        if (!isAnalyzingStoryRef.current) throw new Error("CANCELED");
        const prompt = `${storyAnalysisPrompt}

\u0110O\u1EA0N TRUY\u1EC6N [${index + 1}/${total}]:
${chunk}`;
        const { text } = await callWithRateLimitRetry(() => Flow2.generate.text(prompt, {
          systemInstruction: "B\u1EA1n l\xE0 bi\xEAn k\u1ECBch chuy\xEAn nghi\u1EC7p, chuy\u1EC3n th\u1EC3 truy\u1EC7n v\xE0 h\xECnh \u1EA3nh tham kh\u1EA3o th\xE0nh k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh.",
          thinkingLevel: "low",
          images: storyImageContext.length > 0 ? storyImageContext : void 0
        }));
        completed++;
        setStoryAnalysisPercent(Math.round(completed / total * 100));
        setStatusMsg(`Ph\xE2n t\xEDch \u0111a ph\u01B0\u01A1ng th\u1EE9c: ${completed}/${total} \u0111o\u1EA1n...`);
        return text.trim();
      };
      if (storyConcurrency === 1) {
        for (let i = 0; i < chunks.length; i++) {
          if (!isAnalyzingStoryRef.current) break;
          const result = await processChunk(chunks[i], i);
          finalScript += (finalScript ? "\n\n" : "") + result;
          setFullScript(finalScript);
          fullScriptRef.current = finalScript;
          await new Promise((r) => setTimeout(r, storyDelay * 1e3));
        }
      } else {
        const active = /* @__PURE__ */ new Set();
        const results = new Array(chunks.length);
        for (let i = 0; i < chunks.length; i++) {
          if (!isAnalyzingStoryRef.current) break;
          if (active.size >= storyConcurrency) await Promise.race(active);
          const p = processChunk(chunks[i], i).then((res) => {
            results[i] = res;
            const currentCombined = results.filter((r) => r).join("\n\n");
            setFullScript(currentCombined);
            fullScriptRef.current = currentCombined;
            return res;
          }).finally(() => active.delete(p));
          active.add(p);
          await new Promise((r) => setTimeout(r, storyDelay * 1e3));
        }
        await Promise.all(active);
        finalScript = results.join("\n\n");
      }
      setFullScript(finalScript);
      fullScriptRef.current = finalScript;
      setStatusMsg("Ph\xE2n t\xEDch truy\u1EC7n & \u1EA3nh ho\xE0n t\u1EA5t.");
    } catch (err) {
      if (getErrorMessage(err) === "CANCELED") {
        setStatusMsg("\u0110\xE3 d\u1EEBng ph\xE2n t\xEDch truy\u1EC7n.");
      } else {
        setStatusMsg("L\u1ED7i ph\xE2n t\xEDch: " + getErrorMessage(err));
      }
    } finally {
      setIsAnalyzingStory(false);
      isAnalyzingStoryRef.current = false;
    }
  };
  const handleSaveProject = async () => {
    setSaveState("saving");
    setStatusMsg("\u0110ang \u0111\u1ED3ng b\u1ED9 v\xE0 \u0111\xF3ng g\xF3i d\u1EEF li\u1EC7u...");
    try {
      const currentData = getCurrentProjectData();
      const currentId = currentProjectId || Math.random().toString(36).substr(2, 9);
      const updatedSubProjects = [...subProjects];
      const activeIdx = updatedSubProjects.findIndex((p) => p.id === currentId);
      if (activeIdx !== -1) {
        updatedSubProjects[activeIdx] = { ...updatedSubProjects[activeIdx], data: currentData, lastModified: Date.now() };
      } else {
        updatedSubProjects.push({ id: currentId, name: currentProjectName, data: currentData, lastModified: Date.now() });
      }
      setSubProjects(updatedSubProjects);
      setCurrentProjectId(currentId);
      const bundle = {
        bundleVersion: "1.1.2",
        activeProjectId: currentId,
        subProjects: updatedSubProjects,
        timestamp: Date.now()
      };
      const jsonStr = JSON.stringify(bundle);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        const timeStr = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5).replace(/:/g, "");
        const safeName = currentProjectName.replace(/[\\/:*?"<>|]/g, "_").slice(0, 30);
        await Flow2.download({
          base64,
          mimeType: "application/json",
          filename: `MLT_BUNDLE_${safeName}_${dateStr}_${timeStr}.json`
        });
        setSaveState("saved");
        setStatusMsg("T\u1EA5t c\u1EA3 d\u1EF1 \xE1n \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\xF3ng g\xF3i v\xE0 l\u01B0u!");
        setTimeout(() => setSaveState("idle"), 2e3);
      };
      reader.onerror = () => {
        throw new Error("FileReader Error");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setSaveState("error");
      setStatusMsg("L\u1ED7i l\u01B0u d\u1EF1 \xE1n: " + getErrorMessage(err));
      setTimeout(() => setSaveState("idle"), 3e3);
    }
  };
  const finalizeCreateProject = (name) => {
    const currentData = getCurrentProjectData();
    const currentId = currentProjectId || Math.random().toString(36).substr(2, 9);
    setSubProjects((prev) => {
      const exists = prev.find((p) => p.id === currentId);
      if (exists) {
        return prev.map((p) => p.id === currentId ? { ...p, data: currentData, lastModified: Date.now() } : p);
      } else {
        return [...prev, { id: currentId, name: currentProjectName, data: currentData, lastModified: Date.now() }];
      }
    });
    setFullScript("");
    fullScriptRef.current = "";
    setStoryText("");
    setStoryImages([]);
    setActors([]);
    setLocations([]);
    setMasterStyle([]);
    setScenes([]);
    scenesRef.current = [];
    setSelectedModel("Veo 3.1 - Lite");
    setSelectedImageModel("\u{1F34C} Nano Banana Pro");
    setGlobalDuration("8");
    setAspectRatio("16:9");
    setResolution("720p");
    setSelectedLanguage("M\u1EB7c \u0111\u1ECBnh");
    selectedLanguageRef.current = "M\u1EB7c \u0111\u1ECBnh";
    setGlobalProductionRule(DEFAULT_SYSTEM_PROMPT);
    setImageProductionRule(DEFAULT_IMAGE_PRODUCTION_RULE);
    setIsAutoLoopEnabled(false);
    setAutoLoopLimit(3);
    setIsLoopAllEnabled(false);
    setLoopAllLimit(3);
    setLoopRewritePrompt(DEFAULT_LOOP_REWRITE_PROMPT);
    setMaxAutoRetries(5);
    setMaxScenes(6);
    setIsProcessing(false);
    setIsBatchRendering(false);
    isBatchRenderingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsAutoLooping(false);
    isAutoLoopingRef.current = false;
    setIsCelebrityCheckEnabled(false);
    setRenderFromShotOnly(false);
    setShotCount(1);
    setShotPrompts([""]);
    setConnectShot(false);
    setConnectScene(false);
    setIsStoryboardEnabled(false);
    setIsStoryboardCropEnabled(false);
    setStoryboardRows(2);
    setStoryboardCols(2);
    setStoryboardPrompt(DEFAULT_STORYBOARD_PROMPT);
    setStartFrameSource("none");
    setEndFrameSource("none");
    const newId = Math.random().toString(36).substr(2, 9);
    setCurrentProjectName(name);
    setCurrentProjectId(newId);
    setIsNewProjectModalOpen(false);
    setStatusMsg(`\u0110\xE3 t\u1EA1o d\u1EF1 \xE1n m\u1EDBi: ${name}`);
  };
  const handleCreateNewProject = () => {
    setIsNewProjectModalOpen(true);
  };
  const handleOpenProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setStatusMsg("\u0110ang \u0111\u1ECDc file d\u1EF1 \xE1n...");
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.bundleVersion) {
          const bundle = json;
          const restoredProjects = bundle.subProjects || [];
          setSubProjects(restoredProjects);
          const activeId = bundle.activeProjectId;
          const activeProject = restoredProjects.find((p) => p.id === activeId);
          if (activeProject) {
            loadProjectData(activeProject.data);
            setCurrentProjectName(activeProject.name);
            setCurrentProjectId(activeProject.id);
            setStatusMsg(`G\xF3i d\u1EF1 \xE1n "${activeProject.name}" \u0111\xE3 \u0111\u01B0\u1EE3c kh\xF4i ph\u1EE5c (${restoredProjects.length} d\u1EF1 \xE1n con).`);
          } else if (restoredProjects.length > 0) {
            const first = restoredProjects[0];
            loadProjectData(first.data);
            setCurrentProjectName(first.name);
            setCurrentProjectId(first.id);
            setStatusMsg(`G\xF3i d\u1EF1 \xE1n \u0111\u01B0\u1EE3c kh\xF4i ph\u1EE5c (${restoredProjects.length} d\u1EF1 \xE1n con).`);
          }
        } else if (json.version) {
          const project = json;
          const projectName = extractNameFromMedia(file.name);
          const newId = Math.random().toString(36).substr(2, 9);
          loadProjectData(project);
          setCurrentProjectName(projectName);
          setCurrentProjectId(newId);
          setSubProjects((prev) => [...prev, { id: newId, name: projectName, data: project, lastModified: Date.now() }]);
          setStatusMsg(`D\u1EF1 \xE1n l\u1EBB "${projectName}" \u0111\xE3 \u0111\u01B0\u1EE3c kh\xF4i ph\u1EE5c.`);
        } else {
          throw new Error("\u0110\u1ECBnh d\u1EA1ng file kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.");
        }
      } catch (err) {
        setStatusMsg("L\u1ED7i m\u1EDF d\u1EF1 \xE1n: " + getErrorMessage(err));
      }
    };
    input.click();
  };
  const handleSelectSubProject = (project) => {
    const currentData = getCurrentProjectData();
    const currentId = currentProjectId || Math.random().toString(36).substr(2, 9);
    setSubProjects((prev) => {
      const exists = prev.find((p) => p.id === currentId);
      if (exists) {
        return prev.map((p) => p.id === currentId ? { ...p, data: currentData, lastModified: Date.now() } : p);
      } else {
        return [...prev, { id: currentId, name: currentProjectName, data: currentData, lastModified: Date.now() }];
      }
    });
    loadProjectData(project.data);
    setCurrentProjectName(project.name);
    setCurrentProjectId(project.id);
    setIsProjectManagerOpen(false);
    setStatusMsg(`\u0110\xE3 chuy\u1EC3n sang d\u1EF1 \xE1n: ${project.name}`);
  };
  const handleDeleteSubProject = (id) => {
    setSubProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setCurrentProjectName("D\u1EF1 \xE1n m\u1EB7c \u0111\u1ECBnh");
      setFullScript("");
      setActors([]);
      setScenes([]);
    }
  };
  const syncAllToFlow = async () => {
    if (isSyncingToFlow || actors.length === 0 && locations.length === 0 && masterStyle.length === 0) return;
    setIsSyncingToFlow(true);
    setStatusMsg("B\u1EAFt \u0111\u1EA7u \u0111\u1ED3ng b\u1ED9 DNA Library l\xEAn h\u1EC7 th\u1ED1ng Flow...");
    try {
      const newStyle = [...masterStyleRef.current];
      for (let i = 0; i < newStyle.length; i++) {
        const item = newStyle[i];
        setStatusMsg(`\u0110\u1ED3ng b\u1ED9 Style: ${item.name}...`);
        const { mediaId } = await Flow2.upload({
          base64: item.base64,
          mimeType: item.mimeType,
          name: item.name
        });
        newStyle[i] = { ...item, mediaId };
      }
      setMasterStyle(newStyle);
      masterStyleRef.current = newStyle;
      const newActors = [...actorsRef.current];
      for (let i = 0; i < newActors.length; i++) {
        const item = newActors[i];
        setStatusMsg(`\u0110\u1ED3ng b\u1ED9 Nh\xE2n v\u1EADt: ${item.name}...`);
        const { mediaId } = await Flow2.upload({
          base64: item.base64,
          mimeType: item.mimeType,
          name: item.name
        });
        newActors[i] = { ...item, mediaId };
      }
      setActors(newActors);
      actorsRef.current = newActors;
      const newLocations = [...locationsRef.current];
      for (let i = 0; i < newLocations.length; i++) {
        const item = newLocations[i];
        setStatusMsg(`\u0110\u1ED3ng b\u1ED9 B\u1ED1i c\u1EA3nh: ${item.name}...`);
        const { mediaId } = await Flow2.upload({
          base64: item.base64,
          mimeType: item.mimeType,
          name: item.name
        });
        newLocations[i] = { ...item, mediaId };
      }
      setLocations(newLocations);
      locationsRef.current = newLocations;
      setStatusMsg("\u0110\u1ED3ng b\u1ED9 DNA ho\xE0n t\u1EA5t! T\u1EA5t c\u1EA3 Media ID \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt m\u1EDBi.");
    } catch (err) {
      setStatusMsg("L\u1ED7i \u0111\u1ED3ng b\u1ED9 DNA: " + getErrorMessage(err));
    } finally {
      setIsSyncingToFlow(false);
    }
  };
  const fixActorDNA = async (asset) => {
    setStatusMsg(`\u{1F3A8} [DNA REDESIGN] \u0110ang thi\u1EBFt k\u1EBF l\u1EA1i khu\xF4n m\u1EB7t \u0111\u1ED9c nh\u1EA5t cho ${asset.name}...`);
    try {
      const fixResult = await callWithRateLimitRetry(() => Flow2.generate.image({
        prompt: `Professional cinematic portrait. Redesign facial features to be 100% unique and strictly non-celebrity. MUST RETAIN identical hair style, eye color, skin texture, clothing, and background from reference. Highest fidelity.`,
        modelDisplayName: selectedImageModelRef.current,
        aspectRatio: "1:1",
        referenceImageMediaIds: [asset.mediaId]
      }));
      const updatedAsset = {
        ...asset,
        mediaId: fixResult.mediaId,
        base64: fixResult.base64,
        mimeType: fixResult.mimeType
      };
      setActors((prev) => prev.map((a) => a.id === asset.id ? updatedAsset : a));
      try {
        const ext = updatedAsset.mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        await Flow2.download({
          base64: updatedAsset.base64,
          mimeType: updatedAsset.mimeType,
          filename: `DNA_FIXED_${updatedAsset.name.replace(/\s+/g, "_")}.${ext}`
        });
      } catch (dErr) {
      }
      setStatusMsg(`\u2728 [DNA FIXED] Nh\xE2n v\u1EADt ${asset.name} \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt khu\xF4n m\u1EB7t m\u1EDBi.`);
      return updatedAsset;
    } catch (err) {
      console.error("Critical DNA Fix Error:", err);
      setStatusMsg(`\u274C [DNA ERROR] Kh\xF4ng th\u1EC3 thi\u1EBFt k\u1EBF l\u1EA1i khu\xF4n m\u1EB7t cho ${asset.name}.`);
      return asset;
    }
  };
  const verifyActorSafety = async (asset) => {
    if (!isCelebrityCheckEnabledRef.current) return asset;
    const maxFixAttempts = 2;
    let currentAsset = { ...asset };
    let fixAttempts = 0;
    while (fixAttempts < maxFixAttempts) {
      setStatusMsg(`\u{1F50D} [QU\xC9T CH\xCDNH S\xC1CH] \u0110ang test Video 4s: ${currentAsset.name}...`);
      try {
        await Flow2.generate.video({
          prompt: `Cinematic test: ${currentAsset.name} looking at camera and blinking naturally, photorealistic details.`,
          modelDisplayName: "Omni 1.1 Flash",
          aspectRatio: "16:9",
          durationSeconds: 4,
          resolution: "360p",
          referenceImageMediaIds: [currentAsset.mediaId]
        });
        setStatusMsg(`\u2705 [CH\u1EA4P THU\u1EACN] DNA nh\xE2n v\u1EADt ${currentAsset.name} an to\xE0n.`);
        return currentAsset;
      } catch (err) {
        const errMsg = getErrorMessage(err);
        if (errMsg === "CANCELED") return currentAsset;
        fixAttempts++;
        setStatusMsg(`\u26A0\uFE0F [C\u1EA2NH B\xC1O] DNA ${currentAsset.name} b\u1ECB t\u1EEB ch\u1ED1i b\u1EDFi Video Filter. \u0110ang t\u1EF1 s\u1EEDa...`);
        await new Promise((r) => setTimeout(r, 1200));
        currentAsset = await fixActorDNA(currentAsset);
        setStatusMsg(`\u{1F504} \u0110ang ki\u1EC3m tra l\u1EA1i DNA m\u1EDBi b\u1EB1ng Omni Flash 4s...`);
        await new Promise((r) => setTimeout(r, 800));
      }
    }
    return currentAsset;
  };
  const scanAndCreateAssets = async () => {
    const currentScript = fullScriptRef.current;
    const currentChunks = parseChunks(currentScript);
    if (!currentScript || currentChunks.length === 0) return;
    setIsScanning(true);
    isScanningRef.current = true;
    setStatusMsg("\u0110ang qu\xE9t DNA n\xE2ng cao...");
    try {
      const checkExistsStrict = (name, type) => {
        const library = type === "actor" ? actorsRef.current : locationsRef.current;
        const normalizedInput = name.toLowerCase().trim();
        return library.find(
          (asset) => asset.name.toLowerCase().trim() === normalizedInput || asset.aliases?.some((alias) => alias.toLowerCase().trim() === normalizedInput)
        );
      };
      const executeDnaTask = async (task) => {
        if (!isScanningRef.current) throw new Error("CANCELED");
        const existing = checkExistsStrict(task.name, task.type);
        if (existing) {
          setStatusMsg(`DNA: ${task.name} \u0111\xE3 t\u1ED3n t\u1EA1i trong th\u01B0 vi\u1EC7n.`);
          return;
        }
        const taskRoles = Array.isArray(task.roles) ? task.roles.join(", ") : "";
        const prompt = task.type === "actor" ? `${directionalPrompt}. Nh\xE2n v\u1EADt: ${task.name}. Vai tr\xF2: ${taskRoles}. DNA: ${task.traits || ""}. Photorealistic.` : `${locationDirectionalPrompt}. B\u1ED1i c\u1EA3nh: ${task.name}. DNA: ${task.traits || ""}. Cinema view.`;
        const img = await callWithRateLimitRetry(() => Flow2.generate.image({
          prompt,
          modelDisplayName: selectedImageModelRef.current,
          aspectRatio: task.type === "actor" ? "1:1" : "16:9"
        }));
        let asset = {
          id: Math.random().toString(36).substr(2, 9),
          name: task.name,
          aliases: task.aliases || [],
          roles: task.roles || [],
          traits: task.traits || "",
          mediaId: img.mediaId,
          base64: img.base64,
          mimeType: img.mimeType,
          type: task.type
        };
        if (task.type === "actor" && isCelebrityCheckEnabledRef.current) {
          asset = await verifyActorSafety(asset);
        }
        try {
          const extension = asset.mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
          const absoluteFileName = asset.name.trim().replace(/[\\/:*?"<>|]/g, "_") || "DNA_Asset";
          await Flow2.download({ base64: asset.base64, mimeType: asset.mimeType, filename: `${absoluteFileName}.${extension}` });
        } catch (downloadErr) {
          console.warn("L\u1ED7i t\u1EA3i xu\u1ED1ng:", downloadErr);
        }
        if (task.type === "actor") setActors((prev) => [...prev, asset]);
        else setLocations((prev) => [...prev, asset]);
        setStatusMsg(`DNA: ${task.name} OK.`);
      };
      if (scenesRef.current.length === 0) importScript();
      const limit = Math.min(currentChunks.length, maxScenes);
      setStatusMsg(`Ph\xE2n t\xEDch DNA (${limit} c\u1EA3nh)...`);
      const allFoundEntities = { actors: [], locations: [] };
      for (let i = 0; i < limit; i++) {
        if (!isScanningRef.current) break;
        const start = Math.max(0, i - 1);
        const end = Math.min(currentChunks.length, i + 2);
        const windowContext = currentChunks.slice(start, end).join("\n\n");
        const extractionPrompt = `Nhi\u1EC7m v\u1EE5: Tr\xEDch xu\u1EA5t CHI TI\u1EBET NH\xC2N V\u1EACT v\xE0 B\u1ED0I C\u1EA2NH cho c\u1EA3nh trung t\xE2m (C\u1EA3nh ${i + 1}).
QUY T\u1EAEC:
1. X\xE1c \u0111\u1ECBnh T\xEAn ch\xEDnh (Primary Name).
2. T\xECm c\xE1c T\xEAn g\u1ECDi kh\xE1c (Aliases) d\xF9ng trong c\u1EA3nh (Anh \u1EA5y, H\u1EAFn, S\xE1t th\u1EE7, v.v).
3. X\xE1c \u0111\u1ECBnh Vai tr\xF2/Quan h\u1EC7 (Roles).
4. M\xF4 t\u1EA3 DNA (Traits) ngo\u1EA1i h\xECnh ng\u1EAFn g\u1ECDn.
5. Ch\u1EC9 ph\u1EA3n h\u1ED3i DUY NH\u1EA4T JSON.

JSON FORMAT: 
{
  "actors": [{"name": "T\xEAn ch\xEDnh", "aliases": ["T\xEAn kh\xE1c"], "roles": ["Quan h\u1EC7"], "traits": "M\xF4 t\u1EA3 DNA"}],
  "locations": [{"name": "T\xEAn ch\xEDnh", "aliases": [], "traits": "M\xF4 t\u1EA3 b\u1ED1i c\u1EA3nh"}]
}

NG\u1EEE C\u1EA2NH:
${windowContext}`;
        try {
          const { text: jsonRaw } = await callWithRateLimitRetry(() => Flow2.generate.text(extractionPrompt, { systemInstruction: "Tr\u1EE3 l\xFD \u0111\u1EA1o di\u1EC5n, tr\xEDch xu\u1EA5t JSON DNA n\xE2ng cao.", thinkingLevel: "medium" }));
          const jsonMatch = jsonRaw.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : jsonRaw;
          const extracted = JSON.parse(jsonString.replace(/```json|```/g, "").trim());
          if (extracted.actors && Array.isArray(extracted.actors)) allFoundEntities.actors.push(...extracted.actors);
          if (extracted.locations && Array.isArray(extracted.locations)) allFoundEntities.locations.push(...extracted.locations);
        } catch (e) {
          console.warn(`L\u1ED7i ph\xE2n t\xEDch c\u1EA3nh ${i + 1}:`, e);
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      const uniqueTasks = [];
      const seenNames = /* @__PURE__ */ new Set();
      const processList = (list, type) => {
        if (!Array.isArray(list)) return;
        list.forEach((item) => {
          if (!item || typeof item !== "object") return;
          const rawName = item.name || item.character || item.location || "";
          const mainName = String(rawName).trim();
          if (!mainName) return;
          const existing = checkExistsStrict(mainName, type);
          if (!existing && !seenNames.has(mainName.toLowerCase())) {
            seenNames.add(mainName.toLowerCase());
            uniqueTasks.push({
              name: mainName,
              aliases: Array.isArray(item.aliases) ? item.aliases : [],
              roles: Array.isArray(item.roles) ? item.roles : [],
              traits: item.traits || "",
              type
            });
          }
        });
      };
      processList(allFoundEntities.actors, "actor");
      processList(allFoundEntities.locations, "location");
      if (uniqueTasks.length > 0) {
        setStatusMsg(`B\u1EAFt \u0111\u1EA7u t\u1EA1o ${uniqueTasks.length} DNA m\u1EDBi...`);
        const activeDna = /* @__PURE__ */ new Set();
        const dnaParallel = dnaMaxConcurrentRef.current || 1;
        for (const task of uniqueTasks) {
          if (!isScanningRef.current) break;
          if (dnaParallel === 1) {
            await executeDnaTask(task);
          } else {
            if (activeDna.size >= dnaParallel) await Promise.race(activeDna);
            const p = executeDnaTask(task).finally(() => activeDna.delete(p));
            activeDna.add(p);
          }
          await new Promise((r) => setTimeout(r, (dnaDelayRef.current || 1) * 1e3));
        }
        await Promise.all(activeDna);
      }
      setStatusMsg(`DNA Ho\xE0n t\u1EA5t (${uniqueTasks.length} m\u1EDBi).`);
    } catch (err) {
      if (getErrorMessage(err) === "CANCELED") {
        setStatusMsg("\u0110\xE3 d\u1EEBng DNA Scanning.");
      } else {
        setStatusMsg("L\u1ED7i: " + getErrorMessage(err));
      }
    } finally {
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };
  const handleManualUpload = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dnaName = extractNameFromMedia(file.name);
      setStatusMsg(`\u0110ang t\u1EA3i: ${dnaName}...`);
      try {
        const base64 = await fileToBase64(file);
        const uploaded = await Flow2.upload({ base64, mimeType: file.type, name: dnaName });
        let newAsset = {
          id: Math.random().toString(36).substr(2, 9),
          name: dnaName,
          aliases: [],
          roles: [],
          traits: "",
          mediaId: uploaded.mediaId,
          base64,
          mimeType: file.type,
          type
        };
        if (type === "actor" && isCelebrityCheckEnabledRef.current) {
          newAsset = await verifyActorSafety(newAsset);
        }
        if (type === "actor") setActors((prev) => [...prev, newAsset]);
        else if (type === "location") setLocations((prev) => [...prev, newAsset]);
        else if (type === "story_ref") setStoryImages((prev) => [...prev, newAsset]);
        else setMasterStyle((prev) => [...prev, newAsset]);
        setStatusMsg(`\u0110\xE3 th\xEAm: ${newAsset.name}`);
      } catch (err) {
        setStatusMsg("L\u1ED7i: " + getErrorMessage(err));
      }
    };
    input.click();
  };
  const handleBatchUpload = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      setStatusMsg(`\u0110ang t\u1EA3i ${files.length} file...`);
      try {
        for (const file of files) {
          const dnaName = extractNameFromMedia(file.name);
          const base64 = await fileToBase64(file);
          const uploaded = await Flow2.upload({ base64, mimeType: file.type, name: dnaName });
          let newAsset = {
            id: Math.random().toString(36).substr(2, 9),
            name: dnaName,
            aliases: [],
            roles: [],
            traits: "",
            mediaId: uploaded.mediaId,
            base64,
            mimeType: file.type,
            type
          };
          if (type === "actor" && isCelebrityCheckEnabledRef.current) {
            newAsset = await verifyActorSafety(newAsset);
          }
          if (type === "actor") setActors((prev) => [...prev, newAsset]);
          else if (type === "location") setLocations((prev) => [...prev, newAsset]);
          else if (type === "story_ref") setStoryImages((prev) => [...prev, newAsset]);
          else setMasterStyle((prev) => [...prev, newAsset]);
        }
        setStatusMsg(`T\u1EA3i l\xEAn xong ${files.length} file.`);
      } catch (err) {
        setStatusMsg("L\u1ED7i: " + getErrorMessage(err));
      }
    };
    input.click();
  };
  const removeAsset = (id, type) => {
    if (type === "actor") setActors((prev) => prev.filter((a) => a.id !== id));
    else if (type === "location") setLocations((prev) => prev.filter((l) => l.id !== id));
    else if (type === "story_ref") setStoryImages((prev) => prev.filter((s) => s.id !== id));
    else setMasterStyle((prev) => prev.filter((a) => a.id !== id));
  };
  const updateAssetDNA = (id, updates) => {
    setActors((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a));
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
    setDnaEditTarget(null);
    setStatusMsg("\u0110\xE3 c\u1EADp nh\u1EADt DNA.");
  };
  const handleSetVoice = async (actorId) => {
    try {
      setStatusMsg("Ch\u1ECDn \xE2m thanh cho nh\xE2n v\u1EADt...");
      const media = await Flow2.media.select({ filter: "audio" });
      if (media) {
        setActors((prev) => prev.map((a) => a.id === actorId ? {
          ...a,
          voiceMediaId: media.mediaId,
          voiceName: media.name
        } : a));
        setStatusMsg(`\u0110\xE3 g\xE1n gi\u1ECDng: ${media.name}`);
      }
    } catch (err) {
      console.warn("L\u1ED7i ch\u1ECDn gi\u1ECDng:", err);
    }
  };
  const removeVoice = (actorId) => {
    setActors((prev) => prev.map((a) => a.id === actorId ? {
      ...a,
      voiceMediaId: void 0,
      voiceName: void 0
    } : a));
    setStatusMsg("\u0110\xE3 g\u1EE1 gi\u1ECDng nh\xE2n v\u1EADt.");
  };
  const getReferencesForText = (text) => {
    const ids = [];
    const audioIds = [];
    masterStyleRef.current.forEach((m) => ids.push(m.mediaId));
    const lines = text.split("\n");
    const actorTargetLine = lines.find((l) => l.toLowerCase().includes("nh\xE2n v\u1EADt:")) || "";
    const locationTargetLine = lines.find((l) => l.toLowerCase().includes("b\u1ED1i c\u1EA3nh:")) || "";
    const checkStrictPhraseMatch = (asset, line, label) => {
      const parts = line.split(new RegExp(label + ":", "i"));
      if (parts.length < 2) return false;
      const content = parts[1].trim();
      const segments = content.split(/[,;.]/).map((s) => s.replace(/\(.*\)/g, "").trim().toLowerCase()).filter((s) => !!s);
      const assetNames = [asset.name, ...asset.aliases || [], ...asset.roles || []].map((n) => n.toLowerCase().trim()).filter((n) => !!n);
      return segments.some((seg) => assetNames.includes(seg));
    };
    actorsRef.current.forEach((a) => {
      const isMatched = strictActorMatchRef.current ? checkStrictPhraseMatch(a, actorTargetLine, "nh\xE2n v\u1EADt") : checkAssetMatch(a, text);
      if (isMatched) {
        ids.push(a.mediaId);
        if (a.voiceMediaId) audioIds.push(a.voiceMediaId);
      }
    });
    locationsRef.current.forEach((l) => {
      const isMatched = strictLocationMatchRef.current ? checkStrictPhraseMatch(l, locationTargetLine, "b\u1ED1i c\u1EA3nh") : checkAssetMatch(l, text);
      if (isMatched) ids.push(l.mediaId);
    });
    return {
      imageIds: Array.from(new Set(ids)).slice(0, 10),
      audioIds: Array.from(new Set(audioIds)).slice(0, 5)
    };
  };
  const healScript = async (originalText, errorDescription) => {
    const prompt = `NHI\u1EC6M V\u1EE4: ${healInstruction}
L\xDD DO C\u1EA6N S\u1EECA: L\u1ED7i "${errorDescription}".
R\xC0NG BU\u1ED8C: Tuy\u1EC7t \u0111\u1ED1i gi\u1EEF nguy\xEAn c\u1ED1t truy\u1EC7n, gi\u1EEF nh\xE2n v\u1EADt v\xE0 b\u1ED1i c\u1EA3nh.
K\u1ECACH B\u1EA2N G\u1ED0C: "${originalText}"`;
    try {
      const { text } = await callWithRateLimitRetry(() => Flow2.generate.text(prompt, {
        systemInstruction: healInstruction,
        thinkingLevel: "low"
      }));
      return text.trim();
    } catch (e) {
      return originalText;
    }
  };
  const rewriteScenesForLoop = async () => {
    setStatusMsg("V\xF2ng l\u1EB7p: \u0110ang vi\u1EBFt l\u1EA1i k\u1ECBch b\u1EA3n...");
    const updatedScenes = [...scenesRef.current];
    for (let i = 0; i < updatedScenes.length; i++) {
      if (!isAutoLoopingRef.current) break;
      const s = updatedScenes[i];
      try {
        const { text } = await callWithRateLimitRetry(() => Flow2.generate.text(
          `C\u1EA2NH G\u1ED0C: ${s.rawText}

Y\xCAU C\u1EA6U: ${loopRewritePrompt}`,
          { systemInstruction: "B\u1EA1n l\xE0 bi\xEAn k\u1ECBch s\xE1ng t\u1EA1o.", thinkingLevel: "low" }
        ));
        updatedScenes[i] = {
          ...s,
          rawText: text.trim(),
          isRewritten: true,
          storyboardBase64: void 0,
          storyboardMediaId: void 0,
          storyboardStatus: "idle",
          imageBase64: void 0,
          imageMediaId: void 0,
          imageStatus: "idle",
          shotImages: void 0,
          videoBase64: void 0,
          videoMediaId: void 0,
          status: "idle",
          lastFrameBase64: void 0,
          lastFrameMediaId: void 0,
          retryCount: 0,
          currentAttempt: 0,
          maxAttempts: 0,
          localPercent: 0,
          localStatusDetail: "S\u1EB5n s\xE0ng (Loop)"
        };
      } catch (err) {
        console.warn(`L\u1ED7i vi\u1EBFt l\u1EA1i c\u1EA3nh ${i + 1}:`, err);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    setScenes(updatedScenes);
    scenesRef.current = updatedScenes;
    setStatusMsg(`V\xF2ng l\u1EB7p: \u0110\xE3 vi\u1EBFt l\u1EA1i ${updatedScenes.length} k\u1ECBch b\u1EA3n.`);
  };
  const simulateSceneProgress = (onUpdate) => {
    let current = 0;
    const interval = setInterval(() => {
      const increment = current < 50 ? 5 : current < 85 ? 2 : current < 98 ? 0.5 : 0.1;
      current = Math.min(99, current + increment);
      onUpdate(parseFloat(current.toFixed(1)));
    }, 1500);
    return () => clearInterval(interval);
  };
  const generateStoryboard = async (sceneId) => {
    const scene = scenesRef.current.find((s) => s.id === sceneId);
    if (!scene) return;
    const update = (data) => {
      setScenes((prev) => {
        const next = prev.map((s) => s.id === sceneId ? { ...s, ...data } : s);
        scenesRef.current = next;
        return next;
      });
    };
    update({ storyboardStatus: "generating", localStatusDetail: "\u0110ang quay..." });
    try {
      const languagePrompt = selectedLanguageRef.current !== "M\u1EB7c \u0111\u1ECBnh" ? `. Ng\xF4n ng\u1EEF th\u1EC3 hi\u1EC7n: ${selectedLanguageRef.current}` : "";
      const refs = getReferencesForText(scene.rawText);
      const sbResult = await callWithRateLimitRetry(() => Flow2.generate.image({
        prompt: `${storyboardPromptRef.current}${languagePrompt}. ${scene.rawText}`,
        modelDisplayName: selectedImageModelRef.current,
        aspectRatio,
        referenceImageMediaIds: refs.imageIds.length > 0 ? refs.imageIds.slice(0, 10) : void 0
      }));
      if (isStoryboardCropEnabledRef.current && sbResult.base64) {
        update({
          storyboardBase64: sbResult.base64,
          storyboardMediaId: sbResult.mediaId,
          storyboardStatus: "cropping",
          localStatusDetail: "\u0110ang quay..."
        });
        const slicedShots = await cropStoryboardToShots(sceneId, sbResult.base64);
        update({
          storyboardBase64: sbResult.base64,
          storyboardMediaId: sbResult.mediaId,
          storyboardStatus: "done",
          shotImages: slicedShots,
          imageMediaId: slicedShots[0]?.mediaId,
          imageBase64: slicedShots[0]?.base64,
          imageStatus: "done",
          localStatusDetail: "\u0110ang quay"
        });
      } else {
        update({
          storyboardBase64: sbResult.base64,
          storyboardMediaId: sbResult.mediaId,
          storyboardStatus: "done",
          localStatusDetail: "\u0110ang quay"
        });
      }
    } catch (err) {
      update({ storyboardStatus: "error", localStatusDetail: "L\u1ED7i." });
      setStatusMsg("L\u1ED7i t\u1EA1o: " + getErrorMessage(err));
    }
  };
  const uploadStoryboard = (sceneId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const base64 = await fileToBase64(file);
        const uploaded = await Flow2.upload({ base64, mimeType: file.type, name: `Manual_Storyboard` });
        if (isStoryboardCropEnabledRef.current) {
          setScenes((prev) => {
            const next = prev.map((s) => s.id === sceneId ? {
              ...s,
              storyboardBase64: base64,
              storyboardMediaId: uploaded.mediaId,
              storyboardStatus: "cropping",
              localStatusDetail: "\u0110ang quay..."
            } : s);
            scenesRef.current = next;
            return next;
          });
          const slicedShots = await cropStoryboardToShots(sceneId, base64);
          setScenes((prev) => {
            const next = prev.map((s) => s.id === sceneId ? {
              ...s,
              storyboardBase64: base64,
              storyboardMediaId: uploaded.mediaId,
              storyboardStatus: "done",
              shotImages: slicedShots,
              imageMediaId: slicedShots[0]?.mediaId,
              imageBase64: slicedShots[0]?.base64,
              imageStatus: "done",
              localStatusDetail: "\u0110ang quay"
            } : s);
            scenesRef.current = next;
            return next;
          });
        } else {
          setScenes((prev) => {
            const next = prev.map((s) => s.id === sceneId ? {
              ...s,
              storyboardBase64: base64,
              storyboardMediaId: uploaded.mediaId,
              storyboardStatus: "done"
            } : s);
            scenesRef.current = next;
            return next;
          });
        }
      } catch (err) {
        setStatusMsg("L\u1ED7i upload: " + getErrorMessage(err));
      }
    };
    input.click();
  };
  const deleteShot = (sceneId, shotId) => {
    setScenes((prev) => prev.map((s) => s.id === sceneId ? {
      ...s,
      shotImages: s.shotImages?.filter((img) => img.id !== shotId)
    } : s));
  };
  const uploadShot = (sceneId, shotIndex) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const base64 = await fileToBase64(file);
        const uploaded = await Flow2.upload({ base64, mimeType: file.type, name: `Manual_Shot_${shotIndex + 1}` });
        setScenes((prev) => prev.map((s) => s.id === sceneId ? {
          ...s,
          shotImages: s.shotImages?.map((img, idx) => idx === shotIndex ? { ...img, base64, mediaId: uploaded.mediaId, status: "done" } : img)
        } : s));
      } catch (err) {
        setStatusMsg("L\u1ED7i upload shot: " + getErrorMessage(err));
      }
    };
    input.click();
  };
  const generateSingleShot = async (sceneId, index) => {
    const scene = scenesRef.current.find((s) => s.id === sceneId);
    if (!scene) return;
    const shots = scene.shotImages || [];
    const isNew = index === void 0;
    const targetIdx = isNew ? shots.length : index;
    const languagePrompt = selectedLanguageRef.current !== "M\u1EB7c \u0111\u1ECBnh" ? `. Ng\xF4n ng\u1EEF th\u1EC3 hi\u1EC7n: ${selectedLanguageRef.current}` : "";
    const shotPrompt = (shotPromptsRef.current[targetIdx] || imageProductionRuleRef.current) + languagePrompt;
    setScenes((prev) => prev.map((s) => s.id === sceneId ? {
      ...s,
      shotImages: isNew ? [...s.shotImages || [], { id: Math.random().toString(36).substr(2, 9), base64: "", mediaId: "", status: "generating" }] : s.shotImages?.map((img, idx) => idx === targetIdx ? { ...img, status: "generating" } : img)
    } : s));
    try {
      const refs = getReferencesForText(scene.rawText);
      let imageRefs = [...refs.imageIds];
      if (isStoryboardEnabledRef.current && scene.storyboardMediaId && !isStoryboardCropEnabledRef.current) {
        imageRefs = [scene.storyboardMediaId, ...imageRefs];
      }
      if (targetIdx === 0) {
        if (scene.chunkIndex > 0) {
          const prevScene = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
          let linkMediaId = null;
          if (connectShotRef.current && prevScene?.shotImages && prevScene.shotImages.length > 0) {
            linkMediaId = prevScene.shotImages[prevScene.shotImages.length - 1].mediaId;
          } else if (connectSceneRef.current && prevScene?.lastFrameMediaId) {
            linkMediaId = prevScene.lastFrameMediaId;
          }
          if (linkMediaId) {
            const insertPos = isStoryboardEnabledRef.current && scene.storyboardMediaId && !isStoryboardCropEnabledRef.current ? 1 : 0;
            imageRefs.splice(insertPos, 0, linkMediaId);
          }
        }
      } else if (targetIdx > 0 && shots[targetIdx - 1]?.mediaId) {
        const insertPos = isStoryboardEnabledRef.current && scene.storyboardMediaId && !isStoryboardCropEnabledRef.current ? 1 : 0;
        imageRefs.splice(insertPos, 0, shots[targetIdx - 1].mediaId);
      }
      const imgResult = await callWithRateLimitRetry(() => Flow2.generate.image({
        prompt: `${shotPrompt}. ${scene.rawText}`,
        modelDisplayName: selectedImageModelRef.current,
        aspectRatio,
        referenceImageMediaIds: imageRefs.length > 0 ? imageRefs.slice(0, 10) : void 0
      }));
      setScenes((prev) => prev.map((s) => s.id === sceneId ? {
        ...s,
        shotImages: s.shotImages?.map((img, idx) => idx === targetIdx ? { id: img.id, base64: imgResult.base64, mediaId: imgResult.mediaId, status: "done" } : img)
      } : s));
    } catch (err) {
      setStatusMsg("L\u1ED7i t\u1EA1o shot: " + getErrorMessage(err));
      setScenes((prev) => prev.map((s) => s.id === sceneId ? {
        ...s,
        shotImages: s.shotImages?.map((img, idx) => idx === targetIdx ? { ...img, status: "error" } : img)
      } : s));
    }
  };
  const cropStoryboardToShots = async (sceneId, base64) => {
    const rows = storyboardRowsRef.current || 2;
    const cols = storyboardColsRef.current || 2;
    const slices = [];
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = `data:image/png;base64,${base64}`;
    });
    const sliceW = Math.floor(img.width / cols);
    const sliceH = Math.floor(img.height / rows);
    const inputName = `sb_in_${sceneId}.png`;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    await ffmpegService.writeFile(inputName, bytes);
    try {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * sliceW;
          const y = r * sliceH;
          const outName = `sl_${sceneId}_${r}_${c}.png`;
          await ffmpegService.exec([
            "-i",
            inputName,
            "-vf",
            `crop=${sliceW}:${sliceH}:${x}:${y}`,
            "-y",
            outName
          ]);
          const sliceData = await ffmpegService.readFile(outName);
          const sliceBase64 = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result.split(",")[1]);
            reader.readAsDataURL(new Blob([sliceData], { type: "image/png" }));
          });
          const uploaded = await Flow2.upload({
            base64: sliceBase64,
            mimeType: "image/png",
            name: `Storyboard_Slice_${r}_${c}`
          });
          slices.push({
            id: Math.random().toString(36).substr(2, 9),
            base64: sliceBase64,
            mediaId: uploaded.mediaId,
            status: "done"
          });
          await ffmpegService.deleteFile(outName);
        }
      }
    } finally {
      await ffmpegService.deleteFile(inputName);
    }
    return slices;
  };
  const renderScene = async (sceneId, isHealRetry = false, overrideText) => {
    const scene = scenesRef.current.find((s) => s.id === sceneId);
    if (!scene) return;
    const wasManualStarted = !isBatchRenderingRef.current && !isRunningAllRef.current && !isHealRetry;
    const currentHealIteration = isHealRetry ? (scene.retryCount || 0) + 1 : 0;
    const activeText = overrideText || scene.rawText;
    const update = (data) => {
      setScenes((prev) => {
        const next = prev.map((s) => s.id === sceneId ? { ...s, ...data } : s);
        scenesRef.current = next;
        return next;
      });
    };
    setRenderProgress((prev) => ({ ...prev, activeSceneIndex: scene.chunkIndex, phase: isHealRetry ? "healing" : "processing" }));
    update({
      status: isHealRetry ? "healing" : "generating",
      error: void 0,
      retryCount: currentHealIteration,
      localPercent: 0,
      currentAttempt: 0,
      maxAttempts: maxRetriesRef.current + 1,
      localStatusDetail: isHealRetry ? `AI T\u1EF1 s\u1EEDa (${currentHealIteration}/${maxAutoRetriesRef.current})...` : `\u0110ang kh\u1EDFi t\u1EA1o...`
    });
    try {
      let refs = getReferencesForText(activeText);
      let refIds = refs.imageIds;
      let audioRefs = refs.audioIds;
      let currentImageMediaId = scene.imageMediaId;
      let currentShotImages = scene.shotImages || [];
      const languagePrompt = selectedLanguageRef.current !== "M\u1EB7c \u0111\u1ECBnh" ? `. Ng\xF4n ng\u1EEF th\u1EC3 hi\u1EC7n: ${selectedLanguageRef.current}` : "";
      const productionRuleWithLang = `${globalProductionRule}${languagePrompt}`;
      const imageRuleWithLang = `${imageProductionRuleRef.current}${languagePrompt}`;
      let storyboardIdForCurrentScene = scene.storyboardMediaId;
      let currentStoryboardBase64 = scene.storyboardBase64;
      if (isStoryboardEnabledRef.current && !storyboardIdForCurrentScene) {
        update({ storyboardStatus: "generating", localStatusDetail: "\u0110ang quay..." });
        const sbResult = await callWithRateLimitRetry(() => Flow2.generate.image({
          prompt: `${storyboardPromptRef.current}${languagePrompt}. ${activeText}`,
          modelDisplayName: selectedImageModelRef.current,
          aspectRatio,
          referenceImageMediaIds: refIds.length > 0 ? refIds.slice(0, 10) : void 0
        }));
        storyboardIdForCurrentScene = sbResult.mediaId;
        currentStoryboardBase64 = sbResult.base64;
        update({
          storyboardMediaId: sbResult.mediaId,
          storyboardBase64: sbResult.base64,
          storyboardStatus: "done",
          localStatusDetail: "\u0110ang quay"
        });
      }
      if (isStoryboardCropEnabledRef.current && currentStoryboardBase64 && (!currentShotImages || currentShotImages.length === 0)) {
        update({ storyboardStatus: "cropping", localStatusDetail: "\u0110ang quay..." });
        const slicedShots = await cropStoryboardToShots(sceneId, currentStoryboardBase64);
        currentShotImages = slicedShots;
        currentImageMediaId = slicedShots[0]?.mediaId;
        update({
          shotImages: slicedShots,
          imageMediaId: currentImageMediaId,
          imageBase64: slicedShots[0]?.base64,
          imageStatus: "done",
          storyboardStatus: "done",
          localStatusDetail: "\u0110ang quay"
        });
      }
      const isI2VModeActive = videoGenModeRef.current === "i2v";
      const isShotNeededForSources = isI2VModeActive && (startFrameSourceRef.current === "shot" || startFrameSourceRef.current === "keyframe" || endFrameSourceRef.current === "shot" || endFrameSourceRef.current === "keyframe" || startFrameSourceRef.current === "none" && (renderFromShotOnlyRef.current || !useLastFrameAsReferenceRef.current || scene.chunkIndex === 0));
      const isCutSceneCheck = scene.disableContinuity || scene.rawText.includes("[CẮT CẢNH]") || scene.rawText.includes("[CUT]");
      const shouldSkipImageForContinuity = useLastFrameAsReferenceRef.current && scene.chunkIndex > 0 && !isCutSceneCheck;
      if (shouldSkipImageForContinuity) {
        const prevScene = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
        if (prevScene?.lastFrameMediaId) {
          currentImageMediaId = prevScene.lastFrameMediaId;
          update({
            imageMediaId: prevScene.lastFrameMediaId,
            imageBase64: prevScene.lastFrameBase64,
            imageStatus: "done",
            localStatusDetail: "Đã nối frame từ cảnh trước"
          });
        }
      }
      const hasPreparedShots = currentShotImages && currentShotImages.length > 0 && currentShotImages.every((s) => s.status === "done");
      if (!isStoryboardCropEnabledRef.current && !hasPreparedShots && (!currentImageMediaId || renderFromShotOnlyRef.current && currentShotImages.length < shotCountRef.current) && (!skipImageGen || isShotNeededForSources)) {
        if (!isBatchRenderingRef.current && !isRunningAllRef.current && !isHealRetry && !wasManualStarted) throw new Error("CANCELED");
        update({ imageStatus: "generating", localStatusDetail: "B\u1EAFt \u0111\u1EA7u t\u1EA1o Shot..." });
        let initialRefs = [...refIds];
        if (isStoryboardEnabledRef.current && storyboardIdForCurrentScene) {
          initialRefs = [storyboardIdForCurrentScene, ...initialRefs];
        }
        const generatedShots = [];
        const countToGen = renderFromShotOnlyRef.current ? shotCountRef.current : 1;
        for (let i = 0; i < countToGen; i++) {
          update({ localStatusDetail: `T\u1EA1o Shot ${i + 1}/${countToGen}...` });
          const currentShotPrompt = renderFromShotOnlyRef.current && shotPromptsRef.current[i] ? shotPromptsRef.current[i] : imageRuleWithLang;
          let currentStepRefs = [...initialRefs];
          if (i === 0) {
            if (scene.chunkIndex > 0) {
              const prevScene = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
              let linkMediaId = null;
              if (connectShotRef.current && prevScene?.shotImages && prevScene.shotImages.length > 0) {
                linkMediaId = prevScene.shotImages[prevScene.shotImages.length - 1].mediaId;
              } else if (connectSceneRef.current && prevScene?.lastFrameMediaId) {
                linkMediaId = prevScene.lastFrameMediaId;
              } else if (useLastFrameAsReferenceRef.current && prevScene?.lastFrameMediaId) {
                linkMediaId = prevScene.lastFrameMediaId;
              }
              if (linkMediaId) {
                const insertPos = isStoryboardEnabledRef.current && storyboardIdForCurrentScene ? 1 : 0;
                currentStepRefs.splice(insertPos, 0, linkMediaId);
              }
            }
          } else {
            const prevShotMediaId = generatedShots[i - 1].mediaId;
            if (prevShotMediaId) {
              const insertPos = isStoryboardEnabledRef.current && storyboardIdForCurrentScene ? 1 : 0;
              currentStepRefs.splice(insertPos, 0, prevShotMediaId);
            }
          }
          const imgResult = await callWithRateLimitRetry(
            () => Flow2.generate.image({
              prompt: `${currentShotPrompt}${languagePrompt}. ${activeText}`,
              modelDisplayName: selectedImageModelRef.current,
              aspectRatio,
              referenceImageMediaIds: currentStepRefs.length > 0 ? currentStepRefs.slice(0, 10) : void 0
            }),
            (sec) => update({
              status: sec ? "retrying" : "generating",
              localRetryCountdown: sec,
              localStatusDetail: sec ? `H\u1EC7 th\u1ED1ng b\u1EADn. Th\u1EED l\u1EA1i sau ${sec}s...` : `\u0110ang k\u1EBFt n\u1ED1i l\u1EA1i...`
            })
          );
          generatedShots.push({
            id: Math.random().toString(36).substr(2, 9),
            base64: imgResult.base64,
            mediaId: imgResult.mediaId,
            status: "done"
          });
        }
        if (!isBatchRenderingRef.current && !isRunningAllRef.current && !isHealRetry && !wasManualStarted) throw new Error("CANCELED");
        update({
          imageMediaId: generatedShots[0].mediaId,
          imageBase64: generatedShots[0].base64,
          imageStatus: "done",
          shotImages: generatedShots,
          localPercent: 15,
          localStatusDetail: "\u0110\xE3 t\u1EA1o xong c\xE1c Shot."
        });
        currentImageMediaId = generatedShots[0].mediaId;
        currentShotImages = generatedShots;
      } else if (hasPreparedShots) {
        currentImageMediaId = currentShotImages[0].mediaId;
      }
      const genOptions = {
        prompt: `${productionRuleWithLang}. ${activeText}`,
        durationSeconds: parseInt(globalDuration),
        modelDisplayName: selectedModel,
        aspectRatio
      };
      if (selectedModel === "Omni 1.1 Flash") {
        genOptions.resolution = resolutionRef.current;
        if (audioRefs.length > 0) genOptions.audioReferenceMediaIds = audioRefs;
      }
      const updateRefsAndOptions = () => {
        refs = getReferencesForText(activeText);
        refIds = refs.imageIds;
        audioRefs = refs.audioIds;
        if (videoGenModeRef.current === "i2v") {
          let startId = void 0;
          let endId = void 0;
          if (startFrameSourceRef.current === "keyframe" || startFrameSourceRef.current === "shot") {
            startId = currentImageMediaId;
          } else if (startFrameSourceRef.current === "continuity" && scene.chunkIndex > 0) {
            const prev = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
            startId = prev?.lastFrameMediaId || prev?.imageMediaId;
          }
          if (!startId) {
            if (renderFromShotOnlyRef.current || isStoryboardCropEnabledRef.current) {
              startId = currentImageMediaId;
            } else {
              if (useLastFrameAsReferenceRef.current && scene.chunkIndex > 0) {
                const prevScene = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
                startId = prevScene?.lastFrameMediaId || currentImageMediaId;
              } else {
                startId = currentImageMediaId;
              }
            }
          }
          if (endFrameSourceRef.current === "keyframe" || endFrameSourceRef.current === "shot") {
            endId = (renderFromShotOnlyRef.current || isStoryboardCropEnabledRef.current) && currentShotImages.length > 1 ? currentShotImages[currentShotImages.length - 1].mediaId : currentImageMediaId;
          } else if (endFrameSourceRef.current === "continuity" && scene.chunkIndex > 0) {
            const prev = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
            endId = prev?.lastFrameMediaId || prev?.imageMediaId;
          }
          if (startId) genOptions.firstFrameImageMediaId = startId;
          if (endId && endId !== startId) genOptions.lastFrameImageMediaId = endId;
          let finalRefs2 = [currentImageMediaId, ...refIds];
          if (isStoryboardEnabledRef.current && storyboardIdForCurrentScene && !isStoryboardCropEnabledRef.current) {
            finalRefs2 = [storyboardIdForCurrentScene, ...finalRefs2];
          }
          if (renderFromShotOnlyRef.current || isStoryboardCropEnabledRef.current) {
            const intermediateShots = currentShotImages.filter((s) => s.mediaId !== genOptions.firstFrameImageMediaId && s.mediaId !== genOptions.lastFrameImageMediaId).map((s) => s.mediaId);
            let shotRefs = intermediateShots.length > 0 ? intermediateShots : currentImageMediaId ? [currentImageMediaId] : [];
            if (isStoryboardEnabledRef.current && storyboardIdForCurrentScene && !isStoryboardCropEnabledRef.current) {
              shotRefs = [storyboardIdForCurrentScene, ...shotRefs];
            }
            genOptions.referenceImageMediaIds = shotRefs.length > 0 ? shotRefs.slice(0, 10) : void 0;
          } else {
            const videoRefs = finalRefs2.filter((id) => !!id && id !== genOptions.firstFrameImageMediaId && id !== genOptions.lastFrameImageMediaId).slice(0, selectedModel.includes("Veo") ? 3 : 7);
            genOptions.referenceImageMediaIds = videoRefs.length > 0 ? videoRefs : void 0;
          }
          return;
        }
        let allRefs = [...refIds];
        if (currentImageMediaId) allRefs = [currentImageMediaId, ...allRefs];
        if (isStoryboardEnabledRef.current && storyboardIdForCurrentScene && !isStoryboardCropEnabledRef.current) {
          allRefs = [storyboardIdForCurrentScene, ...allRefs];
        }
        if (renderFromShotOnlyRef.current || isStoryboardCropEnabledRef.current) {
          let shotRefs = currentShotImages.length > 0 ? currentShotImages.map((s) => s.mediaId) : currentImageMediaId ? [currentImageMediaId] : [];
          if (isStoryboardEnabledRef.current && storyboardIdForCurrentScene && !isStoryboardCropEnabledRef.current) {
            shotRefs = [storyboardIdForCurrentScene, ...shotRefs];
          }
          genOptions.referenceImageMediaIds = shotRefs.length > 0 ? shotRefs.slice(0, selectedModel.includes("Veo") ? 3 : 7) : void 0;
          return;
        }
        const isCutScene = scene.disableContinuity || scene.rawText.includes("[CẮT CẢNH]") || scene.rawText.includes("[CUT]");
        if (useLastFrameAsReferenceRef.current && scene.chunkIndex > 0 && !isCutScene) {
          const prevScene = scenesRef.current.find((s) => s.chunkIndex === scene.chunkIndex - 1);
          const continuityRef = prevScene?.lastFrameMediaId || prevScene?.imageMediaId;
          if (continuityRef) {
            genOptions.firstFrameImageMediaId = continuityRef;
            console.log(`[Continuity] Scene ${scene.chunkIndex + 1} locked firstFrameImageMediaId:`, continuityRef);
          }
        }
        const finalRefs = Array.from(new Set(allRefs))
          .filter((id) => !!id && id !== genOptions.firstFrameImageMediaId && id !== genOptions.lastFrameImageMediaId)
          .slice(0, selectedModel.includes("Veo") ? 3 : 7);
        genOptions.referenceImageMediaIds = finalRefs.length > 0 ? finalRefs : void 0;
      };
      updateRefsAndOptions();
      let attempt = 0;
      let lastErrorText = "";
      let successVideo = false;
      let videoResult = null;
      const currentMaxRetries = maxRetriesRef.current;
      const currentTimeoutMs = renderTimeoutRef.current * 1e3;
      while (attempt <= currentMaxRetries) {
        if (!wasManualStarted && !isBatchRenderingRef.current && !isRunningAllRef.current && !isHealRetry) {
          throw new Error("CANCELED");
        }
        attempt++;
        update({
          currentAttempt: attempt,
          maxAttempts: currentMaxRetries + 1,
          localStatusDetail: `\u0110ang g\u1EEDi l\u1EC7nh [${attempt}/${currentMaxRetries + 1}]...`,
          localPercent: Math.min(95, 15 + attempt / (currentMaxRetries + 1) * 80),
          localRetryCountdown: null
        });
        await new Promise((r) => setTimeout(r, 100));
        const stopSim = simulateSceneProgress((p) => {
          update({ localPercent: Math.min(98, 15 + attempt / (currentMaxRetries + 1) * 80 + p * 0.05) });
        });
        try {
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("TIMEOUT_ERROR")), currentTimeoutMs)
          );
          videoResult = await Promise.race([
            Flow2.generate.video(genOptions),
            timeoutPromise
          ]);
          successVideo = true;
          stopSim();
          break;
        } catch (vidErr) {
          stopSim();
          lastErrorText = getErrorMessage(vidErr);
          if (lastErrorText === "TIMEOUT_ERROR") lastErrorText = "H\u1EBFt th\u1EDDi gian ch\u1EDD (Timeout)";
          if (isSafetyError(lastErrorText) && isCelebrityCheckEnabledRef.current) {
            const currentActors = actorsRef.current.filter((a) => refIds.includes(a.mediaId) && a.type === "actor");
            if (currentActors.length > 0) {
              update({ localStatusDetail: "\u26A0\uFE0F Ch\xEDnh s\xE1ch an to\xE0n. \u0110ang s\u1EEDa DNA nh\xE2n v\u1EADt..." });
              for (const a of currentActors) {
                const fixed = await fixActorDNA(a);
                if (currentImageMediaId === a.mediaId) currentImageMediaId = fixed.mediaId;
              }
              updateRefsAndOptions();
              attempt--;
              continue;
            }
          }
          if (isSafetyError(lastErrorText) && !isAutoHealEnabledRef.current) {
            break;
          }
          if (attempt <= currentMaxRetries) {
            let waitTime = retryDelayRef.current;
            while (waitTime > 0) {
              update({
                localStatusDetail: `\u0110\u1EE3i th\u1EED l\u1EA1i [${attempt}/${currentMaxRetries + 1}] (${waitTime}s)...`,
                localRetryCountdown: waitTime
              });
              await new Promise((r) => setTimeout(r, 1e3));
              waitTime--;
              if (!wasManualStarted && !isBatchRenderingRef.current && !isRunningAllRef.current && !isHealRetry) throw new Error("CANCELED");
            }
            update({ localRetryCountdown: null });
          }
        }
      }
      if (successVideo && videoResult) {
        update({
          status: "done",
          videoBase64: videoResult.base64,
          videoMediaId: videoResult.mediaId,
          localPercent: 100,
          localStatusDetail: "Ho\xE0n t\u1EA5t.",
          localRetryCountdown: null
        });
        try {
          await Flow2.download({ base64: videoResult.base64, mimeType: videoResult.mimeType, filename: `Scene_${scene.chunkIndex + 1}_Loop${currentLoopCountRef.current + 1}.mp4` });
        } catch (dErr) {
        }
        if (useLastFrameAsReferenceRef.current) {
          try {
            update({ localStatusDetail: "Đang trích xuất frame cuối làm start frame cảnh sau..." });
            const { base64, mediaId } = await extractLastFrame(videoResult.base64);
            update({ lastFrameBase64: base64, lastFrameMediaId: mediaId, localStatusDetail: "Hoàn tất (Đã khóa frame nối)." });
            console.log(`[Continuity] Saved lastFrameMediaId for Scene ${scene.chunkIndex + 1}:`, mediaId);
          } catch (extractErr) {
            console.error("[Continuity] Failed to extract last frame:", extractErr);
          }
        }
      } else {
        if (isAutoHealEnabledRef.current && currentHealIteration < maxAutoRetriesRef.current) {
          update({ localStatusDetail: "Th\u1EED l\u1EA1i th\u1EA5t b\u1EA1i. \u0110ang t\u1EF1 s\u1EEDa k\u1ECBch b\u1EA3n...", status: "healing" });
          const healed = await healScript(activeText, lastErrorText);
          update({
            rawText: healed,
            isRewritten: true,
            imageMediaId: void 0,
            imageStatus: "idle",
            shotImages: void 0,
            status: "healing",
            localPercent: 0,
            retryCount: currentHealIteration + 1,
            currentAttempt: 0
          });
          await new Promise((r) => setTimeout(r, 2e3));
          return await renderScene(sceneId, true, healed);
        } else {
          throw new Error(lastErrorText || "V\u01B0\u1EE3t qu\xE1 s\u1ED1 l\u1EA7n th\u1EED l\u1EA1i t\u1ED1i \u0111a.");
        }
      }
    } catch (err) {
      const rawError = getErrorMessage(err);
      if (rawError === "CANCELED") return;
      update({
        status: "error",
        error: rawError,
        localStatusDetail: `L\u1ED6I: ${rawError.slice(0, 40)}`,
        localRetryCountdown: null,
        currentAttempt: 0
      });
      setStatusMsg(`[C\u1EA3nh ${scene.chunkIndex + 1}] L\u1ED7i: ${rawError}`);
      throw err;
    }
  };
  const updateSceneText = (id, text) => {
    setScenes((prev) => prev.map((s) => s.id === id ? { ...s, rawText: text } : s));
  };
  const renderBatch = async (all = false) => {
    const queue = all ? scenesRef.current.filter((s) => s.status !== "done" && s.status !== "idle") : scenesRef.current.filter((s) => s.status === "idle");
    const effectiveQueue = all ? scenesRef.current.filter((s) => s.status !== "done") : queue;
    if (effectiveQueue.length === 0) {
      const currentScenes = scenesRef.current;
      const allDone = currentScenes.length > 0 && currentScenes.every((s) => s.status === "done");
      if (allDone && (autoMergeRef.current || isAutoLoopEnabledRef.current)) {
        setStatusMsg("\u0110ang xu\u1EA5t master...");
        await mergeAll();
      } else {
        setStatusMsg("Kh\xF4ng c\xF2n c\u1EA3nh n\xE0o c\u1EA7n Quay.");
      }
      return;
    }
    setIsBatchRendering(true);
    isBatchRenderingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setRenderProgress((prev) => ({ ...prev, percent: 0, totalScenes: effectiveQueue.length, completedScenes: 0 }));
    const active = /* @__PURE__ */ new Set();
    const effectiveMaxConcurrent = maxConcurrentRendersRef.current;
    let interrupted = false;
    let completedCount = 0;
    for (const s of effectiveQueue) {
      if (isPausedRef.current) {
        setStatusMsg("T\u1EA1m d\u1EEBng quy tr\xECnh...");
        while (isPausedRef.current) {
          await new Promise((r) => setTimeout(r, 500));
          if (!isBatchRenderingRef.current) break;
        }
      }
      if (!isBatchRenderingRef.current) {
        interrupted = true;
        break;
      }
      const onSceneFinished = () => {
        completedCount++;
        setRenderProgress((prev) => ({
          ...prev,
          completedScenes: completedCount,
          percent: Math.round(completedCount / effectiveQueue.length * 100)
        }));
      };
      if (effectiveMaxConcurrent === 1) {
        try {
          await renderScene(s.id);
        } catch (e) {
          console.warn(`C\u1EA3nh ${s.chunkIndex + 1} l\u1ED7i, h\u1EC7 th\u1ED1ng t\u1EF1 \u0111\u1ED9ng B\u1ECE QUA c\u1EA3nh n\xE0y.`);
        }
        onSceneFinished();
      } else {
        if (active.size >= effectiveMaxConcurrent) await Promise.race(active);
        const p = renderScene(s.id).catch((e) => console.warn(`C\u1EA3nh ${s.chunkIndex + 1} l\u1ED7i song song, b\u1ECF qua.`)).finally(() => {
          active.delete(p);
          onSceneFinished();
        });
        active.add(p);
      }
      await new Promise((r) => setTimeout(r, renderDelayRef.current * 1e3));
    }
    await Promise.all(active);
    setIsBatchRendering(false);
    isBatchRenderingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    const finalScenes = scenesRef.current;
    const succeededCount = finalScenes.filter((s) => s.status === "done").length;
    const totalCount = finalScenes.length;
    if (interrupted) {
      setStatusMsg("Ti\u1EBFn tr\xECnh \u0111\xE3 b\u1ECB d\u1EEBng l\u1EA1i.");
      setIsAutoLooping(false);
    } else if (succeededCount === totalCount && totalCount > 0) {
      setStatusMsg("T\u1EA5t c\u1EA3 c\xE1c c\u1EA3nh \u0111\xE3 \u0111\u01B0\u1EE3c Quay ho\xE0n t\u1EA5t.");
      if (autoMergeRef.current || isAutoLoopEnabledRef.current) {
        await mergeAll();
      }
    } else {
      setStatusMsg(`Ho\xE0n t\u1EA5t \u0111\u1EE3t: ${succeededCount}/${totalCount} c\u1EA3nh th\xE0nh c\xF4ng.`);
      if (isAutoLooping.current) {
        setIsAutoLooping(false);
      }
    }
  };
  useEffect2(() => {
    (window as any).__CLEAN_APP__ = {
      getScenes: () => scenesRef.current,
      setScenes,
      getActors: () => actorsRef.current,
      setActors,
      renderScene,
      renderBatch,
      Flow: Flow2
    };
  }, []);
  const handleRunAll = async () => {
    setIsRunningAll(true);
    isRunningAllRef.current = true;
    setCurrentLoopAllCount(0);
    const limit = isLoopAllEnabledRef.current ? loopAllLimitRef.current : 1;
    let iteration = 0;
    try {
      while (iteration < limit) {
        if (!isRunningAllRef.current) break;
        setCurrentLoopAllCount(iteration);
        setStatusMsg(`[LOOP ALL ${iteration + 1}/${limit}] Kh\u1EDFi \u0111\u1ED9ng...`);
        if (autoStory && storyText.trim()) {
          await analyzeStory();
          await new Promise((r) => setTimeout(r, 1200));
        }
        if (!isRunningAllRef.current) break;
        if (autoDNA && fullScriptRef.current) {
          await scanAndCreateAssets();
          await new Promise((r) => setTimeout(r, 1800));
        }
        if (!isRunningAllRef.current) break;
        if (autoRender && fullScriptRef.current) {
          importScript();
          await new Promise((r) => setTimeout(r, 1500));
          if (!isRunningAllRef.current) break;
          await renderBatch(true);
        }
        iteration++;
        if (isLoopAllEnabledRef.current && iteration < limit && isRunningAllRef.current) {
          setStatusMsg(`[LOOP ALL ${iteration}/${limit}] Xong. Ngh\u1EC9 5s tr\u01B0\u1EDBc v\xF2ng m\u1EDBi...`);
          await new Promise((r) => setTimeout(r, 5e3));
        }
      }
    } catch (err) {
      setStatusMsg("L\u1ED7i quy tr\xECnh T\u1EF1 \u0111\u1ED9ng: " + getErrorMessage(err));
    } finally {
      setIsRunningAll(false);
      isRunningAllRef.current = false;
      setCurrentLoopAllCount(0);
      setStatusMsg("Quy tr\xECnh T\u1EF1 \u0111\u1ED9ng k\u1EBFt th\xFAc.");
    }
  };
  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    isPausedRef.current = newState;
    setStatusMsg(newState ? "\u0110\xE3 t\u1EA1m d\u1EEBng h\u1EC7 th\u1ED1ng." : "\u0110ang ti\u1EBFp t\u1EE5c quy tr\xECnh...");
  };
  const stopBatch = () => {
    setIsBatchRendering(false);
    isBatchRenderingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsAutoLooping(false);
    isAutoLoopingRef.current = false;
    setIsRunningAll(false);
    isRunningAllRef.current = false;
    setIsAnalyzingStory(false);
    isAnalyzingStoryRef.current = false;
    setIsScanning(false);
    isScanningRef.current = false;
    setCurrentLoopCount(0);
    currentLoopCountRef.current = 0;
    setCurrentLoopAllCount(0);
    setStoryAnalysisPercent(0);
    setStatusMsg("H\u1EC6 TH\u1ED0NG \u0110\xC3 D\u1EEANG KH\u1EA8N C\u1EA4P.");
    setScenes((prev) => prev.map((s) => s.status === "generating" || s.status === "healing" || s.status === "retrying" ? { ...s, status: "idle", localStatusDetail: "\u0110\xE3 d\u1EEBng.", currentAttempt: 0, localRetryCountdown: null } : s));
  };
  const resetAllTasks = () => {
    setIsBatchRendering(false);
    isBatchRenderingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsAutoLooping(false);
    isAutoLoopingRef.current = false;
    setIsRunningAll(false);
    isRunningAllRef.current = false;
    setIsAnalyzingStory(false);
    isAnalyzingStoryRef.current = false;
    setIsScanning(false);
    isScanningRef.current = false;
    setCurrentLoopCount(0);
    currentLoopCountRef.current = 0;
    setCurrentLoopAllCount(0);
    setStoryAnalysisPercent(0);
    setScenes((prev) => prev.map((s) => {
      if (s.status === "done") return s;
      return {
        ...s,
        status: "idle",
        storyboardStatus: s.storyboardStatus === "done" ? "done" : "idle",
        imageStatus: s.imageStatus === "done" ? "done" : "idle",
        error: void 0,
        localStatusDetail: "S\u1EB5n s\xE0ng",
        currentAttempt: 0,
        retryCount: 0,
        localRetryCountdown: null,
        localPercent: 0,
        maxAttempts: 0,
        isRewritten: s.isRewritten
      };
    }));
    setRenderProgress({
      activeSceneIndex: null,
      phase: "idle",
      percent: 0,
      totalScenes: 0,
      completedScenes: 0
    });
    setStatusMsg("\u0110\xE3 l\xE0m m\u1EDBi to\xE0n b\u1ED9 quy tr\xECnh v\xE0 l\u1EC7nh ch\u1EDD. C\xE1c c\u1EA3nh \u0111\xE3 xong \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.");
  };
  const mergeAll = async () => {
    if (isProcessing) return;
    const allVideos = scenesRef.current.filter((s) => s.status === "done" && s.videoBase64).sort((a, b) => a.chunkIndex - b.chunkIndex);
    if (allVideos.length === 0) {
      setStatusMsg("Ch\u01B0a c\xF3 video \u0111\u1EC3 gh\xE9p.");
      setIsAutoLooping(false);
      return;
    }
    setIsProcessing(true);
    setStatusMsg(`\u0110ang xu\u1EA5t master...`);
    const normalizedNames = [];
    try {
      let concatList = "";
      for (let i = 0; i < allVideos.length; i++) {
        const rawName = `raw_${i}.mp4`;
        const normName = `norm_${i}.mp4`;
        normalizedNames.push(normName);
        setStatusMsg(`\u0110ang xu\u1EA5t master (${i + 1}/${allVideos.length})...`);
        const bytes = Uint8Array.from(atob(allVideos[i].videoBase64), (c) => c.charCodeAt(0));
        await ffmpegService.writeFile(rawName, bytes);
        await ffmpegService.exec([
          "-i",
          rawName,
          "-r",
          "30",
          "-video_track_timescale",
          "30000",
          "-pix_fmt",
          "yuv420p",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "18",
          "-c:a",
          "aac",
          "-ar",
          "44100",
          "-ac",
          "2",
          "-fflags",
          "+genpts",
          "-avoid_negative_ts",
          "make_zero",
          "-y",
          normName
        ]);
        await ffmpegService.deleteFile(rawName);
        concatList += `file '${normName}'
`;
      }
      setStatusMsg(`\u0110ang xu\u1EA5t master...`);
      await ffmpegService.writeFile("inputs.txt", new TextEncoder().encode(concatList));
      await ffmpegService.exec(["-f", "concat", "-safe", "0", "-i", "inputs.txt", "-c", "copy", "-y", "final.mp4"]);
      const data = await ffmpegService.readFile("final.mp4");
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(new Blob([data], { type: "video/mp4" }));
      });
      await Flow2.download({
        base64,
        mimeType: "video/mp4",
        filename: `Movie_Master_Loop${currentLoopCountRef.current + 1}_${Date.now()}.mp4`
      });
      for (const n of normalizedNames) await ffmpegService.deleteFile(n);
      await ffmpegService.deleteFile("inputs.txt");
      await ffmpegService.deleteFile("final.mp4");
      setStatusMsg(`Master ${currentLoopCountRef.current + 1} Ho\xE0n t\u1EA5t!`);
      if (isAutoLoopEnabledRef.current && currentLoopCountRef.current + 1 < autoLoopLimitRef.current) {
        const nextLoop = currentLoopCountRef.current + 1;
        setCurrentLoopCount(nextLoop);
        setIsAutoLooping(true);
        setStatusMsg(`B\u1EAFt \u0111\u1EA7u V\xF2ng l\u1EB7p ${nextLoop + 1}...`);
        await rewriteScenesForLoop();
        if (isAutoLoopingRef.current) {
          setTimeout(() => renderBatch(true), 2e3);
        }
      } else {
        setIsAutoLooping(false);
        if (isAutoLoopEnabledRef.current) setStatusMsg("\u0110\xE3 \u0111\u1EA1t gi\u1EDBi h\u1EA1n v\xF2ng l\u1EB7p.");
      }
    } catch (err) {
      setStatusMsg("L\u1ED7i gh\xE9p phim: " + getErrorMessage(err));
      setIsAutoLooping(false);
      for (const n of normalizedNames) await ffmpegService.deleteFile(n);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleUnlockQuality = () => {
    if (accessInput === QUALITY_ACCESS_CODE) {
      setIsQualityUnlocked(true);
      setStatusMsg("\u0110\xE3 m\u1EDF kho\xE1 ch\u1EA5t l\u01B0\u1EE3ng.");
    } else {
      setStatusMsg("M\xE3 sai.");
      setAccessInput("");
    }
  };
  const handleUnlockSceneLimit = () => {
    if (sceneAccessInput === SCENE_LIMIT_ACCESS_CODE) {
      setIsSceneLimitUnlocked(true);
      setStatusMsg("\u0110\xE3 m\u1EDF kho\xE1 gi\u1EDBi h\u1EA1n.");
    } else {
      setStatusMsg("M\xE3 sai.");
      setSceneAccessInput("");
    }
  };
  const startAutoLoopProcess = async () => {
    if (scenes.length === 0) return;
    setCurrentLoopCount(0);
    currentLoopCountRef.current = 0;
    setIsAutoLooping(true);
    isAutoLoopingRef.current = true;
    await renderBatch(true);
  };
  return /* @__PURE__ */ jsxs2("div", { className: "flex h-screen w-screen bg-[#0e0e0e] text-white", children: [
    /* @__PURE__ */ jsx2(
      DNAEditModal,
      {
        isOpen: !!dnaEditTarget,
        asset: dnaEditTarget,
        onSave: (id, updates) => updateAssetDNA(id, updates),
        onCancel: () => setDnaEditTarget(null)
      }
    ),
    /* @__PURE__ */ jsx2(
      NewProjectModal,
      {
        isOpen: isNewProjectModalOpen,
        defaultName: `D\u1EF1 \xE1n ${subProjects.length + 1}`,
        onConfirm: finalizeCreateProject,
        onCancel: () => setIsNewProjectModalOpen(false)
      }
    ),
    /* @__PURE__ */ jsx2(
      ProjectManagerModal,
      {
        isOpen: isProjectManagerOpen,
        projects: subProjects,
        currentId: currentProjectId,
        onSelect: handleSelectSubProject,
        onDelete: handleDeleteSubProject,
        onClose: () => setIsProjectManagerOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: "w-[260px] border-r border-white/10 flex flex-col bg-[#0b0b0b] shrink-0", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex-1 overflow-y-auto p-2.5 flex flex-col gap-4 dark-scrollbar", children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "C\xE1c c\xF4ng c\u1EE5 qu\u1EA3n l\xFD file k\u1ECBch b\u1EA3n v\xE0 d\u1EF1 \xE1n MLT.", children: "Qu\u1EA3n l\xFD d\u1EF1 \xE1n & l\u01B0u tr\u1EEF" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl", children: [
            /* @__PURE__ */ jsxs2("div", { className: "px-2 py-1.5 bg-black/40 border border-white/5 rounded-lg mb-1", title: "T\xEAn c\u1EE7a d\u1EF1 \xE1n hi\u1EC7n \u0111ang \u0111\u01B0\u1EE3c l\xE0m vi\u1EC7c.", children: [
              /* @__PURE__ */ jsx2("p", { className: "text-[8px] text-white/30 uppercase tracking-widest leading-none mb-1", children: "D\u1EF1 \xE1n \u0111ang m\u1EDF" }),
              /* @__PURE__ */ jsx2("p", { className: "text-11px font-black text-blue-400 truncate", children: currentProjectName })
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-1", children: [
              /* @__PURE__ */ jsx2(PillButton, { variant: "outline", title: "T\u1EA1o m\u1ED9t kh\xF4ng gian l\xE0m vi\u1EC7c tr\u1ED1ng m\u1EDBi.", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add" }), onClick: handleCreateNewProject, children: "D\u1EF1 \xE1n m\u1EDBi" }),
              /* @__PURE__ */ jsx2(PillButton, { variant: "outline", title: "T\u1EA3i l\xEAn file Bundle (.json) \u0111\xE3 l\u01B0u tr\xEAn m\xE1y t\xEDnh.", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "folder_open" }), onClick: handleOpenProject, children: "M\u1EDF G\xF3i (.json)" })
            ] }),
            /* @__PURE__ */ jsx2(PillButton, { variant: "outline", title: "Qu\u1EA3n l\xFD v\xE0 chuy\u1EC3n \u0111\u1ED5i gi\u1EEFa c\xE1c d\u1EF1 \xE1n con trong g\xF3i Bundle.", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "folder_shared" }), onClick: () => setIsProjectManagerOpen(true), children: "Qu\u1EA3n l\xFD D\u1EF1 \xE1n con" }),
            /* @__PURE__ */ jsx2(
              PillButton,
              {
                variant: "solid",
                className: "!bg-blue-600 !text-white",
                icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: saveState === "saving" ? "sync" : "download" }),
                onClick: handleSaveProject,
                disabled: saveState === "saving",
                title: "L\u01B0u to\xE0n b\u1ED9 k\u1ECBch b\u1EA3n, DNA nh\xE2n v\u1EADt v\xE0 b\u1ED1i c\u1EA3nh th\xE0nh file .json v\u1EC1 m\xE1y t\xEDnh.",
                children: saveState === "saving" ? "\u0110ANG \u0110\xD3NG G\xD3I..." : saveState === "saved" ? "\u0110\xC3 L\u01AFU \u2713" : "L\u01AFU D\u1EF0 \xC1N (PC)"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "T\u1EF1 \u0111\u1ED9ng ph\xE2n t\xEDch truy\u1EC7n d\xE0i sang k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh chi ti\u1EBFt b\u1EB1ng AI.", children: "Ph\xE2n t\xEDch Truy\u1EC7n & \u1EA2nh (Multi-Story Analyst)" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl", children: [
            /* @__PURE__ */ jsx2(
              "textarea",
              {
                value: storyText,
                onChange: (e) => setStoryText(e.target.value),
                placeholder: "D\xE1n n\u1ED9i dung truy\u1EC7n d\xE0i t\u1EA1i \u0111\xE2y...",
                title: "D\xE1n n\u1ED9i dung v\u0103n b\u1EA3n truy\u1EC7n ho\u1EB7c \xFD t\u01B0\u1EDFng d\xE0i c\u1EA7n b\u1EBB nh\u1ECF k\u1ECBch b\u1EA3n.",
                className: "w-full h-24 bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] outline-none focus:border-blue-500/30 transition-all resize-none"
              }
            ),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1 bg-black/20 p-1.5 rounded-lg border border-white/5", title: "T\u1EA3i l\xEAn c\xE1c h\xECnh \u1EA3nh minh h\u1ECDa cho truy\u1EC7n \u0111\u1EC3 AI b\xE1m s\xE1t phong c\xE1ch.", children: [
              /* @__PURE__ */ jsx2(SectionLabel, { children: "H\xECnh \u1EA3nh tham kh\u1EA3o c\u1ED1t truy\u1EC7n" }),
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-1 mb-1", children: [
                storyImages.map((img) => /* @__PURE__ */ jsxs2("div", { className: "w-8 h-8 rounded border border-white/10 overflow-hidden relative group", children: [
                  /* @__PURE__ */ jsx2("img", { src: `data:${img.mimeType};base64,${img.base64}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsx2("button", { onClick: () => removeAsset(img.id, "story_ref"), className: "absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px]", children: "delete" }) })
                ] }, img.id)),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleBatchUpload("story_ref"), className: "w-8 h-8 rounded border border-dashed border-blue-500/30 flex items-center justify-center hover:bg-blue-500/10 text-blue-500/40", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add_photo_alternate" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "L\u1EC7nh \u0111i\u1EC1u khi\u1EC3n AI c\xE1ch ph\xE2n t\xEDch truy\u1EC7n sang k\u1ECBch b\u1EA3n.", children: "L\u1EC7nh Ph\xE2n t\xEDch (Prompt)" }),
              /* @__PURE__ */ jsx2(
                "textarea",
                {
                  value: storyAnalysisPrompt,
                  onChange: (e) => setStoryAnalysisPrompt(e.target.value),
                  className: "w-full h-12 bg-black border border-white/10 rounded-lg p-1.5 text-[8px] text-white/50 outline-none resize-none italic",
                  placeholder: "L\u1EC7nh chuy\u1EC3n th\u1EC3 truy\u1EC7n sang k\u1ECBch b\u1EA3n...",
                  title: "Prompt h\u01B0\u1EDBng d\u1EABn AI c\xE1ch vi\u1EBFt k\u1ECBch b\u1EA3n (v\xED d\u1EE5: ng\xF4n ng\u1EEF, th\u1EC3 lo\u1EA1i, phong c\xE1ch tho\u1EA1i)."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-1", children: [
              /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 t\u1EEB/\u0111o\u1EA1n", value: storyChunkSize, min: 50, max: 1e3, step: 10, onChange: setStoryChunkSize, tooltip: "\u0110\u1ED9 d\xE0i v\u0103n b\u1EA3n g\u1EEDi \u0111i cho m\u1ED7i l\u1EA7n AI ph\xE2n t\xEDch. C\xE0ng nh\u1ECF th\xEC ph\xE2n t\xEDch c\xE0ng k\u1EF9." }),
              /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 lu\u1ED3ng", value: storyConcurrency, min: 1, max: 5, onChange: setStoryConcurrency, tooltip: "S\u1ED1 l\u01B0\u1EE3ng \u0111o\u1EA1n v\u0103n b\u1EA3n AI s\u1EBD ph\xE2n t\xEDch c\xF9ng l\xFAc (song song)." })
            ] }),
            /* @__PURE__ */ jsx2(DragNumberField, { label: "Th\u1EDDi gian ngh\u1EC9 (Delay)", value: storyDelay, min: 0, max: 60, suffix: "s", onChange: setStoryDelay, tooltip: "Th\u1EDDi gian ch\u1EDD gi\u1EEFa c\xE1c l\u1EA7n AI ph\xE2n t\xEDch \u0111\u1EC3 tr\xE1nh b\u1ECB gi\u1EDBi h\u1EA1n h\u1EC7 th\u1ED1ng." }),
            /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 items-center relative", children: [
              /* @__PURE__ */ jsx2(
                PillButton,
                {
                  variant: "solid",
                  className: "!bg-blue-600 !text-white",
                  icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: isAnalyzingStory ? "sync" : "psychology" }),
                  onClick: analyzeStory,
                  disabled: isAnalyzingStory || !storyText.trim(),
                  title: "B\u1EAFt \u0111\u1EA7u quy tr\xECnh AI \u0111\u1ECDc v\xE0 vi\u1EBFt k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh t\u1EEB truy\u1EC7n.",
                  children: isAnalyzingStory ? `\u0110ANG PH\xC2N T\xCDCH (${storyAnalysisPercent}%)` : "PH\xC2N T\xCDCH TRUY\u1EC6N"
                }
              ),
              /* @__PURE__ */ jsx2(
                "button",
                {
                  onClick: () => setAutoStory(!autoStory),
                  title: autoStory ? "\u0110ang b\u1EADt: T\u1EF1 \u0111\u1ED9ng ch\u1EA1y khi nh\u1EA5n 'CH\u1EA0Y ALL'" : "\u0110ang t\u1EAFt: S\u1EBD b\u1ECF qua b\u01B0\u1EDBc n\xE0y khi 'CH\u1EA0Y ALL'",
                  className: `w-8 h-[28px] rounded-lg border flex items-center justify-center transition-all ${autoStory ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/20"}`,
                  children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: autoStory ? "toggle_on" : "toggle_off" })
                }
              ),
              isAnalyzingStory && /* @__PURE__ */ jsx2("div", { className: "absolute inset-x-0 -bottom-1 h-0.5 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx2("div", { className: "h-full bg-white transition-all duration-300", style: { width: `${storyAnalysisPercent}%` } }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Danh s\xE1ch k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh \u0111\xE3 \u0111\u01B0\u1EE3c bi\xEAn t\u1EADp ho\u1EB7c ph\xE2n t\xEDch xong.", children: "K\u1ECBch b\u1EA3n g\u1ED1c (SCENE)" }),
          /* @__PURE__ */ jsx2(
            "textarea",
            {
              value: fullScript,
              onChange: (e) => setFullScript(e.target.value),
              placeholder: "Nh\u1EADp k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh (SCENE)...",
              title: "M\u1ED7i ph\xE2n c\u1EA3nh c\u1EA7n b\u1EAFt \u0111\u1EA7u b\u1EB1ng t\u1EEB kh\xF3a SCENE \u0111\u1EC3 h\u1EC7 th\u1ED1ng nh\u1EADn di\u1EC7n.",
              className: "w-full h-28 bg-white/5 border border-white/10 rounded-xl p-2 text-[10px] outline-none focus:border-white/30 transition-all resize-none"
            }
          ),
          /* @__PURE__ */ jsx2("div", { className: "px-1", children: !isSceneLimitUnlocked ? /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 mb-1 p-1 bg-white/5 border border-white/10 rounded-lg", children: [
            /* @__PURE__ */ jsx2(
              "input",
              {
                type: "password",
                value: sceneAccessInput,
                onChange: (e) => setSceneAccessInput(e.target.value),
                placeholder: "M\xE3 m\u1EDF kho\xE1 Scene...",
                className: "flex-1 bg-black/40 border border-white/10 rounded-lg px-2 text-[9px] outline-none"
              }
            ),
            /* @__PURE__ */ jsx2(PillButton, { variant: "outline", className: "!w-auto px-3 !h-[22px]", onClick: handleUnlockSceneLimit, children: "M\u1EDF" })
          ] }) : /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg mb-1", children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-blue-400", children: "task_alt" }),
              /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase text-blue-400", children: "Gi\u1EDBi h\u1EA1n Scene:" })
            ] }),
            /* @__PURE__ */ jsx2(
              "input",
              {
                type: "number",
                value: maxScenes,
                onChange: (e) => setMaxScenes(Math.max(1, parseInt(e.target.value) || 1)),
                className: "bg-transparent border-none text-right text-[10px] font-black text-white w-10 outline-none"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-1.5 bg-pink-500/5 border border-pink-500/10 rounded-xl", children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx2(DragNumberField, { label: "DNA song song", value: dnaMaxConcurrent, min: 1, max: 5, onChange: setDnaMaxConcurrent, className: "flex-1" }),
              /* @__PURE__ */ jsx2(DragNumberField, { label: "DNA Delay", value: dnaMaxConcurrent, min: 0, max: 60, suffix: "s", onChange: setDnaDelay, className: "flex-1" })
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsx2(PillButton, { variant: "solid", className: "flex-1", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "input" }), onClick: importScript, disabled: !fullScript, children: "Timeline" }),
                /* @__PURE__ */ jsx2(PillButton, { variant: "outline", className: "flex-1", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "restart_alt" }), onClick: handleResetScript, children: "Reset" })
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 items-center", children: [
                /* @__PURE__ */ jsx2(PillButton, { variant: "outline", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "bolt" }), onClick: scanAndCreateAssets, disabled: isScanning || !fullScript, children: "Ph\xE2n t\xEDch DNA" }),
                /* @__PURE__ */ jsx2(
                  "button",
                  {
                    onClick: () => setAutoDNA(!autoDNA),
                    className: `w-8 h-[28px] rounded-lg border flex items-center justify-center transition-all ${autoDNA ? "bg-pink-600 border-pink-400 text-white" : "bg-white/5 border-white/10 text-white/20"}`,
                    children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: autoDNA ? "toggle_on" : "toggle_off" })
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Ch\u1ECDn c\xF4ng ngh\u1EC7 l\xF5i v\xE0 c\u1EA5u tr\xFAc khung h\xECnh cho phim.", children: "Model Video & T\u1EF7 l\u1EC7" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl", children: [
            /* @__PURE__ */ jsx2(FieldDropdown, { label: "Model Video", value: selectedModel, options: MODELS, onChange: setSelectedModel }),
            /* @__PURE__ */ jsx2(FieldDropdown, { label: "Model \u1EA2nh (Keyframe/DNA)", value: selectedImageModel, options: IMAGE_MODELS, onChange: setSelectedImageModel }),
            /* @__PURE__ */ jsx2(FieldDropdown, { label: "T\u1EF7 l\u1EC7 khung h\xECnh", value: aspectRatio, options: ["16:9", "9:16", "1:1", "4:3", "3:4"], onChange: setAspectRatio })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Thi\u1EBFt l\u1EADp c\xE1c th\xF4ng s\u1ED1 v\u1EADt l\xFD v\xE0 \u0111\u1ED9 n\xE9t c\u1EE7a phim.", children: "Th\u1EDDi l\u01B0\u1EE3ng & Ch\u1EA5t l\u01B0\u1EE3ng" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl", children: [
            /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-1", children: [
              /* @__PURE__ */ jsx2(DragNumberField, { label: "Th\u1EDDi l\u01B0\u1EE3ng", value: parseInt(globalDuration), min: 4, max: 10, step: 1, suffix: "s", onChange: (v) => setGlobalDuration(String(v)) }),
              /* @__PURE__ */ jsx2(FieldDropdown, { label: "\u0110\u1ED9 ph\xE2n gi\u1EA3i", value: resolution, options: ["720p", "360p"], onChange: setResolution })
            ] }),
            !isQualityUnlocked && /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 mt-1", children: [
              /* @__PURE__ */ jsx2(
                "input",
                {
                  type: "password",
                  value: accessInput,
                  onChange: (e) => setAccessInput(e.target.value),
                  placeholder: "M\xE3 ch\u1EA5t l\u01B0\u1EE3ng...",
                  className: "flex-1 bg-black/40 border border-white/10 rounded-lg px-2 text-[9px] outline-none"
                }
              ),
              /* @__PURE__ */ jsx2(PillButton, { variant: "outline", className: "!w-auto px-3", onClick: handleUnlockQuality, children: "M\u1EDF" })
            ] }),
            isQualityUnlocked && /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg", children: [
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-emerald-400", children: "verified" }),
              /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase text-emerald-400", children: "\u0110\xE3 m\u1EDF kho\xE1 4K Ultra (Sim)" })
            ] })
          ] })
        ] }),
        !isAdvancedConfigUnlocked ? !isLockVisible ? /* @__PURE__ */ jsx2("div", { className: "flex items-center justify-center py-1", children: /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            onClick: handleLockIconClick,
            className: "text-white/20 hover:text-white/40 active:scale-90 transition-all p-1 cursor-pointer select-none",
            title: "B\u1EA3o m\u1EADt",
            children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[13px] leading-none block", children: "lock" })
          }
        ) }) : /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2 p-2.5 bg-pink-500/5 border border-pink-500/20 rounded-xl animate-dropdown", children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 px-1", children: [
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px] text-pink-400", children: "lock" }),
            /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase tracking-[1px] text-pink-400", children: "C\u1EA5u h\xECnh b\u1EA3o m\u1EADt" })
          ] }),
          /* @__PURE__ */ jsx2("p", { className: "text-[8px] text-white/40 px-1 leading-tight", children: "Nh\u1EADp m\u1EADt kh\u1EA9u \u0111\u1EC3 m\u1EDF: Prompt Master, Keyframe, DNA, Quy tr\xECnh Render v\xE0 Auto-Heal." }),
          /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsx2(
              "input",
              {
                type: "password",
                value: advancedPasswordInput,
                onChange: (e) => setAdvancedPasswordInput(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && handleUnlockAdvancedConfig(),
                placeholder: "M\u1EADt kh\u1EA9u c\u1EA5u h\xECnh...",
                className: "flex-1 bg-black/40 border border-white/10 rounded-lg px-2 text-[9px] outline-none focus:border-pink-500/40",
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsx2(PillButton, { variant: "solid", className: "!w-auto px-3 !bg-pink-600 !text-white", onClick: handleUnlockAdvancedConfig, children: "M\u1EDF" })
          ] })
        ] }) : /* @__PURE__ */ jsxs2(Fragment2, { children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Quy t\u1EAFc chung \u0111\u1EC3 AI \xE1p d\u1EE5ng cho t\u1EA5t c\u1EA3 VIDEO trong d\u1EF1 \xE1n.", children: "Prompt ch\u1EA5t l\u01B0\u1EE3ng (Master Rule)" }),
            /* @__PURE__ */ jsx2("div", { className: "flex flex-col gap-1.5", children: /* @__PURE__ */ jsx2(
              "textarea",
              {
                value: globalProductionRule,
                onChange: (e) => setGlobalProductionRule(e.target.value),
                className: "w-full h-24 bg-pink-500/5 border border-pink-500/20 rounded-lg p-2 text-[9px] outline-none resize-none italic leading-relaxed",
                placeholder: "Thi\u1EBFt l\u1EADp prompt ch\u1EA5t l\u01B0\u1EE3ng cho VIDEO t\u1ED5ng th\u1EC3..."
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between pr-1", children: [
              /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Quy t\u1EAFc ri\xEAng ch\u1EC9 \xE1p d\u1EE5ng khi AI t\u1EA1o KEYFRAME (\u1EA2nh m\u1EABu \u0111\u1EA7u ti\xEAn).", children: "Prompt ch\u1EA5t l\u01B0\u1EE3ng \u1EA3nh (Keyframe)" }),
              videoGenMode === "i2v" && /* @__PURE__ */ jsx2(
                FrameSelector,
                {
                  source: "keyframe",
                  startSource: startFrameSource,
                  endSource: endFrameSource,
                  onSetStart: setStartFrameSource,
                  onSetEnd: setEndFrameSource
                }
              )
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ jsx2(
                "textarea",
                {
                  value: imageProductionRule,
                  onChange: (e) => setImageProductionRule(e.target.value),
                  className: "w-full h-20 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 text-[9px] outline-none resize-none italic leading-relaxed",
                  placeholder: "Thi\u1EBFt l\u1EADp prompt ch\u1EA5t l\u01B0\u1EE3ng d\xE0nh ri\xEAng cho KEYFRAME (\u1EA2nh)..."
                }
              ),
              /* @__PURE__ */ jsx2(
                FieldDropdown,
                {
                  label: "Ng\xF4n ng\u1EEF (Language)",
                  value: selectedLanguage,
                  options: LANGUAGES,
                  onChange: setSelectedLanguage
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Thi\u1EBFt l\u1EADp c\xE1ch AI thi\u1EBFt k\u1EBF ngo\u1EA1i h\xECnh nh\xE2n v\u1EADt v\xE0 b\u1ED1i c\u1EA3nh tham chi\u1EBFu.", children: "\u0110\u1ECBnh h\u01B0\u1EDBng DNA (DNA Prompts)" }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-pink-500/5 border border-pink-500/10 rounded-xl", children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx2(SectionLabel, { children: "DNA Nh\xE2n v\u1EADt (Character)" }),
                /* @__PURE__ */ jsx2(
                  "textarea",
                  {
                    value: directionalPrompt,
                    onChange: (e) => setDirectionalPrompt(e.target.value),
                    className: "w-full h-16 bg-black/40 border border-white/10 rounded-lg p-1.5 text-[8px] text-white/70 outline-none resize-none italic",
                    placeholder: "L\u1EC7nh thi\u1EBFt k\u1EBF nh\xE2n v\u1EADt..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx2(SectionLabel, { children: "DNA B\u1ED1i c\u1EA3nh (Location)" }),
                /* @__PURE__ */ jsx2(
                  "textarea",
                  {
                    value: locationDirectionalPrompt,
                    onChange: (e) => setLocationDirectionalPrompt(e.target.value),
                    className: "w-full h-16 bg-black/40 border border-white/10 rounded-lg p-1.5 text-[8px] text-white/70 outline-none resize-none italic",
                    placeholder: "L\u1EC7nh thi\u1EBFt k\u1EBF b\u1ED1i c\u1EA3nh..."
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "C\u1EA5u h\xECnh c\xE1ch th\u1EE9c AI th\u1EF1c thi c\xE1c l\u1EC7nh t\u1EA1o phim tr\xEAn Timeline.", children: "Quy tr\xECnh & C\u1EA5u h\xECnh Render" }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", children: [
              /* @__PURE__ */ jsx2(
                SegmentedToggle,
                {
                  value: videoGenMode,
                  onChange: (v) => setVideoGenMode(v),
                  items: [
                    { value: "i2v", label: "B\u1EAFt \u0111\u1EA7u t\u1EEB khung h\xECnh", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "image" }) },
                    { value: "r2v", label: "B\u1EAFt \u0111\u1EA7u b\u1EB1ng th\xE0nh ph\u1EA7n", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "category" }) }
                  ]
                }
              ),
              /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsx2(DragNumberField, { label: "Render song song", value: maxConcurrentRenders, min: 1, max: 5, onChange: setMaxConcurrentRenders, className: "flex-1" }),
                /* @__PURE__ */ jsx2(DragNumberField, { label: "Th\u1EDDi gian ngh\u1EC9", value: renderDelay, min: 0, max: 60, suffix: "s", onChange: setRenderDelay, className: "flex-1" })
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsxs2("button", { onClick: () => setSkipImageGen(!skipImageGen), className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${skipImageGen ? "bg-pink-500/10 border-pink-500/40" : "bg-white/5 border-white/10"}`, children: [
                  /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "B\u1ECF qua Keyframe" }),
                  /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${skipImageGen ? "bg-pink-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${skipImageGen ? "left-3.5" : "left-0.5"}` }) })
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxs2("button", { onClick: () => setUseLastFrameAsReference(!useLastFrameAsReference), className: `flex-1 flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${useLastFrameAsReference ? "bg-blue-500/10 border-blue-500/40" : "bg-white/5 border-white/10"}`, children: [
                    /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "Tham chi\u1EBFu c\u1EA3nh" }),
                    /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${useLastFrameAsReference ? "bg-blue-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${useLastFrameAsReference ? "left-3.5" : "left-0.5"}` }) })
                  ] }),
                  videoGenMode === "i2v" && /* @__PURE__ */ jsx2(
                    FrameSelector,
                    {
                      source: "continuity",
                      startSource: startFrameSource,
                      endSource: endFrameSource,
                      onSetStart: setStartFrameSource,
                      onSetEnd: setEndFrameSource
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl", children: [
                  /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxs2("button", { onClick: () => setRenderFromShotOnly(!renderFromShotOnly), className: `flex-1 flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${renderFromShotOnly ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-white/10"}`, children: [
                      /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "Render t\u1EEB \u1EA3nh shot" }),
                      /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${renderFromShotOnly ? "bg-emerald-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${renderFromShotOnly ? "left-3.5" : "left-0.5"}` }) })
                    ] }),
                    videoGenMode === "i2v" && /* @__PURE__ */ jsx2(
                      FrameSelector,
                      {
                        source: "shot",
                        startSource: startFrameSource,
                        endSource: endFrameSource,
                        onSetStart: setStartFrameSource,
                        onSetEnd: setEndFrameSource
                      }
                    )
                  ] }),
                  renderFromShotOnly && /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2 animate-dropdown", children: [
                    /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-3 gap-1", children: [
                      /* @__PURE__ */ jsx2(
                        "button",
                        {
                          onClick: () => setConnectShot(!connectShot),
                          className: `flex-1 flex items-center justify-center h-7 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${connectShot ? "bg-emerald-600 border-emerald-400 text-white" : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"}`,
                          children: "N\u1ED1i Shot"
                        }
                      ),
                      /* @__PURE__ */ jsx2(
                        "button",
                        {
                          onClick: () => setConnectScene(!connectScene),
                          className: `flex-1 flex items-center justify-center h-7 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${connectScene ? "bg-emerald-600 border-emerald-400 text-white" : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"}`,
                          children: "N\u1ED1i Scene"
                        }
                      ),
                      /* @__PURE__ */ jsx2(
                        "button",
                        {
                          onClick: () => setIsStoryboardEnabled(!isStoryboardEnabled),
                          className: `flex-1 flex items-center justify-center h-7 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${isStoryboardEnabled ? "bg-purple-600 border-purple-400 text-white" : "bg-white/5 border-white/10 text-white/30 hover:text-white/50"}`,
                          children: "Storyboard"
                        }
                      )
                    ] }),
                    isStoryboardEnabled && /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-purple-500/5 border border-purple-500/20 rounded-xl animate-dropdown", children: [
                      /* @__PURE__ */ jsxs2(
                        "button",
                        {
                          onClick: () => setIsStoryboardCropEnabled(!isStoryboardCropEnabled),
                          className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${isStoryboardCropEnabled ? "bg-purple-600/20 border-purple-400" : "bg-white/5 border-white/10"}`,
                          children: [
                            /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase tracking-widest", children: "C\u1EAFt \u1EA3nh Storyboard" }),
                            /* @__PURE__ */ jsx2("div", { className: `w-5 h-2.5 rounded-full relative transition-colors ${isStoryboardCropEnabled ? "bg-purple-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-1.5 h-1.5 bg-white rounded-full transition-all ${isStoryboardCropEnabled ? "left-3" : "left-0.5"}` }) })
                          ]
                        }
                      ),
                      isStoryboardCropEnabled && /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-1 animate-dropdown", children: [
                        /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 h\xE0ng", value: storyboardRows, min: 1, max: 10, onChange: setStoryboardRows }),
                        /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 c\u1ED9t", value: storyboardCols, min: 1, max: 10, onChange: setStoryboardCols })
                      ] }),
                      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1 mt-1", children: [
                        /* @__PURE__ */ jsx2(SectionLabel, { children: "L\u1EC7nh Storyboard (Prompt)" }),
                        /* @__PURE__ */ jsx2(
                          "textarea",
                          {
                            value: storyboardPrompt,
                            onChange: (e) => setStoryboardPrompt(e.target.value),
                            className: "w-full h-10 bg-black/40 border border-purple-500/20 rounded-lg p-1.5 text-[8px] text-white/70 outline-none resize-none",
                            placeholder: DEFAULT_STORYBOARD_PROMPT
                          }
                        )
                      ] })
                    ] }),
                    !isStoryboardCropEnabled && /* @__PURE__ */ jsxs2(Fragment2, { children: [
                      /* @__PURE__ */ jsx2(
                        DragNumberField,
                        {
                          label: "S\u1ED1 l\u01B0\u1EE3ng \u1EA3nh Shot",
                          value: shotCount,
                          min: 1,
                          max: 99,
                          onChange: (v) => {
                            setShotCount(v);
                            const next = [...shotPrompts];
                            while (next.length < v) next.push("");
                            setShotPrompts(next.slice(0, v));
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx2("div", { className: "space-y-1.5", children: Array.from({ length: shotCount }).map((_, i) => /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                        /* @__PURE__ */ jsxs2(SectionLabel, { children: [
                          "Prompt Shot ",
                          i + 1
                        ] }),
                        /* @__PURE__ */ jsx2(
                          "textarea",
                          {
                            value: shotPrompts[i] || "",
                            onChange: (e) => {
                              const next = [...shotPrompts];
                              next[i] = e.target.value;
                              setShotPrompts(next);
                            },
                            className: "w-full h-10 bg-black/40 border border-white/10 rounded-lg p-1.5 text-[8px] text-white/70 outline-none resize-none",
                            placeholder: imageProductionRule
                          }
                        )
                      ] }, i)) })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs2("button", { onClick: () => setAutoMerge(!autoMerge), className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${autoMerge ? "bg-green-500/10 border-green-500/40" : "bg-white/5 border-white/10"}`, children: [
                  /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "T\u1EF1 gh\xE9p Master" }),
                  /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${autoMerge ? "bg-green-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${autoMerge ? "left-3.5" : "left-0.5"}` }) })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Thi\u1EBFt l\u1EADp c\u01A1 ch\u1EBF AI t\u1EF1 \u0111\u1ED9ng vi\u1EBFt l\u1EA1i k\u1ECBch b\u1EA3n khi g\u1EB7p l\u1ED7i ho\u1EB7c b\u1ECB t\u1EEB ch\u1ED1i ch\xEDnh s\xE1ch.", children: "Auto-Heal & Timeout (T\u1EF1 s\u1EEDa & Ch\u1EDD)" }),
            /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-orange-500/5 border border-orange-500/20 rounded-xl", children: [
              /* @__PURE__ */ jsxs2("button", { onClick: () => setIsAutoHealEnabled(!isAutoHealEnabled), className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${isAutoHealEnabled ? "bg-orange-500/20 border-orange-500/40" : "bg-white/5 border-white/10"}`, children: [
                /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "K\xEDch ho\u1EA1t T\u1EF1 s\u1EEDa" }),
                /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${isAutoHealEnabled ? "bg-orange-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${isAutoHealEnabled ? "left-3.5" : "left-0.5"}` }) })
              ] }),
              /* @__PURE__ */ jsx2(DragNumberField, { label: "Th\u1EDDi gian ch\u1EDD (Timeout)", value: renderTimeout, min: 10, max: 600, step: 10, suffix: "s", onChange: setRenderTimeout }),
              /* @__PURE__ */ jsx2(DragNumberField, { label: "Th\u1EDDi gian ngh\u1EC9 (Retry Delay)", value: retryDelay, min: 1, max: 300, suffix: "s", onChange: setRetryDelay }),
              /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 l\u01B0\u1EE3t th\u1EED l\u1EA1i", value: maxRetries, min: 0, max: 20, onChange: setMaxRetries, suffix: " l\u01B0\u1EE3t" }),
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx2(SectionLabel, { children: "L\u1EC7nh S\u1EEDa (Heal Prompt)" }),
                /* @__PURE__ */ jsx2("textarea", { value: healInstruction, onChange: (e) => setHealInstruction(e.target.value), className: "w-full h-12 bg-black border border-white/10 rounded-lg p-2 text-[8px] outline-none resize-none italic" }),
                /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between border border-white/10 rounded-lg px-2 py-1 bg-white/5", children: [
                  /* @__PURE__ */ jsx2("span", { className: "text-[8px] text-white/40 font-bold uppercase", children: "L\u01B0\u1EE3t s\u1EEDa t\u1ED1i \u0111a" }),
                  /* @__PURE__ */ jsx2("input", { type: "number", min: "1", max: "20", value: maxAutoRetries, onChange: (e) => setMaxAutoRetries(parseInt(e.target.value) || 1), className: "bg-transparent border-none text-right w-8 text-[10px] font-bold outline-none text-orange-500" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "T\u1EF1 \u0111\u1ED9ng l\u1EB7p l\u1EA1i quy tr\xECnh: Vi\u1EBFt l\u1EA1i k\u1ECBch b\u1EA3n -> Quay -> Gh\xE9p phim.", children: "V\xF2ng l\u1EB7p t\u1EF1 \u0111\u1ED9ng (Auto-Loop)" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-purple-500/5 border border-purple-500/20 rounded-xl", children: [
            /* @__PURE__ */ jsxs2("button", { onClick: () => setIsAutoLoopEnabled(!isAutoLoopEnabled), className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${isAutoLoopEnabled ? "bg-purple-500/20 border-purple-500/40" : "bg-white/5 border-white/10"}`, children: [
              /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "K\xEDch ho\u1EA1t Loop" }),
              /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${isAutoLoopEnabled ? "bg-purple-500" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${isAutoLoopEnabled ? "left-3.5" : "left-0.5"}` }) })
            ] }),
            isAutoLoopEnabled && /* @__PURE__ */ jsxs2(Fragment2, { children: [
              /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 l\u1EA7n l\u1EB7p", value: autoLoopLimit, min: 1, max: 50, onChange: setAutoLoopLimit, suffix: " l\u1EA7n" }),
              /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx2(SectionLabel, { children: "AI Rewrite Prompt" }),
                /* @__PURE__ */ jsx2("textarea", { value: loopRewritePrompt, onChange: (e) => setLoopRewritePrompt(e.target.value), className: "w-full h-12 bg-black border border-white/10 rounded-lg p-1.5 text-[8px] text-white/60 outline-none resize-none", placeholder: "L\u1EC7nh vi\u1EBFt l\u1EA1i k\u1ECBch b\u1EA3n..." })
              ] }),
              isAutoLooping && /* @__PURE__ */ jsxs2("div", { className: "px-2 py-1 bg-purple-600/20 rounded-lg border border-purple-500/30 flex justify-between items-center", children: [
                /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase text-purple-400", children: "\u0110ang l\u1EB7p:" }),
                /* @__PURE__ */ jsxs2("span", { className: "text-[10px] font-black text-white", children: [
                  currentLoopCount + 1,
                  "/",
                  autoLoopLimit
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx2(SectionLabel, { tooltip: "Ch\u1EA1y to\xE0n b\u1ED9 quy tr\xECnh: Ph\xE2n t\xEDch truy\u1EC7n -> DNA -> Quay t\u1EEB \u0111\u1EA7u \u0111\u1EBFn cu\u1ED1i nhi\u1EC1u l\u1EA7n.", children: "V\xF2ng l\u1EB7p quy tr\xECnh (Loop All)" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5 p-2 bg-blue-600/5 border border-blue-600/20 rounded-xl", children: [
            /* @__PURE__ */ jsxs2("button", { onClick: () => setIsLoopAllEnabled(!isLoopAllEnabled), className: `flex items-center justify-between w-full px-2 py-1.5 rounded-lg border transition-all ${isLoopAllEnabled ? "bg-blue-600/20 border-blue-600/40" : "bg-white/5 border-white/10"}`, children: [
              /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold uppercase tracking-wider", children: "K\xEDch ho\u1EA1t Loop All" }),
              /* @__PURE__ */ jsx2("div", { className: `w-6 h-3 rounded-full relative transition-colors ${isLoopAllEnabled ? "bg-blue-600" : "bg-white/20"}`, children: /* @__PURE__ */ jsx2("div", { className: `absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${isLoopAllEnabled ? "left-3.5" : "left-0.5"}` }) })
            ] }),
            isLoopAllEnabled && /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx2(DragNumberField, { label: "S\u1ED1 v\xF2ng Ch\u1EA1y All", value: loopAllLimit, min: 1, max: 100, onChange: setLoopAllLimit, suffix: " v\xF2ng" }),
              isRunningAll && isLoopAllEnabled && /* @__PURE__ */ jsxs2("div", { className: "px-2 py-1 bg-blue-600/20 rounded-lg border border-blue-600/30 flex justify-between items-center", children: [
                /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase text-blue-400", children: "\u0110ang v\xF2ng All:" }),
                /* @__PURE__ */ jsxs2("span", { className: "text-[10px] font-black text-white", children: [
                  currentLoopAllCount + 1,
                  "/",
                  loopAllLimit
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1 pb-4", children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between px-1", children: [
            /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-black text-white/50 uppercase tracking-[1px]", children: "DNA Library" }),
            /* @__PURE__ */ jsxs2(
              "button",
              {
                onClick: syncAllToFlow,
                disabled: isSyncingToFlow || actors.length === 0 && locations.length === 0 && masterStyle.length === 0,
                className: `flex items-center gap-1 px-1.5 h-5 rounded border transition-all ${isSyncingToFlow ? "bg-blue-600/20 border-blue-400 text-blue-400 animate-pulse" : "bg-white/5 border-white/10 text-white/20 hover:text-white/60 hover:bg-white/10"}`,
                children: [
                  /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px]", children: isSyncingToFlow ? "sync" : "cloud_upload" }),
                  /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-black uppercase tracking-[1px]", children: isSyncingToFlow ? "SYNCING..." : "SYNC TO FLOW" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs2("div", { className: "bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/10 p-2 rounded-xl", children: [
              /* @__PURE__ */ jsxs2("p", { className: "text-[8px] text-pink-500 font-black uppercase mb-1.5 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: "auto_awesome" }),
                " STYLE"
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-5 gap-1", children: [
                masterStyle.map((m) => /* @__PURE__ */ jsxs2("div", { className: "aspect-square rounded bg-white/5 border border-pink-500/10 overflow-hidden relative group", children: [
                  /* @__PURE__ */ jsx2("img", { src: `data:${m.mimeType};base64,${m.base64}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsx2("button", { onClick: () => removeAsset(m.id, "style"), className: "absolute top-0 right-0 bg-black/80 p-0.5 rounded-bl opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px] text-red-500", children: "close" }) })
                ] }, m.id)),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleManualUpload("style"), className: "aspect-square rounded border border-dashed border-pink-500/20 flex items-center justify-center hover:bg-pink-500/5 text-pink-500/30", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsxs2("p", { className: "text-[7px] text-white/30 font-bold uppercase mb-1 px-1 flex items-center justify-between gap-1", children: [
                /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: "person" }),
                  " Actors"
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxs2(
                    "button",
                    {
                      onClick: () => setIsCelebrityCheckEnabled(!isCelebrityCheckEnabled),
                      className: `flex items-center gap-1 px-1 rounded transition-all ${isCelebrityCheckEnabled ? "text-orange-500 bg-orange-500/10" : "text-white/20 hover:text-white/40"}`,
                      children: [
                        /* @__PURE__ */ jsx2("span", { className: "text-[6px] font-black", children: isCelebrityCheckEnabled ? "SECURE" : "OFF" }),
                        /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: isCelebrityCheckEnabled ? "verified_user" : "security_update_warning" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs2(
                    "button",
                    {
                      onClick: () => setStrictActorMatch(!strictActorMatch),
                      className: `flex items-center gap-1 px-1 rounded transition-all ${strictActorMatch ? "text-pink-500 bg-pink-500/10" : "text-white/20 hover:text-white/40"}`,
                      children: [
                        /* @__PURE__ */ jsx2("span", { className: "text-[6px] font-black", children: strictActorMatch ? "STRICT" : "AUTO" }),
                        /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: strictActorMatch ? "filter_alt" : "filter_alt_off" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-5 gap-1", children: [
                actors.map((a) => /* @__PURE__ */ jsxs2("div", { className: "aspect-square rounded bg-white/5 border border-white/10 overflow-hidden relative group", children: [
                  /* @__PURE__ */ jsx2("img", { src: `data:${a.mimeType};base64,${a.base64}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsx2(
                    "button",
                    {
                      onClick: () => handleSetVoice(a.id),
                      className: `absolute bottom-0 left-0 px-1 py-0.5 rounded-tr transition-all flex items-center justify-center z-20 ${a.voiceMediaId ? "bg-pink-600 text-white" : "bg-black/60 text-white/30 hover:text-white hover:bg-pink-600/50"}`,
                      children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[11px]", children: a.voiceMediaId ? "mic" : "mic_none" })
                    }
                  ),
                  /* @__PURE__ */ jsxs2("div", { className: "absolute top-0 right-0 flex bg-black/80 rounded-bl opacity-0 group-hover:opacity-100 z-20", children: [
                    a.voiceMediaId && /* @__PURE__ */ jsx2("button", { onClick: () => removeVoice(a.id), className: "p-0.5 hover:text-orange-500", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[9px]", children: "mic_off" }) }),
                    /* @__PURE__ */ jsx2("button", { onClick: () => setDnaEditTarget(a), className: "p-0.5 hover:text-pink-500", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[9px]", children: "biotech" }) }),
                    /* @__PURE__ */ jsx2("button", { onClick: () => removeAsset(a.id, "actor"), className: "p-0.5 hover:text-red-500", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[9px]", children: "close" }) })
                  ] })
                ] }, a.id)),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleManualUpload("actor"), className: "aspect-square rounded border border-dashed border-white/10 flex items-center justify-center hover:bg-white/5 text-white/15", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add" }) }),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleBatchUpload("actor"), className: "aspect-square rounded border border-dashed border-pink-500/20 flex items-center justify-center hover:bg-pink-500/5 text-pink-500/30", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "upload_file" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsxs2("p", { className: "text-[7px] text-white/30 font-bold uppercase mb-1 px-1 flex items-center justify-between gap-1", children: [
                /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: "map" }),
                  " Locations"
                ] }),
                /* @__PURE__ */ jsxs2(
                  "button",
                  {
                    onClick: () => setStrictLocationMatch(!strictLocationMatch),
                    className: `flex items-center gap-1 px-1 rounded transition-all ${strictLocationMatch ? "text-blue-500 bg-blue-500/10" : "text-white/20 hover:text-white/40"}`,
                    children: [
                      /* @__PURE__ */ jsx2("span", { className: "text-[6px] font-black", children: strictLocationMatch ? "STRICT" : "AUTO" }),
                      /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: strictLocationMatch ? "filter_alt" : "filter_alt_off" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-5 gap-1", children: [
                locations.map((l) => /* @__PURE__ */ jsxs2("div", { className: "aspect-square rounded bg-white/5 border border-white/10 overflow-hidden relative group", children: [
                  /* @__PURE__ */ jsx2("img", { src: `data:${l.mimeType};base64,${l.base64}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsxs2("div", { className: "absolute top-0 right-0 flex bg-black/80 rounded-bl opacity-0 group-hover:opacity-100", children: [
                    /* @__PURE__ */ jsx2("button", { onClick: () => setDnaEditTarget(l), className: "p-0.5 hover:text-pink-500", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[9px]", children: "biotech" }) }),
                    /* @__PURE__ */ jsx2("button", { onClick: () => removeAsset(l.id, "location"), className: "p-0.5 hover:text-red-500", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[9px]", children: "close" }) })
                  ] })
                ] }, l.id)),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleManualUpload("location"), className: "aspect-square rounded border border-dashed border-white/10 flex items-center justify-center hover:bg-white/5 text-white/15", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add_location" }) }),
                /* @__PURE__ */ jsx2("button", { onClick: () => handleBatchUpload("location"), className: "aspect-square rounded border border-dashed border-blue-500/20 flex items-center justify-center hover:bg-blue-500/5 text-blue-500/30", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "upload_file" }) })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "p-2.5 border-t border-white/10 bg-[#0b0b0b] space-y-1.5", children: [
        /* @__PURE__ */ jsx2("p", { className: "text-[8px] text-pink-400/50 mb-0.5 font-black uppercase tracking-widest truncate", children: statusMsg }),
        isBatchRendering || isRunningAll || isAnalyzingStory || isScanning || isSyncingToFlow ? /* @__PURE__ */ jsx2("div", { className: "flex flex-col gap-1.5", children: /* @__PURE__ */ jsxs2("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx2(
            PillButton,
            {
              variant: isPaused ? "solid" : "outline",
              className: "flex-1",
              icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: isPaused ? "play_arrow" : "pause" }),
              onClick: togglePause,
              disabled: isRunningAll && !isBatchRendering || isSyncingToFlow,
              children: isPaused ? "TI\u1EBEP T\u1EE4C" : "T\u1EA0M D\u1EEANG"
            }
          ),
          /* @__PURE__ */ jsx2(
            PillButton,
            {
              variant: "outline",
              className: "flex-1 !text-red-500 !border-red-500/40",
              icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px] text-red-500", children: "stop" }),
              onClick: stopBatch,
              children: "D\u1EEANG KH\u1EA8N C\u1EA4P"
            }
          )
        ] }) }) : /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-1.5", children: [
          scenes.some((s) => s.status !== "done" && s.status !== "idle") && /* @__PURE__ */ jsx2(PillButton, { variant: "outline", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "play_circle" }), onClick: () => renderBatch(true), children: "QUAY TI\u1EBEP T\u1EE4C" }),
          /* @__PURE__ */ jsxs2("div", { className: "flex gap-1 items-center", children: [
            /* @__PURE__ */ jsx2(
              PillButton,
              {
                variant: "outline",
                icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: scenes.some((s) => s.status === "done") ? "replay" : "auto_awesome_motion" }),
                onClick: isAutoLoopEnabled ? startAutoLoopProcess : () => renderBatch(true),
                disabled: scenes.length === 0,
                children: isAutoLoopEnabled ? "B\u1EAET \u0110\u1EA6U V\xF2ng L\u1EB6P" : scenes.some((s) => s.status === "done") ? "QUAY L\u1EA0I T\u1EEA \u0110\u1EA6U" : "B\u1EAET \u0110\u1EA6U QUAY"
              }
            ),
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: () => setAutoRender(!autoRender),
                className: `w-8 h-[28px] rounded-lg border flex items-center justify-center transition-all ${autoRender ? "bg-orange-600 border-orange-400 text-white" : "bg-white/5 border-white/10 text-white/20"}`,
                children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: autoRender ? "toggle_on" : "toggle_off" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx2(
            PillButton,
            {
              variant: "solid",
              className: "!bg-gradient-to-r !from-blue-600 !to-pink-600 !text-white !h-[32px]",
              icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[16px]", children: "bolt" }),
              onClick: handleRunAll,
              disabled: isRunningAll || !autoStory && !autoDNA && !autoRender,
              children: isRunningAll ? isLoopAllEnabled ? `LOOP ALL ${currentLoopAllCount + 1}/${loopAllLimit}` : "\u0110ANG CH\u1EA0Y ALL..." : "CH\u1EA0Y ALL"
            }
          )
        ] }),
        /* @__PURE__ */ jsx2(PillButton, { variant: "solid", icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "movie" }), onClick: mergeAll, disabled: isProcessing || scenes.length === 0, children: "XU\u1EA4T MASTER" }),
        /* @__PURE__ */ jsx2(
          PillButton,
          {
            variant: "outline",
            className: "!border-blue-500/20 !text-blue-400",
            icon: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "refresh" }),
            onClick: resetAllTasks,
            children: "RESET L\u1EC6NH"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "pt-2 flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between px-1", children: [
            /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-black text-white/50 uppercase tracking-[1px]", children: "MLT Device ID" }),
            /* @__PURE__ */ jsxs2("button", { onClick: handleCopyId, className: "flex items-center gap-1 hover:text-blue-400 transition-colors", children: [
              /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-bold uppercase", children: copyStatus ? "\u0110\xE3 copy" : "Copy" }),
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[10px]", children: copyStatus ? "done" : "content_copy" })
            ] })
          ] }),
          /* @__PURE__ */ jsx2("div", { className: "bg-black/40 border border-white/5 rounded px-2 py-1 flex items-center justify-center", children: /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-mono text-blue-400/80 tracking-widest uppercase", children: auth.authState.deviceId || "DEVICE_ID_ERROR" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex-1 overflow-y-auto bg-[#0e0e0e] dark-scrollbar relative", children: [
      /* @__PURE__ */ jsxs2("div", { className: "sticky top-0 z-[60] bg-gradient-to-r from-blue-900/30 via-[#0b0b0b] to-pink-900/30 border-b border-white/5 backdrop-blur-md px-3 h-8 flex items-center justify-between shadow-2xl", children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx2("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" }),
          /* @__PURE__ */ jsxs2("span", { className: "text-[8px] font-black uppercase tracking-[1.5px] text-white/40", children: [
            "Auth: ",
            /* @__PURE__ */ jsxs2("span", { className: "text-emerald-400", children: [
              "Authorized ",
              auth.authState.serverTimeDisplay ? `(${auth.authState.serverTimeDisplay})` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1 ml-4 border-l border-white/10 pl-4", children: [
            /* @__PURE__ */ jsxs2("button", { onClick: stopBatch, className: "h-6 px-2 flex items-center justify-center bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded transition-all gap-1", children: [
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[16px]", children: "stop" }),
              /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase tracking-wider hidden sm:inline", children: "D\u1EEBng kh\u1EA9n c\u1EA5p" })
            ] }),
            /* @__PURE__ */ jsxs2("button", { onClick: resetAllTasks, className: "h-6 px-2 flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-all gap-1", children: [
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[16px]", children: "refresh" }),
              /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black uppercase tracking-wider hidden sm:inline", children: "Reset l\u1EC7nh" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 h-5", children: [
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-white/40", children: "zoom_out" }),
            /* @__PURE__ */ jsx2(
              "input",
              {
                type: "range",
                min: "0.02",
                max: "2.0",
                step: "0.01",
                value: sceneScale,
                onChange: (e) => setSceneScale(parseFloat(e.target.value)),
                className: "w-16 accent-pink-500 h-0.5 cursor-pointer"
              }
            ),
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-white/40", children: "zoom_in" }),
            /* @__PURE__ */ jsxs2("span", { className: "text-[8px] font-black text-white/40 w-6 text-center", children: [
              Math.round(sceneScale * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: `flex items-center gap-1.5 bg-blue-500/10 px-2 h-5 rounded-full border transition-all cursor-pointer ${auth.authState.isSyncing ? "border-blue-400 animate-pulse bg-blue-500/20" : auth.authState.syncError ? "border-red-500/40 bg-red-500/10" : "border-blue-500/20 hover:bg-blue-500/20"}`, onClick: () => auth.performInitialSync(5), children: [
            /* @__PURE__ */ jsx2("span", { className: `material-symbols-outlined text-[12px] ${auth.authState.syncError ? "text-red-500" : "text-blue-400"} ${auth.authState.isSyncing ? "animate-spin" : ""}`, children: auth.authState.syncError ? "sync_problem" : "cloud_sync" }),
            /* @__PURE__ */ jsx2("span", { className: `text-[10px] font-black uppercase tracking-[0.5px] truncate ${auth.authState.syncError ? "text-red-400" : "text-blue-400"}`, children: auth.authState.serverTimeDisplay || (auth.authState.isSyncing ? "GOOGLE SYNCING..." : auth.authState.syncError ? "L\u1ED6I \u0110\u1ED2NG B\u1ED8" : "WAITING FOR SYNC...") })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 bg-black/40 px-2 h-5 rounded-full border border-white/5", children: [
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-blue-400", children: "verified" }),
            /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-bold text-white/70 uppercase tracking-tight", children: auth.authState.plan })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 bg-pink-500/10 px-2 h-5 rounded-full border border-pink-500/20", children: [
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px] text-pink-500", children: "schedule" }),
            /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-black text-pink-400 uppercase tracking-[0.5px]", children: auth.authState.remainingTime || "..." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "max-w-[1400px] mx-auto p-4 lg:p-6 pb-48", children: [
        /* @__PURE__ */ jsxs2("header", { className: "mb-6 flex justify-between items-end", children: [
          /* @__PURE__ */ jsxs2("div", { children: [
            /* @__PURE__ */ jsx2("h1", { className: "text-xl font-light tracking-tight mb-0.5", children: currentProjectName }),
            /* @__PURE__ */ jsx2("div", { className: "h-0.5 w-8 bg-pink-500" }),
            /* @__PURE__ */ jsx2("p", { className: "mt-1 text-[8px] text-white/20 uppercase tracking-[2px]", children: "Timeline DNA Analyst v1.0.4" })
          ] }),
          (isAutoLooping || isLoopAllEnabled && isRunningAll) && /* @__PURE__ */ jsxs2("div", { className: "bg-purple-600/20 border border-purple-500/40 px-4 py-1.5 rounded-full flex items-center gap-3 animate-pulse", children: [
            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[16px] text-purple-400", children: "sync" }),
            /* @__PURE__ */ jsx2("span", { className: "text-[10px] font-black uppercase tracking-widest text-purple-400", children: isLoopAllEnabled && isRunningAll ? `Loop All: ${currentLoopAllCount + 1}/${loopAllLimit}` : `Loop Master: ${currentLoopCount + 1}/${autoLoopLimit}` })
          ] })
        ] }),
        /* @__PURE__ */ jsx2(
          "div",
          {
            className: "grid gap-4 transition-all duration-300 ease-in-out",
            style: {
              gridTemplateColumns: `repeat(auto-fill, minmax(${320 * sceneScale}px, 1fr))`
            },
            children: scenes.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "col-span-full h-48 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-white/10 gap-3", children: [
              /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[48px]", children: "movie_filter" }),
              /* @__PURE__ */ jsx2("p", { className: "text-[10px] uppercase font-bold tracking-widest", children: "Nh\u1EADp k\u1ECBch b\u1EA3n \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u" })
            ] }) : scenes.map((scene) => {
              const refs = getReferencesForText(scene.rawText);
              const matchedActors = actors.filter((a) => refs.imageIds.includes(a.mediaId) && a.type === "actor");
              const matchedLocations = locations.filter((l) => refs.imageIds.includes(l.mediaId) && l.type === "location");
              const isWorking = scene.status === "generating" || scene.status === "healing" || scene.status === "retrying";
              const isStoryboardWorking = scene.storyboardStatus === "generating" || scene.storyboardStatus === "cropping";
              return /* @__PURE__ */ jsxs2("div", { className: `flex flex-col gap-2.5 border p-3.5 rounded-[20px] transition-all group relative overflow-hidden ${scene.status === "healing" ? "bg-orange-500/5 border-orange-500/30" : scene.status === "generating" || scene.status === "retrying" ? "bg-white/[0.03] border-white/10" : scene.status === "error" ? "bg-red-500/5 border-red-500/30" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.02]"}`, children: [
                isWorking && /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 bg-white/[0.02] pointer-events-none", children: /* @__PURE__ */ jsx2("div", { className: "h-full bg-pink-500/5 transition-all duration-500", style: { width: `${scene.localPercent}%` } }) }),
                /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between relative z-10", children: [
                  /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxs2("span", { className: "text-sm font-black text-white/10 group-hover:text-pink-500/20 uppercase", children: [
                      "Scene ",
                      scene.chunkIndex + 1
                    ] }),
                    scene.status === "healing" && /* @__PURE__ */ jsx2("span", { className: "text-[7px] bg-orange-500 text-black px-1.5 py-0.5 rounded uppercase font-black animate-pulse", children: "Healing..." }),
                    scene.isRewritten && scene.status !== "healing" && /* @__PURE__ */ jsx2("span", { className: "text-[7px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase font-black", children: "Healed/Loop" })
                  ] }),
                  /* @__PURE__ */ jsx2("div", { className: "flex items-center gap-2", children: isWorking && /* @__PURE__ */ jsxs2("span", { className: "text-[10px] font-black text-white/60 tabular-nums", children: [
                    Math.round(scene.localPercent || 0),
                    "%"
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2.5 relative z-10", children: [
                  /* @__PURE__ */ jsxs2("div", { className: "bg-[#050505] border border-white/5 rounded-xl overflow-hidden shadow-xl relative group/media", children: [
                    /* @__PURE__ */ jsxs2("div", { className: `relative bg-black flex items-center justify-center overflow-hidden ${aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16]"}`, children: [
                      scene.videoBase64 ? /* @__PURE__ */ jsx2("video", { src: `data:video/mp4;base64,${scene.videoBase64}`, controls: true, className: "w-full h-full object-contain" }) : scene.imageBase64 ? /* @__PURE__ */ jsx2("img", { src: `data:image/png;base64,${scene.imageBase64}`, className: "w-full h-full object-contain opacity-40 grayscale" }) : /* @__PURE__ */ jsx2("div", { className: `flex flex-col items-center gap-1.5 ${isWorking ? "animate-pulse" : ""}`, children: /* @__PURE__ */ jsx2("span", { className: `material-symbols-outlined text-[28px] ${scene.status === "healing" ? "text-orange-500" : scene.status === "generating" || scene.status === "retrying" ? "text-pink-500" : "text-white/5"}`, children: scene.status === "healing" ? "health_and_safety" : scene.status === "generating" || scene.status === "retrying" ? "sync" : "videocam" }) }),
                      isWorking && /* @__PURE__ */ jsxs2("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center", children: [
                        /* @__PURE__ */ jsx2("p", { className: "text-[8px] font-black text-pink-500 uppercase tracking-widest mb-1", children: scene.currentAttempt && scene.maxAttempts && scene.currentAttempt > 0 ? `\u0110ANG QUAY [${scene.currentAttempt}/${scene.maxAttempts}]` : scene.localStatusDetail }),
                        scene.localRetryCountdown !== null && /* @__PURE__ */ jsx2("div", { className: "flex flex-col items-center gap-1 mt-2", children: /* @__PURE__ */ jsxs2("div", { className: "relative w-12 h-12 flex items-center justify-center", children: [
                          /* @__PURE__ */ jsxs2("svg", { className: "absolute inset-0 w-full h-full -rotate-90", children: [
                            /* @__PURE__ */ jsx2("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2", fill: "transparent", className: "text-white/10" }),
                            /* @__PURE__ */ jsx2("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2", fill: "transparent", className: "text-pink-500 transition-all duration-1000", strokeDasharray: 126, strokeDashoffset: 126 - 126 * (scene.localRetryCountdown || 0) / retryDelay })
                          ] }),
                          /* @__PURE__ */ jsxs2("p", { className: "text-[18px] font-black text-white tabular-nums", children: [
                            scene.localRetryCountdown,
                            "s"
                          ] })
                        ] }) }),
                        /* @__PURE__ */ jsx2("div", { className: "w-16 h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden", children: /* @__PURE__ */ jsx2("div", { className: "h-full bg-pink-500 transition-all duration-500", style: { width: `${scene.localPercent}%` } }) })
                      ] })
                    ] }),
                    (renderFromShotOnly || isStoryboardCropEnabled) && /* @__PURE__ */ jsxs2("div", { className: "p-1.5 flex items-center gap-1 bg-black/60 border-t border-white/5 overflow-x-auto dark-scrollbar", children: [
                      scene.shotImages?.map((shot, sIdx) => /* @__PURE__ */ jsxs2("div", { className: "w-12 h-12 shrink-0 rounded border border-white/10 overflow-hidden relative group/shot", children: [
                        shot.status === "generating" ? /* @__PURE__ */ jsx2("div", { className: "w-full h-full flex items-center justify-center bg-white/5 animate-pulse", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px] text-emerald-500", children: "sync" }) }) : /* @__PURE__ */ jsx2("img", { src: `data:image/png;base64,${shot.base64}`, className: "w-full h-full object-cover" }),
                        /* @__PURE__ */ jsx2("div", { className: "absolute top-0 left-0 bg-black/60 px-0.5 text-[6px] font-black z-10", children: sIdx + 1 }),
                        /* @__PURE__ */ jsxs2("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover/shot:opacity-100 flex items-center justify-center gap-1 transition-opacity z-20", children: [
                          /* @__PURE__ */ jsx2("button", { onClick: () => generateSingleShot(scene.id, sIdx), className: "w-5 h-5 flex items-center justify-center bg-emerald-600 rounded-full hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px]", children: "refresh" }) }),
                          /* @__PURE__ */ jsx2("button", { onClick: () => uploadShot(scene.id, sIdx), className: "w-5 h-5 flex items-center justify-center bg-blue-600 rounded-full hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px]", children: "upload" }) }),
                          /* @__PURE__ */ jsx2("button", { onClick: () => deleteShot(scene.id, shot.id), className: "w-5 h-5 flex items-center justify-center bg-red-600 rounded-full hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[12px]", children: "close" }) })
                        ] })
                      ] }, shot.id)),
                      !isStoryboardCropEnabled && (!scene.shotImages || scene.shotImages.length < 99) && /* @__PURE__ */ jsxs2(
                        "button",
                        {
                          onClick: () => generateSingleShot(scene.id),
                          className: "w-12 h-12 shrink-0 rounded border border-dashed border-emerald-500/30 flex flex-col items-center justify-center gap-0.5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/60 transition-all",
                          children: [
                            /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "add" }),
                            /* @__PURE__ */ jsx2("span", { className: "text-[6px] font-black uppercase", children: "Add Shot" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs2("div", { className: "p-1.5 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx2(PillButton, { variant: scene.status === "done" ? "outline" : "filled", onClick: () => renderScene(scene.id), disabled: isWorking || isBatchRendering && !isPaused, className: "!h-[24px] !text-[9px] flex-1", children: scene.status === "healing" ? "S\u1EECA..." : scene.status === "generating" || scene.status === "retrying" ? "QUAY..." : scene.status === "done" ? "QUAY L\u1EA0I" : "B\u1EAET \u0110\u1EA6U" }),
                      /* @__PURE__ */ jsx2(
                        "button",
                        {
                          type: "button",
                          onClick: () => generateStoryboard(scene.id),
                          title: "T\u1EA1o l\u1EA1i \u1EA3nh",
                          disabled: isStoryboardWorking,
                          className: "w-7 h-[24px] flex items-center justify-center rounded-lg border border-[#595959] text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0 disabled:opacity-50",
                          children: /* @__PURE__ */ jsx2("span", { className: `material-symbols-outlined text-[14px] ${isStoryboardWorking ? "animate-spin text-pink-400" : ""}`, children: "refresh" })
                        }
                      ),
                      /* @__PURE__ */ jsx2(
                        "button",
                        {
                          type: "button",
                          onClick: () => uploadStoryboard(scene.id),
                          title: "T\u1EA3i l\xEAn \u1EA3nh",
                          className: "w-7 h-[24px] flex items-center justify-center rounded-lg border border-[#595959] text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0",
                          children: /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[14px]", children: "upload" })
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx2("textarea", { value: scene.rawText, onChange: (e) => updateSceneText(scene.id, e.target.value), className: "w-full h-14 bg-white/5 border border-white/10 rounded-lg p-2 text-[9px] text-white/50 italic outline-none resize-none focus:text-white transition-colors", placeholder: "N\u1ED9i dung k\u1ECBch b\u1EA3n..." }),
                  (matchedActors.length > 0 || matchedLocations.length > 0) && /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-1 items-center pt-1 border-t border-white/5", children: [
                    matchedActors.map((a) => /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1 bg-pink-500/10 border border-pink-500/20 px-1 py-0.5 rounded cursor-help", children: [
                      /* @__PURE__ */ jsx2("img", { src: `data:${a.mimeType};base64,${a.base64}`, className: "w-3 h-3 rounded-full object-cover" }),
                      /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-black text-pink-400 uppercase truncate max-w-[50px]", children: a.name }),
                      a.voiceMediaId && /* @__PURE__ */ jsx2("span", { className: "material-symbols-outlined text-[8px] text-white/50", children: "mic" })
                    ] }, a.id)),
                    matchedLocations.map((l) => /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-1 py-0.5 rounded cursor-help", children: [
                      /* @__PURE__ */ jsx2("img", { src: `data:${l.mimeType};base64,${l.base64}`, className: "w-3 h-3 rounded-full object-cover" }),
                      /* @__PURE__ */ jsx2("span", { className: "text-[7px] font-black text-blue-400 uppercase truncate max-w-[50px]", children: l.name })
                    ] }, l.id))
                  ] })
                ] })
              ] }, scene.id);
            })
          }
        )
      ] })
    ] })
  ] });
}
function App() {
  const cleanAuth = {
    authState: {
      isAuthorized: true,
      plan: "ULTRA ELITE (CLEAN)",
      features: ["*"],
      licenseId: "UNLIMITED-LIFETIME",
      remainingTime: "VĨNH VIỄN",
      serverTimeDisplay: "CLEAN EDITION",
      deviceId: "FLOW-PRO-STUDIO",
      isSyncing: false,
      syncError: false
    },
    getDeviceId: async () => "FLOW-PRO-STUDIO",
    verify: async () => true,
    logout: () => {},
    checkExpiryWithGemini: async () => true,
    performInitialSync: async () => {}
  };
  return /* @__PURE__ */ jsx2(MainAppContent, { auth: cleanAuth });
}
export {
  MainAppContent,
  App as default
};
