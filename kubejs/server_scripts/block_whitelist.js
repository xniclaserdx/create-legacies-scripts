// Add blocks to FTB Chunks interaction whitelist
// This allows players to interact with these blocks even in claimed chunks they don't own
ServerEvents.tags('block', e => {
  e.get('ftbchunks:interact_whitelist').add([
    'numismatics:creative_vendor',
	'numismatics:bank_terminal',
  'valkyrien_warium:control_seat',
  '#minecraft:boats',
  '#create:seats',
  'minecraft:lectern',
  'vs_eureka:oak_ship_helm',
  'vs_eureka:spruce_ship_helm',
  'vs_eureka:birch_ship_helm',
  'vs_eureka:jungle_ship_helm',
  'vs_eureka:acacia_ship_helm',
  'vs_eureka:dark_oak_ship_helm',
  'vs_eureka:crimson_ship_helm',
  'vs_eureka:warped_ship_helm'
  ])
})