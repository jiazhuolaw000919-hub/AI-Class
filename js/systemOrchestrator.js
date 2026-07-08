window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemOrchestrator = {

    initialized:false,

    ready:false,

    runtimeTimer:null,

    init(){

        if(this.initialized)return;

        this.initialized=true;

        console.log("🧠 SystemOrchestrator V3.9.8");

        this.waitDependencies();

    },

    waitDependencies(){

        if(

            !LawAIApp.EventBus ||

            !LawAIApp.LearningStateManager

        ){

            return setTimeout(

                ()=>this.waitDependencies(),

                200

            );

        }

        this.bindEvents();

        this.start();

    },

    bindEvents(){

        const refresh=()=>{

            try{

                LawAIApp.LearningStateManager.refresh?.();

                this.refreshUI();

            }

            catch(e){

                console.warn(e);

            }

        };

        [

            "LessonCompleted",

            "QuizCompleted",

            "PracticeCompleted",

            "ProjectFinished",

            "GoalUpdated",

            "MemoryUpdated",

            "StreakMilestone"

        ].forEach(evt=>{

            LawAIApp.EventBus.on(

                evt,

                refresh

            );

        });

        this.refreshState=refresh;

    },

    start(){

        this.ready=true;

        this.refreshState?.();

        const payload={

            boot:LawAIApp.bootStatus,

            safeMode:LawAIApp.bootStatus?.safeMode,

            timestamp:Date.now()

        };

        window.dispatchEvent(

            new CustomEvent(

                "SYSTEM_READY",

                {

                    detail:payload

                }

            )

        );

        window.dispatchEvent(

            new CustomEvent(

                "LEARNING_SYSTEM_READY",

                {

                    detail:payload

                }

            )

        );

        this.refreshUI();

        this.startRuntimeLoop();

        console.log(

            "🧠 Runtime LIVE"

        );

    },

    refreshUI(){

        window.dispatchEvent(

            new CustomEvent(

                "LEARNING_UI_REFRESH",

                {

                    detail:{

                        state:

                        LawAIApp

                        .LearningStateManager

                        ?.getState?.()

                    }

                }

            )

        );

    },

    startRuntimeLoop(){

        if(this.runtimeTimer)return;

        this.runtimeTimer=

            setInterval(()=>{

                this.refreshUI();

            },1000);

    },

    triggerLearningLoop(

        lessonId,

        result

    ){

        const loop=

            LawAIApp

            .LearningLoopEngine;

        const state=

            LawAIApp

            .LearningStateManager

            ?.getState?.();

        if(

            !loop||

            !state

        )return;

        if(

            result==="completed"

        ){

            loop.recordSuccess(

                lessonId

            );

        }

        else{

            loop.recordFailure(

                lessonId

            );

        }

        loop.adapt?.();

        this.refreshUI();

    }

};

window.addEventListener(

    "SYSTEM_READY",

    e=>{

        LawAIApp.EngineBinder?.init?.(e.detail);

        LawAIApp.LayoutEngineV2?.init?.(e.detail);

        LawAIApp.ExperienceComposer?.init?.(e.detail);

    }

);
