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
        
        // Permission stores
        this.permissions = new Map();
        this.subjectRegistry = new Map();  // Registered subjects/entities
        this.resourceRegistry = new Map(); // Registered resources
        
        // Audit trail
        this.auditLog = [];
        this.accessAttempts = [];
        
        // Permission subjects (pre-defined)
        this.subjectTypes = {
            DEVELOPER: 'developer',
            AI_ASSISTANT: 'ai_assistant',
            RUNTIME_MODULE: 'runtime_module',
            AUTOMATION_AGENT: 'automation_agent',
            SYSTEM: 'system',
            USER: 'user'
        };
        
        // Access actions (hierarchical — each level includes lower levels)
        this.accessActions = {
            READ: { level: 1, name: 'READ', description: 'Read data' },
            ANALYZE: { level: 2, name: 'ANALYZE', description: 'Analyze data' },
            RECOMMEND: { level: 3, name: 'RECOMMEND', description: 'Provide recommendations' },
            MODIFY: { level: 4, name: 'MODIFY', description: 'Modify state' },
            EXECUTE: { level: 5, name: 'EXECUTE', description: 'Execute operations' }
        };
        
        // Permission statuses
        this.statuses = {
            ACTIVE: 'active',
            REVOKED: 'revoked',
            SUSPENDED: 'suspended',
            EXPIRED: 'expired',
            PENDING: 'pending'
        };
        
        // Sensitive actions requiring additional verification
        this.sensitiveActions = [
            'MODIFY',
            'EXECUTE',
            'DELETE',
            'SHUTDOWN',
            'CONFIG_CHANGE'
        ];
        
        // System state
        this.systemState = {
            initialized: false,
            totalPermissions: 0,
            activePermissions: 0,
            totalSubjects: 0,
            totalResources: 0,
            accessAttempts: {
                granted: 0,
                denied: 0,
                total: 0
            },
            lastAccess: null,
            systemHealth: 'HEALTHY'
        };
        
        this.init();
    }
    
    /**
     * Initialize Permission System
     */
    init() {
        console.log('[PermissionSystem] Initializing...');
        
        // Register default subjects
        this._registerDefaultSubjects();
        
        // Register default resources
        this._registerDefaultResources();
        
        // Grant default permissions
        this._grantDefaultPermissions();
        
        this.systemState.initialized = true;
        this.systemState.totalPermissions = this.permissions.size;
        this.systemState.activePermissions = this._countActivePermissions();
        this.systemState.totalSubjects = this.subjectRegistry.size;
        this.systemState.totalResources = this.resourceRegistry.size;
        
        console.log(`[PermissionSystem] Ready — ${this.systemState.activePermissions} permissions, ${this.systemState.totalSubjects} subjects, ${this.systemState.totalResources} resources`);
        
        this._emitEvent('permissionSystem.initialized', {
            version: this.version,
            permissions: this.systemState.totalPermissions,
            subjects: this.systemState.totalSubjects,
            resources: this.systemState.totalResources
        });
    }
    
    // ========== SUBJECT MANAGEMENT ==========
    
    /**
     * Register a subject (entity that can request access)
     * @param {Object} subjectDefinition
     * @returns {Object} Registered subject
     */
    registerSubject({ subjectId, type, name, metadata = {} }) {
        // Validate type
        const validTypes = Object.values(this.subjectTypes);
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid subject type: ${type}. Must be one of: ${validTypes.join(', ')}`);
        }
        
        const subject = {
            subjectId: subjectId || `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            name,
            status: 'active',
            metadata: {
                registeredAt: new Date().toISOString(),
                registeredBy: 'system',
                ...metadata
            },
            stats: {
                accessAttempts: 0,
                granted: 0,
                denied: 0,
                lastAccess: null
            }
        };
        
        this.subjectRegistry.set(subject.subjectId, subject);
        this.systemState.totalSubjects = this.subjectRegistry.size;
        
        this._audit('SUBJECT_REGISTERED', { subjectId: subject.subjectId, type, name });
        
        return subject;
    }
    
    /**
     * Get subject by ID
     * @param {string} subjectId
     * @returns {Object|null}
     */
    getSubject(subjectId) {
        return this.subjectRegistry.get(subjectId) || null;
    }
    
    // ========== RESOURCE MANAGEMENT ==========
    
    /**
     * Register a resource (thing that can be accessed)
     * @param {Object} resourceDefinition
     * @returns {Object} Registered resource
     */
    registerResource({ resourceId, name, type, sensitivity = 'normal', metadata = {} }) {
        const resource = {
            resourceId: resourceId || `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            type,
            sensitivity, // 'normal' | 'sensitive' | 'critical'
            metadata: {
                registeredAt: new Date().toISOString(),
                ...metadata
            }
        };
        
        this.resourceRegistry.set(resource.resourceId, resource);
        this.systemState.totalResources = this.resourceRegistry.size;
        
        this._audit('RESOURCE_REGISTERED', { resourceId: resource.resourceId, name, type, sensitivity });
        
        return resource;
    }
    
    /**
     * Get resource by ID
     * @param {string} resourceId
     * @returns {Object|null}
     */
    getResource(resourceId) {
        return this.resourceRegistry.get(resourceId) || null;
    }
    
    // ========== PERMISSION MANAGEMENT ==========
    
    /**
     * Grant a permission to a subject
     * @param {Object} permissionDefinition
     * @returns {Object} Granted permission
     */
    grantPermission({
        permissionId,
        subjectId,
        resourceId,
        action,
        scope = ['*'],
        status = 'ACTIVE',
        constraints = {},
        metadata = {}
    }) {
        // Validate subject exists
        if (!this.subjectRegistry.has(subjectId)) {
            throw new Error(`Subject ${subjectId} not found. Register subject first.`);
        }
        
        // Validate resource exists (or use wildcard)
        if (resourceId !== '*' && !this.resourceRegistry.has(resourceId)) {
            throw new Error(`Resource ${resourceId} not found. Register resource first.`);
        }
        
        // Validate action
        const validActions = Object.keys(this.accessActions);
        if (!validActions.includes(action)) {
            throw new Error(`Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`);
        }
        
        const permission = {
            permissionId: permissionId || `PERM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subjectId,
            resourceId,
            action,
            actionLevel: this.accessActions[action].level,
            scope,          // Array of scopes this permission applies to
            status: this.statuses[status] || this.statuses.ACTIVE,
            constraints: {
                timeRestriction: constraints.timeRestriction || null,    // { start, end }
                rateLimit: constraints.rateLimit || null,               // { maxRequests, window }
                requireApproval: constraints.requireApproval || false,
                ...constraints
            },
            metadata: {
                grantedAt: new Date().toISOString(),
                grantedBy: metadata.grantedBy || 'system',
                reason: metadata.reason || 'Default permission grant',
                expiresAt: metadata.expiresAt || null,
                ...metadata
            },
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
            subjectId,
            resourceId,
            action,
            scope
        });
        
        return permission;
    }
    
    /**
     * Revoke a permission
     * @param {string} permissionId
     * @param {string} reason
     * @returns {Object} Revoked permission
     */
    revokePermission(permissionId, reason = 'Manual revocation') {
        const permission = this.permissions.get(permissionId);
        
        if (!permission) {
            throw new Error(`Permission ${permissionId} not found`);
        }
        
        const oldStatus = permission.status;
        permission.status = this.statuses.REVOKED;
        permission.metadata.revokedAt = new Date().toISOString();
        permission.metadata.revocationReason = reason;
        
        this.systemState.activePermissions = this._countActivePermissions();
        
        this._audit('PERMISSION_REVOKED', {
            permissionId,
            oldStatus,
            reason,
            subjectId: permission.subjectId,
            resourceId: permission.resourceId,
            action: permission.action
        });
        
        return permission;
    }
    
    /**
     * Get permissions for a subject
     * @param {string} subjectId
     * @returns {Array}
     */
    getSubjectPermissions(subjectId) {
        return Array.from(this.permissions.values())
            .filter(p => p.subjectId === subjectId);
    }
    
    /**
     * Get permissions for a resource
     * @param {string} resourceId
     * @returns {Array}
     */
    getResourcePermissions(resourceId) {
        return Array.from(this.permissions.values())
            .filter(p => p.resourceId === resourceId || p.resourceId === '*');
    }
    
    // ========== ACCESS CONTROL ==========
    
    /**
     * Check if a subject has permission to perform an action on a resource
     * This is the core access control method.
     * 
     * @param {string} subjectId - Who wants access
     * @param {string} resourceId - What they want to access
     * @param {string} action - What they want to do (READ/ANALYZE/RECOMMEND/MODIFY/EXECUTE)
     * @param {Object} context - Additional context for validation
     * @returns {Object} Access decision
     */
    checkAccess(subjectId, resourceId, action, context = {}) {
        const startTime = performance.now();
        const accessId = `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        this.systemState.lastAccess = new Date().toISOString();
        this.systemState.accessAttempts.total++;
        
        // Step 1: Validate subject exists
        const subject = this.subjectRegistry.get(subjectId);
        if (!subject) {
            const result = this._createAccessResult(accessId, subjectId, resourceId, action, false, 'Subject not found');
            this._recordAccessAttempt(result);
            return result;
        }
        
        // Update subject stats
        subject.stats.accessAttempts++;
        subject.stats.lastAccess = new Date().toISOString();
        
        // Step 2: Validate resource exists (allow wildcard)
        const resource = resourceId !== '*' ? this.resourceRegistry.get(resourceId) : null;
        if (resourceId !== '*' && !resource) {
            const result = this._createAccessResult(accessId, subjectId, resourceId, action, false, 'Resource not found');
            this._recordAccessAttempt(result);
            subject.stats.denied++;
            return result;
        }
        
        // Step 3: Get relevant permissions
        const relevantPermissions = this._findRelevantPermissions(subjectId, resourceId, action);
        
        if (relevantPermissions.length === 0) {
            // Rule 1: Least Privilege — no permission means no access
            const result = this._createAccessResult(
                accessId, subjectId, resourceId, action, false, 
                'No permission granted (Least Privilege principle)'
            );
            this._recordAccessAttempt(result);
            subject.stats.denied++;
            return result;
        }
        
        // Step 4: Check each permission
        for (const permission of relevantPermissions) {
            // Check if permission is active
            if (permission.status !== this.statuses.ACTIVE) {
                continue;
            }
            
            // Check if permission has expired
            if (permission.metadata.expiresAt && new Date(permission.metadata.expiresAt) < new Date()) {
                permission.status = this.statuses.EXPIRED;
                this._audit('PERMISSION_EXPIRED', { permissionId: permission.permissionId });
                continue;
            }
            
            // Check action level (hierarchical — higher level includes lower)
            const requiredLevel = this.accessActions[action].level;
            if (permission.actionLevel < requiredLevel) {
                continue; // Insufficient action level
            }
            
            // Check scope
            if (!this._scopeMatches(permission.scope, context.scope)) {
                continue;
            }
            
            // Check constraints
            if (!this._checkConstraints(permission, context)) {
                continue;
            }
            
            // Step 5: Sensitive action check (Rule 2)
            if (this._isSensitiveAction(action)) {
                const sensitiveCheck = this._validateSensitiveAction(subject, resource, action, context);
                if (!sensitiveCheck.passed) {
                    const result = this._createAccessResult(
                        accessId, subjectId, resourceId, action, false,
                        `Sensitive action verification failed: ${sensitiveCheck.reason}`,
                        { sensitiveCheck }
                    );
                    this._recordAccessAttempt(result);
                    subject.stats.denied++;
                    return result;
                }
            }
            
            // All checks passed — ACCESS GRANTED
            permission.stats.used++;
            permission.stats.lastUsed = new Date().toISOString();
            
            const result = this._createAccessResult(
                accessId, subjectId, resourceId, action, true,
                `Access granted via permission ${permission.permissionId} (${permission.action})`,
                { permissionId: permission.permissionId, actionLevel: permission.actionLevel }
            );
            
            result.evaluationTime = `${(performance.now() - startTime).toFixed(2)}ms`;
            
            this._recordAccessAttempt(result);
            subject.stats.granted++;
            
            this._audit('ACCESS_GRANTED', {
                accessId,
                subjectId,
                resourceId,
                action,
                permissionId: permission.permissionId,
                evaluationTime: result.evaluationTime
            });
            
            return result;
        }
        
        // No valid permission found
        const result = this._createAccessResult(
            accessId, subjectId, resourceId, action, false,
            'No valid permission found (expired, insufficient level, or constraint violation)'
        );
        this._recordAccessAttempt(result);
        subject.stats.denied++;
        return result;
    }
    
    /**
     * Convenience method: Check if subject can READ
     */
    canRead(subjectId, resourceId, context = {}) {
        return this.checkAccess(subjectId, resourceId, 'READ', context);
    }
    
    /**
     * Convenience method: Check if subject can MODIFY
     */
    canModify(subjectId, resourceId, context = {}) {
        return this.checkAccess(subjectId, resourceId, 'MODIFY', context);
    }
    
    /**
     * Convenience method: Check if subject can EXECUTE
     */
    canExecute(subjectId, resourceId, context = {}) {
        return this.checkAccess(subjectId, resourceId, 'EXECUTE', context);
    }
    
    /**
     * Get all permissions for a subject with a specific action level or higher
     * @param {string} subjectId
     * @param {string} minimumAction - Minimum action level required
     * @returns {Array}
     */
    getEffectivePermissions(subjectId, minimumAction = 'READ') {
        const minLevel = this.accessActions[minimumAction]?.level || 1;
        
        return Array.from(this.permissions.values())
            .filter(p => 
                p.subjectId === subjectId &&
                p.status === this.statuses.ACTIVE &&
                p.actionLevel >= minLevel
            );
    }
    
    // ========== REPORTING ==========
    
    /**
     * Get permission system report
     * @returns {Object}
     */
    getReport() {
        const permissionsByAction = {};
        for (const action of Object.keys(this.accessActions)) {
            permissionsByAction[action] = Array.from(this.permissions.values())
                .filter(p => p.action === action && p.status === this.statuses.ACTIVE)
                .length;
        }
        
        const permissionsBySubject = {};
        for (const [id, subject] of this.subjectRegistry) {
            permissionsBySubject[subject.name || id] = 
                this.getSubjectPermissions(id).filter(p => p.status === this.statuses.ACTIVE).length;
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
                    ? `${((this.systemState.accessAttempts.granted / this.systemState.accessAttempts.total) * 100).toFixed(1)}%`
                    : 'N/A'
            },
            securityRules: [
                'Rule 1: Default Least Privilege ✅',
                'Rule 2: Sensitive action verification ✅',
                'Rule 3: Permission change audit ✅',
                'Rule 4: Permission failure doesn\'t affect runtime ✅'
            ],
            recentAudit: this.auditLog.slice(-10)
        };
    }
    
    /**
     * Get permission system health
     * @returns {Object}
     */
    getHealth() {
        const denyRate = this.systemState.accessAttempts.total > 0
            ? this.systemState.accessAttempts.denied / this.systemState.accessAttempts.total
            : 0;
        
        let health = 'HEALTHY';
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
                ? `${(((this.systemState.accessAttempts.granted / this.systemState.accessAttempts.total) * 100)).toFixed(1)}%`
                : 'N/A',
            lastAccess: this.systemState.lastAccess,
            isOperational: true // Rule 4
        };
    }
    
    /**
     * Get audit trail
     * @param {number} limit
     * @returns {Array}
     */
    getAuditTrail(limit = 100) {
        return this.auditLog.slice(-limit);
    }
    
    /**
     * Get access attempt history
     * @param {number} limit
     * @returns {Array}
     */
    getAccessHistory(limit = 50) {
        return this.accessAttempts.slice(-limit);
    }
    
    // ========== PRIVATE METHODS ==========
    
    /**
     * Register default system subjects
     */
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
    
    /**
     * Register default system resources
     */
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
    
    /**
     * Grant default system permissions
     */
    _grantDefaultPermissions() {
        // Developer — Full access to everything
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
        
        // AI Assistant — Read access to metrics, events, knowledge
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
        
        // BootManager — Full access to boot resources
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
        
        // StateSyncEngine — Read/Write state
        this.grantPermission({
            subjectId: 'SUB-MOD-STATE',
            resourceId: 'RES-STATE',
            action: 'MODIFY',
            scope: ['state'],
            metadata: { reason: 'StateSyncEngine manages state' }
        });
        
        // Automation Agent — Limited execute permissions
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
    
    /**
     * Find permissions relevant to a request
     */
    _findRelevantPermissions(subjectId, resourceId, action) {
        const requiredLevel = this.accessActions[action].level;
        
        return Array.from(this.permissions.values())
            .filter(p => {
                // Match subject
                if (p.subjectId !== subjectId && p.subjectId !== '*') return false;
                
                // Match resource (exact, wildcard, or parent)
                if (p.resourceId !== resourceId && p.resourceId !== '*') return false;
                
                // Match action level (hierarchical)
                if (p.actionLevel < requiredLevel) return false;
                
                return true;
            })
            .sort((a, b) => {
                // Sort: exact matches first, then by action level (most permissive last)
                const aExact = a.resourceId === resourceId ? 0 : 1;
                const bExact = b.resourceId === resourceId ? 0 : 1;
                if (aExact !== bExact) return aExact - bExact;
                return b.actionLevel - a.actionLevel;
            });
    }
    
    /**
     * Check if scope matches
     */
    _scopeMatches(permissionScope, requestScope) {
        // Wildcard scope matches everything
        if (permissionScope.includes('*')) return true;
        
        // No request scope specified — allow
        if (!requestScope) return true;
        
        // Check if request scope is in permission scope
        const requestScopes = Array.isArray(requestScope) ? requestScope : [requestScope];
        return requestScopes.some(rs => permissionScope.includes(rs));
    }
    
    /**
     * Check permission constraints
     */
    _checkConstraints(permission, context) {
        const constraints = permission.constraints;
        
        // Time restriction
        if (constraints.timeRestriction) {
            const now = new Date();
            const start = new Date(constraints.timeRestriction.start);
            const end = new Date(constraints.timeRestriction.end);
            if (now < start || now > end) {
                return false;
            }
        }
        
        // Rate limit (simple implementation)
        if (constraints.rateLimit && permission.stats.used > 0) {
            const { maxRequests, window: windowMs } = constraints.rateLimit;
            const now = Date.now();
            const lastUsed = new Date(permission.stats.lastUsed).getTime();
            
            if (now - lastUsed < windowMs && permission.stats._recentCount >= maxRequests) {
                return false;
            }
            
            // Track recent usage
            if (!permission.stats._recentWindow) {
                permission.stats._recentWindow = now;
                permission.stats._recentCount = 0;
            }
            
            if (now - permission.stats._recentWindow > windowMs) {
                permission.stats._recentWindow = now;
                permission.stats._recentCount = 0;
            }
            
            permission.stats._recentCount = (permission.stats._recentCount || 0) + 1;
        }
        
        // Approval requirement
        if (constraints.requireApproval && !context.approved) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if an action is sensitive (Rule 2)
     */
    _isSensitiveAction(action) {
        return this.sensitiveActions.includes(action);
    }
    
    /**
     * Validate sensitive action (Rule 2)
     */
    _validateSensitiveAction(subject, resource, action, context) {
        // Additional verification for sensitive actions
        const checks = [];
        
        // Check 1: Is the resource critical?
        if (resource?.sensitivity === 'critical') {
            // Only Developer and System can perform sensitive actions on critical resources
            const allowedTypes = [this.subjectTypes.DEVELOPER, this.subjectTypes.SYSTEM];
            if (!allowedTypes.includes(subject.type)) {
                return {
                    passed: false,
                    reason: `Subject type "${subject.type}" cannot perform ${action} on critical resource "${resource.name}"`
                };
            }
            checks.push('critical_resource_check');
        }
        
        // Check 2: Context must include a valid reason for sensitive actions
        if (!context.reason && !context.approved) {
            return {
                passed: false,
                reason: `Sensitive action "${action}" requires a reason or approval in context`
            };
        }
        
        // Check 3: Automation agents need explicit approval
        if (subject.type === this.subjectTypes.AUTOMATION_AGENT && !context.approved) {
            return {
                passed: false,
                reason: 'Automation agents require explicit approval for sensitive actions'
            };
        }
        
        return {
            passed: true,
            checks
        };
    }
    
    /**
     * Create access result object
     */
    _createAccessResult(accessId, subjectId, resourceId, action, granted, reason, details = {}) {
        return {
            accessId,
            subjectId,
            resourceId,
            action,
            granted,
            reason,
            details,
            timestamp: new Date().toISOString(),
            systemVersion: this.version
        };
    }
    
    /**
     * Record an access attempt
     */
    _recordAccessAttempt(result) {
        this.accessAttempts.push(result);
        
        if (result.granted) {
            this.systemState.accessAttempts.granted++;
        } else {
            this.systemState.accessAttempts.denied++;
        }
        
        // Keep only last 500 attempts
        if (this.accessAttempts.length > 500) {
            this.accessAttempts = this.accessAttempts.slice(-250);
        }
    }
    
    /**
     * Audit an action (Rule 3)
     */
    _audit(action, data = {}) {
        const auditEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.auditLog.push(auditEntry);
        
        // Keep audit log manageable
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-500);
        }
        
        this._emitEvent('permissionSystem.audit', auditEntry);
    }
    
    /**
     * Get breakdown of subject types
     */
    _getSubjectTypeBreakdown() {
        const breakdown = {};
        
        for (const [id, subject] of this.subjectRegistry) {
            if (!breakdown[subject.type]) {
                breakdown[subject.type] = 0;
            }
            breakdown[subject.type]++;
        }
        
        return breakdown;
    }
    
    /**
     * Count active permissions
     */
    _countActivePermissions() {
        return Array.from(this.permissions.values())
            .filter(p => p.status === this.statuses.ACTIVE)
            .length;
    }
    
    /**
     * Emit runtime event
     */
    _emitEvent(type, data) {
        if (window.LawAIApp?.RuntimeEventCollector) {
            try {
                window.LawAIApp.RuntimeEventCollector.emit({
                    type,
                    source: 'RuntimePermissionSystem',
                    data
                });
            } catch (e) {
                // Rule 4: Event emission failure doesn't affect runtime
            }
        }
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.RuntimePermissionSystem = new RuntimePermissionSystem();
    
    // API shortcuts
    window.LawAIApp.Permissions = {
        // Subject management
        registerSubject: (def) => window.LawAIApp.RuntimePermissionSystem.registerSubject(def),
        getSubject: (id) => window.LawAIApp.RuntimePermissionSystem.getSubject(id),
        
        // Resource management
        registerResource: (def) => window.LawAIApp.RuntimePermissionSystem.registerResource(def),
        getResource: (id) => window.LawAIApp.RuntimePermissionSystem.getResource(id),
        
        // Permission management
        grant: (def) => window.LawAIApp.RuntimePermissionSystem.grantPermission(def),
        revoke: (id, reason) => window.LawAIApp.RuntimePermissionSystem.revokePermission(id, reason),
        getSubjectPermissions: (subjectId) => window.LawAIApp.RuntimePermissionSystem.getSubjectPermissions(subjectId),
        getEffectivePermissions: (subjectId, minAction) => window.LawAIApp.RuntimePermissionSystem.getEffectivePermissions(subjectId, minAction),
        
        // Access control
        checkAccess: (subjectId, resourceId, action, context) => 
            window.LawAIApp.RuntimePermissionSystem.checkAccess(subjectId, resourceId, action, context),
        canRead: (subjectId, resourceId, context) => 
            window.LawAIApp.RuntimePermissionSystem.canRead(subjectId, resourceId, context),
        canModify: (subjectId, resourceId, context) => 
            window.LawAIApp.RuntimePermissionSystem.canModify(subjectId, resourceId, context),
        canExecute: (subjectId, resourceId, context) => 
            window.LawAIApp.RuntimePermissionSystem.canExecute(subjectId, resourceId, context),
        
        // Reporting
        getReport: () => window.LawAIApp.RuntimePermissionSystem.getReport(),
        getHealth: () => window.LawAIApp.RuntimePermissionSystem.getHealth(),
        getAuditTrail: (limit) => window.LawAIApp.RuntimePermissionSystem.getAuditTrail(limit),
        getAccessHistory: (limit) => window.LawAIApp.RuntimePermissionSystem.getAccessHistory(limit)
    };
}

export default RuntimePermissionSystem;
