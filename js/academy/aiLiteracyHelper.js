// js/academy/aiLiteracyHelper.js
// Part 60 — AI Literacy Helper
// Law AI Academy Developer Bible
//
// PURPOSE: Provide AI literacy guidance and prompts
// RULES: No trust scores, no surveillance, no forced verification

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AILiteracyHelper) {
        console.log('[AILiteracyHelper] Already exists, skipping...');
        return;
    }

    /**
     * AILiteracyHelper
     *
     * 提供 AI 素养指导和提示
     * 
     * 技能:
     * 1. Prompt judgment
     * 2. Output evaluation
     * 3. Evidence checking
     * 4. Source comparison
     * 5. Assumption detection
     * 6. Uncertainty recognition
     * 7. Error detection
     * 8. Bias awareness
     * 9. Appropriate AI reliance
     * 10. AI override
     * 11. Reflection
     * 12. Transfer
     */
    var AILiteracyHelper = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PROMPT TEMPLATES
        // ============================================================

        PROMPTS: {
            EVIDENCE_CHECK: 'What evidence supports this?',
            ASSUMPTION_CHECK: 'What assumptions are being made?',
            UNCERTAINTY_CHECK: 'What part of this is uncertain?',
            SOURCE_CHECK: 'Where did this information come from?',
            ALTERNATIVE_CHECK: 'What are alternative interpretations?',
            VERIFICATION_CHECK: 'How can I verify this?',
            CONTEXT_CHECK: 'What context might be missing?',
            LIMITATION_CHECK: 'What are the limitations of this?',
            BIAS_CHECK: 'What biases might be present?',
            RELEVANCE_CHECK: 'Is this relevant to my learning goal?',
            APPLICABILITY_CHECK: 'Does this apply to my situation?',
            CONFLICT_CHECK: 'Do sources agree on this?'
        },

        // ============================================================
        // REFLECTION PROMPTS
        // ============================================================

        REFLECTION_PROMPTS: {
            CONFIDENCE: 'How confident are you in this?',
            UNDERSTANDING: 'Do you understand the reasoning?',
            TRUST: 'Would you rely on this in practice?',
            COMPARISON: 'How does this compare to what you already know?',
            GAP: 'What is missing from this explanation?',
            APPLICATION: 'How would you apply this?',
            CONNECTION: 'How does this connect to other concepts?'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AILiteracyHelper] Already initialized');
                return this;
            }

            console.log('[AILiteracyHelper] 🚀 Initializing...');
            this.initialized = true;
            console.log('[AILiteracyHelper] ✅ Initialized');
            return this;
        },

        /**
         * 获取 AI 素养提示
         * @param {string} context — 上下文
         * @param {Object} options — 选项
         * @returns {string} 提示
         */
        getPrompt: function(context, options) {
            options = options || {};

            var prompts = {
                'evidence': 'What evidence supports this claim?',
                'assumption': 'What assumptions is the AI making?',
                'uncertainty': 'What is uncertain about this?',
                'source': 'Where does this information come from?',
                'alternative': 'What are alternative interpretations?',
                'verify': 'How could you verify this?',
                'apply': 'How would you apply this to your learning?',
                'reflect': 'What do you think about this explanation?'
            };

            var prompt = prompts[context] || this.PROMPTS.EVIDENCE_CHECK;

            // 如果是反思上下文，使用反思提示
            if (options.isReflection) {
                var reflectionPrompts = Object.values(this.REFLECTION_PROMPTS);
                var idx = Math.floor(Math.random() * reflectionPrompts.length);
                return reflectionPrompts[idx] || 'What do you think?';
            }

            return prompt;
        },

        /**
         * 获取 AI 素养技巧
         * @param {string} skill — 技能名称
         * @returns {string} 技巧描述
         */
        getTip: function(skill) {
            var tips = {
                'prompt': 'Better prompts lead to better responses. Be specific about what you need.',
                'evaluate': 'Always evaluate AI output against your own knowledge and authoritative sources.',
                'evidence': 'Ask the AI for evidence. Then check that evidence.',
                'source': 'Know the source. AI-generated content should be verified.',
                'assumption': 'Identify assumptions. If an assumption is wrong, the answer may be wrong.',
                'uncertainty': 'AI is not always certain. If it seems uncertain, treat it as uncertain.',
                'error': 'AI can make mistakes. Check important information.',
                'bias': 'AI may reflect biases in its training data. Consider multiple perspectives.',
                'reliance': 'Use AI as a tool, not a replacement for your own judgment.',
                'override': 'If you know better, trust your knowledge over the AI.',
                'reflect': 'Reflection helps you learn better and question assumptions.'
            };

            return tips[skill] || 'Think critically about AI-generated content.';
        },

        /**
         * 获取验证建议
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @param {string} consequence — 'low' | 'medium' | 'high'
         * @returns {string} 验证建议
         */
        getVerificationAdvice: function(content, context, consequence) {
            consequence = consequence || 'medium';

            var advice = '';

            var status = window.LawAIApp?.EpistemicStatus;
            if (status) {
                var epiStatus = status.getStatus(content, context);
                if (epiStatus.type === 'SOURCE_BACKED') {
                    advice = 'This is backed by authoritative sources.';
                } else if (epiStatus.type === 'AI_GENERATED') {
                    advice = 'AI-generated. Verify with authoritative sources.';
                } else if (epiStatus.type === 'INFERRED') {
                    advice = 'This is inferred. Check the underlying evidence.';
                } else if (epiStatus.type === 'UNCERTAIN') {
                    advice = 'The evidence is incomplete. Seek additional information.';
                } else if (epiStatus.type === 'CONFLICTING') {
                    advice = 'Sources disagree. Consider which is more authoritative.';
                } else {
                    advice = 'Verify this information.';
                }
            }

            // 根据后果调整建议强度
            if (consequence === 'high') {
                advice += ' High consequence: verify carefully.';
            } else if (consequence === 'low') {
                advice += ' Low consequence: quick check recommended.';
            }

            return advice;
        },

        /**
         * 获取 AI 素养技能列表
         * @returns {Array} 技能列表
         */
        getSkills: function() {
            return [
                { id: 'prompt', label: 'Prompt Judgment', description: 'Know what makes a good prompt.' },
                { id: 'evaluate', label: 'Output Evaluation', description: 'Evaluate AI output critically.' },
                { id: 'evidence', label: 'Evidence Checking', description: 'Check evidence behind claims.' },
                { id: 'source', label: 'Source Comparison', description: 'Compare sources and authority.' },
                { id: 'assumption', label: 'Assumption Detection', description: 'Identify hidden assumptions.' },
                { id: 'uncertainty', label: 'Uncertainty Recognition', description: 'Recognize when AI is uncertain.' },
                { id: 'error', label: 'Error Detection', description: 'Spot potential errors.' },
                { id: 'bias', label: 'Bias Awareness', description: 'Be aware of potential biases.' },
                { id: 'reliance', label: 'Appropriate Reliance', description: 'Know when to rely on AI.' },
                { id: 'override', label: 'AI Override', description: 'Override AI when appropriate.' },
                { id: 'reflect', label: 'Reflection', description: 'Reflect on AI-assisted learning.' }
            ];
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized
            };
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AILiteracyHelper = AILiteracyHelper;

    function autoInit() {
        if (!AILiteracyHelper.initialized) {
            AILiteracyHelper.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AILiteracyHelper] Module loaded (Part 60)');

})();
