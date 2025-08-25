// Utils

function keysContains(map, value) {
    let has = false;
    map.each((k, _) => has = k === value);
    return has;
}

function valuesContains(map, value) {
    let has = false;
    map.each((_, v) => has = v === value);
    return has;
}

function keysFromValue(map, value) {
    let keys = [];
    map.each((k, v) => v === value && keys.push(k));
    return keys;
}

// Main stuff

let debug = false;
let playerUnits = new ObjectMap();

// iOS fix

function loopLogic() {
    try {
        let cache = Groups.player;
        let hasNull = cache.contains(p => p.unit() == null)
        if (hasNull) {
            cache.each(p => !!p.unit() && playerUnits.put(p, p.unit()));
        } else {
            playerUnits.clear();
            cache.each(p => playerUnits.put(p, p.unit()))
        }
    } catch (err) {
        if (err instanceof TypeError || e instanceof InternalError) print("Hey iOS, what the heck", err.message);
        else throw err;
    }
}

function unitLoop() {
    loopLogic();
    Time.runTask(0.1, unitLoop);
}

// end iOS fix

Time.runTask(0.1, unitLoop);

Events.on(UnitDestroyEvent, event => {
    print("SOMETHING DIED YAY!");
    const u = event.unit;
    if (debug) {
        print("Player units right now:");
        Groups.player.each(p => print(p + "->" + p.unit()));
        print("Player units in cache:");
        playerUnits.each((p, unit) => print(p + "->" + unit));
        print("The dead unit:")
        print(u);
    }
    const icon = new TextureRegionDrawable(u.type.uiIcon);
    const wasPlayer = valuesContains(playerUnits, u);
    if (u.isPlayer() || wasPlayer) {
        Vars.ui.hudfrag.showToast(icon, "<-- This unit was killed while being controlled by " + keysFromValue(playerUnits, u)[0].name + " :3");
    }
});

if (debug) print("main.js done loading");
