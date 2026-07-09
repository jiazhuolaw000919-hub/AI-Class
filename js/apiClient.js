// ===========================================
// apiClient.js
// 统一 API 客户端（Season 4 Chapter 2 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.API = {
    _initialized: false,
    baseUrl: '',

    init: function(config) {
        if (this._initialized) return;
        this._initialized = true;
        config = config || {};
        this.baseUrl = config.baseUrl || '';

        console.log('🌐 API Client initialized');
        return this;
    },

    get: function(endpoint, params) {
        return this._request('GET', endpoint, null, params);
    },

    post: function(endpoint, data) {
        return this._request('POST', endpoint, data);
    },

    put: function(endpoint, data) {
        return this._request('PUT', endpoint, data);
    },

    delete: function(endpoint) {
        return this._request('DELETE', endpoint);
    },

    _request: function(method, endpoint, data, params) {
        return new Promise(function(resolve) {
            try {
                var table = endpoint.split('/')[0] || 'users';
                var query = LawAIApp.Database.from(table);

                if (method === 'GET') {
                    query.select().then(function(result) {
                        resolve({ data: result.data, error: null });
                    });
                } else if (method === 'POST') {
                    query.insert(data).then(function(result) {
                        resolve({ data: result.data, error: null });
                    });
                } else if (method === 'PUT') {
                    query.update(data).then(function(result) {
                        resolve({ data: result.data, error: null });
                    });
                } else {
                    resolve({ data: null, error: 'Method not supported' });
                }
            } catch (err) {
                resolve({ data: null, error: err.message });
            }
        });
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            baseUrl: this.baseUrl
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.API && typeof LawAIApp.API.init === 'function') {
        LawAIApp.API.init();
    }
}, 100);

console.log('🌐 APIClient V2.0 ready');
