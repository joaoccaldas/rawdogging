/**
 * 3D Texture Manager
 * Handles loading and creating textures for Three.js blocks
 */

import * as THREE from 'three';
import { BLOCKS, BLOCK_DATA } from '../config.js';

export class TextureManager3D {
    constructor() {
        this.textures = new Map();
        this.materials = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.tileSize = 16;
        this.atlasLoaded = false;
        this.atlasTexture = null;
        
        // Block to texture mapping (color + procedural generation)
        this.blockColors = {
            // Basic terrain
            [BLOCKS.STONE]: { top: '#888888', side: '#777777', bottom: '#666666' },
            [BLOCKS.DIRT]: { top: '#8B5A2B', side: '#8B4513', bottom: '#6B3A1B' },
            [BLOCKS.GRASS]: { top: '#4CAF50', side: '#8B5A2B', bottom: '#6B3A1B', sideTop: '#4CAF50' },
            [BLOCKS.SAND]: { top: '#F4D03F', side: '#E5C100', bottom: '#D4B100' },
            [BLOCKS.WATER]: { top: '#4169E1', side: '#3158D0', bottom: '#2147BF', transparent: true },
            [BLOCKS.GRAVEL]: { top: '#808080', side: '#707070', bottom: '#606060' },
            [BLOCKS.CLAY]: { top: '#A9A9A9', side: '#999999', bottom: '#898989' },
            [BLOCKS.SNOW]: { top: '#FFFFFF', side: '#F0F0F0', bottom: '#E0E0E0' },
            [BLOCKS.ICE]: { top: '#ADD8E6', side: '#9DC8D6', bottom: '#8DB8C6', transparent: true },
            [BLOCKS.BEDROCK]: { top: '#1a1a1a', side: '#111111', bottom: '#0a0a0a' },
            
            // Natural blocks
            [BLOCKS.WOOD]: { top: '#6B4423', side: '#8B5A2B', bottom: '#6B4423' },
            [BLOCKS.LEAVES]: { top: '#228B22', side: '#1E7B1E', bottom: '#196B19', transparent: true },
            [BLOCKS.CACTUS]: { top: '#2E8B57', side: '#1E7B47', bottom: '#0E6B37' },
            [BLOCKS.VINES]: { top: '#228B22', side: '#1E7B1E', bottom: '#196B19', transparent: true },
            
            // Ores
            [BLOCKS.COAL_ORE]: { top: '#555555', side: '#444444', bottom: '#333333', oreColor: '#1a1a1a' },
            [BLOCKS.IRON_ORE]: { top: '#887766', side: '#776655', bottom: '#665544', oreColor: '#D2691E' },
            [BLOCKS.GOLD_ORE]: { top: '#998866', side: '#887755', bottom: '#776644', oreColor: '#FFD700' },
            [BLOCKS.DIAMOND_ORE]: { top: '#669999', side: '#558888', bottom: '#447777', oreColor: '#00FFFF' },
            [BLOCKS.COPPER_ORE]: { top: '#8B7355', side: '#7B6345', bottom: '#6B5335', oreColor: '#B87333' },
            [BLOCKS.TIN_ORE]: { top: '#909090', side: '#808080', bottom: '#707070', oreColor: '#C0C0C0' },
            
            // Building - Stone Age
            [BLOCKS.COBBLESTONE]: { top: '#808080', side: '#707070', bottom: '#606060' },
            [BLOCKS.THATCH]: { top: '#D4A017', side: '#C49007', bottom: '#B48000' },
            [BLOCKS.MUD_BRICK]: { top: '#8B7355', side: '#7B6345', bottom: '#6B5335' },
            [BLOCKS.BONE_BLOCK]: { top: '#F5F5DC', side: '#E5E5CC', bottom: '#D5D5BC' },
            [BLOCKS.HAY_BLOCK]: { top: '#DAA520', side: '#CCA510', bottom: '#BB9500' },
            
            // Building - Tribal Age
            [BLOCKS.PLANKS]: { top: '#C19A6B', side: '#B18A5B', bottom: '#A17A4B' },
            [BLOCKS.SANDSTONE]: { top: '#E2C496', side: '#D2B486', bottom: '#C2A476' },
            [BLOCKS.BRICK]: { top: '#B55239', side: '#A54229', bottom: '#953219' },
            [BLOCKS.CLAY_BRICK]: { top: '#BC8F8F', side: '#AC7F7F', bottom: '#9C6F6F' },
            [BLOCKS.STONE_BRICKS]: { top: '#7A7A7A', side: '#6A6A6A', bottom: '#5A5A5A' },
            [BLOCKS.MOSS_STONE]: { top: '#5A7A5A', side: '#4A6A4A', bottom: '#3A5A3A' },
            
            // Building - Medieval
            [BLOCKS.WOOD_BEAM]: { top: '#5D4E37', side: '#6D5E47', bottom: '#4D3E27' },
            [BLOCKS.COBBLESTONE_WALL]: { top: '#696969', side: '#595959', bottom: '#494949' },
            [BLOCKS.IRON_BARS]: { top: '#555555', side: '#656565', bottom: '#454545', transparent: true },
            
            // Building - Industrial
            [BLOCKS.STEEL_BLOCK]: { top: '#71797E', side: '#61696E', bottom: '#51595E' },
            [BLOCKS.CONCRETE]: { top: '#9CA3A3', side: '#8C9393', bottom: '#7C8383' },
            [BLOCKS.ASPHALT]: { top: '#3D3D3D', side: '#2D2D2D', bottom: '#1D1D1D' },
            
            // Functional blocks
            [BLOCKS.CRAFTING_TABLE]: { top: '#DEB887', side: '#CE9867', bottom: '#8B5A2B' },
            [BLOCKS.FURNACE]: { top: '#696969', side: '#595959', bottom: '#494949', frontColor: '#333333' },
            [BLOCKS.CHEST]: { top: '#D2691E', side: '#C2590E', bottom: '#B24900' },
            [BLOCKS.FORGE]: { top: '#8B4513', side: '#7B3503', bottom: '#6B2500' },
            [BLOCKS.ANVIL]: { top: '#454545', side: '#353535', bottom: '#252525' },
            [BLOCKS.TANNING_RACK]: { top: '#8B7355', side: '#7B6345', bottom: '#6B5335' },
            [BLOCKS.LOOM]: { top: '#C19A6B', side: '#B18A5B', bottom: '#A17A4B' },
            
            // Decorative
            [BLOCKS.GLASS]: { top: '#E0FFFF', side: '#D0EFEF', bottom: '#C0DFDF', transparent: true },
            [BLOCKS.GLASS_PANEL]: { top: '#C0E0E0', side: '#B0D0D0', bottom: '#A0C0C0', transparent: true },
            [BLOCKS.TORCH]: { top: '#FFA500', side: '#FF8C00', bottom: '#FF7000', emissive: true },
            [BLOCKS.CAMPFIRE]: { top: '#FF4500', side: '#8B4513', bottom: '#654321', emissive: true },
            [BLOCKS.OBSIDIAN]: { top: '#1C1C1C', side: '#0C0C0C', bottom: '#000000' },
            
            // Farming
            [BLOCKS.FARMLAND]: { top: '#5D4037', side: '#4D3027', bottom: '#3D2017' },
            [BLOCKS.WHEAT_CROP]: { top: '#DAA520', side: '#CCA510', bottom: '#BB9500', transparent: true },
            [BLOCKS.BARLEY_CROP]: { top: '#C0A060', side: '#B09050', bottom: '#A08040', transparent: true },
            [BLOCKS.FLAX_CROP]: { top: '#6B8E6B', side: '#5B7E5B', bottom: '#4B6E4B', transparent: true },
            
            // Machines (Industrial)
            [BLOCKS.STEAM_ENGINE]: { top: '#4A4A4A', side: '#B87333', bottom: '#3A3A3A' },
            [BLOCKS.BOILER]: { top: '#8B0000', side: '#696969', bottom: '#4A4A4A' },
            [BLOCKS.CONVEYOR_BELT]: { top: '#404040', side: '#303030', bottom: '#202020' },
            [BLOCKS.GEAR_BLOCK]: { top: '#696969', side: '#595959', bottom: '#494949' },
            
            // Modern
            [BLOCKS.SOLAR_PANEL]: { top: '#1a237e', side: '#303F9F', bottom: '#3F51B5' },
            [BLOCKS.BATTERY]: { top: '#4CAF50', side: '#388E3C', bottom: '#2E7D32' },
            [BLOCKS.COMPUTER]: { top: '#212121', side: '#424242', bottom: '#616161' },
            [BLOCKS.WIRE]: { top: '#FF5722', side: '#E64A19', bottom: '#D84315' },
            
            // Slabs and stairs (use parent material colors)
            [BLOCKS.THATCH_SLAB]: { top: '#D4A017', side: '#C49007', bottom: '#B48000' },
            [BLOCKS.MUD_BRICK_SLAB]: { top: '#8B7355', side: '#7B6345', bottom: '#6B5335' },
            [BLOCKS.COBBLE_SLAB]: { top: '#808080', side: '#707070', bottom: '#606060' },
        };
    }

