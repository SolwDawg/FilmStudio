const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const elem = document.createElement(tag);
  Object.assign(elem, props);
  for (const c of children) {
    if (typeof c === "string") elem.appendChild(document.createTextNode(c));
    else if (c instanceof Node) elem.appendChild(c);
  }
  return elem;
};

let activeSlug = "";
let currentFilm = null;
let currentState = null;
// Built by the server from dna.ts / prompts.ts, so the UI shows exactly what gets generated.
let currentPrompts = { characters: {}, locations: {} };
let currentDefaults = {};
let activeUploadTarget = null;

// Tab Switching
document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    const target = $(tab.dataset.tab);
    if (target) target.classList.add("active");
  };
});

// Helper API
async function api(path, method = "GET", body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Load Projects
async function loadProjects() {
  const projects = await api("/api/projects");
  const sel = $("projectSelect");
  sel.replaceChildren(...projects.map(p => {
    const opt = document.createElement("option");
    opt.value = p.slug;
    opt.textContent = p.title + " (" + p.done + "/" + p.scenes + ")";
    if (p.slug === activeSlug) opt.selected = true;
    return opt;
  }));
  if (projects.length > 0) {
    if (!activeSlug || !projects.some(p => p.slug === activeSlug)) {
      activeSlug = projects[0].slug;
      sel.value = activeSlug;
    }
    await loadActiveProject();
  }
}

// Load Active Project
async function loadActiveProject() {
  if (!activeSlug) return;
  const data = await api("/api/projects/" + activeSlug);
  currentFilm = data.film;
  currentState = data.state || { scenes: {} };
  currentPrompts = data.referencePrompts || { characters: {}, locations: {} };
  currentDefaults = data.defaults || {};
  $("sysPromptInput").placeholder = currentDefaults.style || "";
  $("storyboardPromptInput").value = currentFilm.storyboardPrompt || currentDefaults.storyboardPrompt || "";

  // Sync inputs
  $("cfgModel").value = currentFilm.model || "Veo 3.1 - Quality";
  $("cfgImageModel").value = currentFilm.imageModel || "🍌 Nano Banana Pro";
  $("cfgRatio").value = currentFilm.ratio || "16:9";
  $("cfgDuration").value = String(currentFilm.duration || 8);
  $("cfgResolution").value = currentFilm.resolution || "720p";
  $("cfgVideoGenMode").value = currentFilm.videoGenMode || "r2v";
  $("cfgStartFrameSource").value = currentFilm.startFrameSource || "continuity";
  $("cfgContinuityMode").value = currentFilm.continuityMode || "frames";

  // Toggles
  setToggle("togContinuity", currentFilm.continuity !== false);
  setToggle("togStrictActor", !!currentFilm.strictActorMatch);
  setToggle("togStrictLoc", !!currentFilm.strictLocationMatch);
  setToggle("togSkipKeyframe", !!currentFilm.skipImageGen);
  setToggle("togRenderFromShot", !!currentFilm.renderFromShotOnly);
  setToggle("togAutoMerge", !!currentFilm.autoMerge);

  $("cfgSceneScale").value = currentFilm.sceneScale || 1;
  $("sysPromptInput").value = currentFilm.style || "";

  renderTimeline(currentFilm, currentState);
  renderDna(currentFilm);
  renderLocations(currentFilm);
  renderMaster(currentState);
}

function setToggle(id, active) {
  const elem = $(id);
  if (!elem) return;
  if (active) elem.classList.add("active");
  else elem.classList.remove("active");
}

function isToggleActive(id) {
  return $(id).classList.contains("active");
}

// Quick sync config
async function syncConfig(patch = {}) {
  if (!activeSlug) return;
  const merged = {
    model: $("cfgModel").value,
    imageModel: $("cfgImageModel").value,
    ratio: $("cfgRatio").value,
    duration: Number($("cfgDuration").value),
    resolution: $("cfgResolution").value,
    videoGenMode: $("cfgVideoGenMode").value,
    startFrameSource: $("cfgStartFrameSource").value,
    continuityMode: $("cfgContinuityMode").value,
    continuity: isToggleActive("togContinuity"),
    strictActorMatch: isToggleActive("togStrictActor"),
    strictLocationMatch: isToggleActive("togStrictLoc"),
    skipImageGen: isToggleActive("togSkipKeyframe"),
    renderFromShotOnly: isToggleActive("togRenderFromShot"),
    autoMerge: isToggleActive("togAutoMerge"),
    sceneScale: Number($("cfgSceneScale").value),
    ...patch
  };
  await api("/api/projects/" + activeSlug + "/config", "POST", merged);
}

// Bind config events
["cfgModel", "cfgImageModel", "cfgRatio", "cfgDuration", "cfgResolution", "cfgVideoGenMode", "cfgStartFrameSource", "cfgContinuityMode"].forEach(id => {
  $(id).onchange = () => syncConfig();
});
["togContinuity", "togStrictActor", "togStrictLoc", "togSkipKeyframe", "togRenderFromShot", "togAutoMerge"].forEach(id => {
  $(id).onclick = () => {
    $(id).classList.toggle("active");
    syncConfig();
  };
});
$("cfgSceneScale").oninput = (e) => {
  const scale = Number(e.target.value);
  document.querySelectorAll(".scene-card").forEach(c => {
    c.style.transform = "scale(" + scale + ")";
    c.style.transformOrigin = "top left";
  });
  syncConfig({ sceneScale: scale });
};

// Render Timeline
function renderTimeline(film, state) {
  const container = $("timelineContainer");
  const scenes = film.scenes || [];
  const stateScenes = state.scenes || {};

  let doneCount = 0;
  scenes.forEach(sc => {
    if (stateScenes[sc.id]?.status === "done") doneCount++;
  });
  $("statScenes").textContent = scenes.length + " Cảnh";
  if (scenes.length > 0) {
    $("statDone").style.display = "inline-block";
    $("statDone").textContent = doneCount + "/" + scenes.length + " Đã Xong";
    $("statEstDuration").style.display = "inline-block";
    $("statEstDuration").textContent = (scenes.length * (film.duration || 8)) + "s Video";
  }

  if (scenes.length === 0) {
    container.replaceChildren(el("div", {
      style: "text-align:center; padding:50px 20px; color:var(--muted);",
      textContent: "Chưa có phân cảnh nào. Nhấp [Kịch Bản & Phân Rã] hoặc [➕ Thêm Cảnh Mới] để bắt đầu!"
    }));
    return;
  }

  container.replaceChildren(...scenes.map((scene, idx) => {
    const s = stateScenes[scene.id] || { status: "pending" };
    const card = el("div", { className: "scene-card " + s.status });
    
    // Scale support
    const scale = film.sceneScale || 1;
    if (scale !== 1) {
      card.style.transform = "scale(" + scale + ")";
      card.style.transformOrigin = "top left";
    }

    // Left Column
    const mediaCol = el("div", { className: "scene-media-col" });
    const videoBox = el("div", { className: "scene-video-box" });
    if (s.video) {
      const vid = el("video", {
        src: "/media/" + activeSlug + "/" + s.video,
        controls: true,
        autoplay: false,
        preload: "metadata"
      });
      videoBox.appendChild(vid);
    } else {
      videoBox.appendChild(el("span", {
        style: "color:var(--muted); font-size:11.5px;",
        textContent: s.status === "running" ? "⏳ Đang Render..." : "Chưa có Video"
      }));
    }

    // 4-Slot Ribbon
    const ribbon = el("div", { className: "frame-ribbon" });
    const slots = [
      { key: "storyboard", name: "Story", file: scene.storyboardImage },
      { key: "shot", name: "Shot", file: scene.shotImages?.[0] },
      { key: "start", name: "First", file: scene.startFrameImage || (idx > 0 && film.continuity ? stateScenes[scenes[idx-1].id]?.lastFrame : null) },
      { key: "last", name: "Last", file: s.lastFrame || scene.lastFrameImage }
    ];

    slots.forEach(slot => {
      const slotBox = el("div", { className: "ribbon-slot", title: "Nhấp để nạp ảnh " + slot.name });
      if (slot.file) {
        slotBox.appendChild(el("img", { src: "/media/" + activeSlug + "/" + slot.file }));
      } else {
        slotBox.appendChild(el("span", { style: "opacity:0.35;", textContent: "+" }));
      }
      slotBox.appendChild(el("span", { className: "ribbon-tag", textContent: slot.name }));
      slotBox.onclick = () => triggerFrameUpload(scene.id, slot.key);
      ribbon.appendChild(slotBox);
    });

    mediaCol.appendChild(videoBox);
    mediaCol.appendChild(ribbon);

    // Right Column
    const infoCol = el("div", { className: "scene-info-col" });
    const header = el("div", { className: "scene-header" });
    const titleRow = el("div", { style: "display:flex; align-items:center; gap:8px;" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: scene.title || ("Scene " + (idx + 1)) }),
      el("span", { className: "badge " + s.status, textContent: s.status })
    );

    const tagRow = el("div", { style: "display:flex; gap:6px; align-items:center;" });
    if (scene.cut) tagRow.appendChild(el("span", { className: "badge cut", textContent: "✂️ CUT" }));
    else if (film.continuity) tagRow.appendChild(el("span", { className: "badge chain", textContent: "🔗 NỐI" }));
    if (scene.connectShot) tagRow.appendChild(el("span", { className: "badge chain", textContent: "🔗 SHOT" }));
    if (scene.isRewritten) tagRow.appendChild(el("span", { className: "badge healing", textContent: "🩹 HEALED" }));

    header.appendChild(titleRow);
    header.appendChild(tagRow);

    // Editable Prompt
    const promptBox = el("textarea", {
      className: "scene-prompt-box",
      value: scene.prompt
    });
    promptBox.onchange = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "POST", { prompt: promptBox.value });
      } catch (err) { alert("Lỗi lưu prompt: " + err.message); }
    };

    // Actions
    const actions = el("div", { className: "scene-actions" });
    const btnRenderThis = el("button", { className: "btn-mini primary", textContent: "▶️ Render" });
    btnRenderThis.onclick = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/render", "POST");
        alert("Đã khởi động render cảnh " + scene.id);
      } catch (err) { alert(err.message); }
    };

    const btnCutToggle = el("button", { className: "btn-mini", textContent: scene.cut ? "🔗 Bật Nối Cảnh" : "✂️ Cắt Cứng [CUT]" });
    btnCutToggle.onclick = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "POST", { cut: !scene.cut });
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    const btnSliceGrid = el("button", { className: "btn-mini", textContent: "📐 Cắt Grid" });
    btnSliceGrid.onclick = async () => {
      try {
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/slice-grid", "POST", { rows: 2, cols: 2 });
        alert("Đã cắt Storyboard thành " + res.count + " shots!");
        await loadActiveProject();
      } catch (err) { alert("Lỗi cắt grid: " + err.message); }
    };

    const btnHeal = el("button", { className: "btn-mini purple", textContent: "🩹 Auto-Heal" });
    btnHeal.onclick = async () => {
      try {
        btnHeal.disabled = true;
        btnHeal.textContent = "Đang chữa lành...";
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/heal", "POST", {
          reason: "Kiểm duyệt an toàn từ khóa nhạy cảm"
        });
        promptBox.value = res.scene.prompt;
        alert("Đã thay thế các từ khóa nhạy cảm bằng từ đồng nghĩa điện ảnh thành công!");
        await loadActiveProject();
      } catch (err) { alert("Lỗi heal: " + err.message); }
      finally {
        btnHeal.disabled = false;
        btnHeal.textContent = "🩹 Auto-Heal";
      }
    };

    const btnTake = el("button", { className: "btn-mini pink", textContent: "🔄 Viết Take Mới" });
    btnTake.onclick = async () => {
      try {
        btnTake.disabled = true;
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/loop-rewrite", "POST");
        promptBox.value = res.scene.prompt;
        alert("Đã viết lại phiên bản (Take) kịch tính mới cho cảnh này!");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
      finally { btnTake.disabled = false; }
    };

    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Bạn có chắc chắn muốn xóa cảnh " + scene.id + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    actions.appendChild(btnRenderThis);
    actions.appendChild(btnCutToggle);
    actions.appendChild(btnSliceGrid);
    actions.appendChild(btnHeal);
    actions.appendChild(btnTake);
    if (s.video) {
      actions.appendChild(el("a", {
        href: "/media/" + activeSlug + "/" + s.video,
        download: scene.id + ".mp4",
        className: "btn-mini",
        style: "text-decoration:none; color:var(--fg);",
        textContent: "⬇️ MP4"
      }));
    }
    actions.appendChild(btnDelete);

    infoCol.appendChild(header);
    infoCol.appendChild(promptBox);
    if (s.error) {
      infoCol.appendChild(el("div", {
        style: "color:var(--bad); font-size:11.5px; background:var(--bad-glow); padding:6px 10px; border-radius:4px;",
        textContent: "⚠️ " + s.error
      }));
    }
    infoCol.appendChild(actions);

    card.appendChild(mediaCol);
    card.appendChild(infoCol);
    return card;
  }));
}

