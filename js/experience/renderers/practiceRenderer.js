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

        // 解析 Practice 数据
        var _question = activity.metadata?.question || 'Practice question';
        var _options = activity.metadata?.options || [];
        var _correctAnswer = activity.metadata?.correctAnswer !== undefined ? activity.metadata.correctAnswer : null;
        var _explanation = activity.metadata?.explanation || '';

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
            var feedback = isCorrect ? '✅ Correct! Well done.' : '❌ Not quite. Review the concept and try again.';
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
                        <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:6px;border-radius:8px;border:1px solid ${borderColor};background:${bgColor};cursor:${_evaluated ? 'default' : 'pointer'};transition:all 0.2s;">
                            <input type="radio" name="practice-option" value="${i}" ${checkedAttr} ${disabledAttr}
                                   style="accent-color:#4a9eff;width:16px;height:16px;cursor:${_evaluated ? 'default' : 'pointer'};">
                            <span style="font-size:13px;color:${textColor};line-height:1.4;">${option}</span>
                            ${_evaluated && showCorrect ? '<span style="margin-left:auto;font-size:14px;">✅</span>' : ''}
                            ${_evaluated && isWrong ? '<span style="margin-left:auto;font-size:14px;">❌</span>' : ''}
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

            // 反馈区域
            if (_evaluated && _result) {
                var isCorrect = _result.correct;
                var feedbackColor = isCorrect ? '#22c55e' : '#ef4444';
                var icon = isCorrect ? '✅' : '❌';
                html += `
                    <div style="margin-top:12px;padding:12px 16px;border-radius:8px;background:${isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'};border:1px solid ${isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <span style="font-size:16px;">${icon}</span>
                            <span style="font-weight:500;color:${feedbackColor};">${isCorrect ? 'Correct' : 'Not quite'}</span>
                        </div>
                        <p style="margin:0;font-size:13px;color:#c8d0d8;line-height:1.5;">${_result.feedback || ''}</p>
                        ${_result.explanation ? `<p style="margin:6px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">${_result.explanation}</p>` : ''}
                    </div>
                `;

                // 🔥 Part 173: Retry / Reflection 选项
                html += `
                    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                `;

                if (!isCorrect) {
                    // 不正确时显示 "Try again"
                    html += `
                        <button id="practice-retry-btn" style="padding:6px 16px;background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.12);border-radius:8px;color:#4a9eff;font-size:12px;cursor:pointer;font-family:inherit;">
                            🔄 Try again
                        </button>
                    `;
                }

                // 无论对错都可以反思
                html += `
                        <button onclick="LawAIApp.Experience.Renderers.PracticeRenderer._promptReflection('${_activity.id}')" 
                                style="padding:6px 16px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.12);border-radius:8px;color:#c4b5fd;font-size:12px;cursor:pointer;font-family:inherit;">
                            💭 ${isCorrect ? 'What did you learn?' : 'Reflect on this'}
                        </button>
                    </div>
                `;

                // 如果已完成，显示完成状态
                if (_submitted && _result.correct) {
                    html += `
                        <div style="margin-top:12px;padding:10px 16px;border-radius:8px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.12);text-align:center;">
                            <span style="font-size:13px;color:#22c55e;">🎉 Practice completed!</span>
                        </div>
                    `;
                }
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
    }
};

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
