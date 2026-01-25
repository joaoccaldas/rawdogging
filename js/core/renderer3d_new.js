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
        
        // Particle systems
        this.particles = [];
        this.particlePool = [];
        
        // Player model
        this.playerMesh = null;
        this.playerSprite = null;
        
        // Selection highlight
        this.selectionBox = null;
        this.placementPreview = null;
        
        // Sky and environment
        this.skybox = null;
        this.ambientLight = null;
        this.sunLight = null;
        this.torchLights = new Map();
        
        // Damage numbers
        this.damageNumbers = [];
        
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
        
        // Initialize texture manager
        await this.textureManager.init();
        
        // Lighting
        this.setupLighting();
        
        // Selection highlight cube
        this.createSelectionBox();
        this.createPlacementPreview();
        
        // Create player model
        this.createPlayerModel();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
        
        console.log('Renderer3D: Initialized');
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
        
        // Add shadow camera target
        this.sunLight.target = new THREE.Object3D();
        this.scene.add(this.sunLight.target);
        this.scene.add(this.sunLight);
        
        // Hemisphere light for sky/ground color bleeding
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.3);
        this.scene.add(this.hemiLight);
    }
    
    createSelectionBox() {
        const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 2
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
        
        // Rotation based on velocity or camera direction
        if (this.game.camera3d) {
            // Face the camera's yaw direction
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
     * Build a mesh for a chunk with textures
     */
    buildChunkMesh(chunk) {
        const chunkKey = `${chunk.x},${chunk.y}`;
        
        // Remove old mesh if exists
        if (this.chunkMeshes.has(chunkKey)) {
            const oldMesh = this.chunkMeshes.get(chunkKey);
            this.scene.remove(oldMesh);
            oldMesh.geometry.dispose();
        }
        
        // Geometry data arrays
        const positions = [];
        const normals = [];
        const colors = [];
        const uvs = [];
        const indices = [];
        
        // Separate arrays for water (transparent)
        const waterPositions = [];
        const waterNormals = [];
        const waterColors = [];
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
                    
                    // Skip other transparent blocks for now (render separately if needed)
                    if (isTransparent && block !== BLOCKS.LEAVES) continue;
                    
                    const targetPos = isWater ? waterPositions : positions;
                    const targetNorm = isWater ? waterNormals : normals;
                    const targetCol = isWater ? waterColors : colors;
                    const targetIdx = isWater ? waterIndices : indices;
                    let vidx = isWater ? waterVertexIndex : vertexIndex;
                    
                    // Check each face for visibility
                    const faces = ['top', 'bottom', 'front', 'back', 'right', 'left'];
                    const faceOffsets = [
                        [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]
                    ];
                    
                    for (let f = 0; f < 6; f++) {
                        const [ox, oy, oz] = faceOffsets[f];
                        if (this.shouldRenderFace(chunk, lx + ox, ly + oy, lz + oz, block)) {
                            this.addFace(targetPos, targetNorm, targetCol, targetIdx, 
                                wx, wy, wz, faces[f], color, vidx, block);
                            vidx += 4;
                        }
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
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setIndex(indices);
            geometry.computeBoundingSphere();
            
            const material = new THREE.MeshLambertMaterial({
                vertexColors: true
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.scene.add(mesh);
            this.chunkMeshes.set(chunkKey, mesh);
        }
        
        // Create water mesh (separate for transparency)
        if (waterPositions.length > 0) {
            const waterGeometry = new THREE.BufferGeometry();
            waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
            waterGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(waterNormals, 3));
            waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waterColors, 3));
            waterGeometry.setIndex(waterIndices);
            
            const waterMaterial = new THREE.MeshLambertMaterial({
                vertexColors: true,
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
        if (lz < 0 || lz >= CONFIG.WORLD_HEIGHT) return true;
        
        let adjBlock;
        
        if (lx < 0 || lx >= CONFIG.CHUNK_SIZE || ly < 0 || ly >= CONFIG.CHUNK_SIZE) {
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
    
    addFace(positions, normals, colors, indices, x, y, z, face, color, startIndex, blockId) {
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
        
        // Special color handling for grass
        const isGrass = blockId === BLOCKS.GRASS;
        
        for (const [vx, vy, vz] of data.verts) {
            positions.push(x + vx, z + vz, y + vy);
            normals.push(data.normal[0], data.normal[2], data.normal[1]);
            
            // Color modification based on face
            let r = color.r, g = color.g, b = color.b;
            
            // Grass: green top, brown sides
            if (isGrass) {
                if (face === 'top') {
                    r = 0.3; g = 0.69; b = 0.31; // Green
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
    
    // ==================== ENTITY RENDERING ====================
    
    updateEntity(entity) {
        const id = entity.id || `entity_${Math.random()}`;
        entity.id = id;
        
        if (!this.entityMeshes.has(id)) {
            const mesh = this.createEntityMesh(entity);
            this.entityMeshes.set(id, mesh);
            this.scene.add(mesh);
        }
        
        const mesh = this.entityMeshes.get(id);
        mesh.position.set(entity.x, entity.z + (entity.depth || 1) / 2, entity.y);
        
        // Face camera (billboard effect for sprites)
        if (mesh.userData.isBillboard && this.game.camera3d) {
            mesh.rotation.y = -this.game.camera3d.yaw + Math.PI;
        }
    }
    
    createEntityMesh(entity) {
        let color = 0x00ff00;
        let width = entity.width || 0.8;
        let height = entity.depth || 1.5;
        
        // Entity type colors
        if (entity.constructor.name === 'Enemy' || entity.isEnemy) {
            color = 0xff0000;
        } else if (entity.type === 'wildlife' || entity.isWildlife) {
            color = 0x8B4513; // Brown
        } else if (entity.type === 'npc' || entity.isNPC) {
            color = 0x00aaff;
        } else if (entity.type === 'item' || entity.isItem) {
            color = 0xffff00;
            width = 0.3;
            height = 0.3;
        }
        
        const geometry = new THREE.BoxGeometry(width, height, width);
        const material = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.userData.isBillboard = true;
        
        return mesh;
    }
    
    removeEntity(entityId) {
        if (this.entityMeshes.has(entityId)) {
            const mesh = this.entityMeshes.get(entityId);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.entityMeshes.delete(entityId);
        }
    }
    
    // ==================== PARTICLES ====================
    
    addParticle(x, y, z, color, velocity, lifetime = 1) {
        const particle = {
            position: new THREE.Vector3(x, z, y),
            velocity: new THREE.Vector3(velocity.x || 0, velocity.z || 0, velocity.y || 0),
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
    
    // ==================== DAY/NIGHT CYCLE ====================
    
    updateDayNightCycle(timeOfDay) {
        const dayPhase = timeOfDay;
        
        // Sun position
        const sunAngle = (dayPhase - 0.25) * Math.PI * 2;
        const sunHeight = Math.cos(sunAngle);
        const sunHorizontal = Math.sin(sunAngle);
        
        if (this.game.player) {
            const px = this.game.player.x;
            const py = this.game.player.y;
            const pz = this.game.player.z;
            
            this.sunLight.position.set(
                px + sunHorizontal * 80,
                pz + Math.abs(sunHeight) * 100 + 20,
                py + sunHorizontal * 80
            );
            this.sunLight.target.position.set(px, pz, py);
        }
        
        // Light intensity
        const isDay = sunHeight > -0.2;
        const dayIntensity = Math.max(0, Math.min(1, (sunHeight + 0.2) / 0.7));
        
        this.sunLight.intensity = 0.1 + dayIntensity * 0.9;
        this.ambientLight.intensity = 0.15 + dayIntensity * 0.35;
        
        // Sky color gradient
        const nightColor = new THREE.Color(0x0a1628);
        const sunsetColor = new THREE.Color(0xff6644);
        const dayColor = new THREE.Color(0x87CEEB);
        
        let skyColor;
        if (sunHeight > 0.3) {
            skyColor = dayColor;
        } else if (sunHeight > 0) {
            skyColor = sunsetColor.clone().lerp(dayColor, sunHeight / 0.3);
        } else if (sunHeight > -0.2) {
            skyColor = nightColor.clone().lerp(sunsetColor, (sunHeight + 0.2) / 0.2);
        } else {
            skyColor = nightColor;
        }
        
        this.renderer.setClearColor(skyColor);
        this.scene.fog.color.copy(skyColor);
        
        // Sun color
        if (sunHeight > 0 && sunHeight < 0.3) {
            this.sunLight.color.setHex(0xffaa66);
        } else {
            this.sunLight.color.setHex(0xffffff);
        }
    }
    
    // ==================== MAIN RENDER ====================
    
    render(camera3d, deltaTime = 0.016) {
        if (!camera3d || !camera3d.camera) return;
        
        // Update player model
        if (this.game.player) {
            this.updatePlayerModel(this.game.player, deltaTime);
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update damage numbers
        this.updateDamageNumbers(deltaTime);
        
        // Render scene
        this.renderer.render(this.scene, camera3d.camera);
    }
    
    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    dispose() {
        // Dispose chunk meshes
        for (const mesh of this.chunkMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            if (mesh.material.dispose) mesh.material.dispose();
        }
        this.chunkMeshes.clear();
        
        // Dispose water meshes
        for (const mesh of this.waterMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            if (mesh.material.dispose) mesh.material.dispose();
        }
        this.waterMeshes.clear();
        
        // Dispose entity meshes
        for (const mesh of this.entityMeshes.values()) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            if (mesh.material.dispose) mesh.material.dispose();
        }
        this.entityMeshes.clear();
        
        // Dispose particles
        for (const p of this.particles) {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        }
        this.particles = [];
        
        // Dispose player mesh
        if (this.playerMesh) {
            this.scene.remove(this.playerMesh);
        }
        
        // Dispose texture manager
        this.textureManager.dispose();
        
        this.renderer.dispose();
    }
}
