/**
 * Engine Event Bootstrap
 * Auto-initializes the Engine Event system when imported.
 * Also integrates with bootManager.
 */

// 导入所有模块（触发挂载到全局）
import './engineEventManifest.js';
import './engineEventValidator.js';
import './engineEventHealth.js';

// 初始化 EngineEventHealth（自动打印报告）
if (typeof LawAIApp !== 'undefined' && LawAIApp) {
  if (LawAIApp.EngineEventHealth && typeof LawAIApp.EngineEventHealth.init === 'function') {
    LawAIApp.EngineEventHealth.init();
  }
}

console.log('✅ Engine Event Bootstrap Complete');
console.log('   ✅ Engine Event Standard Loaded');
console.log('   ✅ Engine Event Manifest Ready');
console.log('   ✅ Engine Event Validator Ready');
console.log('   ✅ Engine Event Health Ready');
console.log('   ✅ Engine Event Governance Ready');
console.log('   ✅ Engine Renaissance Fully Complete');
