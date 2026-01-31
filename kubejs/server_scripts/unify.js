// priority: 0

// Visit the wiki for more info - https://kubejs.com/

console.info('Hello, World! (Loaded server scripts)')

//Aluminum Ingot Unification
// 'create_tank_defenses:aluminum_ingot, tfmg:aluminum_ingot'
ServerEvents.tags('item', e => {
  e.get('forge:ingots/aluminum').add([
    'create_tank_defenses:aluminum_ingot',
	'tfmg:aluminum_ingot'
  ])
})
//Aluminum Dust Unification
// 'create_tank_defenses:aluminum_dust, crusty_chunks:aluminum_dust'
ServerEvents.tags('item', e => {
  e.get('forge:dusts/aluminum').add([
    'create_tank_defenses:aluminum_dust',
	'crusty_chunks:aluminum_dust'
  ])
})
//Aluminum Sheet Unification
// 'create_tank_defenses:aluminum_sheet, vintageimprovements:aluminum_sheet'
ServerEvents.tags('item', e => {
  e.get('forge:sheets/aluminum').add([
    'create_tank_defenses:aluminum_sheet',
	'vintageimprovements:aluminum_sheet'
  ])
})
//Alumionum Block Unification
// 'create_tank_defenses:aluminum_block, crusty_chunks:aluminum_block, tfmg:aluminum_block'
ServerEvents.tags('item', e => {
  e.get('forge:storage_blocks/aluminum').add([
    'create_tank_defenses:aluminum_block',
    'crusty_chunks:aluminum_block',
    'tfmg:aluminum_block'
  ])
})
//Copper Sheet Unification
// 'create:copper_sheet, crusty_chunks:copper_plate'
ServerEvents.tags('item', e => {
  e.get('forge:sheets/copper').add([
    'create:copper_sheet',
    'crusty_chunks:copper_plate'
  ])
})
//Titanium Ingot Unification
// 'create_tank_defenses:titanium_ingot, create_the_air_wars:titaniumingot'
ServerEvents.tags('item', e => {
  e.get('forge:ingots/titanium').add([
    'create_tank_defenses:titanium_ingot',
    'create_the_air_wars:titaniumingot'
  ])
})
//Titanium Sheet Unification
// 'create_tank_defenses:titanium_sheet, create_the_air_wars:titaniumsheet'
ServerEvents.tags('item', e => {
  e.get('forge:sheets/titanium').add([
    'create_tank_defenses:titanium_sheet',
    'create_the_air_wars:titaniumsheet'
  ])
})
//Lithium Ingot Unification
// 'tfmg:lithium_ingot, crusty_chunks:lithium_ingot'
ServerEvents.tags('item', e => {
  e.get('forge:ingots/lithium').add([
    'tfmg:lithium_ingot',
    'crusty_chunks:lithium_ingot'
  ])
})
//Lithium Raw Unification
// 'tfmg:raw_lithium, crusty_chunks:raw_lithium'
ServerEvents.tags('item', e => {
  e.get('forge:raw_materials/lithium').add([
    'tfmg:raw_lithium',
    'crusty_chunks:raw_lithium'
  ])
})
//Lithium Block Unification
// 'tfmg:lithium_block, crusty_chunks:lithium_block'
ServerEvents.tags('item', e => {
  e.get('forge:storage_blocks/lithium').add([
    'tfmg:lithium_block',
    'crusty_chunks:lithium_block'
  ])
})
//Lithium Dust Unification
// 'tfmg:dust_lithium, crusty_chunks:lithium_dust'
ServerEvents.tags('item', e => {
  e.get('forge:dusts/lithium').add([
    'tfmg:dust_lithium',
    'crusty_chunks:lithium_dust'
  ])
})
//Steel Sheet Unification
// 'create_tank_defenses:steel_sheet, crusty_chunks:steelplate, tfmg:heavy_plate'
ServerEvents.tags('item', e => {
  e.get('forge:plates/steel').add([
    'create_tank_defenses:steel_sheet',
    'crusty_chunks:steelplate',
    'tfmg:heavy_plate'
  ])
})
//Steel Block Unification
// 'create_tank_defenses:steel_block, mekanism:block_steel, crusty_chunks:steel_block'
ServerEvents.tags('item', e => {
  e.get('forge:storage_blocks/steel').add([
    'create_tank_defenses:steel_block',
    'mekanism:block_steel',
    'crusty_chunks:steel_block'
  ])
})
//Sulfur Unification
// 'create_the_air_wars:raw_sulfur, crusty_chunks:sulfur, vintageimprovements:sulfur'
ServerEvents.tags('item', e => {
  e.get('forge:raw_materials/sulfur').add([
    'create_the_air_wars:raw_sulfur',
    'crusty_chunks:sulfur',
    'vintageimprovements:sulfur'
  ])
//vintageimprovements:sulfur_block, tfmg:sulfur, crusty_chunks:sulfur_block
  e.get('forge:storage_blocks/sulfur').add([
    'vintageimprovements:sulfur_block',
    'tfmg:sulfur',
    'crusty_chunks:sulfur_block'
  ])
//Sulfuric Acid
  e.get('forge:fluids/sulfuric_acid').add([
    'vintageimprovements:sulfuric_acid',
    'tfmg:sulfuric_acid',
    'mekanism:sulfuric_acid'
  ])
})
//Uranium Unification
ServerEvents.tags('item', e => {
  e.get('forge:ingots/uranium').add([
    'mekanism:ingot_uranium',
    'crusty_chunks:uranium_neural_ingot'
  ])
  e.get('forge:dusts/uranium').add([
    'mekanism:dust_uranium',
    'crusty_chunks:uranium_neutral_dust'
  ])
})
//Hydrogen Unification
// 'mekanism:hydrogen, createbb:hydrogen'
ServerEvents.tags('fluid', e => {
  e.get('forge:hydrogen').add([
    'mekanism:hydrogen',
    'createbb:hydrogen'
  ])
})
//Brass Sheet Unification
// 'create:brass_sheet, crusty_chunks:brass_plate
ServerEvents.tags('item', e => {
  e.get('forge:sheets/brass').add([
    'create:brass_sheet',
    'crusty_chunks:brass_plate'
  ])
})
//Andesite Sheet Unification
ServerEvents.tags('item', e => {
  e.get('forge:sheets/andesite').add([
    'createdeco:andesite_sheet',
    'vintageimprovements:andesite_plate'
  ])
})