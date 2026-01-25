Blueprint for Expanding Raw Dogging – Next Three Ages
Current State (Based on Code Analysis)

Architecture – The game uses a JavaScript/HTML5 engine with modules for core systems (input, lighting, camera, particles), world generation, entities and UI. Terrain is generated per chunk using Perlin noise with temperature/humidity noise to pick a biome. Block types, items, recipes, enemies, bosses and quests are defined in config.js. The world updates day/night cycles, gravity, water and fire spread, random ticks, enemy spawning and age progression. The current ages stop at the Iron Age.

Gameplay – Players begin in a prehistoric stone-age world. They gather resources, craft tools, build shelters, hunt animals and progress through quests (e.g., craft tools, build shelter, hunt boars, slay wolves/mammoths). Completing quests and gathering items unlocks successive ages (Stone Age, Tribal Age, Bronze Age, Iron Age). Each age unlocks new recipes and bonuses but there is no content beyond the Iron Age.

Block & Item system – A comprehensive set of blocks exists (natural, building, functional, prehistoric). Each block has properties such as hardness, flammability, light level and drop rules. Items include tools, weapons, raw materials, food and special items, along with crafting and smelting recipes.

Enemies & Biomes – A variety of prehistoric animals are defined, from wolves to mammoths and terror birds. Biomes (plains, desert, snow, jungle, swamp, cave, savanna) dictate terrain, vegetation, enemy types and environmental parameters. Bosses (Alpha Mammoth, Pack Leader Wolf, Cave Guardian Bear) spawn under specific conditions. Enemy spawning and biome choice are handled in world.js.

Design Goals for Next Ages

Preserve Core Loop – Gathering, crafting, building and surviving should remain central. Each age should feel like an extension rather than a departure.

Introduce Societal & Technological Progress – Move from prehistoric survival to organized societies, industrialization and technological innovation. Each age should expand the world, add new materials and structures, and introduce new challenges.

Encourage Exploration & Questing – Quests should reflect the historical themes of each age, guiding players to explore new mechanics (e.g., agriculture, metallurgy, engineering, electronics).

Maintain Modularity – Use the existing config-driven approach to add new blocks, items and mechanics. Each addition should be encapsulated in its own module (e.g., new enemy files, UI panels) to keep the code base maintainable.

Proposed Ages & Features
1. Medieval/Feudal Age
Aspect	Additions & Rationale
Narrative Theme	Transition from isolated tribes to organized feudal societies. Focus on agriculture, fortifications, early trade and domestication of animals.
New Blocks & Materials	

Stone Bricks, Wood Beams, Thatch Roof, Cobblestone Walls for building houses/castles.

Iron Bars, Gate and Portcullis for fortifications.

Farmland improvements (irrigation channels).

Crop Types: wheat (already exists), barley, rye.

Textiles: linen and cloth derived from flax plants. |
| New Items & Tools |

Plough (tool – speeds up farming) and Hoe Upgrade for larger fields.

Crossbow and Longbow with arrows/bolts (projectile logic similar to existing throwable system).

Stone/Mortar for building.

Domesticated animals (horses for faster travel; cows/sheep for meat, milk and wool). |
| Structures & UI |

Villages – generated structures (houses, barns, blacksmith) with non‑player characters (NPCs). Add an NPC system with simple path‑finding and interaction prompts.

Town Center building unlocking trading UI.

Trading/Inventory UI allowing players to buy/sell resources with NPCs; incorporate basic currency (silver coins). |
| Enemies |

Bandits (human enemies) that attack villages and players.

Wolves & Bears continue to spawn but less frequently near villages.

Raid Boss: Warlord (high‑health human boss) spawns after several bandit raids. |
| Quests |

Build a Village: gather stone bricks and wood beams to construct a small settlement.

Defend the Village: repel a bandit raid.

Master Archer: craft a longbow and arrows.

Domestication: tame and breed horses or cows. |
| Mechanical Systems |

Agriculture – introduce crop growth stages for new cereals; add hunger bonuses when consuming bread or porridge.

Trading – create a merchant NPC with a simple economic model. Use a Merchant class with inventory and price tables defined in config.

NPC AI – path‑finding (A* or simple steering behaviours) and state machine for villagers (idle, work, trade, flee). |
| Dependencies |

Consider integrating a lightweight path‑finding library (e.g., javascript‑astar
) for NPC movement.

Expand the UI module (e.g., js/ui/trade.js) for trading.

Add sprite sheets for villagers, bandits, domesticated animals and medieval tools. |

