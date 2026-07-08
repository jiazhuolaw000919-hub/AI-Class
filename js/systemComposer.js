window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer={

    initialized:false,

    init(){

        if(this.initialized){

            this.refresh();

            return;

        }

        this.initialized=true;

        console.log("🧩 Composer LIVE");

        const root=document.getElementById(

            "law-runtime-root"

        );

        root.innerHTML=`

        <div
            style="
                padding:25px;
                color:white;
            ">

            <h1>

            🚀 Law AI Academy

            </h1>

            <div id="learningPanel"></div>

            <br>

            <div id="workspacePanel"></div>

            <br>

            <div id="runtimePanel"></div>

        </div>

        `;

        this.refresh();

    },

    refresh(){

        this.mountLearning();

        this.mountWorkspace();

        this.mountRuntime();

    },

    mountLearning(){

        const el=

            document.getElementById(

                "learningPanel"

            );

        if(!el)return;

        const state=

            LawAIApp

            .LearningStateManager

            ?.getState?.()

            ||

            {};

        el.innerHTML=`

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

        <h2>

        📚 Learning

        </h2>

        <p>

        Level :

        ${state.level||1}

        </p>

        <p>

        XP :

        ${state.xp||0}

        </p>

        <p>

        🔥

        ${state.streak||0}

        </p>

        </div>

        `;

    },

    mountWorkspace(){

        const el=

            document.getElementById(

                "workspacePanel"

            );

        if(!el)return;

        const ws=

            LawAIApp

            .WorkspaceState

            ?.get?.("default")

            ||

            {};

        el.innerHTML=`

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

        <h2>

        🧩 Workspace

        </h2>

        <pre>

${JSON.stringify(ws,null,2)}

        </pre>

        </div>

        `;

    },

    mountRuntime(){

        const el=

            document.getElementById(

                "runtimePanel"

            );

        if(!el)return;

        const boot=

            LawAIApp

            .bootStatus

            ||

            {};

        el.innerHTML=`

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

        <h2>

        ⚙ Runtime

        </h2>

        <p>

        Active Engines :

        ${boot.active?.length||0}

        </p>

        <p>

        Loaded :

        ${boot.loaded?.length||0}

        </p>

        </div>

        `;

    }

};

window.addEventListener(

    "LEARNING_UI_REFRESH",

    ()=>{

        LawAIApp.SystemComposer.refresh();

    }

);
