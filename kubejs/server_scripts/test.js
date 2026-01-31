// ==================== GLOBALE VARIABLEN ====================
global.activeWars = global.activeWars || new Map()
global.activeUnclaims = global.activeUnclaims || new Map()
global.whitePeaceRequests = global.whitePeaceRequests || new Map()
global.defeatCooldowns = global.defeatCooldowns || new Map() // Party-ID -> Timestamp
global.warDeclareCooldowns = global.warDeclareCooldowns || new Map() // Party-ID -> Timestamp
global.totalWarRequests = global.totalWarRequests || new Map() // War-Key -> { requesterId, timestamp }

// ==================== KONSTANTEN ====================
const WAR_DURATION = 2 * 60 * 60 * 1000 // 2 Stunden
const UNCLAIM_DURATION = 60000 // 60 Sekunden
const PEACE_REQUEST_TIMEOUT = 6000 // 5 Minuten in Ticks
const DEFEAT_COOLDOWN = 60 * 60 * 1000 // 1 Stunde Claim-Sperre nach Niederlage
const WAR_DECLARE_COOLDOWN = 24 * 60 * 60 * 1000 // 24 Stunden bis nächste Kriegserklärung
const WAR_DATA_FILE = 'war_data.json' // Datei für persistente Speicherung
const WAR_SETTINGS = {
    war: { allow_pvp: 'true', block_edit_mode: 'private', allow_explosions: 'true', block_interact_mode: 'public' },
    peace: { allow_pvp: 'false', block_edit_mode: 'allies', allow_explosions: 'false', block_interact_mode: 'allies' },
    totalwar: { block_edit_mode: 'public' }
}

// ==================== PERSISTENZ FUNKTIONEN ====================
function saveWarData() {
    try {
        let data = {
            activeWars: {},
            defeatCooldowns: {},
            warDeclareCooldowns: {}
        }
        
        // Konvertiere Maps zu Objekten
        global.activeWars.forEach((value, key) => {
            data.activeWars[key] = value
        })
        
        global.defeatCooldowns.forEach((value, key) => {
            data.defeatCooldowns[key] = value
        })
        
        global.warDeclareCooldowns.forEach((value, key) => {
            data.warDeclareCooldowns[key] = value
        })
        
        // Speichere in data/ Ordner
        JsonIO.write('kubejs/data/' + WAR_DATA_FILE, data)
        console.log('[FactionWar] War data saved successfully')
    } catch (error) {
        console.error('[FactionWar] Error saving war data: ' + error)
    }
}

function loadWarData() {
    try {
        let file = JsonIO.read('kubejs/data/' + WAR_DATA_FILE)
        
        if (!file) {
            console.log('[FactionWar] No existing war data found, starting fresh')
            return
        }
        
        // Lade activeWars
        if (file.activeWars) {
            Object.keys(file.activeWars).forEach(key => {
                global.activeWars.set(key, file.activeWars[key])
            })
            console.log('[FactionWar] Loaded ' + global.activeWars.size + ' active wars')
        }
        
        // Lade defeatCooldowns
        if (file.defeatCooldowns) {
            Object.keys(file.defeatCooldowns).forEach(key => {
                global.defeatCooldowns.set(key, file.defeatCooldowns[key])
            })
            console.log('[FactionWar] Loaded ' + global.defeatCooldowns.size + ' defeat cooldowns')
        }
        
        // Lade warDeclareCooldowns
        if (file.warDeclareCooldowns) {
            Object.keys(file.warDeclareCooldowns).forEach(key => {
                global.warDeclareCooldowns.set(key, file.warDeclareCooldowns[key])
            })
            console.log('[FactionWar] Loaded ' + global.warDeclareCooldowns.size + ' war declare cooldowns')
        }
        
        console.log('[FactionWar] War data loaded successfully')
        
        // Reaktiviere War Settings und Schedule Auto-Ends
        global.activeWars.forEach((warData, warKey) => {
            // Reaktiviere War Settings
            if (warData.myPartyName && warData.enemyPartyName) {
                console.log('[FactionWar] Reactivating war: ' + warKey)
                
                // Berechne verbleibende Zeit
                let elapsed = Date.now() - warData.startTime
                let remaining = WAR_DURATION - elapsed
                
                if (remaining > 0) {
                    // Schedule Auto-End für verbleibende Zeit
                    let remainingTicks = Math.floor(remaining / 50) // ms zu Ticks
                    Utils.server.scheduleInTicks(remainingTicks, () => {
                        if (global.activeWars.has(warKey)) {
                            console.log('[FactionWar] Auto-ending war: ' + warKey)
                            endWar(Utils.server, warKey, warData)
                            saveWarData()
                        }
                    })
                    console.log('[FactionWar] Scheduled auto-end for war in ' + Math.floor(remaining / 60000) + ' minutes')
                } else {
                    // War sollte bereits beendet sein
                    console.log('[FactionWar] War expired during restart, ending now: ' + warKey)
                    // Wir können den Server hier noch nicht verwenden, also markieren für späteren End
                    Utils.server.scheduleInTicks(100, () => {
                        if (global.activeWars.has(warKey)) {
                            endWar(Utils.server, warKey, warData)
                            saveWarData()
                        }
                    })
                }
            }
        })
        
    } catch (error) {
        console.error('[FactionWar] Error loading war data: ' + error)
    }
}