// Render DNA Characters
function renderDna(film) {
  const container = $("dnaContainer");
  const characters = film.characters || [];
  if (characters.length === 0) {
    container.replaceChildren(el("div", {
      style: "grid-column: 1/-1; text-align:center; padding:20px; color:var(--muted);",
      textContent: "Chưa có hồ sơ Diễn viên nào. Nhấp [Quét Thực Thể Tự Động] hoặc [➕ Thêm Diễn Viên]!"
    }));
    return;
  }

  container.replaceChildren(...characters.map(char => {
    const card = el("div", { className: "dna-card" });
    const header = el("div", { className: "dna-header" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: "👤 " + char.name }),
      char.voiceName || char.voiceMediaId
        ? el("span", { style: "font-size:10.5px; color:var(--accent); font-weight:700;", textContent: "🎙️ " + (char.voiceName || "Voice Set") })
        : null
    );
    const desc = el("div", { style: "font-size:11.5px; color:var(--muted);", textContent: char.description || "Chưa có mô tả ngoại hình." });
    
    const dnaPrompt = currentPrompts.characters[char.name] || "";
    const code = el("div", { className: "dna-code", textContent: dnaPrompt });

    const btnRow = el("div", { style: "display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;" });
    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Xóa nhân vật " + char.name + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/dna/character/" + encodeURIComponent(char.name), "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    btnRow.appendChild(btnDelete);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(code);
    card.appendChild(btnRow);
    return card;
  }));
}