    async init() {
        console.log('TextureManager3D: Initializing...');
        
        // Generate procedural textures for all blocks
        this.generateAllTextures();
        
        console.log('TextureManager3D: Generated', this.textures.size, 'textures');
        return true;
    }

    generateAllTextures() {
        // Generate textures for each block type
        for (const [blockId, data] of Object.entries(BLOCK_DATA)) {
            const id = parseInt(blockId);
            if (id === BLOCKS.AIR) continue;
            
            const colors = this.blockColors[id] || {
                top: data.color || '#FF00FF',
                side: data.color || '#FF00FF',
                bottom: data.color || '#FF00FF'
            };
            
            // Generate textured canvases for each face
            const topTex = this.generateBlockTexture(id, 'top', colors);
            const sideTex = this.generateBlockTexture(id, 'side', colors);
            const bottomTex = this.generateBlockTexture(id, 'bottom', colors);
            
            this.textures.set(`${id}_top`, topTex);
            this.textures.set(`${id}_side`, sideTex);
            this.textures.set(`${id}_bottom`, bottomTex);
        }
    }

    generateBlockTexture(blockId, face, colors) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        const baseColor = colors[face] || colors.top || '#FF00FF';
        
        // Fill base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Add noise/detail based on block type
        this.addBlockDetail(ctx, blockId, face, baseColor, colors);
        
