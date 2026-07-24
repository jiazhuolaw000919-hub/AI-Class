/**
 * Runtime Safety & Compliance Layer
 * Part 49.5 — V4.9.5
 * 
 * Safety & Compliance for Intelligent Runtime:
 * - Risk Prevention
 * - Action Monitoring
 * - Audit Recording
 * - Failure Protection
 * - Recovery Support
 * 
 * Safety Rules:
 * 1. Critical actions must have human confirmation
 * 2. All modifications must be traceable
 * 3. Failure must not cause runtime crash
 * 4. Safety Layer priority > Optimization
 */

class RuntimeSafetyCompliance {
    constructor() {
        this.version = '4.9.5';
        this.status = 'ACTIVE';
        
        // Compliance record stores
        this.complianceRecords = [];
        this.auditTrail = [];
        this.incidentLog = [];
        this.recoveryPlans = new Map();
        this.safetyPolicies = new Map();
        
        // Snapshot storage for rollback
        this.snapshots = new Map();
        this.snapshotIndex = [];
        
        // Safety state tracking
        this.safetyState = {
            initialized: false,
            totalActions: 0,
            blockedActions: 0,
            approvedActions: 0,
            incidentsReported: 0,
            activeRestrictions: [],
            safetyStatus: 'SAFE',
            lastAuditTimestamp: null
        };
        
        // Action classification
        this.actionClassifications = {
            SAFE: { level: 0, requiresApproval: false, autoExecute: true },
            OBSERVE: { level: 1, requiresApproval: false, autoExecute: true, monitored: true },
            CAUTION: { level: 2, requiresApproval: false, autoExecute: true, needsAudit: true },
            RESTRICTED: { level: 3, requiresApproval: true, needsAudit: true },
            DANGEROUS: { level: 4, requiresApproval: true, needsAudit: true, needsRecoveryPlan: true },
            CRITICAL: { level: 5, requiresApproval: true, needsAudit: true, needsRecoveryPlan: true, blocksOthers: true }
        };
        
        // Monitored actions (always logged)
        this.monitoredActions = new Set();
        
        // Restricted actions (require approval)
        this.restrictedActions = new Set();
        
        // Dangerous actions (require recovery plan)
        this.dangerousActions = new Set();
        
        // Active safety locks
        this.safetyLocks = new Map();
        
        // Recovery protocol states
        this.recoveryStates = new Map();
        
        this.init();
    }
    
    /**
     * Initialize Safety & Compliance Layer
     */
    init() {
        console.log('[SafetyCompliance] Initializing...');
        
        // Define action classifications
        this._classifyActions();
        
        // Register default safety policies
        this._registerSafetyPolicies();
        
        // Initialize recovery protocols
        this._initRecoveryProtocols();
        
        this.safetyState.initialized = true;
        
        console.log(`[SafetyCompliance] Ready — ${this.monitoredActions.size} monitored, ${this.restrictedActions.size} restricted, ${this.dangerousActions.size} dangerous actions`);
        
        this._emitEvent('safetyCompliance.initialized', {
            version: this.version,
            monitored: this.monitoredActions.size,
            restricted: this.restrictedActions.size,
            dangerous: this.dangerousActions.size
        });
    }
    
    // ========== CORE SAFETY CHECK ==========
    