// ==================== API WRAPPER ====================
const FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
const FTBChunksAPI = Java.loadClass('dev.ftb.mods.ftbchunks.api.FTBChunksAPI')
const UUID = Java.loadClass('java.util.UUID')
const ObjectiveCriteria = Java.loadClass('net.minecraft.world.scores.criteria.ObjectiveCriteria')

const getTeamManager = () => FTBTeamsAPI.api().getManager()
const getChunksManager = () => FTBChunksAPI.api().getManager()

// ==================== PARTY FUNKTIONEN ====================
function findPartyByName(partyName) {
    let found = null
    getTeamManager().getTeams().forEach(team => {
        if (team.isValid() && !team.isPlayerTeam()) {
            let name = team.getShortName().split('#')[0]
            if (name.toLowerCase() === partyName.toLowerCase()) found = team
        }
    })
    return found
}

function getPartyById(partyId) {
    let optional = getTeamManager().getTeamByID(UUID.fromString(partyId))
    return optional && optional.isPresent() ? optional.get() : null
}

const isPartyOwner = (player, party) => party.getOwner().equals(player.uuid)
const getPartyDisplayName = (partyName) => partyName.split('#')[0]

function countPartyClaims(partyShortName) {
    try {
        return getChunksManager().getAllClaimedChunks()
            .toArray()
            .filter(claim => claim.getTeamData().getTeam().getShortName() === partyShortName)
            .length
    } catch (error) {
        console.error('[WarSidebar] Error counting claims: ' + error)
        return 0
    }
}

// ==================== WAR FUNKTIONEN ====================
function findPlayerWar(partyId) {
    for (let [key, data] of global.activeWars) {
        if (data.myPartyId === partyId || data.enemyPartyId === partyId) {
            return { war: data, key: key }
        }
    }
    return { war: null, key: null }
}

function applySettings(server, partyNames, settingsType) {
    partyNames.forEach(partyName => {
        Object.entries(WAR_SETTINGS[settingsType]).forEach(([key, value]) => {
            server.runCommand(`ftbteams party settings_for ${partyName} ftbchunks:${key} ${value}`)
        })
    })
}

function endWar(server, warKey, warData) {
    console.log('[FactionWar] Ending war: ' + warKey)
    applySettings(server, [warData.myPartyName, warData.enemyPartyName], 'peace')
    removeWarScoreboard(server, warKey)
    removeAllWarUnclaimers(server, warData.myPartyId, warData.enemyPartyId)
    
    // Setze War Declare Cooldown für beide Parties
    setWarDeclareCooldown(warData.myPartyId, warData.myPartyName)
    setWarDeclareCooldown(warData.enemyPartyId, warData.enemyPartyName)
    
    global.activeWars.delete(warKey)
    saveWarData()
}

const createWarKey = (party1Id, party2Id) => party1Id + '_' + party2Id + '_' + Math.floor(Math.random() * 1000000)

function setDefeatCooldown(partyId, partyName) {
    global.defeatCooldowns.set(partyId, Date.now())
    console.log('[FactionWar] Defeat cooldown set for ' + partyName + ' (1 hour)')
    saveWarData()
}

function setWarDeclareCooldown(partyId, partyName) {
    global.warDeclareCooldowns.set(partyId, Date.now())
    console.log('[FactionWar] War declare cooldown set for ' + partyName + ' (24 hours)')
    saveWarData()
}

function scheduleWarAutoEnd(warKey, warData) {
    Utils.server.scheduleInTicks(144000, () => {
        if (global.activeWars.has(warKey)) {
            console.log('[FactionWar] Auto-ending war: ' + warKey)
            endWar(Utils.server, warKey, warData)
        }
    })
}

