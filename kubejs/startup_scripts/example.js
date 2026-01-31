const BuiltInRegistries = Java.loadClass("net.minecraft.core.registries.BuiltInRegistries")
ForgeEvents.onEvent("net.minecraftforge.event.entity.living.MobEffectEvent$Applicable", event => {
    let id = BuiltInRegistries.MOB_EFFECT.getKey(event.effectInstance.effect)
    //console.log(id);
    if(id == "crusty_chunks:impending_doom") {
        console.log("denied IMPENDING_DOOM")
        event.setResult("deny")
    }
})
