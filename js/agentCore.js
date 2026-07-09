// ===========================================
// agentCore.js
// 多智能体核心基类（Phase 61 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

// 确保基类存在
if (typeof LawAIApp.AgentCore !== 'function') {
    LawAIApp.AgentCore = class AgentCore {
        constructor(name, role) {
            this.name = name || 'Agent';
            this.role = role || 'General';
            this.active = true;
            this.eventBus = LawAIApp.EventBus || {
                emit: function(e, d) { window.dispatchEvent(new CustomEvent(e, { detail: d })); },
                on: function(e, cb) { window.addEventListener(e, function(ev) { cb(ev.detail); }); }
            };
            this.state = {};
            this._initialized = false;
            this.init();
        }

        init() {
            if (this._initialized) return;
            this._initialized = true;
            this.log('Initialized');
        }

        log(message) {
            console.log('[' + this.name + '] ' + message);
        }

        emit(event, data) {
            if (this.eventBus && typeof this.eventBus.emit === 'function') {
                this.eventBus.emit(event, data);
            }
        }

        on(event, handler) {
            if (this.eventBus && typeof this.eventBus.on === 'function') {
                this.eventBus.on(event, handler.bind(this));
            }
        }

        onGraphChange(data) {
            // 子类可覆盖以响应图谱变化
        }

        getState() {
            return this.state;
        }

        setState(key, value) {
            this.state[key] = value;
        }
    };
}

console.log('🤖 AgentCore ready');