// Render DNA Locations
function renderLocations(film) {
  const container = $("locationContainer");
  const locations = film.locations || [];
  if (locations.length === 0) {
    container.replaceChildren(el("div", {
      style: "grid-column: 1/-1; text-align:center; padding:20px; color:var(--muted);",
      textContent: "Chưa có hồ sơ Bối cảnh nào. Nhấp [🏛️ Thêm Bối Cảnh] để khai báo không gian quay!"
    }));
    return;
  }

  container.replaceChildren(...locations.map(loc => {
    const card = el("div", { className: "dna-card" });
    const header = el("div", { className: "dna-header" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: "🏛️ " + loc.name }),
      el("span", { style: "font-size:10.5px; color:var(--ok); font-weight:700;", textContent: "Architectural Sheet" })
    );
    const desc = el("div", { style: "font-size:11.5px; color:var(--muted);", textContent: loc.description || "Chưa có mô tả kiến trúc." });
    
    const locPrompt = currentPrompts.locations[loc.name] || "";
    const code = el("div", { className: "dna-code", textContent: locPrompt });

    const btnRow = el("div", { style: "display:flex; gap:6px; margin-top:auto;" });
    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Xóa bối cảnh " + loc.name + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/dna/location/" + encodeURIComponent(loc.name), "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };
    btnRow.appendChild(btnDelete);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(code);
    card.appendChild(btnRow);
    return card;
  }));
}

