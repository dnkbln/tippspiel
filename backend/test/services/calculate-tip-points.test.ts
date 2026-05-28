import { describe, expect, it } from "vitest";
import { calculateTipPoints } from "../../src/services/calculate-tip-points.js";

const scoringRules = {
  exactScorePoints: 3,
  goalDifferencePoints: 2,
  tendencyPoints: 1,
};

const baseGame = {
  homeTeamId: "team-1",
  awayTeamId: "team-2",
};

describe("calculateTipPoints", () => {
  it("scores an exact group game result", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: true,
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
      }),
    ).toBe(3);
  });

  it("scores the correct goal difference for a group game", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: true,
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 3,
          awayGoals: 2,
          advancingTeamId: null,
        },
      }),
    ).toBe(2);
  });

  it("scores a non-exact group draw as tendency, not goal difference", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: true,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 2,
          awayGoals: 2,
          advancingTeamId: null,
        },
      }),
    ).toBe(1);
  });

  it("scores the correct tendency for a group game", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: true,
          homeGoals: 2,
          awayGoals: 0,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 1,
          awayGoals: 0,
          advancingTeamId: null,
        },
      }),
    ).toBe(1);
  });

  it("scores zero points for a wrong group game tendency", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: true,
          homeGoals: 2,
          awayGoals: 0,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 0,
          awayGoals: 1,
          advancingTeamId: null,
        },
      }),
    ).toBe(0);
  });

  it("scores an exact decisive knockout result", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
      }),
    ).toBe(3);
  });

  it("scores the correct goal difference for a decisive knockout result", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 2,
          awayGoals: 0,
          advancingTeamId: null,
        },
        tip: {
          homeGoals: 3,
          awayGoals: 1,
          advancingTeamId: null,
        },
      }),
    ).toBe(2);
  });

  it("scores the correct advancing team as knockout tendency", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
        tip: {
          homeGoals: 2,
          awayGoals: 1,
          advancingTeamId: null,
        },
      }),
    ).toBe(1);
  });

  it("scores an exact knockout draw with correct advancing team as exact", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
        tip: {
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
      }),
    ).toBe(3);
  });

  it("scores an exact knockout draw with wrong advancing team as goal difference", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
        tip: {
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-2",
        },
      }),
    ).toBe(2);
  });

  it("scores another knockout draw with correct advancing team as tendency", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
        tip: {
          homeGoals: 2,
          awayGoals: 2,
          advancingTeamId: "team-1",
        },
      }),
    ).toBe(1);
  });

  it("scores another knockout draw with wrong advancing team as zero", () => {
    expect(
      calculateTipPoints({
        scoringRules,
        game: {
          ...baseGame,
          isGroupGame: false,
          homeGoals: 1,
          awayGoals: 1,
          advancingTeamId: "team-1",
        },
        tip: {
          homeGoals: 2,
          awayGoals: 2,
          advancingTeamId: "team-2",
        },
      }),
    ).toBe(0);
  });
});