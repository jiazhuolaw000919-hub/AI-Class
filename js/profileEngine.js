/**
 * =====================================
 * PROFILE ENGINE (V3.9.1 CORE FIX)
 * =====================================
 * Purpose:
 * 管理用户学习画像（learning identity）
 * 作为 learning intelligence / recommendation 的基础
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ProfileEngine = (function () {

  const state = {
    userId: "default_user",
    profile: {
      level: 1,
      xp: 0,
      streak: 0,
      focusMode: "study",
      skills: {},
      preferences: {},
      lastActive: null
    }
  };

  function init() {
    const saved = LawAIApp.StorageEngine?.get("profile");

    if (saved) {
      state.profile = { ...state.profile, ...saved };
    }

    state.profile.lastActive = new Date().toISOString();
    save();

    console.log("🧠 ProfileEngine ready");
  }

  function save() {
    LawAIApp.StorageEngine?.set("profile", state.profile);
  }

  function update(data) {
    state.profile = { ...state.profile, ...data };
    save();

    LawAIApp.EventBus?.emit("ProfileUpdated", state.profile);
  }

  function addXP(amount) {
    state.profile.xp += amount;

    if (state.profile.xp > 100) {
      state.profile.level += 1;
      state.profile.xp = 0;

      LawAIApp.EventBus?.emit("LevelUp", {
        level: state.profile.level
      });
    }

    save();
  }

  function get() {
    return state.profile;
  }

  return {
    init,
    update,
    addXP,
    get
  };

})();