// ==================== ITEM FUNKTIONEN ====================
function createUnclaimerItem(warKey) {
    return Item.of('minecraft:golden_sword', {
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
}

function removeAllWarUnclaimers(server, myPartyId, enemyPartyId) {
    [myPartyId, enemyPartyId].forEach(id => {
        let party = getPartyById(id)
        if (!party) return
        
        let owner = server.getPlayerList().getPlayer(party.getOwner())
        if (!owner) return
        
        for (let i = 0; i < owner.inventory.containerSize; i++) {
            let item = owner.inventory.getItem(i)
            if (item && item.nbt && item.nbt.warUnclaimer === 1) {
                owner.inventory.removeItem(i, 64)
            }
        }
    })
}

// ==================== UI FUNKTIONEN ====================
function formatTimeRemaining(millisRemaining) {
    let totalSeconds = Math.floor(millisRemaining / 1000)
    let hours = Math.floor(totalSeconds / 3600)
    let minutes = Math.floor((totalSeconds % 3600) / 60)
    let seconds = totalSeconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}

function updateWarScoreboard(server, warKey, warData) {
    try {
        let myParty = getPartyById(warData.myPartyId)
        let enemyParty = getPartyById(warData.enemyPartyId)
        if (!myParty || !enemyParty) return
        
        let myOwner = server.getPlayerList().getPlayer(myParty.getOwner())
        let enemyOwner = server.getPlayerList().getPlayer(enemyParty.getOwner())
        if (!myOwner && !enemyOwner) return
        
        let timeRemaining = Math.max(0, warData.startTime + WAR_DURATION - Date.now())
        let myClaims = countPartyClaims(warData.myPartyName)
        let enemyClaims = countPartyClaims(warData.enemyPartyName)
        
        let scoreboard = server.scoreboard
        let objectiveName = 'war_' + warKey.substring(0, 10)
        let objective = scoreboard.getObjective(objectiveName) || 
            scoreboard.addObjective(objectiveName, ObjectiveCriteria.DUMMY, Component.literal('§c§l⚔ WAR ⚔'), ObjectiveCriteria.RenderType.INTEGER)
        
        scoreboard.getTrackedPlayers().forEach(p => scoreboard.resetPlayerScore(p, objective))
        
        let score = 10
        let entries = [
            `§7  Deaths: §c${warData.enemyDeaths || 0}`,
            `§7  Claims: §a${enemyClaims}`,
            `§e${getPartyDisplayName(warData.enemyPartyName)}`,
            '§1',
            `§7  Deaths: §c${warData.myDeaths || 0}`,
            `§7  Claims: §a${myClaims}`,
            `§e${getPartyDisplayName(warData.myPartyName)}`,
            '§0',
            `§7Time: §f${formatTimeRemaining(timeRemaining)}`,
            '§r'
        ]
        
        entries.forEach(entry => scoreboard.getOrCreatePlayerScore(entry, objective).setScore(score--))
        scoreboard.setDisplayObjective(1, objective)
    } catch (error) {
        console.error('[WarSidebar] Error updating scoreboard: ' + error)
    }
}

function removeWarScoreboard(server, warKey) {
    try {
        let objectiveName = 'war_' + warKey.substring(0, 10)
        let objective = server.scoreboard.getObjective(objectiveName)
        if (objective) server.scoreboard.removeObjective(objective)
    } catch (error) {
        console.error('[WarSidebar] Error removing scoreboard: ' + error)
    }
}

// ==================== VALIDATION ====================
function validatePartyOwner(source) {
    try {
        let player = source.getPlayerOrException()
        let playerTeamOptional = getTeamManager().getTeamByID(player.uuid)
        
        if (!playerTeamOptional || !playerTeamOptional.isPresent()) {
            source.sendFailure(Component.red('You are not in a party!'))
            return null
        }
        
        let partyOptional = getTeamManager().getTeamByID(playerTeamOptional.get().getTeamId())
        if (!partyOptional || !partyOptional.isPresent()) {
            source.sendFailure(Component.red('You are not in a party!'))
            return null
        }
        
        let party = partyOptional.get()
        
        if (!isPartyOwner(player, party)) {
            source.sendFailure(Component.red('Only the party owner can use this command!'))
            return null
        }
        
        if (party.isPlayerTeam()) {
            source.sendFailure(Component.red('You must be in a party!'))
            return null
        }
        
        return { player: player, party: party }
    } catch (error) {
        source.sendFailure(Component.red(`Error: ${error}`))
        return null
    }
}

// ==================== SUGGESTIONS ====================
function suggestPartyNames(builder, onlyWarParties) {
    if (onlyWarParties === undefined) onlyWarParties = false
    
    try {
        let names = new Set()
        
        if (onlyWarParties) {
            global.activeWars.forEach(warData => {
                names.add(getPartyDisplayName(warData.myPartyName))
                names.add(getPartyDisplayName(warData.enemyPartyName))
            })
        } else {
            getTeamManager().getTeams().forEach(team => {
                if (team.isValid() && !team.isPlayerTeam()) {
                    names.add(getPartyDisplayName(team.getShortName()))
                }
            })
        }
        
        names.forEach(name => builder.suggest(name))
    } catch (error) {
        console.error('[FactionWar] Error getting suggestions: ' + error)
    }
    return builder.buildFuture()
}

// ==================== EVENT HANDLERS ====================

// Lade War Data beim Server-Start
ServerEvents.loaded(event => {
    console.log('[FactionWar] Loading war data from file...')
    loadWarData()
})

// Test Command
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event
    
    event.register(Commands.literal('testteam')
        .then(Commands.literal('check')
            .then(Commands.argument('teamname', Arguments.STRING.create(event))
                .suggests((ctx, builder) => suggestPartyNames(builder, false))
                .executes(ctx => {
                    let teamName = Arguments.STRING.getResult(ctx, 'teamname')
                    let party = findPartyByName(teamName)
                    
                    if (party) {
                        let owner = ctx.source.getServer().getPlayerList().getPlayer(party.getOwner())
                        let ownerName = owner ? owner.getGameProfile().getName() : party.getOwner().toString()
                        ctx.source.sendSuccess(Component.green(`Team Owner of '${teamName}': ${ownerName}`), false)
                    } else {
                        ctx.source.sendFailure(Component.red(`Team '${teamName}' not found!`))
                    }
                    return 1
                })
            )
        )
        .executes(ctx => {
            ctx.source.sendSuccess(Component.yellow('Usage: /testteam check <teamname>'), false)
            return 1
        })
    )
})

