Raw Dogging – Issues & Bugs Overview

This report identifies issues discovered in the Raw Dogging game codebase. Many of these are inconsistencies between defined data structures and referenced functionality; others are missing features that are assumed in the current design. Each entry below explains why it is a problem and suggests a fix.

1. Missing item and recipe definitions
Undefined items referenced in age progression

Tribal Age recipes – AGES.TRIBAL_AGE claims to unlock recipes for leather_armor, bone_tools and tanning_rack, but none of these items or recipes are defined in ITEMS or RECIPES. This breaks the progression when the player reaches the Tribal Age because the UI cannot craft or display these items.

Bronze Age items – The Bronze Age unlocks bronze_pickaxe, bronze_axe, bronze_sword, bronze_armor and forge. There are no definitions for these items, their stats or recipes. Additionally, the age requires copper_ingot and tin_ingot, yet neither ore nor ingot is defined in the block or item lists.

Iron Age items – Iron Age unlocks iron_armor and anvil. Neither item exists in ITEMS or RECIPES. Armor classes in general are missing.

Suggested fix: Define all referenced items in ITEMS with properties such as emoji, type, damage/durability etc. Create corresponding crafting recipes in RECIPES, and add new ore blocks (e.g., copper ore, tin ore) in BLOCKS and BLOCK_DATA. Ensure smelting recipes convert raw ores to ingots. Implement a forge and anvil block that provides new crafting UI.

Undefined or inconsistent names in recipes

wooden_pickaxe recipe – This recipe uses cobblestone to craft a “wooden” pickaxe. The actual item is described in the UI as “Stone Pick,” suggesting the item should be named stone_pickaxe instead of wooden_pickaxe. Similar inconsistencies exist for wooden_axe and wooden_hoe.

wooden_sword recipe – The item called wooden_sword requires flint and stick, meaning the sword is really a flint or stone blade. The name should reflect the material (e.g., stone_sword).

Bed recipe – The bed recipe yields an item of type placeable but the bed block is not defined; there is no BLOCKS.BED. This means placing a bed does nothing.

Suggested fix: Rename recipes to match item materials. Add missing blocks (e.g., BED) and implement placement logic. Update recipes accordingly and adjust item names to be consistent across definitions.

2. Block definition errors

Undefined blocks – The world generator references BLOCKS.STONE_BRICKS and BLOCKS.VINES in world.js but these blocks are not defined in BLOCKS or BLOCK_DATA. The code relies on BLOCKS.STONE_BRICKS || BLOCKS.COBBLESTONE and if (BLOCKS.VINES) to avoid crashes, but it produces inconsistent terrain (no vines or stone‐brick shelters). Similarly, generateStructure() uses BLOCKS.CAMPFIRE || BLOCKS.TORCH when placing interior decorations.

Duplicate or unused definitions – Several blocks and items are declared but never used (e.g., PLANKS vs. plank item duplication). Conversely, some commonly expected blocks like stairs, slabs and bed are missing. There is also no COPPER_ORE or TIN_ORE, despite being required for Bronze Age.

Suggested fix: Add missing block IDs (e.g., STONE_BRICKS, VINES, BED, COPPER_ORE, TIN_ORE) with appropriate properties in BLOCKS and BLOCK_DATA. Remove unused or duplicate items or consolidate them under consistent names. Update world generation to place vines and stone bricks only if those blocks exist.

3. Age progression logic gaps

Bonuses not applied – The AGES definition lists bonuses such as tamingBonus, craftingSpeed and miningSpeed. There is no code in the player or UI modules that reads these bonuses and modifies gameplay. For example, taming animals or crafting times are unaffected by age progression.

Unlock requirements not enforced – Age unlock requirements (quest completion, level, item collection) are declared but no system checks them. Players can craft Bronze Age tools once recipes are defined, regardless of meeting requirements.

Quest gating – Several quests reference enemy types such as ALPHA_MAMMOTH and items such as iron_ingot but do not check whether these enemies have been defeated or items obtained before unlocking subsequent quests. The quest manager should validate completion.

