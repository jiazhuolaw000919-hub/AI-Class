/**
 * Runtime Permission System
 * Part 49.3 — V4.9.3
 * 
 * Permission & Access Control Layer:
 * - Identity Verification
 * - Access Control
 * - Permission Validation
 * - Action Authorization
 * - Audit Support
 * 
 * Security Rules:
 * 1. Default Permission: Least Privilege
 * 2. Sensitive actions require additional verification
 * 3. Permission changes must be recorded
 * 4. Permission failure must not affect runtime
 */

class RuntimePermissionSystem {
    constructor() {
        this.version = '4.9.3';
        this.status = 'ACTIVE';
        
        this.permissions = new Map();
        this.subjectRegistry = new Map();
        this.resourceRegistry = new Map();
        this.auditLog = [];
        this.accessAttempts = [];
        
        this.subjectTypes = {
            DEVELOPER: 'developer',
            AI_ASSISTANT: 'ai_assistant',
            RUNTIME_MODULE: 'runtime_module',
            AUTOMATION_AGENT: 'automation_agent',
            SYSTEM: 'system',
            USER: 'user'
        };
        
        this.accessActions = {
            READ: { level: 1, name: 'READ', description: 'Read data' },
            ANALYZE: { level: 2, name: 'ANALYZE', description: 'Analyze data' },
            RECOMMEND: { level: 3, name: 'RECOMMEND', description: 'Provide recommendations' },
            MODIFY: { level: 4, name: 'MODIFY', description: 'Modify state' },
            EXECUTE: { level: 5, name: 'EXECUTE', description: 'Execute operations' }
        };
        
        this.statuses = {
            ACTIVE: 'active',
            REVOKED: 'revoked',
            SUSPENDED: 'suspended',
            EXPIRED: 'expired',
            PENDING: 'pending'
        };
        
        this.sensitiveActions = ['MODIFY', 'EXECUTE', 'DELETE', 'SHUTDOWN', 'CONFIG_CHANGE'];
        
        this.systemState = {
            initialized: false,
            totalPermissions: 0,
            activePermissions: 0,
            totalSubjects: 0,
            totalResources: 0,
            accessAttempts: { granted: 0, denied: 0, total: 0 },
            lastAccess: null,
            systemHealth: 'HEALTHY'
        };
        
        this.init();
    }
    
    init() {
        console.log('[PermissionSystem] Initializing...');
        this._registerDefaultSubjects();
        this._registerDefaultResources();
        this._grantDefaultPermissions();
        
        this.systemState.initialized = true;
        this.systemState.totalPermissions = this.permissions.size;
        this.systemState.activePermissions = this._countActivePermissions();
        this.systemState.totalSubjects = this.subjectRegistry.size;
        this.systemState.totalResources = this.resourceRegistry.size;
        
        console.log('[PermissionSystem] Ready — ' + this.systemState.activePermissions + ' permissions, ' + this.systemState.totalSubjects + ' subjects, ' + this.systemState.totalResources + ' resources');
        
        this._emitEvent('permissionSystem.initialized', {
            version: this.version,
            permissions: this.systemState.totalPermissions,
            subjects: this.systemState.totalSubjects,
            resources: this.systemState.totalResources
        });
    }
    
    // ========== SUBJECT MANAGEMENT ==========
    
    registerSubject(def) {
        var subjectId = def.subjectId;
        var type = def.type;
        var name = def.name;
        var metadata = def.metadata || {};
        
        var validTypes = Object.values(this.subjectTypes);
        if (validTypes.indexOf(type) === -1) {
            throw new Error('Invalid subject type: ' + type + '. Must be one of: ' + validTypes.join(', '));
        }
        
        var subject = {
            subjectId: subjectId || 'SUB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: type,
            name: name,
            status: 'active',
            metadata: Object.assign({
                registeredAt: new Date().toISOString(),
                registeredBy: 'system'
            }, metadata),
            stats: {
                accessAttempts: 0,
                granted: 0,
                denied: 0,
                lastAccess: null
            }
        };
        
        this.subjectRegistry.set(subject.subjectId, subject);
        this.systemState.totalSubjects = this.subjectRegistry.size;
        
        this._audit('SUBJECT_REGISTERED', { subjectId: subject.subjectId, type: type, name: name });
        
        return subject;
    }
    
    getSubject(subjectId) {
        return this.subjectRegistry.get(subjectId) || null;
    }
    
