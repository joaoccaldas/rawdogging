/**
 * Enhanced 3D Renderer using Three.js
 * Full-featured voxel renderer with textures, entities, particles, and effects
 */

import * as THREE from 'three';
import { CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';
import { TextureManager3D } from './textures3d.js';

export class Renderer3D {
    constructor(game) {
        this.game = game;
        
        // Create canvas dynamically for 3D
        const container = document.getElementById('game-container');
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas-3d';
        container.appendChild(this.canvas);
        
        // Three.js core components
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        
        // Texture manager
        this.textureManager = new TextureManager3D();
        
        // Chunk meshes cache
        this.chunkMeshes = new Map();
        this.waterMeshes = new Map(); // Separate pass for water
        this.entityMeshes = new Map();
        
        // Block textures (will be generated from colors)
        this.blockMaterials = new Map();
        
        // Sprite textures for entities
        this.spriteTextures = new Map();
        
        // Particle systems
        this.particles = [];
        
        // Player model
        this.playerMesh = null;
        
        // Selection highlight
        this.selectionBox = null;
        this.placementPreview = null;
        
        // Sky and environment
        this.skybox = null;
        this.ambientLight = null;
        this.sunLight = null;
        this.hemiLight = null;
        
        // Damage numbers
        this.damageNumbers = [];
        
        // Ready flag
        this.ready = false;
        
        this.init();
    }
    
    async init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Set clear color (sky)
        this.renderer.setClearColor(0x87CEEB, 1);
        
        // Fog for atmosphere
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
        
        // Initialize texture manager first
        await this.textureManager.init();
        
        // Lighting
        this.setupLighting();
        
        // Generate block materials and atlas AFTER textures are ready
        this.generateBlockMaterials();
        
        // Selection highlight cube
        this.createSelectionBox();
        this.createPlacementPreview();
        
        // Create player model
        this.createPlayerModel();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
        
        this.ready = true;
        console.log('Renderer3D: Initialized with textures and player model');
    }
    
    setupLighting() {
        // Ambient light (base illumination)
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
        
        // Directional sunlight
        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(50, 100, 50);
        this.sunLight.castShadow = true;
        
        // Shadow settings
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.sunLight.shadow.bias = -0.0001;
        
        // Shadow target
        this.sunLight.target = new THREE.Object3D();
        this.scene.add(this.sunLight.target);
        this.scene.add(this.sunLight);
        
        // Hemisphere light for sky/ground color bleeding
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.3);
        this.scene.add(this.hemiLight);
    }
    
    generateBlockMaterials() {
        // Create materials for each block type based on BLOCK_DATA colors
        for (const [blockId, data] of Object.entries(BLOCK_DATA)) {
            // Skip air (id 0) and invalid colors
            if (!data.color || data.color === 'transparent' || parseInt(blockId) === BLOCKS.AIR) {
                continue;
            }
            
            const color = new THREE.Color(data.color);
                
            // Different material for different block types
            let material;
            
            if (data.transparent) {
                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: true,
                    opacity: data.name === 'Water' ? 0.6 : 0.8,
                    side: THREE.DoubleSide
                });
            } else if (data.emissive || data.lightLevel > 0) {
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.5
                });
            } else {
                material = new THREE.MeshLambertMaterial({
                    color: color
                });
            }
            
            this.blockMaterials.set(parseInt(blockId), material);
        }
        
        // Default material for unknown blocks
        this.blockMaterials.set(-1, new THREE.MeshLambertMaterial({ color: 0xff00ff }));
        
        // Build texture atlas after textures are ready
        this.buildTextureAtlas();
    }
    
    buildTextureAtlas() {
        // Create a texture atlas from all block textures
        // Atlas layout: 16x16 tiles, each tile is 16x16 pixels
        const tileSize = 16;
        const atlasSize = 256; // 16x16 grid of tiles
        
        const canvas = document.createElement('canvas');
        canvas.width = atlasSize;
        canvas.height = atlasSize;
        const ctx = canvas.getContext('2d');
        
        // Fill with magenta (debug color)
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(0, 0, atlasSize, atlasSize);
        
        // Map block IDs to atlas positions
        this.atlasMap = new Map();
        let atlasIndex = 0;
        
        // Copy textures to atlas
        for (const [key, texture] of this.textureManager.textures) {
            const [blockIdStr, face] = key.split('_');
            const blockId = parseInt(blockIdStr);
            
            if (!this.atlasMap.has(blockId)) {
                this.atlasMap.set(blockId, {});
            }
            
            const tileX = (atlasIndex % 16) * tileSize;
            const tileY = Math.floor(atlasIndex / 16) * tileSize;
            
            // Get the canvas from the texture - use sourceCanvas we stored, or image
            const sourceImage = texture.sourceCanvas || texture.image;
            if (sourceImage) {
                ctx.drawImage(sourceImage, tileX, tileY, tileSize, tileSize);
            } else {
                // Fallback: fill with block color from BLOCK_DATA
                const blockData = BLOCK_DATA[blockId];
                ctx.fillStyle = blockData?.color || '#FF00FF';
                ctx.fillRect(tileX, tileY, tileSize, tileSize);
                console.warn('Renderer3D: No source image for texture', key);
            }
            
            // Store UV coordinates (normalized 0-1)
            this.atlasMap.get(blockId)[face] = {
                u: tileX / atlasSize,
                v: 1 - (tileY + tileSize) / atlasSize, // Flip Y for WebGL
                uSize: tileSize / atlasSize,
                vSize: tileSize / atlasSize
            };
            
            atlasIndex++;
        }
        
        // Create atlas texture
        this.atlasTexture = new THREE.CanvasTexture(canvas);
        this.atlasTexture.magFilter = THREE.NearestFilter;
        this.atlasTexture.minFilter = THREE.NearestFilter;
        this.atlasTexture.colorSpace = THREE.SRGBColorSpace;
        this.atlasTexture.wrapS = THREE.RepeatWrapping;
        this.atlasTexture.wrapT = THREE.RepeatWrapping;
        
        // Create atlas material - use texture without vertex colors for reliable rendering
        this.atlasMaterial = new THREE.MeshLambertMaterial({
            map: this.atlasTexture,
            vertexColors: false // Texture provides all color
        });
        
        console.log('Renderer3D: Built texture atlas with', atlasIndex, 'textures');
    }
    
    getBlockUVs(blockId, face) {
        const blockUVs = this.atlasMap?.get(blockId);
        if (!blockUVs) {
            return { u: 0, v: 0, uSize: 1/16, vSize: 1/16 };
        }
        return blockUVs[face] || blockUVs['top'] || { u: 0, v: 0, uSize: 1/16, vSize: 1/16 };
    }
    
    getBlockMaterial(blockId) {
        return this.blockMaterials.get(blockId) || this.blockMaterials.get(-1);
    }
    
    createSelectionBox() {
        const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xFFFFFF, // White for visibility
            linewidth: 3
        });
        this.selectionBox = new THREE.LineSegments(edges, material);
        this.selectionBox.visible = false;
        this.scene.add(this.selectionBox);
    }
    
    createPlacementPreview() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.placementPreview = new THREE.Mesh(geometry, material);
        this.placementPreview.visible = false;
        this.scene.add(this.placementPreview);
    }
    
    createPlayerModel() {
        // Create a simple humanoid model for the player
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.7, 0.3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown (leather armor)
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.35;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 }); // Skin color
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.9;
        head.castShadow = true;
        group.add(head);
        
        // Hair
        const hairGeo = new THREE.BoxGeometry(0.42, 0.2, 0.42);
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 }); // Dark brown
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.05;
        group.add(hair);
        
        // Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const armMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB4 });
        
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.4, 0.35, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.4, 0.35, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
        
        // Legs
        const legGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 }); // Dark brown pants
        
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.15, -0.3, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.15, -0.3, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        
        // Store references for animation
        group.userData = {
            body, head, hair, leftArm, rightArm, leftLeg, rightLeg,
            walkCycle: 0
        };
        
        this.playerMesh = group;
        this.scene.add(group);
    }
    
    updatePlayerModel(player, deltaTime) {
        if (!this.playerMesh || !player) return;
        
        // Position (convert coordinates)
        this.playerMesh.position.set(player.x, player.z + 0.6, player.y);
        
        // Rotation based on camera direction
        if (this.game.camera3d) {
            this.playerMesh.rotation.y = -this.game.camera3d.yaw + Math.PI;
        }
        
        // Walk animation
        const isMoving = Math.abs(player.vx) > 0.01 || Math.abs(player.vy) > 0.01;
        const ud = this.playerMesh.userData;
        
        if (isMoving) {
            ud.walkCycle += deltaTime * 10;
            const swing = Math.sin(ud.walkCycle) * 0.5;
            
            ud.leftArm.rotation.x = swing;
            ud.rightArm.rotation.x = -swing;
            ud.leftLeg.rotation.x = -swing;
            ud.rightLeg.rotation.x = swing;
        } else {
            // Reset to idle
            ud.leftArm.rotation.x *= 0.9;
            ud.rightArm.rotation.x *= 0.9;
            ud.leftLeg.rotation.x *= 0.9;
            ud.rightLeg.rotation.x *= 0.9;
        }
    }
    
    updateSelectionBox(x, y, z) {
        if (x !== null && y !== null && z !== null) {
            this.selectionBox.position.set(x + 0.5, z + 0.5, y + 0.5);
            this.selectionBox.visible = true;
        } else {
            this.selectionBox.visible = false;
        }
    }
    
    updatePlacementPreview(x, y, z, blockId) {
        if (x !== null && blockId) {
            this.placementPreview.position.set(x + 0.5, z + 0.5, y + 0.5);
            this.placementPreview.visible = true;
            
            // Color based on whether placement is valid
            const blockAtPos = this.game.world.getBlock(x, y, z);
            const isValid = blockAtPos === BLOCKS.AIR;
            this.placementPreview.material.color.set(isValid ? 0x00ff00 : 0xff0000);
        } else {
            this.placementPreview.visible = false;
        }
    }
    
    /**
     * Build a mesh for a chunk
     * Uses greedy meshing for efficiency
     */
    buildChunkMesh(chunk) {
        const chunkKey = `${chunk.x},${chunk.y}`;
        
        // Remove old meshes if exists
        if (this.chunkMeshes.has(chunkKey)) {
            const oldMesh = this.chunkMeshes.get(chunkKey);
            this.scene.remove(oldMesh);
            oldMesh.geometry.dispose();
        }
        if (this.waterMeshes.has(chunkKey)) {
            const oldWater = this.waterMeshes.get(chunkKey);
            this.scene.remove(oldWater);
            oldWater.geometry.dispose();
        }
        
        // Geometry data arrays
        const positions = [];
        const normals = [];
        const colors = [];
        const uvs = [];
        const indices = [];
        
        // Water geometry (separate for transparency)
        const waterPositions = [];
        const waterNormals = [];
        const waterColors = [];
        const waterUVs = [];
        const waterIndices = [];
        
        let vertexIndex = 0;
        let waterVertexIndex = 0;
        
        const chunkSize = CONFIG.CHUNK_SIZE;
        const worldHeight = CONFIG.WORLD_HEIGHT;
        
        // Offset in world coordinates
        const offsetX = chunk.x * chunkSize;
        const offsetY = chunk.y * chunkSize;
        
        // Iterate through all blocks
        for (let lx = 0; lx < chunkSize; lx++) {
            for (let ly = 0; ly < chunkSize; ly++) {
                for (let lz = 0; lz < worldHeight; lz++) {
                    const block = chunk.getBlock(lx, ly, lz);
                    
                    if (block === BLOCKS.AIR) continue;
                    
                    const blockData = BLOCK_DATA[block];
                    if (!blockData) continue;
                    
                    const wx = offsetX + lx;
                    const wy = offsetY + ly;
                    const wz = lz;
                    
                    // Get block color
                    const color = new THREE.Color(blockData.color || '#ffffff');
                    
                    // Determine if this is water/transparent
                    const isWater = block === BLOCKS.WATER;
                    const isTransparent = blockData.transparent && !isWater;
                    
                    // Skip other transparent blocks (leaves render normally)
                    if (isTransparent && block !== BLOCKS.LEAVES) continue;
                    
                    const targetPos = isWater ? waterPositions : positions;
                    const targetNorm = isWater ? waterNormals : normals;
                    const targetCol = isWater ? waterColors : colors;
                    const targetUV = isWater ? waterUVs : uvs;
                    const targetIdx = isWater ? waterIndices : indices;
                    let vidx = isWater ? waterVertexIndex : vertexIndex;
                    
                    // Check each face for visibility
                    // Top face (+Z)
                    if (this.shouldRenderFace(chunk, lx, ly, lz + 1, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx, 
                            wx, wy, wz, 'top', color, vidx, block);
                        vidx += 4;
                    }
                    
                    // Bottom face (-Z)
                    if (this.shouldRenderFace(chunk, lx, ly, lz - 1, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx,
                            wx, wy, wz, 'bottom', color, vidx, block);
                        vidx += 4;
                    }
                    
                    // Front face (+Y)
                    if (this.shouldRenderFace(chunk, lx, ly + 1, lz, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx,
                            wx, wy, wz, 'front', color, vidx, block);
                        vidx += 4;
                    }
                    
                    // Back face (-Y)
                    if (this.shouldRenderFace(chunk, lx, ly - 1, lz, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx,
                            wx, wy, wz, 'back', color, vidx, block);
                        vidx += 4;
                    }
                    
                    // Right face (+X)
                    if (this.shouldRenderFace(chunk, lx + 1, ly, lz, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx,
                            wx, wy, wz, 'right', color, vidx, block);
                        vidx += 4;
                    }
                    
                    // Left face (-X)
                    if (this.shouldRenderFace(chunk, lx - 1, ly, lz, block)) {
                        this.addTexturedFace(targetPos, targetNorm, targetCol, targetUV, targetIdx,
                            wx, wy, wz, 'left', color, vidx, block);
                        vidx += 4;
                    }
                    
                    if (isWater) {
                        waterVertexIndex = vidx;
                    } else {
                        vertexIndex = vidx;
                    }
                }
            }
        }
        
        // Create main chunk mesh
        if (positions.length > 0) {
            // Debug: Log vertex count for first few chunks
            if (this.chunkMeshes.size < 5) {
                console.log(`Renderer3D: Chunk ${chunkKey} has ${positions.length / 3} vertices, ${uvs.length / 2} uvs, atlasTexture: ${!!this.atlasTexture}`);
            }
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(indices);
            geometry.computeBoundingSphere();
            
            // Use atlas material with textures
            let material;
            if (this.atlasTexture) {
                material = new THREE.MeshLambertMaterial({
                    map: this.atlasTexture
                });
            } else {
                // Fallback: use vertex colors
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                material = new THREE.MeshLambertMaterial({
                    vertexColors: true
                });
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.scene.add(mesh);
            this.chunkMeshes.set(chunkKey, mesh);
        }
        
        // Create water mesh (separate pass for transparency)
        if (waterPositions.length > 0) {
            const waterGeometry = new THREE.BufferGeometry();
            waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
            waterGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(waterNormals, 3));
            waterGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(waterUVs, 2));
            waterGeometry.setIndex(waterIndices);
            
            const waterMaterial = new THREE.MeshLambertMaterial({
                map: this.atlasTexture,
                color: 0x4169E1, // Blue tint for water
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
            waterMesh.renderOrder = 1; // Render after opaque
            
            this.scene.add(waterMesh);
            this.waterMeshes.set(chunkKey, waterMesh);
        }
        
        return this.chunkMeshes.get(chunkKey);
    }
    
    shouldRenderFace(chunk, lx, ly, lz, currentBlock) {
        // Check if face should be rendered (adjacent is air or out of bounds)
        if (lz < 0 || lz >= CONFIG.WORLD_HEIGHT) return true;
        
        let adjBlock;
        
        // If out of chunk bounds, check world
        if (lx < 0 || lx >= CONFIG.CHUNK_SIZE || 
            ly < 0 || ly >= CONFIG.CHUNK_SIZE) {
            // Get from world
            const wx = chunk.x * CONFIG.CHUNK_SIZE + lx;
            const wy = chunk.y * CONFIG.CHUNK_SIZE + ly;
            adjBlock = this.game.world.getBlock(wx, wy, lz);
        } else {
            adjBlock = chunk.getBlock(lx, ly, lz);
        }
        
        // Don't render face between same block types (especially water)
        if (adjBlock === currentBlock) return false;
        
        return adjBlock === BLOCKS.AIR || BLOCK_DATA[adjBlock]?.transparent;
    }
    
    addFace(positions, normals, colors, indices, x, y, z, face, color, startIndex) {
        // In Three.js: X is right, Y is up, Z is towards camera
        // Our world: X is right, Y is forward, Z is up
        // Conversion: Three.X = World.X, Three.Y = World.Z, Three.Z = World.Y
        
        const faceData = {
            top: {
                verts: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]],
                normal: [0, 1, 0]
            },
            bottom: {
                verts: [[0,1,0], [1,1,0], [1,0,0], [0,0,0]],
                normal: [0, -1, 0]
            },
            front: {
                verts: [[0,0,0], [0,0,1], [1,0,1], [1,0,0]],
                normal: [0, 0, 1]
            },
            back: {
                verts: [[1,1,0], [1,1,1], [0,1,1], [0,1,0]],
                normal: [0, 0, -1]
            },
            right: {
                verts: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]],
                normal: [1, 0, 0]
            },
            left: {
                verts: [[0,1,0], [0,1,1], [0,0,1], [0,0,0]],
                normal: [-1, 0, 0]
            }
        };
        
        const data = faceData[face];
        
        // Add vertices (converted to Three.js coordinates)
        for (const [vx, vy, vz] of data.verts) {
            // Convert: Three.X = World.X, Three.Y = World.Z, Three.Z = World.Y
            positions.push(x + vx, z + vz, y + vy);
            normals.push(data.normal[0], data.normal[2], data.normal[1]);
            
            // Apply slight variation to color based on face for depth
            let colorMod = 1.0;
            if (face === 'top') colorMod = 1.1;
            else if (face === 'bottom') colorMod = 0.6;
            else if (face === 'left' || face === 'back') colorMod = 0.8;
            else colorMod = 0.9;
            
            colors.push(
                Math.min(1, color.r * colorMod),
                Math.min(1, color.g * colorMod),
                Math.min(1, color.b * colorMod)
            );
        }
        
        // Add indices for two triangles
        indices.push(
            startIndex, startIndex + 1, startIndex + 2,
            startIndex, startIndex + 2, startIndex + 3
        );
    }
    
    addFaceWithBlockType(positions, normals, colors, indices, x, y, z, face, color, startIndex, blockId) {
        // Enhanced addFace with special handling for grass blocks
        const faceData = {
            top: {
                verts: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]],
                normal: [0, 1, 0]
            },
            bottom: {
                verts: [[0,1,0], [1,1,0], [1,0,0], [0,0,0]],
                normal: [0, -1, 0]
            },
            front: {
                verts: [[0,0,0], [0,0,1], [1,0,1], [1,0,0]],
                normal: [0, 0, 1]
            },
            back: {
                verts: [[1,1,0], [1,1,1], [0,1,1], [0,1,0]],
                normal: [0, 0, -1]
            },
            right: {
                verts: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]],
                normal: [1, 0, 0]
            },
            left: {
                verts: [[0,1,0], [0,1,1], [0,0,1], [0,0,0]],
                normal: [-1, 0, 0]
            }
        };
        
        const data = faceData[face];
        const isGrass = blockId === BLOCKS.GRASS;
        
        for (const [vx, vy, vz] of data.verts) {
            positions.push(x + vx, z + vz, y + vy);
            normals.push(data.normal[0], data.normal[2], data.normal[1]);
            
            // Color modification based on face and block type
            let r = color.r, g = color.g, b = color.b;
            
            // Grass: green top, brown sides with green gradient
            if (isGrass) {
                if (face === 'top') {
                    r = 0.3; g = 0.69; b = 0.31; // Bright green
                } else if (face !== 'bottom') {
                    // Side - gradient from green to brown
                    const greenAmount = vz; // More green at top
                    r = 0.55 * (1 - greenAmount * 0.5) + 0.3 * greenAmount;
                    g = 0.35 * (1 - greenAmount * 0.5) + 0.5 * greenAmount;
                    b = 0.17 * (1 - greenAmount * 0.5) + 0.2 * greenAmount;
                }
            }
            
            // Face shading
            let shade = 1.0;
            if (face === 'top') shade = 1.0;
            else if (face === 'bottom') shade = 0.5;
            else if (face === 'front' || face === 'right') shade = 0.8;
            else shade = 0.7;
            
            colors.push(r * shade, g * shade, b * shade);
        }
        
        indices.push(
            startIndex, startIndex + 1, startIndex + 2,
            startIndex, startIndex + 2, startIndex + 3
        );
    }
    
    addTexturedFace(positions, normals, colors, uvs, indices, x, y, z, face, color, startIndex, blockId) {
        // Face data in WORLD coordinates (X=right, Y=forward, Z=up)
        // Vertices are at local block positions [x, y, z]
        // Normals point outward from the face in world coords
        const faceData = {
            top: {    // Face at Z=1 (top of block), normal points up (+Z)
                verts: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]],
                normal: [0, 0, 1],  // World +Z (up)
                uvCoords: [[0,0], [1,0], [1,1], [0,1]]
            },
            bottom: { // Face at Z=0 (bottom of block), normal points down (-Z)
                verts: [[0,1,0], [1,1,0], [1,0,0], [0,0,0]],
                normal: [0, 0, -1], // World -Z (down)
                uvCoords: [[0,0], [1,0], [1,1], [0,1]]
            },
            front: {  // Face at Y=0 (front of block), normal points backward (-Y)
                verts: [[0,0,0], [0,0,1], [1,0,1], [1,0,0]],
                normal: [0, -1, 0], // World -Y (toward camera/back)
                uvCoords: [[0,0], [0,1], [1,1], [1,0]]
            },
            back: {   // Face at Y=1 (back of block), normal points forward (+Y)
                verts: [[1,1,0], [1,1,1], [0,1,1], [0,1,0]],
                normal: [0, 1, 0],  // World +Y (forward)
                uvCoords: [[0,0], [0,1], [1,1], [1,0]]
            },
            right: {  // Face at X=1 (right of block), normal points right (+X)
                verts: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]],
                normal: [1, 0, 0],  // World +X (right)
                uvCoords: [[0,0], [0,1], [1,1], [1,0]]
            },
            left: {   // Face at X=0 (left of block), normal points left (-X)
                verts: [[0,1,0], [0,1,1], [0,0,1], [0,0,0]],
                normal: [-1, 0, 0], // World -X (left)
                uvCoords: [[0,0], [0,1], [1,1], [1,0]]
            }
        };
        
        const data = faceData[face];
        const isGrass = blockId === BLOCKS.GRASS;
        
        // Get UV coordinates from atlas
        const texFace = (face === 'top' || face === 'bottom') ? face : 'side';
        const atlasUV = this.getBlockUVs(blockId, texFace);
        
        for (let i = 0; i < data.verts.length; i++) {
            const [vx, vy, vz] = data.verts[i];
            const [uvX, uvY] = data.uvCoords[i];
            
            // Position
            positions.push(x + vx, z + vz, y + vy);
            normals.push(data.normal[0], data.normal[2], data.normal[1]);
            
            // UV coordinates mapped to atlas
            const u = atlasUV.u + uvX * atlasUV.uSize;
            const v = atlasUV.v + uvY * atlasUV.vSize;
            uvs.push(u, v);
            
            // Color modification for shading (multiplied with texture)
            let r = 1, g = 1, b = 1; // White = use texture color
            
            // Special grass tinting
            if (isGrass) {
                if (face === 'top') {
                    r = 0.6; g = 1.0; b = 0.6; // Green tint
                } else if (face !== 'bottom') {
                    const greenAmount = vz;
                    r = 0.8 + greenAmount * 0.2;
                    g = 0.7 + greenAmount * 0.3;
                    b = 0.6 + greenAmount * 0.2;
                }
            }
            
            // Face shading
            let shade = 1.0;
            if (face === 'top') shade = 1.0;
            else if (face === 'bottom') shade = 0.5;
            else if (face === 'front' || face === 'right') shade = 0.8;
            else shade = 0.7;
            
            colors.push(r * shade, g * shade, b * shade);
        }
        
        indices.push(
            startIndex, startIndex + 1, startIndex + 2,
            startIndex, startIndex + 2, startIndex + 3
        );
    }
    
    /**
     * Update entity sprites/meshes
     */
    updateEntity(entity) {
        const id = entity.id || `entity_${entity.x}_${entity.y}`;
        
        if (!this.entityMeshes.has(id)) {
            // Create sprite for entity
            const sprite = this.createEntitySprite(entity);
            this.entityMeshes.set(id, sprite);
            this.scene.add(sprite);
        }
        
        const sprite = this.entityMeshes.get(id);
        // Convert coordinates
        sprite.position.set(entity.x, entity.z + 0.5, entity.y);
        
        // Scale based on entity size
        const scale = entity.width || 1;
        sprite.scale.set(scale, entity.depth || 1.8, scale);
    }
    
    createEntitySprite(entity) {
        // Create a simple colored sprite for now
        // Can be replaced with textured sprites later
        
        let color = 0x00ff00; // Default green
        
        if (entity.constructor.name === 'Player') {
            color = 0xffaa00; // Orange for player
        } else if (entity.constructor.name === 'Enemy') {
            color = 0xff0000; // Red for enemies
        } else if (entity.type === 'npc') {
            color = 0x00aaff; // Blue for NPCs
        }
        
        const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.6);
        const material = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        
        return mesh;
    }
    
    removeEntity(entityId) {
        if (this.entityMeshes.has(entityId)) {
            const mesh = this.entityMeshes.get(entityId);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            this.entityMeshes.delete(entityId);
        }
    }
    
    // ==================== PARTICLES ====================
    
    addParticle(x, y, z, color, velocity, lifetime = 1) {
        const particle = {
            position: new THREE.Vector3(x, z, y),
            velocity: new THREE.Vector3(velocity?.x || 0, velocity?.z || 0, velocity?.y || 0),
            color: new THREE.Color(color),
            lifetime: lifetime,
            age: 0,
            size: 0.1
        };
        
        // Create mesh for particle
        const geometry = new THREE.BoxGeometry(particle.size, particle.size, particle.size);
        const material = new THREE.MeshBasicMaterial({ color: particle.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(particle.position);
        
        particle.mesh = mesh;
        this.scene.add(mesh);
        this.particles.push(particle);
    }
    
    addBlockBreakParticles(x, y, z, blockId) {
        const blockData = BLOCK_DATA[blockId];
        const color = blockData?.color || '#888888';
        
        for (let i = 0; i < 10; i++) {
            const vx = (Math.random() - 0.5) * 3;
            const vy = (Math.random() - 0.5) * 3;
            const vz = Math.random() * 3 + 1;
            this.addParticle(
                x + 0.5 + (Math.random() - 0.5) * 0.5,
                y + 0.5 + (Math.random() - 0.5) * 0.5,
                z + 0.5 + (Math.random() - 0.5) * 0.5,
                color,
                { x: vx, y: vy, z: vz },
                0.5 + Math.random() * 0.5
            );
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += deltaTime;
            
            if (p.age >= p.lifetime) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }
            
            // Physics
            p.velocity.y -= 9.8 * deltaTime; // Gravity
            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
            p.mesh.position.copy(p.position);
            
            // Fade out
            const alpha = 1 - (p.age / p.lifetime);
            p.mesh.material.opacity = alpha;
            p.mesh.material.transparent = true;
        }
    }
    
    // ==================== DAMAGE NUMBERS ====================
    
    addDamageNumber(x, y, z, damage, isCrit = false) {
        // Create sprite with text
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.font = isCrit ? 'bold 24px Arial' : '20px Arial';
        ctx.fillStyle = isCrit ? '#ff0000' : '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(Math.round(damage).toString(), 32, 24);
        ctx.fillText(Math.round(damage).toString(), 32, 24);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, z + 1.5, y);
        sprite.scale.set(1, 0.5, 1);
        
        const dmgNum = {
            sprite,
            velocity: 2,
            age: 0,
            lifetime: 1
        };
        
        this.scene.add(sprite);
        this.damageNumbers.push(dmgNum);
    }
    
    updateDamageNumbers(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.age += deltaTime;
            
            if (dn.age >= dn.lifetime) {
                this.scene.remove(dn.sprite);
                dn.sprite.material.map.dispose();
                dn.sprite.material.dispose();
                this.damageNumbers.splice(i, 1);
                continue;
            }
            
            // Float up
            dn.sprite.position.y += dn.velocity * deltaTime;
            dn.velocity *= 0.95;
            
            // Fade out
            const alpha = 1 - (dn.age / dn.lifetime);
            dn.sprite.material.opacity = alpha;
        }
    }
    
    /**
     * Update lighting based on time of day
     */
    updateDayNightCycle(timeOfDay) {
        // timeOfDay is 0-1, where 0.25 is noon, 0.75 is midnight
        const dayPhase = timeOfDay;
        
        // Sun position (circular path)
        const sunAngle = dayPhase * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle) * 100;
        const sunDist = Math.cos(sunAngle) * 100;
        
        this.sunLight.position.set(sunDist, Math.max(10, sunHeight), sunDist);
        
        // Light intensity based on time
        const isDay = dayPhase > 0.2 && dayPhase < 0.8;
        
        if (isDay) {
            const dayIntensity = Math.sin((dayPhase - 0.2) / 0.6 * Math.PI);
            this.sunLight.intensity = 0.4 + dayIntensity * 0.6;
            this.ambientLight.intensity = 0.3 + dayIntensity * 0.3;
            
            // Sky color
            const skyColor = new THREE.Color().lerpColors(
                new THREE.Color(0xffaa55), // Sunrise/sunset
                new THREE.Color(0x87CEEB), // Day
                dayIntensity
            );
            this.renderer.setClearColor(skyColor);
            this.scene.fog.color = skyColor;
        } else {
            this.sunLight.intensity = 0.1;
            this.ambientLight.intensity = 0.15;
            this.renderer.setClearColor(0x1a2a4a);
            this.scene.fog.color.set(0x1a2a4a);
        }
    }
    
    /**
     * Main render call
     */
    render(camera3d, deltaTime = 0.016) {
        if (!camera3d || !camera3d.camera) return;
        
        // Update player model
        if (this.game.player) {
            this.updatePlayerModel(this.game.player, deltaTime);
        }
        
        // Update sun shadow camera to follow player
        if (this.game.player && this.sunLight) {
            const px = this.game.player.x;
            const py = this.game.player.y;
            const pz = this.game.player.z;
            
            this.sunLight.target.position.set(px, pz, py);
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update damage numbers
        this.updateDamageNumbers(deltaTime);
        
        this.renderer.render(this.scene, camera3d.camera);
    }
    
    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Mark chunk for rebuild
     */
    markChunkDirty(cx, cy) {
        const chunkKey = `${cx},${cy}`;
        // Will be rebuilt on next frame
        if (this.chunkMeshes.has(chunkKey)) {
            const mesh = this.chunkMeshes.get(chunkKey);
            mesh.userData.dirty = true;
        }
    }
    
    /**
     * Clear all chunk meshes (for save/load)
     */
    clearAllChunkMeshes() {
        // Dispose chunk meshes
        for (const mesh of this.chunkMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry?.dispose();
        }
        this.chunkMeshes.clear();
        
        // Dispose water meshes
        for (const mesh of this.waterMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry?.dispose();
        }
        this.waterMeshes.clear();
        
        console.log('Renderer3D: Cleared all chunk meshes');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Dispose chunk meshes
        for (const mesh of this.chunkMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
        }
        this.chunkMeshes.clear();
        
        // Dispose water meshes
        for (const mesh of this.waterMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
        }
        this.waterMeshes.clear();
        
        // Dispose entity meshes
        for (const mesh of this.entityMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
        }
        this.entityMeshes.clear();
        
        // Dispose particles
        for (const p of this.particles) {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        }
        this.particles = [];
        
        // Dispose damage numbers
        for (const dn of this.damageNumbers) {
            this.scene.remove(dn.sprite);
            dn.sprite.material.map?.dispose();;
            dn.sprite.material.dispose();
        }
        this.damageNumbers = [];
        
        // Dispose player mesh
        if (this.playerMesh) {
            this.scene.remove(this.playerMesh);
        }
        
        // Dispose materials
        for (const material of this.blockMaterials.values()) {
            material.dispose();
        }
        this.blockMaterials.clear();
        
        // Dispose atlas
        if (this.atlasTexture) {
            this.atlasTexture.dispose();
        }
        if (this.atlasMaterial) {
            this.atlasMaterial.dispose();
        }
        
        // Dispose texture manager
        if (this.textureManager) {
            this.textureManager.dispose();
        }
        
        this.renderer.dispose();
    }
}
