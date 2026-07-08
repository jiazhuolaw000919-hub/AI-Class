window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeInjector = {

    inject(container) {

        const engines =

            LawAIApp.RuntimeScanner.scan();

        engines.forEach(engine => {

            if (typeof engine.instance.render !== "function")
                return;

            const card = document.createElement("div");

            card.style.cssText = `
                margin-top:15px;
                padding:15px;
                border-radius:10px;
                background:#162033;
            `;

            try {

                engine.instance.render({

                    container: card

                });

            } catch {

                card.innerHTML = `
                    <h3>${engine.name}</h3>
                    <p>Runtime Ready</p>
                `;
            }

            container.appendChild(card);

        });

    }

};