    // ========== RESOURCE MANAGEMENT ==========
    
    registerResource(def) {
        var resourceId = def.resourceId;
        var name = def.name;
        var type = def.type;
        var sensitivity = def.sensitivity || 'normal';
        var metadata = def.metadata || {};
        
        var resource = {
            resourceId: resourceId || 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: name,
            type: type,
            sensitivity: sensitivity,
            metadata: Object.assign({
                registeredAt: new Date().toISOString()
            }, metadata)
        };
        
        this.resourceRegistry.set(resource.resourceId, resource);
        this.systemState.totalResources = this.resourceRegistry.size;
        
        this._audit('RESOURCE_REGISTERED', { resourceId: resource.resourceId, name: name, type: type, sensitivity: sensitivity });
        
        return resource;
    }
    
    getResource(resourceId) {
        return this.resourceRegistry.get(resourceId) || null;
    }
    
    // ========== PERMISSION MANAGEMENT ==========
    
    grantPermission(def) {
        var permissionId = def.permissionId;
        var subjectId = def.subjectId;
        var resourceId = def.resourceId;
        var action = def.action;
        var scope = def.scope || ['*'];
        var status = def.status || 'ACTIVE';
        var constraints = def.constraints || {};
        var metadata = def.metadata || {};
        
        if (!this.subjectRegistry.has(subjectId)) {
            throw new Error('Subject ' + subjectId + ' not found. Register subject first.');
        }
        
        if (resourceId !== '*' && !this.resourceRegistry.has(resourceId)) {
            throw new Error('Resource ' + resourceId + ' not found. Register resource first.');
        }
        
        var validActions = Object.keys(this.accessActions);
        if (validActions.indexOf(action) === -1) {
            throw new Error('Invalid action: ' + action + '. Must be one of: ' + validActions.join(', '));
        }
        
        var permission = {
            permissionId: permissionId || 'PERM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            subjectId: subjectId,
            resourceId: resourceId,
            action: action,
            actionLevel: this.accessActions[action].level,
            scope: scope,
            status: this.statuses[status] || this.statuses.ACTIVE,
            constraints: {
                timeRestriction: constraints.timeRestriction || null,
                rateLimit: constraints.rateLimit || null,
                requireApproval: constraints.requireApproval || false
            },
            metadata: Object.assign({
                grantedAt: new Date().toISOString(),
                grantedBy: metadata.grantedBy || 'system',
                reason: metadata.reason || 'Default permission grant',
                expiresAt: metadata.expiresAt || null
            }, metadata),
            stats: {
                used: 0,
                lastUsed: null
            }
        };
        
        this.permissions.set(permission.permissionId, permission);
        this.systemState.totalPermissions = this.permissions.size;
        this.systemState.activePermissions = this._countActivePermissions();
        
        this._audit('PERMISSION_GRANTED', {
            permissionId: permission.permissionId,
            subjectId: subjectId,
            resourceId: resourceId,
            action: action,
            scope: scope
        });
        
        return permission;
    }
    
    revokePermission(permissionId, reason) {
        if (!reason) reason = 'Manual revocation';
        
        var permission = this.permissions.get(permissionId);
        if (!permission) {
            throw new Error('Permission ' + permissionId + ' not found');
        }
        
        var oldStatus = permission.status;
        permission.status = this.statuses.REVOKED;
        permission.metadata.revokedAt = new Date().toISOString();
        permission.metadata.revocationReason = reason;
        
        this.systemState.activePermissions = this._countActivePermissions();
        
        this._audit('PERMISSION_REVOKED', {
            permissionId: permissionId,
            oldStatus: oldStatus,
            reason: reason,
            subjectId: permission.subjectId,
            resourceId: permission.resourceId,
            action: permission.action
        });
        
        return permission;
    }
    
    getSubjectPermissions(subjectId) {
        var result = [];
        var all = Array.from(this.permissions.values());
        for (var i = 0; i < all.length; i++) {
            if (all[i].subjectId === subjectId) result.push(all[i]);
        }
        return result;
    }
    
    getResourcePermissions(resourceId) {
        var result = [];
        var all = Array.from(this.permissions.values());
        for (var i = 0; i < all.length; i++) {
            if (all[i].resourceId === resourceId || all[i].resourceId === '*') result.push(all[i]);
        }
        return result;
    }
    
    // ========== ACCESS CONTROL ==========
    
