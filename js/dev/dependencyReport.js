// ================================================================
// dependencyReport.js – Dependency Report V1.0.0
// 生成可读的依赖关系报告
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.DependencyReport = {
    _generated: false,

    /**
     * 生成并输出依赖报告
     */
    generate: function() {
        var inspector = LawAIApp.DevTools.DependencyInspector;
        if (!inspector) {
            console.warn('⚠️ DependencyInspector not available');
            return;
        }

        var data = inspector.getData();
        this._generated = true;

        console.log('%c=====================================', 'font-weight:bold;color:#8b5cf6;');
        console.log('%c    LAW AI DEPENDENCY REPORT        ', 'font-weight:bold;color:#8b5cf6;');
        console.log('%c=====================================', 'font-weight:bold;color:#8b5cf6;');
        console.log('');

        // 1. 依赖树
        console.log('%c🌳 Dependency Tree', 'font-weight:bold;color:#e2e8f0;');
        var nodes = data.nodes;
        var engineNames = Object.keys(nodes);
        if (engineNames.length > 0) {
            // 找根节点（没有依赖的）
            var roots = engineNames.filter(function(name) {
                return nodes[name].deps.length === 0;
            });
            if (roots.length === 0 && engineNames.length > 0) {
                roots = [engineNames[0]];
            }
            for (var i = 0; i < Math.min(roots.length, 3); i++) {
                var tree = inspector.getDependencyTree(roots[i]);
                if (tree) {
                    this._printTree(tree, '', true);
                }
            }
            if (roots.length > 3) {
                console.log('  ... and ' + (roots.length - 3) + ' more root nodes');
            }
        } else {
            console.log('  %c(No engine data collected)', 'color:#64748b;');
        }
        console.log('');

        // 2. 关键路径
        console.log('%c🛤️ Critical Path', 'font-weight:bold;color:#e2e8f0;');
        var criticalPath = data.criticalPath || [];
        if (criticalPath.length > 0) {
            var pathStr = criticalPath.join(' → ');
            console.log('  ' + pathStr);
            console.log('  %cDepth: ' + criticalPath.length, 'color:#64748b;');
        } else {
            console.log('  %c(No critical path data)', 'color:#64748b;');
        }
        console.log('');

        // 3. 阻塞引擎
        console.log('%c🚫 Blocking Engines', 'font-weight:bold;color:#e2e8f0;');
        var blocking = data.blockingEngines || {};
        var blockingNames = Object.keys(blocking);
        if (blockingNames.length > 0) {
            var sorted = blockingNames.sort(function(a, b) {
                return blocking[b].duration - blocking[a].duration;
            });
            for (var i = 0; i < Math.min(sorted.length, 5); i++) {
                var name = sorted[i];
                var info = blocking[name];
                var color = info.duration > 200 ? '#ef4444' : info.duration > 100 ? '#f59e0b' : '#22c55e';
                console.log(
                    '  ' + name + 
                    '  %c' + Math.round(info.duration) + 'ms' + 
                    '  (deps: ' + info.depCount + ')',
                    'color:' + color + ';'
                );
            }
            if (sorted.length > 5) {
                console.log('  ... and ' + (sorted.length - 5) + ' more');
            }
        } else {
            console.log('  %c(No blocking engines detected)', 'color:#64748b;');
        }
        console.log('');

        // 4. 循环依赖
        console.log('%c🔄 Circular Dependencies', 'font-weight:bold;color:#e2e8f0;');
        var circular = data.circularDependencies || [];
        if (circular.length > 0) {
            for (var i = 0; i < circular.length; i++) {
                console.log('  ⚠️ ' + circular[i].join(' → '));
            }
        } else {
            console.log('  %c✅ None detected', 'color:#22c55e;');
        }
        console.log('');

        // 5. 执行链摘要
        console.log('%c📋 Execution Chain', 'font-weight:bold;color:#e2e8f0;');
        var chain = data.executionChain || [];
        if (chain.length > 0) {
            var chainStr = chain.map(function(c) {
                return c.callee;
            }).join(' → ');
            console.log('  ' + chainStr);
            console.log('  %cTotal steps: ' + chain.length, 'color:#64748b;');
        } else {
            console.log('  %c(No execution chain data)', 'color:#64748b;');
        }
        console.log('');

        // 6. 统计摘要
        console.log('%c📊 Summary', 'font-weight:bold;color:#e2e8f0;');
        var totalEngines = Object.keys(nodes).length;
        var totalDeps = 0;
        for (var name in nodes) {
            totalDeps += nodes[name].deps.length;
        }
        var avgDeps = totalEngines > 0 ? (totalDeps / totalEngines).toFixed(1) : 0;
        console.log('  Total Engines:  ' + totalEngines);
        console.log('  Total Dependencies: ' + totalDeps);
        console.log('  Avg Dependencies: ' + avgDeps);
        console.log('  Max Depth:      ' + (criticalPath.length || 0));
        console.log('  Circular:       ' + (circular.length > 0 ? '⚠️ ' + circular.length + ' detected' : '✅ None'));
        console.log('');

        console.log('%c=====================================', 'font-weight:bold;color:#8b5cf6;');
        console.log('%c  Report generated at: ' + new Date().toLocaleTimeString(), 'color:#64748b;');
        console.log('%c=====================================', 'font-weight:bold;color:#8b5cf6;');

        return data;
    },

    /**
     * 打印依赖树（递归）
     */
    _printTree: function(node, prefix, isLast) {
        var marker = isLast ? '└── ' : '├── ';
        var durationStr = node.duration > 0 ? ' (' + node.duration + 'ms)' : '';
        var statusIcon = node.status === 'completed' ? '✅' : node.status === 'running' ? '⏳' : '⏸️';
        console.log(prefix + marker + node.name + durationStr + ' ' + statusIcon);
        
        var children = node.children || [];
        var childPrefix = prefix + (isLast ? '    ' : '│   ');
        for (var i = 0; i < children.length; i++) {
            var isChildLast = (i === children.length - 1);
            this._printTree(children[i], childPrefix, isChildLast);
        }
    },

    /**
     * 检查是否已生成报告
     */
    isGenerated: function() {
        return this._generated;
    }
};

console.log('📊 DependencyReport V1.0.0 ready');
