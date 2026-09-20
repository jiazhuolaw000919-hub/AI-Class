// js/experience/renderers/practiceRenderer.js
// Part 129: Practice Activity Renderer
// Part 130: Integrated with PracticeEvidenceContract
// Part 131: Evidence Integration & Validation
// Part 132: PracticeCompleted Event Emission
// Part 173: Reflection Method + Retry

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};
window.LawAIApp.Experience.Renderers = window.LawAIApp.Experience.Renderers || {};

// 🔥 Part 130: 引用 Contract
var _contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;

LawAIApp.Experience.Renderers.PracticeRenderer = {
    /**
     * 创建 Practice Renderer 实例
     * @param {Object} activity - Activity 对象
     * @param {HTMLElement} container - 渲染容器
     * @returns {Object} Renderer 接口 { mount, unmount, update, getStatus }
     */
    create: function(activity, container) {
        // 🔥 Season 5 Part 4: 多题分派
        if (activity && activity.type === 'PRACTICE_SET') {
            return _createSetRenderer(activity, container);
        }
        var _container = container;
        var _activity = activity;
        var _status = 'idle';
        var _isMounted = false;
        var _submitted = false;
        var _evaluated = false;
        var _selectedOption = null;
        var _result = null;
        var _startEmitted = false;
        var _attemptId = null;
        var _attemptNumber = 0;
        var _startedAt = null;
        var _submittedAt = null;
        var _completedAt = null;
        var _attemptHistory = [];  // 存储所有 attempt
        var _isDuplicateSubmit = false;
        var _confidenceSubmitted = false;  // 🆕 Part 175
        var _confidenceValue = null;

        // 解析 Practice 数据
        var _question = activity.metadata?.question || 'Practice question';
        var _options = activity.metadata?.options || [];
        var _correctAnswer = activity.metadata?.correctAnswer !== undefined ? activity.metadata.correctAnswer : null;
        var _explanation = activity.metadata?.explanation || '';
        var _whyItMatters = activity.metadata?.whyItMatters || '';

        var _hasOptions = _options && _options.length > 0;
        var _isMultipleChoice = _hasOptions && _correctAnswer !== null;

        // ============================================================
        // 私有方法
        // ============================================================

        function _emitSignal(signalType, data) {
            try {
                var runtime = window.LawAIApp?.Experience?.Runtime;
                if (runtime && typeof runtime._emit === 'function') {
                    runtime._emit(signalType, {
                        activityId: _activity.id,
                        lessonId: _activity.metadata?.lessonId || _activity.id?.split(':')[0],
                        ...data
                    });
                } else {
                    var event = new CustomEvent(signalType, {
                        detail: {
                            activityId: _activity.id,
                            lessonId: _activity.metadata?.lessonId || null,
                            source: 'practice-renderer',
                            timestamp: new Date().toISOString(),
                            ...data
                        }
                    });
                    document.dispatchEvent(event);
                    window.dispatchEvent(event);
                }
            } catch (e) {
                // 忽略
            }
        }

        // ============================================================
        // 🔥 Part 132: 发射 PracticeCompleted 事件 (统一辅助方法)
        // ============================================================

        function _emitPracticeCompletedEvent(correct, score, evidence) {
            var lessonId = _activity.metadata?.lessonId || _activity.id?.split(':')[0] || null;
            var eventBus = window.LawAIApp?.EventBus || window.EventBus;
            var payload = {
                lessonId: lessonId,
                practiceId: _activity.id,
                score: score,
                accuracy: score * 100,
                correct: correct,
                attemptNumber: _attemptNumber,
                totalAttempts: _attemptHistory.length,
                evidence: evidence || null,
                source: 'practice-renderer'
            };

            try {
                if (eventBus && typeof eventBus.emit === 'function') {
                    eventBus.emit('PracticeCompleted', payload);
                } else {
                    var event = new CustomEvent('PracticeCompleted', { detail: payload });
                    document.dispatchEvent(event);
                    window.dispatchEvent(event);
                }
            } catch (e) {
                // 忽略
            }
        }

        // ============================================================
        // 🔥 Part 130: Attempt 管理
        // ============================================================

        function _generateAttemptId() {
            return 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
        }

        function _createAttempt() {
            _attemptNumber++;
            var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
            var attempt;
            if (contract && typeof contract.createAttempt === 'function') {
                attempt = contract.createAttempt({
                    activityId: _activity.id,
                    questionId: _activity.metadata?.questionId || _activity.id + ':q1',
                    attemptNumber: _attemptNumber,
                    lessonId: _activity.metadata?.lessonId || null
                });
                _attemptHistory.push(attempt);
                _attemptId = attempt.attemptId;
                _startedAt = attempt.startedAt;
            } else {
                // Fallback
                var now = new Date().toISOString();
                var attemptId = 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                attempt = {
                    attemptId: attemptId,
                    attemptNumber: _attemptNumber,
                    activityId: _activity.id,
                    questionId: _activity.metadata?.questionId || _activity.id + ':q1',
                    startedAt: now,
                    submittedAt: null,
                    completedAt: null,
                    response: null,
                    evaluation: null,
                    feedback: null,
                    status: 'started',
                    validity: null,
                    evidence: null,
                    provenance: {
                        source: 'practice-activity',
                        activityId: _activity.id,
                        lessonId: _activity.metadata?.lessonId || null,
                        attemptId: attemptId
                    }
                };
                _attemptHistory.push(attempt);
                _attemptId = attemptId;
                _startedAt = now;
            }

            // 🔥 发射 ATTEMPT_STARTED 信号
            _emitAttemptSignal('ATTEMPT_STARTED', {
                attemptNumber: _attemptNumber,
                question: _question
            });

            return attempt;
        }

        function _getCurrentAttempt() {
            return _attemptHistory[_attemptHistory.length - 1] || null;
        }

        function _updateAttempt(fields) {
            var current = _getCurrentAttempt();
            if (!current) return;

            var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
            if (contract && typeof contract.updateAttempt === 'function') {
                contract.updateAttempt(current, fields);
            } else {
                // Fallback: 手动更新
                for (var key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        current[key] = fields[key];
                    }
                }
            }
        }

        function _emitAttemptSignal(signalType, data) {
            var current = _getCurrentAttempt();
            _emitSignal(signalType, {
                attemptId: current ? current.attemptId : null,
                attemptNumber: current ? current.attemptNumber : null,
                ...data
            });
        }

        // ============================================================
        // 🔥 Part 131: 修复后的 _evaluate()
        // ============================================================

        function _evaluate() {
            var isCorrect = false;
            var evaluation = null;
            var evidence = null;
            var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;

            // ─── 1. 检查是否有有效响应 ───
            if (_selectedOption === null || _selectedOption === undefined) {
                _updateAttempt({
                    status: 'evaluated',
                    validity: 'INVALID',
                    evaluation: { status: 'UNANSWERED', isCorrect: null },
                    feedback: 'Please select an answer first.',
                    completedAt: new Date().toISOString()
                });

                if (contract && typeof contract.createEvidence === 'function') {
                    var tempAttempt = {
                        attemptId: _attemptId,
                        attemptNumber: _attemptNumber,
                        activityId: _activity.id,
                        questionId: _activity.metadata?.questionId || _activity.id + ':q1',
                        completedAt: new Date().toISOString()
                    };
                    evidence = contract.createEvidence(tempAttempt, { status: 'UNANSWERED', isCorrect: null });
                } else {
                    evidence = {
                        type: 'PRACTICE_PERFORMANCE',
                        outcome: 'UNANSWERED',
                        attemptNumber: _attemptNumber,
                        activityId: _activity.id,
                        questionId: _activity.metadata?.questionId || _activity.id + ':q1'
                    };
                }

                return {
                    correct: false,
                    feedback: 'Please select an answer first.',
                    evaluated: false,
                    validity: 'INVALID',
                    evidence: evidence
                };
            }

            // ─── 2. 检查响应是否有效（选项范围检查）───
            if (_hasOptions && (typeof _selectedOption !== 'number' || _selectedOption < 0 || _selectedOption >= _options.length)) {
                _updateAttempt({
                    status: 'evaluated',
                    validity: 'INVALID',
                    evaluation: { status: 'INVALID', isCorrect: null },
                    feedback: 'Invalid option selected.',
                    completedAt: new Date().toISOString()
                });

                if (contract && typeof contract.createEvidence === 'function') {
                    var tempAttempt = {
                        attemptId: _attemptId,
                        attemptNumber: _attemptNumber,
                        activityId: _activity.id,
                        questionId: _activity.metadata?.questionId || _activity.id + ':q1',
                        completedAt: new Date().toISOString()
                    };
                    evidence = contract.createEvidence(tempAttempt, { status: 'INVALID', isCorrect: null });
                } else {
                    evidence = {
                        type: 'PRACTICE_PERFORMANCE',
                        outcome: 'INVALID',
                        attemptNumber: _attemptNumber,
                        activityId: _activity.id,
                        questionId: _activity.metadata?.questionId || _activity.id + ':q1'
                    };
                }

                return {
                    correct: false,
                    feedback: 'Invalid option selected.',
                    evaluated: false,
                    validity: 'INVALID',
                    evidence: evidence
                };
            }

            // ─── 3. 评价逻辑 ───
            if (_isMultipleChoice) {
                isCorrect = (_selectedOption === _correctAnswer);
            } else {
                var engine = window.LawAIApp?.PracticeEngine;
                if (engine && typeof engine.checkAnswer === 'function') {
                    var result = engine.checkAnswer(
                        { correctIndex: _correctAnswer, explanation: _explanation },
                        _selectedOption
                    );
                    isCorrect = result.isCorrect;
                    _explanation = result.explanation || _explanation;
                } else {
                    isCorrect = (_selectedOption === _correctAnswer);
                }
            }

            evaluation = {
                status: isCorrect ? 'CORRECT' : 'INCORRECT',
                isCorrect: isCorrect
            };

            // ─── 4. 创建 evidence ───
            if (contract && typeof contract.createEvidence === 'function') {
                var tempAttempt = {
                    attemptId: _attemptId,
                    attemptNumber: _attemptNumber,
                    activityId: _activity.id,
                    questionId: _activity.metadata?.questionId || _activity.id + ':q1',
                    completedAt: new Date().toISOString()
                };
                evidence = contract.createEvidence(tempAttempt, evaluation);
            } else {
                evidence = {
                    type: 'PRACTICE_PERFORMANCE',
                    outcome: isCorrect ? 'CORRECT' : 'INCORRECT',
                    attemptNumber: _attemptNumber,
                    activityId: _activity.id,
                    questionId: _activity.metadata?.questionId || _activity.id + ':q1'
                };
            }

            // ─── 5. 更新 attempt ───
            var feedback = {
                what: isCorrect 
                    ? 'You selected the correct answer.'
                    : 'Your answer was not correct.',
                why: _explanation || '',           // 用 lesson JSON 里的 explanation
                how: _whyItMatters || (isCorrect 
                    ? 'Keep going.' 
                    : 'Review the section above, then try again.')
            };
            _updateAttempt({
                status: 'evaluated',
                validity: 'VALID',
                evaluation: evaluation,
                feedback: feedback,
                completedAt: new Date().toISOString(),
                evidence: evidence
            });

            return {
                correct: isCorrect,
                feedback: feedback,
                evaluated: true,
                explanation: _explanation,
                validity: 'VALID',
                evaluation: evaluation,
                evidence: evidence
            };
        }

        // ============================================================
        // Render HTML
        // ============================================================

        function _renderHTML() {
            var html = '';
            html += `<div class="practice-activity" style="font-family:'Inter',sans-serif;color:#e2e8f0;">`;

            // 标题
            html += `
                <div style="margin-bottom:12px;">
                    <span style="font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">✏️ Practice</span>
                </div>
            `;

            // 问题
            html += `
                <div style="margin-bottom:16px;">
                    <div style="font-size:15px;font-weight:500;color:#e2e8f0;line-height:1.5;">${_question}</div>
                </div>
            `;

            // 选项
            if (_hasOptions) {
                html += `<div style="margin-bottom:12px;">`;
                for (var i = 0; i < _options.length; i++) {
                    var option = _options[i];
                    var isSelected = (_selectedOption === i);
                    var isCorrect = _evaluated && _result && _result.correct && isSelected;
                    var isWrong = _evaluated && _result && !_result.correct && isSelected;
                    var showCorrect = _evaluated && (_correctAnswer === i);

                    var borderColor = 'rgba(255,255,255,0.06)';
                    var bgColor = 'rgba(255,255,255,0.02)';
                    var textColor = '#c8d0d8';

                    if (isSelected) {
                        borderColor = '#4a9eff';
                        bgColor = 'rgba(74,158,255,0.08)';
                    }
                    if (_evaluated && showCorrect) {
                        borderColor = '#22c55e';
                        bgColor = 'rgba(34,197,94,0.08)';
                    }
                    if (_evaluated && isWrong) {
                        borderColor = '#ef4444';
                        bgColor = 'rgba(239,68,68,0.08)';
                    }

                    var disabledAttr = _evaluated ? 'disabled' : '';
                    var checkedAttr = isSelected ? 'checked' : '';

                    html += `
                        <label style="...">
                            <input type="radio" name="practice-option" value="${i}" ${checkedAttr} ${disabledAttr}
                                   aria-label="Option ${i + 1}: ${option}"
                                   style="...">
                            <span style="...">${option}</span>
                            ...
                        </label>
                    `;
                }
                html += `</div>`;
            } else {
                // 自由文本输入
                html += `
                    <div style="margin-bottom:12px;">
                        <textarea id="practice-text-input" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-size:13px;font-family:inherit;resize:vertical;min-height:80px;" placeholder="Type your answer here..."></textarea>
                    </div>
                `;
            }

            // 提交按钮
            if (!_evaluated) {
                html += `
                    <button id="practice-submit-btn" style="padding:8px 24px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s;">
                        Submit Answer
                    </button>
                `;
            }

            // 反馈区域 — Season 5 Part 4: WHAT / WHY / HOW 三层
            if (_evaluated && _result) {
                var isCorrect = _result.correct;
                var feedbackColor = isCorrect ? '#22c55e' : '#ef4444';
                var icon = isCorrect ? '✅' : '❌';

                var whatText = isCorrect
                    ? 'You selected the correct answer.'
                    : 'Your answer was not correct.';

                var whyText = _result.explanation || '';
                var howText = _whyItMatters || (
                    isCorrect
                        ? 'Keep going — try the next question.'
                        : 'Review the section above, then use Retry.'
                );

                html += `
                    <div role="alert" aria-live="polite" style="margin-top:12px;padding:12px 16px;border-radius:8px;background:${isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'};border:1px solid ${isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <span style="font-size:16px;" aria-hidden="true">${icon}</span>
                            <span style="font-weight:600;color:${feedbackColor};">${isCorrect ? 'Correct' : 'Not quite'}</span>
                        </div>
                        <div style="margin-bottom:6px;">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">What</div>
                            <div style="font-size:13px;color:#c8d0d8;line-height:1.5;">${whatText}</div>
                        </div>
                        ${whyText ? `
                        <div style="margin-bottom:6px;">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Why</div>
                            <div style="font-size:13px;color:#c8d0d8;line-height:1.5;">${whyText}</div>
                        </div>` : ''}
                        <div>
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">How</div>
                            <div style="font-size:13px;color:#c8d0d8;line-height:1.5;">${howText}</div>
                        </div>
                    </div>
                `;
            }

            // 🔥 Part 175: Confidence 收集（提交后）
            // 只在已评价但未提交 confidence 时显示
            if (_evaluated && _result && !_confidenceSubmitted) {
                html += `
                    <div role="region" aria-label="Confidence question" style="
                        margin-top: 12px;
                        padding: 12px 16px;
                        background: rgba(139,92,246,0.04);
                        border-radius: 8px;
                        border: 1px solid rgba(139,92,246,0.08);
                    ">
                        <div style="font-size: 11px; color: #8b5cf6; font-weight: 500; margin-bottom: 8px; letter-spacing: 0.5px;">
                            🤔 HOW CONFIDENT?
                        </div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button onclick="this.closest('.practice-activity').querySelector('[data-confidence]').click()" 
                                    style="display: none;" data-confidence></button>
                            <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._recordConfidence('${_activity.id}', 'low')" 
                                    style="padding: 6px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 100px; color: #94a3b8; font-size: 12px; cursor: pointer; font-family: inherit;">
                                🌱 Not yet
                            </button>
                            <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._recordConfidence('${_activity.id}', 'medium')" 
                                    style="padding: 6px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 100px; color: #94a3b8; font-size: 12px; cursor: pointer; font-family: inherit;">
                                🔄 Somewhat
                            </button>
                            <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._recordConfidence('${_activity.id}', 'high')" 
                                    style="padding: 6px 14px; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.12); border-radius: 100px; color: #c4b5fd; font-size: 12px; cursor: pointer; font-family: inherit;">
                                💪 Confident
                            </button>
                            <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._recordConfidence('${_activity.id}', 'very')" 
                                    style="padding: 6px 14px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.12); border-radius: 100px; color: #6ee7b7; font-size: 12px; cursor: pointer; font-family: inherit;">
                                🎯 Very
                            </button>
                            <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._skipConfidence('${_activity.id}')" 
                                    style="padding: 6px 10px; background: transparent; border: none; color: #64748b; font-size: 11px; cursor: pointer; font-family: inherit; text-decoration: underline;">
                                Skip
                            </button>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;  // 关闭 .practice-activity
            return html;
        }

        // ============================================================
        // Bind Events
        // ============================================================

        function _bindEvents() {
            // Radio 按钮事件
            var radios = _container.querySelectorAll('input[name="practice-option"]');
            for (var i = 0; i < radios.length; i++) {
                radios[i].addEventListener('change', function(e) {
                    if (_evaluated) return;
                    _selectedOption = parseInt(e.target.value);
                    _emitSignal('RESPONSE_SELECTED', {
                        selectedOption: _selectedOption,
                        question: _question
                    });
                });
            }

            // 提交按钮
            var submitBtn = _container.querySelector('#practice-submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    if (_evaluated) {
                        // 🔥 Part 130: 已评价，防重复
                        _isDuplicateSubmit = true;
                        return;
                    }
                    if (_isDuplicateSubmit) {
                        return;
                    }

                    // 检查是否有选择
                    var selected = _container.querySelector('input[name="practice-option"]:checked');
                    var textInput = _container.querySelector('#practice-text-input');

                    if (_hasOptions) {
                        if (!selected) {
                            var msg = document.createElement('div');
                            msg.style.cssText = 'margin-top:12px;padding:10px 16px;border-radius:8px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.12);color:#f59e0b;font-size:13px;';
                            msg.textContent = 'Please select an answer before submitting.';
                            _container.querySelector('.practice-activity').appendChild(msg);
                            return;
                        }
                        _selectedOption = parseInt(selected.value);
                    } else {
                        if (!textInput || !textInput.value.trim()) {
                            var msg = document.createElement('div');
                            msg.style.cssText = 'margin-top:12px;padding:10px 16px;border-radius:8px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.12);color:#f59e0b;font-size:13px;';
                            msg.textContent = 'Please type your answer before submitting.';
                            _container.querySelector('.practice-activity').appendChild(msg);
                            return;
                        }
                        _selectedOption = textInput.value.trim();
                    }

                    // 🔥 Part 130: 创建新的 Attempt
                    var attempt = _createAttempt();
                    _submittedAt = new Date().toISOString();
                    _updateAttempt({
                        submittedAt: _submittedAt,
                        status: 'submitted',
                        response: _selectedOption
                    });

                    // 提交信号 (带 attempt 上下文)
                    _emitAttemptSignal('ACTIVITY_SUBMITTED', {
                        selectedOption: _selectedOption,
                        question: _question,
                        attemptNumber: _attemptNumber
                    });

                    // 评价
                    _result = _evaluate();
                    _evaluated = true;
                    _submitted = true;

                    // 更新 attempt 为 evaluated
                    _updateAttempt({
                        status: 'evaluated',
                        evaluation: _result.evaluation || { status: _result.correct ? 'CORRECT' : 'INCORRECT', isCorrect: _result.correct },
                        feedback: _result.feedback,
                        completedAt: new Date().toISOString()
                    });

                    // 评价信号 (带 attempt 上下文)
                    _emitAttemptSignal('ACTIVITY_EVALUATED', {
                        correct: _result.correct,
                        feedback: _result.feedback,
                        explanation: _result.explanation,
                        validity: _result.validity || 'VALID',
                        attemptNumber: _attemptNumber
                    });

                    // ──────────────────────────────────────────────────────
                    // 🔥 Part 132: 发射 PracticeCompleted 事件
                    // ──────────────────────────────────────────────────────
                    if (_result.correct) {
                        _emitAttemptSignal('ACTIVITY_COMPLETED', {
                            correct: true,
                            feedback: _result.feedback,
                            attemptNumber: _attemptNumber,
                            totalAttempts: _attemptHistory.length,
                            evidence: _result.evidence
                        });

                        // 正确：发射 PracticeCompleted
                        _emitPracticeCompletedEvent(true, 1, _result.evidence);

                        var runtime = window.LawAIApp?.Experience?.Runtime;
                        if (runtime && typeof runtime.complete === 'function') {
                            runtime.complete(_activity.id, {
                                correct: true,
                                feedback: _result.feedback,
                                attemptNumber: _attemptNumber,
                                totalAttempts: _attemptHistory.length,
                                evidence: _result.evidence
                            });
                        }
                    } else {
                        // 不正确：也发射 PracticeCompleted (供 MasteryEngine 记录失败)
                        _emitPracticeCompletedEvent(false, 0, _result.evidence);
                    }

                    // 重新渲染
                    _render();
                });
            }

            // 🔥 Part 173: Retry 按钮
            var retryBtn = _container.querySelector('#practice-retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    // 重置当前状态，允许重试
                    _evaluated = false;
                    _submitted = false;
                    _selectedOption = null;
                    _result = null;
                    _isDuplicateSubmit = false;

                    // 注意：保留 _attemptHistory，因为 Part 130 要求
                    // 保留所有 attempt 历史

                    // 重新渲染
                    _render();

                    // 发射重试信号
                    _emitAttemptSignal('ACTIVITY_RETRY', {
                        attemptNumber: _attemptNumber + 1
                    });
                });
            }
        }

        function _render() {
            _container.innerHTML = _renderHTML();
            _bindEvents();
        }

        // ============================================================
        // 公共接口
        // ============================================================

        return {
            /**
             * 挂载渲染器
             */
            mount: function() {
                if (_isMounted) return;
                _isMounted = true;

                _render();
                _status = 'active';

                // 发射 START 信号
                if (!_startEmitted) {
                    _startEmitted = true;
                    _emitSignal('ACTIVITY_STARTED', {
                        question: _question,
                        hasOptions: _hasOptions,
                        optionCount: _options.length
                    });
                    var runtime = window.LawAIApp?.Experience?.Runtime;
                    if (runtime && typeof runtime._emitLifecycle === 'function') {
                        runtime._emitLifecycle('start', _activity.id);
                    }
                }

                console.log('[PracticeRenderer] ✅ Mounted:', _activity.id);
            },

            /**
             * 卸载渲染器
             */
            unmount: function() {
                if (!_isMounted) return;
                _container.innerHTML = '';
                _isMounted = false;
                _status = 'idle';

                var runtime = window.LawAIApp?.Experience?.Runtime;
                if (runtime && typeof runtime._emitLifecycle === 'function') {
                    runtime._emitLifecycle('unmount', _activity.id);
                }

                console.log('[PracticeRenderer] ✅ Unmounted:', _activity.id);
            },

            /**
             * 更新内容
             */
            update: function(newData) {
                if (newData && newData.question) {
                    _question = newData.question;
                    _options = newData.options || [];
                    _correctAnswer = newData.correctAnswer !== undefined ? newData.correctAnswer : null;
                    _explanation = newData.explanation || '';
                    _whyItMatters = newData.whyItMatters || '';
                    _hasOptions = _options && _options.length > 0;
                    _isMultipleChoice = _hasOptions && _correctAnswer !== null;
                    _evaluated = false;
                    _submitted = false;
                    _selectedOption = null;
                    _result = null;
                    if (_isMounted) {
                        _render();
                    }
                }
            },

            /**
             * 获取状态
             */
            getStatus: function() {
                var lifecycleState = 'INITIALIZING';
                if (_isMounted && !_submitted) {
                    lifecycleState = 'READY';
                } else if (_submitted && !_evaluated) {
                    lifecycleState = 'EVALUATING';
                } else if (_evaluated) {
                    lifecycleState = 'READY';
                } else if (!_isMounted) {
                    lifecycleState = 'UNMOUNTED';
                }

                return {
                    // Lifecycle (Part 171)
                    lifecycleState: lifecycleState,

                    // Legacy (保留兼容)
                    status: _status,
                    isMounted: _isMounted,
                    isSubmitted: _submitted,
                    isEvaluated: _evaluated,
                    isCorrect: _result ? _result.correct : null,
                    hasResult: !!_result,
                    attemptCount: _attemptHistory.length,
                    currentAttemptNumber: _attemptNumber,
                    hasAttempts: _attemptHistory.length > 0,
                    isDuplicateSubmit: _isDuplicateSubmit,

                    // Part 171: Loading States
                    isLoading: false,
                    isSubmitting: _submitted && !_evaluated,
                    isEvaluating: false,

                    // Error States (Part 171)
                    hasError: false,
                    errorMessage: null,
                    isUnavailable: false
                };
            },

            /**
             * 获取结果
             */
            getResult: function() {
                return _result;
            },

            /**
             * 检查是否完成
             */
            isComplete: function() {
                return _submitted && _evaluated && _result && _result.correct;
            },

            /**
             * 🔥 Part 130: 获取 Attempt 历史
             */
            getAttemptHistory: function() {
                return _attemptHistory.slice();
            },

            /**
             * 🔥 Part 130: 获取当前 Attempt
             */
            getCurrentAttempt: function() {
                return _getCurrentAttempt();
            },

            /**
             * 🔥 Part 130: 获取 Attempt 数量
             */
            getAttemptCount: function() {
                return _attemptHistory.length;
            },

            /**
             * 🔥 Part 130: 获取 Attempt 结果摘要
             */
            getAttemptSummary: function() {
                var total = _attemptHistory.length;
                if (total === 0) {
                    return { total: 0, attempts: [], lastOutcome: null };
                }
                var attempts = _attemptHistory.map(function(a) {
                    return {
                        attemptNumber: a.attemptNumber,
                        status: a.status,
                        validity: a.validity,
                        isCorrect: a.evaluation ? a.evaluation.isCorrect : null,
                        submittedAt: a.submittedAt
                    };
                });
                var last = attempts[attempts.length - 1];
                return {
                    total: total,
                    attempts: attempts,
                    lastOutcome: last ? last.isCorrect : null,
                    lastValidity: last ? last.validity : null
                };
            },

            /**
             * 🔥 Part 131: 获取证据 (用于 Core Intelligence 消费)
             */
            getEvidence: function() {
                return _result ? _result.evidence : null;
            },

            /**
             * 🔥 Part 131: 获取所有证据
             */
            getAllEvidence: function() {
                return _attemptHistory
                    .filter(function(a) { return a.evidence; })
                    .map(function(a) { return a.evidence; });
            }
        };
    },

    // ============================================================
    // 🔥 Part 173: Reflection Method
    // ============================================================
    _promptReflection: function(activityId) {
        var reflection = prompt('💭 What did you learn or notice?\n\n(Your reflection will be saved to Notes)');
        if (!reflection || !reflection.trim()) return;

        // 🔥 Part 173: 通过 NotesAuthority 保存
        var notesAuth = window.LawAIApp?.NotesAuthority;
        if (!notesAuth || !notesAuth.isReady) {
            if (window.LawAIApp?.Toast?.info) {
                LawAIApp.Toast.info('📓 Notes loading, please retry');
            }
            return;
        }

        var result = notesAuth.create({
            title: 'Practice Reflection',
            content: reflection,
            noteType: 'REFLECTION',
            source: 'practice-activity',
            createdBy: 'learner',
            tags: ['practice', 'reflection'],
            relatedActivityRef: activityId
        });

        if (result.success && window.LawAIApp?.Toast?.success) {
            LawAIApp.Toast.success('💭 Reflection saved to Notes');
        }
    },

    // ============================================================
    // 🔥 Part 175: Confidence Method
    // ============================================================
    _recordConfidence: function(activityId, level) {
        console.log('[PracticeRenderer] Confidence recorded:', level);
        
        // 通过 EventBus 发送（不直接写其他权威）
        try {
            var eventBus = window.LawAIApp?.EventBus || window.EventBus;
            var payload = {
                activityId: activityId,
                confidence: level,  // 'low' | 'medium' | 'high' | 'very'
                source: 'practice-activity',
                timestamp: new Date().toISOString()
            };
            
            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('PRACTICE_CONFIDENCE_RECORDED', payload);
            } else {
                var event = new CustomEvent('PRACTICE_CONFIDENCE_RECORDED', { detail: payload });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
            }
        } catch (e) {}
        
        // Toast
        if (window.LawAIApp?.Toast?.success) {
            var messages = {
                'low': '📊 Noted — you can review this later',
                'medium': '📊 Recorded',
                'high': '📊 Great confidence',
                'very': '📊 Excellent'
            };
            LawAIApp.Toast.success(messages[level] || '✅ Confidence recorded');
        }
        
        // 强制重新渲染（隐藏 confidence prompt）
        var activityEl = document.querySelector('.practice-activity');
        if (activityEl && activityEl.closest('[data-practice-container]')) {
            var container = activityEl.closest('[data-practice-container]');
            var instance = container._practiceInstance;
            if (instance && typeof instance.update === 'function') {
                // 简单方式：直接移除 confidence 区域
                var confidenceEl = activityEl.querySelector('[data-confidence-prompt]');
                if (confidenceEl) confidenceEl.remove();
            }
        }
        
        // 备用方案：隐藏 DOM
        var promptEl = document.querySelector('[aria-label="Confidence question"]');
        if (promptEl) promptEl.style.display = 'none';
    },
    
    _skipConfidence: function(activityId) {
        console.log('[PracticeRenderer] Confidence skipped');
        
        // Toast
        if (window.LawAIApp?.Toast?.info) {
            LawAIApp.Toast.info('Skipped — you can add later');
        }
        
        // 隐藏
        var promptEl = document.querySelector('[aria-label="Confidence question"]');
        if (promptEl) promptEl.style.display = 'none';
    }
};

// ============================================================
// 🔥 Season 5 Part 4: Multi-Question Practice Set Renderer
// 一个练习里有多道题时使用。
// 复用单题的全部逻辑（attempt / evidence / confidence / retry）。
// 不新建引擎，只新建 UI 层组合。
// ============================================================
function _createSetRenderer(activity, container) {
    var _container = container;
    var _activity = activity;
    var _questions = (activity.metadata && activity.metadata.questions) || [];
    var _lessonId = (activity.metadata && activity.metadata.lessonId) || null;

    var _currentIndex = 0;
    var _perQuestion = _questions.map(function() {
        return {
            status: 'unanswered',   // 'unanswered' | 'evaluated'
            selectedOption: null,
            lastResult: null,       // { correct, feedback, explanation, whyItMatters }
            attempts: 0,
            firstTryCorrect: null   // 记录首次对错（用于最终评分）
        };
    });

    var _isMounted = false;
    var _isComplete = false;
    var _childRenderer = null;  // 当前题的单题 renderer

    // ---------- 持久化：写入 PracticeProgress ----------
    function _persistAttempt(questionId, isCorrect) {
        try {
            var pp = window.LawAIApp && window.LawAIApp.PracticeProgress;
            if (pp && typeof pp.recordAttempt === 'function') {
                pp.recordAttempt(_lessonId, questionId, isCorrect);
            }
        } catch (e) {}
    }

    function _persistComplete() {
        try {
            var pp = window.LawAIApp && window.LawAIApp.PracticeProgress;
            if (pp && typeof pp.markCompleted === 'function') {
                pp.markCompleted(_lessonId);
            }
        } catch (e) {}
    }

    // ---------- 发射整组完成事件 ----------
    function _emitSetCompleted() {
        var correctCount = 0;
        for (var i = 0; i < _perQuestion.length; i++) {
            if (_perQuestion[i].firstTryCorrect) correctCount++;
        }
        var total = _perQuestion.length;
        var score = total > 0 ? correctCount / total : 0;

        var payload = {
            lessonId: _lessonId,
            practiceId: _activity.id,
            score: score,
            accuracy: score * 100,
            correct: correctCount,
            total: total,
            source: 'practice-set-renderer'
        };

        try {
            var eventBus = window.LawAIApp && window.LawAIApp.EventBus;
            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('PracticeCompleted', payload);
            } else {
                var ev = new CustomEvent('PracticeCompleted', { detail: payload });
                document.dispatchEvent(ev);
                window.dispatchEvent(ev);
            }
        } catch (e) {}
    }

    // ---------- 渲染 HTML ----------
    function _renderHTML() {
        var q = _questions[_currentIndex];
        var state = _perQuestion[_currentIndex];
        var total = _questions.length;
        var human = _currentIndex + 1;

        var progressPct = Math.round((human / total) * 100);

        // ─── 顶部进度 ───
        var headerHtml = ''
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
            +   '<span style="font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">✏️ Practice</span>'
            +   '<span style="font-size:12px;color:#94a3b8;">Question ' + human + ' / ' + total + '</span>'
            + '</div>'
            + '<div style="height:4px;background:rgba(255,255,255,0.04);border-radius:100px;overflow:hidden;margin-bottom:16px;">'
            +   '<div style="height:100%;width:' + progressPct + '%;background:#22c55e;transition:width 0.3s;"></div>'
            + '</div>';

        // ─── 题目卡片（单题 renderer 会挂载到这里） ───
        var questionHtml = ''
            + '<div id="practice-set-current" data-practice-container></div>';

        // ─── 答题后：Retry / Next ───
        // 注意：初次渲染时 state.status 通常是 'unanswered'，
        // 所以这个 actionHtml 默认是空的。
        // 答完后由 _appendActionButtons() 动态追加。
        var actionHtml = '';

        return ''
            + '<div class="practice-activity practice-set" style="font-family:\'Inter\',sans-serif;color:#e2e8f0;">'
            +   headerHtml
            +   questionHtml
            +   actionHtml
            + '</div>';
    }

    // ---------- 结果页 HTML ----------
    function _renderResultsHTML() {
        var total = _questions.length;
        var correctCount = 0;
        for (var i = 0; i < _perQuestion.length; i++) {
            if (_perQuestion[i].firstTryCorrect) correctCount++;
        }
        var pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

        var rowsHtml = '';
        for (var j = 0; j < _questions.length; j++) {
            var s = _perQuestion[j];
            var ok = s.firstTryCorrect;
            var icon = ok ? '✅' : '❌';
            var color = ok ? '#22c55e' : '#ef4444';
            rowsHtml += ''
                + '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">'
                +   '<span style="font-size:13px;color:#c8d0d8;">'
                +     'Q' + (j + 1) + '. ' + (s.attempts > 1 ? '(' + s.attempts + ' attempts) ' : '')
                +   '</span>'
                +   '<span style="font-size:13px;color:' + color + ';">' + icon + '</span>'
                + '</div>';
        }

        return ''
            + '<div class="practice-activity practice-set-result" style="font-family:\'Inter\',sans-serif;color:#e2e8f0;">'
            +   '<div style="text-align:center;padding:16px 0 20px;">'
            +     '<div style="font-size:36px;margin-bottom:8px;">' + (pct >= 75 ? '🎉' : pct >= 50 ? '💪' : '📚') + '</div>'
            +     '<div style="font-size:24px;font-weight:600;color:#e2e8f0;">' + correctCount + ' / ' + total + '</div>'
            +     '<div style="font-size:13px;color:#94a3b8;margin-top:4px;">' + pct + '% correct</div>'
            +   '</div>'
            +   '<div style="background:rgba(255,255,255,0.02);border-radius:10px;padding:12px 16px;margin-bottom:16px;">'
            +     rowsHtml
            +   '</div>'
            +   '<div style="display:flex;gap:8px;">'
            +     '<button id="practice-set-retake-btn" style="flex:1;padding:10px 16px;background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.12);border-radius:8px;color:#4a9eff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;">'
            +       '↻ Retake All'
            +     '</button>'
            +   '</div>'
            + '</div>';
    }

    // ---------- 挂载当前题到子容器 ----------
    function _mountCurrentQuestion() {
        var childContainer = _container.querySelector('#practice-set-current');
        if (!childContainer) return;

        // 清理旧 renderer
        if (_childRenderer && typeof _childRenderer.unmount === 'function') {
            try { _childRenderer.unmount(); } catch (e) {}
        }

        var q = _questions[_currentIndex];
        var singleActivity = {
            id: 'practice_' + _lessonId + '_' + q.questionId,
            type: 'PRACTICE',
            content: q.question,
            metadata: {
                lessonId: _lessonId,
                questionId: q.questionId,
                question: q.question,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                whyItMatters: q.whyItMatters || '',
                hint: q.hint || null
            }
        };

        // 用单题 renderer
        _childRenderer = LawAIApp.Experience.Renderers.PracticeRenderer.create(
            singleActivity,
            childContainer
        );
        if (_childRenderer && typeof _childRenderer.mount === 'function') {
            _childRenderer.mount();
        }

        // 监听单题完成（用 MutationObserver 最简单，因为单题 renderer 没有回调 API）
        _watchChildCompletion(childContainer, q, _currentIndex);
    }

    // ---------- 监听单题提交完成 ----------
    function _watchChildCompletion(childContainer, q, index) {
        // 每 200ms 检查一次，直到单题 evaluated
        var ticks = 0;
        var interval = setInterval(function() {
            ticks++;
            if (ticks > 60) { clearInterval(interval); return; }  // 12s 超时

            var status = _childRenderer && typeof _childRenderer.getStatus === 'function'
                ? _childRenderer.getStatus()
                : null;

            if (status && status.isEvaluated) {
                clearInterval(interval);
                _onQuestionEvaluated(q, index);
            }
        }, 200);
    }

    // ---------- 单题答完后 ----------
    function _onQuestionEvaluated(q, index) {
        var state = _perQuestion[index];
        var result = _childRenderer && typeof _childRenderer.getResult === 'function'
            ? _childRenderer.getResult()
            : null;

        if (!result) return;

        state.status = 'evaluated';
        state.lastResult = result;
        state.attempts = (_childRenderer && _childRenderer.getAttemptCount)
            ? _childRenderer.getAttemptCount()
            : state.attempts + 1;

        // 首次对错（用于最终评分）
        if (state.firstTryCorrect === null) {
            state.firstTryCorrect = !!result.correct;
        }

        // 持久化
        _persistAttempt(q.questionId, !!result.correct);

        // 🔥 不重绘整个 set —— 只追加 action 区域
        // 这样 _childRenderer 的 DOM 引用不会被销毁
        _appendActionButtons();
    }

    // 🔥 新增：只更新 Retry / Next 区域
    function _appendActionButtons() {
        var setEl = _container.querySelector('.practice-set');
        if (!setEl) return;

        // 移除旧 action（如果有）
        var old = setEl.querySelector('#practice-set-actions');
        if (old) old.remove();

        var isLast = (_currentIndex === _questions.length - 1);

        var actionHtml = ''
            + '<div id="practice-set-actions" style="display:flex;gap:8px;margin-top:12px;">'
            +   '<button id="practice-set-retry-btn" style="flex:1;padding:8px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#94a3b8;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">'
            +     '↻ Retry'
            +   '</button>'
            +   '<button id="practice-set-next-btn" style="flex:2;padding:8px 16px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">'
            +     (isLast ? 'See Results →' : 'Next →')
            +   '</button>'
            + '</div>';

        setEl.insertAdjacentHTML('beforeend', actionHtml);
        _bindActionButtons();
    }

    // 🔥 新增：只绑 action 按钮
    function _bindActionButtons() {
        var retryBtn = _container.querySelector('#practice-set-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                var state = _perQuestion[_currentIndex];
                state.status = 'unanswered';
                state.lastResult = null;
                _render();
            });
        }

        var nextBtn = _container.querySelector('#practice-set-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                var isLast = (_currentIndex === _questions.length - 1);
                if (isLast) {
                    _isComplete = true;
                    _persistComplete();
                    _emitSetCompleted();
                    _render();
                } else {
                    _currentIndex++;
                    _render();
                }
            });
        }
    }

    // ---------- 事件绑定 ----------
    function _bindEvents() {
        var nextBtn = _container.querySelector('#practice-set-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                var isLast = (_currentIndex === _questions.length - 1);
                if (isLast) {
                    _isComplete = true;
                    _persistComplete();
                    _emitSetCompleted();
                    _render();
                } else {
                    _currentIndex++;
                    _render();
                }
            });
        }

        var retakeBtn = _container.querySelector('#practice-set-retake-btn');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', function() {
                _currentIndex = 0;
                _isComplete = false;
                for (var i = 0; i < _perQuestion.length; i++) {
                    _perQuestion[i] = {
                        status: 'unanswered',
                        selectedOption: null,
                        lastResult: null,
                        attempts: 0,
                        firstTryCorrect: null
                    };
                }
                _render();
            });
        }
    }

    // ---------- 主渲染 ----------
    function _render() {
        if (_isComplete) {
            _container.innerHTML = _renderResultsHTML();
            _bindEvents();
            return;
        }

        _container.innerHTML = _renderHTML();
        _bindEvents();
        _mountCurrentQuestion();
    }

    // ---------- 公共接口 ----------
    return {
        mount: function() {
            if (_isMounted) return;
            _isMounted = true;
            _render();
            console.log('[PracticeSetRenderer] ✅ Mounted:', _activity.id, '| questions:', _questions.length);
        },
        unmount: function() {
            if (!_isMounted) return;
            if (_childRenderer && typeof _childRenderer.unmount === 'function') {
                try { _childRenderer.unmount(); } catch (e) {}
            }
            _container.innerHTML = '';
            _isMounted = false;
        },
        update: function() { /* 保留接口 */ },
        getStatus: function() {
            return {
                isMounted: _isMounted,
                isComplete: _isComplete,
                currentIndex: _currentIndex,
                total: _questions.length,
                perQuestion: _perQuestion.map(function(s) {
                    return {
                        status: s.status,
                        attempts: s.attempts,
                        firstTryCorrect: s.firstTryCorrect
                    };
                })
            };
        },
        getResult: function() {
            var correctCount = 0;
            for (var i = 0; i < _perQuestion.length; i++) {
                if (_perQuestion[i].firstTryCorrect) correctCount++;
            }
            return {
                correct: correctCount,
                total: _questions.length,
                accuracy: _questions.length > 0 ? correctCount / _questions.length : 0
            };
        }
    };
}

// 注册到 ActivityRegistry
(function registerPracticeRenderer() {
    var registry = window.LawAIApp?.Experience?.ActivityRegistry;
    if (!registry) {
        console.warn('[PracticeRenderer] ActivityRegistry not available, will register later');
        document.addEventListener('ACTIVITY_REGISTRY_READY', registerPracticeRenderer);
        return;
    }

    registry.register('PRACTICE', function(activity, container) {
        var renderer = LawAIApp.Experience.Renderers.PracticeRenderer.create(activity, container);
        renderer.mount();
        return renderer;
    });

    console.log('✏️ PracticeRenderer registered (Part 129)');
})();

console.log('✏️ PracticeRenderer loaded (Part 129 + Part 130 + Part 131 + Part 132 + Part 173)');