    checkAccess(subjectId, resourceId, action, context) {
        if (!context) context = {};
        
        var startTime = performance.now();
        var accessId = 'ACC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        this.systemState.lastAccess = new Date().toISOString();
        this.systemState.accessAttempts.total++;
        
        // Step 1: Validate subject exists
        var subject = this.subjectRegistry.get(subjectId);
        if (!subject) {
            var result = this._createAccessResult(accessId, subjectId, resourceId, action, false, 'Subject not found');
            this._recordAccessAttempt(result);
            return result;
        }
        
        subject.stats.accessAttempts++;
        subject.stats.lastAccess = new Date().toISOString();
        
        // Step 2: Validate resource exists (allow wildcard)
        var resource = resourceId !== '*' ? this.resourceRegistry.get(resourceId) : null;
        if (resourceId !== '*' && !resource) {
            var result2 = this._createAccessResult(accessId, subjectId, resourceId, action, false, 'Resource not found');
            this._recordAccessAttempt(result2);
            subject.stats.denied++;
            return result2;
        }
        
        // Step 3: Get relevant permissions
        var relevantPermissions = this._findRelevantPermissions(subjectId, resourceId, action);
        
        if (relevantPermissions.length === 0) {
            var result3 = this._createAccessResult(
                accessId, subjectId, resourceId, action, false,
                'No permission granted (Least Privilege principle)'
            );
            this._recordAccessAttempt(result3);
            subject.stats.denied++;
            return result3;
        }
        
        // Step 4: Check each permission
        for (var i = 0; i < relevantPermissions.length; i++) {
            var permission = relevantPermissions[i];
            
            if (permission.status !== this.statuses.ACTIVE) continue;
            
            if (permission.metadata.expiresAt && new Date(permission.metadata.expiresAt) < new Date()) {
                permission.status = this.statuses.EXPIRED;
                this._audit('PERMISSION_EXPIRED', { permissionId: permission.permissionId });
                continue;
            }
            
            var requiredLevel = this.accessActions[action].level;
            if (permission.actionLevel < requiredLevel) continue;
            
            if (!this._scopeMatches(permission.scope, context.scope)) continue;
            if (!this._checkConstraints(permission, context)) continue;
            
            // Step 5: Sensitive action check (Rule 2)
            if (this._isSensitiveAction(action)) {
                var sensitiveCheck = this._validateSensitiveAction(subject, resource, action, context);
                if (!sensitiveCheck.passed) {
                    var result4 = this._createAccessResult(
                        accessId, subjectId, resourceId, action, false,
                        'Sensitive action verification failed: ' + sensitiveCheck.reason,
                        { sensitiveCheck: sensitiveCheck }
                    );
                    this._recordAccessAttempt(result4);
                    subject.stats.denied++;
                    return result4;
                }
            }
            
            // All checks passed — ACCESS GRANTED
            permission.stats.used++;
            permission.stats.lastUsed = new Date().toISOString();
            
            var result5 = this._createAccessResult(
                accessId, subjectId, resourceId, action, true,
                'Access granted via permission ' + permission.permissionId + ' (' + permission.action + ')',
                { permissionId: permission.permissionId, actionLevel: permission.actionLevel }
            );
            
            result5.evaluationTime = (performance.now() - startTime).toFixed(2) + 'ms';
            
            this._recordAccessAttempt(result5);
            subject.stats.granted++;
            
            this._audit('ACCESS_GRANTED', {
                accessId: accessId,
                subjectId: subjectId,
                resourceId: resourceId,
                action: action,
                permissionId: permission.permissionId,
                evaluationTime: result5.evaluationTime
            });
            
            return result5;
        }
        
        // No valid permission found
        var result6 = this._createAccessResult(
            accessId, subjectId, resourceId, action, false,
            'No valid permission found (expired, insufficient level, or constraint violation)'
        );
        this._recordAccessAttempt(result6);
        subject.stats.denied++;
        return result6;
    }
    
    canRead(subjectId, resourceId, context) {
        return this.checkAccess(subjectId, resourceId, 'READ', context);
    }
    
    canModify(subjectId, resourceId, context) {
        return this.checkAccess(subjectId, resourceId, 'MODIFY', context);
    }
    
    canExecute(subjectId, resourceId, context) {
        return this.checkAccess(subjectId, resourceId, 'EXECUTE', context);
    }
    
