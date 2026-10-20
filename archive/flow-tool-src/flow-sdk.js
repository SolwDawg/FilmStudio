
/**
 * @fileoverview Flow SDK that runs inside the applet iframe.
 *
 * This file is compiled to JavaScript and inlined into the applet iframe
 * via an import map pointing to a data URL of the compiled code.
 *
 * Keep this file self-contained. Do not import any google3 modules
 * as they will not be available in the sandboxed iframe.
 * Keep public SDK interfaces and defaults in sync with the Applet Agent prompt
 * docs under //labs/media/flow/agents/prompts/flow_sdk_*.md.
 */
/** Supported media asset types in the Flow SDK. */
const MEDIA_TYPES = ['image', 'video', 'audio'];
/** Supported media filter types in the Flow SDK. */
const MEDIA_FILTERS = ['image', 'video', 'audio', 'all'];
/** CSS class applied to an active drop target element during drag-over. */
const DROP_TARGET_ACTIVE_CLASS = 'flow-drop-target-active';
/** HTML attribute for declarative drop targets. */
const DATA_DROP_TARGET_ATTR = 'data-flow-drop-target';
/** HTML attribute for declarative drop zones. */
const DATA_DROP_ZONE_ATTR = 'data-flow-drop-zone';
/** HTML attribute for declarative drop target accepted media type. */
const DATA_DROP_ACCEPT_ATTR = 'data-flow-accept';
const idToPendingRequest = new Map();
let requestId = 0;
let port = null;
let portPromise = null;
const dropListeners = new Set();
const registeredDropTargets = new Set();
let currentHoveredDropTargetElement = null;
let currentHoveredDropTargetOptions = null;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function checkExhaustive(value) {
    throw new Error('Unhandled case: ' + String(value));
}
function assertString(value, name) {
    if (typeof value !== 'string') {
        throw new Error('Expected string for ' + name + ', got ' + typeof value);
    }
    return value;
}
function assertNumber(value, name) {
    if (typeof value !== 'number') {
        throw new Error('Expected number for ' + name + ', got ' + typeof value);
    }
    return value;
}
function assertImageBitmap(value) {
    if (!(value instanceof ImageBitmap)) {
        throw new Error('Expected ImageBitmap, got ' + typeof value);
    }
    return value;
}
function isStorageValue(value) {
    if (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean') {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every((item) => item === null || item === undefined || isStorageValue(item));
    }
    if (isRecord(value)) {
        return Object.values(value).every((item) => item === null || item === undefined || isStorageValue(item));
    }
    return false;
}
function assertStorageValueOrNull(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (isStorageValue(value)) {
        return value;
    }
    throw new Error('Expected serializable StorageValue, got ' + typeof value);
}
function assertStringArray(value) {
    if (!Array.isArray(value)) {
        throw new Error('Expected array response for storage keys');
    }
    const result = [];
    for (const item of value) {
        if (typeof item !== 'string') {
            throw new Error('Expected string in storage keys array');
        }
        result.push(item);
    }
    return result;
}
function assertIdResponse(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response with id');
    }
    return {
        id: assertString(value['id'], 'id'),
    };
}
function assertGenerateResult(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response with media fields');
    }
    return {
        mediaId: assertString(value['mediaId'], 'mediaId'),
        base64: assertString(value['base64'], 'base64'),
        mimeType: assertString(value['mimeType'], 'mimeType'),
    };
}
function assertMediaType(value) {
    const normalized = typeof value === 'string' ? value.toLowerCase() : value;
    if (normalized === 'image' ||
        normalized === 'video' ||
        normalized === 'audio') {
        return normalized;
    }
    if (typeof normalized === 'string') {
        if (normalized.startsWith('image'))
            return 'image';
        if (normalized.startsWith('video'))
            return 'video';
        if (normalized.startsWith('audio'))
            return 'audio';
    }
    return 'image';
}
function assertMediaItem(value) {
    const item = Array.isArray(value) ? value[0] : value;
    if (!isRecord(item)) {
        throw new Error('Expected object response for MediaItem');
    }
    const mediaId = item['mediaId'] ?? item['id'];
    const base64 = item['base64'] ?? item['data'] ?? '';
    const mimeType = item['mimeType'] ?? item['type'] ?? '';
    const name = item['name'] ?? item['title'] ?? item['displayName'] ?? '';
    const rawType = item['type'] ?? item['mediaType'] ?? 'image';
    return {
        mediaId: assertString(mediaId, 'mediaId'),
        base64: assertString(base64, 'base64'),
        mimeType: assertString(mimeType, 'mimeType'),
        type: assertMediaType(rawType),
        name: assertString(name, 'name'),
    };
}
function assertMediaGetBase64Result(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response with base64 and mimeType');
    }
    return {
        base64: assertString(value['base64'], 'base64'),
        mimeType: assertString(value['mimeType'], 'mimeType'),
    };
}
function assertGenTextResult(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response for TextGenerateResult');
    }
    return {
        text: assertString(value['text'], 'text'),
    };
}
function assertCameraCaptureResult(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response for CameraCaptureResult');
    }
    return {
        base64: assertString(value['base64'], 'base64'),
        mimeType: assertString(value['mimeType'], 'mimeType'),
        width: assertNumber(value['width'], 'width'),
        height: assertNumber(value['height'], 'height'),
    };
}
function assertCameraStreamResponse(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response for CameraStreamResponse');
    }
    return {
        streamId: assertString(value['streamId'], 'streamId'),
        width: assertNumber(value['width'], 'width'),
        height: assertNumber(value['height'], 'height'),
    };
}
function assertMicrophoneRecordResult(value) {
    if (!isRecord(value)) {
        throw new Error('Expected object response for MicrophoneRecordResult');
    }
    return {
        base64: assertString(value['base64'], 'base64'),
        mimeType: assertString(value['mimeType'], 'mimeType'),
        durationMs: assertNumber(value['durationMs'], 'durationMs'),
    };
}
function getPort() {
    if (port)
        return Promise.resolve(port);
    if (portPromise)
        return portPromise;
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Window is undefined'));
    }
    if (!window['FLOW_PARENT_ORIGIN']) {
        return Promise.reject(new Error('window.FLOW_PARENT_ORIGIN is required'));
    }
    const existingPort = window['FLOW_PORT'];
    if (existingPort) {
        port = existingPort;
        setupPortListener(port);
        return Promise.resolve(port);
    }
    portPromise = new Promise((resolve, reject) => {
        const listener = () => {
            window.removeEventListener('flow_port_ready', listener);
            portPromise = null;
            const flowPort = window['FLOW_PORT'];
            if (!flowPort) {
                reject(new Error('FLOW_PORT is not available'));
                return;
            }
            port = flowPort;
            setupPortListener(port);
            resolve(port);
        };
        window.addEventListener('flow_port_ready', listener);
    });
    return portPromise;
}
function clearHoveredDropTarget() {
    if (currentHoveredDropTargetElement) {
        currentHoveredDropTargetElement.classList.remove(DROP_TARGET_ACTIVE_CLASS);
    }
    if (currentHoveredDropTargetOptions?.onHoverChange) {
        try {
            currentHoveredDropTargetOptions.onHoverChange(false);
        }
        catch {
            // Ignored: user-supplied callback error.
        }
    }
    currentHoveredDropTargetElement = null;
    currentHoveredDropTargetOptions = null;
}
function isMediaFilter(value) {
    return (value === 'image' ||
        value === 'video' ||
        value === 'audio' ||
        value === 'all');
}
function parseFilterAttribute(value) {
    if (!value)
        return undefined;
    const normalized = value.toLowerCase().trim();
    return isMediaFilter(normalized) ? normalized : undefined;
}
function findDropTarget(element) {
    if (!element)
        return null;
    let currentElement = element;
    while (currentElement) {
        for (const target of registeredDropTargets) {
            if (target.element === currentElement) {
                const declarativeFilter = parseFilterAttribute(currentElement.getAttribute(DATA_DROP_ACCEPT_ATTR));
                return {
                    element: target.element,
                    options: target.options,
                    targetId: target.options.id,
                    filter: target.options.filter ?? declarativeFilter ?? 'all',
                };
            }
        }
        const declarativeId = currentElement.getAttribute(DATA_DROP_TARGET_ATTR) ??
            currentElement.getAttribute(DATA_DROP_ZONE_ATTR);
        if (declarativeId !== null) {
            const declarativeFilter = parseFilterAttribute(currentElement.getAttribute(DATA_DROP_ACCEPT_ATTR));
            return {
                element: currentElement,
                targetId: declarativeId || undefined,
                filter: declarativeFilter ?? 'all',
            };
        }
        currentElement = currentElement.parentElement;
    }
    return null;
}
function isMediaTypeAccepted(mediaType, filter) {
    if (!mediaType) {
        return true;
    }
    switch (filter) {
        case 'image':
            return mediaType === 'image';
        case 'video':
            return mediaType === 'video';
        case 'audio':
            return mediaType === 'audio';
        case 'all':
        case undefined:
            return true;
        default:
            return checkExhaustive(filter);
    }
}
function updateHoveredDropTarget({ x, y, mediaType, }) {
    if (typeof document === 'undefined')
        return;
    const elementAtPoint = document.elementFromPoint(x, y);
    const found = findDropTarget(elementAtPoint);
    if (!found || !isMediaTypeAccepted(mediaType, found.filter)) {
        clearHoveredDropTarget();
        return;
    }
    if (currentHoveredDropTargetElement !== found.element) {
        clearHoveredDropTarget();
        currentHoveredDropTargetElement = found.element;
        currentHoveredDropTargetOptions = found.options ?? null;
        found.element.classList.add(DROP_TARGET_ACTIVE_CLASS);
        if (found.options?.onHoverChange) {
            try {
                found.options.onHoverChange(true);
            }
            catch {
                // Ignored: user-supplied callback error.
            }
        }
    }
}
function isFlowHostToIframeMessage(data) {
    if (!isRecord(data))
        return false;
    const type = data['type'];
    return (type === 'FLOW_DRAG_OVER' ||
        type === 'FLOW_DRAG_LEAVE' ||
        type === 'FLOW_MEDIA_DROPPED' ||
        type === 'FLOW_RESPONSE');
}
function setupPortListener(p) {
    p.onmessage = (event) => {
        if (!isFlowHostToIframeMessage(event.data)) {
            return;
        }
        const data = event.data;
        switch (data.type) {
            case 'FLOW_DRAG_OVER': {
                if (typeof data.x === 'number' && typeof data.y === 'number') {
                    updateHoveredDropTarget({
                        x: data.x,
                        y: data.y,
                        mediaType: data.mediaType,
                    });
                }
                return;
            }
            case 'FLOW_DRAG_LEAVE': {
                clearHoveredDropTarget();
                return;
            }
            case 'FLOW_MEDIA_DROPPED': {
                try {
                    const rawMedia = data.media;
                    if (rawMedia && isRecord(rawMedia)) {
                        const item = assertMediaItem(rawMedia);
                        const x = typeof data.x === 'number' ? data.x : undefined;
                        const y = typeof data.y === 'number' ? data.y : undefined;
                        let targetInfo = null;
                        if (x !== undefined &&
                            y !== undefined &&
                            typeof document !== 'undefined') {
                            const dropElement = document.elementFromPoint(x, y);
                            targetInfo = findDropTarget(dropElement);
                        }
                        if (targetInfo &&
                            !isMediaTypeAccepted(item.type, targetInfo.filter)) {
                            void request('FLOW_SHOW_TOAST', {
                                'payload': {
                                    'code': 'INVALID_DROP_FILTER',
                                    'filter': targetInfo.filter ?? 'all',
                                    'type': 'warning',
                                },
                            }).catch(() => { });
                            return;
                        }
                        const dropContext = {
                            ...(targetInfo?.targetId ? { targetId: targetInfo.targetId } : {}),
                            ...(x !== undefined ? { x } : {}),
                            ...(y !== undefined ? { y } : {}),
                        };
                        if (targetInfo?.options?.onDrop) {
                            try {
                                targetInfo.options.onDrop(item, dropContext);
                            }
                            catch {
                                // Ignored: user-supplied callback error.
                            }
                        }
                        for (const listener of dropListeners) {
                            try {
                                listener(item, dropContext);
                            }
                            catch {
                                // Ignored: user-supplied callback error.
                            }
                        }
                    }
                }
                catch {
                    // Ignored: invalid media payload.
                }
                finally {
                    clearHoveredDropTarget();
                }
                return;
            }
            case 'FLOW_RESPONSE': {
                const id = data.id;
                const payload = data.payload;
                const error = data.error;
                if (typeof id !== 'number' || !idToPendingRequest.has(id)) {
                    return;
                }
                const entry = idToPendingRequest.get(id);
                if (!entry)
                    return;
                idToPendingRequest.delete(id);
                if (error !== undefined) {
                    const message = typeof error === 'string' && error.trim()
                        ? error
                        : 'Service temporarily unavailable. Please try again.';
                    entry.reject(new Error(message));
                }
                else {
                    entry.resolve(payload);
                }
                return;
            }
            default: {
                return checkExhaustive(data);
            }
        }
    };
}
// This function intentionally avoids async/await to fix a
// build-time instrumentation issue (tsickle/AsyncContext) that can cause
// problems in the sandboxed iframe environment.
function request(type, data = {}) {
    return getPort().then((port) => new Promise((resolve, reject) => {
        const id = ++requestId;
        idToPendingRequest.set(id, {
            resolve,
            reject,
            type,
        });
        port.postMessage({ type, ...data, id });
    }));
}
if (typeof window !== 'undefined') {
    // Trigger eager port retrieval
    getPort().catch(() => { });
}
/**
 * SDK exposing Flow host functionality to the applet.
 */
