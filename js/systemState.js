LawAIApp.SystemState = {
  ready: false,
  boot: null,

  setBoot(data) {
    this.boot = data;
    this.ready = true;

    window.dispatchEvent(new Event("SYSTEM_STATE_READY"));
  },

  getBoot() {
    return this.boot;
  }
};
