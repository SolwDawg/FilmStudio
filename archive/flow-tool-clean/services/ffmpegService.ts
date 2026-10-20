// virtual:services/ffmpegService.ts
import { toBlobURL } from "@ffmpeg/util";
var MSG = {
  LOAD: "LOAD",
  EXEC: "EXEC",
  WRITE_FILE: "WRITE_FILE",
  READ_FILE: "READ_FILE",
  DELETE_FILE: "DELETE_FILE",
  ERROR: "ERROR",
  LOG: "LOG",
  PROGRESS: "PROGRESS"
};
class FFmpegService {
  worker: Worker | null = null;
  loaded: boolean = false;
  msgId: number = 0;
  callbacks: Map<number, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();
  logCb: ((msg: string) => void) | null = null;
  progressCb: ((p: any) => void) | null = null;

  async load(onLog) {
    if (this.loaded && this.worker) return;
    this.logCb = onLog || null;
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    const workerBlob = this.buildWorkerBlob();
    this.worker = new Worker(workerBlob);
    this.worker.onmessage = ({ data: { id, type, data } }) => {
      if (type === MSG.LOG) {
        this.logCb?.(data?.message || "");
        return;
      }
      if (type === MSG.PROGRESS) {
        this.progressCb?.(data);
        return;
      }
      if (type === MSG.ERROR) {
        const cb2 = this.callbacks.get(id);
        if (cb2) {
          this.callbacks.delete(id);
          cb2.reject(new Error(data));
        }
        return;
      }
      const cb = this.callbacks.get(id);
      if (cb) {
        this.callbacks.delete(id);
        cb.resolve(data);
      }
    };
    await this.send(MSG.LOAD, { coreURL, wasmURL });
    this.loaded = true;
  }
  send(type, data) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, data });
    });
  }
  buildWorkerBlob() {
    const script = `
var MSG = {
  LOAD: "LOAD", EXEC: "EXEC",
  WRITE_FILE: "WRITE_FILE", READ_FILE: "READ_FILE",
  DELETE_FILE: "DELETE_FILE", ERROR: "ERROR",
  LOG: "LOG", PROGRESS: "PROGRESS",
};

var ffmpeg = null;

var load = function(opts) {
  importScripts(opts.coreURL);
  if (!self.createFFmpegCore) {
    throw new Error("failed to import ffmpeg-core.js");
  }
  return self.createFFmpegCore({
    mainScriptUrlOrBlob: opts.coreURL
      + "#" + btoa(JSON.stringify({ wasmURL: opts.wasmURL })),
    // N\xE2ng c\u1EA5p c\u1EA5u h\xECnh b\u1ED9 nh\u1EDB n\u1EBFu build cho ph\xE9p
    TOTAL_MEMORY: 1024 * 1024 * 1024, // 1GB hint
  }).then(function(core) {
    ffmpeg = core;
    ffmpeg.setLogger(function(data) {
      self.postMessage({ type: MSG.LOG, data: data });
    });
    ffmpeg.setProgress(function(data) {
      self.postMessage({ type: MSG.PROGRESS, data: data });
    });
    return true;
  });
};

self.onmessage = function(e) {
  var id = e.data.id;
  var type = e.data.type;
  var _data = e.data.data;
  var trans = [];
  var data;

  var handleResult = function(result) {
    data = result;
    if (data instanceof Uint8Array) trans.push(data.buffer);
    self.postMessage({ id: id, type: type, data: data }, trans);
  };

  var handleError = function(err) {
    self.postMessage({
      id: id, type: MSG.ERROR, data: err.toString()
    });
  };

  try {
    if (type !== MSG.LOAD && !ffmpeg) {
      handleError(new Error("ffmpeg is not loaded"));
      return;
    }
    switch (type) {
      case MSG.LOAD:
        load(_data).then(handleResult).catch(handleError);
        return;
      case MSG.EXEC:
        ffmpeg.setTimeout(_data.timeout || -1);
        ffmpeg.exec.apply(ffmpeg, _data.args);
        data = ffmpeg.ret;
        // Lu\xF4n reset sau khi th\u1EF1c thi \u0111\u1EC3 gi\u1EA3i ph\xF3ng b\u1ED9 nh\u1EDB l\u1EC7nh
        ffmpeg.reset();
        break;
      case MSG.WRITE_FILE:
        ffmpeg.FS.writeFile(_data.path, _data.data);
        data = true;
        break;
      case MSG.READ_FILE:
        data = ffmpeg.FS.readFile(_data.path);
        break;
      case MSG.DELETE_FILE:
        try {
          ffmpeg.FS.unlink(_data.path);
          data = true;
        } catch(e) {
          data = false; // T\u1EC7p kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c l\u1ED7i FS nh\u1EB9
        }
        break;
      default:
        handleError(new Error("unknown message type: " + type));
        return;
    }
  } catch (err) {
    handleError(err);
    return;
  }
  if (data instanceof Uint8Array) trans.push(data.buffer);
  self.postMessage({ id: id, type: type, data: data }, trans);
};
`;
    return URL.createObjectURL(new Blob([script], { type: "text/javascript" }));
  }
  async exec(args) {
    if (!this.worker) throw new Error("FFmpeg not loaded");
    return this.send(MSG.EXEC, { args, timeout: -1 });
  }
  async writeFile(name, data) {
    if (!this.worker) throw new Error("FFmpeg not loaded");
    return this.send(MSG.WRITE_FILE, { path: name, data });
  }
  async readFile(name) {
    if (!this.worker) throw new Error("FFmpeg not loaded");
    return this.send(MSG.READ_FILE, { path: name });
  }
  async deleteFile(name) {
    if (!this.worker) throw new Error("FFmpeg not loaded");
    return this.send(MSG.DELETE_FILE, { path: name });
  }
  onProgress(cb) {
    this.progressCb = cb;
  }
};
const ffmpegService = new FFmpegService();
export { ffmpegService, FFmpegService };
