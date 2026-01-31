//Remove Titanium Pressing
ServerEvents.recipes(event => {
  event.remove({ id: 'create_tank_defenses:titanium_pressing' })
})
//Remove Mekanism
ServerEvents.recipes(event => {
  //Digital Miner
    event.remove({ id: 'mekanism:digital_miner' })
  
  //Teleporter
    event.remove({ id: 'mekanism:teleporter' })
  
  //Teleporter Frame
    event.remove({ id: 'mekanism:teleporter_frame' })
  
  //Portable Teleporter
    event.remove({ id: 'mekanism:portable_teleporter' })
  
  //Basic Logistical Transporter
    event.remove({ id: 'mekanism:transmitter/logistical_transporter/basic' })
  
  //Advanced Logistical Transporter
    //event.remove({ id: 'mekanism:transmitter/logistical_transporter/advanced' })
  
  //Elite Logistical Transporter
    //event.remove({ id: 'mekanism:transmitter/logistical_transporter/elite' })

  //Ultimate Logistical Transporter
    //event.remove({ id: 'mekanism:transmitter/logistical_transporter/ultimate' })
  
  //Restrictive Transporter
    //event.remove({ id: 'mekanism:transmitter/restrictive_transporter' })
  
  //Diversion Transporter
    //event.remove({ id: 'mekanism:transmitter/diversion_transporter' })
  
  //Basic Mechanical Pipe
    event.remove({ id: 'mekanism:transmitter/mechanical_pipe/basic' })
  
  //Advanced Mechanical Pipe
    //event.remove({ id: 'mekanism:transmitter/mechanical_pipe/advanced' })
  
  //Elite Mechanical Pipe
    //event.remove({ id: 'mekanism:transmitter/mechanical_pipe/elite' })

  //Ultimate Mechanical Pipe
    //event.remove({ id: 'mekanism:transmitter/mechanical_pipe/ultimate' })

  //Jetpack
    event.remove({ id: 'mekanism:jetpack' })
  
  //Armored Jetpack
    event.remove({ id: 'mekanism:jetpack_armored' })
  
  //Module Teleportation Unit
    event.remove({ id: 'mekanism:module_teleportation_unit' })
  
  //Module Vein Mining Unit
    event.remove({ id: 'mekanism:module_vein_mining_unit' })
  
  //Module Blasting Unit
    event.remove({ id: 'mekanism:module_blasting_unit' })
  
  //Module Silk Touch Unit
    event.remove({ id: 'mekanism:module_silk_touch_unit' })
  
  //Module Shearing Unit
    event.remove({ id: 'mekanism:module_shearing_unit' })
  
  //Module Fortune Unit
    event.remove({ id: 'mekanism:module_fortune_unit' })
  
  //Module Farming Unit
    event.remove({ id: 'mekanism:module_farming_unit' })
  
  //Module Attack Amplification Unit
    event.remove({ id: 'mekanism:module_attack_amplification_unit' })
  
  //Module Excavation Escalation Unit
    event.remove({ id: 'mekanism:module_excavation_escalation_unit' })
  
  //Module Jetpack Unit
    event.remove({ id: 'mekanism:module_jetpack_unit' })
  
  //Module Gravitational Modulating Unit
    event.remove({ id: 'mekanism:module_gravitational_modulating_unit' })
  
  //Module Elytra Unit
    event.remove({ id: 'mekanism:module_elytra_unit' })
  
  //Module Gyroscopic Stabilization Unit
    event.remove({ id: 'mekanism:module_gyroscopic_stabilization_unit' })
  
  //Module Frost Walker Unit
    event.remove({ id: 'mekanism:module_frost_walker_unit' })
  
  //Meka Tool
    event.remove({ id: 'mekanism:meka_tool' })
  
  //Atomic Disassembler
    //event.remove({ id: 'mekanism:atomic_disassembler' })
  
  //Gunpowder
    event.remove({ id: 'mekanism:enriching/conversion/sulfur_to_gunpowder' })
    event.remove({ id: 'crusty_chunks:gunpowder_recipe' })
    event.remove({ id: 'create_the_air_wars:esfd' })
    event.remove({ id: 'mekanism:crushing/flint_to_gunpowder' })

  //Aluminum Sheet
    event.remove({ id: 'vintageimprovements:pressing/aluminum_ingot' })
    event.remove({ id: 'vintageimprovements:rolling/aluminum_plate' })

  //Steel
  event.remove({ id: 'create_tank_defenses:steel_nugget_craft' })
  event.remove({ id: 'create_tank_defenses:steel_pressing' })
  event.remove({ id: 'tfmg:sequenced_assembly/heavy_plate' })
  
  //Brass
  event.remove({ id: 'create:pressing/brass_ingot' })
  event.remove({ id: 'vintageimprovements:rolling/brass_plate' })

  //Industrial Iron
  event.remove({ id: 'createbigcannons:compacting/iron_to_cast_iron_ingot' })

  //Copper
  event.remove({ id: 'create:pressing/copper_ingot' })
  event.remove({ id: 'protection_pixel:heatoverlockmechanismloot' })
  event.remove({ id: 'createaddition:rolling/copper_plate' })

  //Andesite
  event.remove({ id: 'vintageimprovements:rolling/andesite_plate' })
  event.remove({ id: 'vintageimprovements:pressing/andesite_alloy' })

  //Limesand
  event.remove({ id: 'tfmg:crushing/limesand' })
})
//Sophisticated Backpacks
ServerEvents.recipes(event => {
    // Compatibility with Sophisticated Backpacks
        event.remove({ output: 'sophisticatedbackpacks:inception_upgrade' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_starter_tier' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_tier_1' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_tier_2' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_tier_3' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_tier_4' })
        event.remove({ output: 'sophisticatedbackpacks:stack_upgrade_omega_tier' })
        // These upgrades have been made inaccessible due to their performance and file size impact on clients and servers based on past experience.
})

	//VS Tournament for Balancing
ServerEvents.recipes(event => {
	event.remove({ id: 'vs_tournament:rope' })
	event.remove({ id: 'vs_tournament:pulse_gun' })
	event.remove({ id: 'vs_tournament:delete_wand' })
	event.remove({ id: 'vs_tournament:upgrade_thruster' })
	event.remove({ id: 'vs_tournament:gift_bag' })
	event.remove({ id: 'vs_tournament:iron_cube/iron_cube' })
	event.remove({ id: 'vs_tournament:create/coal_dust' })
	event.remove({ id: 'vs_tournament:create/coal_dust_charcoal' })
	event.remove({ id: 'vs_tournament:ship_assembler' })
	//event.remove({ id: 'vs_tournament:balloon_unpowered' })
	event.remove({ id: 'vs_tournament:thruster' })
	event.remove({ id: 'vs_tournament:tiny_thruster' })
	//event.remove({ id: 'vs_tournament:spinner' })
	event.remove({ id: 'vs_tournament:seat' })
	event.remove({ id: 'vs_tournament:rope_hook' })
	event.remove({ id: 'vs_tournament:chunk_loader' })
	event.remove({ id: 'vs_tournament:connector' })
	event.remove({ id: 'vs_tournament:explosives/instant_small' })
	event.remove({ id: 'vs_tournament:explosives/instant_medium' })
	event.remove({ id: 'vs_tournament:explosives/instant_large' })
	event.remove({ id: 'vs_tournament:explosives/staged_small' })
})

//Decorative Blocks
ServerEvents.recipes(event => {
  event.remove({ id: 'decorative_blocks:bar_panel' })
})

//Warium Until Fixed
ServerEvents.recipes(event => {
  event.remove({ id: 'crusty_chunks:electric_firebox_recipe' })
  event.remove({ id: 'crusty_chunks:large_motor_recipe' })
})

//Kitchen Must Grow Until Fixed
ServerEvents.recipes(event => {
  event.remove({ id: 'kitchen_grow:crafting/fermentation_barrel' })
})

//Tinkers Construct Ingot Removal
ServerEvents.recipes(event => {
  //Iron Ingot Removal
  event.remove({ id: 'mekanism:processing/iron/ingot/from_dust_smelting' })
  event.remove({ id: 'create:smelting/iron_ingot_from_crushed' })
  event.remove({ id: 'minecraft:iron_ingot_from_smelting_raw_iron' })
  event.remove({ id: 'minecraft:iron_ingot_from_blasting_raw_iron' })
  event.remove({ id: 'minecraft:iron_ingot_from_smelting_deepslate_iron_ore' })
  event.remove({ id: 'create:blasting/iron_ingot_from_crushed' })
  event.remove({ id: 'minecraft:iron_ingot_from_blasting_deepslate_iron_ore' })
  event.remove({ id: 'create_tank_defenses:blast_iron_dust' })
  //Copper Ingot Removal
  event.remove({ id: 'create:smelting/copper_ingot_from_crushed' })
  event.remove({ id: 'crusty_chunks:copper_dust_smelt' })
  event.remove({ id: 'minecraft:copper_ingot_from_smelting_raw_copper' })
  event.remove({ id: 'minecraft:copper_ingot_from_smelting_copper_ore' })
  event.remove({ id: 'create:blasting/copper_ingot_from_crushed' })
  event.remove({ id: 'mekanism:processing/copper/ingot/from_dust_blasting' })
  event.remove({ id: 'minecraft:copper_ingot_from_blasting_raw_copper' })
  event.remove({ id: 'minecraft:copper_ingot_from_blasting_copper_ore' })
  //Gold Ingot Removal
  event.remove({ id: 'create:smelting/gold_ingot_from_crushed' })
  event.remove({ id: 'crusty_chunks:gold_dust_smelt' })
  event.remove({ id: 'minecraft:gold_ingot_from_smelting_raw_gold' })
  event.remove({ id: 'minecraft:gold_ingot_from_smelting_deepslate_gold_ore' })
  event.remove({ id: 'create:blasting/gold_ingot_from_crushed' })
  event.remove({ id: 'mekanism:processing/gold/ingot/from_dust_blasting' })
  event.remove({ id: 'minecraft:gold_ingot_from_blasting_raw_gold' })
  event.remove({ id: 'minecraft:gold_ingot_from_blasting_deepslate_gold_ore' })
  //Netherite Ingot Removal
  event.remove({ id: 'mekanism:processing/netherite/ingot_from_dust_smelting' })
  event.remove({ id: 'mekanism:processing/netherite/ingot_from_dust_blasting' })
  //Uranium Ingot Removal
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_dust_smelting' })
  event.remove({ id: 'create:smelting/ingot_uranium_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_raw_smelting' })
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_ore_smelting' })
  event.remove({ id: 'create:blasting/ingot_uranium_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_dust_blasting' })
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_raw_blasting' })
  event.remove({ id: 'mekanism:processing/uranium/ingot/from_ore_blasting' })
  //Aluminum Ingot Removal
  event.remove({ id: 'create_tank_defenses:smelt_crushed_raw_aluminum' })
  event.remove({ id: 'tfmg:smelting/aluminum_ingot' })
  event.remove({ id: 'crusty_chunks:aluminum_dust_smelt' })
  event.remove({ id: 'create_tank_defenses:smelt_raw_aluminum' })
  event.remove({ id: 'create_tank_defenses:smelt_aluminium_ore' })
  event.remove({ id: 'create_tank_defenses:smelt_deepslate_aluminium_ore' })
  event.remove({ id: 'create_tank_defenses:blast_crushed_raw_aluminum' })
  event.remove({ id: 'tfmg:smelting/blasting/aluminum_ingot' })
  event.remove({ id: 'create_tank_defenses:blast_raw_aluminum' })
  event.remove({ id: 'create_tank_defenses:blast_aluminium_ore' })
  event.remove({ id: 'create_tank_defenses:blast_deepslate_aluminium_ore' })
  event.remove({ id: 'create_tank_defenses:blast_aluminum_dust' })
  //Nickel Ingot Removal
  event.remove({ id: 'crusty_chunks:nickel_dust_smelt' })
  event.remove({ id: 'crusty_chunks:nickel_ore_smelting' })
  event.remove({ id: 'tfmg:smelting/nickel_ingot_from_crushed' })
  event.remove({ id: 'tfmg:smelting/blasting/nickel_ingot_from_crushed' })
  event.remove({ id: 'tfmg:smelting/blasting/nickel_ingot' })
  //Nickel Crushed Removal
  event.remove({ id: 'create:crushing/raw_nickel' })
  //Lead Ingot Removal
  event.remove({ id: 'mekanism:processing/lead/ingot/from_raw_smelting' })
  event.remove({ id: 'mekanism:processing/lead/ingot/from_dust_smelting' })
  event.remove({ id: 'mekanism:processing/lead/ingot/from_ore_smelting' })
  event.remove({ id: 'tfmg:smelting/lead_ingot_from_crushed' })
  event.remove({ id: 'mekanism:processing/lead/ingot/from_ore_blasting' })
  event.remove({ id: 'mekanism:processing/lead/ingot/from_dust_blasting' })
  event.remove({ id: 'tfmg:smelting/blasting/lead_ingot_from_crushed' })
  event.remove({ id: 'mekanism:processing/lead/ingot/from_raw_blasting' })
  //Steel Ingot Removal
  event.remove({ id: 'mekanism:processing/steel/ingot/from_dust_smelting' })
  event.remove({ id: 'crusty_chunks:rusty_block_smelt' })
  event.remove({ id: 'create_tank_defenses:blast_steel_dust' })
  //Bronze Ingot Removal
  event.remove({ id: 'mekanism:processing/bronze/ingot/from_dust_smelting' })
  event.remove({ id: 'mekanism:processing/bronze/ingot/from_dust_blasting' })
  //Brass Ingot Removal
  event.remove({ id: 'crusty_chunks:brass_dust_smelt' })
  //Zinc Ingot Removal
  event.remove({ id: 'create:smelting/zinc_ingot_from_ore' })
  event.remove({ id: 'crusty_chunks:zinc_dust_smelt' })
  event.remove({ id: 'create:smelting/zinc_ingot_from_crushed' })
  event.remove({ id: 'create:smelting/zinc_ingot_from_raw_ore' })
  event.remove({ id: 'create:blasting/zinc_ingot_from_ore' })
  event.remove({ id: 'create:blasting/zinc_ingot_from_raw_ore' })
  event.remove({ id: 'create:blasting/zinc_ingot_from_crushed' })
  //Tin Ingot Removal
  event.remove({ id: 'create:smelting/ingot_tin_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_dust_smelting' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_ore_smelting' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_raw_smelting' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_raw_blasting' })
  event.remove({ id: 'create:blasting/ingot_tin_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_ore_blasting' })
  event.remove({ id: 'mekanism:processing/tin/ingot/from_dust_blasting' })
  //Osmium Ingot Removal
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_raw_smelting' })
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_dust_smelting' })
  event.remove({ id: 'create:smelting/ingot_osmium_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_ore_smelting' })
  event.remove({ id: 'create:blasting/ingot_osmium_compat_mekanism' })
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_raw_blasting' })
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_ore_blasting' })
  event.remove({ id: 'mekanism:processing/osmium/ingot/from_dust_blasting' })

})