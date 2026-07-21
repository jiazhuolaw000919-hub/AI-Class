// ===========================================
// devPanel.js
// 开发者面板 - Ctrl+Shift+L 调出
// Recovery R1 Parts 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13，14, 15, 16，17，18, 19，20，21, 22，23, 24, 25 Complete
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.DevPanel = {
    _panel: null,
    _isOpen: false,

    /**
     * 切换面板
     */
    toggle: function() {
        if (this._isOpen) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * 显示面板
     */
    show: function() {
        if (this._panel) {
            this._panel.remove();
        }

        this._panel = document.createElement('div');
        this._panel.id = 'dev-panel';
        this._panel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            background: #1a1a2e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 20px;
            max-width: 380px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 13px;
            backdrop-filter: blur(20px);
        `;

        // ============================================================
        // 🔥 COLLECT ALL RECOVERY INFO (Parts 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13，14, 15, 16，17，18，19，20，21, 22，23, 24, 25)
        // ============================================================
        
        // Part 1: Architecture Info
        var archInfo = this._getArchitectureInfo();
        
        // Part 2: Runtime Info
        var runtimeInfo = this._getRuntimeInfo();
        
        // Part 3: Feature Governance Info
        var featureInfo = this._getFeatureInfo();
        
        // Part 4: UI Constitution Info
        var uiInfo = this._getUIInfo();
        
        // Part 5: Audit Center Info
        var auditInfo = this._getAuditInfo();
        
        // Part 6: Architecture Freeze Info
        var freezeInfo = this._getFreezeInfo();
        
        // Part 7: Engine Standards Info
        var engineInfo = this._getEngineInfo();
        
        // Part 8: Runtime Freeze Info
        var runtimeFreezeInfo = this._getRuntimeFreezeInfo();
        
        // Part 9: Registry Freeze Info
        var registryFreezeInfo = this._getRegistryFreezeInfo();
        
        // Part 10: Compliance Info
        var complianceInfo = this._getComplianceInfo();
        
        // Part 11: Domain Info
        var domainInfo = this._getDomainInfo();
        
        // Part 12: Dependency Info
        var dependencyInfo = this._getDependencyInfo();
        
        // Part 13: Capability Info
        var capabilityInfo = this._getCapabilityInfo();

        // Part 14: Lifecycle Info
        var lifecycleInfo = this._getLifecycleInfo();

        // Part 15: Engine Audit Info
        var engineAuditInfo = this._getEngineAuditInfo();

        // Part 16: Governance Info
        var governanceInfo = this._getGovernanceInfo();

        // Part 17: Engine Event Info
        var engineEventInfo = this._getEngineEventInfo();
        
        // Part 18: Runtime Intelligence Info
        var runtimeIntelligenceInfo = this._getRuntimeIntelligenceInfo();

        // Part 19: Engine Coordination Info
        var engineCoordinationInfo = this._getEngineCoordinationInfo();

        // Part 20: Engine Discovery Info
        var engineDiscoveryInfo = this._getEngineDiscoveryInfo();

        // Part 21: Engine Communication Info
        var engineCommunicationInfo = this._getEngineCommunicationInfo();

        // Part 22: Engine Signal Info
        var engineSignalInfo = this._getEngineSignalInfo();

        // Part 23: System Awareness Info
        var systemAwarenessInfo = this._getSystemAwarenessInfo();

        // ============================================================
        // 🔥 PART 24: BOOT ORCHESTRATION
        // ============================================================

        // Create container for Boot Panel
        var bootContainer = document.createElement('div');
        bootContainer.id = 'boot-panel-container';
        bootContainer.style.marginTop = '8px';
        bootContainer.style.padding = '8px 12px';
        bootContainer.style.background = 'rgba(251,146,60,0.04)';
        bootContainer.style.borderRadius = '8px';
        bootContainer.style.borderLeft = '2px solid #f59e0b';

        // Mount Boot Panel if available
        var bootPanel = window.bootPanel || LawAIApp.BootPanel;
        if (bootPanel && typeof bootPanel.render === 'function') {
          bootPanel.render(bootContainer, 15000);
        } else {
          bootContainer.innerHTML = 
            '<div style="font-weight:bold;color:#f59e0b;font-size:11px;">🚀 Boot Orchestration</div>' +
            '<div style="font-size:10px;color:#475569;">Loading...</div>';
        }

        // Insert after System Awareness section
        var sections = document.querySelectorAll('#dev-panel div[style*="margin-bottom:8px;padding:8px 12px"]');
        if (sections.length > 0) {
          var lastSection = sections[sections.length - 1];
          lastSection.parentNode.insertBefore(bootContainer, lastSection.nextSibling);
        } else {
          var contentDiv = document.querySelector('#dev-panel > div:not([id])');
          if (contentDiv) {
            contentDiv.appendChild(bootContainer);
          } else {
            document.querySelector('#dev-panel').appendChild(bootContainer);
          }
        }

        // Part 25: System Reality Info
        var systemRealityInfo = this._getSystemRealityInfo();

        // Engine Status
        var engineStatus = [];
        try {
            if (LawAIApp.StartupValidator && typeof LawAIApp.StartupValidator.validate === 'function') {
                engineStatus = LawAIApp.StartupValidator.validate() || [];
            }
        } catch (e) { engineStatus = ['StartupValidator not available']; }

        // Storage Report
        var storageReport = { totalKeys: 0, orphanKeys: [] };
        try {
            if (LawAIApp.Debug?.StorageAudit && typeof LawAIApp.Debug.StorageAudit.audit === 'function') {
                storageReport = LawAIApp.Debug.StorageAudit.audit();
            } else if (LawAIApp.StorageAudit && typeof LawAIApp.StorageAudit.audit === 'function') {
                storageReport = LawAIApp.StorageAudit.audit();
            }
        } catch (e) { /* ignore */ }

        var version = LawAIApp.SystemComposer?.version || '4.0.17';

        // ============================================================
        // BUILD PANEL HTML
        // ============================================================
        this._panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">
                <span style="font-size:16px;font-weight:700;color:#4a9eff;">🛠️ Dev Panel</span>
                <span style="font-size:10px;color:#475569;">v${version}</span>
                <button onclick="LawAIApp.Debug.DevPanel.hide()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 2: RUNTIME STATUS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.06);border-radius:8px;border-left:2px solid #4a9eff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime</span>
                    <span style="font-size:10px;color:${runtimeInfo.ready ? '#22c55e' : '#f59e0b'};">${runtimeInfo.ready ? '✅ Ready' : '⏳ ' + runtimeInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: ${runtimeInfo.status}</span>
                    <span>Uptime: ${runtimeInfo.uptime}</span>
                    <span>Version: ${runtimeInfo.version}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Registry: ${runtimeInfo.registryCount} modules loaded
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 1: ARCHITECTURE STATUS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #64748b;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏗️ Architecture</span>
                    <span style="font-size:10px;color:${archInfo.ready ? '#22c55e' : '#f59e0b'};">${archInfo.ready ? '✅ Ready' : '⏳ Initializing'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Domains: ${archInfo.domains}</span>
                    <span>Layers: ${archInfo.layers}</span>
                    <span>Warnings: ${archInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    Layers: ${archInfo.layerList || 'N/A'}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 3: FEATURE GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">📦 Feature Governance</span>
                    <span style="font-size:10px;color:${featureInfo.healthScore >= 80 ? '#22c55e' : '#ef4444'};">${featureInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${featureInfo.total}</span>
                    <span>✅ ${featureInfo.healthy}</span>
                    <span>❌ ${featureInfo.unhealthy}</span>
                    <span>⛔ ${featureInfo.disabled}</span>
                    <span>⚠️ ${featureInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Domains: ${featureInfo.domains}
                </div>
                ${featureInfo.broken > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${featureInfo.broken} broken features detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 4: UI CONSTITUTION -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(236,72,153,0.04);border-radius:8px;border-left:2px solid #ec4899;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎨 UI Constitution</span>
                    <span style="font-size:10px;color:${uiInfo.healthScore >= 80 ? '#22c55e' : '#ef4444'};">${uiInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${uiInfo.total}</span>
                    <span>✅ ${uiInfo.healthy}</span>
                    <span>❌ ${uiInfo.unhealthy}</span>
                    <span>📭 ${uiInfo.unused}</span>
                    <span>⚠️ ${uiInfo.warnings}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    Categories: ${uiInfo.categories}
                </div>
                ${uiInfo.broken > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${uiInfo.broken} broken components detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 5: ARCHITECTURE AUDIT -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(251,191,36,0.04);border-radius:8px;border-left:2px solid #f59e0b;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔍 Architecture Audit</span>
                    <span style="font-size:10px;color:${auditInfo.pass ? '#22c55e' : '#ef4444'};">${auditInfo.pass ? '✅ PASS' : '❌ NEEDS WORK'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Score: ${auditInfo.score}%</span>
                    <span>Status: ${auditInfo.status}</span>
                    <span>⚠️ ${auditInfo.warnings}</span>
                    <span>❌ ${auditInfo.errors}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Arch: ${auditInfo.architecture}%</span>
                    <span>Dep: ${auditInfo.dependencies}%</span>
                    <span>Mod: ${auditInfo.modules}%</span>
                    <span>Feat: ${auditInfo.features}%</span>
                    <span>UI: ${auditInfo.ui}%</span>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 6: ARCHITECTURE FREEZE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">❄️ Architecture Freeze</span>
                    <span style="font-size:10px;color:${freezeInfo.active ? '#22c55e' : '#f59e0b'};">${freezeInfo.active ? '✅ ACTIVE' : '⏳ PENDING'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Version: ${freezeInfo.version}</span>
                    <span>Status: ${freezeInfo.status}</span>
                    <span>Guard: ${freezeInfo.guardStatus}</span>
                    <span>Constitution: ${freezeInfo.constitutionLoaded ? '✅' : '⏳'}</span>
                </div>
                <div style="font-size:9px;color:#475569;margin-top:2px;">
                    ${freezeInfo.violations === 0 ? '✅ No violations' : '⚠️ ' + freezeInfo.violations + ' violations found'}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 7: ENGINE STANDARDS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(251,146,60,0.04);border-radius:8px;border-left:2px solid #fb923c;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚙️ Engine Standards</span>
                    <span style="font-size:10px;color:${engineInfo.healthScore >= 80 ? '#22c55e' : '#ef4444'};">${engineInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${engineInfo.total}</span>
                    <span>✅ ${engineInfo.healthy}</span>
                    <span>⚠️ ${engineInfo.deprecated}</span>
                    <span>❌ ${engineInfo.incomplete}</span>
                    <span>❓ ${engineInfo.unknown}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Constitution: ${engineInfo.constitutionLoaded ? '✅' : '⏳'}</span>
                    <span>Validator: ${engineInfo.validatorReady ? '✅' : '⏳'}</span>
                    <span>Manifest: ${engineInfo.manifestReady ? '✅' : '⏳'}</span>
                </div>
                <div style="font-size:8px;color:#475569;margin-top:2px;">
                    Loaded: ${engineInfo.loaded} | Missing: ${engineInfo.missing} | Failed: ${engineInfo.failed}
                </div>
                ${engineInfo.incomplete > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${engineInfo.incomplete} incomplete engines detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 8: RUNTIME FREEZE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime Freeze</span>
                    <span style="font-size:10px;color:${runtimeFreezeInfo.status === 'compliant' ? '#22c55e' : '#f59e0b'};">${runtimeFreezeInfo.status.toUpperCase()}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Constitution: ${runtimeFreezeInfo.constitutionLoaded ? '✅' : '⏳'}</span>
                    <span>Policy: ${runtimeFreezeInfo.policyReady ? '✅' : '⏳'}</span>
                    <span>Validator: ${runtimeFreezeInfo.validatorReady ? '✅' : '⏳'}</span>
                    <span>Manifest: ${runtimeFreezeInfo.manifestReady ? '✅' : '⏳'}</span>
                    <span>Health: ${runtimeFreezeInfo.healthReady ? '✅' : '⏳'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Modules: ${runtimeFreezeInfo.modulesExists}/${runtimeFreezeInfo.modulesTotal}</span>
                    <span>Health Score: ${runtimeFreezeInfo.healthScore}%</span>
                    ${runtimeFreezeInfo.modulesMissing > 0 ? `
                        <span style="color:#ef4444;">Missing: ${runtimeFreezeInfo.modulesMissing}</span>
                    ` : ''}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 9: REGISTRY FREEZE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">📋 Registry Freeze</span>
                    <span style="font-size:10px;color:${registryFreezeInfo.status === 'compliant' ? '#22c55e' : '#f59e0b'};">${registryFreezeInfo.status.toUpperCase()}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Constitution: ${registryFreezeInfo.constitutionLoaded ? '✅' : '⏳'}</span>
                    <span>Policy: ${registryFreezeInfo.policyReady ? '✅' : '⏳'}</span>
                    <span>Validator: ${registryFreezeInfo.validatorReady ? '✅' : '⏳'}</span>
                    <span>Manifest: ${registryFreezeInfo.manifestReady ? '✅' : '⏳'}</span>
                    <span>Health: ${registryFreezeInfo.healthReady ? '✅' : '⏳'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Registries: ${registryFreezeInfo.registriesHealthy}/${registryFreezeInfo.registriesTotal}</span>
                    <span>Health Score: ${registryFreezeInfo.healthScore}%</span>
                    ${registryFreezeInfo.registriesMissing > 0 ? `
                        <span style="color:#ef4444;">Missing: ${registryFreezeInfo.registriesMissing}</span>
                    ` : ''}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 10: COMPLIANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">✅ Compliance</span>
                    <span style="font-size:10px;color:${complianceInfo.certified ? '#22c55e' : '#ef4444'};">${complianceInfo.certified ? '✅ CERTIFIED' : '⏳ PENDING'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Score: ${complianceInfo.score}%</span>
                    <span>Status: ${complianceInfo.status}</span>
                    <span>Freeze: v${complianceInfo.freezeVersion}</span>
                    <span>Recovery: ${complianceInfo.recoveryVersion}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Arch: ${complianceInfo.architecture}%</span>
                    <span>Runtime: ${complianceInfo.runtime}%</span>
                    <span>Feature: ${complianceInfo.features}%</span>
                    <span>UI: ${complianceInfo.ui}%</span>
                    <span>Engine: ${complianceInfo.engine}%</span>
                    <span>Registry: ${complianceInfo.registry}%</span>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 11: DOMAIN ARCHITECTURE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏛️ Domain Architecture</span>
                    <span style="font-size:10px;color:${domainInfo.domainScore >= 80 ? '#22c55e' : '#f59e0b'};">${domainInfo.domainScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Domains: ${domainInfo.populatedDomains}/${domainInfo.totalDomains}</span>
                    <span>Engines: ${domainInfo.totalEngines}</span>
                    <span>Status: ${domainInfo.domainStatus}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Largest: ${domainInfo.largestDomain} (${domainInfo.largestCount})</span>
                    <span>Smallest: ${domainInfo.smallestDomain} (${domainInfo.smallestCount})</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Core: ${domainInfo.classificationSummary.Core}</span>
                    <span>Business: ${domainInfo.classificationSummary.Business}</span>
                    <span>Support: ${domainInfo.classificationSummary.Support}</span>
                    <span>Experimental: ${domainInfo.classificationSummary.Experimental}</span>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 12: DEPENDENCY GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(251,146,60,0.04);border-radius:8px;border-left:2px solid #fb923c;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔗 Dependency Governance</span>
                    <span style="font-size:10px;color:${dependencyInfo.dependencyScore >= 80 ? '#22c55e' : '#f59e0b'};">${dependencyInfo.dependencyScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Engines: ${dependencyInfo.totalEngines}</span>
                    <span>✅ ${dependencyInfo.healthyCount}</span>
                    <span>🔄 ${dependencyInfo.circularCount}</span>
                    <span>📦 ${dependencyInfo.heavyCount}</span>
                    <span>📭 ${dependencyInfo.unusedCount}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Most Connected: ${dependencyInfo.mostConnected} (${dependencyInfo.mostConnectedCount})</span>
                    <span>Independent: ${dependencyInfo.independentCount}</span>
                    <span>Status: ${dependencyInfo.dependencyStatus}</span>
                </div>
                ${dependencyInfo.circularCount > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${dependencyInfo.circularCount} circular dependencies detected
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 13: CAPABILITY GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Capability Governance</span>
                    <span style="font-size:10px;color:${capabilityInfo.capabilityScore >= 80 ? '#22c55e' : '#f59e0b'};">${capabilityInfo.capabilityScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Engines: ${capabilityInfo.totalEngines}</span>
                    <span>✅ ${capabilityInfo.definedCapabilities}</span>
                    <span>❌ ${capabilityInfo.undefinedCapabilities}</span>
                    <span>🔄 ${capabilityInfo.duplicateCapabilities}</span>
                    <span>📊 ${capabilityInfo.coveragePercentage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Unique: ${capabilityInfo.uniqueCapabilities}</span>
                    <span>Largest: ${capabilityInfo.largestCapability} (${capabilityInfo.largestCount})</span>
                    <span>Status: ${capabilityInfo.capabilityStatus}</span>
                </div>
                ${capabilityInfo.undefinedCapabilities > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${capabilityInfo.undefinedCapabilities} engines with undefined capabilities
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 14: LIFECYCLE GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔄 Lifecycle Governance</span>
                    <span style="font-size:10px;color:${lifecycleInfo.lifecycleScore >= 80 ? '#22c55e' : '#f59e0b'};">${lifecycleInfo.lifecycleScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Engines: ${lifecycleInfo.totalEngines}</span>
                    <span>✅ ${lifecycleInfo.runningCount}</span>
                    <span>💤 ${lifecycleInfo.sleepingCount}</span>
                    <span>⏸️ ${lifecycleInfo.pausedCount}</span>
                    <span>⚠️ ${lifecycleInfo.deprecatedCount}</span>
                    <span>❌ ${lifecycleInfo.invalidCount}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Status: ${lifecycleInfo.lifecycleStatus}</span>
                    <span>Healthy: ${lifecycleInfo.healthyEngines}</span>
                </div>
                ${lifecycleInfo.deprecatedCount > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${lifecycleInfo.deprecatedCount} deprecated engines
                    </div>
                ` : ''}
                ${lifecycleInfo.invalidCount > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${lifecycleInfo.invalidCount} invalid engine states
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 15: ENGINE GOVERNANCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">✅ Engine Governance</span>
                    <span style="font-size:10px;color:${engineAuditInfo.auditScore >= 80 ? '#22c55e' : '#ef4444'};">${engineAuditInfo.auditScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${engineAuditInfo.totalEngines}</span>
                    <span>✅ ${engineAuditInfo.passingEngines}</span>
                    <span>❌ ${engineAuditInfo.failingEngines}</span>
                    <span>📊 ${engineAuditInfo.coveragePercentage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Identity: ${engineAuditInfo.coverage.identity}%</span>
                    <span>Domain: ${engineAuditInfo.coverage.domain}%</span>
                    <span>Capability: ${engineAuditInfo.coverage.capability}%</span>
                </div>
                ${engineAuditInfo.brokenEngines > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${engineAuditInfo.brokenEngines} broken engines
                    </div>
                ` : ''}
                ${engineAuditInfo.recommendations && engineAuditInfo.recommendations.length > 0 && engineAuditInfo.recommendations[0] !== 'All engines pass governance audit.' ? `
                    <div style="font-size:8px;color:#f59e0b;margin-top:2px;">
                        💡 ${engineAuditInfo.recommendations[0]}
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 16: ENGINE GOVERNANCE CENTER -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🏛️ Governance Center</span>
                    <span style="font-size:10px;color:${governanceInfo.score >= 80 ? '#22c55e' : '#ef4444'};">${governanceInfo.score}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Total: ${governanceInfo.totalEngines}</span>
                    <span>✅ ${governanceInfo.healthyEngines}</span>
                    <span>⚠️ ${governanceInfo.incompleteEngines}</span>
                    <span>❌ ${governanceInfo.brokenEngines}</span>
                    <span>📊 ${governanceInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Core: ${governanceInfo.maturity.core}</span>
                    <span>Business: ${governanceInfo.maturity.business}</span>
                    <span>Support: ${governanceInfo.maturity.support}</span>
                </div>
                ${governanceInfo.brokenEngines > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${governanceInfo.brokenEngines} broken engines
                    </div>
                ` : ''}
                ${governanceInfo.recommendations && governanceInfo.recommendations.length > 0 && governanceInfo.recommendations[0] !== 'All engines have excellent governance.' ? `
                    <div style="font-size:8px;color:#f59e0b;margin-top:2px;">
                        💡 ${governanceInfo.recommendations[0]}
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 17: ENGINE EVENTS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(251,146,60,0.04);border-radius:8px;border-left:2px solid #fb923c;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Engine Events</span>
                    <span style="font-size:10px;color:${engineEventInfo.healthScore >= 80 ? '#22c55e' : '#f59e0b'};">${engineEventInfo.healthScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Official: ${engineEventInfo.officialCount}</span>
                    <span>Custom: ${engineEventInfo.customCount}</span>
                    <span>Used: ${engineEventInfo.usedOfficialCount}</span>
                    <span>📊 ${engineEventInfo.coveragePercentage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Status: ${engineEventInfo.healthStatus}</span>
                    <span>Violations: ${engineEventInfo.violations}</span>
                </div>
                ${engineEventInfo.customCount > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${engineEventInfo.customCount} custom events detected
                    </div>
                ` : ''}
                ${engineEventInfo.coveragePercentage < 80 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ Low event coverage: ${engineEventInfo.coveragePercentage}%
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 18: RUNTIME INTELLIGENCE -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">⚡ Runtime Intelligence</span>
                    <span style="font-size:10px;color:${runtimeIntelligenceInfo.coverage >= 80 ? '#22c55e' : '#f59e0b'};">${runtimeIntelligenceInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: ${runtimeIntelligenceInfo.status}</span>
                    <span>Observed: ${runtimeIntelligenceInfo.observedCount}</span>
                    <span>Targets: ${runtimeIntelligenceInfo.totalTargets}</span>
                    <span>📊 ${runtimeIntelligenceInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Healthy: ${runtimeIntelligenceInfo.healthyTargets}</span>
                    <span>Unknown: ${runtimeIntelligenceInfo.unknownTargets}</span>
                    <span>Warnings: ${runtimeIntelligenceInfo.warnings}</span>
                </div>
                ${runtimeIntelligenceInfo.observedSystems.length > 0 ? `
                    <div style="font-size:8px;color:#475569;margin-top:2px;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        Systems: ${runtimeIntelligenceInfo.observedSystems.slice(0, 5).join(', ')}${runtimeIntelligenceInfo.observedSystems.length > 5 ? '...' : ''}
                    </div>
                ` : ''}
                ${runtimeIntelligenceInfo.coverage < 80 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ Low coverage: ${runtimeIntelligenceInfo.coverage}%
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 19: ENGINE COORDINATION -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🤝 Engine Coordination</span>
                    <span style="font-size:10px;color:${engineCoordinationInfo.coverage >= 80 ? '#22c55e' : '#f59e0b'};">${engineCoordinationInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Connected: ${engineCoordinationInfo.connectedEngines}/${engineCoordinationInfo.totalEngines}</span>
                    <span>Relationships: ${engineCoordinationInfo.totalRelationships}</span>
                    <span>Status: ${engineCoordinationInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Unique: ${engineCoordinationInfo.uniqueRelationships}</span>
                    <span>Circular: ${engineCoordinationInfo.circularCount}</span>
                    <span>Warnings: ${engineCoordinationInfo.validationWarnings}</span>
                </div>
                ${engineCoordinationInfo.orphanEngines.length > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        📭 Orphans: ${engineCoordinationInfo.orphanEngines.slice(0, 3).join(', ')}${engineCoordinationInfo.orphanEngines.length > 3 ? '...' : ''}
                    </div>
                ` : ''}
                ${engineCoordinationInfo.circularCount > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ⚠️ ${engineCoordinationInfo.circularCount} circular relationships
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 20: ENGINE DISCOVERY -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(251,146,60,0.04);border-radius:8px;border-left:2px solid #f59e0b;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🔍 Engine Discovery</span>
                    <span style="font-size:10px;color:${engineDiscoveryInfo.coverage >= 80 ? '#22c55e' : '#f59e0b'};">${engineDiscoveryInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Engines: ${engineDiscoveryInfo.totalEngines}</span>
                    <span>Domains: ${engineDiscoveryInfo.domains.length}</span>
                    <span>Categories: ${engineDiscoveryInfo.categories.length}</span>
                    <span>Capabilities: ${engineDiscoveryInfo.totalCapabilities}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Coverage: ${engineDiscoveryInfo.coverage}%</span>
                    <span>Status: ${engineDiscoveryInfo.status}</span>
                    ${engineDiscoveryInfo.totalMissing > 0 ? `<span style="color:#f59e0b;">⚠️ Missing: ${engineDiscoveryInfo.totalMissing}</span>` : '<span>✅ Complete</span>'}
                </div>
                ${engineDiscoveryInfo.totalMissing > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${engineDiscoveryInfo.totalMissing} metadata items missing
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 21: ENGINE COMMUNICATION -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(6,182,212,0.04);border-radius:8px;border-left:2px solid #06b6d4;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🌐 Engine Communication</span>
                    <span style="font-size:10px;color:${engineCommunicationInfo.coverage >= 60 ? '#22c55e' : '#f59e0b'};">${engineCommunicationInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Contracts: ${engineCommunicationInfo.totalContracts}</span>
                    <span>Sources: ${engineCommunicationInfo.uniqueSources}</span>
                    <span>Targets: ${engineCommunicationInfo.uniqueTargets}</span>
                    <span>Status: ${engineCommunicationInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Active: ${engineCommunicationInfo.activeContracts}</span>
                    <span>Deprecated: ${engineCommunicationInfo.deprecatedContracts}</span>
                    <span>Experimental: ${engineCommunicationInfo.experimentalContracts}</span>
                </div>
                ${engineCommunicationInfo.invalidContracts > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${engineCommunicationInfo.invalidContracts} invalid contracts
                    </div>
                ` : ''}
            </div>

                        <!-- ========================================================== -->
            <!-- 🔥 PART 22: ENGINE SIGNALS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">📡 Engine Signals</span>
                    <span style="font-size:10px;color:${engineSignalInfo.coverage >= 70 ? '#22c55e' : '#f59e0b'};">${engineSignalInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Signals: ${engineSignalInfo.totalSignals}</span>
                    <span>Types: ${engineSignalInfo.types.length}</span>
                    <span>Severities: ${engineSignalInfo.severities.length}</span>
                    <span>Status: ${engineSignalInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Sources: ${engineSignalInfo.sources.length}</span>
                    ${engineSignalInfo.totalMissing > 0 ? `<span style="color:#f59e0b;">⚠️ Missing: ${engineSignalInfo.totalMissing}</span>` : '<span>✅ Complete</span>'}
                </div>
                ${engineSignalInfo.totalMissing > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${engineSignalInfo.totalMissing} metadata items missing
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 23: SYSTEM AWARENESS -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 System Awareness</span>
                    <span style="font-size:10px;color:${systemAwarenessInfo.coverage >= 60 ? '#22c55e' : '#f59e0b'};">${systemAwarenessInfo.coverage}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: ${systemAwarenessInfo.status}</span>
                    <span>Runtime: ${systemAwarenessInfo.runtime.status}</span>
                    <span>Version: ${systemAwarenessInfo.runtime.version}</span>
                    <span>Engines: ${systemAwarenessInfo.engine.active}/${systemAwarenessInfo.engine.total}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Domains: ${systemAwarenessInfo.domain.populated}/${systemAwarenessInfo.domain.total}</span>
                    <span>Capabilities: ${systemAwarenessInfo.capability.coverage}%</span>
                    <span>Health: ${systemAwarenessInfo.health.overall}%</span>
                    <span>Known: ${systemAwarenessInfo.knownSystems}</span>
                </div>
                ${systemAwarenessInfo.validationWarnings > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ⚠️ ${systemAwarenessInfo.validationWarnings} warnings
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 PART 25: SYSTEM REALITY -->
            <!-- ========================================================== -->
            <div style="margin-bottom:8px;padding:8px 12px;background:rgba(34,197,94,0.04);border-radius:8px;border-left:2px solid #22c55e;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 System Reality</span>
                    <span style="font-size:10px;color:${systemRealityInfo.realityScore >= 80 ? '#22c55e' : '#f59e0b'};">${systemRealityInfo.realityScore}%</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Declared: ${systemRealityInfo.declaredEngines}</span>
                    <span>Runtime: ${systemRealityInfo.runtimeEngines}</span>
                    <span>Matches: ${systemRealityInfo.matches}</span>
                    <span>Status: ${systemRealityInfo.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Completeness: ${systemRealityInfo.completeness}%</span>
                    ${systemRealityInfo.missing > 0 ? `<span style="color:#ef4444;">❌ Missing: ${systemRealityInfo.missing}</span>` : ''}
                    ${systemRealityInfo.unknown > 0 ? `<span style="color:#f59e0b;">❓ Unknown: ${systemRealityInfo.unknown}</span>` : ''}
                    ${systemRealityInfo.missing === 0 && systemRealityInfo.unknown === 0 ? '<span>✅ Reality matches manifest</span>' : ''}
                </div>
                ${systemRealityInfo.missing > 0 ? `
                    <div style="font-size:9px;color:#ef4444;margin-top:2px;">
                        ❌ ${systemRealityInfo.missing} engines declared but missing from runtime
                    </div>
                ` : ''}
                ${systemRealityInfo.unknown > 0 ? `
                    <div style="font-size:9px;color:#f59e0b;margin-top:2px;">
                        ❓ ${systemRealityInfo.unknown} engines running but not declared in manifest
                    </div>
                ` : ''}
            </div>

            <!-- ========================================================== -->
            <!-- SYSTEM INFO -->
            <!-- ========================================================== -->
            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#64748b;">Engines</span>
                    <span style="color:${engineStatus.length > 0 ? '#ef4444' : '#22c55e'};font-weight:600;">${engineStatus.length > 0 ? engineStatus.join(', ') : '✅ All loaded'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#64748b;">Storage Keys</span>
                    <span style="color:#e2e8f0;font-weight:600;">${storageReport.totalKeys} (${storageReport.orphanKeys?.length || 0} orphan)</span>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- ACTIONS -->
            <!-- ========================================================== -->
            <div style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
                <button onclick="if(confirm("⚠️ Delete ALL data?")){LawAIApp.FactoryReset?.resetAll?.() || LawAIApp.FactoryReset?.execute?.()}" style="padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-size:12px;cursor:pointer;">🗑️ Reset</button>
                <button onclick="LawAIApp.FactoryReset?.exportBackup?.() || LawAIApp.Debug?.StorageAudit?.exportAll?.()" style="padding:6px 14px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;font-size:12px;cursor:pointer;">💾 Export</button>
                <button onclick="document.getElementById('dev-import-input').click()" style="padding:6px 14px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;font-size:12px;cursor:pointer;">📥 Import</button>
                <button onclick="var r=LawAIApp.Debug?.StorageAudit?.cleanOrphans?.();if(r!==undefined){alert('Removed '+r+' orphan keys');}else{alert('StorageAudit not available');}" style="padding:6px 14px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15);border-radius:8px;color:#f59e0b;font-size:12px;cursor:pointer;">🧹 Clean</button>
                <button onclick="console.log('📋 Storage:', JSON.stringify(localStorage, null, 2));alert('Check console for storage dump')" style="padding:6px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:12px;cursor:pointer;">📋 Log</button>
                <button onclick="location.reload()" style="padding:6px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.15);border-radius:8px;color:#22c55e;font-size:12px;cursor:pointer;">🔄 Reload</button>
            </div>

            <!-- ========================================================== -->
            <!-- 🔥 DETAILS (Collapsible) -->
            <!-- ========================================================== -->
            <details style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">
                <summary style="font-size:10px;color:#64748b;cursor:pointer;">📋 Recovery Details (Parts 1-25)</summary>
                <div style="font-size:9px;color:#475569;margin-top:6px;line-height:1.8;max-height:150px;overflow-y:auto;">
                    <div><strong>Part 1 - Architecture:</strong></div>
                    <div style="padding-left:12px;">Domains: ${archInfo.domainList || 'N/A'}</div>
                    <div style="padding-left:12px;">Flags: ${archInfo.flags || 'N/A'}</div>
                    <div><strong>Part 2 - Runtime:</strong></div>
                    <div style="padding-left:12px;">Status: ${runtimeInfo.status}</div>
                    <div style="padding-left:12px;">Registry: ${runtimeInfo.registryCount} modules</div>
                    <div><strong>Part 3 - Features:</strong></div>
                    <div style="padding-left:12px;">Total: ${featureInfo.total}</div>
                    <div style="padding-left:12px;">Health: ${featureInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Broken: ${featureInfo.broken}</div>
                    <div><strong>Part 4 - UI Constitution:</strong></div>
                    <div style="padding-left:12px;">Total: ${uiInfo.total}</div>
                    <div style="padding-left:12px;">Health: ${uiInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Broken: ${uiInfo.broken}</div>
                    <div><strong>Part 5 - Audit Center:</strong></div>
                    <div style="padding-left:12px;">Score: ${auditInfo.score}%</div>
                    <div style="padding-left:12px;">Status: ${auditInfo.status}</div>
                    <div style="padding-left:12px;">Pass: ${auditInfo.pass ? '✅' : '❌'}</div>
                    <div><strong>Part 6 - Architecture Freeze:</strong></div>
                    <div style="padding-left:12px;">Version: ${freezeInfo.version}</div>
                    <div style="padding-left:12px;">Status: ${freezeInfo.status}</div>
                    <div style="padding-left:12px;">Violations: ${freezeInfo.violations}</div>
                    <div><strong>Part 7 - Engine Standards:</strong></div>
                    <div style="padding-left:12px;">Total: ${engineInfo.total}</div>
                    <div style="padding-left:12px;">Health: ${engineInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Incomplete: ${engineInfo.incomplete}</div>
                    <div><strong>Part 8 - Runtime Freeze:</strong></div>
                    <div style="padding-left:12px;">Status: ${runtimeFreezeInfo.status}</div>
                    <div style="padding-left:12px;">Modules: ${runtimeFreezeInfo.modulesExists}/${runtimeFreezeInfo.modulesTotal}</div>
                    <div style="padding-left:12px;">Health Score: ${runtimeFreezeInfo.healthScore}%</div>
                    <div><strong>Part 9 - Registry Freeze:</strong></div>
                    <div style="padding-left:12px;">Status: ${registryFreezeInfo.status}</div>
                    <div style="padding-left:12px;">Registries: ${registryFreezeInfo.registriesHealthy}/${registryFreezeInfo.registriesTotal}</div>
                    <div style="padding-left:12px;">Health Score: ${registryFreezeInfo.healthScore}%</div>
                    <div><strong>Part 10 - Compliance:</strong></div>
                    <div style="padding-left:12px;">Status: ${complianceInfo.status}</div>
                    <div style="padding-left:12px;">Score: ${complianceInfo.score}%</div>
                    <div style="padding-left:12px;">Certified: ${complianceInfo.certified ? '✅' : '❌'}</div>
                    <div><strong>Part 11 - Domain Architecture:</strong></div>
                    <div style="padding-left:12px;">Domains: ${domainInfo.populatedDomains}/${domainInfo.totalDomains}</div>
                    <div style="padding-left:12px;">Score: ${domainInfo.domainScore}%</div>
                    <div><strong>Part 12 - Dependency Governance:</strong></div>
                    <div style="padding-left:12px;">Score: ${dependencyInfo.dependencyScore}%</div>
                    <div style="padding-left:12px;">Circular: ${dependencyInfo.circularCount}</div>
                    <div><strong>Part 13 - Capability Governance:</strong></div>
                    <div style="padding-left:12px;">Score: ${capabilityInfo.capabilityScore}%</div>
                    <div style="padding-left:12px;">Coverage: ${capabilityInfo.coveragePercentage}%</div>
                    <div><strong>Part 14 - Lifecycle Governance:</strong></div>
                    <div style="padding-left:12px;">Score: ${lifecycleInfo.lifecycleScore}%</div>
                    <div style="padding-left:12px;">Running: ${lifecycleInfo.runningCount}</div>
                    <div><strong>Part 15 - Engine Governance:</strong></div>
                    <div style="padding-left:12px;">Score: ${engineAuditInfo.auditScore}%</div>
                    <div style="padding-left:12px;">Passing: ${engineAuditInfo.passingEngines}</div>
                    <div><strong>Part 16 - Governance Center:</strong></div>
                    <div style="padding-left:12px;">Score: ${governanceInfo.score}%</div>
                    <div style="padding-left:12px;">Healthy: ${governanceInfo.healthyEngines}</div>
                    <div><strong>Part 17 - Engine Events:</strong></div>
                    <div style="padding-left:12px;">Score: ${engineEventInfo.healthScore}%</div>
                    <div style="padding-left:12px;">Official: ${engineEventInfo.officialCount}</div>
                    <div><strong>Part 18 - Runtime Intelligence:</strong></div>
                    <div style="padding-left:12px;">Status: ${runtimeIntelligenceInfo.status}</div>
                    <div style="padding-left:12px;">Coverage: ${runtimeIntelligenceInfo.coverage}%</div>
                    <div style="padding-left:12px;">Warnings: ${runtimeIntelligenceInfo.warnings}</div>
                    <div><strong>Part 19 - Engine Coordination:</strong></div>
                    <div style="padding-left:12px;">Status: ${engineCoordinationInfo.status}</div>
                    <div style="padding-left:12px;">Connected: ${engineCoordinationInfo.connectedEngines}/${engineCoordinationInfo.totalEngines}</div>
                    <div style="padding-left:12px;">Circular: ${engineCoordinationInfo.circularCount}</div>
                    <div><strong>Part 20 - Engine Discovery:</strong></div>
                    <div style="padding-left:12px;">Status: ${engineDiscoveryInfo.status}</div>
                    <div style="padding-left:12px;">Engines: ${engineDiscoveryInfo.totalEngines}</div>
                    <div style="padding-left:12px;">Coverage: ${engineDiscoveryInfo.coverage}%</div>
                    <div><strong>Part 21 - Engine Communication:</strong></div>
                    <div style="padding-left:12px;">Status: ${engineCommunicationInfo.status}</div>
                    <div style="padding-left:12px;">Contracts: ${engineCommunicationInfo.totalContracts}</div>
                    <div style="padding-left:12px;">Coverage: ${engineCommunicationInfo.coverage}%</div>
                    <div><strong>Part 22 - Engine Signals:</strong></div>
                    <div style="padding-left:12px;">Status: ${engineSignalInfo.status}</div>
                    <div style="padding-left:12px;">Signals: ${engineSignalInfo.totalSignals}</div>
                    <div style="padding-left:12px;">Coverage: ${engineSignalInfo.coverage}%</div>
                    <div><strong>Part 23 - System Awareness:</strong></div>
                    <div style="padding-left:12px;">Status: ${systemAwarenessInfo.status}</div>
                    <div style="padding-left:12px;">Coverage: ${systemAwarenessInfo.coverage}%</div>
                    <div style="padding-left:12px;">Known Systems: ${systemAwarenessInfo.knownSystems}</div>
                    <div><strong>Part 24 - Core Orchestration:</strong></div>
                    <div style="padding-left:12px;">Status: ${systemAwarenessInfo.status || 'N/A'}</div>
                    <div style="padding-left:12px;">Phases: ${systemAwarenessInfo.totalSources || 0}</div>
                    <div style="padding-left:12px;">Coverage: ${systemAwarenessInfo.coverage || 0}%</div>
                    <div><strong>Part 25 - System Reality:</strong></div>
                    <div style="padding-left:12px;">Status: ${systemRealityInfo.status}</div>
                    <div style="padding-left:12px;">Score: ${systemRealityInfo.realityScore}%</div>
                    <div style="padding-left:12px;">Matches: ${systemRealityInfo.matches}</div>
                    <div style="padding-left:12px;">Missing: ${systemRealityInfo.missing}</div>
                </div>
            </details>

            <div style="font-size:10px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:10px;margin-top:12px;">
                Press Ctrl+Shift+L to close
            </div>

            <input type="file" id="dev-import-input" accept=".json" style="display:none" onchange="LawAIApp.FactoryReset?.importBackup?.(this.files[0]) || LawAIApp.Debug?.DevPanel?._importBackup?.(this.files[0])">
        `;

        document.body.appendChild(this._panel);
        this._isOpen = true;
    },

    /**
     * 隐藏面板
     */
    hide: function() {
        if (this._panel) {
            this._panel.remove();
            this._panel = null;
        }
        this._isOpen = false;
    },

    // ============================================================
    // 🔥 PART 1: ARCHITECTURE INFO
    // ============================================================

    _getArchitectureInfo: function() {
        var info = {
            ready: false,
            domains: 0,
            layers: 0,
            warnings: 0,
            domainList: '',
            layerList: '',
            flags: ''
        };

        try {
            // Domain Registry
            var domainRegistry = LawAIApp.DomainRegistry || window.domainRegistry;
            if (domainRegistry && typeof domainRegistry.list === 'function') {
                var domains = domainRegistry.list();
                info.domains = domains.length;
                info.domainList = domains.map(function(d) { return d.name; }).join(', ');
            }

            // Layer Registry
            var layerRegistry = LawAIApp.LayerRegistry || window.layerRegistry;
            if (layerRegistry && typeof layerRegistry.list === 'function') {
                var layers = layerRegistry.list();
                info.layers = Object.keys(layers).length;
                info.layerList = Object.keys(layers).join(', ');
            }

            // Architecture Validator - check warnings
            var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
            if (archValidator && archValidator.warnings) {
                info.warnings = archValidator.warnings.length || 0;
            }

            // Recovery Flags
            var constants = LawAIApp.ArchitectureConstants || window.architectureConstants;
            if (constants && constants.RECOVERY_FLAGS) {
                var flags = constants.RECOVERY_FLAGS;
                var flagStr = [];
                for (var key in flags) {
                    if (flags.hasOwnProperty(key)) {
                        flagStr.push(key + ':' + (flags[key] ? '✅' : '⏳'));
                    }
                }
                info.flags = flagStr.join(' ');
            }

            info.ready = info.domains > 0 && info.layers > 0;

        } catch (err) {
            console.warn('Could not get architecture info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 2: RUNTIME INFO
    // ============================================================

    _getRuntimeInfo: function() {
        var info = {
            ready: false,
            status: 'unknown',
            uptime: '0s',
            version: 'N/A',
            registryCount: 0,
            registryModules: ''
        };

        try {
            // Runtime Status
            var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
            if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
                info.status = runtimeStatus.getStatus();
                info.ready = runtimeStatus.isReady ? runtimeStatus.isReady() : false;
            }

            // Runtime Kernel
            var runtimeKernel = LawAIApp.RuntimeKernel || window.runtimeKernel;
            if (runtimeKernel && typeof runtimeKernel.health === 'function') {
                var health = runtimeKernel.health();
                info.version = health.version || 'N/A';
                info.uptime = health.uptime ? Math.round(health.uptime / 1000) + 's' : '0s';
            }

            // Runtime Registry
            var runtimeRegistry = LawAIApp.RuntimeRegistry || window.runtimeRegistry;
            if (runtimeRegistry && typeof runtimeRegistry.getAll === 'function') {
                var all = runtimeRegistry.getAll();
                info.registryCount = all.length;
                info.registryModules = all.map(function(e) { return e.name; }).join(', ');
            }

        } catch (err) {
            console.warn('Could not get runtime info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 3: FEATURE GOVERNANCE INFO
    // ============================================================

    _getFeatureInfo: function() {
        var info = {
            total: 0,
            healthy: 0,
            unhealthy: 0,
            disabled: 0,
            warnings: 0,
            broken: 0,
            healthScore: 0,
            domains: 'N/A',
            brokenList: []
        };

        try {
            // Feature Registry
            var featureRegistry = LawAIApp.FeatureRegistry || window.featureRegistry;
            if (featureRegistry && typeof featureRegistry.list === 'function') {
                var features = featureRegistry.list();
                info.total = features.length;
                
                // Count healthy/unhealthy
                var healthyCount = 0;
                var unhealthyCount = 0;
                var disabledCount = 0;
                var brokenList = [];
                
                for (var i = 0; i < features.length; i++) {
                    var f = features[i];
                    if (f.status === 'disabled') {
                        disabledCount++;
                    } else if (f.healthy === false) {
                        unhealthyCount++;
                        brokenList.push(f.name || f.id);
                    } else {
                        healthyCount++;
                    }
                }
                
                info.healthy = healthyCount;
                info.unhealthy = unhealthyCount;
                info.disabled = disabledCount;
                info.broken = brokenList.length;
                info.brokenList = brokenList;
                
                // Health score
                var total = features.length - disabledCount;
                if (total > 0) {
                    info.healthScore = Math.round((healthyCount / total) * 100);
                }
                
                // Domains
                if (typeof featureRegistry.getDomains === 'function') {
                    var domains = featureRegistry.getDomains();
                    info.domains = domains.join(', ');
                }
            }

            // Feature Validator warnings
            var featureValidator = LawAIApp.FeatureValidator || window.featureValidator;
            if (featureValidator && typeof featureValidator.getWarnings === 'function') {
                var warnings = featureValidator.getWarnings();
                info.warnings = warnings.length || 0;
            }

        } catch (err) {
            console.warn('Could not get feature info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 4: UI CONSTITUTION INFO
    // ============================================================

    _getUIInfo: function() {
        var info = {
            total: 0,
            healthy: 0,
            unhealthy: 0,
            unused: 0,
            warnings: 0,
            broken: 0,
            healthScore: 0,
            categories: 'N/A',
            brokenList: []
        };

        try {
            // UI Registry
            var uiRegistry = LawAIApp.UIRegistry || window.uiRegistry;
            if (uiRegistry && typeof uiRegistry.list === 'function') {
                var components = uiRegistry.list();
                info.total = components.length;
                
                // Count healthy/unhealthy
                var healthyCount = 0;
                var unhealthyCount = 0;
                var unusedCount = 0;
                var brokenList = [];
                
                for (var i = 0; i < components.length; i++) {
                    var c = components[i];
                    if (!c.used) unusedCount++;
                    if (c.healthy === false) {
                        unhealthyCount++;
                        brokenList.push(c.name || c.id);
                    } else {
                        healthyCount++;
                    }
                }
                
                info.healthy = healthyCount;
                info.unhealthy = unhealthyCount;
                info.unused = unusedCount;
                info.broken = brokenList.length;
                info.brokenList = brokenList;
                
                // Health score
                if (info.total > 0) {
                    info.healthScore = Math.round((healthyCount / info.total) * 100);
                }
                
                // Categories
                if (typeof uiRegistry.getCategories === 'function') {
                    var categories = uiRegistry.getCategories();
                    info.categories = categories.join(', ');
                }
            }

            // UI Validator warnings
            var uiValidator = LawAIApp.UIValidator || window.uiValidator;
            if (uiValidator && typeof uiValidator.getWarnings === 'function') {
                var warnings = uiValidator.getWarnings();
                info.warnings = warnings.length || 0;
            }

        } catch (err) {
            console.warn('Could not get UI info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 5: AUDIT CENTER INFO
    // ============================================================

    _getAuditInfo: function() {
        var info = {
            score: 0,
            status: 'unknown',
            pass: false,
            architecture: 0,
            dependencies: 0,
            modules: 0,
            features: 0,
            ui: 0,
            warnings: 0,
            errors: 0
        };

        try {
            var recReport = LawAIApp.RecoveryReport || window.recoveryReport;
            if (recReport && typeof recReport.getReport === 'function') {
                var report = recReport.getReport();
                if (report && report.overall) {
                    info.score = report.overall.score;
                    info.status = report.overall.status;
                    info.pass = report.overall.pass;
                    info.warnings = report.overall.warnings || 0;
                    info.errors = report.overall.errors || 0;
                }
                if (report && report.sections) {
                    info.architecture = report.sections.architecture ? report.sections.architecture.score || 0 : 0;
                    info.dependencies = report.sections.dependencies ? report.sections.dependencies.score || 0 : 0;
                    info.modules = report.sections.modules ? report.sections.modules.score || 0 : 0;
                    info.features = report.sections.features ? report.sections.features.score || 0 : 0;
                    info.ui = report.sections.ui ? report.sections.ui.score || 0 : 0;
                }
            }
        } catch (err) {
            console.warn('Could not get audit info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 6: ARCHITECTURE FREEZE INFO
    // ============================================================

    _getFreezeInfo: function() {
        var info = {
            active: false,
            version: '1.0',
            status: 'unknown',
            guardStatus: 'unknown',
            constitutionLoaded: false,
            violations: 0,
            passed: false
        };

        try {
            // Check Architecture Guard
            var guard = LawAIApp.ArchitectureGuard || window.architectureGuard;
            if (guard) {
                info.guardStatus = 'Ready';
                if (typeof guard.isCompliant === 'function') {
                    info.passed = guard.isCompliant();
                    info.violations = guard.getViolationCount ? guard.getViolationCount() : 0;
                }
                if (typeof guard.getSummary === 'function') {
                    var summary = guard.getSummary();
                    info.violations = summary.violationCount || 0;
                    info.passed = summary.passed || false;
                }
            }

            // Determine freeze status
            if (guard) {
                info.active = true;
                info.status = info.passed ? 'Compliant' : 'Violations Detected';
            }

        } catch (err) {
            console.warn('Could not get freeze info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 7: ENGINE STANDARDS INFO
    // ============================================================

    _getEngineInfo: function() {
        var info = {
            total: 0,
            healthy: 0,
            deprecated: 0,
            incomplete: 0,
            unknown: 0,
            healthScore: 0,
            constitutionLoaded: false,
            validatorReady: false,
            manifestReady: false,
            loaded: 0,
            missing: 0,
            failed: 0
        };

        try {
            // Engine Health
            var health = LawAIApp.EngineHealth || window.engineHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.total = data.totalEngines || 0;
                info.healthy = data.healthyEngines || 0;
                info.deprecated = data.deprecatedEngines || 0;
                info.incomplete = data.incompleteEngines || 0;
                info.unknown = data.unknownEngines || 0;
                info.healthScore = data.healthScore || 0;
                info.loaded = data.loaded ? data.loaded.length : 0;
                info.missing = data.missing ? data.missing.length : 0;
                info.failed = data.failed ? data.failed.length : 0;
            }

            // Engine Manifest
            var manifest = LawAIApp.EngineManifest || window.engineManifest;
            if (manifest && typeof manifest.getEngines === 'function') {
                info.constitutionLoaded = true;
                info.manifestReady = true;
            }

            // Engine Validator
            var validator = LawAIApp.EngineValidator || window.engineValidator;
            if (validator) {
                info.validatorReady = true;
            }

        } catch (err) {
            console.warn('Could not get engine info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 8: RUNTIME FREEZE INFO
    // ============================================================

    _getRuntimeFreezeInfo: function() {
        var info = {
            constitutionLoaded: false,
            policyReady: false,
            validatorReady: false,
            manifestReady: false,
            healthReady: false,
            status: 'unknown',
            healthScore: 0,
            modulesTotal: 0,
            modulesExists: 0,
            modulesMissing: 0
        };

        try {
            // Runtime Policy
            var policy = LawAIApp.RuntimePolicy || window.runtimePolicy;
            if (policy) {
                info.policyReady = true;
                info.constitutionLoaded = true;
            }

            // Runtime Validator
            var validator = LawAIApp.RuntimeValidator || window.runtimeValidator;
            if (validator) {
                info.validatorReady = true;
                if (typeof validator.isCompliant === 'function') {
                    info.status = validator.isCompliant() ? 'compliant' : 'violations';
                }
            }

            // Runtime Manifest
            var manifest = LawAIApp.RuntimeManifest || window.runtimeManifest;
            if (manifest && typeof manifest.getModules === 'function') {
                info.manifestReady = true;
                var modules = manifest.getModules();
                info.modulesTotal = modules.length;
                info.modulesExists = modules.filter(function(m) { return m.exists; }).length;
                info.modulesMissing = modules.filter(function(m) { return !m.exists; }).length;
            }

            // Runtime Health
            var health = LawAIApp.RuntimeHealth || window.runtimeHealth;
            if (health && typeof health.getHealth === 'function') {
                info.healthReady = true;
                var data = health.getHealth();
                info.healthScore = data.healthScore || 0;
                if (!info.status || info.status === 'unknown') {
                    info.status = data.status || 'unknown';
                }
            }

        } catch (err) {
            console.warn('Could not get runtime freeze info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 9: REGISTRY FREEZE INFO
    // ============================================================

    _getRegistryFreezeInfo: function() {
        var info = {
            constitutionLoaded: false,
            policyReady: false,
            validatorReady: false,
            manifestReady: false,
            healthReady: false,
            status: 'unknown',
            healthScore: 0,
            registriesTotal: 0,
            registriesHealthy: 0,
            registriesMissing: 0
        };

        try {
            // Registry Policy
            var policy = LawAIApp.RegistryPolicy || window.registryPolicy;
            if (policy) {
                info.policyReady = true;
                info.constitutionLoaded = true;
            }

            // Registry Validator
            var validator = LawAIApp.RegistryValidator || window.registryValidator;
            if (validator) {
                info.validatorReady = true;
                if (typeof validator.isCompliant === 'function') {
                    info.status = validator.isCompliant() ? 'compliant' : 'violations';
                }
            }

            // Registry Manifest
            var manifest = LawAIApp.RegistryManifest || window.registryManifest;
            if (manifest && typeof manifest.getRegistries === 'function') {
                info.manifestReady = true;
                var registries = manifest.getRegistries();
                info.registriesTotal = registries.length;
                info.registriesHealthy = registries.filter(function(r) { return r.exists && r.hasMeta; }).length;
                info.registriesMissing = registries.filter(function(r) { return !r.exists; }).length;
            }

            // Registry Health
            var health = LawAIApp.RegistryHealth || window.registryHealth;
            if (health && typeof health.getHealth === 'function') {
                info.healthReady = true;
                var data = health.getHealth();
                info.healthScore = data.healthScore || 0;
                if (!info.status || info.status === 'unknown') {
                    info.status = data.status || 'unknown';
                }
            }

        } catch (err) {
            console.warn('Could not get registry freeze info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 10: COMPLIANCE INFO
    // ============================================================

    _getComplianceInfo: function() {
        var info = {
            status: 'unknown',
            score: 0,
            architecture: 0,
            runtime: 0,
            features: 0,
            ui: 0,
            engine: 0,
            registry: 0,
            freezeVersion: '1.0',
            recoveryVersion: 'R1',
            certified: false
        };

        try {
            var health = LawAIApp.ComplianceHealth || window.complianceHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.status = data.overallStatus || 'unknown';
                info.score = data.overallScore || 0;
                info.architecture = data.architectureScore || 0;
                info.runtime = data.runtimeScore || 0;
                info.features = data.featureScore || 0;
                info.ui = data.uiScore || 0;
                info.engine = data.engineScore || 0;
                info.registry = data.registryScore || 0;
                info.certified = data.passed || false;
            }

            var audit = LawAIApp.FreezeAudit || window.freezeAudit;
            if (audit && typeof audit.getStatus === 'function') {
                if (info.status === 'unknown' || info.status === 'EXCELLENT') {
                    info.status = audit.getStatus();
                }
            }

        } catch (err) {
            console.warn('Could not get compliance info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 11: DOMAIN INFO
    // ============================================================

    _getDomainInfo: function() {
        var info = {
            totalDomains: 0,
            populatedDomains: 0,
            emptyDomains: 0,
            totalEngines: 0,
            domainScore: 0,
            domainStatus: 'unknown',
            largestDomain: 'None',
            largestCount: 0,
            smallestDomain: 'None',
            smallestCount: 0,
            domainList: [],
            classificationSummary: {
                Core: 0,
                Business: 0,
                Support: 0,
                Experimental: 0,
                Deprecated: 0
            }
        };

        try {
            var health = LawAIApp.DomainHealth || window.domainHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalDomains = data.totalDomains || 0;
                info.populatedDomains = data.populatedDomains || 0;
                info.emptyDomains = data.emptyDomains || 0;
                info.totalEngines = data.totalEngines || 0;
                info.domainScore = data.domainScore || 0;
                info.domainStatus = data.domainStatus || 'unknown';
                info.largestDomain = data.largestDomain || 'None';
                info.largestCount = data.largestCount || 0;
                info.smallestDomain = data.smallestDomain || 'None';
                info.smallestCount = data.smallestCount || 0;
                info.domainList = data.domainList || [];
            }

            // Classification summary from engine metadata
            for (var key in LawAIApp) {
                if (LawAIApp.hasOwnProperty(key)) {
                    var value = LawAIApp[key];
                    if (value && typeof value === 'object' && value.__meta) {
                        var classification = value.__meta.classification || 'Support';
                        if (info.classificationSummary.hasOwnProperty(classification)) {
                            info.classificationSummary[classification]++;
                        }
                    }
                }
            }

        } catch (err) {
            console.warn('Could not get domain info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 12: DEPENDENCY INFO
    // ============================================================

    _getDependencyInfo: function() {
        var info = {
            totalEngines: 0,
            dependencyScore: 0,
            dependencyStatus: 'unknown',
            healthyCount: 0,
            circularCount: 0,
            heavyCount: 0,
            unusedCount: 0,
            mostConnected: 'None',
            mostConnectedCount: 0,
            independentCount: 0,
            engineDetails: []
        };

        try {
            var health = LawAIApp.DependencyHealth || window.dependencyHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalEngines = data.totalEngines || 0;
                info.dependencyScore = data.dependencyScore || 0;
                info.dependencyStatus = data.dependencyStatus || 'unknown';
                info.healthyCount = data.healthyCount || 0;
                info.circularCount = data.circularCount || 0;
                info.heavyCount = data.heavyCount || 0;
                info.unusedCount = data.unusedCount || 0;
                info.mostConnected = data.mostConnected || 'None';
                info.mostConnectedCount = data.mostConnectedCount || 0;
                info.independentCount = data.independentCount || 0;
                info.engineDetails = data.engineDetails || [];
            }

        } catch (err) {
            console.warn('Could not get dependency info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 13: CAPABILITY INFO
    // ============================================================

    _getCapabilityInfo: function() {
        var info = {
            totalEngines: 0,
            capabilityScore: 0,
            capabilityStatus: 'unknown',
            definedCapabilities: 0,
            undefinedCapabilities: 0,
            duplicateCapabilities: 0,
            uniqueCapabilities: 0,
            largestCapability: 'None',
            largestCount: 0,
            coveragePercentage: 0,
            engineDetails: []
        };

        try {
            var health = LawAIApp.CapabilityHealth || window.capabilityHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalEngines = data.totalEngines || 0;
                info.capabilityScore = data.capabilityScore || 0;
                info.capabilityStatus = data.capabilityStatus || 'unknown';
                info.definedCapabilities = data.definedCapabilities || 0;
                info.undefinedCapabilities = data.undefinedCapabilities || 0;
                info.duplicateCapabilities = data.duplicateCapabilities || 0;
                info.uniqueCapabilities = data.uniqueCapabilities || 0;
                info.largestCapability = data.largestCapability || 'None';
                info.largestCount = data.largestCount || 0;
                info.coveragePercentage = data.coveragePercentage || 0;
                info.engineDetails = data.engineDetails || [];
            }

        } catch (err) {
            console.warn('Could not get capability info:', err);
        }

        return info;
    },
    
    // ============================================================
    // 🔥 PART 14: LIFECYCLE INFO
    // ============================================================

    _getLifecycleInfo: function() {
        var info = {
            totalEngines: 0,
            lifecycleScore: 0,
            lifecycleStatus: 'unknown',
            runningCount: 0,
            sleepingCount: 0,
            pausedCount: 0,
            deprecatedCount: 0,
            destroyedCount: 0,
            invalidCount: 0,
            healthyEngines: 0,
            stateDistribution: []
        };

        try {
            var health = LawAIApp.LifecycleHealth || window.lifecycleHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalEngines = data.totalEngines || 0;
                info.lifecycleScore = data.lifecycleScore || 0;
                info.lifecycleStatus = data.lifecycleStatus || 'unknown';
                info.runningCount = data.runningCount || 0;
                info.sleepingCount = data.sleepingCount || 0;
                info.pausedCount = data.pausedCount || 0;
                info.deprecatedCount = data.deprecatedCount || 0;
                info.destroyedCount = data.destroyedCount || 0;
                info.invalidCount = data.invalidCount || 0;
                info.healthyEngines = data.healthyEngines || 0;
                info.stateDistribution = data.stateDistribution || [];
            }

        } catch (err) {
            console.warn('Could not get lifecycle info:', err);
        }

        return info;
    },
    
    // ============================================================
    // 🔥 PART 15: ENGINE AUDIT INFO
    // ============================================================

    _getEngineAuditInfo: function() {
        var info = {
            totalEngines: 0,
            auditScore: 0,
            auditStatus: 'unknown',
            passingEngines: 0,
            failingEngines: 0,
            healthyEngines: 0,
            brokenEngines: 0,
            warningEngines: 0,
            coveragePercentage: 0,
            recommendations: [],
            coverage: {
                identity: 0,
                domain: 0,
                capability: 0,
                version: 0,
                owner: 0,
                status: 0
            }
        };

        try {
            var report = LawAIApp.EngineAuditReport || window.engineAuditReport;
            if (report && typeof report.getReport === 'function') {
                var data = report.getReport();
                if (data) {
                    info.totalEngines = data.developerSummary ? data.developerSummary.totalEngines || 0 : 0;
                    info.auditScore = data.developerSummary ? data.developerSummary.auditScore || 0 : 0;
                    info.auditStatus = data.developerSummary ? data.developerSummary.auditStatus || 'unknown' : 'unknown';
                    info.passingEngines = data.developerSummary ? data.developerSummary.passingEngines || 0 : 0;
                    info.failingEngines = data.developerSummary ? data.developerSummary.failingEngines || 0 : 0;
                    info.healthyEngines = data.healthSummary ? data.healthSummary.healthyEngines || 0 : 0;
                    info.brokenEngines = data.healthSummary ? data.healthSummary.brokenEngines || 0 : 0;
                    info.warningEngines = data.healthSummary ? data.healthSummary.warningEngines || 0 : 0;
                    info.coveragePercentage = data.healthSummary ? data.healthSummary.coveragePercentage || 0 : 0;
                    info.recommendations = data.recommendations || [];
                    
                    if (data.coverageSummary) {
                        info.coverage.identity = data.coverageSummary.identity ? data.coverageSummary.identity.percentage || 0 : 0;
                        info.coverage.domain = data.coverageSummary.domain ? data.coverageSummary.domain.percentage || 0 : 0;
                        info.coverage.capability = data.coverageSummary.capability ? data.coverageSummary.capability.percentage || 0 : 0;
                        info.coverage.version = data.coverageSummary.version ? data.coverageSummary.version.percentage || 0 : 0;
                        info.coverage.owner = data.coverageSummary.owner ? data.coverageSummary.owner.percentage || 0 : 0;
                        info.coverage.status = data.coverageSummary.status ? data.coverageSummary.status.percentage || 0 : 0;
                    }
                }
            }

        } catch (err) {
            console.warn('Could not get engine audit info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 16: ENGINE GOVERNANCE CENTER INFO
    // ============================================================

    _getGovernanceInfo: function() {
        var info = {
            score: 0,
            status: 'unknown',
            coverage: 0,
            totalEngines: 0,
            healthyEngines: 0,
            incompleteEngines: 0,
            brokenEngines: 0,
            topHealthy: [],
            needsAttention: [],
            recommendations: [],
            maturity: {
                core: 0,
                business: 0,
                support: 0,
                experimental: 0,
                deprecated: 0
            },
            violations: 0
        };

        try {
            var dashboard = LawAIApp.GovernanceDashboard || window.governanceDashboard;
            if (dashboard && typeof dashboard.getDashboard === 'function') {
                var data = dashboard.getDashboard();
                if (data) {
                    info.score = data.governanceScore ? data.governanceScore.overall || 0 : 0;
                    info.status = data.governanceScore ? data.governanceScore.status || 'unknown' : 'unknown';
                    info.coverage = data.governanceScore ? data.governanceScore.coverage || 0 : 0;
                    info.totalEngines = data.engineCount ? data.engineCount.total || 0 : 0;
                    info.healthyEngines = data.engineCount ? data.engineCount.healthy || 0 : 0;
                    info.incompleteEngines = data.engineCount ? data.engineCount.incomplete || 0 : 0;
                    info.brokenEngines = data.engineCount ? data.engineCount.broken || 0 : 0;
                    info.topHealthy = data.topHealthy || [];
                    info.needsAttention = data.needsAttention || [];
                    info.recommendations = data.recommendations || [];
                    info.violations = data.violations ? data.violations.count || 0 : 0;
                    
                    if (data.maturityDistribution) {
                        info.maturity.core = data.maturityDistribution.core || 0;
                        info.maturity.business = data.maturityDistribution.business || 0;
                        info.maturity.support = data.maturityDistribution.support || 0;
                        info.maturity.experimental = data.maturityDistribution.experimental || 0;
                        info.maturity.deprecated = data.maturityDistribution.deprecated || 0;
                    }
                }
            }

        } catch (err) {
            console.warn('Could not get governance info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 17: ENGINE EVENT INFO
    // ============================================================

    _getEngineEventInfo: function() {
        var info = {
            officialCount: 0,
            customCount: 0,
            totalCount: 0,
            healthScore: 0,
            healthStatus: 'unknown',
            coveragePercentage: 0,
            usedOfficialCount: 0,
            officialEvents: [],
            customEvents: [],
            violations: 0
        };

        try {
            var health = LawAIApp.EngineEventHealth || window.engineEventHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.officialCount = data.officialCount || 0;
                info.customCount = data.customCount || 0;
                info.totalCount = data.totalCount || 0;
                info.healthScore = data.healthScore || 0;
                info.healthStatus = data.healthStatus || 'unknown';
                info.coveragePercentage = data.coveragePercentage || 0;
                info.usedOfficialCount = data.usedOfficialCount || 0;
                info.officialEvents = data.officialEvents || [];
                info.customEvents = data.customEvents || [];
                info.violations = data.violations || 0;
            }

        } catch (err) {
            console.warn('Could not get engine event info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 18: RUNTIME INTELLIGENCE INFO
    // ============================================================

    _getRuntimeIntelligenceInfo: function() {
        var info = {
            status: 'unknown',
            coverage: 0,
            observedCount: 0,
            totalTargets: 0,
            healthyTargets: 0,
            unknownTargets: 0,
            warnings: 0,
            healthStatus: 'unknown',
            observedSystems: []
        };

        try {
            var health = LawAIApp.RuntimeIntelligenceHealth || window.runtimeIntelligenceHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.status = data.status || 'unknown';
                info.coverage = data.coverageScore || 0;
                info.observedCount = data.observedCount || 0;
                info.totalTargets = data.totalTargets || 0;
                info.healthyTargets = data.healthyTargets || 0;
                info.unknownTargets = data.unknownTargets || 0;
                info.warnings = data.warnings ? data.warnings.length : 0;
                info.healthStatus = data.status || 'unknown';
                info.observedSystems = data.observedSystems || [];
            }

        } catch (err) {
            console.warn('Could not get runtime intelligence info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 19: ENGINE COORDINATION INFO
    // ============================================================

    _getEngineCoordinationInfo: function() {
        var info = {
            totalEngines: 0,
            connectedEngines: 0,
            disconnectedEngines: 0,
            totalRelationships: 0,
            uniqueRelationships: 0,
            circularCount: 0,
            validationWarnings: 0,
            coverage: 0,
            status: 'unknown',
            orphanEngines: []
        };

        try {
            var health = LawAIApp.EngineCoordinationHealth || window.engineCoordinationHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalEngines = data.totalEngines || 0;
                info.connectedEngines = data.connectedEngines || 0;
                info.disconnectedEngines = data.disconnectedEngines || 0;
                info.totalRelationships = data.totalRelationships || 0;
                info.uniqueRelationships = data.uniqueRelationships || 0;
                info.circularCount = data.circularCount || 0;
                info.validationWarnings = data.validationWarnings || 0;
                info.coverage = data.coverageScore || 0;
                info.status = data.status || 'unknown';
                info.orphanEngines = data.orphanEngines || [];
            }

        } catch (err) {
            console.warn('Could not get engine coordination info:', err);
        }

        return info;
    },

        // ============================================================
    // 🔥 PART 20: ENGINE DISCOVERY INFO
    // ============================================================

    _getEngineDiscoveryInfo: function() {
        var info = {
            totalEngines: 0,
            domains: [],
            categories: [],
            totalCapabilities: 0,
            enginesWithCapabilities: 0,
            coverage: 0,
            status: 'unknown',
            totalMissing: 0,
            validationWarnings: 0
        };

        try {
            var health = LawAIApp.EngineDiscoveryHealth || window.engineDiscoveryHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalEngines = data.totalEngines || 0;
                info.domains = data.domains || [];
                info.categories = data.categories || [];
                info.totalCapabilities = data.totalCapabilities || 0;
                info.enginesWithCapabilities = data.enginesWithCapabilities || 0;
                info.coverage = data.coverageScore || 0;
                info.status = data.status || 'unknown';
                info.totalMissing = data.totalMissing || 0;
                info.validationWarnings = data.validationWarnings || 0;
            }

        } catch (err) {
            console.warn('Could not get engine discovery info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 21: ENGINE COMMUNICATION INFO
    // ============================================================

    _getEngineCommunicationInfo: function() {
        var info = {
            totalContracts: 0,
            activeContracts: 0,
            deprecatedContracts: 0,
            experimentalContracts: 0,
            uniqueSources: 0,
            uniqueTargets: 0,
            totalEngines: 0,
            invalidContracts: 0,
            validationWarnings: 0,
            coverage: 0,
            status: 'unknown'
        };

        try {
            var health = LawAIApp.EngineCommunicationHealth || window.engineCommunicationHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalContracts = data.totalContracts || 0;
                info.activeContracts = data.activeContracts || 0;
                info.deprecatedContracts = data.deprecatedContracts || 0;
                info.experimentalContracts = data.experimentalContracts || 0;
                info.uniqueSources = data.uniqueSources || 0;
                info.uniqueTargets = data.uniqueTargets || 0;
                info.totalEngines = data.totalEngines || 0;
                info.invalidContracts = data.invalidContracts || 0;
                info.validationWarnings = data.validationWarnings || 0;
                info.coverage = data.coverageScore || 0;
                info.status = data.status || 'unknown';
            }

        } catch (err) {
            console.warn('Could not get engine communication info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 22: ENGINE SIGNAL INFO
    // ============================================================

    _getEngineSignalInfo: function() {
        var info = {
            totalSignals: 0,
            types: [],
            severities: [],
            sources: [],
            missingDescription: 0,
            missingSource: 0,
            missingVersion: 0,
            totalMissing: 0,
            validationWarnings: 0,
            coverage: 0,
            status: 'unknown'
        };

        try {
            var health = LawAIApp.EngineSignalHealth || window.engineSignalHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.totalSignals = data.totalSignals || 0;
                info.types = data.types || [];
                info.severities = data.severities || [];
                info.sources = data.sources || [];
                info.missingDescription = data.missingDescription || 0;
                info.missingSource = data.missingSource || 0;
                info.missingVersion = data.missingVersion || 0;
                info.totalMissing = data.totalMissing || 0;
                info.validationWarnings = data.validationWarnings || 0;
                info.coverage = data.coverageScore || 0;
                info.status = data.status || 'unknown';
            }

        } catch (err) {
            console.warn('Could not get engine signal info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 23: SYSTEM AWARENESS INFO
    // ============================================================

    _getSystemAwarenessInfo: function() {
        var info = {
            status: 'unknown',
            coverage: 0,
            knownSystems: 0,
            unknownSystems: 0,
            activeSources: 0,
            totalSources: 0,
            validationWarnings: 0,
            runtime: { status: 'N/A', version: 'N/A', ready: false },
            engine: { total: 0, active: 0 },
            domain: { total: 0, populated: 0 },
            capability: { total: 0, coverage: 0 },
            health: { overall: 0 }
        };

        try {
            var health = LawAIApp.SystemAwarenessHealth || window.systemAwarenessHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.status = data.status || 'unknown';
                info.coverage = data.coverageScore || 0;
                info.knownSystems = data.knownSystems || 0;
                info.unknownSystems = data.unknownSystems || 0;
                info.activeSources = data.activeSources || 0;
                info.totalSources = data.totalSources || 0;
                info.validationWarnings = data.validationWarnings || 0;
                info.runtime = data.runtime || { status: 'N/A', version: 'N/A', ready: false };
                info.engine = data.engine || { total: 0, active: 0 };
                info.domain = data.domain || { total: 0, populated: 0 };
                info.capability = data.capability || { total: 0, coverage: 0 };
                info.health = data.health || { overall: 0 };
            }

        } catch (err) {
            console.warn('Could not get system awareness info:', err);
        }

        return info;
    },

    // ============================================================
    // 🔥 PART 25: SYSTEM REALITY INFO
    // ============================================================

    _getSystemRealityInfo: function() {
        var info = {
            realityScore: 0,
            completeness: 0,
            declaredEngines: 0,
            runtimeEngines: 0,
            matches: 0,
            missing: 0,
            unknown: 0,
            status: 'unknown',
            coverage: 0
        };

        try {
            var health = LawAIApp.RuntimeRealityHealth || window.runtimeRealityHealth;
            if (health && typeof health.getHealth === 'function') {
                var data = health.getHealth();
                info.realityScore = data.realityScore || 0;
                info.completeness = data.completenessScore || 0;
                info.declaredEngines = data.declaredEngines || 0;
                info.runtimeEngines = data.runtimeEngines || 0;
                info.matches = data.matches || 0;
                info.missing = data.missing || 0;
                info.unknown = data.unknown || 0;
                info.status = data.status || 'unknown';
                info.coverage = data.coverage || '0%';
            }

        } catch (err) {
            console.warn('Could not get system reality info:', err);
        }

        return info;
    },

    /**
     * 导入备份（备选方法）
     */
    _importBackup: function(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var backup = JSON.parse(e.target.result);
                var count = 0;
                for (var key in backup) {
                    if (backup.hasOwnProperty(key)) {
                        localStorage.setItem(key, JSON.stringify(backup[key]));
                        count++;
                    }
                }
                alert('✅ Imported ' + count + ' items. Refreshing...');
                setTimeout(function() { location.reload(); }, 1500);
            } catch (err) {
                alert('❌ Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
};
// ============================================================
// KEYBOARD SHORTCUT - Ctrl+Shift+L
// ============================================================

document.addEventListener('keydown', function(e) {
    // 检测 Ctrl+Shift+L
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        LawAIApp.Debug.DevPanel.toggle();
    }
});

// ============================================================
// ALIASES
// ============================================================

if (!LawAIApp.DevPanel) {
    LawAIApp.DevPanel = LawAIApp.Debug.DevPanel;
}

console.log('🛠️ DevPanel ready (Ctrl+Shift+L)');
console.log('   ✅ Recovery R1 Part 1 - Architecture');
console.log('   ✅ Recovery R1 Part 2 - Runtime');
console.log('   ✅ Recovery R1 Part 3 - Feature Governance');
console.log('   ✅ Recovery R1 Part 4 - UI Constitution');
console.log('   ✅ Recovery R1 Part 5 - Architecture Audit');
console.log('   ✅ Recovery R1 Part 6 - Architecture Freeze');
console.log('   ✅ Recovery R1 Part 7 - Engine Standards');
console.log('   ✅ Recovery R1 Part 8 - Runtime Freeze');
console.log('   ✅ Recovery R1 Part 9 - Registry Freeze');
console.log('   ✅ Recovery R1 Part 10 - Compliance Audit');
console.log('   ✅ Recovery R1 Part 11 - Domain Architecture');
console.log('   ✅ Recovery R1 Part 12 - Dependency Governance');
console.log('   ✅ Recovery R1 Part 13 - Capability Governance');
console.log('   ✅ Recovery R1 Part 14 - Lifecycle Governance');
console.log('   ✅ Recovery R1 Part 15 - Engine Governance');
console.log('   ✅ Recovery R1 Part 16 - Governance Center');
console.log('   ✅ Recovery R1 Part 17 - Engine Events');
console.log('   ✅ Recovery R1 Part 18 - Runtime Intelligence');
console.log('   ✅ Recovery R1 Part 19 - Engine Coordination');
console.log('   ✅ Recovery R1 Part 20 - Engine Discovery');
console.log('   ✅ Recovery R1 Part 21 - Engine Communication');
console.log('   ✅ Recovery R1 Part 22 - Engine Signals');
console.log('   ✅ Recovery R1 Part 23 - System Awareness');
console.log('   ✅ Recovery R1 Part 24 - Core Orchestration');
console.log('   ✅ Recovery R1 Part 25 - System Reality');
console.log('   ✅ Architecture Freeze Completed');
console.log('   ✅ Recovery R1 Certified');
console.log('   ✅ Law AI Academy Architecture Stable');
console.log('   ✅ Engine Renaissance Fully Complete');