        // Convert to Three.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // IMPORTANT: Store canvas reference for atlas building
        texture.sourceCanvas = canvas;
        
        return texture;
    }

    addBlockDetail(ctx, blockId, face, baseColor, colors) {
        const size = this.tileSize;
        
        // Seeded random for consistent textures
        const seed = blockId * 1000 + (face === 'top' ? 1 : face === 'side' ? 2 : 3);
        const random = this.seededRandom(seed);
        
        switch (blockId) {
            case BLOCKS.STONE:
            case BLOCKS.COBBLESTONE:
            case BLOCKS.COBBLESTONE_WALL:
                this.addStoneNoise(ctx, baseColor, random);
                if (blockId === BLOCKS.COBBLESTONE || blockId === BLOCKS.COBBLESTONE_WALL) {
                    this.addCobblePattern(ctx, random);
                }
                break;
            case BLOCKS.DIRT:
                this.addDirtNoise(ctx, baseColor, random);
                break;
            case BLOCKS.GRASS:
                if (face === 'top') {
                    this.addGrassTop(ctx, random);
                } else if (face === 'side') {
                    this.addGrassSide(ctx, colors, random);
                } else {
                    this.addDirtNoise(ctx, baseColor, random);
                }
                break;
            case BLOCKS.SAND:
            case BLOCKS.SANDSTONE:
                this.addSandNoise(ctx, baseColor, random);
                if (blockId === BLOCKS.SANDSTONE) {
                    this.addSandstonePattern(ctx, random);
                }
                break;
            case BLOCKS.WOOD:
            case BLOCKS.WOOD_BEAM:
                if (face === 'top') {
                    this.addWoodRings(ctx, baseColor, random);
                } else {
                    this.addWoodBark(ctx, baseColor, random);
                }
                break;
            case BLOCKS.LEAVES:
            case BLOCKS.VINES:
                this.addLeavesPattern(ctx, baseColor, random);
                break;
            case BLOCKS.COAL_ORE:
            case BLOCKS.IRON_ORE:
            case BLOCKS.GOLD_ORE:
            case BLOCKS.DIAMOND_ORE:
            case BLOCKS.COPPER_ORE:
            case BLOCKS.TIN_ORE:
                this.addOrePattern(ctx, blockId, baseColor, random, colors);
                break;
            case BLOCKS.PLANKS:
                this.addPlanksPattern(ctx, baseColor, random);
                break;
            case BLOCKS.BRICK:
            case BLOCKS.CLAY_BRICK:
            case BLOCKS.MUD_BRICK:
                this.addBrickPattern(ctx, baseColor, random);
                break;
            case BLOCKS.WATER:
                this.addWaterPattern(ctx, baseColor, random);
                break;
            case BLOCKS.SNOW:
            case BLOCKS.ICE:
                this.addSnowPattern(ctx, baseColor, random);
                break;
            case BLOCKS.GRAVEL:
                this.addGravelPattern(ctx, baseColor, random);
                break;
            case BLOCKS.THATCH:
            case BLOCKS.HAY_BLOCK:
            case BLOCKS.THATCH_SLAB:
                this.addThatchPattern(ctx, baseColor, random);
                break;
            case BLOCKS.STONE_BRICKS:
            case BLOCKS.MOSS_STONE:
                this.addStoneBrickPattern(ctx, baseColor, random);
                if (blockId === BLOCKS.MOSS_STONE) {
                    this.addMossOverlay(ctx, random);
                }
                break;
            case BLOCKS.GLASS:
            case BLOCKS.GLASS_PANEL:
                this.addGlassPattern(ctx, baseColor, random);
                break;
            case BLOCKS.TORCH:
            case BLOCKS.CAMPFIRE:
                this.addTorchPattern(ctx, blockId, face, random);
                break;
            case BLOCKS.CRAFTING_TABLE:
                this.addCraftingTablePattern(ctx, face, random);
                break;
            case BLOCKS.FURNACE:
            case BLOCKS.FORGE:
                this.addFurnacePattern(ctx, blockId, face, random);
                break;
            case BLOCKS.CHEST:
                this.addChestPattern(ctx, face, random);
                break;
            case BLOCKS.CACTUS:
                this.addCactusPattern(ctx, face, random);
                break;
            case BLOCKS.ANVIL:
                this.addAnvilPattern(ctx, face, random);
                break;
            case BLOCKS.FARMLAND:
                this.addFarmlandPattern(ctx, random);
                break;
            case BLOCKS.WHEAT_CROP:
            case BLOCKS.BARLEY_CROP:
            case BLOCKS.FLAX_CROP:
                this.addCropPattern(ctx, blockId, random);
                break;
            case BLOCKS.STEEL_BLOCK:
            case BLOCKS.IRON_BARS:
                this.addMetalPattern(ctx, baseColor, random);
                break;
            case BLOCKS.CONCRETE:
            case BLOCKS.ASPHALT:
                this.addConcretePattern(ctx, baseColor, random);
                break;
            case BLOCKS.STEAM_ENGINE:
            case BLOCKS.BOILER:
            case BLOCKS.GEAR_BLOCK:
                this.addMachinePattern(ctx, blockId, face, random);
                break;
            case BLOCKS.SOLAR_PANEL:
                this.addSolarPanelPattern(ctx, face, random);
                break;
            case BLOCKS.BATTERY:
            case BLOCKS.COMPUTER:
                this.addElectronicPattern(ctx, blockId, face, random);
                break;
            case BLOCKS.CONVEYOR_BELT:
                this.addConveyorPattern(ctx, face, random);
                break;
            case BLOCKS.WIRE:
            case BLOCKS.CIRCUIT_BOARD:
                this.addCircuitPattern(ctx, blockId, random);
                break;
            case BLOCKS.BEDROCK:
                this.addBedrockPattern(ctx, random);
                break;
            case BLOCKS.OBSIDIAN:
                this.addObsidianPattern(ctx, random);
                break;
            case BLOCKS.CLAY:
                this.addClayPattern(ctx, baseColor, random);
                break;
            case BLOCKS.BONE_BLOCK:
                this.addBonePattern(ctx, face, random);
                break;
            case BLOCKS.LOOM:
            case BLOCKS.TANNING_RACK:
                this.addWorkstationPattern(ctx, blockId, face, random);
                break;
            default:
                // Generic noise for unknown blocks
                this.addGenericNoise(ctx, baseColor, random);
                break;
        }
    }

    seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    addStoneNoise(ctx, baseColor, random) {
        const size = this.tileSize;
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)';
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1 + Math.floor(random() * 2), 1 + Math.floor(random() * 2));
        }
    }

    addDirtNoise(ctx, baseColor, random) {
        const size = this.tileSize;
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(139,69,19,0.3)';
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addGrassTop(ctx, random) {
        const size = this.tileSize;
        // Base green
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, size, size);
        
        // Add grass blade variations
        for (let i = 0; i < 40; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? '#3D8B40' : '#5DBF60';
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addGrassSide(ctx, colors, random) {
        const size = this.tileSize;
        // Top 3 pixels are grass
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, size, 3);
        
        // Rest is dirt
        ctx.fillStyle = colors.side || '#8B5A2B';
        ctx.fillRect(0, 3, size, size - 3);
        
        // Add dirt texture
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = 3 + Math.floor(random() * (size - 3));
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x, y, 1, 1);
        }
        
        // Grass hanging down
        for (let x = 0; x < size; x++) {
            if (random() > 0.6) {
                const len = 1 + Math.floor(random() * 2);
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x, 3, 1, len);
            }
        }
    }

    addSandNoise(ctx, baseColor, random) {
        const size = this.tileSize;
        for (let i = 0; i < 25; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addWoodRings(ctx, baseColor, random) {
        const size = this.tileSize;
        const cx = size / 2;
        const cy = size / 2;
        
        // Draw rings
        for (let r = 2; r < size / 2; r += 2) {
            ctx.strokeStyle = random() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(139,69,19,0.3)';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    addWoodBark(ctx, baseColor, random) {
        const size = this.tileSize;
        // Vertical lines for bark
        for (let x = 0; x < size; x += 2 + Math.floor(random() * 2)) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x, 0, 1, size);
        }
        
        // Add some horizontal cracks
        for (let i = 0; i < 3; i++) {
            const y = Math.floor(random() * size);
            const x = Math.floor(random() * size / 2);
            const len = 2 + Math.floor(random() * 4);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x, y, len, 1);
        }
    }

    addLeavesPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Create leafy pattern
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.6 ? '#1E7B1E' : (random() > 0.3 ? '#2E8B2E' : '#3E9B3E');
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1 + Math.floor(random() * 2), 1 + Math.floor(random() * 2));
        }
        
        // Add some gaps (alpha)
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    addOrePattern(ctx, blockId, baseColor, random) {
        const size = this.tileSize;
        
        // Add stone texture first
        this.addStoneNoise(ctx, baseColor, random);
        
        // Ore colors
        const oreColors = {
            [BLOCKS.COAL_ORE]: '#1A1A1A',
            [BLOCKS.IRON_ORE]: '#C8A882',
            [BLOCKS.GOLD_ORE]: '#FFD700',
            [BLOCKS.DIAMOND_ORE]: '#5EE8D0',
        };
        
        const oreColor = oreColors[blockId] || '#FF00FF';
        
        // Add ore spots
        const spots = 3 + Math.floor(random() * 4);
        for (let i = 0; i < spots; i++) {
            const x = 2 + Math.floor(random() * (size - 4));
            const y = 2 + Math.floor(random() * (size - 4));
            ctx.fillStyle = oreColor;
            ctx.fillRect(x, y, 2, 2);
            // Add sparkle
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addPlanksPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        const plankWidth = size / 2;
        
        // Draw plank divisions
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(plankWidth - 1, 0, 1, size);
        ctx.fillRect(0, size / 2, size, 1);
        
        // Add wood grain
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(x, y, 1 + Math.floor(random() * 3), 1);
        }
    }

    addBrickPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        
        // Mortar color
        ctx.fillStyle = '#A0A0A0';
        
        // Horizontal mortar lines
        ctx.fillRect(0, 3, size, 1);
        ctx.fillRect(0, 7, size, 1);
        ctx.fillRect(0, 11, size, 1);
        ctx.fillRect(0, 15, size, 1);
        
        // Vertical mortar (offset every other row)
        ctx.fillRect(7, 0, 1, 4);
        ctx.fillRect(15, 0, 1, 4);
        ctx.fillRect(3, 4, 1, 4);
        ctx.fillRect(11, 4, 1, 4);
        ctx.fillRect(7, 8, 1, 4);
        ctx.fillRect(15, 8, 1, 4);
        ctx.fillRect(3, 12, 1, 4);
        ctx.fillRect(11, 12, 1, 4);
    }

    addWaterPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Wave pattern
        for (let y = 0; y < size; y += 3) {
            for (let x = 0; x < size; x++) {
                const wave = Math.sin((x + y * 0.5) * 0.5) * 0.5;
                const shade = wave > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,50,0.2)';
                ctx.fillStyle = shade;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    addSnowPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Sparkles
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = 'rgba(200,200,255,0.5)';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addGravelPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Pebbles
        for (let i = 0; i < 25; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)';
            ctx.fillStyle = shade;
            const s = 1 + Math.floor(random() * 2);
            ctx.fillRect(x, y, s, s);
        }
    }

    addGenericNoise(ctx, baseColor, random) {
        const size = this.tileSize;
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
            ctx.fillStyle = shade;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // ========== NEW TEXTURE PATTERNS ==========

    addCobblePattern(ctx, random) {
        const size = this.tileSize;
        // Draw cobblestone cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            const x1 = Math.floor(random() * size);
            const y1 = Math.floor(random() * size);
            const x2 = x1 + Math.floor(random() * 6) - 3;
            const y2 = y1 + Math.floor(random() * 6) - 3;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    addSandstonePattern(ctx, random) {
        const size = this.tileSize;
        // Horizontal layers
        for (let y = 0; y < size; y += 4) {
            ctx.fillStyle = random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, y, size, 1);
        }
    }

    addThatchPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Straw lines
        for (let i = 0; i < 40; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const len = 2 + Math.floor(random() * 4);
            const angle = random() * 0.5 - 0.25;
            ctx.fillStyle = random() > 0.5 ? 'rgba(180,140,0,0.8)' : 'rgba(220,180,50,0.6)';
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillRect(0, 0, len, 1);
            ctx.restore();
        }
    }

    addStoneBrickPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Mortar lines
        ctx.fillStyle = 'rgba(50,50,50,0.4)';
        ctx.fillRect(0, size/2 - 1, size, 1);
        ctx.fillRect(size/2 - 1, 0, 1, size/2);
        ctx.fillRect(0, 0, 1, size/2);
        ctx.fillRect(size/4 - 1, size/2, 1, size/2);
        ctx.fillRect(size*3/4 - 1, size/2, 1, size/2);
        
        // Add stone texture
        this.addStoneNoise(ctx, baseColor, random);
    }

    addMossOverlay(ctx, random) {
        const size = this.tileSize;
        // Green moss patches
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = `rgba(50,${100 + Math.floor(random() * 50)},50,0.6)`;
            ctx.fillRect(x, y, 1 + Math.floor(random() * 2), 1 + Math.floor(random() * 2));
        }
    }

    addGlassPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Slight reflection
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(1, 1, 3, size - 2);
        ctx.fillRect(1, 1, size - 2, 2);
        // Frame
        ctx.fillStyle = 'rgba(100,100,100,0.5)';
        ctx.fillRect(0, 0, size, 1);
        ctx.fillRect(0, size-1, size, 1);
        ctx.fillRect(0, 0, 1, size);
        ctx.fillRect(size-1, 0, 1, size);
    }

    addTorchPattern(ctx, blockId, face, random) {
        const size = this.tileSize;
        if (blockId === BLOCKS.CAMPFIRE) {
            // Campfire logs
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(2, size-4, size-4, 3);
            ctx.fillRect(4, size-6, size-8, 2);
            // Fire
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(4, 2, size-8, size-8);
            ctx.fillStyle = '#FFCC00';
            ctx.fillRect(6, 4, size-12, size-12);
        } else {
            // Torch stick
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(6, 4, 4, 10);
            // Flame
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(5, 1, 6, 4);
            ctx.fillStyle = '#FFCC00';
            ctx.fillRect(6, 2, 4, 2);
        }
    }

    addCraftingTablePattern(ctx, face, random) {
        const size = this.tileSize;
        if (face === 'top') {
            // Grid pattern
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            for (let i = 1; i < 3; i++) {
                ctx.fillRect(i * size/3, 0, 1, size);
                ctx.fillRect(0, i * size/3, size, 1);
            }
            // Tools
            ctx.fillStyle = '#666666';
            ctx.fillRect(2, 2, 4, 1);
            ctx.fillRect(10, 10, 1, 4);
        } else {
            // Side with tools
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(size/2 - 1, 0, 1, size);
        }
    }

    addFurnacePattern(ctx, blockId, face, random) {
        const size = this.tileSize;
        // Stone base
        this.addStoneNoise(ctx, '#696969', random);
        
        if (face === 'side') {
            // Front face with opening
            ctx.fillStyle = '#333333';
            ctx.fillRect(4, 6, 8, 8);
            // Glow inside
            ctx.fillStyle = blockId === BLOCKS.FORGE ? '#FF4400' : '#FF8800';
            ctx.fillRect(5, 7, 6, 6);
            ctx.fillStyle = '#FFCC00';
            ctx.fillRect(6, 8, 4, 4);
        }
    }

    addChestPattern(ctx, face, random) {
        const size = this.tileSize;
        if (face === 'top') {
            // Lid
            ctx.fillStyle = '#B8860B';
            ctx.fillRect(0, 0, size, size);
            // Lock
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(6, size/2 - 2, 4, 4);
        } else {
            // Side
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(0, 0, size, size);
            // Metal bands
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(0, 2, size, 2);
            ctx.fillRect(0, size - 4, size, 2);
        }
    }

    addCactusPattern(ctx, face, random) {
        const size = this.tileSize;
        // Spines
        for (let i = 0; i < 8; i++) {
            const x = 2 + Math.floor(random() * (size - 4));
            const y = 2 + Math.floor(random() * (size - 4));
            ctx.fillStyle = '#1E5B37';
            ctx.fillRect(x, y, 1, 2);
        }
        // Lighter stripe
        ctx.fillStyle = 'rgba(100,180,100,0.3)';
        ctx.fillRect(size/2 - 1, 0, 2, size);
    }

    addAnvilPattern(ctx, face, random) {
        const size = this.tileSize;
        if (face === 'top') {
            // Anvil top surface
            ctx.fillStyle = '#555555';
            ctx.fillRect(2, 0, size - 4, size);
            ctx.fillStyle = '#666666';
            ctx.fillRect(4, 4, size - 8, size - 8);
        } else {
            // Side view
            ctx.fillStyle = '#454545';
            ctx.fillRect(0, 0, size, size);
            // Base shape
            ctx.fillStyle = '#555555';
            ctx.fillRect(2, 0, size - 4, 4);
            ctx.fillRect(4, 4, size - 8, size - 8);
            ctx.fillRect(2, size - 4, size - 4, 4);
        }
    }

    addFarmlandPattern(ctx, random) {
        const size = this.tileSize;
        // Tilled rows
        for (let y = 0; y < size; y += 2) {
            ctx.fillStyle = y % 4 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(60,40,20,0.3)';
            ctx.fillRect(0, y, size, 1);
        }
    }

    addCropPattern(ctx, blockId, random) {
        const size = this.tileSize;
        let color1, color2;
        
        switch (blockId) {
            case BLOCKS.WHEAT_CROP:
                color1 = '#DAA520'; color2 = '#B8860B';
                break;
            case BLOCKS.BARLEY_CROP:
                color1 = '#C0A060'; color2 = '#A08050';
                break;
            case BLOCKS.FLAX_CROP:
                color1 = '#6B8E6B'; color2 = '#5B7E5B';
                break;
            default:
                color1 = '#88AA44'; color2 = '#669933';
        }
        
        // Crop stalks
        for (let x = 1; x < size; x += 3) {
            ctx.fillStyle = random() > 0.5 ? color1 : color2;
            ctx.fillRect(x, 2, 1, size - 4);
            // Seed head
            ctx.fillRect(x - 1, 0, 3, 3);
        }
    }

    addMetalPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Metal sheen
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = random() > 0.6 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
            ctx.fillRect(x, y, 1, 1);
        }
        // Brushed effect
        for (let y = 0; y < size; y += 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(0, y, size, 1);
        }
    }

    addConcretePattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Speckles
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addMachinePattern(ctx, blockId, face, random) {
        const size = this.tileSize;
        // Base metal
        this.addMetalPattern(ctx, '#696969', random);
        
        if (blockId === BLOCKS.GEAR_BLOCK) {
            // Gear teeth
            ctx.fillStyle = '#555555';
            const cx = size / 2, cy = size / 2;
            for (let a = 0; a < 8; a++) {
                const angle = (a / 8) * Math.PI * 2;
                const x = cx + Math.cos(angle) * 5;
                const y = cy + Math.sin(angle) * 5;
                ctx.fillRect(Math.floor(x) - 1, Math.floor(y) - 1, 3, 3);
            }
            // Center
            ctx.fillStyle = '#444444';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (blockId === BLOCKS.BOILER) {
            // Rivets
            ctx.fillStyle = '#888888';
            ctx.fillRect(2, 2, 2, 2);
            ctx.fillRect(size - 4, 2, 2, 2);
            ctx.fillRect(2, size - 4, 2, 2);
            ctx.fillRect(size - 4, size - 4, 2, 2);
            // Pressure gauge
            if (face === 'side') {
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    addSolarPanelPattern(ctx, face, random) {
        const size = this.tileSize;
        if (face === 'top') {
            // Solar cells grid
            ctx.fillStyle = '#1a237e';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#283593';
            for (let x = 0; x < size; x += 4) {
                for (let y = 0; y < size; y += 4) {
                    ctx.fillRect(x + 1, y + 1, 2, 2);
                }
            }
            // Reflections
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(0, 0, 2, size);
        } else {
            // Frame
            ctx.fillStyle = '#424242';
            ctx.fillRect(0, 0, size, size);
        }
    }

    addElectronicPattern(ctx, blockId, face, random) {
        const size = this.tileSize;
        if (blockId === BLOCKS.BATTERY) {
            // Battery body
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(2, 2, size - 4, size - 4);
            // Terminal
            ctx.fillStyle = '#666666';
            ctx.fillRect(size/2 - 2, 0, 4, 2);
            // Label
            ctx.fillStyle = '#81C784';
            ctx.fillRect(4, 6, size - 8, 4);
        } else if (blockId === BLOCKS.COMPUTER) {
            if (face === 'side') {
                // Screen
                ctx.fillStyle = '#1565C0';
                ctx.fillRect(2, 2, size - 4, size - 6);
                // Keyboard area
                ctx.fillStyle = '#424242';
                ctx.fillRect(2, size - 4, size - 4, 2);
            }
        }
    }

    addConveyorPattern(ctx, face, random) {
        const size = this.tileSize;
        // Belt
        ctx.fillStyle = '#303030';
        ctx.fillRect(0, 0, size, size);
        // Ridges
        ctx.fillStyle = '#404040';
        for (let x = 0; x < size; x += 3) {
            ctx.fillRect(x, 0, 1, size);
        }
        // Arrow direction
        ctx.fillStyle = '#505050';
        ctx.fillRect(size/2 - 1, 4, 2, size - 8);
        ctx.fillRect(size/2 - 3, 6, 6, 2);
    }

    addCircuitPattern(ctx, blockId, random) {
        const size = this.tileSize;
        if (blockId === BLOCKS.CIRCUIT_BOARD) {
            // PCB green
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(0, 0, size, size);
            // Traces
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(2, size/2, size - 4, 1);
            ctx.fillRect(size/2, 2, 1, size - 4);
            // Components
            ctx.fillStyle = '#212121';
            ctx.fillRect(4, 4, 3, 2);
            ctx.fillRect(10, 10, 2, 3);
        } else {
            // Wire
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(0, size/2 - 1, size, 2);
            // Insulation marks
            ctx.fillStyle = '#E64A19';
            ctx.fillRect(4, size/2 - 2, 2, 4);
            ctx.fillRect(10, size/2 - 2, 2, 4);
        }
    }

    addBedrockPattern(ctx, random) {
        const size = this.tileSize;
        // Dark chaotic pattern
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            const shade = Math.floor(random() * 30);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.fillRect(x, y, 1 + Math.floor(random() * 2), 1 + Math.floor(random() * 2));
        }
    }

    addObsidianPattern(ctx, random) {
        const size = this.tileSize;
        // Purple-black shimmer
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = random() > 0.7 ? 'rgba(128,0,128,0.3)' : 'rgba(0,0,0,0.2)';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    addClayPattern(ctx, baseColor, random) {
        const size = this.tileSize;
        // Smooth with slight variation
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(random() * size);
            const y = Math.floor(random() * size);
            ctx.fillStyle = random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(x, y, 2, 2);
        }
    }

    addBonePattern(ctx, face, random) {
        const size = this.tileSize;
        // Bone texture
        ctx.fillStyle = '#E8E4D8';
        ctx.fillRect(0, 0, size, size);
        
        if (face === 'top') {
            // Marrow pattern
            ctx.fillStyle = '#D4D0C4';
            ctx.beginPath();
            ctx.arc(size/2, size/2, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Bone segments
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, size/3, size, 1);
            ctx.fillRect(0, size*2/3, size, 1);
        }
    }

    addWorkstationPattern(ctx, blockId, face, random) {
        const size = this.tileSize;
        if (blockId === BLOCKS.LOOM) {
            // Wooden frame
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(0, 0, size, size);
            // Threads
            ctx.fillStyle = '#F5F5DC';
            for (let x = 2; x < size - 2; x += 2) {
                ctx.fillRect(x, 2, 1, size - 4);
            }
        } else if (blockId === BLOCKS.TANNING_RACK) {
            // Frame
            ctx.fillStyle = '#6B5335';
            ctx.fillRect(0, 0, 2, size);
            ctx.fillRect(size - 2, 0, 2, size);
            ctx.fillRect(0, 0, size, 2);
            // Hide
            ctx.fillStyle = '#A0826D';
            ctx.fillRect(2, 2, size - 4, size - 4);
        }
    }

    // ========== END NEW TEXTURE PATTERNS ==========

    getTexture(blockId, face) {
        const key = `${blockId}_${face}`;
        return this.textures.get(key) || this.textures.get(`${blockId}_top`);
    }

    getMaterial(blockId, options = {}) {
        const key = `${blockId}_${options.transparent ? 'trans' : 'solid'}`;
        
        if (this.materials.has(key)) {
            return this.materials.get(key);
        }
        
        const colors = this.blockColors[blockId];
        const isTransparent = colors?.transparent || options.transparent;
        const isEmissive = colors?.emissive || options.emissive;
        
        // Get textures for each face
        const topTex = this.getTexture(blockId, 'top');
        const sideTex = this.getTexture(blockId, 'side');
        const bottomTex = this.getTexture(blockId, 'bottom');
        
        // Create material array for box (right, left, top, bottom, front, back)
        const materials = [
            new THREE.MeshLambertMaterial({ map: sideTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
            new THREE.MeshLambertMaterial({ map: sideTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
            new THREE.MeshLambertMaterial({ map: topTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
            new THREE.MeshLambertMaterial({ map: bottomTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
            new THREE.MeshLambertMaterial({ map: sideTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
            new THREE.MeshLambertMaterial({ map: sideTex, transparent: isTransparent, opacity: isTransparent ? 0.7 : 1 }),
        ];
        
        if (isEmissive) {
            materials.forEach(m => {
                m.emissive = new THREE.Color(0xFFAA00);
                m.emissiveIntensity = 0.5;
            });
        }
        
        this.materials.set(key, materials);
        return materials;
    }

    dispose() {
        for (const texture of this.textures.values()) {
            texture.dispose();
        }
        this.textures.clear();
        
        for (const material of this.materials.values()) {
            if (Array.isArray(material)) {
                material.forEach(m => m.dispose());
            } else {
                material.dispose();
            }
        }
        this.materials.clear();
    }
}