    getEffectivePermissions(subjectId, minimumAction) {
        if (!minimumAction) minimumAction = 'READ';
        var minLevel = (this.accessActions[minimumAction] || {}).level || 1;
        
        var result = [];
        var all = Array.from(this.permissions.values());
        for (var i = 0; i < all.length; i++) {
            var p = all[i];
            if (p.subjectId === subjectId &&
                p.status === this.statuses.ACTIVE &&
                p.actionLevel >= minLevel) {
                result.push(p);
            }
        }
        return result;
    }
    
    // ========== REPORTING ==========
    
    getReport() {
        var self = this;
        
        var permissionsByAction = {};
        var actions = Object.keys(this.accessActions);
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            var count = 0;
            var allPerms = Array.from(this.permissions.values());
            for (var j = 0; j < allPerms.length; j++) {
                if (allPerms[j].action === action && allPerms[j].status === this.statuses.ACTIVE) {
                    count++;
                }
            }
            permissionsByAction[action] = count;
        }
        
        var permissionsBySubject = {};
        var subjectEntries = Array.from(this.subjectRegistry.entries());
        for (var k = 0; k < subjectEntries.length; k++) {
            var id = subjectEntries[k][0];
            var subject = subjectEntries[k][1];
            var pcount = 0;
            var subPerms = this.getSubjectPermissions(id);
            for (var m = 0; m < subPerms.length; m++) {
                if (subPerms[m].status === this.statuses.ACTIVE) pcount++;
            }
            permissionsBySubject[subject.name || id] = pcount;
        }
        
