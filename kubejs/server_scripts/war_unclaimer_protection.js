// ==================== HARDCORE REVIVAL INTEGRATION ====================
// Global variable for knocked down players
global.knockedDownPlayers = global.knockedDownPlayers || new Map() // Player-UUID -> { warKeys: [], checkStartTime }
global.unclaimersToReturn = global.unclaimersToReturn || new Map() // Player-UUID -> Array of warKeys (for respawn)

// Hardcore Revival event - player gets knocked down
NativeEvents.onEvent(
    Java.loadClass('net.blay09.mods.hardcorerevival.api.PlayerKnockedOutEvent'),
    event => {
        let player = event.getPlayer()
        if (!player || !player.isPlayer()) return
        
        let playerUuid = player.uuid.toString()
        console.log('[FactionWar] Player knocked down: ' + player.username)
        
        // Search for War Unclaimer items in inventory
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
            // Save the war keys
            global.knockedDownPlayers.set(playerUuid, {
                warKeys: foundUnclaimers.map(u => u.warKey),
                checkStartTime: Date.now()
            })
            
            // Remove items from inventory
            itemsToRemove.forEach(slot => {
                inventory.removeItem(slot, 64)
            })
            
            console.log('[FactionWar] Removed ' + foundUnclaimers.length + ' unclaimer items from ' + player.username + ' (knocked down)')
            player.tell(Component.yellow('§e[War] Your War Unclaimer items have been secured during knock down.'))
        }
    }
)