// Tick Event - Scoreboard & Unclaim Updates
ServerEvents.tick(event => {
    if (!event.server) return
    
    // Scoreboard Update (alle 2 Sekunden)
    if (event.server.tickCount % 40 === 0) {
        global.activeWars.forEach((warData, warKey) => {
            updateWarScoreboard(event.server, warKey, warData)
        })
    }
    
    // Unclaim Progress Update (jede Sekunde)
    if (event.server.tickCount % 20 === 0) {
        global.activeUnclaims.forEach((unclaimData, playerId) => {
            let player = event.server.getPlayerList().getPlayer(UUID.fromString(playerId))
            if (!player) {
                global.activeUnclaims.delete(playerId)
                return
            }
            
            // Prüfe Item in Hand
            let hasItem = [player.mainHandItem, player.offHandItem].some(item => 
                item && item.nbt && item.nbt.warUnclaimer === 1
            )
            
            if (!hasItem) {
                player.tell(Component.red('§c[War] Unclaim aborted - you put away the unclaimer!'))
                global.activeUnclaims.delete(playerId)
                return
            }
            
            // Prüfe Position
            let currentChunk = player.chunkPosition()
            if (currentChunk.x !== unclaimData.startChunkX || currentChunk.z !== unclaimData.startChunkZ) {
                player.tell(Component.red('§c[War] Unclaim aborted - you left the chunk!'))
                global.activeUnclaims.delete(playerId)
                return
            }
            
            // Progress anzeigen
            let elapsed = Date.now() - unclaimData.startTime
            let progress = Math.min(elapsed / UNCLAIM_DURATION, 1.0)
            let barLength = 60
            let filledBars = Math.floor(progress * barLength)
            let progressBar = '§a' + '|'.repeat(filledBars) + '§7' + '|'.repeat(barLength - filledBars)
            player.displayClientMessage(Component.literal('[' + progressBar + '§r]'), true)
            
            // Fertig?
            if (progress >= 1.0 && !unclaimData.completed) {
                unclaimData.completed = true
                let dimension = player.level.dimension.toString()
                event.server.runCommandSilent(`execute in ${dimension} at ${player.username} run ftbchunks admin unclaim_as ${unclaimData.enemyTeam} 1`)
                
                player.tell(Component.green('§a[War] Successfully unclaimed enemy territory!'))
                player.playSound('minecraft:entity.player.levelup', 1.0, 1.0)
                
                // Check ob Feind Claims verloren hat
                if (countPartyClaims(unclaimData.enemyTeam) === 0) {
                    global.activeWars.forEach((warData, warKey) => {
                        if (warData.myPartyName === unclaimData.enemyTeam || warData.enemyPartyName === unclaimData.enemyTeam) {
                            let loserTeam = unclaimData.enemyTeam
                            let loserPartyId = warData.myPartyName === loserTeam ? warData.myPartyId : warData.enemyPartyId
                            let winnerTeam = warData.myPartyName === loserTeam ? warData.enemyPartyName : warData.myPartyName
                            
                            event.server.tell(Component.red('[War] ' + getPartyDisplayName(loserTeam) + ' has no more claims!'))
                            event.server.tell(Component.gold('[War] ' + getPartyDisplayName(winnerTeam) + ' wins the war!'))
                            event.server.tell(Component.yellow('[War] ' + getPartyDisplayName(loserTeam) + ' cannot claim for 1 hour!'))
                            
                            setDefeatCooldown(loserPartyId, loserTeam)
                            endWar(event.server, warKey, warData)
                        }
                    })
                }
                global.activeUnclaims.delete(playerId)
            }
        })
    }
})

