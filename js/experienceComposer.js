window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceComposer = {
  _academyLoaded: false,

  init() {
    console.log("🎬 ExperienceComposer init");

    const bus = LawAIApp.EventBus;

    if (!bus) return;

    bus.on("experience:update", (data) => {
      this.renderExperience(data);
    });

    // 🔥 新增：Runtime 就绪后加载 Academy
    this._loadAcademy();
  },

  // ============================================================
  // 🔥 NEW: Load Academy Experience Layer (Part 57.3)
  // ============================================================
  _loadAcademy: function() {
    if (this._academyLoaded) {
      console.log('[ExperienceComposer] Academy already loaded');
      return;
    }

    // 等待 Runtime OS 就绪
    var self = this;
    var checkRuntime = function() {
      if (window.LawAIApp?.RuntimeOS) {
        console.log('[ExperienceComposer] ✅ Runtime OS ready, loading Academy...');
        self._injectAcademyLoader();
      } else {
        console.log('[ExperienceComposer] ⏳ Waiting for Runtime OS...');
        setTimeout(checkRuntime, 200);
      }
    };
    checkRuntime();
  },

  _injectAcademyLoader: function() {
    // 检查是否已经存在
    if (window.LawAIApp?.AcademyLoader) {
      console.log('[ExperienceComposer] AcademyLoader already exists');
      this._academyLoaded = true;
      this._startAcademy();
      return;
    }

    console.log('[ExperienceComposer] 🏛️ Injecting AcademyLoader...');

    var script = document.createElement('script');
    script.src = 'js/academy/academyLoader.js';
    script.async = false;
    script.onload = function() {
      console.log('[ExperienceComposer] ✅ AcademyLoader loaded');
      this._academyLoaded = true;
      this._startAcademy();
    }.bind(this);
    script.onerror = function() {
      console.warn('[ExperienceComposer] ⚠️ AcademyLoader load failed, retrying...');
      setTimeout(function() {
        this._injectAcademyLoader();
      }.bind(this), 2000);
    }.bind(this);

    document.head.appendChild(script);
  },

  _startAcademy: function() {
    var loader = window.LawAIApp?.AcademyLoader;
    if (!loader) {
      console.warn('[ExperienceComposer] AcademyLoader not available');
      return;
    }

    var status = loader.getStatus ? loader.getStatus() : {};
    if (status.status === 'ready' || status.status === 'starting') {
      console.log('[ExperienceComposer] Academy already started');
      return;
    }

    console.log('[ExperienceComposer] 🏛️ Starting Academy...');

    try {
      var result = loader.start();
      if (result && typeof result.then === 'function') {
        result.then(function() {
          console.log('[ExperienceComposer] ✅ Academy started');
          LawAIApp.EventBus?.emit?.('experience:update', {
            type: 'academy_ready',
            timestamp: Date.now()
          });
        }).catch(function(err) {
          console.warn('[ExperienceComposer] Academy start failed:', err);
        });
      } else {
        console.log('[ExperienceComposer] ✅ Academy started (sync)');
      }
    } catch (err) {
      console.warn('[ExperienceComposer] Academy start error:', err);
    }
  },

  renderExperience(data) {
    // 原有的渲染逻辑保留
    const root = document.getElementById("app");

    if (!root) return;

    // 如果 Academy 已经渲染了内容，不覆盖
    if (root.innerHTML.includes('Law AI Academy') || root.innerHTML.includes('Academy')) {
      return;
    }

    root.innerHTML = `
      <div style="padding:20px;color:white">
        <h2>🧠 Learning Experience</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }
};

// ============================================================
// AUTO-INIT
// ============================================================
if (document.readyState === 'complete') {
  LawAIApp.ExperienceComposer.init();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    LawAIApp.ExperienceComposer.init();
  });
}

console.log('🎬 ExperienceComposer V2 loaded');
