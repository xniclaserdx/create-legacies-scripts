// Event to prevent new claims during war
// and prevent losing factions from claiming for 1 hour after war ends
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
    
    // If player is in a player team, find the actual party
    if (playerTeam.isPlayerTeam()) {
        // Get all teams and find the party the player belongs to
        let allTeams = teamManager.getTeams()
        let foundParty = null
        
        allTeams.forEach(team => {
            if (!team.isPlayerTeam() && team.isValid()) {
                // Check if player is a member of this party
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
    
    // Check if team is in an active war - BLOCK ALL CLAIMING
    if (global.activeWars) {
        global.activeWars.forEach((warData, warKey) => {
            if (warData.myPartyName === playerPartyShortName || warData.enemyPartyName === playerPartyShortName) {
                player.tell(Component.red('§c[War] You cannot claim new chunks during war!'))
                event.result = 'not_owner'
            }
        })
    }
    
    // Check if team has a defeat cooldown (1 hour after war defeat)
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
                // Cooldown expired, remove it
                global.defeatCooldowns.delete(playerPartyId)
                console.log('[FactionWar] Defeat cooldown expired for party: ' + playerPartyShortName)
            }
        }
    }
})

// Helper function to count party claims (if not already defined in test.js)
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
