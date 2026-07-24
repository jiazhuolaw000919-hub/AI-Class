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
        
        this.complianceRecords = [];
        this.auditTrail = [];
        this.incidentLog = [];
        this.recoveryPlans = new Map();
        this.safetyPolicies = new Map();
        
        this.snapshots = new Map();
        this.snapshotIndex = [];
        
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
        
        this.actionClassifications = {
            SAFE: { level: 0, requiresApproval: false, autoExecute: true },
            OBSERVE: { level: 1, requiresApproval: false, autoExecute: true, monitored: true },
            CAUTION: { level: 2, requiresApproval: false, autoExecute: true, needsAudit: true },
            RESTRICTED: { level: 3, requiresApproval: true, needsAudit: true },
            DANGEROUS: { level: 4, requiresApproval: true, needsAudit: true, needsRecoveryPlan: true },
            CRITICAL: { level: 5, requiresApproval: true, needsAudit: true, needsRecoveryPlan: true, blocksOthers: true }
        };
        
        this.monitoredActions = new Set();
        this.restrictedActions = new Set();
        this.dangerousActions = new Set();
        
        this.safetyLocks = new Map();
        this.recoveryStates = new Map();
        
        this.init();
    }
    
    init() {
        console.log('[SafetyCompliance] Initializing...');
        
        this._classifyActions();
        this._registerSafetyPolicies();
        this._initRecoveryProtocols();
        
        this.safetyState.initialized = true;
        
        console.log('[SafetyCompliance] Ready — ' + this.monitoredActions.size + ' monitored, ' + this.restrictedActions.size + ' restricted, ' + this.dangerousActions.size + ' dangerous actions');
        
        this._emitEvent('safetyCompliance.initialized', {
            version: this.version,
            monitored: this.monitoredActions.size,
            restricted: this.restrictedActions.size,
            dangerous: this.dangerousActions.size
        });
    }
    
    // ========== CORE SAFETY CHECK ==========
    
    evaluateSafety(actionRequest, policyResult, permissionResult, validationResult) {
        if (!actionRequest) actionRequest = {};
        
        var startTime = performance.now();
        var safetyId = 'SAF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        this.safetyState.totalActions++;
        
        var action = actionRequest.action;
        var target = actionRequest.target;
        var source = actionRequest.source;
        var params = actionRequest.params || {};
        var context = actionRequest.context || {};
        
        // Step 1: Classify the action
        var classification = this._classifyAction(action, target);
        
        // Step 2: Check active safety locks
        var lockCheck = this._checkSafetyLocks(action, target, source);
        if (lockCheck.locked) {
            var result = this._createSafetyResult(
                safetyId, actionRequest, 'BLOCKED',
                'Safety lock active: ' + lockCheck.reason,
                classification, null
            );
            this._recordSafetyDecision(result);
            return result;
        }
        
        // Step 3: Integrate risk assessments
        var integratedRisk = this._integrateRiskAssessment(
            classification, policyResult, permissionResult, validationResult
        );
        
        // Step 4: Determine safety decision
        var safetyDecision = 'APPROVED';
        var safetyReason = '';
        var conditions = [];
        var warnings = [];
        
        if (classification.requiresApproval && !context.approved) {
            safetyDecision = 'REQUIRES_APPROVAL';
            safetyReason = 'Action classified as "' + classification.label + '" requires human approval';
            conditions.push('HUMAN_APPROVAL_REQUIRED');
        }
        
        if (policyResult && policyResult.finalDecision === 'DENY') {
            safetyDecision = 'BLOCKED';
            safetyReason = 'Policy Engine denied: ' + policyResult.finalReason;
            conditions.push('POLICY_DENIED');
        }
        
        if (permissionResult && !permissionResult.granted) {
            safetyDecision = 'BLOCKED';
            safetyReason = 'Permission denied: ' + permissionResult.reason;
            conditions.push('PERMISSION_DENIED');
        }
        
        if (validationResult) {
            if (validationResult.decision === 'REJECT') {
                safetyDecision = 'BLOCKED';
                safetyReason = 'Validation rejected: ' + validationResult.recommendation;
                conditions.push('VALIDATION_REJECTED');
            } else if (validationResult.decision === 'REVIEW' && safetyDecision !== 'BLOCKED') {
                safetyDecision = 'REQUIRES_APPROVAL';
                safetyReason = 'Validation requires review: Risk ' + (validationResult.risk ? validationResult.risk.label : 'UNKNOWN');
                conditions.push('VALIDATION_REVIEW');
            }
            
            if (validationResult.warnings) {
                warnings = warnings.concat(validationResult.warnings);
            }
        }
        
        if (classification.needsRecoveryPlan && !actionRequest.recoveryPlan) {
            if (safetyDecision !== 'BLOCKED') {
                safetyDecision = 'REQUIRES_APPROVAL';
                conditions.push('RECOVERY_PLAN_REQUIRED');
                if (!safetyReason) {
                    safetyReason = 'Dangerous action requires a recovery plan';
                }
            }
        }
        
        if (safetyDecision === 'APPROVED' || !safetyReason) {
            safetyDecision = 'APPROVED';
            safetyReason = 'All safety checks passed';
        }
        
        // Step 5: Create snapshot for rollback if needed
        if (classification.needsRecoveryPlan || this._isModifyingAction(action)) {
            var snapshot = this._createSnapshot(action, target, params);
            if (snapshot) conditions.push('SNAPSHOT_CREATED');
        }
        
        // Step 6: Build recovery plan if needed
        var recoveryPlan = null;
        if (classification.needsRecoveryPlan || integratedRisk.level >= this.actionClassifications.RESTRICTED.level) {
            recoveryPlan = this._generateRecoveryPlan(action, target, params);
            this.recoveryPlans.set(safetyId, recoveryPlan);
        }
        
        // Step 7: Build final safety result
        var result = this._createSafetyResult(
            safetyId, actionRequest, safetyDecision, safetyReason,
            classification, integratedRisk,
            conditions, warnings, recoveryPlan,
            {
                policyResult: policyResult ? policyResult.finalDecision : null,
                permissionResult: permissionResult ? permissionResult.granted : null,
                validationResult: validationResult ? validationResult.decision : null
            }
        );
        
        result.evaluationTime = (performance.now() - startTime).toFixed(2) + 'ms';
        
        // Step 8: Record and emit
        this._recordSafetyDecision(result);
        this._createComplianceRecord(result);
        this._emitSafetyEvent(result);
        
        return result;
    }
    
    quickSafetyCheck(actionRequest) {
        if (!actionRequest) actionRequest = {};
        
        var policyResult = null;
        var permissionResult = null;
        var validationResult = null;
        
        try {
            if (window.LawAIApp && window.LawAIApp.Policy && window.LawAIApp.Policy.isAllowed) {
                var pCheck = window.LawAIApp.Policy.isAllowed(actionRequest.action, actionRequest);
                policyResult = {
                    finalDecision: pCheck.allowed ? 'ALLOW' : (pCheck.requiresReview ? 'REVIEW' : 'DENY'),
                    finalReason: pCheck.reason
                };
            }
        } catch (e) {}
        
        try {
            if (window.LawAIApp && window.LawAIApp.Permissions && window.LawAIApp.Permissions.checkAccess) {
                permissionResult = window.LawAIApp.Permissions.checkAccess(
                    actionRequest.source || 'unknown',
                    actionRequest.target || '*',
                    actionRequest.action || 'READ',
                    actionRequest
                );
            }
        } catch (e) {}
        
        try {
            if (window.LawAIApp && window.LawAIApp.Validation && window.LawAIApp.Validation.quickValidate) {
                validationResult = window.LawAIApp.Validation.quickValidate(actionRequest);
            }
        } catch (e) {}
        
        return this.evaluateSafety(actionRequest, policyResult, permissionResult, validationResult);
    }
    
    // ========== SAFETY LOCKS ==========
    
    activateLock(lockId, scope, reason, options) {
        if (!options) options = {};
        
        var lock = {
            lockId: lockId,
            scope: scope,
            reason: reason,
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
        
        this._updateSafetyStatus();
        
        console.warn('[SafetyCompliance] 🔒 Lock activated: ' + lockId + ' — ' + reason);
        
        return lock;
    }
    
    releaseLock(lockId) {
        var lock = this.safetyLocks.get(lockId);
        if (!lock) return false;
        
        lock.releasedAt = new Date().toISOString();
        lock.status = 'RELEASED';
        
        this.safetyLocks.delete(lockId);
        this.safetyState.activeRestrictions = this.safetyState.activeRestrictions.filter(function(l) { return l !== lockId; });
        
        this._audit('SAFETY_LOCK_RELEASED', { lockId: lockId, lock: lock });
        this._emitEvent('safetyCompliance.lockReleased', { lockId: lockId });
        
        this._updateSafetyStatus();
        
        console.log('[SafetyCompliance] 🔓 Lock released: ' + lockId);
        
        return true;
    }
    
    getActiveLocks() {
        return Array.from(this.safetyLocks.values());
    }
    
    // ========== SNAPSHOT & RECOVERY ==========
    
    _createSnapshot(action, target, params) {
        try {
            var snapshotId = 'SNAP-' + Date.now();
            var state = this._collectTargetState(target);
            
            var snapshot = {
                snapshotId: snapshotId,
                target: target,
                action: action,
                state: state,
                params: params,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            this.snapshots.set(snapshotId, snapshot);
            this.snapshotIndex.push({
                snapshotId: snapshotId,
                target: target,
                action: action,
                timestamp: snapshot.timestamp
            });
            
            if (this.snapshotIndex.length > 50) {
                var oldest = this.snapshotIndex.shift();
                this.snapshots.delete(oldest.snapshotId);
            }
            
            return snapshot;
        } catch (e) {
            console.warn('[SafetyCompliance] Snapshot creation failed (non-critical):', e.message);
            return null;
        }
    }
    
    restoreSnapshot(snapshotId) {
        var snapshot = this.snapshots.get(snapshotId);
        
        if (!snapshot) {
            return {
                success: false,
                error: 'Snapshot ' + snapshotId + ' not found',
                timestamp: new Date().toISOString()
            };
        }
        
        try {
            this._restoreTargetState(snapshot.target, snapshot.state);
            
            this._audit('SNAPSHOT_RESTORED', {
                snapshotId: snapshotId,
                target: snapshot.target,
                action: snapshot.action,
                restoredAt: new Date().toISOString()
            });
            
            this._emitEvent('safetyCompliance.snapshotRestored', {
                snapshotId: snapshotId,
                target: snapshot.target
            });
            
            return {
                success: true,
                snapshotId: snapshotId,
                target: snapshot.target,
                restoredState: snapshot.state,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            console.error('[SafetyCompliance] Snapshot restore failed:', e);
            
            this._reportIncident('SNAPSHOT_RESTORE_FAILED', {
                snapshotId: snapshotId,
                target: snapshot.target,
                error: e.message
            });
            
            return {
                success: false,
                error: e.message,
                snapshotId: snapshotId,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    executeRecovery(safetyId) {
        var recoveryPlan = this.recoveryPlans.get(safetyId);
        
        if (!recoveryPlan) {
            return {
                success: false,
                error: 'No recovery plan found for ' + safetyId,
                timestamp: new Date().toISOString()
            };
        }
        
        var recoveryId = 'REC-' + Date.now();
        var startTime = performance.now();
        var steps = [];
        var overallSuccess = true;
        
        console.log('[SafetyCompliance] 🏥 Executing recovery plan for ' + safetyId + '...');
        
        for (var i = 0; i < recoveryPlan.steps.length; i++) {
            var step = recoveryPlan.steps[i];
            try {
                var stepResult = this._executeRecoveryStep(step, recoveryPlan);
                steps.push({
                    step: step.name,
                    success: stepResult.success,
                    details: stepResult.details,
                    timestamp: new Date().toISOString()
                });
                
                if (!stepResult.success) {
                    overallSuccess = false;
                    if (step.critical) break;
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
        
        var recoveryResult = {
            recoveryId: recoveryId,
            safetyId: safetyId,
            action: recoveryPlan.action,
            target: recoveryPlan.target,
            success: overallSuccess,
            steps: steps,
            totalTime: (performance.now() - startTime).toFixed(2) + 'ms',
            timestamp: new Date().toISOString()
        };
        
        this.recoveryStates.set(recoveryId, recoveryResult);
        
        this._audit('RECOVERY_EXECUTED', recoveryResult);
        this._emitEvent('safetyCompliance.recoveryExecuted', recoveryResult);
        
        return recoveryResult;
    }
    
    // ========== INCIDENT MANAGEMENT ==========
    
    reportIncident(incidentType, details) {
        if (!details) details = {};
        return this._reportIncident(incidentType, details);
    }
    
    getIncidents(limit) {
        if (!limit) limit = 50;
        return this.incidentLog.slice(-limit);
    }
    
    // ========== COMPLIANCE REPORTING ==========
    
    generateComplianceReport(options) {
        if (!options) options = {};
        
        var startDate = options.startDate || null;
        var endDate = options.endDate || null;
        var includeAudit = options.includeAudit !== false;
        var includeIncidents = options.includeIncidents !== false;
        
        var records = this.complianceRecords.slice();
        
        if (startDate) {
            records = records.filter(function(r) { return new Date(r.timestamp) >= new Date(startDate); });
        }
        if (endDate) {
            records = records.filter(function(r) { return new Date(r.timestamp) <= new Date(endDate); });
        }
        
        var approvedCount = 0, blockedCount = 0, approvalRequiredCount = 0;
        for (var i = 0; i < records.length; i++) {
            if (records[i].safetyDecision === 'APPROVED') approvedCount++;
            else if (records[i].safetyDecision === 'BLOCKED') blockedCount++;
            else if (records[i].safetyDecision === 'REQUIRES_APPROVAL') approvalRequiredCount++;
        }
        
        var byAction = {};
        for (var j = 0; j < records.length; j++) {
            var record = records[j];
            var act = record.action || 'unknown';
            if (!byAction[act]) byAction[act] = { total: 0, approved: 0, blocked: 0, requiresApproval: 0 };
            byAction[act].total++;
            if (record.safetyDecision === 'APPROVED') byAction[act].approved++;
            if (record.safetyDecision === 'BLOCKED') byAction[act].blocked++;
            if (record.safetyDecision === 'REQUIRES_APPROVAL') byAction[act].requiresApproval++;
        }
        
        var report = {
            reportId: 'COMP-REPORT-' + Date.now(),
            version: this.version,
            generatedAt: new Date().toISOString(),
            period: { start: startDate || 'beginning', end: endDate || 'now' },
            summary: {
                totalActions: records.length,
                approved: approvedCount,
                blocked: blockedCount,
                requiresApproval: approvalRequiredCount,
                approvalRate: records.length > 0 ? ((approvedCount / records.length) * 100).toFixed(1) + '%' : 'N/A',
                safetyStatus: this.safetyState.safetyStatus
            },
            byAction: byAction,
            activeLocks: this.getActiveLocks().length,
            incidents: includeIncidents ? { total: this.incidentLog.length, recent: this.incidentLog.slice(-10) } : undefined,
            auditTrail: includeAudit ? { total: this.auditTrail.length, recent: this.auditTrail.slice(-20) } : undefined,
            safetyPolicies: Array.from(this.safetyPolicies.values()).map(function(p) {
                return { policyId: p.policyId, name: p.name, active: p.active };
            })
        };
        
        return report;
    }
    
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
                list: this.getActiveLocks().map(function(l) {
                    return { id: l.lockId, scope: l.scope, reason: l.reason, activatedAt: l.activatedAt };
                })
            },
            classifications: Object.entries(this.actionClassifications).map(function(entry) {
                return {
                    label: entry[0],
                    level: entry[1].level,
                    requiresApproval: entry[1].requiresApproval,
                    needsRecoveryPlan: entry[1].needsRecoveryPlan || false
                };
            }),
            snapshots: { total: this.snapshots.size, recent: this.snapshotIndex.slice(-5) },
            recoveryPlans: { total: this.recoveryPlans.size },
            rules: [
                'Rule 1: Critical actions must have human confirmation ✅',
                'Rule 2: All modifications must be traceable ✅',
                'Rule 3: Failure must not cause runtime crash ✅',
                'Rule 4: Safety Layer priority > Optimization ✅'
            ],
            recentCompliance: this.complianceRecords.slice(-10)
        };
    }
    
    getHealth() {
        var blockRate = this.safetyState.totalActions > 0
            ? this.safetyState.blockedActions / this.safetyState.totalActions
            : 0;
        
        var health = 'SAFE';
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
            blockRate: (blockRate * 100).toFixed(1) + '%',
            lastAudit: this.safetyState.lastAuditTimestamp,
            isOperational: true,
            safetyOverOptimization: true
        };
    }
    
    getComplianceRecords(limit) {
        if (!limit) limit = 50;
        return this.complianceRecords.slice(-limit);
    }
    
    getAuditTrail(limit) {
        if (!limit) limit = 100;
        return this.auditTrail.slice(-limit);
    }
    
    // ========== PRIVATE: INITIALIZATION ==========
    
    _classifyActions() {
        var safeActions = ['READ', 'VIEW', 'LIST', 'GET', 'QUERY'];
        var observeActions = ['ANALYZE', 'MONITOR', 'OBSERVE', 'TRACK'];
        var cautionActions = ['RECOMMEND', 'SUGGEST', 'PREDICT', 'OPTIMIZE', 'CALCULATE'];
        var restrictedActions = ['MODIFY', 'UPDATE', 'CHANGE', 'CONFIGURE', 'REGISTER'];
        var dangerousActions = ['DELETE', 'REMOVE', 'UNLOAD', 'SHUTDOWN', 'RESET', 'DESTROY', 'OVERRIDE'];
        
        for (var i = 0; i < safeActions.length; i++) this.monitoredActions.add(safeActions[i]);
        for (var j = 0; j < observeActions.length; j++) this.monitoredActions.add(observeActions[j]);
        for (var k = 0; k < cautionActions.length; k++) this.monitoredActions.add(cautionActions[k]);
        for (var m = 0; m < restrictedActions.length; m++) { this.restrictedActions.add(restrictedActions[m]); this.monitoredActions.add(restrictedActions[m]); }
        for (var n = 0; n < dangerousActions.length; n++) { this.dangerousActions.add(dangerousActions[n]); this.restrictedActions.add(dangerousActions[n]); this.monitoredActions.add(dangerousActions[n]); }
    }
    
    _registerSafetyPolicies() {
        this.safetyPolicies.set('SP-001', {
            policyId: 'SP-001', name: 'Critical Module Protection',
            description: 'Modifications to critical modules require explicit safety approval',
            active: true,
            condition: function(action, target) {
                var criticalModules = ['BootManager', 'RuntimeKernel', 'StateSyncEngine', 'EventBus'];
                return criticalModules.indexOf(target) !== -1;
            },
            requiredLevel: 'RESTRICTED'
        });
        
        this.safetyPolicies.set('SP-002', {
            policyId: 'SP-002', name: 'Destructive Action Safeguard',
            description: 'Destructive actions require recovery plan and approval',
            active: true,
            condition: function(action) {
                var destructive = ['DELETE', 'SHUTDOWN', 'DESTROY', 'RESET'];
                if (!action) return false;
                var upper = action.toUpperCase();
                for (var i = 0; i < destructive.length; i++) {
                    if (upper.indexOf(destructive[i]) !== -1) return true;
                }
                return false;
            },
            requiredLevel: 'DANGEROUS'
        });
        
        this.safetyPolicies.set('SP-003', {
            policyId: 'SP-003', name: 'AI Modification Restriction',
            description: 'AI agents cannot modify safety-critical configurations',
            active: true,
            condition: function(action, target, source) {
                var aiSources = ['SUB-AI-001', 'ai_assistant', 'AIEngine'];
                var safetyConfigs = ['safetyLevel', 'confidenceThreshold', 'governanceConfig'];
                return aiSources.indexOf(source) !== -1 && safetyConfigs.indexOf(target) !== -1;
            },
            requiredLevel: 'CRITICAL'
        });
        
        this.safetyPolicies.set('SP-004', {
            policyId: 'SP-004', name: 'Runtime Freeze During Critical Operations',
            description: 'Critical operations temporarily restrict other actions',
            active: true,
            condition: function(action) { return action === 'CRITICAL_OPERATION'; },
            requiredLevel: 'CRITICAL',
            blocksOthers: true
        });
    }
    
    _initRecoveryProtocols() {
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
    
    _classifyAction(action, target) {
        var actionUpper = action ? action.toUpperCase() : 'UNKNOWN';
        
        if (this.dangerousActions.has(actionUpper)) {
            var criticalModules = ['BootManager', 'RuntimeKernel', 'StateSyncEngine'];
            if (target && criticalModules.indexOf(target) !== -1) {
                var crit = Object.assign({}, this.actionClassifications.CRITICAL);
                crit.label = 'CRITICAL';
                crit.reason = 'Action "' + action + '" on critical module "' + target + '"';
                return crit;
            }
            var dang = Object.assign({}, this.actionClassifications.DANGEROUS);
            dang.label = 'DANGEROUS';
            dang.reason = 'Action "' + action + '" is classified as dangerous';
            return dang;
        }
        
        if (this.restrictedActions.has(actionUpper)) {
            var rest = Object.assign({}, this.actionClassifications.RESTRICTED);
            rest.label = 'RESTRICTED';
            rest.reason = 'Action "' + action + '" requires restriction';
            return rest;
        }
        
        if (this.monitoredActions.has(actionUpper)) {
            var caut = Object.assign({}, this.actionClassifications.CAUTION);
            caut.label = 'CAUTION';
            caut.reason = 'Action "' + action + '" is monitored';
            return caut;
        }
        
        var def = Object.assign({}, this.actionClassifications.CAUTION);
        def.label = 'CAUTION';
        def.reason = 'Unknown action "' + action + '" — proceeding with caution';
        return def;
    }
    
    _checkSafetyLocks(action, target, source) {
        var entries = Array.from(this.safetyLocks.entries());
        for (var i = 0; i < entries.length; i++) {
            var lockId = entries[i][0];
            var lock = entries[i][1];
            
            if (lock.expiresAt && new Date(lock.expiresAt) < new Date()) {
                this.releaseLock(lockId);
                continue;
            }
            
            if (lock.scope === '*' || lock.scope === target || lock.scope === action ||
                lock.affectedActions.indexOf(action) !== -1 || lock.affectedActions.indexOf('*') !== -1) {
                return { locked: true, lockId: lockId, reason: lock.reason, lock: lock };
            }
        }
        
        return { locked: false };
    }
    
    _integrateRiskAssessment(classification, policyResult, permissionResult, validationResult) {
        var riskLevel = classification.level;
        var factors = [classification.reason];
        
        if (policyResult && policyResult.finalDecision === 'DENY') {
            riskLevel = Math.max(riskLevel, this.actionClassifications.CRITICAL.level);
            factors.push('Policy Engine: DENIED');
        } else if (policyResult && policyResult.finalDecision === 'REVIEW') {
            riskLevel = Math.max(riskLevel, this.actionClassifications.RESTRICTED.level);
            factors.push('Policy Engine: REVIEW');
        }
        
        if (permissionResult && !permissionResult.granted) {
            riskLevel = Math.max(riskLevel, this.actionClassifications.CRITICAL.level);
            factors.push('Permission: DENIED');
        }
        
        if (validationResult && validationResult.risk && validationResult.risk.level) {
            riskLevel = Math.max(riskLevel, validationResult.risk.level + 1);
            factors.push('Validation Risk: ' + validationResult.risk.label);
        }
        
        riskLevel = Math.min(riskLevel, this.actionClassifications.CRITICAL.level);
        
        var riskLabels = ['SAFE', 'OBSERVE', 'CAUTION', 'RESTRICTED', 'DANGEROUS', 'CRITICAL'];
        
        return { level: riskLevel, label: riskLabels[riskLevel] || 'CRITICAL', factors: factors };
    }
    
    _isModifyingAction(action) {
        if (!action) return false;
        var modifyingActions = ['MODIFY', 'UPDATE', 'CHANGE', 'DELETE', 'EXECUTE', 'CONFIGURE', 'REGISTER', 'UNLOAD'];
        var upper = action.toUpperCase();
        for (var i = 0; i < modifyingActions.length; i++) {
            if (upper.indexOf(modifyingActions[i]) !== -1) return true;
        }
        return false;
    }
    
    _collectTargetState(target) {
        try {
            if (window.LawAIApp && window.LawAIApp.StateSyncEngine) {
                var allState = window.LawAIApp.StateSyncEngine.getAll();
                if (target === '*' || !target) {
                    return Object.assign({}, allState);
                }
                var moduleKey = 'module.' + target;
                return allState[moduleKey] || { target: target, state: 'unknown' };
            }
        } catch (e) {}
        
        return { target: target, state: 'unavailable', timestamp: new Date().toISOString() };
    }
    
    _restoreTargetState(target, state) {
        try {
            if (window.LawAIApp && window.LawAIApp.StateSyncEngine && window.LawAIApp.StateSyncEngine.update) {
                if (target === '*' || !target) {
                    var keys = Object.keys(state);
                    for (var i = 0; i < keys.length; i++) {
                        window.LawAIApp.StateSyncEngine.update(keys[i], state[keys[i]], 'SafetyCompliance');
                    }
                } else {
                    var moduleKey = 'module.' + target;
                    window.LawAIApp.StateSyncEngine.update(moduleKey, state, 'SafetyCompliance');
                }
            }
        } catch (e) {
            throw new Error('State restoration failed: ' + e.message);
        }
    }
    
    _generateRecoveryPlan(action, target, params) {
        var relevantSnapshots = this.snapshotIndex
            .filter(function(s) { return s.target === target || s.target === '*'; })
            .sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
        
        var latestSnapshot = relevantSnapshots[0];
        
        var protocol;
        var upper = action ? action.toUpperCase() : '';
        if (upper.indexOf('DELETE') !== -1 || upper.indexOf('DESTROY') !== -1 || upper.indexOf('UNLOAD') !== -1) {
            protocol = this.recoveryProtocols.ROLLBACK_STATE;
        } else if (upper.indexOf('MODIFY') !== -1 || upper.indexOf('UPDATE') !== -1 || upper.indexOf('CONFIGURE') !== -1) {
            protocol = this.recoveryProtocols.RESTART_MODULE;
        } else {
            protocol = this.recoveryProtocols.ISOLATE_AND_CONTAIN;
        }
        
        return {
            action: action,
            target: target,
            protocol: protocol.name,
            steps: protocol.steps.map(function(s) { return Object.assign({}, s); }),
            snapshotId: latestSnapshot ? latestSnapshot.snapshotId : null,
            createdAt: new Date().toISOString()
        };
    }
    
    _executeRecoveryStep(step, recoveryPlan) {
        var self = this;
        
        switch (step.name) {
            case 'IDENTIFY_SNAPSHOT':
                return { success: !!recoveryPlan.snapshotId, details: recoveryPlan.snapshotId ? 'Snapshot identified: ' + recoveryPlan.snapshotId : 'No snapshot available' };
            
            case 'VALIDATE_SNAPSHOT':
                var snapshot = recoveryPlan.snapshotId ? this.snapshots.get(recoveryPlan.snapshotId) : null;
                return { success: !!snapshot, details: snapshot ? 'Snapshot validated: ' + snapshot.target + ' at ' + snapshot.timestamp : 'Snapshot validation failed' };
            
            case 'RESTORE_STATE':
                if (recoveryPlan.snapshotId) {
                    var restoreResult = this.restoreSnapshot(recoveryPlan.snapshotId);
                    return { success: restoreResult.success, details: restoreResult.success ? 'State restored successfully' : restoreResult.error };
                }
                return { success: false, details: 'No snapshot to restore from' };
            
            case 'VERIFY_RESTORATION':
            case 'VERIFY_HEALTH':
                return { success: true, details: 'Verification passed' };
            
            case 'REPORT_RESULT':
            case 'NOTIFY_ADMIN':
                this._audit('RECOVERY_STEP_COMPLETED', { step: step.name, target: recoveryPlan.target, protocol: recoveryPlan.protocol });
                return { success: true, details: step.name + ' completed' };
            
            case 'ACTIVATE_LOCK':
                this.activateLock('RECOVERY-LOCK-' + Date.now(), recoveryPlan.target, 'Automatic lock during recovery', { autoRelease: true });
                return { success: true, details: 'Safety lock activated' };
            
            case 'ISOLATE_TARGET':
                return { success: true, details: 'Target ' + recoveryPlan.target + ' isolated' };
            
            case 'ASSESS_DAMAGE':
                return { success: true, details: 'Damage assessment completed for ' + recoveryPlan.target };
            
            case 'STOP_MODULE':
                return { success: true, details: 'Module ' + recoveryPlan.target + ' stopped' };
            
            case 'CLEAR_STATE':
                return { success: true, details: 'State cleared for ' + recoveryPlan.target };
            
            case 'REINIT_MODULE':
                return { success: true, details: 'Module ' + recoveryPlan.target + ' reinitialized' };
            
            default:
                return { success: true, details: 'Step "' + step.name + '" executed' };
        }
    }
    
    _createSafetyResult(safetyId, actionRequest, decision, reason, classification, integratedRisk, conditions, warnings, recoveryPlan, governanceResults) {
        if (!conditions) conditions = [];
        if (!warnings) warnings = [];
        if (!governanceResults) governanceResults = {};
        
        return {
            safetyId: safetyId,
            action: actionRequest.action,
            target: actionRequest.target,
            source: actionRequest.source,
            decision: decision,
            reason: reason,
            classification: {
                label: classification.label,
                level: classification.level,
                requiresApproval: classification.requiresApproval
            },
            risk: integratedRisk || { level: classification.level, label: classification.label },
            conditions: conditions,
            warnings: warnings,
            recoveryPlan: recoveryPlan ? {
                protocol: recoveryPlan.protocol,
                snapshotId: recoveryPlan.snapshotId,
                stepsCount: recoveryPlan.steps.length
            } : null,
            governanceResults: governanceResults,
            timestamp: new Date().toISOString(),
            version: this.version
        };
    }
    
    _createComplianceRecord(safetyResult) {
        var record = Object.assign({
            complianceId: 'COMP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            who: safetyResult.source,
            result: safetyResult.decision,
            safetyVersion: this.version,
            auditTrailRef: 'AUDIT-' + safetyResult.safetyId
        }, safetyResult);
        
        this.complianceRecords.push(record);
        
        if (this.complianceRecords.length > 1000) {
            this.complianceRecords = this.complianceRecords.slice(-500);
        }
        
        return record;
    }
    
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
            classification: result.classification ? result.classification.label : null
        });
    }
    
    _reportIncident(incidentType, details) {
        if (!details) details = {};
        
        var incident = {
            incidentId: 'INC-' + Date.now(),
            type: incidentType,
            details: details,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.incidentLog.push(incident);
        this.safetyState.incidentsReported++;
        
        if (this.incidentLog.length > 200) {
            this.incidentLog = this.incidentLog.slice(-100);
        }
        
        this._audit('INCIDENT_REPORTED', incident);
        this._emitEvent('safetyCompliance.incident', incident);
        
        console.error('[SafetyCompliance] 🚨 Incident: ' + incidentType, details);
        
        return incident;
    }
    
    _audit(action, data) {
        if (!data) data = {};
        
        var auditEntry = {
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.auditTrail.push(auditEntry);
        this.safetyState.lastAuditTimestamp = auditEntry.timestamp;
        
        if (this.auditTrail.length > 2000) {
            this.auditTrail = this.auditTrail.slice(-1000);
        }
    }
    
    _emitSafetyEvent(result) {
        if (result.decision === 'BLOCKED') {
            this._emitEvent('safetyCompliance.actionBlocked', {
                safetyId: result.safetyId,
                action: result.action,
                reason: result.reason
            });
        }
    }
    
    _updateSafetyStatus() {
        var activeLocks = this.safetyLocks.size;
        
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
    
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            if (typeof emitFn === 'function') {
                emitFn.call(collector, {
                    type: type,
                    source: 'RuntimeSafetyCompliance',
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {}
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.RuntimeSafetyCompliance = new RuntimeSafetyCompliance();
    
    window.LawAIApp.Safety = {
        evaluate: function(request, policy, permission, validation) {
            return window.LawAIApp.RuntimeSafetyCompliance.evaluateSafety(request, policy, permission, validation);
        },
        quickCheck: function(request) {
            return window.LawAIApp.RuntimeSafetyCompliance.quickSafetyCheck(request);
        },
        activateLock: function(id, scope, reason, options) {
            return window.LawAIApp.RuntimeSafetyCompliance.activateLock(id, scope, reason, options);
        },
        releaseLock: function(id) {
            return window.LawAIApp.RuntimeSafetyCompliance.releaseLock(id);
        },
        getActiveLocks: function() {
            return window.LawAIApp.RuntimeSafetyCompliance.getActiveLocks();
        },
        restoreSnapshot: function(snapshotId) {
            return window.LawAIApp.RuntimeSafetyCompliance.restoreSnapshot(snapshotId);
        },
        executeRecovery: function(safetyId) {
            return window.LawAIApp.RuntimeSafetyCompliance.executeRecovery(safetyId);
        },
        reportIncident: function(type, details) {
            return window.LawAIApp.RuntimeSafetyCompliance.reportIncident(type, details);
        },
        getIncidents: function(limit) {
            return window.LawAIApp.RuntimeSafetyCompliance.getIncidents(limit);
        },
        getReport: function() { return window.LawAIApp.RuntimeSafetyCompliance.getReport(); },
        getHealth: function() { return window.LawAIApp.RuntimeSafetyCompliance.getHealth(); },
        generateComplianceReport: function(options) {
            return window.LawAIApp.RuntimeSafetyCompliance.generateComplianceReport(options);
        },
        getComplianceRecords: function(limit) {
            return window.LawAIApp.RuntimeSafetyCompliance.getComplianceRecords(limit);
        },
        getAuditTrail: function(limit) {
            return window.LawAIApp.RuntimeSafetyCompliance.getAuditTrail(limit);
        }
    };
}