// Tick event - monitor knocked down players
ServerEvents.tick(event => {
    if (!event.server) return
    if (event.server.tickCount % 20 !== 0) return // Only check every second
    
    if (global.knockedDownPlayers.size === 0) return
    
    let playersToRestore = []
    
    global.knockedDownPlayers.forEach((data, playerUuid) => {
        try {
            let UUID = Java.loadClass('java.util.UUID')
            let player = event.server.getPlayerList().getPlayer(UUID.fromString(playerUuid))
            
            if (!player) {
                // Player offline - remove tracking
                playersToRestore.push(playerUuid)
                return
            }
            
            // Check if player is still knocked down
            let HardcoreRevival = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
            let revivalData = HardcoreRevival.getRevivalData(player)
            let isKnockedOut = revivalData.isKnockedOut()
            
            if (!isKnockedOut) {
                // Player is no longer knocked down
                // Check if they were revived (still alive) or died (waiting for respawn)
                
                if (player.isAlive()) {
                    // Player was revived - return items immediately
                    let returnedCount = 0
                    
                    data.warKeys.forEach(warKey => {
                        // Check if the war still exists
                        if (global.activeWars.has(warKey)) {
                            // Check if player is still in one of the war teams
                            let warData = global.activeWars.get(warKey)
                            let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                            let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                            
                            if (playerTeamOptional && playerTeamOptional.isPresent()) {
                                let playerPartyId = playerTeamOptional.get().getTeamId().toString()
                                
                                if (warData.myPartyId === playerPartyId || warData.enemyPartyId === playerPartyId) {
                                    // Player is still part of the war - return item
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
                    // Player died - save for respawn (only if not already queued)
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
                // Player is still knocked down - timeout check (5 minutes)
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
    
    // Remove completed monitors
    playersToRestore.forEach(playerUuid => {
        global.knockedDownPlayers.delete(playerUuid)
    })
})

// ==================== DISCONNECT HANDLER ====================
// If player disconnects while downed, put items in queue
PlayerEvents.loggedOut(event => {
    let player = event.player
    if (!player) return
    
    let playerUuid = player.uuid
    
    // Check if player is in knockedDownPlayers map (manual iteration due to Java UUID)
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
        
        // Put items in respawn queue
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
        
        // Remove from knockedDownPlayers
        if (keyToDelete) {
            global.knockedDownPlayers.delete(keyToDelete)
        }
    }
})

// ==================== RESPAWN HANDLER ====================
// Return War Unclaimer items on respawn
PlayerEvents.respawned(event => {
    let player = event.player
    let playerUuid = player.uuid.toString()
    
    // Workaround: Java UUID objects don't work with .has()/.get(), so manual iteration
    let foundMatch = false
    let matchedValue = null
    let keysToDelete = [] // Collect ALL keys for this player for deletion
    
    global.unclaimersToReturn.forEach((value, key) => {
        if (key === playerUuid || key.toString() === playerUuid.toString()) {
            if (!foundMatch) {
                // Use only the first match (normally there is only one)
                foundMatch = true
                matchedValue = value
            }
            keysToDelete.push(key) // Collect ALL keys for deletion (for duplicates)
        }
    })
    
    if (foundMatch && matchedValue) {
        let warKeys = matchedValue
        
        // Wait 20 ticks (1 second) so inventory is ready
        player.server.scheduleInTicks(20, () => {
            let returnedCount = 0
            
            warKeys.forEach(warKey => {
                // Check if the war still exists
                if (global.activeWars.has(warKey)) {
                    // Check if player is still in one of the war teams
                    let warData = global.activeWars.get(warKey)
                    let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                    let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                    
                    if (playerTeamOptional && playerTeamOptional.isPresent()) {
                        let playerPartyId = playerTeamOptional.get().getTeamId().toString()
                        
                        if (warData.myPartyId === playerPartyId || warData.enemyPartyId === playerPartyId) {
                            // Player is still part of the war - return item
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
            
            // Remove ALL entries for this player from the queue
            // Workaround: forEach + delete with Java UUID keys doesn't work reliably
            // Create new map without the entries to delete
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
// Remove Unclaimer items on login if the war is over
// AND return items if they are still in the respawn queue
PlayerEvents.loggedIn(event => {
    let player = event.player
    let playerUuid = player.uuid.toString()
    
    // Wait 20 ticks before checking inventory
    Utils.server.scheduleInTicks(20, () => {
        // FIRST: Check if player has items in the respawn queue (e.g., after logout in death screen)
        let foundInQueue = false
        let queuedWarKeys = null
        let keysToDelete = [] // Collect ALL keys for this player for deletion
        
        global.unclaimersToReturn.forEach((value, key) => {
            if (key === playerUuid || key.toString() === playerUuid.toString()) {
                if (!foundInQueue) {
                    // Use only the first match (normally there is only one)
                    foundInQueue = true
                    queuedWarKeys = value
                }
                keysToDelete.push(key) // Collect ALL keys for deletion (for duplicates)
            }
        })
        
        // ONLY return items if player is COMPLETELY alive (not downed, not in death screen)
        // Otherwise: Queue stays intact, tick event (revival) or respawn event (death) takes care of it
        if (foundInQueue) {
            // Check if player is downed
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
                // Player is completely alive - return items and delete queue
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
                
                // Remove ALL entries for this player from the queue
                // Workaround: forEach + delete with Java UUID keys doesn't work reliably
                // Create new map without the entries to delete
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
        
        // THEN: Cleanup invalid items (as before)
        let inventory = player.inventory
        let itemsToRemove = []
        
        for (let i = 0; i < inventory.containerSize; i++) {
            let item = inventory.getItem(i)
            if (item && item.nbt && item.nbt.warUnclaimer === 1) {
                let shouldRemove = false
                
                // Check if the item has a warID
                if (!item.nbt.warID) {
                    shouldRemove = true
                } else {
                    let itemWarID = item.nbt.warID
                    
                    // Check if this war still exists
                    if (!global.activeWars.has(itemWarID)) {
                        shouldRemove = true
                    } else {
                        // War still exists, check if player is part of it
                        let warData = global.activeWars.get(itemWarID)
                        let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
                        let playerTeamOptional = FTBTeamsAPI.api().getManager().getTeamByID(player.uuid)
                        
                        if (!playerTeamOptional || !playerTeamOptional.isPresent()) {
                            shouldRemove = true
                        } else {
                            let playerTeam = playerTeamOptional.get()
                            let playerPartyId = playerTeam.getTeamId().toString()
                            
                            // Check if player is part of this war
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
        
        // Remove the items
        itemsToRemove.forEach(slot => {
            inventory.removeItem(slot, 64)
            console.log('[FactionWar] Removed unclaimer from ' + player.username + ' on login (slot ' + slot + ')')
        })
        
        if (itemsToRemove.length > 0) {
            player.tell(Component.yellow('§e[War] Your war unclaimer items have been removed (war ended or you left the party).'))
        }
    })
})