// Render Master
function renderMaster(state) {
  const container = $("masterContainer");
  if (state && state.final) {
    container.replaceChildren(
      el("div", { className: "panel", style: "gap:20px;" },
        el("div", { style: "display:flex; justify-content:space-between; align-items:center;" },
          el("h2", { style: "margin:0; font-size:17px; color:#fff;", textContent: "🏆 BẢN MASTER HOÀN CHỈNH (Stream Normalized & Lossless Concat)" }),
          el("a", {
            href: "/media/" + activeSlug + "/" + state.final,
            download: activeSlug + "_master.mp4",
            className: "primary",
            style: "padding:8px 18px; text-decoration:none; border-radius:6px; color:#fff; font-weight:700;",
            textContent: "⬇️ Tải Phim Về Máy"
          })
        ),
        el("video", { src: "/media/" + activeSlug + "/" + state.final, controls: true, autoplay: false, style: "width:100%; max-height:560px; border-radius:8px; background:#000;" })
      )
    );
  }
}

// Direct Frame Upload
function triggerFrameUpload(sceneId, slot) {
  activeUploadTarget = { sceneId, slot };
  $("directFramePicker").click();
}

$("directFramePicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file || !activeUploadTarget) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await api("/api/projects/" + activeSlug + "/scenes/" + activeUploadTarget.sceneId + "/upload-frame", "POST", {
        slot: activeUploadTarget.slot,
        base64: reader.result
      });
      alert("Đã tải ảnh lên slot " + activeUploadTarget.slot.toUpperCase() + " thành công!");
      await loadActiveProject();
    } catch (err) { alert("Lỗi tải ảnh: " + err.message); }
  };
  reader.readAsDataURL(file);
};

