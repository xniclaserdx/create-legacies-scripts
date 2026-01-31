/*//Vintage Improvements Pressurizin
ServerEvents.recipes(event => {
  //Output: Refined Obsidian Ingot Input: Osmium Ingot + Refined Obsidian Dust
    event.recipes.vintageimprovements.pressurizing('mekanism:ingot_refined_obsidian', ['#forge:ingots/osmium', 'mekanism:dust_refined_obsidian']).heated()
  
  //Output: Refined Glowstone Ingot Input: Osmium Ingot + Glowstone Dust
    event.recipes.vintageimprovements.pressurizing('mekanism:ingot_refined_glowstone', ['#forge:ingots/osmium', '#forge:dusts/glowstone']).heated()
  
  //Output: Sulfur x9 + Liquid Hydrogen 1000 Input: Coal Block + Water 1000 + Oxygen 1000
    event.recipes.vintageimprovements.pressurizing([Item.of('crusty_chunks:sulfur', 9), Fluid.of('mekanism:hydrogen', 1000)], [['#forge:storage_blocks/coal', '#forge:storage_blocks/charcoal'], {'fluidTag': 'minecraft:water', 'amount': 1000}, Fluid.of('mekanism:oxygen', 1000)]).heated()
  
  //Output: Liquid Hydrogen 10 Input: Wooden Slab + Water 10 + Oxygen 10
    event.recipes.vintageimprovements.pressurizing([Fluid.of('mekanism:hydrogen', 10)], ['#minecraft:wooden_slabs', {'fluidTag': 'minecraft:water', 'amount': 10}, Fluid.of('mekanism:oxygen', 10)]).heated()
  
  //Output: Substrate + Ethylen 100 Input: Bio Fuels x2 + Water 10 + Hydrogen 100
    event.recipes.vintageimprovements.pressurizing(['mekanism:substrate', Fluid.of('mekanism:ethene', 100)], ['#forge:fuels/bio', '#forge:fuels/bio', {'fluidTag': 'minecraft:water', 'amount': 10}, Fluid.of('mekanism:hydrogen', 100)]).heated()
  
  //Output: HDPE Pellet Input: Substrate + Ethylen 50 + Oxygen 10
    event.recipes.vintageimprovements.pressurizing('mekanism:hdpe_pellet', ['mekanism:substrate', Fluid.of('mekanism:ethene', 50), Fluid.of('mekanism:oxygen', 10)]).heated()
  
  //Output: Liquid Hydrogen 15 Input: Wooden Stairs + Water 15 + Oxygen 15
    event.recipes.vintageimprovements.pressurizing([Fluid.of('mekanism:hydrogen', 15)], ['#minecraft:wooden_stairs', {'fluidTag': 'minecraft:water', 'amount': 15}, Fluid.of('mekanism:oxygen', 15)]).heated()
  
  //Output: Substrate x8 + Oxygen 10 Input: Substrate + water 200 + Ethylen 100
    event.recipes.vintageimprovements.pressurizing([Item.of('mekanism:substrate', 8), Fluid.of('mekanism:oxygen', 10)], ['mekanism:substrate', {'fluidTag': 'minecraft:water', 'amount': 200}, Fluid.of('mekanism:ethene', 100)]).heated()
  
  //Output: Charcoal Dust x4 + Liquid Hydrogen 400 Input: Logs x4 + Water 400 + Oxygen 400
    event.recipes.vintageimprovements.pressurizing([Item.of('mekanism:dust_charcoal', 4), Fluid.of('mekanism:hydrogen', 400)], [['#minecraft:logs', '#minecraft:logs', '#minecraft:logs', '#minecraft:logs'], {'fluidTag': 'minecraft:water', 'amount': 400}, Fluid.of('mekanism:oxygen', 400)]).heated()
  
  //Output: Liquid Hydrogen 25 Input: Sawdust x8 + Water 25 + Oxygen 25
    event.recipes.vintageimprovements.pressurizing([Fluid.of('mekanism:hydrogen', 25)], ['mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', 'mekanism:sawdust', {'fluidTag': 'minecraft:water', 'amount': 25}, Fluid.of('mekanism:oxygen', 25)]).heated()
  
  //Output: Sulfur + Liquid Hydrogen 100 Input: Coal Dust + Water 100 + Oxygen 100
    event.recipes.vintageimprovements.pressurizing(['crusty_chunks:sulfur', Fluid.of('mekanism:hydrogen', 100)], ['#forge:dusts/coal', {'fluidTag': 'minecraft:water', 'amount': 100}, Fluid.of('mekanism:oxygen', 100)]).heated()
  
  //Output: Liquid Hydrogen 10 Input: Sticks x3 + Water 10 + Oxygen 10
    event.recipes.vintageimprovements.pressurizing([Fluid.of('mekanism:hydrogen', 10)], ['minecraft:stick', 'minecraft:stick', 'minecraft:stick', {'fluidTag': 'minecraft:water', 'amount': 10}, Fluid.of('mekanism:oxygen', 10)]).heated()
  
  //Output: Sulfur + Liquid Hydrogen 100 Input: Coals + Water 100 + Oxygen 100
    event.recipes.vintageimprovements.pressurizing(['crusty_chunks:sulfur', Fluid.of('mekanism:hydrogen', 100)], ['#minecraft:coals', {'fluidTag': 'minecraft:water', 'amount': 100}, Fluid.of('mekanism:oxygen', 100)]).heated()
  
  //Output: Charcoal Dust + Liquid Hydrogen 400 Input: Planks x20 + Water 400 + Oxygen 400
    event.recipes.vintageimprovements.pressurizing(['mekanism:dust_charcoal', Fluid.of('mekanism:hydrogen', 400)], ['#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', '#minecraft:planks', {'fluidTag': 'minecraft:water', 'amount': 400}, Fluid.of('mekanism:oxygen', 400)]).heated()

})
//Vintage Improvements Vacuumizing
ServerEvents.recipes(event => {
  //Output: Infused Alloy Input: Iron Ingot + Redstone Dust
    event.recipes.vintageimprovements.vacuumizing('mekanism:alloy_infused', ['#forge:ingots/iron', '#forge:dusts/redstone']).heated()
  
  //Output: Reinforced Alloy Input: Infused Alloy + Diamond Dust
    event.recipes.vintageimprovements.vacuumizing('mekanism:alloy_reinforced', ['mekanism:alloy_infused', '#forge:dusts/diamond']).heated()
  
  //Output: Atomic Alloy Input: Reinforced Alloy + Refined Obsidian Dust
    event.recipes.vintageimprovements.vacuumizing('mekanism:alloy_atomic', ['mekanism:alloy_reinforced', 'mekanism:dust_refined_obsidian']).heated()
  
  //Output: Basic Control Circuit Input: Osmium Ingot + Redstone Dust
    event.recipes.vintageimprovements.vacuumizing('mekanism:basic_control_circuit', ['#forge:ingots/osmium', '#forge:dusts/redstone']).heated()
  
  //Output: Steel Dust Input: Enriched Iron + Coal
    event.recipes.vintageimprovements.vacuumizing('mekanism:dust_steel', ['mekanism:enriched_iron', '#minecraft:coals']).heated()
  
  //Output: Enriched Iron Input: Iron Ingot + Coal
    event.recipes.vintageimprovements.vacuumizing('mekanism:enriched_iron', ['#forge:ingots/iron', '#minecraft:coals']).heated()
  
  //Output: Bronze Ingot x4 Input: Copper Ingot + Tin Dust
    event.recipes.vintageimprovements.vacuumizing(Item.of('mekanism:ingot_bronze', 4), ['#forge:ingots/copper', '#forge:ingots/copper', '#forge:ingots/copper', '#forge:dusts/tin']).heated()
  
  //Output: Bronze Dust x4 Input: Copper Dust + Tin Dust
    event.recipes.vintageimprovements.vacuumizing(Item.of('mekanism:dust_bronze', 4), ['#forge:dusts/copper', '#forge:dusts/copper', '#forge:dusts/copper', '#forge:dusts/tin']).heated()
  
  //Output: Netherite Dust Input: Netherite Scrap x4 + Gold Dust
    event.recipes.vintageimprovements.vacuumizing('mekanism:dust_netherite', ['minecraft:netherite_scrap', 'minecraft:netherite_scrap', 'minecraft:netherite_scrap', 'minecraft:netherite_scrap', '#forge:dusts/gold']).heated()
})
//Lithium
ServerEvents.recipes(event => {
  //Output: Lithium Dust Input: Raw Lithium
    event.recipes.mekanism.crushing('crusty_chunks:lithium_dust', 'crusty_chunks:raw_lithium')
    event.recipes.createCrushing('crusty_chunks:lithium_dust', 'crusty_chunks:raw_lithium')
    event.recipes.createMilling('crusty_chunks:lithium_dust', 'crusty_chunks:raw_lithium')
})
//Plutonium
ServerEvents.recipes(event => {
  //Output: Plutonium Input: Plutonium Nugget
    event.recipes.mekanism.dissolution({gas: 'mekanism:plutonium', amount: 10}, {gas: 'mekanism:sulfuric_acid', amount: 1}, 'crusty_chunks:plutonium_nugget')

})
//Bone Meal
ServerEvents.recipes(event => {
  //Output: Bone Meal Input: Biomass + Coal Dust
    //event.recipes.mekanism.metallurgic_infusing('minecraft:bone_meal', '#forge:dusts/coal', 'mekanism:bio', 100)
    //event.recipes.mekanism.metallurgic_infusing('#forge:dusts/coal', {infusion_type: 'mekanism:bio', amount: 100}, 'minecraft:bone_meal')
    event.recipes.mekanism.metallurgic_infusing('minecraft:bone_meal',['#forge:dusts/coal', '#forge:dusts/charcoal'],'100x mekanism:bio')
    event.recipes.createMixing('minecraft:bone_meal', ['minecraft:gravel', Item.of('#forge:fuels', 32)]).heated()
    event.recipes.mekanism.combining('minecraft:bone_meal', 'minecraft:gravel', Item.of('#forge:fuels', 32))
})
//Recipe Modifications
ServerEvents.recipes(event => {
    event.replaceInput(
        { input: 'vintageimprovements:sulfur' },
        'vintageimprovements:sulfur',
        '#forge:dusts/sulfur'
        )
    event.replaceOutput(
        { output: 'vintageimprovements:sulfur' },
        'vintageimprovements:sulfur',
        'crusty_chunks:sulfur'
        )
    event.replaceInput(
        { input: 'tfmg:sulfur' },
        'tfmg:sulfur',
        '#forge:storage_blocks/sulfur'
    )
    event.replaceOutput(
        { output: 'mekanism:dust_lithium' },
        'mekanism:dust_lithium',
        'crusty_chunks:lithium_dust'
    )
    event.replaceInput(
        { input: 'mekanism:ingot_uranium' },
        'mekanism:ingot_uranium',
        '#forge:ingots/uranium'
    )
    event.replaceOutput(
        { output: 'mekanism:ingot_uranium' },
        'mekanism:ingot_uranium',
        'crusty_chunks:uranium_neural_ingot'
    )
    event.replaceInput(
        { input: 'mekanism:dust_uranium' },
        'mekanism:dust_uranium',
        '#forge:dusts/uranium'
    )
    event.replaceOutput(
        { output: 'mekanism:dust_uranium' },
        'mekanism:dust_uranium',
        'crusty_chunks:uranium_neutral_dust'
    )
    event.replaceInput(
        { input: 'create_tank_defenses:aluminum_ingot' },
        'create_tank_defenses:aluminum_ingot',
        '#forge:ingots/aluminum'
    )
    event.replaceInput(
        { input: 'create:brass_sheet' },
        'create:brass_sheet',
        '#forge:sheets/brass'
    )
    event.replaceOutput(
        { output: 'createbigcannons:cast_iron_ingot' },
        'createbigcannons:cast_iron_ingot',
        'tfmg:cast_iron_ingot'
    )
    event.replaceInput(
        { input: 'createbigcannons:cast_iron_ingot' },
        'createbigcannons:cast_iron_ingot',
        '#forge:ingots/cast_iron'
    )
    event.replaceInput(
        { input: 'create:copper_sheet' },
        'create:copper_sheet',
        '#forge:sheets/copper'
    )
    event.replaceInput(
        { input: 'mekanism:hdpe_sheet' },
        'mekanism:hdpe_sheet',
        ['mekanism:hdpe_sheet', 'tfmg:plastic_sheet']
    )
    event.replaceInput(
        { input: 'tfmg:plastic_sheet' },
        'tfmg:plastic_sheet',
        ['tfmg:plastic_sheet', 'mekanism:hdpe_sheet']
    )
    event.replaceInput(
        { input: 'createdeco:zinc_sheet' },
        'createdeco:zinc_sheet',
        '#forge:plates/zinc'
    )
    event.replaceOutput(
        { output: 'createdeco:zinc_sheet' },
        'createdeco:zinc_sheet',
        'createaddition:zinc_sheet'
    )
})
//Brass
ServerEvents.recipes(event => {
  //Output: Brass Dust Input: Copper Dust + Zinc Dust
  event.recipes.createMixing('crusty_chunks:brass_dust', ['#forge:dusts/copper', '#forge:dusts/zinc']).heated()
  //Output: Brass Dust Input: Brass Ingot
  event.recipes.createCrushing('crusty_chunks:brass_dust', ['#forge:ingots/brass'])
  //Output: Brass Dust Input: Brass Ingot
  event.recipes.createMilling('crusty_chunks:brass_dust', ['#forge:ingots/brass'])
  //Output: Brass Dust Input: Brass Ingot
  event.recipes.mekanism.crushing('crusty_chunks:brass_dust', ['#forge:ingots/brass'])
  //Replace Brass Wire
  event.custom({
    "type": "createaddition:rolling",
    "input": {
      "tag": "forge:sheets/brass"
    },
    "result": {
      "item": "vintageimprovements:brass_wire",
      "count": 2
    }
  })
})
//Copper Sheets
ServerEvents.recipes(event => {
  //Replace: Heat Overclock Mechanism
  event.recipes.createSequencedAssembly([
    Item.of('protection_pixel:heatoverlockingmechanism').withChance(100.0),
    Item.of('create:precision_mechanism').withChance(10.0),
    Item.of('create:sturdy_sheet').withChance(10.0)
  ], 'create:sturdy_sheet', [
    event.recipes.createDeploying('protection_pixel:incompleteheatoverlockmechanism', ['protection_pixel:incompleteheatoverlockmechanism', 'create:precision_mechanism']),
    event.recipes.createDeploying('protection_pixel:incompleteheatoverlockmechanism', ['protection_pixel:incompleteheatoverlockmechanism', 'minecraft:diamond']),
    event.recipes.createDeploying('protection_pixel:incompleteheatoverlockmechanism', ['protection_pixel:incompleteheatoverlockmechanism', '#forge:sheets/copper']),
    event.recipes.createPressing('protection_pixel:incompleteheatoverlockmechanism', 'protection_pixel:incompleteheatoverlockmechanism')
  ]).transitionalItem('protection_pixel:incompleteheatoverlockmechanism').loops(7)
  //Replace: Copper Wire
  event.custom({
    "type": "createaddition:rolling",
    "input": {
      "tag": "forge:sheets/copper"
    },
    "result": {
      "item": "tfmg:copper_wire",
      "count": 2
    }
  })
})
//Andesite Sheets
ServerEvents.recipes(event => {
  //Replace: Andesite Sheet
  event.custom({
    "type": "createaddition:rolling",
    "input": {
      "tag": "forge:sheets/andesite"
    },
    "result": {
      "item": "vintageimprovements:andesite_wire",
      "count": 2
    }
  })
})

//Old Additions

//Turning
ServerEvents.recipes(event => {
	event.recipes.vintageimprovements.turning(Item.of('create:fluid_pipe', 24), 'minecraft:copper_block').processingTime(300)
	event.recipes.vintageimprovements.turning(Item.of('tfmg:plastic_pipe', 24), '#forge:storage_blocks/plastic').processingTime(300)
	event.recipes.vintageimprovements.turning(Item.of('tfmg:aluminum_pipe', 24), '#forge:storage_blocks/aluminum').processingTime(300)
	event.recipes.vintageimprovements.turning(Item.of('tfmg:cast_iron_pipe', 24), '#forge:storage_blocks/cast_iron').processingTime(300)
	event.recipes.vintageimprovements.turning(Item.of('tfmg:steel_pipe', 24), '#forge:storage_blocks/steel').processingTime(500)
		//Casings
	event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:small_casing', 16), 'crusty_chunks:brass_plate').processingTime(100)
	event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:medium_casing', 16), Item.of('crusty_chunks:brass_plate', 2)).processingTime(150)
	event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:large_casing', 16), Item.of('crusty_chunks:brass_plate', 3)).processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:extra_large_casing', 10), Item.of('crusty_chunks:brass_plate', 4)).processingTime(250)
	event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:huge_casing', 12), Item.of('crusty_chunks:brass_plate', 6)).processingTime(250)
    //Warium Lathe
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:brass_fitting', 1), '#createbigcannons:ingot_brass').processingTime(100)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:steel_tube', 1), 'crusty_chunks:steel_cylinder').processingTime(100)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:bored_component', 1), 'crusty_chunks:cast_component').processingTime(100)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:hollowed_large_projectile', 1), 'crusty_chunks:large_projectile').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:hollowed_extra_large_projectile', 1), 'crusty_chunks:extra_large_projectile').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:hollowed_huge_projectile', 1), 'crusty_chunks:huge_projectile').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:small_bored_barrel', 1), 'crusty_chunks:small_unbored_barrel').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:medium_bored_barrel', 1), 'crusty_chunks:medium_unbored_barrel').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:large_bored_barrel', 1), 'crusty_chunks:large_unbored_barrel').processingTime(200)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:huge_bored_barrel', 1), 'crusty_chunks:huge_unbored_barrel').processingTime(300)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:autocannon_barrel', 1), [['crusty_chunks:small_unbored_barrel', 'crusty_chunks:medium_unbored_barrel']]).processingTime(300)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:battle_cannon_barrel', 1), 'crusty_chunks:large_unbored_barrel').processingTime(300)
  event.recipes.vintageimprovements.turning(Item.of('crusty_chunks:artillery_barrel', 1), 'crusty_chunks:huge_unbored_barrel').processingTime(300)
})
//Curving
ServerEvents.recipes(event => {
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:steel_gear', 1), 'crusty_chunks:cast_component').head('vintageimprovements:convex_curving_head')
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:wood_component', 1), '#minecraft:planks').head('vintageimprovements:w_shaped_curving_head')
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:steel_wire', 1), '#forge:ingots/steel').head('vintageimprovements:w_shaped_curving_head')
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:steel_spring', 1), [['crusty_chunks:steel_wire', 'vintageimprovements:steel_rod']]).head('vintageimprovements:v_shaped_curving_head')
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:copper_wire', 1), '#forge:ingots/copper').head('vintageimprovements:w_shaped_curving_head')
  event.recipes.vintageimprovements.curving(Item.of('crusty_chunks:copper_coil', 1), [['crusty_chunks:copper_wire', 'createaddition:copper_rod', 'tfmg:copper_wire']]).head('vintageimprovements:v_shaped_curving_head')
})
//Pressing
ServerEvents.recipes(event => {
  event.recipes.create.pressing(Item.of('crusty_chunks:copper_plate', 1), 'minecraft:copper_ingot')
  event.recipes.create.pressing(Item.of('crusty_chunks:brass_plate', 1), '#forge:ingots/brass')
  event.recipes.create.pressing(Item.of('crusty_chunks:steelplate', 1), '#forge:ingots/steel')
})

	//Laser
ServerEvents.recipes(event => {
		// Added recipes below
		event.recipes.vintageimprovements.laser_cutting(Item.of('minecraft:iron_bars', 24), 'minecraft:iron_block').energyCost(4000).maxChargeRate(500)
		event.recipes.vintageimprovements.laser_cutting(Item.of('crusty_chunks:cut_component', 4), 'vintageimprovements:steel_rod').energyCost(500).maxChargeRate(500)
		event.recipes.vintageimprovements.laser_cutting(Item.of('crusty_chunks:steel_gear', 2), 'crusty_chunks:steelplate').energyCost(250).maxChargeRate(500)
})

//Zinc
ServerEvents.recipes(event => {
  //Output: Zinc Dust Input: Zinc Ingot
  event.recipes.mekanism.enriching(Item.of('crusty_chunks:zinc_dust', 4), Item.of('crusty_chunks:raw_zinc', 3))
})
	//Shaped and Shapeless recipes
ServerEvents.recipes(event => {
	event.shaped(
		Item.of('vs_tournament:prop_small'),
			[ 
			  'D D', 
			  ' P ',
			  'D D'  
			],
			{
			  P: 'tfmg:turbine_blade',
			  D: 'create:iron_sheet',
			}
		  )
})
	//Mechanical Crafting
ServerEvents.recipes(event => {
	event.recipes.createMechanicalCrafting('vs_tournament:prop_big', [
		' PCP ',
		'PPCPP',
		'CCICC',
		'PPCPP',
		' PCP '
	], {
		C: 'createaddition:iron_rod',
		P: 'create:iron_sheet',
		I: 'tfmg:turbine_blade'
	})
})

//Mekanism
ServerEvents.recipes(event => {
	event.shaped(Item.of('mekanism:basic_logistical_transporter', 8), [
		'   ',
		'SES',
		'   '
	], {
		S: 'create:andesite_alloy',
		E: 'mekanism:basic_control_circuit',
	})
  event.shaped(Item.of('mekanism:basic_mechanical_pipe', 8), [
		'   ',
		'SES',
		'   '
	], {
		S: '#forge:ingots/steel',
		E: 'create:mechanical_pump',
	})
})
//Drive-By
ServerEvents.recipes(event => {
  event.shaped(Item.of('drivebywire:wire', 1), [
    'III',
    'CCC',
    'III'
  ], {
    I: 'minecraft:dried_kelp',
    C: '#forge:ingots/iron',
  })
  event.shaped(Item.of('drivebywire:wire_cutter', 1), [
    ' I ',
    'SCI',
    ' S '
  ], {
    I: '#forge:ingots/iron',
    S: 'minecraft:dried_kelp',
    C: 'minecraft:shears'
  })
  event.shaped(Item.of('drivebywire:controller_hub', 1), [
    ' I ',
    'SCS',
    'PPP'
  ], {
    I: 'create:electron_tube',
    C: 'create:linked_controller',
    S: 'create:redstone_link',
    P: 'create:brass_casing'
  })
  event.shaped(Item.of('drivebywire:tweaked_controller_hub', 1), [
    ' I ',
    'SCS',
    'PPP'
  ], {
    I: 'create:electron_tube',
    C: 'create_tweaked_controllers:tweaked_linked_controller',
    S: 'create:redstone_link',
    P: 'create:brass_casing'
  })
  event.shaped(Item.of('drivebywire:backup_block', 1), [
    'PPP',
    'PIP',
    'PPP'
  ], {
    P: 'minecraft:blue_wool',
    I: 'drivebywire:wire'
  })
})
//CBC
ServerEvents.recipes(event => {
  event.shaped(Item.of('cbcmodernwarfare:compact_mount', 1), [
    'CIC'
  ], {
    I: 'createbigcannons:fixed_cannon_mount',
    C: 'create:shaft'
  })
})
//Aluminum Crushed
ServerEvents.recipes(event => {
  event.replaceOutput(
    { output: 'create:crushed_raw_aluminum' },
    'create:crushed_raw_aluminum',
    'create_tank_defenses:crushed_raw_aluminum'
    )
})
//Nickel Crushed
ServerEvents.recipes(event => {
  event.replaceOutput(
    { output: 'create:crushed_raw_nickel' },
    'create:crushed_raw_nickel',
    'crusty_chunks:nickel_dust'
    )
})
//Oxygen Tank Input
ServerEvents.recipes(event => {
  event.replaceInput(
    { input: 'beyond_oxygen:oxygen_tank' },
    'beyond_oxygen:oxygen_tank',
    ['beyond_oxygen:oxygen_tank', 'beyond_oxygen:medium_oxygen_tank']
    )
})
*/