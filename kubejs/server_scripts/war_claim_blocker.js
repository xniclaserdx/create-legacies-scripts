// Event um zu verhindern, dass während des Krieges neue Claims gemacht werden
// und dass Verlierer-Factions 1 Stunde nach Kriegsende nicht claimen können
FTBChunksEvents.before("claim", event => {
    let player = event.player
    
    if (!player) {
        return
    }
    
    let FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
    let teamManager = FTBTeamsAPI.api().getManager()
    
    let playerTeamOptional = teamManager.getTeamByID(player.uuid)
    
    if (!playerTeamOptional || !playerTeamOptional.isPresent()) {
        return
    }
    
    let playerTeam = playerTeamOptional.get()
    let playerPartyShortName = playerTeam.getShortName()
    let playerPartyId = null
    
    // Wenn Spieler in einem Player-Team ist, finde die richtige Party
    if (playerTeam.isPlayerTeam()) {
        // Hole alle Teams und finde die Party, zu der der Spieler gehört
        let allTeams = teamManager.getTeams()
        let foundParty = null
        
        allTeams.forEach(team => {
            if (!team.isPlayerTeam() && team.isValid()) {
                // Prüfe ob Spieler Mitglied dieser Party ist
                let members = team.getMembers()
                members.forEach(memberId => {
                    if (memberId.toString() === player.uuid.toString()) {
                        foundParty = team
                    }
                })
            }
        })
        
        if (foundParty) {
            playerTeam = foundParty
            playerPartyShortName = foundParty.getShortName()
            playerPartyId = foundParty.getTeamId().toString()
        }
    } else {
        playerPartyId = playerTeam.getTeamId().toString()
    }
    
    // Prüfe ob Team in einem aktiven Krieg ist - BLOCKIERE JEDES CLAIMEN
    if (global.activeWars) {
        global.activeWars.forEach((warData, warKey) => {
            if (warData.myPartyName === playerPartyShortName || warData.enemyPartyName === playerPartyShortName) {
                player.tell(Component.red('§c[War] You cannot claim new chunks during war!'))
                event.result = 'not_owner'
            }
        })
    }
    
    // Prüfe ob Team einen Defeat Cooldown hat (1 Stunde nach Kriegsniederlage)
    if (global.defeatCooldowns && playerPartyId) {
        if (global.defeatCooldowns.has(playerPartyId)) {
            let cooldownStart = global.defeatCooldowns.get(playerPartyId)
            let cooldownEnd = cooldownStart + (60 * 60 * 1000) // 1 Stunde
            let now = Date.now()
            
            if (now < cooldownEnd) {
                let remainingMs = cooldownEnd - now
                let remainingMinutes = Math.ceil(remainingMs / 60000)
                player.tell(Component.red('§c[War] Your faction cannot claim yet! Cooldown: ' + remainingMinutes + ' minutes remaining'))
                event.result = 'not_owner'
            } else {
                // Cooldown abgelaufen, entferne ihn
                global.defeatCooldowns.delete(playerPartyId)
                console.log('[FactionWar] Defeat cooldown expired for party: ' + playerPartyShortName)
            }
        }
    }
})

// Helper function to count party claims (falls nicht bereits in test.js definiert)
function countPartyClaims(server, partyShortName) {
    let FTBChunksAPI = Java.loadClass('dev.ftb.mods.ftbchunks.api.FTBChunksAPI')
    let manager = FTBChunksAPI.api().getManager()
    
    let allClaims = manager.getAllClaimedChunks()
    let count = 0
    
    allClaims.forEach(claim => {
        let claimString = claim.toString()
        if (claimString.includes(partyShortName)) {
            count++
        }
    })
    
    return count
}
