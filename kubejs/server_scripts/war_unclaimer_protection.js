// ==================== HARDCORE REVIVAL INTEGRATION ====================
// Globale Variable für knocked down Spieler
global.knockedDownPlayers = global.knockedDownPlayers || new Map() // Player-UUID -> { warKeys: [], checkStartTime }
global.unclaimersToReturn = global.unclaimersToReturn || new Map() // Player-UUID -> Array of warKeys (für Respawn)

// Hardcore Revival Event - Spieler wird gedownt
NativeEvents.onEvent(
    Java.loadClass('net.blay09.mods.hardcorerevival.api.PlayerKnockedOutEvent'),
    event => {
        let player = event.getPlayer()
        if (!player || !player.isPlayer()) return
        
        let playerUuid = player.uuid.toString()
        console.log('[FactionWar] Player knocked down: ' + player.username)
        
        // Suche nach War Unclaimer Items im Inventar
        let inventory = player.inventory
        let foundUnclaimers = []
        let itemsToRemove = []
        
        for (let i = 0; i < inventory.containerSize; i++) {
            let item = inventory.getItem(i)
            if (item && item.nbt && item.nbt.warUnclaimer === 1 && item.nbt.warID) {
                foundUnclaimers.push({
                    warKey: item.nbt.warID,
                    slot: i
                })
                itemsToRemove.push(i)
            }
        }
        
        if (foundUnclaimers.length > 0) {
            // Speichere die War Keys
            global.knockedDownPlayers.set(playerUuid, {
                warKeys: foundUnclaimers.map(u => u.warKey),
                checkStartTime: Date.now()
            })
            
            // Entferne Items aus Inventar
            itemsToRemove.forEach(slot => {
                inventory.removeItem(slot, 64)
            })
            
            console.log('[FactionWar] Removed ' + foundUnclaimers.length + ' unclaimer items from ' + player.username + ' (knocked down)')
            player.tell(Component.yellow('§e[War] Your War Unclaimer items have been secured during knock down.'))
        }
    }
)

// Tick Event - Überwache knocked down Spieler
ServerEvents.tick(event => {
    if (!event.server) return
    if (event.server.tickCount % 20 !== 0) return // Nur jede Sekunde prüfen
    
    if (global.knockedDownPlayers.size === 0) return
    
    let playersToRestore = []
    
    global.knockedDownPlayers.forEach((data, playerUuid) => {
        try {
            let UUID = Java.loadClass('java.util.UUID')
            let player = event.server.getPlayerList().getPlayer(UUID.fromString(playerUuid))
            
            if (!player) {
                // Spieler offline - entferne Tracking
                playersToRestore.push(playerUuid)
                return
            }
            
            // Prüfe ob Spieler noch knocked down ist
            let HardcoreRevival = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
            let revivalData = HardcoreRevival.getRevivalData(player)
            let isKnockedOut = revivalData.isKnockedOut()
            
            if (!isKnockedOut) {
                // Spieler ist nicht mehr knocked down
                // Prüfe ob er wiederbelebt wurde (lebt noch) oder gestorben ist (wartet auf Respawn)
                
                if (player.isAlive()) {
                    // Spieler wurde wiederbelebt - gib Items sofort zurück
                    let returnedCount = 0
                    
                    data.warKeys.forEach(warKey => {
                        // Prüfe ob der War noch existiert
                        if (global.activeWars.has(warKey)) {
                            // Prüfe ob Spieler noch in einem der War-Teams ist
                            let warData = global.activeWars.get(warKey)
                            let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                            let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                            
                            if (playerTeamOptional && playerTeamOptional.isPresent()) {
                                let playerPartyId = playerTeamOptional.get().getTeamId().toString()
                                
                                if (warData.myPartyId === playerPartyId || warData.enemyPartyId === playerPartyId) {
                                    // Spieler ist noch Teil des Wars - gib Item zurück
                                    let item = Item.of('minecraft:golden_sword', {
                                        warUnclaimer: 1,
                                        warID: warKey,
                                        adminIssued: 'true',
                                        Unbreakable: 1,
                                        display: {
                                            Name: '{"text":"§6§lWar Unclaimer","italic":false}',
                                            Lore: [
                                                '{"text":"§7Right-click in enemy territory","italic":false}',
                                                '{"text":"§7to start unclaiming process","italic":false}',
                                                '{"text":"","italic":false}',
                                                '{"text":"§7Duration: §e60 seconds","italic":false}',
                                                '{"text":"§cDo not move!","italic":false}'
                                            ]
                                        }
                                    })
                                    player.give(item)
                                    returnedCount++
                                }
                            }
                        }
                    })
                    
                    if (returnedCount > 0) {
                        player.tell(Component.green('§a[War] Your War Unclaimer items have been returned! (' + returnedCount + ')'))
                        console.log('[FactionWar] Returned ' + returnedCount + ' unclaimer items to ' + player.username + ' (revived)')
                    }
                } else {
                    // Spieler ist gestorben - speichere für Respawn (nur wenn nicht schon vorhanden)
                    let alreadyQueued = false
                    global.unclaimersToReturn.forEach((value, key) => {
                        if (key === playerUuid || key.toString() === playerUuid.toString()) {
                            alreadyQueued = true
                        }
                    })
                    
                    if (!alreadyQueued) {
                        global.unclaimersToReturn.set(playerUuid, data.warKeys)
                        console.log('[FactionWar] Queued ' + data.warKeys.length + ' unclaimer items for ' + player.username + ' (respawn)')
                    } else {
                        console.log('[FactionWar] Items already queued for ' + player.username + ', skipping duplicate')
                    }
                }
                
                playersToRestore.push(playerUuid)
            } else {
                // Spieler ist noch knocked down - timeout check (5 Minuten)
                let elapsed = Date.now() - data.checkStartTime
                if (elapsed > 5 * 60 * 1000) {
                    console.log('[FactionWar] Timeout for knocked down player: ' + player.username)
                    playersToRestore.push(playerUuid)
                }
            }
        } catch (error) {
            console.error('[FactionWar] Error checking knocked down player: ' + error)
            playersToRestore.push(playerUuid)
        }
    })
    
    // Entferne abgeschlossene Überwachungen
    playersToRestore.forEach(playerUuid => {
        global.knockedDownPlayers.delete(playerUuid)
    })
})

