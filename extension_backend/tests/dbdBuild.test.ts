import { DbdBuild } from "../src/models";
import { FilesystemSource, GameData } from "../src/data";
import { ValidationError } from "../src/errors";

beforeAll(async (done) => {
  await GameData.initialize([new FilesystemSource("/tmp/")]);
  done();
});

describe("Mode validation", () => {
  it('does not accept strings outside of "notPlaying", "killer" or "survivor"', async () => {
    await expect(
      DbdBuild.fromData({
        ...DbdBuild.baseBuild,
        mode: "notOk",
      })
    ).rejects.toThrowError(ValidationError);
  });

  it('accepts the strings "notPlaying", "killer" or "survivor" (with empty builds)', async () => {
    await expect(
      DbdBuild.fromData({
        ...DbdBuild.baseBuild,
        mode: "notPlaying",
      })
    ).resolves.toBeInstanceOf(DbdBuild);

    await expect(
      DbdBuild.fromData({
        mode: "survivor",
        perks: [null, null, null, null],
        addons: null,
        killerName: null,
      })
    ).resolves.toBeInstanceOf(DbdBuild);

    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: [null, null, null, null],
        addons: [null, null],
        killerName: "trapper",
      })
    ).resolves.toBeInstanceOf(DbdBuild);
  });
});

describe("Perk validation", () => {
  it("accepts only a tuple of 4 nulls for perks when mode is notPlaying", async () => {
    await expect(
      DbdBuild.fromData({
        mode: "notPlaying",
        perks: ["Agitation", null, null, null],
        addons: null,
        killerName: null,
      })
    ).rejects.toThrowError(ValidationError);
  });

  it("accepts only valid survivor perks when mode is survivor", async () => {
    await expect(
      DbdBuild.fromData({
        mode: "survivor",
        // Agitation is a killer perk
        perks: ["Agitation", null, null, null],
        addons: null,
        killerName: null,
      })
    ).rejects.toThrowError(ValidationError);

    await expect(
      DbdBuild.fromData({
        mode: "survivor",
        // Adrenaline is a survivor perk
        perks: [["Adrenaline", 2], null, null, null],
        addons: null,
        killerName: null,
      })
    ).resolves.toBeInstanceOf(DbdBuild);

    await expect(
      DbdBuild.fromData({
        mode: "survivor",
        perks: ["Non existent perk", null, null, null],
        addons: null,
        killerName: null,
      })
    ).rejects.toThrowError(ValidationError);
  });

  it("accepts only valid killer perks when mode is killer", async () => {
    await expect(
      DbdBuild.fromData({
        mode: "killer",
        // Agitation is a killer perk
        perks: [
          ["Agitation", 0],
          ["Monitor & Abuse", 1],
          ["Infectious Fright", 2],
          null,
        ],
        addons: [null, null],
        killerName: "ghost face",
      })
    ).resolves.toBeInstanceOf(DbdBuild);

    await expect(
      DbdBuild.fromData({
        mode: "killer",
        // Adrenaline is a survivor perk
        perks: ["Adrenaline", null, null, null],
        addons: null,
        killerName: null,
      })
    ).rejects.toThrowError(ValidationError);

    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: ["Non existent perk", null, null, null],
        addons: null,
        killerName: null,
      })
    ).rejects.toThrowError(ValidationError);
  });
});

describe("Killername validation", () => {
  it('accepts only null for killerName when mode is "notPlaying" or "survivor"', async () => {
    await expect(
      DbdBuild.fromData({
        ...DbdBuild.baseBuild,
        mode: "survivor",
        addons: ["Trapper Gloves", null],
      })
    ).rejects.toThrowError(ValidationError);
    await expect(
      DbdBuild.fromData({
        ...DbdBuild.baseBuild,
        mode: "notPlaying",
        addons: ["Trapper Gloves", null],
      })
    ).rejects.toThrowError(ValidationError);
  });

  it('accepts only addons for that specific killer when mode is "killer"', async () => {
    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: [null, null, null, null],
        killerName: "trapper",
        addons: ["Trapper Gloves", null],
      })
    ).resolves.toBeInstanceOf(DbdBuild);

    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: [null, null, null, null],
        killerName: "Trapper",
        // Not a Trapper addon
        addons: ["White Nit Comb", null],
      })
    ).rejects.toThrowError(ValidationError);

    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: [null, null, null, null],
        killerName: "Trapper",
        addons: ["Not a valid addon at all", null],
      })
    ).rejects.toThrowError(ValidationError);
  });

  it('accepts two nulls for addons when mode is "killer"', async () => {
    await expect(
      DbdBuild.fromData({
        mode: "killer",
        perks: [null, null, null, null],
        killerName: "trapper",
        addons: [null, null],
      })
    ).resolves.toBeInstanceOf(DbdBuild);
  });
});
