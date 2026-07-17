/**
 * Dependency Health
 * 
 * Generates dependency health reports.
 * Developer tool only.
 */

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DependencyHealth = {
    initialized: false,
    healthData: null,

    /**
     * Initialize health tracker
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[DependencyHealth] Initialized.');
        this.scan();
    },

    /**
     * Scan dependency health
     * @returns {Object} Health data
     */
    scan: function() {
        console.log('[DependencyHealth] Scanning dependencies...');

        var manifest = LawAIApp.DependencyManifest || window.dependencyManifest;
        if (!manifest || typeof manifest.getEngines !== 'function') {
            console.warn('[DependencyHealth] DependencyManifest not available.');
            return null;
        }

        var engines = manifest.getEngines();
        var circular = manifest.getCircular();
        var independent = manifest.getIndependent();
        var mostConnected = manifest.getMostConnected();
        var summary = manifest.getSummary();

        var totalEngines = engines.length;
        var healthyCount = 0;
        var circularCount = circular.length;
        var heavyCount = 0;
        var unusedCount = 0;
        var brokenCount = 0;

        var engineDetails = [];
        for (var i = 0; i < engines.length; i++) {
            var e = engines[i];
            var isHealthy = !e.hasCircular && e.dependencyCount > 0;
            var isHeavy = e.dependencyCount >= 5;
            var isUnused = e.usedByCount === 0 && e.dependencyCount > 0;

            if (isHealthy) healthyCount++;
            if (isHeavy) heavyCount++;
            if (isUnused) unusedCount++;
            if (e.hasCircular) circularCount++;

            engineDetails.push({
                name: e.name,
                dependsOn: e.dependsOn,
                usedBy: e.usedBy,
                dependencyCount: e.dependencyCount,
                usedByCount: e.usedByCount,
                isHealthy: isHealthy,
                isHeavy: isHeavy,
                isUnused: isUnused,
                hasCircular: e.hasCircular
            });
        }

        // Calculate dependency score
        var maxScore = totalEngines * 100;
        var score = 0;
        for (var j = 0; j < engineDetails.length; j++) {
            var d = engineDetails[j];
            if (d.isHealthy) score += 100;
            else if (d.hasCircular) score += 20;
            else if (d.isUnused) score += 40;
            else score += 60;
        }
        var dependencyScore = totalEngines > 0 ? Math.round(score / totalEngines) : 0;

        var status = 'EXCELLENT';
        if (dependencyScore >= 80 && circularCount === 0) {
            status = 'EXCELLENT';
        } else if (dependencyScore >= 60) {
            status = 'GOOD';
        } else if (dependencyScore >= 40) {
            status = 'DEGRADED';
        } else {
            status = 'CRITICAL';
        }

        this.healthData = {
            timestamp: Date.now(),
            dependencyScore: dependencyScore,
            dependencyStatus: status,
            totalEngines: totalEngines,
            healthyCount: healthyCount,
            circularCount: circularCount,
            heavyCount: heavyCount,
            unusedCount: unusedCount,
            brokenCount: brokenCount,
            mostConnected: mostConnected ? mostConnected.name : 'None',
            mostConnectedCount: mostConnected ? (mostConnected.dependencyCount + mostConnected.usedByCount) : 0,
            independentCount: independent.length,
            engineDetails: engineDetails,
            summary: summary
        };

        this._display();
        return this.healthData;
    },

    /**
     * Display health report
     * @private
     */
    _display: function() {
        var h = this.healthData;
        console.log('═══════════════════════════════════════');
        console.log('   DEPENDENCY HEALTH');
        console.log('═══════════════════════════════════════');
        console.log('Dependency Score: ' + h.dependencyScore + '% (' + h.dependencyStatus + ')');
        console.log('Total Engines: ' + h.totalEngines);
        console.log('✅ Healthy: ' + h.healthyCount);
        console.log('🔄 Circular: ' + h.circularCount);
        console.log('📦 Heavy (5+ deps): ' + h.heavyCount);
        console.log('📭 Unused: ' + h.unusedCount);
        console.log('─────────────────────────────────────');
        console.log('Most Connected: ' + h.mostConnected + ' (' + h.mostConnectedCount + ' connections)');
        console.log('Independent Engines: ' + h.independentCount);
        console.log('─────────────────────────────────────');

        if (h.circularCount > 0) {
            console.warn('Circular Dependencies Found:');
            for (var i = 0; i < h.engineDetails.length; i++) {
                if (h.engineDetails[i].hasCircular) {
                    console.warn('  ⚠️ ' + h.engineDetails[i].name);
                }
            }
        }

        if (h.unusedCount > 0) {
            console.warn('Unused Engines:');
            for (var j = 0; j < h.engineDetails.length; j++) {
                if (h.engineDetails[j].isUnused) {
                    console.warn('  📭 ' + h.engineDetails[j].name);
                }
            }
        }

        if (h.circularCount === 0 && h.unusedCount === 0) {
            console.log('✅ All dependencies are healthy.');
        }
        console.log('═══════════════════════════════════════');
    },

    /**
     * Get health data
     * @returns {Object} Health data
     */
    getHealth: function() {
        if (!this.healthData) this.scan();
        return this.healthData;
    },

    /**
     * Get dependency score
     * @returns {number} Dependency score
     */
    getScore: function() {
        if (!this.healthData) this.scan();
        return this.healthData.dependencyScore;
    },

    /**
     * Get dependency status
     * @returns {string} Dependency status
     */
    getStatus: function() {
        if (!this.healthData) this.scan();
        return this.healthData.dependencyStatus;
    },

    /**
     * Check if dependencies are healthy
     * @returns {boolean}
     */
    isHealthy: function() {
        if (!this.healthData) this.scan();
        return this.healthData.circularCount === 0 && this.healthData.dependencyScore >= 80;
    },

    /**
     * Get summary
     * @returns {Object} Summary
     */
    getSummary: function() {
        if (!this.healthData) this.scan();
        return {
            score: this.healthData.dependencyScore,
            status: this.healthData.dependencyStatus,
            totalEngines: this.healthData.totalEngines,
            circularCount: this.healthData.circularCount,
            healthyCount: this.healthData.healthyCount,
            unusedCount: this.healthData.unusedCount
        };
    }
};

// 暴露到全局
window.dependencyHealth = LawAIApp.DependencyHealth;

console.log('📋 DependencyHealth ready');