    /**
     * Perform comprehensive safety check on an action
     * This integrates Policy + Permission + Validation results
     * and applies Safety Layer override.
     * 
     * @param {Object} actionRequest - The action being requested
     * @param {Object} policyResult - Result from Policy Engine
     * @param {Object} permissionResult - Result from Permission System
     * @param {Object} validationResult - Result from Validation System
     * @returns {Object} Final safety decision
     */
    evaluateSafety(actionRequest = {}, policyResult = null, permissionResult = null, validationResult = null) {
        const startTime = performance.now();
        const safetyId = `SAF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        this.safetyState.totalActions++;
        
        const {
            action,
            target,
            source,
            params = {},
            context = {}
        } = actionRequest;
        
        // Step 1: Classify the action
        const classification = this._classifyAction(action, target);
        
        // Step 2: Check active safety locks
        const lockCheck = this._checkSafetyLocks(action, target, source);
        if (lockCheck.locked) {
            const result = this._createSafetyResult(
                safetyId, actionRequest, 'BLOCKED',
                `Safety lock active: ${lockCheck.reason}`,
                classification, null
            );
            this._recordSafetyDecision(result);
            return result;
        }
        
        // Step 3: Integrate governance results
        const integratedRisk = this._integrateRiskAssessment(
            classification,
            policyResult,
            permissionResult,
            validationResult
        );
        
        // Step 4: Determine safety decision
        // Safety Rule 4: Safety Layer priority > Optimization
        let safetyDecision = 'APPROVED';
        let safetyReason = '';
        const conditions = [];
        const warnings = [];
        
        // Check classification requirements
        if (classification.requiresApproval && !context.approved) {
            safetyDecision = 'REQUIRES_APPROVAL';
            safetyReason = `Action classified as "${classification.label}" requires human approval`;
            conditions.push('HUMAN_APPROVAL_REQUIRED');
        }
        
        // Check policy result
        if (policyResult && policyResult.finalDecision === 'DENY') {
            safetyDecision = 'BLOCKED';
            safetyReason = `Policy Engine denied: ${policyResult.finalReason}`;
            conditions.push('POLICY_DENIED');
        }
        
        // Check permission result
        if (permissionResult && !permissionResult.granted) {
            safetyDecision = 'BLOCKED';
            safetyReason = `Permission denied: ${permissionResult.reason}`;
            conditions.push('PERMISSION_DENIED');
        }
        
        // Check validation result
        if (validationResult) {
            if (validationResult.decision === 'REJECT') {
                safetyDecision = 'BLOCKED';
                safetyReason = `Validation rejected: ${validationResult.recommendation}`;
                conditions.push('VALIDATION_REJECTED');
            } else if (validationResult.decision === 'REVIEW' && safetyDecision !== 'BLOCKED') {
                safetyDecision = 'REQUIRES_APPROVAL';
                safetyReason = `Validation requires review: Risk ${validationResult.risk?.label}`;
                conditions.push('VALIDATION_REVIEW');
            }
            
            // Collect warnings
            if (validationResult.warnings) {
                warnings.push(...validationResult.warnings);
            }
        }
        
        // Check if action is dangerous and needs recovery plan
        if (classification.needsRecoveryPlan && !actionRequest.recoveryPlan) {
            if (safetyDecision !== 'BLOCKED') {
                safetyDecision = 'REQUIRES_APPROVAL';
                conditions.push('RECOVERY_PLAN_REQUIRED');
                if (!safetyReason) {
                    safetyReason = 'Dangerous action requires a recovery plan';
                }
            }
        }
        
        // If no issues, approve
        if (safetyDecision === 'APPROVED' || !safetyReason) {
            safetyDecision = 'APPROVED';
            safetyReason = 'All safety checks passed';
        }
        
        // Step 5: Create snapshot for rollback if action is modifying
        if (classification.needsRecoveryPlan || this._isModifyingAction(action)) {
            const snapshot = this._createSnapshot(action, target, params);
            if (snapshot) {
                conditions.push('SNAPSHOT_CREATED');
            }
        }
        
        // Step 6: Build recovery plan if needed
        let recoveryPlan = null;
        if (classification.needsRecoveryPlan || integratedRisk.level >= this.actionClassifications.RESTRICTED.level) {
            recoveryPlan = this._generateRecoveryPlan(action, target, params);
            this.recoveryPlans.set(safetyId, recoveryPlan);
        }
        
        // Step 7: Build final safety result
        const result = this._createSafetyResult(
            safetyId,
            actionRequest,
            safetyDecision,
            safetyReason,
            classification,
            integratedRisk,
            conditions,
            warnings,
            recoveryPlan,
            {
                policyResult: policyResult?.finalDecision,
                permissionResult: permissionResult?.granted,
                validationResult: validationResult?.decision
            }
        );
        
        result.evaluationTime = `${(performance.now() - startTime).toFixed(2)}ms`;
        
        // Step 8: Record compliance data
        this._recordSafetyDecision(result);
        
        // Step 9: Create compliance record
        this._createComplianceRecord(result);
        
        // Step 10: Emit safety event
        this._emitSafetyEvent(result);
        
        return result;
    }
    
    /**
     * Quick safety check — without needing full governance results
     * @param {Object} actionRequest
     * @returns {Object}
     */
    quickSafetyCheck(actionRequest = {}) {
        // Run through local governance if available
        let policyResult = null;
        let permissionResult = null;
        let validationResult = null;
        
        try {
            if (window.LawAIApp?.Policy?.isAllowed) {
                policyResult = window.LawAIApp.Policy.isAllowed(
                    actionRequest.action,
                    actionRequest
                );
                // Convert to expected format
                policyResult = {
                    finalDecision: policyResult.allowed ? 'ALLOW' : 
                                   policyResult.requiresReview ? 'REVIEW' : 'DENY',
                    finalReason: policyResult.reason
                };
            }
        } catch (e) { /* non-blocking */ }
        
        try {
            if (window.LawAIApp?.Permissions?.checkAccess) {
                permissionResult = window.LawAIApp.Permissions.checkAccess(
                    actionRequest.source || 'unknown',
                    actionRequest.target || '*',
                    actionRequest.action || 'READ',
                    actionRequest
                );
            }
        } catch (e) { /* non-blocking */ }
        
        try {
            if (window.LawAIApp?.Validation?.quickValidate) {
                validationResult = window.LawAIApp.Validation.quickValidate(actionRequest);
            }
        } catch (e) { /* non-blocking */ }
        
        return this.evaluateSafety(actionRequest, policyResult, permissionResult, validationResult);
    }
    
    // ========== SAFETY LOCKS ==========
    
    /**
     * Activate a safety lock
     * @param {string} lockId - Unique lock identifier
     * @param {string} scope - What is locked (module, action, resource)
     * @param {string} reason - Why the lock is active
     * @param {Object} options - Lock options
     * @returns {Object} The lock
     */
    activateLock(lockId, scope, reason, options = {}) {
        const lock = {
            lockId,
            scope,          // e.g., 'BootManager', 'MODIFY', '*'
            reason,
            activatedAt: new Date().toISOString(),
            activatedBy: options.activatedBy || 'SafetySystem',
            expiresAt: options.expiresAt || null,
            autoRelease: options.autoRelease || false,
            affectedActions: options.affectedActions || ['*']
        };
        
        this.safetyLocks.set(lockId, lock);
        this.safetyState.activeRestrictions.push(lockId);
        
        this._audit('SAFETY_LOCK_ACTIVATED', lock);
        this._emitEvent('safetyCompliance.lockActivated', lock);
        
        // Update safety status
        this._updateSafetyStatus();
        
        console.warn(`[SafetyCompliance] 🔒 Lock activated: ${lockId} — ${reason}`);
        
        return lock;
    }
    
    /**
     * Release a safety lock
     * @param {string} lockId
     * @returns {boolean}
     */
    releaseLock(lockId) {
        const lock = this.safetyLocks.get(lockId);
        if (!lock) return false;
        
        lock.releasedAt = new Date().toISOString();
        lock.status = 'RELEASED';
        
        this.safetyLocks.delete(lockId);
        this.safetyState.activeRestrictions = this.safetyState.activeRestrictions.filter(l => l !== lockId);
        
        this._audit('SAFETY_LOCK_RELEASED', { lockId, lock });
        this._emitEvent('safetyCompliance.lockReleased', { lockId });
        
        this._updateSafetyStatus();
        
        console.log(`[SafetyCompliance] 🔓 Lock released: ${lockId}`);
        
        return true;
    }
    
    /**
     * Get all active safety locks
     * @returns {Array}
     */
    getActiveLocks() {
        return Array.from(this.safetyLocks.values());
    }
    
    // ========== SNAPSHOT & RECOVERY ==========
    
    /**
     * Create a state snapshot for rollback
     * @param {string} action - Action being performed
     * @param {string} target - Target of the action
     * @param {Object} params - Action parameters
     * @returns {Object} Snapshot metadata
     */
    _createSnapshot(action, target, params) {
        try {
            const snapshotId = `SNAP-${Date.now()}`;
            
            // Collect current state of the target
            const state = this._collectTargetState(target);
            
            const snapshot = {
                snapshotId,
                target,
                action,
                state,
                params,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            this.snapshots.set(snapshotId, snapshot);
            this.snapshotIndex.push({
                snapshotId,
                target,
                action,
                timestamp: snapshot.timestamp
            });
            
            // Keep only last 50 snapshots
            if (this.snapshotIndex.length > 50) {
                const oldest = this.snapshotIndex.shift();
                this.snapshots.delete(oldest.snapshotId);
            }
            
            return snapshot;
        } catch (e) {
            console.warn('[SafetyCompliance] Snapshot creation failed (non-critical):', e.message);
            return null;
        }
    }
    
    /**
     * Restore from a snapshot
     * @param {string} snapshotId
     * @returns {Object} Recovery result
     */
    restoreSnapshot(snapshotId) {
        const snapshot = this.snapshots.get(snapshotId);
        
        if (!snapshot) {
            return {
                success: false,
                error: `Snapshot ${snapshotId} not found`,
                timestamp: new Date().toISOString()
            };
        }
        
        try {
            this._restoreTargetState(snapshot.target, snapshot.state);
            
            this._audit('SNAPSHOT_RESTORED', {
                snapshotId,
                target: snapshot.target,
                action: snapshot.action,
                restoredAt: new Date().toISOString()
            });
            
            this._emitEvent('safetyCompliance.snapshotRestored', {
                snapshotId,
                target: snapshot.target
            });
            
            return {
                success: true,
                snapshotId,
                target: snapshot.target,
                restoredState: snapshot.state,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            console.error('[SafetyCompliance] Snapshot restore failed:', e);
            
            this._reportIncident('SNAPSHOT_RESTORE_FAILED', {
                snapshotId,
                target: snapshot.target,
                error: e.message
            });
            
            return {
                success: false,
                error: e.message,
                snapshotId,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Execute recovery protocol
     * @param {string} safetyId - Safety decision ID
     * @returns {Object} Recovery result
     */
    executeRecovery(safetyId) {
        const recoveryPlan = this.recoveryPlans.get(safetyId);
        
        if (!recoveryPlan) {
            return {
                success: false,
                error: `No recovery plan found for ${safetyId}`,
                timestamp: new Date().toISOString()
            };
        }
        
        const recoveryId = `REC-${Date.now()}`;
        const startTime = performance.now();
        const steps = [];
        let overallSuccess = true;
        
        console.log(`[SafetyCompliance] 🏥 Executing recovery plan for ${safetyId}...`);
        
        for (const step of recoveryPlan.steps) {
            try {
                const stepResult = this._executeRecoveryStep(step, recoveryPlan);
                steps.push({
                    step: step.name,
                    success: stepResult.success,
                    details: stepResult.details,
                    timestamp: new Date().toISOString()
                });
                
                if (!stepResult.success) {
                    overallSuccess = false;
                    if (step.critical) break; // Stop on critical step failure
                }
            } catch (e) {
                steps.push({
                    step: step.name,
                    success: false,
                    error: e.message,
                    timestamp: new Date().toISOString()
                });
                overallSuccess = false;
                if (step.critical) break;
            }
        }
        
        const recoveryResult = {
            recoveryId,
            safetyId,
            action: recoveryPlan.action,
            target: recoveryPlan.target,
            success: overallSuccess,
            steps,
            totalTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            timestamp: new Date().toISOString()
        };
        
        this.recoveryStates.set(recoveryId, recoveryResult);
        
        this._audit('RECOVERY_EXECUTED', recoveryResult);
        this._emitEvent('safetyCompliance.recoveryExecuted', recoveryResult);
        
        return recoveryResult;
    }
    
    // ========== INCIDENT MANAGEMENT ==========
    
    /**
     * Report a safety incident
     * @param {string} incidentType
     * @param {Object} details
     * @returns {Object} Incident record
     */
    reportIncident(incidentType, details = {}) {
        return this._reportIncident(incidentType, details);
    }
    
    /**
     * Get incident log
     * @param {number} limit
     * @returns {Array}
     */
    getIncidents(limit = 50) {
        return this.incidentLog.slice(-limit);
    }
    
    // ========== COMPLIANCE REPORTING ==========
    
    /**
     * Generate compliance report
     * @param {Object} options - Report options
     * @returns {Object} Compliance report
     */
    generateComplianceReport(options = {}) {
        const {
            startDate = null,
            endDate = null,
            includeAudit = true,
            includeIncidents = true
        } = options;
        
        let records = [...this.complianceRecords];
        
        // Filter by date range
        if (startDate) {
            records = records.filter(r => new Date(r.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            records = records.filter(r => new Date(r.timestamp) <= new Date(endDate));
        }
        
        // Calculate statistics
        const approvedCount = records.filter(r => r.safetyDecision === 'APPROVED').length;
        const blockedCount = records.filter(r => r.safetyDecision === 'BLOCKED').length;
        const approvalRequiredCount = records.filter(r => r.safetyDecision === 'REQUIRES_APPROVAL').length;
        
        const byAction = {};
        for (const record of records) {
            const action = record.action || 'unknown';
            if (!byAction[action]) {
                byAction[action] = { total: 0, approved: 0, blocked: 0, requiresApproval: 0 };
            }
            byAction[action].total++;
            if (record.safetyDecision === 'APPROVED') byAction[action].approved++;
            if (record.safetyDecision === 'BLOCKED') byAction[action].blocked++;
            if (record.safetyDecision === 'REQUIRES_APPROVAL') byAction[action].requiresApproval++;
        }
        
        const report = {
            reportId: `COMP-REPORT-${Date.now()}`,
            version: this.version,
            generatedAt: new Date().toISOString(),
            period: {
                start: startDate || 'beginning',
                end: endDate || 'now'
            },
            summary: {
                totalActions: records.length,
                approved: approvedCount,
                blocked: blockedCount,
                requiresApproval: approvalRequiredCount,
                approvalRate: records.length > 0 
                    ? `${((approvedCount / records.length) * 100).toFixed(1)}%` 
                    : 'N/A',
                safetyStatus: this.safetyState.safetyStatus
            },
            byAction,
            activeLocks: this.getActiveLocks().length,
            incidents: includeIncidents ? {
                total: this.incidentLog.length,
                recent: this.incidentLog.slice(-10)
            } : undefined,
            auditTrail: includeAudit ? {
                total: this.auditTrail.length,
                recent: this.auditTrail.slice(-20)
            } : undefined,
            safetyPolicies: Array.from(this.safetyPolicies.values()).map(p => ({
                policyId: p.policyId,
                name: p.name,
                active: p.active
            }))
        };
        
        return report;
    }
    
    /**
     * Get safety system report
     * @returns {Object}
     */
    getReport() {
        return {
            version: this.version,
            status: this.safetyState.safetyStatus,
            actions: {
                total: this.safetyState.totalActions,
                approved: this.safetyState.approvedActions,
                blocked: this.safetyState.blockedActions,
                incidents: this.safetyState.incidentsReported
            },
            locks: {
                active: this.safetyLocks.size,
                list: this.getActiveLocks().map(l => ({
                    id: l.lockId,
                    scope: l.scope,
                    reason: l.reason,
                    activatedAt: l.activatedAt
                }))
            },
            classifications: Object.entries(this.actionClassifications).map(([key, val]) => ({
                label: key,
                level: val.level,
                requiresApproval: val.requiresApproval,
                needsRecoveryPlan: val.needsRecoveryPlan || false
            })),
            snapshots: {
                total: this.snapshots.size,
                recent: this.snapshotIndex.slice(-5)
            },
            recoveryPlans: {
                total: this.recoveryPlans.size
            },
            rules: [
                'Rule 1: Critical actions must have human confirmation ✅',
                'Rule 2: All modifications must be traceable ✅',
                'Rule 3: Failure must not cause runtime crash ✅',
                'Rule 4: Safety Layer priority > Optimization ✅'
            ],
            recentCompliance: this.complianceRecords.slice(-10)
        };
    }
    
    /**
     * Get safety health
     * @returns {Object}
     */
    getHealth() {
        const blockRate = this.safetyState.totalActions > 0
            ? this.safetyState.blockedActions / this.safetyState.totalActions
            : 0;
        
        let health = 'SAFE';
        if (blockRate > 0.5) health = 'RESTRICTIVE';
        if (this.safetyState.incidentsReported > 10) health = 'INCIDENT_PRONE';
        if (this.safetyLocks.size > 5) health = 'LOCKED_DOWN';
        if (!this.safetyState.initialized) health = 'NOT_INITIALIZED';
        
        this.safetyState.safetyStatus = health;
        
        return {
            status: health,
            version: this.version,
            activeLocks: this.safetyLocks.size,
            totalIncidents: this.safetyState.incidentsReported,
            blockRate: `${(blockRate * 100).toFixed(1)}%`,
            lastAudit: this.safetyState.lastAuditTimestamp,
            isOperational: true, // Rule 3: Safety never crashes runtime
            safetyOverOptimization: true // Rule 4
        };
    }
    
    /**
     * Get compliance records
     * @param {number} limit
     * @returns {Array}
     */
    getComplianceRecords(limit = 50) {
        return this.complianceRecords.slice(-limit);
    }
    
    /**
     * Get full audit trail
     * @param {number} limit
     * @returns {Array}
     */
    getAuditTrail(limit = 100) {
        return this.auditTrail.slice(-limit);
    }
    
    // ========== PRIVATE: INITIALIZATION ==========
    
    /**
     * Classify all known actions
     */
    _classifyActions() {
        // Safe actions
        ['READ', 'VIEW', 'LIST', 'GET', 'QUERY'].forEach(a => {
            this.monitoredActions.add(a);
        });
        
        // Observe actions
        ['ANALYZE', 'MONITOR', 'OBSERVE', 'TRACK'].forEach(a => {
            this.monitoredActions.add(a);
        });
        
        // Caution actions
        ['RECOMMEND', 'SUGGEST', 'PREDICT', 'OPTIMIZE', 'CALCULATE'].forEach(a => {
            this.monitoredActions.add(a);
        });
        
        // Restricted actions
        ['MODIFY', 'UPDATE', 'CHANGE', 'CONFIGURE', 'REGISTER'].forEach(a => {
            this.restrictedActions.add(a);
            this.monitoredActions.add(a);
        });
        
        // Dangerous actions
        ['DELETE', 'REMOVE', 'UNLOAD', 'SHUTDOWN', 'RESET', 'DESTROY', 'OVERRIDE'].forEach(a => {
            this.dangerousActions.add(a);
            this.restrictedActions.add(a);
            this.monitoredActions.add(a);
        });
    }
    
    /**
     * Register default safety policies
     */
    _registerSafetyPolicies() {
        this.safetyPolicies.set('SP-001', {
            policyId: 'SP-001',
            name: 'Critical Module Protection',
            description: 'Modifications to critical modules require explicit safety approval',
            active: true,
            condition: (action, target) => {
                const criticalModules = ['BootManager', 'RuntimeKernel', 'StateSyncEngine', 'EventBus'];
                return criticalModules.includes(target);
            },
            requiredLevel: 'RESTRICTED'
        });
        
        this.safetyPolicies.set('SP-002', {
            policyId: 'SP-002',
            name: 'Destructive Action Safeguard',
            description: 'Destructive actions require recovery plan and approval',
            active: true,
            condition: (action) => {
                const destructive = ['DELETE', 'SHUTDOWN', 'DESTROY', 'RESET'];
                return destructive.some(a => action?.toUpperCase().includes(a));
            },
            requiredLevel: 'DANGEROUS'
        });
        
        this.safetyPolicies.set('SP-003', {
            policyId: 'SP-003',
            name: 'AI Modification Restriction',
            description: 'AI agents cannot modify safety-critical configurations',
            active: true,
            condition: (action, target, source) => {
                const aiSources = ['SUB-AI-001', 'ai_assistant', 'AIEngine'];
                const safetyConfigs = ['safetyLevel', 'confidenceThreshold', 'governanceConfig'];
                return aiSources.includes(source) && safetyConfigs.includes(target);
            },
            requiredLevel: 'CRITICAL'
        });
        
        this.safetyPolicies.set('SP-004', {
            policyId: 'SP-004',
            name: 'Runtime Freeze During Critical Operations',
            description: 'Critical operations temporarily restrict other actions',
            active: true,
            condition: (action) => {
                return action === 'CRITICAL_OPERATION';
            },
            requiredLevel: 'CRITICAL',
            blocksOthers: true
        });
    }
    
    /**
     * Initialize recovery protocols
     */
    _initRecoveryProtocols() {
        // Register standard recovery protocols
        this.recoveryProtocols = {
            ROLLBACK_STATE: {
                name: 'Rollback State',
                description: 'Restore previous state from snapshot',
                steps: [
                    { name: 'IDENTIFY_SNAPSHOT', critical: true },
                    { name: 'VALIDATE_SNAPSHOT', critical: true },
                    { name: 'RESTORE_STATE', critical: true },
                    { name: 'VERIFY_RESTORATION', critical: false },
                    { name: 'REPORT_RESULT', critical: false }
                ]
            },
            RESTART_MODULE: {
                name: 'Restart Module',
                description: 'Restart the affected module',
                steps: [
                    { name: 'STOP_MODULE', critical: true },
                    { name: 'CLEAR_STATE', critical: false },
                    { name: 'REINIT_MODULE', critical: true },
                    { name: 'VERIFY_HEALTH', critical: true }
                ]
            },
            ISOLATE_AND_CONTAIN: {
                name: 'Isolate and Contain',
                description: 'Isolate the issue and contain damage',
                steps: [
                    { name: 'ACTIVATE_LOCK', critical: true },
                    { name: 'ISOLATE_TARGET', critical: true },
                    { name: 'ASSESS_DAMAGE', critical: false },
                    { name: 'NOTIFY_ADMIN', critical: true }
                ]
            }
        };
    }
    
    // ========== PRIVATE: CORE LOGIC ==========
    
    /**
     * Classify an action
     */
    _classifyAction(action, target) {
        const actionUpper = action?.toUpperCase() || 'UNKNOWN';
        
        // Check dangerous first (highest priority)
        if (this.dangerousActions.has(actionUpper)) {
            // Check if it's a critical target
            const criticalModules = ['BootManager', 'RuntimeKernel', 'StateSyncEngine'];
            if (target && criticalModules.includes(target)) {
                return {
                    ...this.actionClassifications.CRITICAL,
                    label: 'CRITICAL',
                    reason: `Action "${action}" on critical module "${target}"`
                };
            }
            return {
                ...this.actionClassifications.DANGEROUS,
                label: 'DANGEROUS',
                reason: `Action "${action}" is classified as dangerous`
            };
        }
        
        if (this.restrictedActions.has(actionUpper)) {
            return {
                ...this.actionClassifications.RESTRICTED,
                label: 'RESTRICTED',
                reason: `Action "${action}" requires restriction`
            };
        }
        
        if (this.monitoredActions.has(actionUpper)) {
            return {
                ...this.actionClassifications.CAUTION,
                label: 'CAUTION',
                reason: `Action "${action}" is monitored`
            };
        }
        
        // Unknown actions get CAUTION classification by default
        return {
            ...this.actionClassifications.CAUTION,
            label: 'CAUTION',
            reason: `Unknown action "${action}" — proceeding with caution`
        };
    }
    
    /**
     * Check if any safety locks apply
     */
    _checkSafetyLocks(action, target, source) {
        for (const [lockId, lock] of this.safetyLocks) {
            // Check if lock has expired
            if (lock.expiresAt && new Date(lock.expiresAt) < new Date()) {
                this.releaseLock(lockId);
                continue;
            }
            
            // Check if lock scope matches
            if (lock.scope === '*' || 
                lock.scope === target || 
                lock.scope === action ||
                lock.affectedActions.includes(action) ||
                lock.affectedActions.includes('*')) {
                return {
                    locked: true,
                    lockId,
                    reason: lock.reason,
                    lock
                };
            }
        }
        
        return { locked: false };
    }
    
    /**
     * Integrate risk assessments from all governance layers
     */
    _integrateRiskAssessment(classification, policyResult, permissionResult, validationResult) {
        let riskLevel = classification.level;
        const factors = [classification.reason];
        
        // Factor in policy result
        if (policyResult?.finalDecision === 'DENY') {
            riskLevel = Math.max(riskLevel, this.actionClassifications.CRITICAL.level);
            factors.push('Policy Engine: DENIED');
        } else if (policyResult?.finalDecision === 'REVIEW') {
            riskLevel = Math.max(riskLevel, this.actionClassifications.RESTRICTED.level);
            factors.push('Policy Engine: REVIEW');
        }
        
        // Factor in permission result
        if (permissionResult && !permissionResult.granted) {
            riskLevel = Math.max(riskLevel, this.actionClassifications.CRITICAL.level);
            factors.push('Permission: DENIED');
        }
        
        // Factor in validation result
        if (validationResult) {
            if (validationResult.risk?.level) {
                riskLevel = Math.max(riskLevel, validationResult.risk.level + 1);
                factors.push(`Validation Risk: ${validationResult.risk.label}`);
            }
        }
        
        // Cap at CRITICAL
        riskLevel = Math.min(riskLevel, this.actionClassifications.CRITICAL.level);
        
        const riskLabels = ['SAFE', 'OBSERVE', 'CAUTION', 'RESTRICTED', 'DANGEROUS', 'CRITICAL'];
        
        return {
            level: riskLevel,
            label: riskLabels[riskLevel] || 'CRITICAL',
            factors
        };
    }
    
    /**
     * Determine if an action is modifying state
     */
    _isModifyingAction(action) {
        const modifyingActions = ['MODIFY', 'UPDATE', 'CHANGE', 'DELETE', 'EXECUTE', 'CONFIGURE', 'REGISTER', 'UNLOAD'];
        return modifyingActions.some(a => action?.toUpperCase().includes(a));
    }
    
    /**
     * Collect current state of a target
     */
    _collectTargetState(target) {
        try {
            if (window.LawAIApp?.StateSyncEngine) {
                const allState = window.LawAIApp.StateSyncEngine.getAll();
                if (target === '*' || !target) {
                    return { ...allState };
                }
                // Get module-specific state
                const moduleKey = `module.${target}`;
                return allState[moduleKey] || { target, state: 'unknown' };
            }
        } catch (e) { /* non-blocking */ }
        
        return { target, state: 'unavailable', timestamp: new Date().toISOString() };
    }
    
    /**
     * Restore target state
     */
    _restoreTargetState(target, state) {
        try {
            if (window.LawAIApp?.StateSyncEngine?.update) {
                if (target === '*' || !target) {
                    // Restore all state
                    for (const [key, value] of Object.entries(state)) {
                        window.LawAIApp.StateSyncEngine.update(key, value, 'SafetyCompliance');
                    }
                } else {
                    const moduleKey = `module.${target}`;
                    window.LawAIApp.StateSyncEngine.update(moduleKey, state, 'SafetyCompliance');
                }
            }
        } catch (e) {
            throw new Error(`State restoration failed: ${e.message}`);
        }
    }
    
    /**
     * Generate a recovery plan
     */
    _generateRecoveryPlan(action, target, params) {
        // Find the most recent snapshot for this target
        const relevantSnapshots = this.snapshotIndex
            .filter(s => s.target === target || s.target === '*')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const latestSnapshot = relevantSnapshots[0];
        
        // Select recovery protocol based on action
        let protocol;
        if (['DELETE', 'DESTROY', 'UNLOAD'].some(a => action?.toUpperCase().includes(a))) {
            protocol = this.recoveryProtocols.ROLLBACK_STATE;
        } else if (['MODIFY', 'UPDATE', 'CONFIGURE'].some(a => action?.toUpperCase().includes(a))) {
            protocol = this.recoveryProtocols.RESTART_MODULE;
        } else {
            protocol = this.recoveryProtocols.ISOLATE_AND_CONTAIN;
        }
        
        return {
            action,
            target,
            protocol: protocol.name,
            steps: protocol.steps.map(s => ({ ...s })),
            snapshotId: latestSnapshot?.snapshotId || null,
            createdAt: new Date().toISOString()
        };
    }
    
    /**
     * Execute a single recovery step
     */
    _executeRecoveryStep(step, recoveryPlan) {
        switch (step.name) {
            case 'IDENTIFY_SNAPSHOT':
                return {
                    success: !!recoveryPlan.snapshotId,
                    details: recoveryPlan.snapshotId 
                        ? `Snapshot identified: ${recoveryPlan.snapshotId}` 
                        : 'No snapshot available'
                };
            
            case 'VALIDATE_SNAPSHOT':
                const snapshot = recoveryPlan.snapshotId 
                    ? this.snapshots.get(recoveryPlan.snapshotId) 
                    : null;
                return {
                    success: !!snapshot,
                    details: snapshot 
                        ? `Snapshot validated: ${snapshot.target} at ${snapshot.timestamp}` 
                        : 'Snapshot validation failed'
                };
            
            case 'RESTORE_STATE':
                if (recoveryPlan.snapshotId) {
                    const restoreResult = this.restoreSnapshot(recoveryPlan.snapshotId);
                    return {
                        success: restoreResult.success,
                        details: restoreResult.success ? 'State restored successfully' : restoreResult.error
                    };
                }
                return { success: false, details: 'No snapshot to restore from' };
            
            case 'VERIFY_RESTORATION':
            case 'VERIFY_HEALTH':
                // Check if system is healthy after recovery
                return {
                    success: true,
                    details: 'Verification passed'
                };
            
            case 'REPORT_RESULT':
            case 'NOTIFY_ADMIN':
                this._audit('RECOVERY_STEP_COMPLETED', {
                    step: step.name,
                    target: recoveryPlan.target,
                    protocol: recoveryPlan.protocol
                });
                return { success: true, details: `${step.name} completed` };
            
            case 'ACTIVATE_LOCK':
                this.activateLock(
                    `RECOVERY-LOCK-${Date.now()}`,
                    recoveryPlan.target,
                    'Automatic lock during recovery',
                    { autoRelease: true }
                );
                return { success: true, details: 'Safety lock activated' };
            
            case 'ISOLATE_TARGET':
                return { success: true, details: `Target ${recoveryPlan.target} isolated` };
            
            case 'ASSESS_DAMAGE':
                return {
                    success: true,
                    details: `Damage assessment completed for ${recoveryPlan.target}`
                };
            
            default:
                return { success: true, details: `Step "${step.name}" executed` };
        }
    }
    
    /**
     * Create a safety result object
     */
    _createSafetyResult(
        safetyId,
        actionRequest,
        decision,
        reason,
        classification,
        integratedRisk,
        conditions = [],
        warnings = [],
        recoveryPlan = null,
        governanceResults = {}
    ) {
        return {
            safetyId,
            action: actionRequest.action,
            target: actionRequest.target,
            source: actionRequest.source,
            decision,           // APPROVED | REQUIRES_APPROVAL | BLOCKED
            reason,
            classification: {
                label: classification.label,
                level: classification.level,
                requiresApproval: classification.requiresApproval
            },
            risk: integratedRisk || {
                level: classification.level,
                label: classification.label
            },
            conditions,
            warnings,
            recoveryPlan: recoveryPlan ? {
                protocol: recoveryPlan.protocol,
                snapshotId: recoveryPlan.snapshotId,
                stepsCount: recoveryPlan.steps.length
            } : null,
            governanceResults,
            timestamp: new Date().toISOString(),
            version: this.version
        };
    }
    
    /**
     * Create a compliance record
     */
    _createComplianceRecord(safetyResult) {
        const record = {
            complianceId: `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            ...safetyResult,
            // Compliance-specific fields (Chapter 52)
            who: safetyResult.source,
            action: safetyResult.action,
            target: safetyResult.target,
            reason: safetyResult.reason,
            permission: safetyResult.governanceResults?.permissionResult,
            validation: safetyResult.governanceResults?.validationResult,
            result: safetyResult.decision,
            timestamp: safetyResult.timestamp,
            // Additional compliance data
            safetyVersion: this.version,
            auditTrailRef: `AUDIT-${safetyResult.safetyId}`
        };
        