2. Industrial Age
Aspect	Additions & Rationale
Narrative Theme	Represents the Industrial Revolution. Focus on mechanization, mining efficiency, manufacturing and early transportation. Players build factories, manage fuel and handle pollution.
New Blocks & Materials	

Coal & Oil Deposits (deeper in the world), Iron Plates, Steel Beams, Brick Chimneys.

Machinery Blocks: Steam Engine, Boiler, Conveyor Belt, Assembler, Crusher (process ores into ingots faster).

Road Blocks (cobblestone roads and later asphalt).

Metal Pipes & Gears for transmission. |
| New Items & Tools |

Pickaxe Upgrades: steel pickaxe (higher durability and mining speed), pneumatic drill.

Factory Tools: wrench (for rotating/moving machines), blueprint tool to copy building layouts.

Rail Components: rails, cart, steam locomotive for transporting resources.

Gunpowder and Musket as early firearms, using new projectile code with reload times and noise attracting enemies. |
| Systems |

Power & Fuel – each machine block consumes fuel (coal, wood, oil) and produces power measured in units; steam engines output constant power to connected machines.

Automation & Conveyors – items move along conveyor belts; inserter arms (small entity objects) pick items from belts and place them into machines.

Pollution & Ecology – running machines increases pollution around the chunk, affecting biome humidity and increasing aggressive animal/bandit spawns; players can place trees to mitigate.

Rail Transportation – trains travel on rails to move large quantities of resources; includes path‑finding for trains and simple collision detection. |
| Enemies |

Saboteurs – industrial bandits that sabotage machinery and steal resources.

Steam Golem – a mechanical boss spawned in factories with high pollution; deals area‑of‑effect damage. |
| Quests |

Build a Steam Engine: craft and place a working engine with a boiler.

Automate Production: set up a conveyor belt and assembler to automatically produce steel beams.

Lay Tracks: construct a rail line from the mine to the factory.

Industrial Hazards: handle a saboteur attack and repair machines. |
| UI & Logic |

Power HUD: show power generation and consumption.

Factory UI: allow players to configure machine inputs/outputs.

Research Tree: optional research points can unlock more machines; progress shown in a new panel. |
| Dependencies |

A small event system to manage machine updates and power networks.

Additional sprite sheets for factory parts, smoke animations and industrial NPCs.

Sound effects for engines, boilers and firearms.

3. Modern / Digital Age
Aspect	Additions & Rationale
Narrative Theme	Marks the advent of electricity, electronics and digital technology. Players build advanced infrastructure, harness renewable energy and connect digital systems.
New Blocks & Materials	

Electrical Components: copper wires, circuit boards, silicon wafers.

Power Blocks: wind turbines, solar panels, hydro generators.

Storage Blocks: batteries, data storage servers.

Modern Building Materials: concrete, glass panels, steel frames, asphalt roads. |
| New Items & Tools |

Electronic Tools: soldering iron (craft circuits), multimeter (diagnose circuits), drone (scout and transport).

Computers: terminal blocks that run programs controlling machines; players can upload simple scripts to automate tasks.

Vehicles: cars/trucks requiring fuel/electricity; later, electric vehicles. |
| Systems |

Electric Power Grid – unify renewable energy sources and batteries; create a network graph for power distribution similar to the Industrial Age power system but with alternating current and capacity constraints.

Logic Circuits – players can build logic gates (AND, OR, NOT) and memory cells to control gates, doors and machines; expand into programmable microcontrollers with limited code execution (safe sandbox).

Digital Communication – wireless transmitters allow remote control of devices and sensors.

Urbanization & Infrastructure – roads increase travel speed; multi‑story buildings require elevators (new block).

Environmental Impact & Sustainability – burning coal/oil increases carbon pollution; renewable sources reduce pollution; climate changes may alter biomes (e.g., desertification). |
| Enemies |

Hackers – human NPCs that target digital infrastructure (hijack machines). They spawn from bandit camps with laptops.

Robot Drones – malfunctioning drones that roam the world.

Cyber Boss: AI Core – spawns after building a large server room; uses EMP attacks to disable machines. |
| Quests |

Harness Renewable Energy: craft and place a wind turbine and connect it to your power grid.

Automate with Code: write a simple script to manage a conveyor belt system (provided in‑game scripting API).

Build a Data Center: construct a server room with sufficient cooling (requires air‑conditioning blocks).

Defeat the AI Core: eliminate the cyber boss to unlock advanced robotics. |
| UI & Logic |

