// js/experience/renderers/practiceRenderer.js
// Part 129: Practice Activity Renderer

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};
window.LawAIApp.Experience.Renderers = window.LawAIApp.Experience.Renderers || {};

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

        function _evaluate() {
            if (_selectedOption === null || _selectedOption === undefined) {
                return {
                    correct: false,
                    feedback: 'Please select an answer first.',
                    evaluated: false
                };
            }

            var isCorrect = false;
            if (_isMultipleChoice) {
                isCorrect = (_selectedOption === _correctAnswer);
            } else {
                // 自由文本：使用 PracticeEngine
                var engine = window.LawAIApp?.PracticeEngine;
                if (engine && typeof engine.checkAnswer === 'function') {
                    var result = engine.checkAnswer(
                        { correctIndex: _correctAnswer, explanation: _explanation },
                        _selectedOption
                    );
                    isCorrect = result.isCorrect;
                    _explanation = result.explanation || _explanation;
                } else {
                    // Fallback: 简单检查
                    isCorrect = (_selectedOption === _correctAnswer);
                }
            }

            return {
                correct: isCorrect,
                feedback: isCorrect ? '✅ Correct! Well done.' : '❌ Not quite. Review the concept and try again.',
                evaluated: true,
                explanation: _explanation
            };
        }

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

                // 如果已完成，显示完成状态
                if (_submitted && _result.correct) {
                    html += `
                        <div style="margin-top:12px;padding:10px 16px;border-radius:8px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.12);text-align:center;">
                            <span style="font-size:13px;color:#22c55e;">🎉 Practice completed!</span>
                        </div>
                    `;
                }
            }

            html += `</div>`;
            return html;
        }

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
                    if (_evaluated) return;

                    // 检查是否有选择
                    var selected = _container.querySelector('input[name="practice-option"]:checked');
                    var textInput = _container.querySelector('#practice-text-input');

                    if (_hasOptions) {
                        if (!selected) {
                            // 显示提示
                            var feedbackDiv = _container.querySelector('.practice-activity > div:last-child');
                            if (feedbackDiv && feedbackDiv.tagName !== 'DIV') {
                                // 创建反馈
                                var msg = document.createElement('div');
                                msg.style.cssText = 'margin-top:12px;padding:10px 16px;border-radius:8px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.12);color:#f59e0b;font-size:13px;';
                                msg.textContent = 'Please select an answer before submitting.';
                                _container.querySelector('.practice-activity').appendChild(msg);
                            }
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

                    // 提交信号
                    _emitSignal('ACTIVITY_SUBMITTED', {
                        selectedOption: _selectedOption,
                        question: _question
                    });

                    // 评价
                    _result = _evaluate();
                    _evaluated = true;
                    _submitted = true;

                    // 评价信号
                    _emitSignal('ACTIVITY_EVALUATED', {
                        correct: _result.correct,
                        feedback: _result.feedback,
                        explanation: _result.explanation
                    });

                    // 如果正确，发射完成信号
                    if (_result.correct) {
                        _emitSignal('ACTIVITY_COMPLETED', {
                            correct: true,
                            feedback: _result.feedback
                        });

                        // 调用 Runtime.complete()
                        var runtime = window.LawAIApp?.Experience?.Runtime;
                        if (runtime && typeof runtime.complete === 'function') {
                            runtime.complete(_activity.id, { correct: true, feedback: _result.feedback });
                        }
                    }

                    // 重新渲染
                    _render();
                });
            }

            // 键盘支持 (Enter 提交)
            var textInput = _container.querySelector('#practice-text-input');
            if (textInput) {
                textInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        var submitBtn = _container.querySelector('#practice-submit-btn');
                        if (submitBtn) submitBtn.click();
                    }
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
                return {
                    status: _status,
                    isMounted: _isMounted,
                    isSubmitted: _submitted,
                    isEvaluated: _evaluated,
                    isCorrect: _result ? _result.correct : null,
                    hasResult: !!_result
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
            }
        };
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

console.log('✏️ PracticeRenderer loaded (Part 129)');
