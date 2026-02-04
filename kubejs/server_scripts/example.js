// FTB Teams - Add player to FTB rank system
FTBTeamsEvents.playerJoinedParty(event => {
    let team = event.currentTeam.name
    let player = event.player.username
    
    // Remove the ID manually
    if (team.includes('#')) {
        team = team.split('#')[0]
    }
    
    console.log(`Player ${player} joined team ${team}`)

    // Wait briefly and then add the player
    Utils.server.scheduleInTicks(5, () => {
        console.log(`Adding player ${player} to ${team}`)
        Utils.server.runCommand(`lp user ${player} meta addsuffix 1 &b[${team}]&r`)
    })
})

FTBTeamsEvents.playerLeftParty(event => {
    let team = event.currentTeam.name
    let player = event.player.username
    
    // Remove the ID manually
    if (team.includes('#')) {
        team = team.split('#')[0]
    }
    
    console.log(`Removing player ${player} from ${team}`)
    
    Utils.server.runCommand(`lp user ${player} meta removesuffix 1`)
})

// Prevent chat while downed (Hardcore Revival integration)
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

// Vote command - directs players to vote for the server
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event 
    event.register(Commands.literal('vote')
        .executes(ctx => {
            let player = ctx.source.getPlayerOrException()
            let playerName = player.username
            
            // Use Utils.server.runCommand() for tellraw
            Utils.server.runCommand(`tellraw ${playerName} ["",{"text":"[Vote]","bold":true,"color":"aqua"},{"text":" Click ","color":"white"},{"text":"[here]","bold":true,"underlined":true,"color":"aqua","clickEvent":{"action":"open_url","value":"https://moddedminecraftservers.com/server/create-legacies.60779"}},{"text":" to vote for the server","color":"white"}]`)
            
            return 1
        })
        .then(Commands.literal('claim')
            .executes(ctx => {

            }))
)})

// Prevent damage FROM downed players (Hardcore Revival integration)
EntityEvents.hurt(event => {
    let attacker = event.source.actual
    let $RevivalData = Java.loadClass('net.blay09.mods.hardcorerevival.HardcoreRevival')
    let RevivalDataPlayer = $RevivalData.getRevivalData(attacker)
    
    // Check if the attacker is a player
    if (!attacker || !attacker.isPlayer()) return
    
    let attackerUuid = attacker.uuid.toString()
    
    // Check if the attacker is downed
    if (RevivalDataPlayer.isKnockedOut()) { 

            event.cancel()
            attacker.tell(Component.yellow('You cannot deal damage right now!'))

    }
})