// Unclaimer Item Rechtsklick
ItemEvents.rightClicked('minecraft:golden_sword', event => {
    let item = event.item
    if (!item.nbt || item.nbt.warUnclaimer !== 1 || item.nbt.adminIssued !== 'true') return
    
    let player = event.player
    let warData = global.activeWars.get(item.nbt.warID)
    
    if (!warData) {
        player.tell(Component.red('§c[War] This war has ended! Item destroyed.'))
        item.count = 0
        return
    }
    
    if (global.activeUnclaims.has(player.uuid.toString())) {
        player.tell(Component.red('§c[War] You already have an active unclaim process!'))
        return
    }
    
    let playerTeamOptional = getTeamManager().getTeamByID(player.uuid)
    if (!playerTeamOptional || !playerTeamOptional.isPresent()) {
        player.tell(Component.red('§c[War] You are not in a party!'))
        return
    }
    
    let playerPartyId = playerTeamOptional.get().getTeamId().toString()
    let isMyWar = warData.myPartyId === playerPartyId
    let isEnemyWar = warData.enemyPartyId === playerPartyId
    
    if (!isMyWar && !isEnemyWar) {
        player.tell(Component.red('§c[War] You are not part of this war! Item destroyed.'))
        item.count = 0
        return
    }
    
    let enemyTeamName = isMyWar ? warData.enemyPartyName : warData.myPartyName
    
    try {
        let chunkPos = player.chunkPosition()
        let allClaims = getChunksManager().getAllClaimedChunks()
        let foundClaim = null
        
        allClaims.forEach(chunkDimPos => {
            let posStr = chunkDimPos.toString()
            let matches = posStr.match(/\[\s*\[(.+):(-?\d+):(-?\d+)\]/)
            if (matches) {
                let dim = matches[1]
                let x = parseInt(matches[2])
                let z = parseInt(matches[3])
                let currentDim = player.level.dimension.toString()
                
                if ((currentDim === dim || currentDim.includes(dim)) && x === chunkPos.x && z === chunkPos.z) {
                    foundClaim = chunkDimPos
                }
            }
        })
        
        if (!foundClaim) {
            player.tell(Component.red('§c[War] This chunk is not claimed!'))
            return
        }
        
        let claimTeamName = foundClaim.getTeamData().getTeam().getShortName()
        if (claimTeamName !== enemyTeamName) {
            player.tell(Component.red('§c[War] This chunk is not claimed by the enemy!'))
            return
        }
        
        global.activeUnclaims.set(player.uuid.toString(), {
            startTime: Date.now(),
            enemyTeam: enemyTeamName,
            startChunkX: chunkPos.x,
            startChunkZ: chunkPos.z,
            completed: false
        })
        
        player.tell(Component.yellow('§e[War] Unclaiming started! Stay in this chunk for 60 seconds...'))
        player.playSound('minecraft:block.beacon.activate', 1.0, 1.0)
        
    } catch (error) {
        console.error('[WarUnclaim] Error: ' + error)
        player.tell(Component.red('§c[War] Error checking chunk claim!'))
    }
})

// Spieler Tod während War
EntityEvents.death(event => {
    if (!event.entity.isPlayer()) return
    
    let player = event.entity
    let playerTeamOptional = getTeamManager().getTeamByID(player.uuid)
    if (!playerTeamOptional || !playerTeamOptional.isPresent()) return
    
    let playerPartyId = playerTeamOptional.get().getTeamId().toString()
    
    // Entferne aktiven Unclaim
    if (global.activeUnclaims.has(player.uuid.toString())) {
        global.activeUnclaims.delete(player.uuid.toString())
    }
    
    // Update War Deaths
    global.activeWars.forEach(warData => {
        if (warData.myPartyId === playerPartyId) {
            warData.myDeaths = (warData.myDeaths || 0) + 1
        } else if (warData.enemyPartyId === playerPartyId) {
            warData.enemyDeaths = (warData.enemyDeaths || 0) + 1
        }
    })
})

// ==================== WAR COMMANDS ====================
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event
    
    event.register(Commands.literal('faction')
        .then(Commands.literal('war')
            // DECLARE WAR
            .then(Commands.literal('declare')
                .then(Commands.argument('enemy', Arguments.STRING.create(event))
                    .suggests((ctx, builder) => suggestPartyNames(builder, false))
                    .executes(ctx => {
                        let validation = validatePartyOwner(ctx.source)
                        if (!validation) return 0
                        
                        let { player, party: myParty } = validation
                        let enemyTeamName = Arguments.STRING.getResult(ctx, 'enemy')
                        let enemyParty = findPartyByName(enemyTeamName)
                        
                        if (!enemyParty) {
                            ctx.source.sendFailure(Component.red(`Party '${enemyTeamName}' not found!`))
                            return 0
                        }
                        
                        let server = ctx.source.getServer()
                        let enemyOwner = server.getPlayerList().getPlayer(enemyParty.getOwner())
                        
                        if (!enemyOwner) {
                            ctx.source.sendFailure(Component.red('The enemy party owner must be online to declare war!'))
                            return 0
                        }
                        
                        let myPartyShortName = myParty.getShortName()
                        let enemyPartyShortName = enemyParty.getShortName()
                        let myPartyId = myParty.getTeamId().toString()
                        let enemyPartyId = enemyParty.getId().toString()
                        
                        // Prüfe War Declare Cooldown
                        if (global.warDeclareCooldowns.has(myPartyId)) {
                            let cooldownStart = global.warDeclareCooldowns.get(myPartyId)
                            let cooldownEnd = cooldownStart + WAR_DECLARE_COOLDOWN
                            let now = Date.now()
                            
                            if (now < cooldownEnd) {
                                let remainingMs = cooldownEnd - now
                                let remainingHours = Math.floor(remainingMs / (60 * 60 * 1000))
                                let remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
                                ctx.source.sendFailure(Component.red('Your party cannot declare war yet! Cooldown: ' + remainingHours + 'h ' + remainingMinutes + 'm remaining'))
                                return 0
                            } else {
                                global.warDeclareCooldowns.delete(myPartyId)
                            }
                        }
                        
                        // Prüfe ob eine der Parties bereits in einem Krieg ist
                        let alreadyInWar = false
                        
                        global.activeWars.forEach((warData, warKey) => {
                            if (warData.myPartyId === myPartyId || warData.enemyPartyId === myPartyId) {
                                ctx.source.sendFailure(Component.red('Your party is already at war!'))
                                alreadyInWar = true
                            }
                            if (warData.myPartyId === enemyPartyId || warData.enemyPartyId === enemyPartyId) {
                                ctx.source.sendFailure(Component.red('The enemy party is already at war!'))
                                alreadyInWar = true
                            }
                        })
                        
                        if (alreadyInWar) return 0
                        
                        let myClaims = countPartyClaims(myPartyShortName)
                        let enemyClaims = countPartyClaims(enemyPartyShortName)
                        
                        if (myClaims === 0) {
                            ctx.source.sendFailure(Component.red('Your party has no claimed chunks!'))
                            return 0
                        }
                        
                        if (enemyClaims === 0) {
                            ctx.source.sendFailure(Component.red('The enemy party has no claimed chunks!'))
                            return 0
                        }
                        
                        applySettings(server, [myPartyShortName, enemyPartyShortName], 'war')
                        
                        let warKey = createWarKey(myParty.getTeamId().toString(), enemyParty.getId().toString())
                        let warData = {
                            myPartyId: myParty.getTeamId().toString(),
                            enemyPartyId: enemyParty.getId().toString(),
                            myPartyName: myPartyShortName,
                            enemyPartyName: enemyPartyShortName,
                            startTime: Date.now(),
                            myDeaths: 0,
                            enemyDeaths: 0,
                            initialMyClaims: myClaims,
                            initialEnemyClaims: enemyClaims
                        }
                        
                        global.activeWars.set(warKey, warData)
                        scheduleWarAutoEnd(warKey, warData)
                        saveWarData()
                        
                        player.give(createUnclaimerItem(warKey))
                        enemyOwner.give(createUnclaimerItem(warKey))
                        
                        player.tell(Component.green('§a[War] You received the War Unclaimer item!'))
                        enemyOwner.tell(Component.green('§a[War] You received the War Unclaimer item!'))
                        
                        server.tell(Component.red('[War] ' + getPartyDisplayName(myPartyShortName) + ' has declared war on ' + getPartyDisplayName(enemyPartyShortName) + '!'))
                        server.tell(Component.yellow('[War] The war will automatically end in 2 hours.'))
                        
                        return 1
                    })
                )
            )
            // FORFEIT WAR
            .then(Commands.literal('forfeit')
                .executes(ctx => {
                    let validation = validatePartyOwner(ctx.source)
                    if (!validation) return 0
                    
                    let { party: myParty } = validation
                    let { war: foundWar, key: foundWarKey } = findPlayerWar(myParty.getTeamId().toString())
                    
                    if (!foundWar) {
                        ctx.source.sendFailure(Component.red('You are not in an active war!'))
                        return 0
                    }
                    
                    let server = ctx.source.getServer()
                    server.runCommand(`ftbchunks unclaim_all ${myParty.getShortName()}`)
                    
                    server.tell(Component.red('[War] ' + getPartyDisplayName(myParty.getShortName()) + ' has forfeited the war!'))
                    server.tell(Component.yellow('[War] ' + getPartyDisplayName(myParty.getShortName()) + ' cannot claim for 1 hour!'))
                    
                    setDefeatCooldown(myParty.getTeamId().toString(), myParty.getShortName())
                    endWar(server, foundWarKey, foundWar)
                    
                    return 1
                })
            )
            // WHITE PEACE
            .then(Commands.literal('whitepeace')
                .executes(ctx => {
                    let validation = validatePartyOwner(ctx.source)
                    if (!validation) return 0
                    
                    let { party: myParty } = validation
                    let { war: foundWar, key: foundWarKey } = findPlayerWar(myParty.getTeamId().toString())
                    
                    if (!foundWar) {
                        ctx.source.sendFailure(Component.red('Your party is not at war!'))
                        return 0
                    }
                    
                    let myPartyId = myParty.getTeamId().toString()
                    let enemyPartyId = (foundWar.myPartyId === myPartyId) ? foundWar.enemyPartyId : foundWar.myPartyId
                    let requestKey = myPartyId + '_' + enemyPartyId
                    let reverseKey = enemyPartyId + '_' + myPartyId
                    
                    if (global.whitePeaceRequests.has(reverseKey)) {
                        // Accept peace
                        let enemyParty = getPartyById(enemyPartyId)
                        let server = ctx.source.getServer()
                        
                        server.tell(Component.gold('[War] ' + getPartyDisplayName(myParty.getShortName()) + ' and ' + 
                            getPartyDisplayName(enemyParty.getShortName()) + ' have agreed to white peace!'))
                        server.tell(Component.yellow('[War] The war has ended with current borders!'))
                        
                        endWar(server, foundWarKey, foundWar)
                        global.whitePeaceRequests.delete(reverseKey)
                        
                        return 1
                    } else {
                        // Send request
                        global.whitePeaceRequests.set(requestKey, {
                            requesterId: myPartyId,
                            targetId: enemyPartyId,
                            timestamp: Date.now()
                        })
                        
                        let enemyParty = getPartyById(enemyPartyId)
                        let enemyOwner = ctx.source.getServer().getPlayerList().getPlayer(enemyParty.getOwner())
                        
                        if (enemyOwner) {
                            enemyOwner.tell(Component.gold('§6[War] ' + getPartyDisplayName(myParty.getShortName()) + ' has proposed white peace!'))
                            enemyOwner.tell(Component.yellow('§e[War] Use /faction war whitepeace to accept.'))
                        }
                        
                        ctx.source.sendSuccess(Component.green('White peace proposal sent!'), true)
                        
                        Utils.server.scheduleInTicks(PEACE_REQUEST_TIMEOUT, () => {
                            global.whitePeaceRequests.delete(requestKey)
                        })
                        
                        return 1
                    }
                })
            )
            // TOTAL WAR
            .then(Commands.literal('totalwar')
                .executes(ctx => {
                    let validation = validatePartyOwner(ctx.source)
                    if (!validation) return 0
                    
                    let myParty = validation.party
                    let myPartyId = myParty.getTeamId().toString()
                    let warResult = findPlayerWar(myPartyId)
                    let foundWar = warResult.war
                    let foundWarKey = warResult.key
                    
                    if (!foundWar) {
                        ctx.source.sendFailure(Component.red('Your party is not at war!'))
                        return 0
                    }
                    
                    // Prüfe ob bereits Total War aktiv ist
                    if (foundWar.totalWar) {
                        ctx.source.sendFailure(Component.red('Total War is already active!'))
                        return 0
                    }
                    
                    let enemyPartyId = (foundWar.myPartyId === myPartyId) ? foundWar.enemyPartyId : foundWar.myPartyId
                    let requestKey = foundWarKey
                    
                    // Prüfe ob andere Seite bereits angefragt hat
                    if (global.totalWarRequests.has(requestKey)) {
                        let request = global.totalWarRequests.get(requestKey)
                        
                        // Wenn die andere Seite angefragt hat, akzeptiere
                        if (request.requesterId !== myPartyId) {
                            let server = ctx.source.getServer()
                            let enemyParty = getPartyById(enemyPartyId)
                            
                            // Aktiviere Total War
                            foundWar.totalWar = true
                            server.runCommand('ftbteams party settings_for ' + foundWar.myPartyName + ' ftbchunks:block_edit_mode public')
                            server.runCommand('ftbteams party settings_for ' + foundWar.enemyPartyName + ' ftbchunks:block_edit_mode public')
                            
                            server.tell(Component.gold('[War] Total War activated between ' + getPartyDisplayName(foundWar.myPartyName) + ' and ' + getPartyDisplayName(foundWar.enemyPartyName) + '!'))
                            server.tell(Component.red('[War] Block damage is now enabled!'))
                            
                            global.totalWarRequests.delete(requestKey)
                            saveWarData()
                            return 1
                        } else {
                            ctx.source.sendFailure(Component.red('You already sent a Total War request!'))
                            return 0
                        }
                    } else {
                        // Sende neue Anfrage
                        global.totalWarRequests.set(requestKey, {
                            requesterId: myPartyId,
                            timestamp: Date.now()
                        })
                        
                        let enemyParty = getPartyById(enemyPartyId)
                        let enemyOwner = ctx.source.getServer().getPlayerList().getPlayer(enemyParty.getOwner())
                        
                        if (enemyOwner) {
                            enemyOwner.tell(Component.gold('§6[War] ' + getPartyDisplayName(myParty.getShortName()) + ' has proposed Total War!'))
                            enemyOwner.tell(Component.yellow('§e[War] Use /faction war totalwar to accept and enable block damage.'))
                        }
                        
                        ctx.source.sendSuccess(Component.green('Total War proposal sent!'), true)
                        
                        // Lösche Anfrage nach 5 Minuten
                        Utils.server.scheduleInTicks(PEACE_REQUEST_TIMEOUT, () => {
                            global.totalWarRequests.delete(requestKey)
                        })
                        
                        return 1
                    }
                })
            )
            // ADMIN END WAR
            .then(Commands.literal('end')
                .requires(src => src.hasPermission(2))
                .then(Commands.argument('party1', Arguments.STRING.create(event))
                    .suggests((ctx, builder) => suggestPartyNames(builder, true))
                    .then(Commands.argument('party2', Arguments.STRING.create(event))
                        .suggests((ctx, builder) => suggestPartyNames(builder, true))
                        .executes(ctx => {
                            let party1Name = Arguments.STRING.getResult(ctx, 'party1')
                            let party2Name = Arguments.STRING.getResult(ctx, 'party2')
                            
                            let party1 = findPartyByName(party1Name)
                            let party2 = findPartyByName(party2Name)
                            
                            if (!party1 || !party2) {
                                ctx.source.sendFailure(Component.red('One or both parties not found!'))
                                return 0
                            }
                            
                            let party1Id = party1.getTeamId().toString()
                            let party2Id = party2.getId().toString()
                            let warData = null
                            let foundWarKey = null
                            
                            global.activeWars.forEach((data, key) => {
                                if ((data.myPartyId === party1Id && data.enemyPartyId === party2Id) ||
                                    (data.myPartyId === party2Id && data.enemyPartyId === party1Id)) {
                                    warData = data
                                    foundWarKey = key
                                }
                            })
                            
                            if (!warData) {
                                ctx.source.sendFailure(Component.red('No active war found between these parties!'))
                                return 0
                            }
                            
                            endWar(ctx.source.getServer(), foundWarKey, warData)
                            ctx.source.sendSuccess(Component.green('War ended successfully!'), true)
                            
                            return 1
                        })
                    )
                )
            )
        )
    )
})
