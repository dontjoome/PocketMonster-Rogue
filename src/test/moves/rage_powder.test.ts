import {afterEach, beforeAll, beforeEach, describe, expect, test, vi} from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import Overrides from "#app/overrides";
import {
  CommandPhase,
  SelectTargetPhase,
  TurnEndPhase,
} from "#app/phases";
import {getMovePosition} from "#app/test/utils/gameManagerUtils";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { BattlerIndex } from "#app/battle.js";

const TIMEOUT = 20 * 1000;

describe("Moves - Rage Powder", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override.battleType("double");
    game.override.starterSpecies(Species.AMOONGUSS);
    game.override.enemySpecies(Species.SNORLAX);
    game.override.startingLevel(100);
    vi.spyOn(Overrides, "OPP_LEVEL_OVERRIDE", "get").mockReturnValue(100);
    vi.spyOn(Overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([ Moves.FOLLOW_ME, Moves.RAGE_POWDER, Moves.SPOTLIGHT, Moves.QUICK_ATTACK ]);
    game.override.enemyMoveset([Moves.TACKLE,Moves.TACKLE,Moves.TACKLE,Moves.TACKLE]);
  });

  test(
    "move effect should be bypassed by Grass type",
    async () => {
      game.override.enemyMoveset([ Moves.RAGE_POWDER, Moves.RAGE_POWDER, Moves.RAGE_POWDER, Moves.RAGE_POWDER ]);

      await game.startBattle([ Species.AMOONGUSS, Species.VENUSAUR ]);

      const playerPokemon = game.scene.getPlayerField();
      expect(playerPokemon.length).toBe(2);
      playerPokemon.forEach(p => expect(p).not.toBe(undefined));

      const enemyPokemon = game.scene.getEnemyField();
      expect(enemyPokemon.length).toBe(2);
      enemyPokemon.forEach(p => expect(p).not.toBe(undefined));

      const enemyStartingHp = enemyPokemon.map(p => p.hp);

      game.doAttack(getMovePosition(game.scene, 0, Moves.QUICK_ATTACK));
      await game.phaseInterceptor.to(SelectTargetPhase, false);
      game.doSelectTarget(BattlerIndex.ENEMY);
      await game.phaseInterceptor.to(CommandPhase);

      game.doAttack(getMovePosition(game.scene, 1, Moves.QUICK_ATTACK));
      await game.phaseInterceptor.to(SelectTargetPhase, false);
      game.doSelectTarget(BattlerIndex.ENEMY_2);
      await game.phaseInterceptor.to(TurnEndPhase, false);

      // If redirection was bypassed, both enemies should be damaged
      expect(enemyPokemon[0].hp).toBeLessThan(enemyStartingHp[0]);
      expect(enemyPokemon[1].hp).toBeLessThan(enemyStartingHp[1]);
    }, TIMEOUT
  );

  test(
    "move effect should be bypassed by Overcoat",
    async () => {
      vi.spyOn(Overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.OVERCOAT);
      game.override.enemyMoveset([ Moves.RAGE_POWDER, Moves.RAGE_POWDER, Moves.RAGE_POWDER, Moves.RAGE_POWDER ]);

      // Test with two non-Grass type player Pokemon
      await game.startBattle([ Species.BLASTOISE, Species.CHARIZARD ]);

      const playerPokemon = game.scene.getPlayerField();
      expect(playerPokemon.length).toBe(2);
      playerPokemon.forEach(p => expect(p).not.toBe(undefined));

      const enemyPokemon = game.scene.getEnemyField();
      expect(enemyPokemon.length).toBe(2);
      enemyPokemon.forEach(p => expect(p).not.toBe(undefined));

      const enemyStartingHp = enemyPokemon.map(p => p.hp);

      game.doAttack(getMovePosition(game.scene, 0, Moves.QUICK_ATTACK));
      await game.phaseInterceptor.to(SelectTargetPhase, false);
      game.doSelectTarget(BattlerIndex.ENEMY);
      await game.phaseInterceptor.to(CommandPhase);

      game.doAttack(getMovePosition(game.scene, 1, Moves.QUICK_ATTACK));
      await game.phaseInterceptor.to(SelectTargetPhase, false);
      game.doSelectTarget(BattlerIndex.ENEMY_2);
      await game.phaseInterceptor.to(TurnEndPhase, false);

      // If redirection was bypassed, both enemies should be damaged
      expect(enemyPokemon[0].hp).toBeLessThan(enemyStartingHp[0]);
      expect(enemyPokemon[1].hp).toBeLessThan(enemyStartingHp[1]);
    }, TIMEOUT
  );
});