Suggested fix: Implement an age progression manager that listens for quest completions, player level and inventory counts. When requirements are met, mark the next age as unlocked and grant bonuses by altering player stats (e.g., reduce crafting timers, increase mining speed). Gate recipes so they are only available after unlocking the corresponding age. Enhance the quest manager to verify kill counts and item collection before advancing.

4. Incomplete systems

Trading and NPC system – The blueprint suggests villagers and trade, but there is no NPC or merchant implementation. Without NPCs, players cannot obtain certain resources or complete tribal/medieval quests. InventoryUI is implemented but trading interfaces are missing.

Equipment system – Armor and equipment slots are not implemented. The player has no concept of wearing armor, despite the age system referencing armor unlocks.

Skills system – The skills property is referenced in Enemy.die() to award skill XP, but the skills module is not implemented or imported. This produces runtime errors when an enemy dies because this.game.skills is undefined.

Suggested fix:

Create an NPC base class and implement merchant/villager behavior. Add a trading UI and currency.

Introduce an equipment system with slots (helmet, chest, boots) and UI support; define armor items accordingly.

Build a skills module with methods like addSkillXp(skillName, xp) and integrate it with the player. Ensure the module is imported wherever it is referenced.

5. User-interface and quality‑of‑life issues

Furnace UI placeholders – The furnace UI has updateFurnaceUI() left blank and only allows smelting four hardcoded recipes. There is no progress bar, fuel tracking or multiple input slots, limiting the furnace to one recipe at a time and ignoring the SMELTING table in config.js.

Inventory management – The inventory code uses simple arrays of items without stacking beyond 64, but there is no sorting or drag‑and‑drop. There is no display of item durability for tools, and the UI does not show hunger or health bars in some cases.

Mobile controls – The configuration enables mobile controls (MOBILE_CONTROLS_ENABLED: true), but there is no implementation in the input or UI modules. This feature does nothing at present.

Suggested fix: Complete the furnace UI by showing input/output slots, fuel quantity and progress bars. Iterate through the SMELTING map so new smelting recipes are automatically available. Enhance inventory with drag‑and‑drop and stack splitting. Add UI elements for tool durability and mobile control overlays or remove the flag until implemented.

6. Enemy AI inconsistencies

Aggressive flag misuse – Several enemy definitions lack an explicit aggressive flag but spawn logic assumes they are aggressive by default (e.g., BOAR has aggressive: false, but MAMMOTH and RHINO lack the flag entirely). In the AI, the absence of aggressive is treated as falsy, causing some dangerous animals to never attack unless attacked first.

Water and cave only flags – Enemies such as CROCODILE specify waterOnly: true, but spawnEnemies() does not correctly check water conditions for diagonal movement and only checks the single block beneath the spawn point. Enemies sometimes spawn on land.

Boss spawn conditions – Bosses have string‐based conditions like day_10 and cave_depth_10. The current implementation only tests day count, night and cave depth, but ignores complex conditions such as defeating previous bosses or reaching certain ages.

Suggested fix: Explicitly define aggressive: true/false for all enemies. Extend spawn logic to examine a 3×3 area to ensure water or cave conditions are met. Expand boss spawn conditions to support arrays of conditions or functions; update trySpawnBoss() accordingly.

7. Miscellaneous

Sound placeholders – Multiple TODO comments indicate missing sound effects (e.g., item pickup sound in ItemEntity and furnace smelting sound). These omissions reduce feedback and immersion.

Physics discrepancies – Gravity values differ across classes: ItemEntity uses half gravity (0.5 multiplier) while Enemy multiplies gravity by 60 in applyPhysics(). This inconsistency leads to unnatural object motion. Standardize gravity application based on delta time.

Save/load consistency – SaveManager (not shown) likely serializes player state. With many undefined items and missing systems, loading a saved game may fail when encountering unknown entries.

Suggested fix: Add the missing sound files or connect to existing audio assets. Consolidate gravity calculations into a shared physics utility. Validate save data against the current item/block definitions, and implement migration paths when adding new items.

Conclusion

Raw Dogging provides a solid foundation for a voxel survival game but contains numerous incomplete or inconsistent elements. Fixing missing definitions and aligning names will eliminate many errors. Implementing age progression logic, NPC systems, skills and equipment will unlock the intended depth of gameplay. Addressing AI behaviors, UI polish and physics will improve the overall player experience.