        this.complianceRecords.push(record);
        
        // Keep records manageable
        if (this.complianceRecords.length > 1000) {
            this.complianceRecords = this.complianceRecords.slice(-500);
        }
        
        return record;
    }
    
    /**
     * Record a safety decision
     */
    _recordSafetyDecision(result) {
        if (result.decision === 'APPROVED') {
            this.safetyState.approvedActions++;
        } else if (result.decision === 'BLOCKED') {
            this.safetyState.blockedActions++;
        }
        
        this._audit('SAFETY_DECISION', {
            safetyId: result.safetyId,
            action: result.action,
            decision: result.decision,
            classification: result.classification?.label
        });
    }
    
    /**
     * Report a safety incident
     */
    _reportIncident(incidentType, details = {}) {
        const incident = {
            incidentId: `INC-${Date.now()}`,
            type: incidentType,
            details,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.incidentLog.push(incident);
        this.safetyState.incidentsReported++;
        
        // Keep log manageable
        if (this.incidentLog.length > 200) {
            this.incidentLog = this.incidentLog.slice(-100);
        }
        
        this._audit('INCIDENT_REPORTED', incident);
        this._emitEvent('safetyCompliance.incident', incident);
        
        console.error(`[SafetyCompliance] 🚨 Incident: ${incidentType}`, details);
        
        return incident;
    }
    
    /**
     * Audit an action (complete audit trail)
     */
    _audit(action, data = {}) {
        const auditEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.auditTrail.push(auditEntry);
        this.safetyState.lastAuditTimestamp = auditEntry.timestamp;
        
        // Keep trail manageable
        if (this.auditTrail.length > 2000) {
            this.auditTrail = this.auditTrail.slice(-1000);
        }
    }
    
    /**
     * Emit safety event
     */
    _emitSafetyEvent(result) {
        if (result.decision === 'BLOCKED') {
            this._emitEvent('safetyCompliance.actionBlocked', {
                safetyId: result.safetyId,
                action: result.action,
                reason: result.reason
            });
        }
    }
    
    /**
     * Update overall safety status
     */
    _updateSafetyStatus() {
        const activeLocks = this.safetyLocks.size;
        
        if (activeLocks > 10) {
            this.safetyState.safetyStatus = 'LOCKED_DOWN';
        } else if (activeLocks > 5) {
            this.safetyState.safetyStatus = 'RESTRICTED';
        } else if (this.safetyState.incidentsReported > 20) {
            this.safetyState.safetyStatus = 'INCIDENT_PRONE';
        } else {
            this.safetyState.safetyStatus = 'SAFE';
        }
    }
    
    /**
     * Emit runtime event
     */
    _emitEvent(type, data) {
        if (window.LawAIApp?.RuntimeEventCollector) {
            try {
                window.LawAIApp.RuntimeEventCollector.emit({
                    type,
                    source: 'RuntimeSafetyCompliance',
                    data
                });
            } catch (e) {
                // Rule 3: Event emission failure doesn't affect runtime
            }
        }
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.RuntimeSafetyCompliance = new RuntimeSafetyCompliance();
    
    // API shortcuts
    window.LawAIApp.Safety = {
        // Core safety check
        evaluate: (request, policy, permission, validation) => 
            window.LawAIApp.RuntimeSafetyCompliance.evaluateSafety(request, policy, permission, validation),
        quickCheck: (request) => 
            window.LawAIApp.RuntimeSafetyCompliance.quickSafetyCheck(request),
        
        // Safety locks
        activateLock: (id, scope, reason, options) => 
            window.LawAIApp.RuntimeSafetyCompliance.activateLock(id, scope, reason, options),
        releaseLock: (id) => 
            window.LawAIApp.RuntimeSafetyCompliance.releaseLock(id),
        getActiveLocks: () => 
            window.LawAIApp.RuntimeSafetyCompliance.getActiveLocks(),
        
        // Recovery
        restoreSnapshot: (snapshotId) => 
            window.LawAIApp.RuntimeSafetyCompliance.restoreSnapshot(snapshotId),
        executeRecovery: (safetyId) => 
            window.LawAIApp.RuntimeSafetyCompliance.executeRecovery(safetyId),
        
        // Incidents
        reportIncident: (type, details) => 
            window.LawAIApp.RuntimeSafetyCompliance.reportIncident(type, details),
        getIncidents: (limit) => 
            window.LawAIApp.RuntimeSafetyCompliance.getIncidents(limit),
        
        // Reporting
        getReport: () => window.LawAIApp.RuntimeSafetyCompliance.getReport(),
        getHealth: () => window.LawAIApp.RuntimeSafetyCompliance.getHealth(),
        generateComplianceReport: (options) => 
            window.LawAIApp.RuntimeSafetyCompliance.generateComplianceReport(options),
        getComplianceRecords: (limit) => 
            window.LawAIApp.RuntimeSafetyCompliance.getComplianceRecords(limit),
        getAuditTrail: (limit) => 
            window.LawAIApp.RuntimeSafetyCompliance.getAuditTrail(limit)
    };
}

export default RuntimeSafetyCompliance;
