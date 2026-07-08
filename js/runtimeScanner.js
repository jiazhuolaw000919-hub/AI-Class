window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeScanner = {

    scan() {

        const engines = [];

        Object.keys(LawAIApp).forEach(name => {

            const obj = LawAIApp[name];

            if (!obj) return;

            if (typeof obj !== "object") return;

            const score =

                (typeof obj.init === "function") +

                (typeof obj.start === "function") +

                (typeof obj.render === "function");

            if (score > 0) {

                engines.push({

                    name,

                    instance: obj,

                    score

                });

            }

        });

        return engines.sort((a, b) => b.score - a.score);

    }

};
