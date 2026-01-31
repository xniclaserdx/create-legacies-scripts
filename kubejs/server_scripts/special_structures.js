// Structure Scanner System - Ähnlich wie WorldEdit
// Speichert Spieler-Positionen und gescannte Strukturen

// Global storage für Spieler-Positionen und Scan-Daten
global.structureScanner = global.structureScanner || {
    positions: {}, // Speichert pos1 und pos2 für jeden Spieler
    scannedData: {} // Speichert gescannte Strukturdaten für jeden Spieler
};

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    event.register(Commands.literal('structure')
        // /structure pos1
        .then(Commands.literal('pos1').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
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
            
            player.tell(`§aPosition 1 gesetzt: §f${pos.x}, ${pos.y}, ${pos.z}`);
            return 1;
        }))
        
        // /structure pos2
        .then(Commands.literal('pos2').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
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
            
            player.tell(`§aPosition 2 gesetzt: §f${pos.x}, ${pos.y}, ${pos.z}`);
            return 1;
        }))
        
        // /structure scan
        .then(Commands.literal('scan').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            const positions = global.structureScanner.positions[playerId];
            
            if (!positions || !positions.pos1 || !positions.pos2) {
                player.tell('§cBitte setze zuerst beide Positionen mit /structure pos1 und /structure pos2!');
                return 0;
            }
            
            const pos1 = positions.pos1;
            const pos2 = positions.pos2;
            
            // Berechne min/max Koordinaten
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
            
            player.tell(`§eScanne Struktur... Größe: §f${sizeX}x${sizeY}x${sizeZ} §e(${totalBlocks} Blöcke)`);
            
            // Scanne alle Blöcke im Bereich
            const blocks = [];
            const level = player.level;
            
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        const blockPos = { x: x, y: y, z: z };
                        const block = level.getBlock(blockPos);
                        
                        // Speichere relative Position zum Ursprung (minX, minY, minZ)
                        const relativePos = {
                            x: x - minX,
                            y: y - minY,
                            z: z - minZ
                        };
                        
                        // Speichere Block-Informationen
                        const blockData = {
                            pos: relativePos,
                            id: block.id,
                            properties: {}
                        };
                        
                        // Speichere Block-Properties (z.B. facing, waterlogged, etc.)
                        const blockState = block.blockState;
                        if (blockState && blockState.properties) {
                            const props = blockState.properties;
                            const propNames = props.getNames();
                            propNames.forEach(propName => {
                                blockData.properties[propName] = props.getValue(propName);
                            });
                        }
                        
                        // Optional: Speichere Block Entity Daten (Truhen, Signs, etc.)
                        const blockEntity = block.entity;
                        if (blockEntity) {
                            blockData.nbt = blockEntity.serializeNBT().toString();
                        }
                        
                        blocks.push(blockData);
                    }
                }
            }
            
            // Speichere gescannte Daten
            global.structureScanner.scannedData[playerId] = {
                size: { x: sizeX, y: sizeY, z: sizeZ },
                origin: { x: minX, y: minY, z: minZ },
                blocks: blocks,
                timestamp: Date.now()
            };
            
            player.tell(`§aErfolgreich gescannt! §f${blocks.length} §aBlöcke gespeichert.`);
            player.tell(`§eVerwende §f/structure save <Name> §eum die Struktur zu speichern.`);
            
            return 1;
        }))
        
        // /structure save <name>
        .then(Commands.literal('save')
            .then(Commands.argument('name', Arguments.STRING.create(event)).executes(ctx => {
                const player = ctx.source.player;
                if (!player) {
                    ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
                    return 0;
                }
                
                const playerId = player.uuid.toString();
                const scannedData = global.structureScanner.scannedData[playerId];
                
                if (!scannedData) {
                    player.tell('§cKeine gescannte Struktur gefunden! Verwende zuerst /structure scan.');
                    return 0;
                }
                
                const structureName = Arguments.STRING.getResult(ctx, 'name');
                const fileName = structureName.replace(/[^a-zA-Z0-9_-]/g, '_');
                
                // Erstelle Struktur-Objekt
                const structure = {
                    name: structureName,
                    created: new Date().toISOString(),
                    creator: player.name.string,
                    size: scannedData.size,
                    origin: scannedData.origin,
                    totalBlocks: scannedData.blocks.length,
                    blocks: scannedData.blocks
                };
                
                // Speichere als JSON-Datei
                try {
                    const filePath = `kubejs/data/structures/${fileName}.json`;
                    const jsonString = JSON.stringify(structure, null, 2);
                    
                    // Schreibe Datei
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
                    
                    player.tell(`§aStruktur erfolgreich gespeichert: §f${fileName}.json`);
                    player.tell(`§7Pfad: ${filePath}`);
                    player.tell(`§7Größe: ${structure.size.x}x${structure.size.y}x${structure.size.z}, Blöcke: ${structure.totalBlocks}`);
                    
                    return 1;
                } catch (error) {
                    player.tell(`§cFehler beim Speichern: ${error}`);
                    console.error('Structure save error: ' + error);
                    return 0;
                }
            }))
        )
        
        // /structure info
        .then(Commands.literal('info').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
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
                player.tell('§7Position 1: Nicht gesetzt');
            }
            
            if (positions && positions.pos2) {
                const p2 = positions.pos2;
                player.tell(`§aPosition 2: §f${p2.x}, ${p2.y}, ${p2.z}`);
            } else {
                player.tell('§7Position 2: Nicht gesetzt');
            }
            
            if (positions && positions.pos1 && positions.pos2) {
                const p1 = positions.pos1;
                const p2 = positions.pos2;
                const sizeX = Math.abs(p2.x - p1.x) + 1;
                const sizeY = Math.abs(p2.y - p1.y) + 1;
                const sizeZ = Math.abs(p2.z - p1.z) + 1;
                player.tell(`§eGröße: §f${sizeX}x${sizeY}x${sizeZ} §e(${sizeX * sizeY * sizeZ} Blöcke)`);
            }
            
            if (scannedData) {
                player.tell(`§aGescannte Struktur vorhanden: §f${scannedData.blocks.length} Blöcke`);
                player.tell(`§7Verwende /structure save <Name> zum Speichern`);
            } else {
                player.tell('§7Keine gescannte Struktur vorhanden');
            }
            
            return 1;
        }))
        
        // /structure load <filename>
        .then(Commands.literal('load')
            .then(Commands.argument('filename', Arguments.STRING.create(event)).executes(ctx => {
                const player = ctx.source.player;
                if (!player) {
                    ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
                    return 0;
                }
                
                const fileName = Arguments.STRING.getResult(ctx, 'filename');
                const playerId = player.uuid.toString();
                
                // Einfachere Variante: Lade JSON statt NBT
                // NBT-Dateien müssen erst mit /structure scan + save konvertiert werden
                try {
                    let jsonPath = `structures/${fileName}`;
                    if (!jsonPath.endsWith('.json')) {
                        jsonPath += '.json';
                    }
                    
                    let structureData = JsonIO.read(jsonPath);
                    
                    if (!structureData || !structureData.blocks) {
                        player.tell('§cKeine gültige Struktur-Datei gefunden!');
                        player.tell('§7Hinweis: NBT-Dateien werden derzeit nicht unterstützt.');
                        player.tell('§7Verwende /structure scan und /structure save um Strukturen zu speichern.');
                        return 0;
                    }
                    
                    // Lade aus JSON
                    global.structureScanner.scannedData[playerId] = {
                        size: structureData.size || { x: 1, y: 1, z: 1 },
                        origin: structureData.origin || { x: 0, y: 0, z: 0 },
                        blocks: structureData.blocks || [],
                        timestamp: Date.now(),
                        source: 'loaded_from_json',
                        sourceFile: jsonPath
                    };
                    
                    player.tell(`§aERFOLGREICH! JSON-Struktur geladen:`);
                    player.tell(`§fGröße: ${structureData.size.x}x${structureData.size.y}x${structureData.size.z}`);
                    player.tell(`§fBlöcke: ${structureData.blocks.length}`);
                    player.tell('§eVerwende §f/structure paste §eum zu platzieren');
                    
                    player.tell('§eVerwende §f/structure paste §eum zu platzieren');
                    
                    return 1;
                } catch (error) {
                    player.tell(`§cFehler beim Laden: ${error}`);
                    console.error('Structure load error: ' + error);
                    return 0;
                }
            }))
        )
        
        // /structure paste
        .then(Commands.literal('paste').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            const scannedData = global.structureScanner.scannedData[playerId];
            
            if (!scannedData) {
                player.tell('§cKeine Struktur zum Platzieren! Verwende /structure scan oder /structure load zuerst.');
                return 0;
            }
            
            const playerPos = player.block.pos;
            const level = player.level;
            const blocks = scannedData.blocks;
            
            player.tell(`§ePlatziere Struktur... ${blocks.length} Blöcke`);
            
            let placedBlocks = 0;
            let failedBlocks = 0;
            
            // Platziere alle Blöcke
            blocks.forEach(blockData => {
                try {
                    const worldPos = {
                        x: playerPos.x + blockData.pos.x,
                        y: playerPos.y + blockData.pos.y,
                        z: playerPos.z + blockData.pos.z
                    };
                    
                    // Erstelle Block mit Properties
                    let blockToPlace = Block.id(blockData.id);
                    
                    // Setze Block Properties
                    if (blockData.properties && Object.keys(blockData.properties).length > 0) {
                        Object.entries(blockData.properties).forEach(([prop, value]) => {
                            try {
                                blockToPlace = blockToPlace.with(prop, value);
                            } catch (e) {
                                // Ignoriere invalide Properties
                            }
                        });
                    }
                    
                    level.setBlock(worldPos, blockToPlace, 3);
                    placedBlocks++;
                    
                    // Setze NBT-Daten falls vorhanden
                    if (blockData.nbt) {
                        try {
                            const blockEntity = level.getBlockEntity(worldPos);
                            if (blockEntity) {
                                const CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
                                const nbtTag = CompoundTag.parseTag(blockData.nbt);
                                blockEntity.deserializeNBT(nbtTag);
                            }
                        } catch (e) {
                            // NBT setzen fehlgeschlagen
                        }
                    }
                } catch (error) {
                    failedBlocks++;
                }
            });
            
            player.tell(`§aStruktur platziert!`);
            player.tell(`§fErfolgreich: ${placedBlocks} Blöcke`);
            if (failedBlocks > 0) {
                player.tell(`§cFehlgeschlagen: ${failedBlocks} Blöcke`);
            }
            
            return 1;
        }))
        
        // /structure clear
        .then(Commands.literal('clear').executes(ctx => {
            const player = ctx.source.player;
            if (!player) {
                ctx.source.sendFailure('§cDieser Command kann nur von einem Spieler ausgeführt werden!');
                return 0;
            }
            
            const playerId = player.uuid.toString();
            delete global.structureScanner.positions[playerId];
            delete global.structureScanner.scannedData[playerId];
            
            player.tell('§aAuswahl und gescannte Daten wurden gelöscht.');
            return 1;
        }))
    );
});

console.info('Structure Scanner System geladen - Commands: /structure pos1, /structure pos2, /structure scan, /structure save <name>, /structure load <filename>, /structure paste');
