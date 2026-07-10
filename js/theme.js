/* ================================================================
   theme.css – 完整设计令牌系统
   Law AI Academy 官方设计语言
   ================================================================ */

:root {
    /* ==========================================================
       1. 颜色系统
       ========================================================== */

    /* 品牌色 */
    --color-brand-primary: #4a9eff;
    --color-brand-primary-hover: #3b8be8;
    --color-brand-primary-light: rgba(74, 158, 255, 0.1);
    --color-brand-primary-lighter: rgba(74, 158, 255, 0.04);

    /* 语义色 */
    --color-success: #22c55e;
    --color-success-light: rgba(34, 197, 94, 0.08);
    --color-warning: #f59e0b;
    --color-warning-light: rgba(245, 158, 11, 0.08);
    --color-danger: #ef4444;
    --color-danger-light: rgba(239, 68, 68, 0.08);
    --color-purple: #8b5cf6;
    --color-purple-light: rgba(139, 92, 246, 0.08);

    /* 背景色 */
    --color-bg-primary: #0b1220;
    --color-bg-secondary: #0f1a2e;
    --color-bg-elevated: rgba(255, 255, 255, 0.02);
    --color-bg-elevated-hover: rgba(255, 255, 255, 0.05);
    --color-bg-card: rgba(255, 255, 255, 0.02);
    --color-bg-card-hover: rgba(255, 255, 255, 0.04);

    /* 文字色 */
    --color-text-primary: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;
    --color-text-muted: #475569;
    --color-text-inverse: #ffffff;

    /* 边框色 */
    --color-border-default: rgba(255, 255, 255, 0.06);
    --color-border-light: rgba(255, 255, 255, 0.04);
    --color-border-hover: rgba(255, 255, 255, 0.10);
    --color-border-focus: rgba(74, 158, 255, 0.3);

    /* 渐变 */
    --gradient-hero: linear-gradient(145deg, #1a2a4a, #0f1a2e);
    --gradient-action: linear-gradient(135deg, #4a9eff, #6366f1);
    --gradient-success: linear-gradient(135deg, #22c55e, #16a34a);
    --gradient-warning: linear-gradient(135deg, #f59e0b, #d97706);

    /* ==========================================================
       2. 间距系统
       ========================================================== */

    --space-4xs: 2px;
    --space-3xs: 4px;
    --space-2xs: 6px;
    --space-xs: 8px;
    --space-sm: 10px;
    --space-md: 14px;
    --space-lg: 18px;
    --space-xl: 22px;
    --space-2xl: 28px;
    --space-3xl: 36px;
    --space-4xl: 48px;
    --space-5xl: 64px;

    /* ==========================================================
       3. 圆角系统
       ========================================================== */

    --radius-3xs: 4px;
    --radius-2xs: 6px;
    --radius-xs: 8px;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 18px;
    --radius-xl: 22px;
    --radius-2xl: 28px;
    --radius-full: 9999px;

    /* ==========================================================
       4. 字体系统
       ========================================================== */

    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-family-mono: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;

    /* 字号 */
    --font-size-3xs: 9px;
    --font-size-2xs: 10px;
    --font-size-xs: 11px;
    --font-size-sm: 13px;
    --font-size-md: 15px;
    --font-size-lg: 17px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 28px;
    --font-size-4xl: 34px;

    /* 字重 */
    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* 行高 */
    --line-height-tight: 1.15;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.7;

    /* 阅读宽度 */
    --max-width-reading: 680px;
    --max-width-container: 1000px;

    /* ==========================================================
       5. 阴影系统
       ========================================================== */

    --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.25);
    --shadow-xl: 0 16px 64px rgba(0, 0, 0, 0.3);

    --shadow-glow-sm: 0 4px 20px rgba(74, 158, 255, 0.1);
    --shadow-glow-md: 0 8px 32px rgba(74, 158, 255, 0.15);
    --shadow-glow-lg: 0 12px 48px rgba(74, 158, 255, 0.2);
    --shadow-glow-success: 0 8px 32px rgba(34, 197, 94, 0.15);

    /* ==========================================================
       6. 动效系统
       ========================================================== */

    /* 时长 */
    --duration-instant: 80ms;
    --duration-fast: 160ms;
    --duration-normal: 260ms;
    --duration-slow: 400ms;
    --duration-slower: 600ms;

    /* 缓动 */
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

    /* ==========================================================
       7. 过渡简写
       ========================================================== */

    --transition-fast: all var(--duration-fast) var(--ease-smooth);
    --transition-normal: all var(--duration-normal) var(--ease-smooth);
    --transition-spring: all var(--duration-normal) var(--ease-spring);
    --transition-slow: all var(--duration-slow) var(--ease-smooth);
}

/* ==========================================================
   亮色主题
   ========================================================== */

[data-theme="light"],
.light-mode {
    --color-bg-primary: #f6f9fc;
    --color-bg-secondary: #f0f4f8;
    --color-bg-elevated: rgba(0, 0, 0, 0.02);
    --color-bg-elevated-hover: rgba(0, 0, 0, 0.04);
    --color-bg-card: rgba(0, 0, 0, 0.02);
    --color-bg-card-hover: rgba(0, 0, 0, 0.04);

    --color-text-primary: #0b1220;
    --color-text-secondary: #475569;
    --color-text-tertiary: #64748b;

    --color-border-default: rgba(0, 0, 0, 0.08);
    --color-border-light: rgba(0, 0, 0, 0.04);
    --color-border-hover: rgba(0, 0, 0, 0.12);

    --gradient-hero: linear-gradient(145deg, #e8edf5, #d5dce8);
    --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.04);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.10);
}

/* ==========================================================
   过渡支持
   ========================================================== */

* {
    transition: background-color var(--duration-normal) var(--ease-smooth),
                color var(--duration-normal) var(--ease-smooth),
                border-color var(--duration-normal) var(--ease-smooth),
                box-shadow var(--duration-normal) var(--ease-smooth);
}