        return {
            version: this.version,
            status: this.systemState.systemHealth,
            subjects: {
                total: this.systemState.totalSubjects,
                types: this._getSubjectTypeBreakdown()
            },
            resources: {
                total: this.systemState.totalResources
            },
            permissions: {
                total: this.systemState.totalPermissions,
                active: this.systemState.activePermissions,
                byAction: permissionsByAction,
                bySubject: permissionsBySubject
            },
            access: {
                total: this.systemState.accessAttempts.total,
                granted: this.systemState.accessAttempts.granted,
                denied: this.systemState.accessAttempts.denied,
                grantRate: this.systemState.accessAttempts.total > 0
                    ? ((this.systemState.accessAttempts.granted / this.systemState.accessAttempts.total) * 100).toFixed(1) + '%'
                    : 'N/A'
            },
            securityRules: [
                'Rule 1: Default Least Privilege ✅',
                'Rule 2: Sensitive action verification ✅',
                'Rule 3: Permission change audit ✅',
                "Rule 4: Permission failure doesn't affect runtime ✅"
            ],
            recentAudit: this.auditLog.slice(-10)
        };
    }
    
    getHealth() {
        var denyRate = this.systemState.accessAttempts.total > 0
            ? this.systemState.accessAttempts.denied / this.systemState.accessAttempts.total
            : 0;
        
        var health = 'HEALTHY';
        if (denyRate > 0.5) health = 'RESTRICTIVE';
        if (this.systemState.activePermissions === 0) health = 'NO_PERMISSIONS';
        if (this.systemState.totalSubjects === 0) health = 'NO_SUBJECTS';
        
        this.systemState.systemHealth = health;
        
        return {
            status: health,
            version: this.version,
            activePermissions: this.systemState.activePermissions,
            totalSubjects: this.systemState.totalSubjects,
            totalResources: this.systemState.totalResources,
            accessGrantRate: this.systemState.accessAttempts.total > 0
                ? ((this.systemState.accessAttempts.granted / this.systemState.accessAttempts.total) * 100).toFixed(1) + '%'
                : 'N/A',
            lastAccess: this.systemState.lastAccess,
            isOperational: true
        };
    }
    
    getAuditTrail(limit) {
        if (!limit) limit = 100;
        return this.auditLog.slice(-limit);
    }
    
    getAccessHistory(limit) {
        if (!limit) limit = 50;
        return this.accessAttempts.slice(-limit);
    }
    
    // ========== PRIVATE METHODS ==========
    
    _registerDefaultSubjects() {
        this.registerSubject({
            subjectId: 'SUB-DEV-001',
            type: this.subjectTypes.DEVELOPER,
            name: 'System Developer',
            metadata: { description: 'Full development access' }
        });
        
        this.registerSubject({
            subjectId: 'SUB-AI-001',
            type: this.subjectTypes.AI_ASSISTANT,
            name: 'AI Runtime Assistant',
            metadata: { description: 'Analysis and recommendation access' }
        });
        
        this.registerSubject({
            subjectId: 'SUB-MOD-BOOT',
            type: this.subjectTypes.RUNTIME_MODULE,
            name: 'BootManager Module',
            metadata: { description: 'Boot management module', module: 'BootManager' }
        });
        
        this.registerSubject({
            subjectId: 'SUB-MOD-STATE',
            type: this.subjectTypes.RUNTIME_MODULE,
            name: 'StateSyncEngine Module',
            metadata: { description: 'State synchronization module', module: 'StateSyncEngine' }
        });
        
        this.registerSubject({
            subjectId: 'SUB-AUTO-001',
            type: this.subjectTypes.AUTOMATION_AGENT,
            name: 'Automation Agent',
            metadata: { description: 'Automated task execution agent' }
        });
        
        this.registerSubject({
            subjectId: 'SUB-SYS-001',
            type: this.subjectTypes.SYSTEM,
            name: 'System Core',
            metadata: { description: 'Core system process' }
        });
    }
    
    _registerDefaultResources() {
        this.registerResource({
            resourceId: 'RES-RUNTIME',
            name: 'Runtime Core',
            type: 'system',
            sensitivity: 'critical'
        });
        
        this.registerResource({
            resourceId: 'RES-BOOT',
            name: 'Boot Manager',
            type: 'system',
            sensitivity: 'critical'
        });
        
        this.registerResource({
            resourceId: 'RES-STATE',
            name: 'State Store',
            type: 'data',
            sensitivity: 'sensitive'
        });
        
        this.registerResource({
            resourceId: 'RES-METRICS',
            name: 'Runtime Metrics',
            type: 'data',
            sensitivity: 'normal'
        });
        
        this.registerResource({
            resourceId: 'RES-EVENTS',
            name: 'Event Store',
            type: 'data',
            sensitivity: 'normal'
        });
        
        this.registerResource({
            resourceId: 'RES-AI',
            name: 'AI Engine',
            type: 'intelligence',
            sensitivity: 'sensitive'
        });
        
        this.registerResource({
            resourceId: 'RES-KNOWLEDGE',
            name: 'Knowledge Graph',
            type: 'intelligence',
            sensitivity: 'normal'
        });
        
        this.registerResource({
            resourceId: 'RES-CONFIG',
            name: 'System Configuration',
            type: 'system',
            sensitivity: 'critical'
        });
        
        this.registerResource({
            resourceId: 'RES-LOGS',
            name: 'System Logs',
            type: 'data',
            sensitivity: 'normal'
        });
    }
    
    _grantDefaultPermissions() {
        // Developer — Full access
        this.grantPermission({
            subjectId: 'SUB-DEV-001',
            resourceId: '*',
            action: 'EXECUTE',
            scope: ['*'],
            metadata: { reason: 'Developer requires full system access' }
        });
        
        // AI Assistant — ANALYZE + RECOMMEND, no MODIFY/EXECUTE
        this.grantPermission({
            subjectId: 'SUB-AI-001',
            resourceId: '*',
            action: 'RECOMMEND',
            scope: ['*'],
            metadata: { reason: 'AI can analyze and recommend, but not modify' }
        });
        
        this.grantPermission({
            subjectId: 'SUB-AI-001',
            resourceId: 'RES-METRICS',
            action: 'ANALYZE',
            scope: ['*'],
            metadata: { reason: 'AI needs metrics for analysis' }
        });
        
        this.grantPermission({
            subjectId: 'SUB-AI-001',
            resourceId: 'RES-EVENTS',
            action: 'ANALYZE',
            scope: ['*'],
            metadata: { reason: 'AI needs events for analysis' }
        });
        
        this.grantPermission({
            subjectId: 'SUB-AI-001',
            resourceId: 'RES-KNOWLEDGE',
            action: 'ANALYZE',
            scope: ['*'],
            metadata: { reason: 'AI needs knowledge graph for context' }
        });
        
        // BootManager
        this.grantPermission({
            subjectId: 'SUB-MOD-BOOT',
            resourceId: 'RES-BOOT',
            action: 'EXECUTE',
            scope: ['boot'],
            metadata: { reason: 'BootManager manages boot process' }
        });
        
        this.grantPermission({
            subjectId: 'SUB-MOD-BOOT',
            resourceId: 'RES-RUNTIME',
            action: 'MODIFY',
            scope: ['boot'],
            metadata: { reason: 'BootManager can modify runtime during boot' }
        });
        
        // StateSyncEngine
        this.grantPermission({
            subjectId: 'SUB-MOD-STATE',
            resourceId: 'RES-STATE',
            action: 'MODIFY',
            scope: ['state'],
            metadata: { reason: 'StateSyncEngine manages state' }
        });
        
        // Automation Agent
        this.grantPermission({
            subjectId: 'SUB-AUTO-001',
            resourceId: 'RES-METRICS',
            action: 'READ',
            scope: ['*'],
            metadata: { reason: 'Automation agent can read metrics' }
        });
        
        this.grantPermission({
            subjectId: 'SUB-AUTO-001',
            resourceId: 'RES-LOGS',
            action: 'READ',
            scope: ['*'],
            metadata: { reason: 'Automation agent can read logs' }
        });
        
        // System Core — Full access
        this.grantPermission({
            subjectId: 'SUB-SYS-001',
            resourceId: '*',
            action: 'EXECUTE',
            scope: ['*'],
            metadata: { reason: 'System core requires unrestricted access' }
        });
    }
    
    _findRelevantPermissions(subjectId, resourceId, action) {
        var requiredLevel = this.accessActions[action].level;
        var result = [];
        var all = Array.from(this.permissions.values());
        
        for (var i = 0; i < all.length; i++) {
            var p = all[i];
            
            if (p.subjectId !== subjectId && p.subjectId !== '*') continue;
            if (p.resourceId !== resourceId && p.resourceId !== '*') continue;
            if (p.actionLevel < requiredLevel) continue;
            
            result.push(p);
        }
        
        result.sort(function(a, b) {
            var aExact = a.resourceId === resourceId ? 0 : 1;
            var bExact = b.resourceId === resourceId ? 0 : 1;
            if (aExact !== bExact) return aExact - bExact;
            return b.actionLevel - a.actionLevel;
        });
        
        return result;
    }
    
    _scopeMatches(permissionScope, requestScope) {
        if (permissionScope.indexOf('*') !== -1) return true;
        if (!requestScope) return true;
        
        var requestScopes = Array.isArray(requestScope) ? requestScope : [requestScope];
        for (var i = 0; i < requestScopes.length; i++) {
            if (permissionScope.indexOf(requestScopes[i]) !== -1) return true;
        }
        return false;
    }
    
    _checkConstraints(permission, context) {
        var constraints = permission.constraints;
        
        // Time restriction
        if (constraints.timeRestriction) {
            var now = new Date();
            var start = new Date(constraints.timeRestriction.start);
            var end = new Date(constraints.timeRestriction.end);
            if (now < start || now > end) return false;
        }
        
        // Rate limit
        if (constraints.rateLimit && permission.stats.used > 0) {
            var maxRequests = constraints.rateLimit.maxRequests;
            var windowMs = constraints.rateLimit.window;
            var now2 = Date.now();
            var lastUsed = new Date(permission.stats.lastUsed).getTime();
            
            if (now2 - lastUsed < windowMs && (permission.stats._recentCount || 0) >= maxRequests) {
                return false;
            }
            
            if (!permission.stats._recentWindow || now2 - permission.stats._recentWindow > windowMs) {
                permission.stats._recentWindow = now2;
                permission.stats._recentCount = 0;
            }
            
            permission.stats._recentCount = (permission.stats._recentCount || 0) + 1;
        }
        
        // Approval requirement
        if (constraints.requireApproval && !context.approved) return false;
        
        return true;
    }
    
    _isSensitiveAction(action) {
        return this.sensitiveActions.indexOf(action) !== -1;
    }
    
    _validateSensitiveAction(subject, resource, action, context) {
        var checks = [];
        
        // Check 1: Is the resource critical?
        if (resource && resource.sensitivity === 'critical') {
            var allowedTypes = [this.subjectTypes.DEVELOPER, this.subjectTypes.SYSTEM];
            if (allowedTypes.indexOf(subject.type) === -1) {
                return {
                    passed: false,
                    reason: 'Subject type "' + subject.type + '" cannot perform ' + action + ' on critical resource "' + resource.name + '"'
                };
            }
            checks.push('critical_resource_check');
        }
        
        // Check 2: Context must include a valid reason
        if (!context.reason && !context.approved) {
            return {
                passed: false,
                reason: 'Sensitive action "' + action + '" requires a reason or approval in context'
            };
        }
        
        // Check 3: Automation agents need explicit approval
        if (subject.type === this.subjectTypes.AUTOMATION_AGENT && !context.approved) {
            return {
                passed: false,
                reason: 'Automation agents require explicit approval for sensitive actions'
            };
        }
        
        return { passed: true, checks: checks };
    }
    
    _createAccessResult(accessId, subjectId, resourceId, action, granted, reason, details) {
        return {
            accessId: accessId,
            subjectId: subjectId,
            resourceId: resourceId,
            action: action,
            granted: granted,
            reason: reason,
            details: details || {},
            timestamp: new Date().toISOString(),
            systemVersion: this.version
        };
    }
    
    _recordAccessAttempt(result) {
        this.accessAttempts.push(result);
        
        if (result.granted) {
            this.systemState.accessAttempts.granted++;
        } else {
            this.systemState.accessAttempts.denied++;
        }
        
        if (this.accessAttempts.length > 500) {
            this.accessAttempts = this.accessAttempts.slice(-250);
        }
    }
    
    _audit(action, data) {
        if (!data) data = {};
        
        var auditEntry = {
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.auditLog.push(auditEntry);
        
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-500);
        }
        
        this._emitEvent('permissionSystem.audit', auditEntry);
    }
    
    _getSubjectTypeBreakdown() {
        var breakdown = {};
        var entries = Array.from(this.subjectRegistry.entries());
        
        for (var i = 0; i < entries.length; i++) {
            var subject = entries[i][1];
            if (!breakdown[subject.type]) {
                breakdown[subject.type] = 0;
            }
            breakdown[subject.type]++;
        }
        
        return breakdown;
    }
    
    _countActivePermissions() {
        var count = 0;
        var all = Array.from(this.permissions.values());
        for (var i = 0; i < all.length; i++) {
            if (all[i].status === this.statuses.ACTIVE) count++;
        }
        return count;
    }
    
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            
            if (typeof emitFn === 'function') {
                emitFn.call(collector, {
                    type: type,
                    source: 'RuntimePermissionSystem',
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            // Rule 4: Event emission failure doesn't affect runtime
        }
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.RuntimePermissionSystem = new RuntimePermissionSystem();
    
    window.LawAIApp.Permissions = {
        registerSubject: function(def) { return window.LawAIApp.RuntimePermissionSystem.registerSubject(def); },
        getSubject: function(id) { return window.LawAIApp.RuntimePermissionSystem.getSubject(id); },
        registerResource: function(def) { return window.LawAIApp.RuntimePermissionSystem.registerResource(def); },
        getResource: function(id) { return window.LawAIApp.RuntimePermissionSystem.getResource(id); },
        grant: function(def) { return window.LawAIApp.RuntimePermissionSystem.grantPermission(def); },
        revoke: function(id, reason) { return window.LawAIApp.RuntimePermissionSystem.revokePermission(id, reason); },
        getSubjectPermissions: function(subjectId) { return window.LawAIApp.RuntimePermissionSystem.getSubjectPermissions(subjectId); },
        getEffectivePermissions: function(subjectId, minAction) { return window.LawAIApp.RuntimePermissionSystem.getEffectivePermissions(subjectId, minAction); },
        checkAccess: function(subjectId, resourceId, action, context) { return window.LawAIApp.RuntimePermissionSystem.checkAccess(subjectId, resourceId, action, context); },
        canRead: function(subjectId, resourceId, context) { return window.LawAIApp.RuntimePermissionSystem.canRead(subjectId, resourceId, context); },
        canModify: function(subjectId, resourceId, context) { return window.LawAIApp.RuntimePermissionSystem.canModify(subjectId, resourceId, context); },
        canExecute: function(subjectId, resourceId, context) { return window.LawAIApp.RuntimePermissionSystem.canExecute(subjectId, resourceId, context); },
        getReport: function() { return window.LawAIApp.RuntimePermissionSystem.getReport(); },
        getHealth: function() { return window.LawAIApp.RuntimePermissionSystem.getHealth(); },
        getAuditTrail: function(limit) { return window.LawAIApp.RuntimePermissionSystem.getAuditTrail(limit); },
        getAccessHistory: function(limit) { return window.LawAIApp.RuntimePermissionSystem.getAccessHistory(limit); }
    };
}