// ==================== DISCONNECT HANDLER ====================
// Wenn Spieler disconnected während er downed ist, Items in Queue packen
PlayerEvents.loggedOut(event => {
    let player = event.player
    if (!player) return
    
    let playerUuid = player.uuid
    
    // Prüfe ob Spieler in knockedDownPlayers Map ist (manuelle Iteration wegen Java-UUID)
    let foundData = null
    let keyToDelete = null
    
    global.knockedDownPlayers.forEach((value, key) => {
        if (key === playerUuid || key.toString() === playerUuid.toString()) {
            foundData = value
            keyToDelete = key
        }
    })
    
    if (foundData) {
        console.log('[FactionWar] Player ' + player.username + ' disconnected while downed, queueing items')
        
        // Packe Items in Respawn-Queue
        let alreadyQueued = false
        global.unclaimersToReturn.forEach((value, key) => {
            if (key === playerUuid || key.toString() === playerUuid.toString()) {
                alreadyQueued = true
            }
        })
        
        if (!alreadyQueued) {
            global.unclaimersToReturn.set(playerUuid, foundData.warKeys)
            console.log('[FactionWar] Queued ' + foundData.warKeys.length + ' items for ' + player.username + ' (disconnected while downed)')
        }
        
        // Entferne aus knockedDownPlayers
        if (keyToDelete) {
            global.knockedDownPlayers.delete(keyToDelete)
        }
    }
})

