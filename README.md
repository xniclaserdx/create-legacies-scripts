# Create: Legacies Scripts

Central script repository for the Create: Legacies Minecraft server, containing custom gameplay systems, economy and war mechanics, automation, balancing tweaks, events, and server-side infrastructure. Built to be modular, transparent, and extensible for future seasons.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Minecraft](https://img.shields.io/badge/Minecraft-1.20.1-green.svg)
![KubeJS](https://img.shields.io/badge/KubeJS-Enabled-orange.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Scripts Documentation](#scripts-documentation)
  - [War System](#war-system)
  - [Economy & Protection](#economy--protection)
  - [Server Management](#server-management)
  - [Crafting & Recipes](#crafting--recipes)
  - [Structure Tools](#structure-tools)
  - [Client Features](#client-features)
- [Commands](#commands)
- [Configuration](#configuration)
- [Development](#development)
- [License](#license)

## 🎮 Overview

Create: Legacies is a modded Minecraft server focused on the Create mod and its expansions. This repository contains all custom KubeJS scripts that power the server's unique gameplay mechanics, including:

- **Faction War System**: Complete war mechanics with claim blocking, unclaimer items, and hardcore revival integration
- **Auto Item Cleanup**: Smart clearlag system to maintain server performance
- **Material Unification**: Unified tags for cross-mod material compatibility
- **Custom Recipes**: Balanced recipes using Vintage Improvements and other mods
- **Structure Scanner**: WorldEdit-like tools for structure manipulation
- **FTB Chunks Integration**: Whitelist configuration for protected interactions

## ✨ Features

### War Mechanics
- **Claim Blocking**: Prevents chunk claiming during active wars
- **Defeat Cooldown**: 1-hour claim restriction after war defeat
- **War Unclaimer Items**: Special items for unclaiming enemy territory
- **Hardcore Revival Integration**: Protects war items during knockdown/death states
- **Automatic Item Recovery**: Returns war items on revival or respawn

### Server Performance
- **Smart Clearlag**: Automatic item cleanup with configurable intervals
- **Blacklist Support**: Protect specific items from cleanup
- **Detailed Reporting**: Track what items are being removed
- **Customizable Notifications**: Warning system before cleanup occurs

### Material Unification
Unified tags for seamless cross-mod compatibility:
- Aluminum (ingots, dusts, sheets, blocks)
- Copper (sheets)
- Titanium (ingots, sheets)
- Lithium (ingots, raw materials, blocks, dusts)
- Steel (sheets, blocks)
- Sulfur & Sulfuric Acid
- Uranium (ingots, dusts)
- Hydrogen (fluids)
- Brass (sheets)
- Andesite (sheets)

### Custom Crafting
- **Pressurizing Recipes**: Advanced recipes using Vintage Improvements
- **Vacuumizing Recipes**: Specialized alloy creation
- **Recipe Removals**: JEI integration for removed recipes

## 📦 Installation

1. Ensure you have a Minecraft server running with the following mods:
   - KubeJS
   - Create and Create addons (TFMG, Vintage Improvements, etc.)
   - FTB Chunks
   - FTB Teams
   - Hardcore Revival (optional, for war mechanics)
   - Mekanism (for recipes)

2. Clone or download this repository

3. Copy the `kubejs` folder to your server's root directory

4. Restart the server or reload scripts with `/kubejs reload_startup_scripts` and `/reload`

## 📚 Scripts Documentation

### War System

#### `war_claim_blocker.js`
Prevents chunk claiming during active wars and enforces defeat cooldowns.

**Features:**
- Blocks claiming for both parties during active wars
- Enforces 1-hour cooldown after defeat
- Team/party detection and validation
- Real-time cooldown tracking

**Global Variables:**
- `global.activeWars`: Map of active wars
- `global.defeatCooldowns`: Map of party cooldowns

#### `war_unclaimer_protection.js`
Protects war unclaimer items during player knockdown and death.

**Features:**
- Hardcore Revival event integration
- Automatic item removal during knockdown
- Item return on revival
- Queue system for respawn
- Disconnect protection
- Login validation and cleanup

**Global Variables:**
- `global.knockedDownPlayers`: Tracks knocked down players
- `global.unclaimersToReturn`: Queue for respawn items

### Economy & Protection

#### `block_whitelist.js`
Configures FTB Chunks interaction whitelist for protected blocks.

**Whitelisted Blocks:**
- Bank terminals and vendors (Numismatics)
- Ship helms (Valkyrien Skies Eureka)
- Control seats
- Lecterns
- Create seats
- All boat types

### Server Management

#### `clearlag.js`
Automated item cleanup system for server performance.

**Configuration:**
```javascript
let Interval = 30; // Minutes between cleanups
const notifications = [10, 5, 1]; // Minute warnings
const second_notifications = [10, 5, 4, 3, 2, 1]; // Second warnings
let blacklist = []; // Items to protect (regex supported)
```

**Commands:**
- `/clearlag clear` - Manual cleanup
- `/clearlag timer` - Check time remaining
- `/clearlag result` - View last cleanup report

**Global Variables:**
- `global.clearLagTimer`: Current timer value

### Crafting & Recipes

#### `unify.js`
Material unification system using Forge tags.

**Unified Materials:**
- Aluminum (4 tag types)
- Titanium (2 tag types)
- Lithium (4 tag types)
- Steel (2 tag types)
- Sulfur (3 tag types)
- Uranium (2 tag types)
- Brass, Copper, Andesite (sheets)
- Hydrogen (fluid)

#### `addition.js`
Custom recipes using Vintage Improvements.

**Recipe Types:**
- **Pressurizing**: High-pressure crafting with fluids
  - Refined alloys (Obsidian, Glowstone)
  - Hydrogen production from wood
  - HDPE pellet creation
  - Substrate processing
  - Sulfur extraction

- **Vacuumizing**: Vacuum chamber recipes
  - Infused Alloy (Iron + Redstone)

#### `removal_scripts.js`
Removes conflicting or unwanted recipes.

#### `JEI_removals.js` (Client)
Hides removed recipes from JEI interface.

### Structure Tools

#### `special_structures.js`
WorldEdit-like structure scanning and manipulation tools.

**Features:**
- Position selection (`/structure pos1`, `/structure pos2`)
- Structure scanning
- Block data storage
- Player-specific scan data

**Global Variables:**
- `global.structureScanner.positions`: Player positions
- `global.structureScanner.scannedData`: Scanned structure data

## 🎮 Commands

### War System
No direct commands (automatic event-based system)

### Clearlag
- `/clearlag clear` - Force immediate cleanup (requires OP level 2)
- `/clearlag timer` - Check time until next cleanup
- `/clearlag result` - View last cleanup statistics

### Structure Scanner
- `/structure pos1` - Set first position
- `/structure pos2` - Set second position

## ⚙️ Configuration

### KubeJS Config
Located in `kubejs/config/probejs.json`

### JSConfig
Located in `kubejs/jsconfig.json` - Configures TypeScript/JavaScript support

### Modifying Scripts

1. **Clearlag Interval**: Edit `Interval` variable in `clearlag.js`
2. **War Cooldowns**: Edit cooldown duration in `war_claim_blocker.js` (default: 60 minutes)
3. **Material Tags**: Add/modify tags in `unify.js`
4. **Recipes**: Add recipes in `addition.js` or remove in `removal_scripts.js`

## 🔧 Development

### Directory Structure
```
kubejs/
├── assets/              # Resource pack assets
├── client_scripts/      # Client-side scripts (F3+T to reload)
├── config/             # KubeJS configuration
├── data/               # Datapack resources
├── server_scripts/     # Server-side scripts (/reload to reload)
├── startup_scripts/    # Startup scripts (requires restart)
└── jsconfig.json       # JavaScript configuration
```

### Script Types

**Startup Scripts** (`startup_scripts/`):
- Loaded once during game startup
- Used for item/block registration
- Reload with `/kubejs reload_startup_scripts` (may not work fully)

**Server Scripts** (`server_scripts/`):
- Loaded on resource reload
- Recipe modifications, events, commands
- Reload with `/reload`

**Client Scripts** (`client_scripts/`):
- Client-side only
- JEI modifications, tooltips
- Reload with `F3+T`

### Adding New Scripts

1. Create `.js` file in appropriate directory
2. Use KubeJS event system
3. Test in development environment
4. Document in this README
5. Add to version control

### Best Practices

- Use `global` variables for persistent data
- Add console logging for debugging
- Handle null/undefined checks
- Document complex logic
- Test before production deployment

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Niclas

## 🤝 Contributing

This is a private server repository, but suggestions and improvements are welcome:

1. Test your changes thoroughly
2. Follow existing code style
3. Document new features
4. Update this README

## 📞 Support

For issues or questions about the Create: Legacies server:
- Check script console logs in `logs/kubejs/`
- Review event handlers and global variables
- Test with `/kubejs errors` command

## 🔗 Related Projects

- [KubeJS](https://kubejs.com/) - Scripting mod for Minecraft
- [Create](https://github.com/Creators-of-Create/Create) - Main mod
- [FTB Chunks](https://www.feed-the-beast.com/) - Chunk claiming
- [Vintage Improvements](https://www.curseforge.com/minecraft/mc-mods/vintage-improvements) - Create addon

---

**Note**: This repository contains the KubeJS scripts only. For the full modpack configuration, contact the server administrators.
