// ===========================================
// loadingStates.js
// 加载状态 - 骨架卡片、旋转动画（Season 1.5 Part F 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LoadingStates = {
    /**
     * 获取骨架 HTML（按类型）
     */
    getSkeleton: function(type) {
        type = type || 'card';
        var skeletons = {
            card: this._skeletonCard(),
            list: this._skeletonList(),
            lesson: this._skeletonLesson(),
            dashboard: this._skeletonDashboard(),
            grid: this._skeletonGrid()
        };
        return skeletons[type] || skeletons.card;
    },

    /**
     * 显示骨架
     */
    showSkeleton: function(container, type) {
        type = type || 'card';
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = this.getSkeleton(type);
        }
    },

    /**
     * 隐藏骨架（显示内容）
     */
    hideSkeleton: function(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * 显示 Spinner
     */
    showSpinner: function(container, message) {
        message = message || 'Loading...';
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (!container) return;

        container.innerHTML = `
            <div style="
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                padding:40px 20px;
                gap:16px;
            ">
                <div class="spinner" style="
                    width:40px;
                    height:40px;
                    border:3px solid rgba(74,158,255,0.15);
                    border-top-color:#4a9eff;
                    border-radius:50%;
                    animation:spin 0.8s linear infinite;
                "></div>
                <span style="color:#94a3b8;font-size:14px;">${message}</span>
            </div>
        `;
    },

    /**
     * 隐藏 Spinner
     */
    hideSpinner: function(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * 页面加载进度条
     */
    progressBar: function(percent) {
        return `
            <div style="
                width:100%;
                height:4px;
                background:rgba(255,255,255,0.06);
                border-radius:2px;
                overflow:hidden;
            ">
                <div style="
                    width:${percent}%;
                    height:100%;
                    background:linear-gradient(90deg,#4a9eff,#7c3aed);
                    transition:width 0.3s ease;
                    border-radius:2px;
                "></div>
            </div>
        `;
    },

    /**
     * 骨架：卡片
     */
    _skeletonCard: function() {
        return `
            <div style="
                background:rgba(255,255,255,0.03);
                border-radius:14px;
                padding:20px;
                border:1px solid rgba(255,255,255,0.04);
            ">
                <div style="
                    height:20px;
                    width:60%;
                    background:linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                    background-size:200% 100%;
                    border-radius:8px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite;
                    margin-bottom:12px;
                "></div>
                <div style="
                    height:14px;
                    width:90%;
                    background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                    background-size:200% 100%;
                    border-radius:6px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite 0.2s;
                    margin-bottom:8px;
                "></div>
                <div style="
                    height:14px;
                    width:70%;
                    background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                    background-size:200% 100%;
                    border-radius:6px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite 0.4s;
                "></div>
            </div>
        `;
    },

    /**
     * 骨架：列表
     */
    _skeletonList: function() {
        var items = '';
        for (var i = 0; i < 3; i++) {
            items += `
                <div style="
                    display:flex;
                    align-items:center;
                    gap:14px;
                    padding:14px 16px;
                    background:rgba(255,255,255,0.03);
                    border-radius:12px;
                    margin-bottom:8px;
                ">
                    <div style="
                        width:40px;
                        height:40px;
                        border-radius:8px;
                        background:linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                        background-size:200% 100%;
                        animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1}s;
                        flex-shrink:0;
                    "></div>
                    <div style="flex:1;">
                        <div style="
                            height:16px;
                            width:70%;
                            background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                            background-size:200% 100%;
                            border-radius:6px;
                            animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1 + 0.2}s;
                            margin-bottom:6px;
                        "></div>
                        <div style="
                            height:12px;
                            width:50%;
                            background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                            background-size:200% 100%;
                            border-radius:4px;
                            animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1 + 0.4}s;
                        "></div>
                    </div>
                </div>
            `;
        }
        return '<div style="display:flex;flex-direction:column;gap:8px;">' + items + '</div>';
    },

    /**
     * 骨架：课程
     */
    _skeletonLesson: function() {
        return `
            <div style="padding:24px;max-width:800px;margin:0 auto;">
                <div style="
                    height:28px;
                    width:60%;
                    background:linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                    background-size:200% 100%;
                    border-radius:8px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite;
                    margin-bottom:16px;
                "></div>
                <div style="
                    height:120px;
                    background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                    background-size:200% 100%;
                    border-radius:12px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite 0.2s;
                    margin-bottom:16px;
                "></div>
                <div style="
                    height:80px;
                    background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                    background-size:200% 100%;
                    border-radius:12px;
                    animation:skeletonShimmer 1.5s ease-in-out infinite 0.4s;
                    margin-bottom:16px;
                "></div>
                <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
                    <div style="
                        height:60px;
                        background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                        background-size:200% 100%;
                        border-radius:12px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite 0.6s;
                    "></div>
                    <div style="
                        height:60px;
                        background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                        background-size:200% 100%;
                        border-radius:12px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite 0.8s;
                    "></div>
                </div>
            </div>
        `;
    },

    /**
     * 骨架：Dashboard
     */
    _skeletonDashboard: function() {
        var cards = '';
        for (var i = 0; i < 4; i++) {
            cards += `
                <div style="
                    padding:20px;
                    background:rgba(255,255,255,0.03);
                    border-radius:14px;
                    border:1px solid rgba(255,255,255,0.04);
                ">
                    <div style="
                        height:16px;
                        width:60%;
                        background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                        background-size:200% 100%;
                        border-radius:6px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1}s;
                        margin:0 auto 8px;
                    "></div>
                    <div style="
                        height:28px;
                        width:40%;
                        background:linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                        background-size:200% 100%;
                        border-radius:6px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1 + 0.2}s;
                        margin:0 auto;
                    "></div>
                </div>
            `;
        }
        return `
            <div style="padding:16px;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:20px;">
                    ${cards}
                </div>
                <div style="
                    height:100px;
                    border-radius:14px;
                    background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                    background-size:200% 100%;
                    animation:skeletonShimmer 1.5s ease-in-out infinite 0.4s;
                "></div>
            </div>
        `;
    },

    /**
     * 骨架：网格
     */
    _skeletonGrid: function() {
        var items = '';
        for (var i = 0; i < 6; i++) {
            items += `
                <div style="
                    background:rgba(255,255,255,0.03);
                    border-radius:12px;
                    padding:16px;
                    border:1px solid rgba(255,255,255,0.04);
                ">
                    <div style="
                        height:80px;
                        background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
                        background-size:200% 100%;
                        border-radius:8px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1}s;
                        margin-bottom:12px;
                    "></div>
                    <div style="
                        height:14px;
                        width:70%;
                        background:linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
                        background-size:200% 100%;
                        border-radius:4px;
                        animation:skeletonShimmer 1.5s ease-in-out infinite ${i * 0.1 + 0.2}s;
                        margin:0 auto;
                    "></div>
                </div>
            `;
        }
        return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">' + items + '</div>';
    }
};

// 注入动画样式
(function() {
    var styleId = 'loading-states-styles';
    if (document.getElementById(styleId)) return;

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes skeletonShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();

console.log('⏳ LoadingStates V2.0 ready');
