window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * ENGINE REGISTRY
 * =========================
 */
const ENGINE_REGISTRY = {
  core: [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js"
  ],

  learning: [
    "levelEngine.js",
    "experienceEngine.js",
    "learningIntelligence.js"
  ],

  workspace: [
    "workspaceEngine.js",
    "workspaceState.js",
    "workspaceLayout.js",
    "workspaceWidgets.js",
    "workspaceSearch.js"
  ],

  optional: [
    "motionSystem.js",
    "celebrationEngine.js",
    "themeExperience.js",
    "ambientEngine.js",
    "knowledgeNetwork.js",
    "kreEngine.js"
  ]
};

/**
 * =========================
 * BOOT STATE
 * =========================
 */

window.__ENGINE_STATUS__ = {
    loaded:[],
    missing:[],
    active:[],
    total:0,
    booted:false,
    safeMode:false
};

const CRITICAL_ENGINES=[
    "profileEngine.js",
    "levelEngine.js",
    "experienceEngine.js",
    "learningIntelligence.js"
];

/**
 * =========================
 * STUB
 * =========================
 */

function createStub(name){

    const stub={
        __stub:true,
        name,

        init(){},

        start(){}
    };

    window.LawAIApp[name]=stub;

    window.LawAIApp.EngineRegistry?.register?.(
        name,
        stub
    );
}

/**
 * =========================
 * ACTIVATE ENGINE
 * =========================
 */

function activateEngine(name){

    const engine=window.LawAIApp[name];

    if(!engine)return;

    try{

        engine.init?.();

        engine.start?.();

if (
    !window.__ENGINE_STATUS__.active.includes(name)
) {
    window.__ENGINE_STATUS__.active.push(name);
}

if(
    !window.LawAIApp.RuntimeManager
        ?.engines?.[name]
){

    window.LawAIApp.RuntimeManager
        ?.registerEngine?.(
            name,
            engine
        );

}
    }catch(err){

        console.warn(
            "activation failed",
            name,
            err
        );

    }

}

/**
 * =========================
 * LOAD SCRIPT
 * =========================
 */

function loadScript(src){

    return new Promise(resolve=>{

        const script=document.createElement("script");

        script.src="js/"+src;

        script.onload=()=>{

            const name=src.replace(".js","");

            const engine=window.LawAIApp[name];

            if(engine){

                window.LawAIApp.EngineRegistry?.register?.(
                    name,
                    engine
                );

                activateEngine(name);

            }

            resolve({
                file:src,
                status:"ok"
            });

        };

        script.onerror=()=>{

            createStub(
                src.replace(".js","")
            );

            resolve({

                file:src,

                status:"missing"

            });

        };

        document.head.appendChild(script);

    });

}

/**
 * =========================
 * LOAD GROUP
 * =========================
 */

async function loadGroup(group,list){

    console.log("📦",group);

    return Promise.all(

        list.map(loadScript)

    );

}

/**
 * =========================
 * BOOT
 * =========================
 */

async function boot(){

    console.log("🚀 Loader V3.9.10 starting");

    // Runtime Boot
    LawAIApp.RuntimeRegistry?.init?.();
    LawAIApp.RuntimeManager?.init?.();

  // =========================
// LOAD ALL ENGINE GROUPS
// =========================

for (const [group, files] of Object.entries(ENGINE_REGISTRY)) {

    const results = await loadGroup(group, files);

    results.forEach(r => {

        if (r.status === "ok") {

            window.__ENGINE_STATUS__.loaded.push(r.file);

        } else {

            window.__ENGINE_STATUS__.missing.push(r.file);

        }

    });

}

    const boot=window.__ENGINE_STATUS__;

 
  
    boot.total=
        boot.loaded.length+
        boot.missing.length;

    boot.booted=true;

    boot.safeMode=

        boot.missing.some(f=>

            CRITICAL_ENGINES.includes(f)

        );

    window.LawAIApp.bootStatus=boot;

    console.table(boot);

console.log("📊 Runtime Summary");

console.log({

    loaded:boot.loaded.length,

    active:boot.active.length,

    missing:boot.missing.length,

    safeMode:boot.safeMode

});

    /**
     * Runtime Ready
     */

    window.LawAIApp.RuntimeManager?.boot?.({

    boot,

    active:boot.active

});

if (!LawAIApp.SystemComposer?.initialized) {
    LawAIApp.SystemComposer?.init?.();
}

if (!LawAIApp.LayoutEngineV2?.initialized) {
    LawAIApp.LayoutEngineV2?.init?.();
}

if (!LawAIApp.EngineBinder?.initialized) {
    LawAIApp.EngineBinder?.init?.();
}
    
setTimeout(()=>{

        window.dispatchEvent(

            new CustomEvent(
  
                "SYSTEM_READY",

                {

                    detail:{

                        boot,

                        active:boot.active,

                        timestamp:Date.now()

                    }

                }

            )

        );

    },0);

}

/**
 * =========================
 * SELF HEALING
 * =========================
 */

window.LawAIApp.SelfHealingSystem?.init?.();

boot();
