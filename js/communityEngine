// ================================================================
// ENGINE: CommunityEngine
// LAYER: Core Logic Layer
// DOMAIN: Learning Community & Social Features
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Manages learning community features including study groups,
//   peer review, mentorship, and knowledge sharing.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   createGroup(params)                 -> Group object
//   joinGroup(groupId)                  -> void
//   leaveGroup(groupId)                 -> void
//   getGroups()                         -> array
//   getGroup(id)                        -> Group object
//   postMessage(groupId, message)       -> void
//   getMessages(groupId)                -> array
//   getStatus()                         -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_community_groups'
//   - Key: 'lawai_community_messages'
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'GroupCreated'   : When a group is created
//   - 'GroupJoined'    : When a user joins a group
//   - 'MessagePosted'  : When a message is posted
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CommunityEngine = {
    _engineName: 'CommunityEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Learning Community & Social Features',

    _initialized: false,
    _groups: [],
    _messages: {},

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        this._groups = this._safeGet('community_groups', []);
        this._messages = this._safeGet('community_messages', {});
        console.log('👥 CommunityEngine initialized with', this._groups.length, 'groups');
    },

    createGroup: function(params) {
        if (!params || !params.name) {
            console.warn('⚠️ Invalid group parameters');
            return null;
        }

        var group = {
            id: 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: params.name,
            description: params.description || '',
            schoolId: params.schoolId || 'school-ai',
            type: params.type || 'study', // 'study' | 'mentorship' | 'project' | 'social'
            members: params.members || ['default_user'],
            maxMembers: params.maxMembers || 50,
            createdBy: params.createdBy || 'default_user',
            createdAt: new Date().toISOString(),
            tags: params.tags || [],
            active: true
        };

        this._groups.push(group);
        this._saveGroups();

        LawAIApp.EventBus?.emit?.('GroupCreated', { group: group });
        console.log('👥 Group created:', group.name);

        return group;
    },

    joinGroup: function(groupId) {
        var group = this.getGroup(groupId);
        if (!group) {
            console.warn('⚠️ Group not found:', groupId);
            return;
        }

        if (group.members.indexOf('default_user') === -1) {
            group.members.push('default_user');
            this._saveGroups();
            LawAIApp.EventBus?.emit?.('GroupJoined', { groupId: groupId, userId: 'default_user' });
            console.log('👥 Joined group:', group.name);
        } else {
            console.log('📌 Already in group:', group.name);
        }
    },

    leaveGroup: function(groupId) {
        var group = this.getGroup(groupId);
        if (!group) return;

        var index = group.members.indexOf('default_user');
        if (index !== -1) {
            group.members.splice(index, 1);
            this._saveGroups();
            console.log('👥 Left group:', group.name);
        }
    },

    getGroups: function() {
        return this._groups.slice();
    },

    getGroup: function(id) {
        return this._groups.find(function(g) { return g.id === id; }) || null;
    },

    postMessage: function(groupId, message) {
        if (!message || !message.content) {
            console.warn('⚠️ Invalid message');
            return;
        }

        var msg = {
            id: 'msg_' + Date.now(),
            groupId: groupId,
            userId: message.userId || 'default_user',
            content: message.content,
            timestamp: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        if (!this._messages[groupId]) {
            this._messages[groupId] = [];
        }
        this._messages[groupId].push(msg);
        this._saveMessages();

        LawAIApp.EventBus?.emit?.('MessagePosted', { message: msg });
        console.log('💬 Message posted in group:', groupId);
    },

    getMessages: function(groupId) {
        return this._messages[groupId] || [];
    },

    getStatus: function() {
        var totalMembers = 0;
        this._groups.forEach(function(g) {
            totalMembers += g.members.length;
        });

        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this._initialized,
            totalGroups: this._groups.length,
            totalMembers: totalMembers,
            activeGroups: this._groups.filter(function(g) { return g.active; }).length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    },

    // ============================================================
    // PRIVATE
    // ============================================================

    _saveGroups: function() {
        this._safeSet('community_groups', this._groups);
    },

    _saveMessages: function() {
        this._safeSet('community_messages', this._messages);
    },

    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
};

setTimeout(function() { LawAIApp.CommunityEngine.init(); }, 300);
console.log('👥 CommunityEngine loaded');
