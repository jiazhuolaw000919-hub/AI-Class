// ===========================================
// authUI.js
// 简单的登录/注册界面（演示用）
// ===========================================
LawAIApp.AuthUI = {
  render() {
    if (LawAIApp.AuthService.isLoggedIn()) {
      const user = LawAIApp.AuthService.getCurrentUser();
      document.getElementById('app').innerHTML = `
        <div class="page">
          <h2>Welcome back, ${user.name}!</h2>
          <p>XP: ${user.xp} | Level: ${user.level}</p>
          <button class="quick-btn" id="logout-btn">Logout</button>
        </div>
      `;
      document.getElementById('logout-btn').addEventListener('click', () => {
        LawAIApp.AuthService.signOut();
        this.render();
      });
      return;
    }

    document.getElementById('app').innerHTML = `
      <div class="page">
        <h2>Login / Register</h2>
        <input class="search-box" id="auth-email" placeholder="Email">
        <input class="search-box" type="password" id="auth-password" placeholder="Password">
        <input class="search-box" id="auth-name" placeholder="Name (for register)">
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <button class="quick-btn" id="login-btn">Login</button>
          <button class="quick-btn" id="register-btn">Register</button>
        </div>
      </div>
    `;

    document.getElementById('login-btn').addEventListener('click', async () => {
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const result = await LawAIApp.AuthService.signIn(email, password);
      if (result.success) {
        LawAIApp.SessionManager.createSession(result.user.id);
        LawAIApp.Router.navigate('dashboard');
      } else {
        alert(result.error);
      }
    });

    document.getElementById('register-btn').addEventListener('click', async () => {
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value || 'Learner';
      const result = await LawAIApp.AuthService.signUp(email, password, name);
      if (result.success) {
        LawAIApp.SessionManager.createSession(result.user.id);
        LawAIApp.UserInitializer.initializeNewUser(result.user);
        LawAIApp.Router.navigate('dashboard');
      } else {
        alert(result.error);
      }
    });
  }
};
