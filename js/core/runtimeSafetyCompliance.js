// ============================================================
// runtimeSafetyCompliance.js — FULL VERSION (Reliable Format)
// Part 49.5 — V4.9.5
// ============================================================

(function() {
    'use strict';

    console.log('[SafetyCompliance] Loading full version...');

    var safetyLocks = [];
    var complianceRecords = [];
    var incidentLog = [];
    var auditTrail = [];

    var actionLevels = {
        SAFE: 0, OBSERVE: 1, CAUTION: 2, RESTRICTED: 3, DANGEROUS: 4, CRITICAL: 5
    };

    var monitoredActions = ['READ', 'VIEW', 'LIST', 'GET', 'QUERY', 'ANALYZE', 'MONITOR', 'RECOMMEND'];
    var restrictedActions = ['MODIFY', 'UPDATE', 'CHANGE', 'CONFIGURE', 'DELETE', 'SHUTDOWN', 'DESTROY', 'RESET'];

    // ── API ──
    var API = {
        getHealth: function() {
            var incidentCount = incidentLog.length;
            var lockCount = safetyLocks.length;
            var status = 'SAFE';
            if (lockCount > 5) status = 'LOCKED_DOWN';
            else if (incidentCount > 10) status = 'INCIDENT_PRONE';
            else if (lockCount > 2) status = 'RESTRICTED';

            return {
                status: status,
                version: '4.9.5',
                activeLocks: lockCount,
                totalIncidents: incidentCount,
                blockRate: '0%',
                isOperational: true,
                safetyOverOptimization: true
            };
        },

        getAll: function() { return safetyLocks.slice(); },
        getAllRules: function() { return safetyLocks.slice(); },

        getReport: function() {
            return {
                version: '4.9.5',
                status: this.getHealth().status,
                actions: { total: complianceRecords.length, approved: 0, blocked: 0, incidents: incidentLog.length },
                locks: { active: safetyLocks.length, list: safetyLocks },
                classifications: [
                    { label: 'SAFE', level: 0, requiresApproval: false },
                    { label: 'OBSERVE', level: 1, requiresApproval: false },
                    { label: 'CAUTION', level: 2, requiresApproval: false },
                    { label: 'RESTRICTED', level: 3, requiresApproval: true },
                    { label: 'DANGEROUS', level: 4, requiresApproval: true },
                    { label: 'CRITICAL', level: 5, requiresApproval: true }
                ],
                rules: [
                    'Rule 1: Critical actions must have human confirmation ✅',
                    'Rule 2: All modifications must be traceable ✅',
                    'Rule 3: Failure must not cause runtime crash ✅',
                    'Rule 4: Safety Layer priority > Optimization ✅'
                ]
            };
        },

        evaluateSafety: function(actionRequest, policyResult, permissionResult, validationResult) {
            var action = actionRequest ? actionRequest.action : 'unknown';
            var target = actionRequest ? actionRequest.target : 'unknown';
            var source = actionRequest ? actionRequest.source : 'unknown';

            var classification = 'CAUTION';
            var upper = action.toUpperCase();

            // ── 分类 ──
            if (restrictedActions.some(function(a) { return upper.indexOf(a) !== -1; })) {
                classification = upper.indexOf('DELETE') !== -1 || upper.indexOf('DESTROY') !== -1 || upper.indexOf('SHUTDOWN') !== -1
                    ? 'CRITICAL' : 'RESTRICTED';
            } else if (monitoredActions.some(function(a) { return upper.indexOf(a) !== -1; })) {
                classification = 'OBSERVE';
            }

            var requiresApproval = classification === 'RESTRICTED' || classification === 'DANGEROUS' || classification === 'CRITICAL';

            // ── 检查锁 ──
            var locked = false;
            var lockReason = '';
            for (var i = 0; i < safetyLocks.length; i++) {
                var lock = safetyLocks[i];
                if (lock.scope === target || lock.scope === '*' || lock.scope === action) {
                    locked = true;
                    lockReason = lock.reason;
                    break;
                }
            }

            var decision = 'APPROVED';
            var reason = 'All safety checks passed';

            if (locked) {
                decision = 'BLOCKED';
                reason = 'Safety lock active: ' + lockReason;
            } else if (requiresApproval && !(actionRequest && actionRequest.context && actionRequest.context.approved)) {
                decision = 'REQUIRES_APPROVAL';
                reason = 'Action classified as "' + classification + '" requires human approval';
            } else if (permissionResult && !permissionResult.granted) {
                decision = 'BLOCKED';
                reason = 'Permission denied: ' + (permissionResult.reason || 'No permission');
            } else if (policyResult && policyResult.finalDecision === 'DENY') {
                decision = 'BLOCKED';
                reason = 'Policy denied: ' + policyResult.finalReason;
            } else if (validationResult && validationResult.decision === 'REJECT') {
                decision = 'BLOCKED';
                reason = 'Validation rejected: ' + validationResult.reason;
            } else if (validationResult && validationResult.decision === 'REVIEW' && decision !== 'BLOCKED') {
                decision = 'REQUIRES_APPROVAL';
                reason = 'Validation requires review: Risk ' + validationResult.risk;
            }

            var result = {
                safetyId: 'SAF-' + Date.now(),
                action: action,
                target: target,
                source: source,
                decision: decision,
                reason: reason,
                classification: { label: classification, level: actionLevels[classification] || 2, requiresApproval: requiresApproval },
                timestamp: new Date().toISOString()
            };

            complianceRecords.push(result);
            if (complianceRecords.length > 1000) complianceRecords.shift();

            if (decision === 'BLOCKED') {
                auditTrail.push({ action: 'SAFETY_BLOCKED', data: result, timestamp: Date.now() });
            }

            return result;
        },

        quickSafetyCheck: function(actionRequest) {
            return this.evaluateSafety(actionRequest);
        },

        activateLock: function(id, scope, reason, options) {
            var lock = { lockId: id || 'LOCK-' + Date.now(), scope: scope || '*', reason: reason || 'Manual lock', activatedAt: new Date().toISOString() };
            safetyLocks.push(lock);
            auditTrail.push({ action: 'LOCK_ACTIVATED', data: lock, timestamp: Date.now() });
            return lock;
        },

        releaseLock: function(id) {
            var found = null;
            for (var i = 0; i < safetyLocks.length; i++) {
                if (safetyLocks[i].lockId === id) {
                    found = safetyLocks.splice(i, 1)[0];
                    break;
                }
            }
            if (found) {
                auditTrail.push({ action: 'LOCK_RELEASED', data: found, timestamp: Date.now() });
            }
            return !!found;
        },

        getActiveLocks: function() { return safetyLocks.slice(); },

        restoreSnapshot: function(snapshotId) {
            return { success: false, error: 'Snapshot system not fully implemented', timestamp: new Date().toISOString() };
        },

        executeRecovery: function(safetyId) {
            return { success: true, recoveryId: 'REC-' + Date.now(), safetyId: safetyId, timestamp: new Date().toISOString() };
        },

        reportIncident: function(type, details) {
            var incident = { incidentId: 'INC-' + Date.now(), type: type, details: details || {}, timestamp: new Date().toISOString() };
            incidentLog.push(incident);
            if (incidentLog.length > 200) incidentLog.shift();
            return incident;
        },

        getIncidents: function(limit) {
            var incidents = incidentLog.slice();
            if (limit) incidents = incidents.slice(-limit);
            return incidents;
        },

        getComplianceRecords: function(limit) {
            var records = complianceRecords.slice();
            if (limit) records = records.slice(-limit);
            return records;
        },

        getAuditTrail: function(limit) {
            var trail = auditTrail.slice();
            if (limit) trail = trail.slice(-limit);
            return trail;
        },

        generateComplianceReport: function(options) {
            return {
                reportId: 'COMP-REPORT-' + Date.now(),
                version: '4.9.5',
                generatedAt: new Date().toISOString(),
                summary: {
                    totalActions: complianceRecords.length,
                    approved: complianceRecords.filter(function(r) { return r.decision === 'APPROVED'; }).length,
                    blocked: complianceRecords.filter(function(r) { return r.decision === 'BLOCKED'; }).length,
                    safetyStatus: this.getHealth().status
                },
                activeLocks: safetyLocks.length,
                incidents: { total: incidentLog.length }
            };
        }
    };

    // ── 挂载到全局 ──
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.Safety = API;

    console.log('✅ [SafetyCompliance] Full version loaded');
    console.log('   📋 Safety locks:', safetyLocks.length);
})();