// ==================== RESPAWN HANDLER ====================
// Gib War Unclaimer Items beim Respawn zurück
PlayerEvents.respawned(event => {
    let player = event.player
    let playerUuid = player.uuid.toString()
    
    // Workaround: Java-UUID-Objekte funktionieren nicht mit .has()/.get(), daher manuelle Iteration
    let foundMatch = false
    let matchedValue = null
    let keysToDelete = [] // Sammle ALLE Keys für diesen Spieler zum Löschen
    
    global.unclaimersToReturn.forEach((value, key) => {
        if (key === playerUuid || key.toString() === playerUuid.toString()) {
            if (!foundMatch) {
                // Verwende nur den ersten Match (normalerweise gibt es nur einen)
                foundMatch = true
                matchedValue = value
            }
            keysToDelete.push(key) // Sammle ALLE Keys zum Löschen (für Duplikate)
        }
    })
    
    if (foundMatch && matchedValue) {
        let warKeys = matchedValue
        
        // Warte 20 Ticks (1 Sekunde) damit Inventar bereit ist
        player.server.scheduleInTicks(20, () => {
            let returnedCount = 0
            
            warKeys.forEach(warKey => {
                // Prüfe ob der War noch existiert
                if (global.activeWars.has(warKey)) {
                    // Prüfe ob Spieler noch in einem der War-Teams ist
                    let warData = global.activeWars.get(warKey)
                    let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                    let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                    
                    if (playerTeamOptional && playerTeamOptional.isPresent()) {
                        let playerPartyId = playerTeamOptional.get().getTeamId().toString()
                        
                        if (warData.myPartyId === playerPartyId || warData.enemyPartyId === playerPartyId) {
                            // Spieler ist noch Teil des Wars - gib Item zurück
                            let item = Item.of('minecraft:golden_sword', {
                                warUnclaimer: 1,
                                warID: warKey,
                                adminIssued: 'true',
                                Unbreakable: 1,
                                display: {
                                    Name: '{"text":"§6§lWar Unclaimer","italic":false}',
                                    Lore: [
                                        '{"text":"§7Right-click in enemy territory","italic":false}',
                                        '{"text":"§7to start unclaiming process","italic":false}',
                                        '{"text":"","italic":false}',
                                        '{"text":"§7Duration: §e60 seconds","italic":false}',
                                        '{"text":"§cDo not move!","italic":false}'
                                    ]
                                }
                            })
                            player.give(item)
                            returnedCount++
                        }
                    }
                }
            })
            
            if (returnedCount > 0) {
                player.tell(Component.green('§a[War] Your War Unclaimer items have been returned! (' + returnedCount + ')'))
                console.log('[FactionWar] Returned ' + returnedCount + ' unclaimer items to ' + player.username + ' (respawned after knock down)')
            }
            
            // Entferne ALLE Einträge für diesen Spieler aus der Queue
            // Workaround: forEach + delete mit Java-UUID Keys funktioniert nicht zuverlässig
            // Erstelle neue Map ohne die zu löschenden Einträge
            let newQueue = new Map()
            global.unclaimersToReturn.forEach((value, key) => {
                let shouldKeep = true
                keysToDelete.forEach(keyToDelete => {
                    if (key === keyToDelete || key.toString() === keyToDelete.toString()) {
                        shouldKeep = false
                    }
                })
                if (shouldKeep) {
                    newQueue.set(key, value)
                }
            })
            global.unclaimersToReturn = newQueue
        })
    }
})