// 1-Click All-in-One Automation Runner
$("btnAutoRun").onclick = async () => {
  const story = $("rawStoryInput").value.trim();
  if (!confirm("Bắt đầu quy trình 1-Click Full Automation (Story ➔ DNA ➔ Render ➔ Master)?")) return;
  try {
    $("btnAutoRun").disabled = true;
    $("btnAutoRun").textContent = "🚀 Đang Chạy Full Auto...";
    await api("/api/projects/" + activeSlug + "/auto-run", "POST", {
      storyText: story || undefined,
      wordsPerChunk: $("wordsPerChunk").value
    });
    alert("Quy trình Full Automation đã được khởi động! Theo dõi log trong tab [Nhật Ký].");
    document.querySelector('.nav-tab[data-tab="tabTimeline"]').click();
  } catch (err) { alert("Lỗi: " + err.message); }
  finally {
    $("btnAutoRun").disabled = false;
    $("btnAutoRun").textContent = "🚀 1-Click Full Auto";
  }
};

// Pause / Resume Queue
$("btnPauseResume").onclick = async () => {
  const isCurrentlyPaused = $("btnPauseResume").textContent.includes("Resume");
  const endpoint = isCurrentlyPaused ? "/resume" : "/pause";
  try {
    const res = await api("/api/projects/" + activeSlug + endpoint, "POST");
    $("btnPauseResume").textContent = res.isPaused ? "▶️ Resume" : "⏸️ Pause";
    if (res.isPaused) $("btnPauseResume").classList.add("primary"); else $("btnPauseResume").classList.remove("primary");
  } catch (err) { alert(err.message); }
};

