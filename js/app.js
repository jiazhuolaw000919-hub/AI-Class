window.LawAIApp = window.LawAIApp || {};

window.App = {

    initialized:false,

    init(payload){

        if(this.initialized)return;

        this.initialized=true;

        console.log("🚀 App Runtime V3.9.8");

        const boot=

            payload?.boot ||

            window.LawAIApp.bootStatus ||

            {};

        this.mount(boot);

    },

    mount(boot){

        document.body.innerHTML=`

        <div id="law-runtime-root"

            style="

                min-height:100vh;

                background:#0b1220;

                color:white;

                font-family:Arial;

            ">

        </div>

        `;

        const root=

            document.getElementById(

                "law-runtime-root"

            );

        if(

            window.LawAIApp.SystemComposer?.init

        ){

            window.LawAIApp.SystemComposer.init(

                boot

            );

        }

        else{

            root.innerHTML=`

            <div style="padding:30px">

                <h1>

                🚀 Runtime Loading...

                </h1>

            </div>

            `;

        }

    }

};

window.addEventListener(

    "SYSTEM_READY",

    e=>{

        console.log(

            "⚡ SYSTEM_READY"

        );

        window.App.init(

            e.detail

        );

    }

);
