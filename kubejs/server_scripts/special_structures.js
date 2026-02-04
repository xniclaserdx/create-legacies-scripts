// Structure Scanner System - Similar to WorldEdit
// Stores player positions and scanned structures

// Global storage for player positions and scan data
global.structureScanner = global.structureScanner || {
    positions: {}, // Stores pos1 and pos2 for each player
    scannedData: {} // Stores scanned structure data for each player
};

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    event.register(Commands.literal('structure')
        // /structure pos1
        .then(Commands.literal('pos1').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const pos = player.block.pos;
            const playerId = player.uuid.toString();
            
            if (!global.structureScanner.positions[playerId]) {
                global.structureScanner.positions[playerId] = {};
            }
            
            global.structureScanner.positions[playerId].pos1 = {
                x: pos.x,
                y: pos.y,
                z: pos.z
            };
            
            player.tell(`§aPosition 1 set: §f${pos.x}, ${pos.y}, ${pos.z}`);
            return 1;
        }))
        
        // /structure pos2
        .then(Commands.literal('pos2').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const pos = player.block.pos;
            const playerId = player.uuid.toString();
            
            if (!global.structureScanner.positions[playerId]) {
                global.structureScanner.positions[playerId] = {};
            }
            
            global.structureScanner.positions[playerId].pos2 = {
                x: pos.x,
                y: pos.y,
                z: pos.z
            };
            
            player.tell(`§aPosition 2 set: §f${pos.x}, ${pos.y}, ${pos.z}`);
            return 1;
        }))
        
        // /structure scan
        .then(Commands.literal('scan').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            const positions = global.structureScanner.positions[playerId];
            
            if (!positions || !positions.pos1 || !positions.pos2) {
                player.tell('§cPlease set both positions first with /structure pos1 and /structure pos2!');
                return 0;
            }
            
            const pos1 = positions.pos1;
            const pos2 = positions.pos2;
            
            // Calculate min/max coordinates
            const minX = Math.min(pos1.x, pos2.x);
            const maxX = Math.max(pos1.x, pos2.x);
            const minY = Math.min(pos1.y, pos2.y);
            const maxY = Math.max(pos1.y, pos2.y);
            const minZ = Math.min(pos1.z, pos2.z);
            const maxZ = Math.max(pos1.z, pos2.z);
            
            const sizeX = maxX - minX + 1;
            const sizeY = maxY - minY + 1;
            const sizeZ = maxZ - minZ + 1;
            const totalBlocks = sizeX * sizeY * sizeZ;
            
            player.tell(`§eScanning structure... Size: §f${sizeX}x${sizeY}x${sizeZ} §e(${totalBlocks} blocks)`);
            
            // Scan all blocks in the area
            const blocks = [];
            const level = player.level;
            
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        const blockPos = { x: x, y: y, z: z };
                        const block = level.getBlock(blockPos);
                        
                        // Save relative position to origin (minX, minY, minZ)
                        const relativePos = {
                            x: x - minX,
                            y: y - minY,
                            z: z - minZ
                        };
                        
                        // Save block information
                        const blockData = {
                            pos: relativePos,
                            id: block.id,
                            properties: {}
                        };
                        
                        // Save block properties (e.g., facing, waterlogged, etc.)
                        const blockState = block.blockState;
                        if (blockState && blockState.properties) {
                            const props = blockState.properties;
                            const propNames = props.getNames();
                            propNames.forEach(propName => {
                                blockData.properties[propName] = props.getValue(propName);
                            });
                        }
                        
                        // Optional: Save block entity data (chests, signs, etc.)
                        const blockEntity = block.entity;
                        if (blockEntity) {
                            blockData.nbt = blockEntity.serializeNBT().toString();
                        }
                        
                        blocks.push(blockData);
                    }
                }
            }
            
            // Save scanned data
            global.structureScanner.scannedData[playerId] = {
                size: { x: sizeX, y: sizeY, z: sizeZ },
                origin: { x: minX, y: minY, z: minZ },
                blocks: blocks,
                timestamp: Date.now()
            };
            
            player.tell(`§aSuccessfully scanned! §f${blocks.length} §ablocks saved.`);
            player.tell(`§eUse §f/structure save <Name> §eto save the structure.`);
            
            return 1;
        }))
        
        // /structure save <name>
        .then(Commands.literal('save')
            .then(Commands.argument('name', Arguments.STRING.create(event)).executes(ctx => {
                const player = ctx.source.player;
                if (!player) {
                    ctx.source.sendFailure('§cThis command can only be executed by a player!');
                    return 0;
                }
                
                const playerId = player.uuid.toString();
                const scannedData = global.structureScanner.scannedData[playerId];
                
                if (!scannedData) {
                    player.tell('§cNo scanned structure found! Use /structure scan first.');
                    return 0;
                }
                
                const structureName = Arguments.STRING.getResult(ctx, 'name');
                const fileName = structureName.replace(/[^a-zA-Z0-9_-]/g, '_');
                
                // Create structure object
                const structure = {
                    name: structureName,
                    created: new Date().toISOString(),
                    creator: player.name.string,
                    size: scannedData.size,
                    origin: scannedData.origin,
                    totalBlocks: scannedData.blocks.length,
                    blocks: scannedData.blocks
                };
                
                // Save as JSON file
                try {
                    const filePath = `kubejs/data/structures/${fileName}.json`;
                    const jsonString = JSON.stringify(structure, null, 2);
                    
                    // Write file
                    const File = Java.loadClass('java.io.File');
                    const FileWriter = Java.loadClass('java.io.FileWriter');
                    
                    const file = new File(filePath);
                    const parentDir = file.getParentFile();
                    if (!parentDir.exists()) {
                        parentDir.mkdirs();
                    }
                    
                    const writer = new FileWriter(file);
                    writer.write(jsonString);
                    writer.close();
                    
                    player.tell(`§aStructure successfully saved: §f${fileName}.json`);
                    player.tell(`§7Path: ${filePath}`);
                    player.tell(`§7Size: ${structure.size.x}x${structure.size.y}x${structure.size.z}, Blocks: ${structure.totalBlocks}`);
                    
                    return 1;
                } catch (error) {
                    player.tell(`§cError while saving: ${error}`);
                    console.error('Structure save error: ' + error);
                    return 0;
                }
            }))
        )
        
        // /structure info
        .then(Commands.literal('info').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            const positions = global.structureScanner.positions[playerId];
            const scannedData = global.structureScanner.scannedData[playerId];
            
            player.tell('§6=== Structure Scanner Info ===');
            
            if (positions && positions.pos1) {
                const p1 = positions.pos1;
                player.tell(`§aPosition 1: §f${p1.x}, ${p1.y}, ${p1.z}`);
            } else {
                player.tell('§7Position 1: Not set');
            }
            
            if (positions && positions.pos2) {
                const p2 = positions.pos2;
                player.tell(`§aPosition 2: §f${p2.x}, ${p2.y}, ${p2.z}`);
            } else {
                player.tell('§7Position 2: Not set');
            }
            
            if (positions && positions.pos1 && positions.pos2) {
                const p1 = positions.pos1;
                const p2 = positions.pos2;
                const sizeX = Math.abs(p2.x - p1.x) + 1;
                const sizeY = Math.abs(p2.y - p1.y) + 1;
                const sizeZ = Math.abs(p2.z - p1.z) + 1;
                player.tell(`§eSize: §f${sizeX}x${sizeY}x${sizeZ} §e(${sizeX * sizeY * sizeZ} blocks)`);
            }
            
            if (scannedData) {
                player.tell(`§aScanned structure available: §f${scannedData.blocks.length} blocks`);
                player.tell(`§7Use /structure save <Name> to save`);
            } else {
                player.tell('§7No scanned structure available');
            }
            
            return 1;
        }))
        
        // /structure load <filename>
        .then(Commands.literal('load')
            .then(Commands.argument('filename', Arguments.STRING.create(event)).executes(ctx => {
                const player = ctx.source.player;
                if (!player) {
                    ctx.source.sendFailure('§cThis command can only be executed by a player!');
                    return 0;
                }
                
                const fileName = Arguments.STRING.getResult(ctx, 'filename');
                const playerId = player.uuid.toString();
                
                // Simpler variant: Load JSON instead of NBT
                // NBT files must first be converted with /structure scan + save
                try {
                    let jsonPath = `structures/${fileName}`;
                    if (!jsonPath.endsWith('.json')) {
                        jsonPath += '.json';
                    }
                    
                    let structureData = JsonIO.read(jsonPath);
                    
                    if (!structureData || !structureData.blocks) {
                        player.tell('§cNo valid structure file found!');
                        player.tell('§7Note: NBT files are currently not supported.');
                        player.tell('§7Use /structure scan and /structure save to save structures.');
                        return 0;
                    }
                    
                    // Load from JSON
                    global.structureScanner.scannedData[playerId] = {
                        size: structureData.size || { x: 1, y: 1, z: 1 },
                        origin: structureData.origin || { x: 0, y: 0, z: 0 },
                        blocks: structureData.blocks || [],
                        timestamp: Date.now(),
                        source: 'loaded_from_json',
                        sourceFile: jsonPath
                    };
                    
                    player.tell(`§aSUCCESS! JSON structure loaded:`);
                    player.tell(`§fSize: ${structureData.size.x}x${structureData.size.y}x${structureData.size.z}`);
                    player.tell(`§fBlocks: ${structureData.blocks.length}`);
                    player.tell('§eUse §f/structure paste §eto place');
                    
                    player.tell('§eUse §f/structure paste §eto place');
                    
                    return 1;
                } catch (error) {
                    player.tell(`§cError while loading: ${error}`);
                    console.error('Structure load error: ' + error);
                    return 0;
                }
            }))
        )
        
        // /structure paste
        .then(Commands.literal('paste').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            const scannedData = global.structureScanner.scannedData[playerId];
            
            if (!scannedData) {
                player.tell('§cNo structure to place! Use /structure scan or /structure load first.');
                return 0;
            }
            
            const playerPos = player.block.pos;
            const level = player.level;
            const blocks = scannedData.blocks;
            
            player.tell(`§ePlacing structure... ${blocks.length} blocks`);
            
            let placedBlocks = 0;
            let failedBlocks = 0;
            
            // Place all blocks
            blocks.forEach(blockData => {
                try {
                    const worldPos = {
                        x: playerPos.x + blockData.pos.x,
                        y: playerPos.y + blockData.pos.y,
                        z: playerPos.z + blockData.pos.z
                    };
                    
                    // Create block with properties
                    let blockToPlace = Block.id(blockData.id);
                    
                    // Set block properties
                    if (blockData.properties && Object.keys(blockData.properties).length > 0) {
                        Object.entries(blockData.properties).forEach(([prop, value]) => {
                            try {
                                blockToPlace = blockToPlace.with(prop, value);
                            } catch (e) {
                                // Ignore invalid properties
                            }
                        });
                    }
                    
                    level.setBlock(worldPos, blockToPlace, 3);
                    placedBlocks++;
                    
                    // Set NBT data if present
                    if (blockData.nbt) {
                        try {
                            const blockEntity = level.getBlockEntity(worldPos);
                            if (blockEntity) {
                                const CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
                                const nbtTag = CompoundTag.parseTag(blockData.nbt);
                                blockEntity.deserializeNBT(nbtTag);
                            }
                        } catch (e) {
                            // Setting NBT failed
                        }
                    }
                } catch (error) {
                    failedBlocks++;
                }
            });
            
            player.tell(`§aStructure placed!`);
            player.tell(`§fSuccessful: ${placedBlocks} blocks`);
            if (failedBlocks > 0) {
                player.tell(`§cFailed: ${failedBlocks} blocks`);
            }
            
            return 1;
        }))
        
        // /structure clear
        .then(Commands.literal('clear').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cThis command can only be executed by a player!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            delete global.structureScanner.positions[playerId];
            delete global.structureScanner.scannedData[playerId];
            
            player.tell('§aSelection and scanned data have been cleared.');
            return 1;
        }))
    );
});

console.info('Structure Scanner System loaded - Commands: /structure pos1, /structure pos2, /structure scan, /structure save <name>, /structure load <filename>, /structure paste');