// ==================== LOGIN CLEANUP ====================
// Entferne Unclaimer Items beim Login wenn der Krieg vorbei ist
// UND gib Items zurück wenn sie noch in der Respawn-Queue sind
PlayerEvents.loggedIn(event => {
    let player = event.player
    let playerUuid = player.uuid.toString()
    
    // Warte 20 Ticks bevor wir das Inventar prüfen
    Utils.server.scheduleInTicks(20, () => {
        // ERST: Prüfe ob Spieler Items in der Respawn-Queue hat (z.B. nach Logout im Death Screen)
        let foundInQueue = false
        let queuedWarKeys = null
        let keysToDelete = [] // Sammle ALLE Keys für diesen Spieler zum Löschen
        
        global.unclaimersToReturn.forEach((value, key) => {
            if (key === playerUuid || key.toString() === playerUuid.toString()) {
                if (!foundInQueue) {
                    // Verwende nur den ersten Match (normalerweise gibt es nur einen)
                    foundInQueue = true
                    queuedWarKeys = value
                }
                keysToDelete.push(key) // Sammle ALLE Keys zum Löschen (für Duplikate)
            }
        })
        
        // Items NUR zurückgeben wenn Spieler VOLLSTÄNDIG lebendig ist (nicht downed, nicht im death screen)
        // Sonst: Queue bleibt unberührt, Tick-Event (revival) oder Respawn-Event (death) kümmert sich darum
        if (foundInQueue) {
            // Prüfe ob Spieler downed ist
            let isKnockedOut = false
            try {
                let HardcoreRevival = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
                let revivalData = HardcoreRevival.getRevivalData(player)
                if (revivalData) {
                    isKnockedOut = revivalData.isKnockedOut()
                }
            } catch (error) {
                // Silent error handling
            }
            
            if (isKnockedOut) {
                console.log('[FactionWar] Player ' + player.username + ' logged in while downed, items remain queued')
            } else if (!player.isAlive()) {
                console.log('[FactionWar] Player ' + player.username + ' logged in while dead, items remain queued')
            } else {
                // Spieler ist vollständig lebendig - gib Items zurück und lösche Queue
                console.log('[FactionWar] Player ' + player.username + ' logged in alive with queued items, returning them')
                let returnedCount = 0
                
                queuedWarKeys.forEach(warKey => {
                    if (global.activeWars.has(warKey)) {
                        let warData = global.activeWars.get(warKey)
                        let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                        let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                        
                        if (playerTeamOptional && playerTeamOptional.isPresent()) {
                            let playerPartyId = playerTeamOptional.get().getTeamId().toString()
                            
                            if (warData.myPartyId === playerPartyId || warData.enemyPartyId === playerPartyId) {
                                let item = Item.of('minecraft:golden_sword', {
                                    warUnclaimer: 1,
                                    warID: warKey,
                                    adminIssued: 'true',
                                    Unbreakable: 1,
                                    display: {
                                        Name: '{"text":"§6§lWar Unclaimer","italic":false}',
                                        Lore: [
                                            '{"text":"§7Right-click in enemy territory","italic":false}',
                                            '{"text":"§7to start unclaiming process","italic":false}',
                                            '{"text":"","italic":false}',
                                            '{"text":"§7Duration: §e60 seconds","italic":false}',
                                            '{"text":"§cDo not move!","italic":false}'
                                        ]
                                    }
                                })
                                player.give(item)
                                returnedCount++
                            }
                        }
                    }
                })
                
                if (returnedCount > 0) {
                    player.tell(Component.green('§a[War] Your War Unclaimer items have been returned! (' + returnedCount + ')'))
                    console.log('[FactionWar] Returned ' + returnedCount + ' unclaimer items to ' + player.username + ' (login alive)')
                }
                
                // Entferne ALLE Einträge für diesen Spieler aus der Queue
                // Workaround: forEach + delete mit Java-UUID Keys funktioniert nicht zuverlässig
                // Erstelle neue Map ohne die zu löschenden Einträge
                let newQueue = new Map()
                global.unclaimersToReturn.forEach((value, key) => {
                    let shouldKeep = true
                    keysToDelete.forEach(keyToDelete => {
                        if (key === keyToDelete || key.toString() === keyToDelete.toString()) {
                            shouldKeep = false
                        }
                    })
                    if (shouldKeep) {
                        newQueue.set(key, value)
                    }
                })
                global.unclaimersToReturn = newQueue
            }
        }
        
        // DANN: Cleanup ungültiger Items (wie bisher)
        let inventory = player.inventory
        let itemsToRemove = []
        
        for (let i = 0; i < inventory.containerSize; i++) {
            let item = inventory.getItem(i)
            if (item && item.nbt && item.nbt.warUnclaimer === 1) {
                let shouldRemove = false
                
                // Prüfe ob das Item eine warID hat
                if (!item.nbt.warID) {
                    shouldRemove = true
                } else {
                    let itemWarID = item.nbt.warID
                    
                    // Prüfe ob dieser War noch existiert
                    if (!global.activeWars.has(itemWarID)) {
                        shouldRemove = true
                    } else {
                        // War existiert noch, prüfe ob Spieler Teil davon ist
                        let warData = global.activeWars.get(itemWarID)
                        let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                        let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                        
                        if (!playerTeamOptional || !playerTeamOptional.isPresent()) {
                            shouldRemove = true
                        } else {
                            let playerTeam = playerTeamOptional.get()
                            let playerPartyId = playerTeam.getTeamId().toString()
                            
                            // Prüfe ob Spieler Teil dieses Wars ist
                            if (warData.myPartyId !== playerPartyId && warData.enemyPartyId !== playerPartyId) {
                                shouldRemove = true
                            }
                        }
                    }
                }
                
                if (shouldRemove) {
                    itemsToRemove.push(i)
                }
            }
        }
        
        // Entferne die Items
        itemsToRemove.forEach(slot => {
            inventory.removeItem(slot, 64)
            console.log('[FactionWar] Removed unclaimer from ' + player.username + ' on login (slot ' + slot + ')')
        })
        
        if (itemsToRemove.length > 0) {
            player.tell(Component.yellow('§e[War] Your war unclaimer items have been removed (war ended or you left the party).'))
        }
    })
})
