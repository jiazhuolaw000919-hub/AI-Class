// ============================================================
// js/academy/knowledgeGalaxy.js
// Knowledge Galaxy — Canvas 力导向可视化
// Bible Part 45-47
// ============================================================

(function() {
  'use strict';

  window.LawAIApp = window.LawAIApp || {};

  if (window.LawAIApp.KnowledgeGalaxy) {
    console.log('[KnowledgeGalaxy] Already exists');
    return;
  }

  // ============================================================
  // 配置
  // ============================================================
  var CONFIG = {
    nodeRadius: 8,
    nodeRadiusHover: 12,
    linkDistance: 120,
    linkStrength: 0.05,
    repulsion: 3000,
    damping: 0.85,
    centerPull: 0.01,
    maxVelocity: 5,
    labelFont: '11px Inter, -apple-system, sans-serif'
  };

  var COLORS = {
    KNOWLEDGE: '#4a9eff',
    SKILL: '#22c55e',
    LESSON: '#f59e0b',
    COURSE: '#ec4899',
    PROJECT: '#14b8a6',
    ASSESSMENT: '#ef4444',
    DEFAULT: '#64748b'
  };

  var RELATION_COLORS = {
    PREREQUISITE: '#ef4444',
    TEACHES: '#4a9eff',
    REFERENCES: '#22c55e',
    PART_OF: '#8b5cf6',
    RELATED: '#64748b',
    SUPPORTS: '#f59e0b',
    DEFAULT: '#475569'
  };

  // ============================================================
  // 状态
  // ============================================================
  var _canvas = null;
  var _ctx = null;
  var _nodes = [];
  var _links = [];
  var _animationId = null;
  var _hoveredNode = null;
  var _selectedNode = null;
  var _draggedNode = null;
  var _dragOffset = { x: 0, y: 0 };
  var _scale = 1;
  var _offset = { x: 0, y: 0 };
  var _containerId = null;
  var _isRunning = false;

  // ============================================================
  // 从 KnowledgeGraph 构建节点和连线
  // ============================================================
  function _buildGraphData() {
    var kg = window.LawAIApp.KnowledgeGraph;
    if (!kg) {
      console.warn('[KnowledgeGalaxy] KnowledgeGraph not available');
      return { nodes: [], links: [] };
    }

    var rawNodes = kg.getAllNodes();
    var nodes = rawNodes.map(function(n) {
      return {
        id: n.id,
        label: n.title || n.id,
        type: n.type || 'KNOWLEDGE',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null
      };
    });

    var nodeMap = {};
    nodes.forEach(function(n) { nodeMap[n.id] = n; });

    var links = [];
    rawNodes.forEach(function(n) {
      var rels = kg.getRelations(n.id);
      rels.forEach(function(rel) {
        if (rel.from === n.id && nodeMap[rel.to]) {
          links.push({
            source: nodeMap[rel.from],
            target: nodeMap[rel.to],
            type: rel.type
          });
        }
      });
    });

    // 去重（双向关系）
    var seen = {};
    links = links.filter(function(l) {
      var key = l.source.id + '|' + l.target.id + '|' + l.type;
      var revKey = l.target.id + '|' + l.source.id + '|' + l.type;
      if (seen[key] || seen[revKey]) return false;
      seen[key] = true;
      return true;
    });

    return { nodes: nodes, links: links };
  }

  // ============================================================
  // 初始化位置（圆形布局）
  // ============================================================
  function _initPositions(width, height) {
    var cx = width / 2;
    var cy = height / 2;
    var radius = Math.min(width, height) * 0.35;

    _nodes.forEach(function(node, i) {
      var angle = (i / _nodes.length) * Math.PI * 2;
      node.x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
      node.y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;
      node.vx = 0;
      node.vy = 0;
    });
  }

  // ============================================================
  // 力导向模拟（简化版）
  // ============================================================
  function _simulateStep(width, height) {
    var cx = width / 2;
    var cy = height / 2;

    // 1. 节点排斥
    for (var i = 0; i < _nodes.length; i++) {
      var a = _nodes[i];
      for (var j = i + 1; j < _nodes.length; j++) {
        var b = _nodes[j];
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var distSq = dx * dx + dy * dy;
        if (distSq < 1) distSq = 1;
        var dist = Math.sqrt(distSq);
        var force = CONFIG.repulsion / distSq;
        var fx = (dx / dist) * force;
        var fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // 2. 连线吸引
    for (var k = 0; k < _links.length; k++) {
      var link = _links[k];
      var s = link.source;
      var t = link.target;
      var dx = t.x - s.x;
      var dy = t.y - s.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var diff = (dist - CONFIG.linkDistance) * CONFIG.linkStrength;
      var fx = (dx / dist) * diff;
      var fy = (dy / dist) * diff;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    }

    // 3. 向中心拉
    for (var m = 0; m < _nodes.length; m++) {
      var node = _nodes[m];
      node.vx += (cx - node.x) * CONFIG.centerPull;
      node.vy += (cy - node.y) * CONFIG.centerPull;
    }

    // 4. 更新位置
    for (var n = 0; n < _nodes.length; n++) {
      var nd = _nodes[n];
      if (nd === _draggedNode) continue;

      nd.vx *= CONFIG.damping;
      nd.vy *= CONFIG.damping;

      // 限制速度
      var speed = Math.sqrt(nd.vx * nd.vx + nd.vy * nd.vy);
      if (speed > CONFIG.maxVelocity) {
        nd.vx = (nd.vx / speed) * CONFIG.maxVelocity;
        nd.vy = (nd.vy / speed) * CONFIG.maxVelocity;
      }

      nd.x += nd.vx;
      nd.y += nd.vy;

      // 边界
      nd.x = Math.max(20, Math.min(width - 20, nd.x));
      nd.y = Math.max(20, Math.min(height - 20, nd.y));
    }
  }

  // ============================================================
  // 渲染
  // ============================================================
  function _render() {
    if (!_ctx || !_canvas) return;
    var width = _canvas.width / window.devicePixelRatio;
    var height = _canvas.height / window.devicePixelRatio;

    _ctx.save();
    _ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    // 清空
    _ctx.fillStyle = '#0b1220';
    _ctx.fillRect(0, 0, width, height);

    // 变换
    _ctx.translate(_offset.x, _offset.y);
    _ctx.scale(_scale, _scale);

    // 画连线
    _links.forEach(function(link) {
      var color = RELATION_COLORS[link.type] || RELATION_COLORS.DEFAULT;
      var isHighlighted = _selectedNode &&
        (_selectedNode.id === link.source.id || _selectedNode.id === link.target.id);

      _ctx.beginPath();
      _ctx.moveTo(link.source.x, link.source.y);
      _ctx.lineTo(link.target.x, link.target.y);
      _ctx.strokeStyle = isHighlighted ? color : 'rgba(255,255,255,0.06)';
      _ctx.lineWidth = isHighlighted ? 2 : 1;
      _ctx.stroke();
    });

    // 画节点
    _nodes.forEach(function(node) {
      var isHovered = _hoveredNode === node;
      var isSelected = _selectedNode === node;
      var radius = isHovered ? CONFIG.nodeRadiusHover : CONFIG.nodeRadius;
      var color = COLORS[node.type] || COLORS.DEFAULT;

      // 高亮
      if (isSelected) {
        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        _ctx.strokeStyle = color;
        _ctx.lineWidth = 2;
        _ctx.stroke();
      }

      // 节点圆
      _ctx.beginPath();
      _ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      _ctx.fillStyle = color;
      _ctx.fill();

      // 标签
      if (isHovered || isSelected || _nodes.length < 30) {
        _ctx.font = CONFIG.labelFont;
        _ctx.fillStyle = '#e2e8f0';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'top';
        var label = node.label.length > 20 ? node.label.substring(0, 18) + '…' : node.label;
        _ctx.fillText(label, node.x, node.y + radius + 4);
      }
    });

    _ctx.restore();
  }

  // ============================================================
  // 动画循环
  // ============================================================
  function _animate() {
    if (!_isRunning) return;
    var width = _canvas.width / window.devicePixelRatio;
    var height = _canvas.height / window.devicePixelRatio;

    _simulateStep(width, height);
    _render();

    _animationId = requestAnimationFrame(_animate);
  }

  // ============================================================
  // 事件处理
  // ============================================================
  function _getMousePos(e) {
    var rect = _canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - _offset.x) / _scale,
      y: (e.clientY - rect.top - _offset.y) / _scale
    };
  }

  function _findNodeAt(x, y) {
    for (var i = _nodes.length - 1; i >= 0; i--) {
      var node = _nodes[i];
      var dx = x - node.x;
      var dy = y - node.y;
      if (dx * dx + dy * dy <= (CONFIG.nodeRadiusHover + 4) * (CONFIG.nodeRadiusHover + 4)) {
        return node;
      }
    }
    return null;
  }

  function _onMouseMove(e) {
    var pos = _getMousePos(e);

    if (_draggedNode) {
      _draggedNode.x = pos.x - _dragOffset.x;
      _draggedNode.y = pos.y - _dragOffset.y;
      return;
    }

    var node = _findNodeAt(pos.x, pos.y);
    if (node !== _hoveredNode) {
      _hoveredNode = node;
      _canvas.style.cursor = node ? 'pointer' : 'default';
    }
  }

  function _onMouseDown(e) {
    var pos = _getMousePos(e);
    var node = _findNodeAt(pos.x, pos.y);
    if (node) {
      _draggedNode = node;
      _dragOffset.x = pos.x - node.x;
      _dragOffset.y = pos.y - node.y;
    }
  }

  function _onMouseUp(e) {
    if (_draggedNode) {
      _draggedNode = null;
      return;
    }
    var pos = _getMousePos(e);
    var node = _findNodeAt(pos.x, pos.y);
    if (node) {
      _selectedNode = _selectedNode === node ? null : node;
      _showNodeDetails(node);
    }
  }

  function _onWheel(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? 0.9 : 1.1;
    _scale = Math.max(0.3, Math.min(3, _scale * delta));
  }

  function _showNodeDetails(node) {
    var panel = document.getElementById('kg-details-panel');
    if (!panel) return;

    if (!node) {
      panel.innerHTML = '<div style="color:#64748b;font-size:12px;padding:12px;">Click a node to see details.</div>';
      return;
    }

    var kg = window.LawAIApp.KnowledgeGraph;
    var rels = kg ? kg.getRelations(node.id) : [];

    panel.innerHTML = `
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Node</div>
      <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin:4px 0 8px;">${node.label}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:12px;">
        <span style="background:${COLORS[node.type] || COLORS.DEFAULT};color:white;padding:2px 8px;border-radius:100px;font-size:10px;">${node.type}</span>
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${rels.length} relationship(s)</div>
      <div style="font-size:11px;color:#94a3b8;line-height:1.6;">
        ${rels.slice(0, 8).map(function(r) {
          var otherId = r.from === node.id ? r.to : r.from;
          var other = kg.getNode(otherId);
          var arrow = r.from === node.id ? '→' : '←';
          return '<div style="padding:3px 0;">' + arrow + ' ' + r.type + ' · ' + (other ? other.title : otherId) + '</div>';
        }).join('')}
      </div>
    `;
  }

  // ============================================================
  // 公共 API
  // ============================================================
  var KnowledgeGalaxy = {
    render: function(containerId) {
      _containerId = containerId;
      var container = document.getElementById(containerId);
      if (!container) {
        console.warn('[KnowledgeGalaxy] Container not found:', containerId);
        return;
      }

      var data = _buildGraphData();
      _nodes = data.nodes;
      _links = data.links;

      if (_nodes.length === 0) {
        container.innerHTML = `
          <div style="padding:60px 20px;text-align:center;color:#64748b;font-size:13px;">
            <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">🕸️</div>
            <p style="margin:0;">No knowledge connections yet.</p>
            <p style="margin:4px 0 0;font-size:12px;">Complete lessons and write notes to build your galaxy.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="position:relative;width:100%;height:500px;background:#0b1220;border-radius:12px;border:1px solid rgba(255,255,255,0.04);overflow:hidden;">
          <canvas id="kg-canvas" style="width:100%;height:100%;display:block;"></canvas>
          <div id="kg-details-panel" style="
            position:absolute;top:12px;right:12px;width:220px;
            background:rgba(15,23,42,0.95);
            border:1px solid rgba(255,255,255,0.08);
            border-radius:10px;padding:12px;
            backdrop-filter:blur(8px);
            max-height:calc(100% - 24px);overflow-y:auto;
          ">
            <div style="color:#64748b;font-size:12px;padding:12px;">Click a node to see details.</div>
          </div>
          <div style="position:absolute;bottom:12px;left:12px;font-size:10px;color:#475569;">
            🕸️ ${_nodes.length} nodes · ${_links.length} edges
          </div>
        </div>
      `;

      _canvas = document.getElementById('kg-canvas');
      _canvas.width = _canvas.clientWidth * window.devicePixelRatio;
      _canvas.height = _canvas.clientHeight * window.devicePixelRatio;
      _ctx = _canvas.getContext('2d');

      _initPositions(_canvas.clientWidth, _canvas.clientHeight);

      // 绑定事件
      _canvas.addEventListener('mousemove', _onMouseMove);
      _canvas.addEventListener('mousedown', _onMouseDown);
      _canvas.addEventListener('mouseup', _onMouseUp);
      _canvas.addEventListener('wheel', _onWheel, { passive: false });

      // 启动动画
      _isRunning = true;
      _animate();
    },

    destroy: function() {
      _isRunning = false;
      if (_animationId) {
        cancelAnimationFrame(_animationId);
        _animationId = null;
      }
      _nodes = [];
      _links = [];
      _canvas = null;
      _ctx = null;
      _hoveredNode = null;
      _selectedNode = null;
    },

    refresh: function() {
      if (_containerId) {
        this.destroy();
        this.render(_containerId);
      }
    }
  };

  window.LawAIApp.KnowledgeGalaxy = KnowledgeGalaxy;
  console.log('[KnowledgeGalaxy] ✅ Module loaded');

})();