Network Manager UI: displays connected power networks, machine status and data flows.

Coding Interface: simple code editor with syntax highlighting and limited commands for controlling devices; code saved as items (program chips).

Cybersecurity Alerts: notify players of hacking attempts. |
| Dependencies |

A lightweight JavaScript interpreter or sandbox (e.g., JS-Interpreter
) for player‑written scripts.

Additional UI components (tabs for power, network and code editors).

Detailed sprite sheets for modern machinery, vehicles and computer terminals.

Sound effects for electronics, vehicles and alarms.

Implementation Guidelines & Action Steps

Extend the Config (config.js) – Define new enums and data structures: BLOCKS, BLOCK_DATA, ITEMS, RECIPES, SMELTING, ENEMIES, BOSSES, QUESTS and AGES for each new age. Keep descriptive names and properties (e.g., flammability, hardness, toolRequired) for blocks and items. Add corresponding emoji placeholders until sprites are created.

Create New Modules – For each age, implement separate modules under js/core or js/entities:

villager.js for NPC behaviours (state machine, trading).

bandit.js, saboteur.js, hacker.js for new enemy types with unique AI patterns.

machine.js and specific machine subclasses (steamEngine.js, assembler.js, solarPanel.js) managing input/output and power consumption.

vehicle.js for trains, cars and drones.

logicCircuit.js to handle digital components and gate evaluation.

Expand World Generation – Modify world.js:

Add new biome entries (e.g., Mountains, Farmland, Industrial Wasteland, Urban), each with appropriate ground blocks, vegetation chances and enemy lists.

Update generateChunk() to handle new resources (coal, oil veins, copper ore) and structure generation (villages, factories, ruins).

Introduce pollution variables stored per chunk; adjust enemy spawning accordingly.

Enhance the UI – Use the existing UI architecture to add:

Trading Panel – list items, prices and transaction buttons.

Machine GUI – configure machine input/output and show current recipes.

Power/Network HUD – show total production vs. consumption, grid diagram.

Research/Quest Panel – display current age, completed and available quests and research items.

Implement New Mechanics –

NPC & Pathfinding – integrate a path‑finding library or implement a simple A* on a 2D grid representing passable/impassable blocks; assign each NPC a path queue and state transitions.

Trading & Currency – maintain a player currency balance; adjust item values based on supply/demand; update UI accordingly.

Machine & Power Systems – maintain a list of active machines, update them each tick; propagate power along connected nodes; handle fuel consumption; drop items onto conveyors or into inventories.

Automation & Scripting – embed an interpreter in a secure sandbox; expose safe APIs (e.g., sense(), moveItem(from, to), if conditions) to players.

Vehicles & Transportation – design simple vehicle physics (speed, acceleration, turning) and collision detection; implement rail movement along track segments.

Art & Audio – Commission or create sprite sheets matching the isometric style for new blocks, NPCs, enemies, vehicles and machines. Placeholders using emojis (as done in config.js) can be used during development. Add sound effects for bows, engines, trains, guns, computers and alarms.

Testing & Balancing – Test each age individually to ensure progression feels rewarding and challenges are appropriate. Monitor performance as world complexity increases; consider optimizations (e.g., culling, chunk unloading, caching) to keep frame rates stable. Balance resource availability, crafting costs and enemy difficulty.

Documentation & Scalability – Document new APIs for scripting, machine configuration and trading to help players and modders. Maintain comments and structure in the code base to facilitate further expansions (e.g., future Space Age).

How It Works (Mental Models)

Chunk‑based world – The game divides the world into manageable chunks; each chunk stores a 3D grid of block IDs. Biomes and resources are determined by noise functions, with variations introduced by humidity and temperature. Extending to new ages means adding new block IDs and generation rules within these chunks.

Data‑driven design – Blocks, items, enemies and quests are defined as plain data objects; behaviour arises from properties like solid, flammable, drops and scripts triggered in world update loops. Adding new ages follows this pattern by expanding the data tables and writing small amounts of logic around them.

State Machines for AI – Enemies and (planned) NPCs operate via simple state machines (idle, chasing, attacking, trading). Additional states (e.g., working, sleeping, fleeing) can be added to handle more complex behaviours. Path‑finding ensures NPCs can navigate terrain.

Resource & Technology Progression – The age system ties quests, items and world state into a progression path. Each age introduces new recipes that require materials available only after completing specific quests or unlocking new ores/deposits. This gating ensures players explore new mechanics sequentially.