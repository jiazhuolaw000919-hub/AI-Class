window.LawAIApp = window.LawAIApp || {};

LawAIApp.CelebrationEngine = {
  celebrate(event) {
    console.log("🎉 celebration:", event);

    const el = document.createElement("div");
    el.innerText = "🎉 SUCCESS!";
    el.style = `
      position:fixed;
      top:20px;
      right:20px;
      padding:10px;
      background:#22c55e;
      color:white;
      border-radius:8px;
      z-index:9999;
    `;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1500);
  }
};
