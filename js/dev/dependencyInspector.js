// ================================================================
// dependencyInspector.js – Dependency Inspector V1.0.0
// 追踪引擎之间的依赖关系、执行链、阻塞检测、循环依赖
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.DevTools = LawAIApp.DevTools || {};

LawAIApp.DevTools.DependencyInspector = {
    _enabled: true,
    _nodes: {},           // { engineName: { id, deps, dependents, startTime, endTime, duration, status } }
    _edges: [],           // [ { from, to, timestamp } ]
    _executionChain: [],  // [ { caller, callee, timestamp } ]
    _currentStack: [],    // 当前调用栈（用于检测循环依赖）
    _circularDependencies: [],
    _blockingEngines: {},
    _criticalPath: [],
    _initialized: false,

    /**
     * 初始化
     */
    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🔗 DependencyInspector initialized');
    },

    /**
     * 注册引擎节点
     */
    registerNode: function(name, metadata) {
        if (!this._enabled) return;
        if (!this._nodes[name]) {
            this._nodes[name] = {
                id: name,
                deps: [],
                dependents: [],
                startTime: null,
                endTime: null,
                duration: 0,
                status: 'pending', // 'pending' | 'running' | 'completed' | 'failed'
                metadata: metadata || {},
                depth: 0
            };
        }
        return this._nodes[name];
    },

    /**
     * 标记引擎开始
     */
    startEngine: function(name, startTime) {
        if (!this._enabled) return;
        var node = this.registerNode(name);
        node.startTime = startTime || performance.now();
        node.status = 'running';
        // 记录当前栈深度
        node.depth = this._currentStack.length;
        this._currentStack.push(name);
        this._executionChain.push({
            caller: this._currentStack.length > 1 ? this._currentStack[this._currentStack.length - 2] : null,
            callee: name,
            timestamp: node.startTime
        });
    },

    /**
     * 标记引擎结束
     */
    endEngine: function(name, endTime) {
        if (!this._enabled) return;
        var node = this._nodes[name];
        if (!node) return;
        node.endTime = endTime || performance.now();
        node.duration = node.endTime - node.startTime;
        node.status = 'completed';
        // 从栈中移除
        var idx = this._currentStack.indexOf(name);
        if (idx !== -1) {
            this._currentStack.splice(idx, 1);
        }
        // 检测循环依赖
        this._detectCircularDependencies();
    },

    /**
     * 记录依赖关系
     */
    addDependency: function(from, to) {
        if (!this._enabled) return;
        if (from === to) {
            console.warn('⚠️ Self-dependency detected:', from);
            return;
        }
        // 注册两个节点
        var fromNode = this.registerNode(from);
        var toNode = this.registerNode(to);
        
        // 检查是否已存在该依赖
        if (fromNode.deps.indexOf(to) === -1) {
            fromNode.deps.push(to);
        }
        if (toNode.dependents.indexOf(from) === -1) {
            toNode.dependents.push(from);
        }
        
        this._edges.push({
            from: from,
            to: to,
            timestamp: performance.now()
        });
        
        // 检测循环依赖
        this._detectCircularDependencies();
    },

    /**
     * 检测循环依赖
     */
    _detectCircularDependencies: function() {
        this._circularDependencies = [];
        var visited = {};
        var recStack = {};
        var nodes = Object.keys(this._nodes);

        function dfs(node, stack) {
            if (recStack[node]) {
                // 找到循环
                var cycleStart = stack.indexOf(node);
                var cycle = stack.slice(cycleStart);
                cycle.push(node);
                this._circularDependencies.push(cycle);
                return;
            }
            if (visited[node]) return;
            
            visited[node] = true;
            recStack[node] = true;
            stack.push(node);
            
            var deps = this._nodes[node]?.deps || [];
            for (var i = 0; i < deps.length; i++) {
                dfs.call(this, deps[i], stack.slice());
            }
            
            recStack[node] = false;
        }

        for (var i = 0; i < nodes.length; i++) {
            if (!visited[nodes[i]]) {
                dfs.call(this, nodes[i], []);
            }
        }

        if (this._circularDependencies.length > 0) {
            console.warn('⚠️ Circular dependencies detected:', this._circularDependencies);
        }
    },

    /**
     * 检测阻塞引擎
     */
    detectBlocking: function() {
        this._blockingEngines = {};
        var allDurations = [];
        
        for (var name in this._nodes) {
            var node = this._nodes[name];
            if (node.duration > 0) {
                allDurations.push({ name: name, duration: node.duration });
            }
        }
        
        // 按持续时间排序
        allDurations.sort(function(a, b) { return b.duration - a.duration; });
        
        // 标记阻塞引擎（持续时间和依赖数量综合评估）
        for (var i = 0; i < allDurations.length; i++) {
            var item = allDurations[i];
            var node = this._nodes[item.name];
            var score = item.duration + (node.deps.length * 5);
            // 如果持续时间 > 100ms 或有多个依赖，视为潜在阻塞
            if (item.duration > 100 || node.deps.length > 3) {
                this._blockingEngines[item.name] = {
                    duration: item.duration,
                    depCount: node.deps.length,
                    dependentCount: node.dependents.length,
                    score: score,
                    isBlocking: item.duration > 100
                };
            }
        }
        
        return this._blockingEngines;
    },

    /**
     * 计算关键路径（最长的启动链）
     */
    calculateCriticalPath: function() {
        // 构建依赖图，找到最长路径
        var nodes = this._nodes;
        var inDegree = {};
        var graph = {};
        
        for (var name in nodes) {
            graph[name] = nodes[name].deps.slice();
            inDegree[name] = nodes[name].deps.length;
        }
        
        // 找到所有根节点（没有依赖的）
        var roots = [];
        for (var n in inDegree) {
            if (inDegree[n] === 0) {
                roots.push(n);
            }
        }
        
        // 如果没有根节点，说明所有节点都有依赖，取第一个
        if (roots.length === 0 && Object.keys(nodes).length > 0) {
            roots.push(Object.keys(nodes)[0]);
        }
        
        // 从根节点开始 DFS 找最长路径
        var maxDepth = 0;
        var longestPath = [];
        
        function dfsPath(node, path, visited) {
            if (visited.indexOf(node) !== -1) return;
            visited.push(node);
            path.push(node);
            
            var children = [];
            for (var n in nodes) {
                if (nodes[n].deps.indexOf(node) !== -1) {
                    children.push(n);
                }
            }
            
            if (children.length === 0) {
                if (path.length > maxDepth) {
                    maxDepth = path.length;
                    longestPath = path.slice();
                }
            } else {
                for (var i = 0; i < children.length; i++) {
                    dfsPath(children[i], path.slice(), visited.slice());
                }
            }
        }
        
        for (var i = 0; i < roots.length; i++) {
            dfsPath(roots[i], [], []);
        }
        
        this._criticalPath = longestPath;
        return this._criticalPath;
    },

    /**
     * 获取依赖树（用于显示）
     */
    getDependencyTree: function(engineName, depth) {
        depth = depth || 0;
        var node = this._nodes[engineName];
        if (!node) return null;
        
        var result = {
            name: engineName,
            duration: Math.round(node.duration || 0),
            status: node.status,
            depth: depth,
            children: []
        };
        
        var deps = node.deps || [];
        for (var i = 0; i < deps.length; i++) {
            var child = this.getDependencyTree(deps[i], depth + 1);
            if (child) {
                result.children.push(child);
            }
        }
        
        return result;
    },

    /**
     * 获取所有数据
     */
    getData: function() {
        return {
            nodes: this._nodes,
            edges: this._edges,
            executionChain: this._executionChain,
            circularDependencies: this._circularDependencies,
            blockingEngines: this.detectBlocking(),
            criticalPath: this.calculateCriticalPath()
        };
    },

    /**
     * 重置
     */
    reset: function() {
        this._nodes = {};
        this._edges = [];
        this._executionChain = [];
        this._currentStack = [];
        this._circularDependencies = [];
        this._blockingEngines = {};
        this._criticalPath = [];
        console.log('🔗 DependencyInspector reset');
    },

    /**
     * 启用/禁用
     */
    setEnabled: function(enabled) {
        this._enabled = enabled;
        if (enabled) {
            this.reset();
            console.log('🔗 DependencyInspector enabled');
        } else {
            console.log('🔗 DependencyInspector disabled');
        }
    }
};

// 自动初始化
if (LawAIApp.DevTools) {
    LawAIApp.DevTools.DependencyInspector.init();
}

console.log('🔗 DependencyInspector V1.0.0 ready');