const FLOW = {
    media: {
        select(options) {
            const opts = typeof options === 'string' ? { id: options } : (options ?? {});
            return request('FLOW_SELECT_MEDIA', {
                'payload': {
                    'preSelectId': opts.id,
                    'filter': opts.filter ?? 'all',
                },
            }).then((response) => {
                if (response === null || response === undefined) {
                    return null;
                }
                return assertMediaItem(response);
            });
        },
        selectMultiple(options) {
            const opts = typeof options === 'number' ? { maxCount: options } : (options ?? {});
            return request('FLOW_SELECT_MEDIA_MULTI', {
                'payload': {
                    'maxCount': opts.maxCount,
                    'filter': opts.filter ?? 'all',
                    'preSelectedIds': opts.preSelectedIds,
                },
            }).then((response) => {
                if (!response) {
                    return [];
                }
                if (!Array.isArray(response)) {
                    if (!isRecord(response)) {
                        throw new Error('Expected array response');
                    }
                    return [assertMediaItem(response)];
                }
                return response.map(assertMediaItem);
            });
        },
        getBase64(options) {
            return request('FLOW_MEDIA_GET_BASE64', {
                'payload': { 'mediaId': options.mediaId },
            })
                .then(assertMediaGetBase64Result)
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_MEDIA_GET_BASE64, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
        onDrop(callback) {
            dropListeners.add(callback);
            return () => {
                dropListeners.delete(callback);
            };
        },
        registerDropTarget(options) {
            const { element } = options;
            const target = { element, options };
            registeredDropTargets.add(target);
            return () => {
                registeredDropTargets.delete(target);
                if (currentHoveredDropTargetElement === element) {
                    clearHoveredDropTarget();
                }
            };
        },
    },
    save(options) {
        return request('FLOW_SAVE', {
            'payload': {
                'base64': options.base64,
                'mimeType': options.mimeType,
                'name': options.name ?? "Sortie de la mini-appli",
            },
        })
            .then(assertIdResponse)
            .then((response) => ({
            mediaId: response.id,
        }));
    },
    upload(options) {
        return request('FLOW_UPLOAD', {
            'payload': {
                'base64': options.base64,
                'mimeType': options.mimeType,
                'name': options.name ?? "Sortie de la mini-appli",
            },
        })
            .then(assertIdResponse)
            .then((response) => ({
            mediaId: response.id,
        }));
    },
    download(options) {
        return request('FLOW_DOWNLOAD', {
            'payload': {
                'base64': options.base64,
                'mimeType': options.mimeType,
                'filename': options.filename,
            },
        }).then(() => ({ isSuccess: true }));
    },
    generate: {
        image(options) {
            return request('FLOW_GEN_IMAGE', {
                'payload': {
                    'prompt': options.prompt,
                    'modelDisplayName': options.modelDisplayName,
                    'referenceImageMediaIds': options.referenceImageMediaIds,
                    'aspectRatio': options.aspectRatio ?? '16:9',
                },
            }).then(assertGenerateResult);
        },
        video(options) {
            return request('FLOW_GEN_VIDEO', {
                'payload': {
                    'prompt': options.prompt,
                    'modelDisplayName': options.modelDisplayName,
                    'firstFrameImageMediaId': options.firstFrameImageMediaId,
                    'lastFrameImageMediaId': options.lastFrameImageMediaId,
                    'referenceImageMediaIds': options.referenceImageMediaIds,
                    'sourceVideoMediaId': options.sourceVideoMediaId,
                    'sourceVideoMode': options.sourceVideoMode,
                    'audioReferenceMediaIds': options.audioReferenceMediaIds,
                    'aspectRatio': options.aspectRatio,
                    'durationSeconds': options.durationSeconds,
                    'resolution': options.resolution,
                },
            }).then(assertGenerateResult);
        },
        videoExperimental(options) {
            return request('FLOW_GEN_VIDEO_EXPERIMENTAL', {
                'payload': {
                    'modelDisplayName': options.modelDisplayName,
                    'prompt': options.prompt,
                    'firstFrameImageMediaId': options.firstFrameImageMediaId,
                    'lastFrameImageMediaId': options.lastFrameImageMediaId,
                    'referenceImageMediaIds': options.referenceImageMediaIds,
                    'sourceVideoMediaId': options.sourceVideoMediaId,
                    'audioReferenceMediaIds': options.audioReferenceMediaIds,
                    'aspectRatio': options.aspectRatio ?? '16:9',
                    'experimentalSettings': options.experimentalSettings,
                    'experimentalMediaInputs': options.experimentalMediaInputs,
                },
            }).then(assertGenerateResult);
        },
        text(promptOrOptions, options) {
            let prompt;
            let opts;
            if (typeof promptOrOptions === 'string') {
                prompt = promptOrOptions;
                opts = options;
            }
            else if (promptOrOptions) {
                prompt = promptOrOptions.prompt;
                opts = promptOrOptions;
            }
            const payload = {
                'prompt': prompt ?? '',
                'systemInstruction': opts?.systemInstruction,
                'thinkingLevel': opts?.thinkingLevel,
                'images': opts?.images,
                'videos': opts?.videos,
                'audios': opts?.audios,
            };
            return request('FLOW_GEN_TEXT', {
                'payload': payload,
            }).then(assertGenTextResult);
        },
    },
    camera: {
        capture(options) {
            return request('FLOW_CAPTURE_CAMERA', {
                'payload': {
                    'facingMode': options?.facingMode ?? 'user',
                },
            }).then(assertCameraCaptureResult);
        },
        stream(options) {
            return request('FLOW_CAMERA_STREAM_START', {
                'payload': {
                    'facingMode': options?.facingMode ?? 'user',
                    'frameRate': options?.frameRate ?? 30,
                    'resolution': options?.resolution ?? 'medium',
                },
            })
                .then(assertCameraStreamResponse)
                .then((response) => {
                const streamId = response.streamId;
                const width = response.width;
                const height = response.height;
                let frameCallback = null;
                const frameListener = (event) => {
                    if (event.origin !== window['FLOW_PARENT_ORIGIN'])
                        return;
                    const data = isRecord(event.data) ? event.data : {};
                    if (data['type'] !== 'FLOW_CAMERA_FRAME' ||
                        data['streamId'] !== streamId) {
                        return;
                    }
                    if (data['isStopped']) {
                        frameCallback = null;
                        window.removeEventListener('message', frameListener);
                        return;
                    }
                    if (frameCallback) {
                        frameCallback({
                            bitmap: assertImageBitmap(data['bitmap']),
                            width: assertNumber(data['width'], 'width'),
                            height: assertNumber(data['height'], 'height'),
                            timestamp: assertNumber(data['timestamp'], 'timestamp'),
                        });
                    }
                };
                window.addEventListener('message', frameListener);
                return {
                    width,
                    height,
                    onFrame(callback) {
                        frameCallback = callback;
                    },
                    stop() {
                        frameCallback = null;
                        window.removeEventListener('message', frameListener);
                        return request('FLOW_CAMERA_STREAM_STOP', {
                            'payload': { 'streamId': streamId },
                        }).then(() => { });
                    },
                };
            });
        },
    },
    microphone: {
        record(options) {
            return request('FLOW_RECORD_MIC', {
                'payload': {
                    'durationMs': options?.durationMs ?? 5000,
                },
            }).then(assertMicrophoneRecordResult);
        },
    },
    storage: {
        getItem(key) {
            return request('FLOW_STORAGE_GET_ITEM', {
                'payload': { 'key': key },
            })
                .then(assertStorageValueOrNull)
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_STORAGE_GET_ITEM, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
        setItem(key, value) {
            let validatedValue;
            try {
                validatedValue = assertStorageValueOrNull(value);
            }
            catch (err) {
                return Promise.reject(new Error('Invalid value for FLOW_STORAGE_SET_ITEM: ' +
                    (err instanceof Error ? err.message : String(err))));
            }
            return request('FLOW_STORAGE_SET_ITEM', {
                'payload': { 'key': key, 'value': validatedValue },
            })
                .then(() => { })
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_STORAGE_SET_ITEM, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
        removeItem(key) {
            return request('FLOW_STORAGE_REMOVE_ITEM', {
                'payload': { 'key': key },
            })
                .then(() => { })
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_STORAGE_REMOVE_ITEM, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
        clear() {
            return request('FLOW_STORAGE_CLEAR', {})
                .then(() => { })
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_STORAGE_CLEAR, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
        keys(options) {
            return request('FLOW_STORAGE_KEYS', {
                'payload': { 'prefix': options?.prefix },
            })
                .then(assertStringArray)
                .catch((err) => {
                throw new Error('Invalid response from host. request: FLOW_STORAGE_KEYS, error: "' +
                    (err instanceof Error ? err.message : String(err)) +
                    '"');
            });
        },
    },
};
export const Flow = FLOW;