// Emergency Stop
$("btnStopEmergency").onclick = async () => {
  if (!confirm("Dừng khẩn cấp mọi tiến trình render đang chạy?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/stop", "POST");
    alert("Đã dừng khẩn cấp toàn bộ hệ thống!");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Reset Queue
$("btnResetQueue").onclick = async () => {
  if (!confirm("Làm mới hàng đợi (giữ lại các cảnh đã render thành công)?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/reset-queue", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Export & Import Project JSON
$("btnExportJson").onclick = () => {
  window.open("/api/projects/" + activeSlug + "/export", "_blank");
};
$("btnImportJson").onclick = () => $("fileJsonPicker").click();
$("fileJsonPicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const res = await api("/api/projects/import-json", "POST", parsed);
      alert("Đã nhập dự án thành công!");
      activeSlug = res.slug;
      await loadProjects();
    } catch (err) { alert("Lỗi nhập JSON: " + err.message); }
  };
  reader.readAsText(file);
};

// Project controls
$("projectSelect").onchange = (e) => { activeSlug = e.target.value; loadActiveProject(); };
$("btnNewProject").onclick = async () => {
  $("modalNewProject").classList.add("open");
  try {
    const genres = await api("/api/genres");
    $("newGenre").innerHTML = genres.map((g) => '<option value="' + g.id + '" data-hint="' + g.description.replace(/"/g, "&quot;") + '">' + g.label + '</option>').join("");
    $("newGenre").onchange = () => { $("newGenreHint").textContent = $("newGenre").selectedOptions[0]?.dataset.hint || ""; };
    $("newGenre").onchange();
  } catch { /* keep the built-in default option */ }
};
$("btnCancelNewProject").onclick = () => $("modalNewProject").classList.remove("open");
$("btnConfirmNewProject").onclick = async () => {
  const title = $("newTitle").value.trim();
  if (!title) return alert("Vui lòng nhập tên phim");
  try {
    const res = await api("/api/projects", "POST", {
      title,
      ratio: $("newRatio").value,
      duration: $("newDuration").value,
      genre: $("newGenre").value
    });
    $("modalNewProject").classList.remove("open");
    activeSlug = res.slug;
    await loadProjects();
  } catch (err) { alert(err.message); }
};
$("btnDeleteProject").onclick = async () => {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ dự án '" + activeSlug + "'?")) return;
  try {
    await api("/api/projects/" + activeSlug, "DELETE");
    activeSlug = "";
    await loadProjects();
  } catch (err) { alert(err.message); }
};

// Breakdown
$("btnRunBreakdown").onclick = async () => {
  const storyText = $("rawStoryInput").value.trim();
  if (!storyText) return alert("Vui lòng nhập văn bản truyện cần phân rã!");
  try {
    $("btnRunBreakdown").disabled = true;
    $("btnRunBreakdown").textContent = "Đang phân rã kịch bản...";
    await api("/api/projects/" + activeSlug + "/breakdown", "POST", {
      storyText,
      wordsPerChunk: $("wordsPerChunk").value
    });
    await loadActiveProject();
    alert("Phân rã kịch bản thành công! Đã nạp vào Timeline.");
    document.querySelector('.nav-tab[data-tab="tabTimeline"]').click();
  } catch (err) { alert(err.message); }
  finally {
    $("btnRunBreakdown").disabled = false;
    $("btnRunBreakdown").textContent = "⚡ Phân Rã Kịch Bản Chuẩn 10s";
  }
};
$("btnResetScriptOnly").onclick = async () => {
  if (!confirm("Reset toàn bộ kịch bản và phân cảnh của dự án?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/reset-all", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// DNA Scan
$("btnScanDna").onclick = async () => {
  try {
    $("btnScanDna").disabled = true;
    $("btnScanDna").textContent = "Đang quét DNA...";
    await api("/api/projects/" + activeSlug + "/dna/scan", "POST");
    await loadActiveProject();
    alert("Quét DNA nhân vật và bối cảnh thành công!");
  } catch (err) { alert(err.message); }
  finally {
    $("btnScanDna").disabled = false;
    $("btnScanDna").textContent = "🔍 Quét Thực Thể Tự Động (Sliding Window 3 Cảnh)";
  }
};

// Add Actor
$("btnAddActor").onclick = () => {
  $("dnaName").value = "";
  $("dnaAliases").value = "";
  $("dnaVoiceSelect").value = "";
  $("dnaTraits").value = "";
  $("modalDnaEdit").classList.add("open");
};
$("btnCancelDna").onclick = () => $("modalDnaEdit").classList.remove("open");
$("btnSaveDna").onclick = async () => {
  const name = $("dnaName").value.trim();
  if (!name) return alert("Vui lòng nhập tên nhân vật");
  try {
    await api("/api/projects/" + activeSlug + "/dna/character", "POST", {
      name,
      aliases: $("dnaAliases").value,
      voiceName: $("dnaVoiceSelect").value,
      description: $("dnaTraits").value
    });
    $("modalDnaEdit").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Add Location
$("btnAddLocation").onclick = () => {
  $("locName").value = "";
  $("locAliases").value = "";
  $("locTraits").value = "";
  $("modalLocEdit").classList.add("open");
};
$("btnCancelLoc").onclick = () => $("modalLocEdit").classList.remove("open");
$("btnSaveLoc").onclick = async () => {
  const name = $("locName").value.trim();
  if (!name) return alert("Vui lòng nhập tên bối cảnh");
  try {
    await api("/api/projects/" + activeSlug + "/dna/location", "POST", {
      name,
      aliases: $("locAliases").value,
      description: $("locTraits").value
    });
    $("modalLocEdit").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Add Scene Manual
$("btnAddSceneManual").onclick = () => {
  $("newSceneTitle").value = "";
  $("newScenePrompt").value = "";
  $("newSceneCut").checked = false;
  $("modalAddScene").classList.add("open");
};
$("btnCancelAddScene").onclick = () => $("modalAddScene").classList.remove("open");
$("btnConfirmAddScene").onclick = async () => {
  const prompt = $("newScenePrompt").value.trim();
  if (!prompt) return alert("Vui lòng nhập nội dung cảnh");
  try {
    await api("/api/projects/" + activeSlug + "/scenes", "POST", {
      title: $("newSceneTitle").value.trim() || undefined,
      prompt,
      cut: $("newSceneCut").checked
    });
    $("modalAddScene").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// System Prompt
$("btnSaveSysPrompt").onclick = async () => {
  try {
    await api("/api/projects/" + activeSlug + "/config", "POST", { style: $("sysPromptInput").value });
    alert("Đã lưu Style Video!");
  } catch (err) { alert(err.message); }
};
$("btnResetSysPrompt").onclick = () => {
  $("sysPromptInput").value = currentDefaults.style || "";
};

// Advanced Config Modal
$("btnAdvancedModal").onclick = () => {
  // Show the project's saved values; saving the modal's defaults would silently overwrite them.
  if (currentFilm) {
    const setNum = (id, value) => { if (typeof value === "number") $(id).value = value; };
    setNum("advRenderTimeout", currentFilm.renderTimeout);
    setNum("advRetryDelay", currentFilm.retryDelay);
    setNum("advMaxRetries", currentFilm.maxRetries);
    setNum("advRenderDelay", currentFilm.renderDelay);
    setNum("advDnaDelay", currentFilm.dnaDelay);
    // Empty fields would be saved as "" — show the active prompt (project value or default) instead.
    $("advCharPrompt").value = currentFilm.directionalPrompt || currentDefaults.directionalPrompt || "";
    $("advLocPrompt").value = currentFilm.locationDirectionalPrompt || currentDefaults.locationDirectionalPrompt || "";
    $("advSbPrompt").value = currentFilm.storyboardPrompt || currentDefaults.storyboardPrompt || "";
  }
  $("modalAdvanced").classList.add("open");
};
$("btnCloseAdvanced").onclick = () => $("modalAdvanced").classList.remove("open");
$("btnSaveAdvanced").onclick = async () => {
  try {
    await api("/api/projects/" + activeSlug + "/config", "POST", {
      healInstruction: $("advHealPrompt").value,
      directionalPrompt: $("advCharPrompt").value,
      locationDirectionalPrompt: $("advLocPrompt").value,
      storyboardPrompt: $("advSbPrompt").value,
      renderTimeout: Number($("advRenderTimeout").value),
      retryDelay: Number($("advRetryDelay").value),
      maxRetries: Number($("advMaxRetries").value),
      renderDelay: Number($("advRenderDelay").value),
      dnaDelay: Number($("advDnaDelay").value)
    });
    $("modalAdvanced").classList.remove("open");
    alert("Cấu hình nâng cao đã được lưu thành công!");
  } catch (err) { alert(err.message); }
};

// Render & Stitch
$("btnRenderAll").onclick = async () => {
  if (!confirm("Khởi động quy trình Render điện ảnh với I2V Continuity?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/render", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};
$("btnForceRender").onclick = async () => {
  if (!confirm("Render lại TOÀN BỘ các cảnh?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/render?force=1", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};
$("btnStitch").onclick = $("btnStitchTab").onclick = async () => {
  try {
    $("btnStitch").disabled = true;
    $("btnStitch").textContent = "Đang ghép...";
    await api("/api/projects/" + activeSlug + "/stitch?normalize=1", "POST");
    await loadActiveProject();
    document.querySelector('.nav-tab[data-tab="tabMaster"]').click();
  } catch (err) { alert(err.message); }
  finally {
    $("btnStitch").disabled = false;
    $("btnStitch").textContent = "🎬 Ghép Phim";
  }
};

// SSE Terminal with Filtering
const terminal = $("logTerminal");
let logCount = 0;
let currentFilter = "all";

$("btnClearLog").onclick = () => { terminal.replaceChildren(); logCount = 0; $("logCounter").textContent = "0 events"; };

$("btnFilterAll").onclick = () => applyFilter("all", $("btnFilterAll"));
$("btnFilterDone").onclick = () => applyFilter("done", $("btnFilterDone"));
$("btnFilterFail").onclick = () => applyFilter("fail", $("btnFilterFail"));
$("btnFilterHeal").onclick = () => applyFilter("heal", $("btnFilterHeal"));

function applyFilter(filter, btn) {
  currentFilter = filter;
  ["btnFilterAll", "btnFilterDone", "btnFilterFail", "btnFilterHeal"].forEach(id => $(id).classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".log-line").forEach(line => {
    if (filter === "all") line.style.display = "block";
    else if (filter === "done") line.style.display = line.classList.contains("log-done") ? "block" : "none";
    else if (filter === "fail") line.style.display = line.classList.contains("log-fail") ? "block" : "none";
    else if (filter === "heal") line.style.display = line.classList.contains("log-heal") ? "block" : "none";
  });
}

const evt = new EventSource("/api/logs");
evt.onmessage = (e) => {
  const line = JSON.parse(e.data);
  const div = document.createElement("div");
  div.className = "log-line";
  if (line.includes("done") || line.includes("success") || line.includes("generated")) div.classList.add("log-done");
  else if (line.includes("failed") || line.includes("error")) div.classList.add("log-fail");
  else if (line.includes("healing") || line.includes("Heal") || line.includes("safety")) div.classList.add("log-heal");
  else if (line.includes("rendering") || line.includes("started") || line.includes("Auto")) div.classList.add("log-run");
  div.textContent = line;

  if (currentFilter !== "all") {
    if (currentFilter === "done" && !div.classList.contains("log-done")) div.style.display = "none";
    else if (currentFilter === "fail" && !div.classList.contains("log-fail")) div.style.display = "none";
    else if (currentFilter === "heal" && !div.classList.contains("log-heal")) div.style.display = "none";
  }

  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
  logCount += 1;
  $("logCounter").textContent = logCount + " events";
};

// Storyboard Interactive Canvas & Slicing
let currentGlobalSbImg = null;
let currentGlobalSbBase64 = null;

$("btnUploadGlobalStoryboard").onclick = () => $("storyboardGlobalPicker").click();
$("storyboardGlobalPicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentGlobalSbBase64 = reader.result;
    const img = new Image();
    img.onload = () => {
      currentGlobalSbImg = img;
      renderGridCanvas();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

$("gridModeSelect").onchange = () => {
  if (currentGlobalSbImg) renderGridCanvas();
};

function renderGridCanvas() {
  if (!currentGlobalSbImg) return;
  const canvas = $("gridCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = currentGlobalSbImg.width || 1280;
  canvas.height = currentGlobalSbImg.height || 720;
  ctx.drawImage(currentGlobalSbImg, 0, 0, canvas.width, canvas.height);

  const mode = $("gridModeSelect").value;
  const rows = mode === "3x3" ? 3 : 2;
  const cols = mode === "3x3" ? 3 : 2;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  // Vertical lines
  for (let c = 1; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, canvas.height);
    ctx.stroke();
  }
  // Horizontal lines
  for (let r = 1; r < rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(canvas.width, r * cellH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Badges for each shot
  ctx.font = "bold 20px Outfit, sans-serif";
  let shotNum = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + 12;
      const y = r * cellH + 32;
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(x - 4, y - 22, 90, 28);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Shot " + shotNum, x, y);
      shotNum++;
    }
  }

  canvas.style.display = "block";
  $("gridPlaceholder").style.display = "none";
}

$("btnSliceGlobalGrid").onclick = async () => {
  const mode = $("gridModeSelect").value;
  const rows = mode === "3x3" ? 3 : 2;
  const cols = mode === "3x3" ? 3 : 2;

  try {
    $("btnSliceGlobalGrid").disabled = true;
    $("btnSliceGlobalGrid").textContent = "Đang cắt...";
    const res = await api("/api/projects/" + activeSlug + "/storyboard/slice", "POST", {
      rows,
      cols,
      base64: currentGlobalSbBase64 || undefined
    });
    alert("Đã cắt Storyboard thành " + res.count + " Shots thành công!");
    
    // Display in gallery
    const list = $("globalShotsList");
    list.replaceChildren(...res.shots.map((path, idx) => {
      const box = el("div", { style: "display:flex; flex-direction:column; gap:4px; align-items:center; min-width:140px;" },
        el("img", { src: "/media/" + activeSlug + "/" + path, style: "width:140px; aspect-ratio:16/9; object-fit:cover; border-radius:4px; border:1px solid var(--border-subtle);" }),
        el("span", { style: "font-size:10.5px; font-weight:700; color:var(--muted);", textContent: "Shot " + (idx + 1) })
      );
      return box;
    }));
    $("globalShotsContainer").style.display = "block";
  } catch (err) { alert("Lỗi cắt Storyboard: " + err.message); }
  finally {
    $("btnSliceGlobalGrid").disabled = false;
    $("btnSliceGlobalGrid").textContent = "✂️ Cắt Grid Thành Shots";
  }
};

// Auto-Loop Engine Runner
let isAutoLoopRunning = false;
$("btnStartAutoLoop").onclick = async () => {
  if (!confirm("Bắt đầu quy trình Auto-Loop: Viết lại kịch bản -> Render tuần tự có Continuity?")) return;
  const limit = Number($("cfgAutoLoopLimit").value) || 3;
  isAutoLoopRunning = true;
  $("btnStartAutoLoop").disabled = true;
  $("loopStatusDetail").textContent = "Đang lặp...";
  $("loopStatusDetail").style.color = "var(--warn)";

  try {
    for (let loop = 0; loop < limit; loop++) {
      if (!isAutoLoopRunning) break;
      $("loopCurrentProgress").textContent = (loop + 1) + " / " + limit;
      
      // Rewrite each scene
      const scenes = currentFilm.scenes || [];
      for (const sc of scenes) {
        await api("/api/projects/" + activeSlug + "/scenes/" + sc.id + "/loop-rewrite", "POST");
      }
      await loadActiveProject();

      // Trigger Render
      await api("/api/projects/" + activeSlug + "/render", "POST");
      // Wait between loops
      await new Promise(r => setTimeout(r, 4000));
    }
    alert("Quy trình Auto-Loop (" + limit + " vòng) đã hoàn tất!");
    $("loopStatusDetail").textContent = "Hoàn tất";
    $("loopStatusDetail").style.color = "var(--ok)";
  } catch (err) { alert("Lỗi Auto-Loop: " + err.message); }
  finally {
    isAutoLoopRunning = false;
    $("btnStartAutoLoop").disabled = false;
  }
};

loadProjects();
