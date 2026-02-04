// Interval for each cleanup and time until the cleaning occurs
let Interval = 30;
let cleaningTime = 1200 * Interval;

// Notification times, times the user want to get the message how many minutes are left until Clearlag clears
const notifications = [10, 5, 1];
// Second notification times, times showing user how many seconds are left until item clear
const second_notifications = [10, 5, 4, 3, 2, 1];

let lastClearLagResult = [];
let lastTotalClearLagResult = new Map();

// List of item IDs that shouldn't be deleted, regex supported
let blacklist = [];

let blacklistTester;
if (blacklist.length > 0) {
    blacklistTester = new RegExp(blacklist.join('|'));
}
else {
    blacklistTester = new RegExp('$^'); // Regex that matches nothing
}

// Global variable for the timer
global.clearLagTimer = global.clearLagTimer || 0;

let clearLag = function(server, showMessage) {
    // Default parameter manually
    if (showMessage === undefined) showMessage = true;
    
    let removedItems = new Map();
    let totalCount = 0;

    lastClearLagResult = [];
    lastTotalClearLagResult.clear();

    console.log('ClearLag: Starting item cleanup...');

    // Iterate through all dimensions
    server.getAllLevels().forEach(level => {
        let itemEntities = level.entities.filter(entity => entity.type === 'minecraft:item');
        
        console.log(`Found ${itemEntities.length} items in dimension ${level.dimension}`);
        
        itemEntities.forEach(entity => {
            let itemId = entity.item.id;
            let itemCount = entity.item.count;
            
            if (!blacklistTester.test(itemId)) {
                // Track removed items
                if (removedItems.has(itemId)) {
                    removedItems.set(itemId, removedItems.get(itemId) + itemCount);
                } else {
                    removedItems.set(itemId, itemCount);
                }
                
                totalCount += itemCount;
                entity.discard();
            }
        });
    });

    // Store results
    removedItems.forEach((count, itemId) => {
        lastClearLagResult.push({ key: itemId, value: count });
        lastTotalClearLagResult.set(itemId, count);
    });

    // Sort results by count (descending)
    lastClearLagResult.sort((a, b) => b.value - a.value);

    if (showMessage) {
        server.tell(Component.green('[ClearLag] ').append(Component.white(`${totalCount} items removed.`)));
        server.tell(Component.green('[ClearLag] ').append(Component.white(`Clearlag will start in ${Interval} minutes!`)));
    }
    
    // Reset timer
    global.clearLagTimer = 0;
}

// Server tick event for timer
ServerEvents.tick(event => {
    // Only check every 20th tick (1 second)
    if (event.server.tickCount % 20 !== 0) return;
    
    global.clearLagTimer++;
    let secondsElapsed = global.clearLagTimer;
    let totalSeconds = Interval * 60; // Interval in seconds
    let secondsLeft = totalSeconds - secondsElapsed;
    let minutesLeft = Math.floor(secondsLeft / 60);
    
    // Debug log every 10 seconds
    if (secondsElapsed % 10 === 0) {
        console.log(`ClearLag Timer: ${secondsElapsed}s elapsed, ${secondsLeft}s left`);
    }
    
    // Execute cleanup
    if (secondsElapsed >= totalSeconds) {
        console.log('ClearLag: Time reached, executing cleanup...');
        clearLag(event.server, true);
        return;
    }
    
    // Minute notifications (without item count for Gravestone compatibility)
    if (secondsLeft % 60 === 0 && notifications.includes(minutesLeft)) {
        event.server.tell(Component.green('[ClearLag] ').append(Component.white(`Item cleanup in ${minutesLeft} minutes!`)));
    }
    
    // Second notifications (without item count for Gravestone compatibility)
    if (second_notifications.includes(secondsLeft)) {
        event.server.tell(Component.green('[ClearLag] ').append(Component.white(`Item cleanup in ${secondsLeft} seconds!`)));
    }
});

// Server Start
ServerEvents.loaded(event => {
    console.log('ClearLag: Server loaded, timer started...');
    global.clearLagTimer = 0;
    event.server.tell(Component.green('[ClearLag] ').append(Component.white(`Clearlag will start in ${Interval} minutes!`)));
});

ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal('clearlag')
        .requires(src => src.hasPermission(2))
        .then(Commands.literal('clear').executes(ctx => {
            let server = ctx.source.getServer();
            clearLag(server, false);
            ctx.source.sendSuccess(Component.green('[ClearLag] ').append(Component.white('Manual cleanup executed!')), true);
            return 1;
        }))
        .then(Commands.literal('timer').executes(ctx => {
            let secondsLeft = (Interval * 60) - global.clearLagTimer;
            let minutesLeft = Math.floor(secondsLeft / 60);
            let remainingSeconds = secondsLeft % 60;
            ctx.source.sendSuccess(Component.green('[ClearLag] ').append(Component.white(`Time left: ${minutesLeft}m ${remainingSeconds}s`)), false);
            return 1;
        }))
        .then(Commands.literal('result').executes(ctx => {
            ctx.source.sendSuccess(Component.green('[ClearLag] Report:'), false);
            
            if (lastClearLagResult.length === 0) {
                ctx.source.sendSuccess(Component.white('No items have been cleared yet.'), false);
            } else {
                lastClearLagResult.slice(0, 10).forEach(result => {
                    ctx.source.sendSuccess(Component.white(`${result.key}: ${result.value}`), false);
                });
                
                if (lastClearLagResult.length > 10) {
                    ctx.source.sendSuccess(Component.gray(`... and ${lastClearLagResult.length - 10} more items`), false);
                }
            }
            return 1;
        }))
    )
});