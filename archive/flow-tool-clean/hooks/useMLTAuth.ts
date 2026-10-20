// virtual:hooks/useMLTAuth.ts
import { useState, useEffect } from "react";
import { Flow } from "flow-sdk";
var PUBLIC_KEY_JWK = {
  kty: "EC",
  crv: "P-256",
  x: "GH0F9f42PUQUVYAy3wPkqalTRiBXBgLf-lTjlsi8_kM",
  y: "Bx6z_YEjJxUfCuPJFkDjflHGN8DVBfP5i7J2k7sxk3Q",
  ext: true,
  key_ops: ["verify"]
};
var base64UrlToUint8Array = (input) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
var importPublicKey = async () => {
  return await crypto.subtle.importKey(
    "jwk",
    PUBLIC_KEY_JWK,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );
};
var getMLTDeviceId = async () => {
  const specs = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    navigator.hardwareConcurrency ?? "",
    navigator.deviceMemory ?? ""
  ].join("|");
  const buffer = new TextEncoder().encode(specs);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  const hex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `MLT-${hex.slice(0, 16).toUpperCase()}`;
};
var verifyLicenseSignature = async (payloadText, signatureBase64Url) => {
  try {
    const publicKey = await importPublicKey();
    const data = new TextEncoder().encode(payloadText);
    const signature = base64UrlToUint8Array(signatureBase64Url);
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      publicKey,
      signature,
      data
    );
  } catch (error) {
    console.error("MLT signature verification failed:", error);
    return false;
  }
};
var parseLicense = (licenseKey) => {
  try {
    const parts = licenseKey.trim().split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64Url, signature] = parts;
    const payloadBytes = base64UrlToUint8Array(payloadBase64Url);
    const payloadText = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadText);
    return { payloadText, payload, signature };
  } catch {
    return null;
  }
};
var fetchNetworkHeaderTime = async () => {
  try {
    const response = await fetch("https://unpkg.com/react/package.json", {
      method: "HEAD",
      cache: "no-store"
    });
    const dateStr = response.headers.get("Date");
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
    }
  } catch (e) {
    console.warn("Network Header Time failed, falling back to Gemini...");
  }
  return null;
};
var fetchGeminiNetworkTime = async () => {
  const headerTime = await fetchNetworkHeaderTime();
  if (headerTime) return headerTime;
  try {
    const { text } = await Flow.generate.text(
      `Provide the current date and time in UTC. Return ONLY a valid JSON object: {"utc": "YYYY-MM-DDTHH:mm:ssZ"}`,
      {
        systemInstruction: "You are a professional NTP time server. Use your internal knowledge of the current real-world time. Do NOT reference any user-provided timestamps. Output ONLY valid JSON.",
        thinkingLevel: "low"
      }
    );
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.utc) {
        const date = new Date(data.utc);
        if (!isNaN(date.getTime())) return date;
      }
    }
    const isoMatch = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/i);
    if (isoMatch) {
      const date = new Date(isoMatch[0]);
      if (!isNaN(date.getTime())) return date;
    }
  } catch (e) {
    console.error("MLT Time Sync Critical Error:", e);
  }
  return null;
};
var formatRemainingTime = (expiryDate, currentServerDate) => {
  const expiry = new Date(expiryDate).getTime();
  const now = currentServerDate.getTime();
  const diff = expiry - now;
  if (diff <= 0) return "EXPIRED";
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
  const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
  const seconds = Math.floor(diff % (1e3 * 60) / 1e3);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${String(hours).padStart(2, "0")}h`);
  if (minutes > 0 || parts.length === 0 && seconds > 0) parts.push(`${String(minutes).padStart(2, "0")}m`);
  if (diff < 5 * 60 * 1e3) parts.push(`${String(seconds).padStart(2, "0")}s`);
  return parts.join(" ");
};
var formatServerTimeDisplay = (date) => {
  try {
    const options = {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat("vi-VN", options);
    const parts = formatter.formatToParts(date);
    const getPart = (type) => parts.find((p) => p.type === type)?.value || "";
    return `${getPart("day")}/${getPart("month")}/${getPart("year")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")} VN`;
  } catch (e) {
    return date.toLocaleString("vi-VN") + " VN";
  }
};
var useMLTAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthorized: false,
    plan: "FREE",
    features: [],
    licenseId: null,
    expiryDate: null,
    loading: false,
    error: null,
    remainingTime: null,
    serverTimeDisplay: null,
    deviceId: null,
    networkBaseTime: null,
    performanceBaseTime: null,
    isSyncing: false,
    syncError: false
  });
  const performInitialSync = async (retries = 3) => {
    setAuthState((prev) => ({ ...prev, isSyncing: true, syncError: false }));
    for (let i = 0; i < retries; i++) {
      const serverTime = await fetchGeminiNetworkTime();
      if (serverTime) {
        setAuthState((prev) => ({
          ...prev,
          networkBaseTime: serverTime.getTime(),
          performanceBaseTime: performance.now(),
          serverTimeDisplay: formatServerTimeDisplay(serverTime),
          isSyncing: false,
          syncError: false
        }));
        return;
      }
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 2e3));
    }
    setAuthState((prev) => ({ ...prev, isSyncing: false, syncError: true }));
  };
  useEffect(() => {
    performInitialSync();
  }, []);
  useEffect(() => {
    if (authState.networkBaseTime === null || authState.performanceBaseTime === null) return;
    const interval = setInterval(() => {
      const elapsedSinceSync = performance.now() - (authState.performanceBaseTime || 0);
      const currentServerTime = new Date(authState.networkBaseTime + elapsedSinceSync);
      if (authState.isAuthorized && authState.expiryDate) {
        const expiry = new Date(authState.expiryDate).getTime();
        if (currentServerTime.getTime() >= expiry) {
          setAuthState((prev) => ({
            ...prev,
            isAuthorized: false,
            remainingTime: "EXPIRED",
            plan: "FREE",
            error: "LICENSE_EXPIRED"
          }));
          clearInterval(interval);
          return;
        }
      }
      setAuthState((prev) => {
        const nextRemaining = prev.expiryDate ? formatRemainingTime(prev.expiryDate, currentServerTime) : null;
        const nextDisplay = formatServerTimeDisplay(currentServerTime);
        if (nextRemaining === prev.remainingTime && nextDisplay === prev.serverTimeDisplay) return prev;
        return { ...prev, remainingTime: nextRemaining, serverTimeDisplay: nextDisplay };
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [authState.isAuthorized, authState.expiryDate, authState.networkBaseTime, authState.performanceBaseTime]);
  const getDeviceId = async () => {
    const id = await getMLTDeviceId();
    setAuthState((prev) => ({ ...prev, deviceId: id }));
    return id;
  };
  const logout = () => {
    setAuthState((prev) => ({
      ...prev,
      isAuthorized: false,
      plan: "FREE",
      features: [],
      licenseId: null,
      expiryDate: null,
      loading: false,
      error: null,
      remainingTime: null,
      serverTimeDisplay: null,
      networkBaseTime: null,
      performanceBaseTime: null,
      isSyncing: false,
      syncError: false
    }));
  };
  const verify = async (licenseKey) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null, isSyncing: true }));
    try {
      const parsed = parseLicense(licenseKey);
      const partsArr = licenseKey.trim().split(".");
      if (partsArr.length !== 2 || !parsed) throw new Error("LICENSE_FORMAT_INVALID");
      const { payloadText, payload, signature } = parsed;
      const signatureValid = await verifyLicenseSignature(payloadText, signature);
      if (!signatureValid) throw new Error("LICENSE_SIGNATURE_INVALID");
      const currentDeviceId = authState.deviceId || await getMLTDeviceId();
      if (payload.deviceId !== currentDeviceId) throw new Error("DEVICE_NOT_MATCH");
      const serverTime = await fetchGeminiNetworkTime();
      if (!serverTime) throw new Error("NETWORK_TIME_ERROR");
      const expiry = new Date(payload.expiryDate);
      if (serverTime.getTime() >= expiry.getTime()) throw new Error("LICENSE_EXPIRED");
      setAuthState((prev) => ({
        ...prev,
        isAuthorized: true,
        plan: payload.plan,
        features: Array.isArray(payload.features) ? payload.features : [],
        licenseId: payload.licenseId,
        expiryDate: payload.expiryDate,
        loading: false,
        error: null,
        isSyncing: false,
        syncError: false,
        networkBaseTime: serverTime.getTime(),
        performanceBaseTime: performance.now(),
        remainingTime: formatRemainingTime(payload.expiryDate, serverTime),
        serverTimeDisplay: formatServerTimeDisplay(serverTime)
      }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "LICENSE_VERIFICATION_FAILED";
      setAuthState((prev) => ({ ...prev, isAuthorized: false, loading: false, error: message, isSyncing: false }));
      return false;
    }
  };
  const checkExpiryWithGemini = async () => {
    if (!authState.isAuthorized || !authState.expiryDate) return false;
    setAuthState((prev) => ({ ...prev, isSyncing: true }));
    const serverTime = await fetchGeminiNetworkTime();
    setAuthState((prev) => ({ ...prev, isSyncing: false }));
    if (!serverTime) return true;
    const expiry = new Date(authState.expiryDate);
    if (serverTime.getTime() >= expiry.getTime()) {
      logout();
      return false;
    }
    setAuthState((prev) => ({
      ...prev,
      networkBaseTime: serverTime.getTime(),
      performanceBaseTime: performance.now(),
      remainingTime: formatRemainingTime(prev.expiryDate, serverTime),
      serverTimeDisplay: formatServerTimeDisplay(serverTime)
    }));
    return true;
  };
  return { authState, verify, getDeviceId, logout, checkExpiryWithGemini, performInitialSync };
};

