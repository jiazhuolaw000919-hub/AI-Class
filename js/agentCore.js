// agentCore.js
LawAIApp.AgentCore = class {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.active = true;
    this.eventBus = LawAIApp.EventBus;
    this.state = {};
    this.init();
  }
  init() {
    // 子类覆盖
  }
  log(message) {
    console.log(`[${this.name}] ${message}`);
  }
  emit(event, data) {
    this.eventBus.emit(event, data);
  }
  on(event, handler) {
    this.eventBus.on(event, handler.bind(this));
  }
};
