//FTB Teams add Player to FTB Rank 
FTBTeamsEvents.playerJoinedParty(event => {
    let team = event.currentTeam.name
    let player = event.player.username
    
    // Entferne die ID manuell
    if (team.includes('#')) {
        team = team.split('#')[0]
    }
    
    console.log(`Player ${player} joined team ${team}`)

    // Warte kurz und füge dann den Spieler hinzu
    Utils.server.scheduleInTicks(5, () => {
        console.log(`Adding player ${player} to ${team}`)
        Utils.server.runCommand(`lp user ${player} meta addsuffix 1 &b[${team}]&r`)
    })
})

FTBTeamsEvents.playerLeftParty(event => {
    let team = event.currentTeam.name
    let player = event.player.username
    
    // Entferne die ID manuell
    if (team.includes('#')) {
        team = team.split('#')[0]
    }
    
    console.log(`Removing player ${player} from ${team}`)
    
    Utils.server.runCommand(`lp user ${player} meta removesuffix 1`)
})
//Verhindere Chat während Downed
ServerEvents.command(event => {
    const {parseResults, server, input, commandName} = event
    let source = parseResults.getContext().getSource()
    if (source && source.isPlayer()) {
        let $RevivalData = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
        let RevivalDataPlayer = $RevivalData.getRevivalData(source.getPlayer())
        if (RevivalDataPlayer.isKnockedOut()) {
            
            source.getPlayer().tell(Component.red('You cannot chat while downed!'))
            event.cancel()
        }
    }
})
// Vote Command
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event 
    event.register(Commands.literal('vote')
        .executes(ctx => {
            let player = ctx.source.getPlayerOrException()
            let playerName = player.username
            
            // Verwende Utils.server.runCommand() für tellraw
            Utils.server.runCommand(`tellraw ${playerName} ["",{"text":"[Vote]","bold":true,"color":"aqua"},{"text":" Click ","color":"white"},{"text":"[here]","bold":true,"underlined":true,"color":"aqua","clickEvent":{"action":"open_url","value":"https://moddedminecraftservers.com/server/create-legacies.60779"}},{"text":" to vote for the server","color":"white"}]`)
            
            return 1
        })
        .then(Commands.literal('claim')
            .executes(ctx => {

            }))
)})

// Verhindere Schaden VON Spielern
EntityEvents.hurt(event => {
    let attacker = event.source.actual
    let $RevivalData = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
    let RevivalDataPlayer = $RevivalData.getRevivalData(attacker)
    // Prüfe ob der Angreifer ein Spieler ist
    if (!attacker || !attacker.isPlayer()) return
    
    let attackerUuid = attacker.uuid.toString()
    
    // Prüfe ob der Angreifer downed ist
    if (RevivalDataPlayer.isKnockedOut()) { 

            event.cancel()
            attacker.tell(Component.yellow('You cannot deal damage right now!'))

    }
})