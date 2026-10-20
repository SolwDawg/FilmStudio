import { describe, expect, it } from "vitest";
import {
  applyFilmConfig,
  discoverCast,
  filmSchema,
  keepFinishedOnly,
  requeueRunning,
  scenesFromStory,
  updateScene,
  upsertCharacter
} from "../src/studio/domain/index.js";

const film = () => filmSchema.parse({ title: "T", scenes: [{ id: "scene-01", prompt: "x" }] });

describe("film edits", () => {
  it("applies known settings and rejects values film.json could not load", () => {
    const updated = applyFilmConfig(film(), { duration: 6, continuityMode: "ingredients", flowProjectId: "ignored", unknown: 1 });
    expect(updated.duration).toBe(6);
    expect(updated.continuityMode).toBe("ingredients");
    expect(updated.flowProjectId).toBeUndefined();
    expect(() => applyFilmConfig(film(), { continuityMode: "sideways" })).toThrow();
    expect(() => applyFilmConfig(film(), { duration: "long" })).toThrow();
  });

  it("upserts a character by case-insensitive name and splits alias strings", () => {
    const f = film();
    upsertCharacter(f, { name: "Lăng Phong", aliases: "Phong; Lang Feng" });
    upsertCharacter(f, { name: "lăng phong", description: "swordsman" });
    expect(f.characters).toHaveLength(1);
    expect(f.characters[0]).toMatchObject({ name: "lăng phong", description: "swordsman" });
    expect(() => upsertCharacter(f, {})).toThrow(/name is required/);
    expect(upsertCharacter(film(), { name: "A", aliases: "B, C" }).aliases).toEqual(["B", "C"]);
  });

  it("updates only the scene fields that were sent", () => {
    const f = film();
    expect(updateScene(f, "scene-01", { cut: true, characters: ["A"] })).toMatchObject({ prompt: "x", cut: true, characters: ["A"] });
    expect(updateScene(f, "nope", {})).toBeUndefined();
  });

  it("requeues stopped scenes and keeps only finished ones on reset", () => {
    const state = { scenes: { a: { status: "running" as const }, b: { status: "done" as const }, c: { status: "failed" as const } } };
    requeueRunning(state);
    expect(state.scenes.a.status).toBe("pending");
    keepFinishedOnly(state);
    expect(Object.keys(state.scenes)).toEqual(["b"]);
  });

  it("builds scenes from a structured script or from prose", () => {
    const structured = scenesFromStory("SCENE 1:\nNhân vật: An\nShot: walks.\n\nSCENE 2: [CUT]\nShot: rain.");
    expect(structured.map((s) => [s.id, s.cut])).toEqual([["scene-01", false], ["scene-02", true]]);
    expect(structured[0].characters).toEqual(["An"]);
    expect(scenesFromStory("Một câu chuyện ngắn.")).toHaveLength(1);
  });

  it("discovers the cast and locations named in the scenes", () => {
    const f = filmSchema.parse({
      title: "T",
      scenes: [
        { id: "scene-01", prompt: "Nhân vật: An, Bình\nBối cảnh: Rừng trúc\nShot: x" },
        { id: "scene-02", prompt: "Nhân vật: an\nBối cảnh: rừng trúc\nShot: y" }
      ]
    });
    const { actors, locations } = discoverCast(f);
    expect(actors.map((a) => a.name)).toEqual(["An", "Bình"]);
    expect(locations.map((l) => l.name)).toEqual(["Rừng trúc"]);
  });
});
