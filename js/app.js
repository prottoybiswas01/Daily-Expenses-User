/* ==========================================================================
   DAILY EXPENSES TRACKER - MAIN APP CONTROLLER (TOP-UP & WALLET ENGINE)
   ========================================================================== */

class AppController {
  constructor() {
    this.currentRole = 'student'; // 'student' | 'guardian' | 'admin'
    this.currentView = 'home';
    this.selectedCategoryFilter = 'all';
    this.searchQuery = '';
    this.currentCurrency = '৳';
  }

  init() {
    this.setupEventListeners();
    this.loadTheme();
    this.checkAuthUI();
    
    const auth = dataManager.getAuthUser();
    if (auth && auth.isLoggedIn) {
      this.switchView('dashboard');
    } else {
      this.switchView('home');
    }
  }

  setupEventListeners() {
    // Nav buttons
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        this.switchView(targetView);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Role Switcher
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const role = pill.dataset.role;
        this.switchRole(role);
      });
    });
  }

  checkAuthUI() {
    const auth = dataManager.getAuthUser();
    const isLoggedIn = auth && auth.isLoggedIn;

    document.querySelectorAll('.auth-only-nav').forEach(elem => {
      elem.style.display = isLoggedIn ? 'inline-flex' : 'none';
    });

    const roleBox = document.getElementById('roleSelectorBox');
    if (roleBox) {
      roleBox.style.display = isLoggedIn ? 'flex' : 'none';
    }

    const navAuthText = document.getElementById('navAuthText');
    if (navAuthText) {
      navAuthText.textContent = isLoggedIn ? 'Logout' : 'Login';
    }

    const userNameElem = document.getElementById('dashUserName');
    if (userNameElem && auth.name) {
      userNameElem.textContent = auth.name;
    }
  }

  handleAuthNavClick() {
    const auth = dataManager.getAuthUser();
    if (auth && auth.isLoggedIn) {
      this.logout();
    } else {
      this.switchView('auth');
    }
  }

  quickDemoLogin() {
    dataManager.setAuthUser({ isLoggedIn: true, email: 'student@university.edu', name: 'Tanvir Hossain' });
    this.checkAuthUI();
    this.showToast('Logged in to Student Dashboard!', 'success');
    this.switchView('dashboard');
  }

  logout() {
    dataManager.setAuthUser({ isLoggedIn: false, email: '', name: '' });
    this.checkAuthUI();
    this.showToast('Logged out successfully.', 'info');
    this.switchView('home');
  }

  loadTheme() {
    const settings = dataManager.getSettings();
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    dataManager.updateSettings({ theme: nextTheme });
    this.showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Velvet' : 'Light Luxe'} mode`, 'info');
  }

  // Clear / Reset all data to 0 clean slate
  resetAllAppData() {
    if (confirm('Are you sure you want to clear all data and reset wallet balances to ৳0?')) {
      dataManager.clearAllData();
      this.showToast('All transaction records & wallet balances cleared to ৳0!', 'success');
      this.renderCurrentView();
    }
  }

  switchRole(role) {
    this.currentRole = role;
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.role === role);
    });

    const bannerElem = document.getElementById('roleGuardianNotice');
    if (bannerElem) {
      bannerElem.style.display = (role === 'guardian') ? 'block' : 'none';
    }

    this.showToast(`Switched to ${role.toUpperCase()} View Mode`, 'info');
    this.renderCurrentView();
  }

  switchView(viewName) {
    const auth = dataManager.getAuthUser();
    if (viewName !== 'home' && viewName !== 'auth' && (!auth || !auth.isLoggedIn)) {
      this.showToast('Please login to access the Student Dashboard.', 'info');
      viewName = 'auth';
    }

    this.currentView = viewName;

    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    this.renderCurrentView();
  }

  renderCurrentView() {
    this.checkAuthUI();
    this.updateMetrics();
    this.renderWalletsSummary();

    const categories = dataManager.getCategories();
    const transactions = this.getFilteredTransactions();

    if (this.currentView === 'dashboard') {
      this.renderTransactionList('recentTxList', transactions.slice(0, 6));
      this.renderQuickAddCategories();
      this.renderSpendingTrendChart(transactions);
      analyticsEngine.renderCategoryBars('categoryBarsContainer', transactions, categories, this.currentCurrency);
      analyticsEngine.renderCategoryDoughnut('doughnutChartContainer', transactions, categories, this.currentCurrency);
    } else if (this.currentView === 'transactions') {
      this.renderTransactionList('fullTxList', transactions);
      this.populateCategoryFilterDropdown();
    } else if (this.currentView === 'analytics') {
      analyticsEngine.renderCategoryDoughnut('fullDoughnutChart', transactions, categories, this.currentCurrency);
      analyticsEngine.renderCategoryBars('fullCategoryBars', transactions, categories, this.currentCurrency);
      this.renderAnalyticsSummary(transactions);
    } else if (this.currentView === 'share') {
      shareManager.renderSharePanel('sharePanelContainer');
    } else if (this.currentView === 'admin') {
      this.renderAdminPanel();
    }
  }

  // Render Vibrant Wallet Cards (bKash, Nagad, Bank, Cash) with Top Up & Pay Action Pills
  renderWalletsSummary() {
    const container = document.getElementById('walletsGridContainer');
    if (!container) return;

    const wallets = dataManager.getWallets();
    const sym = this.currentCurrency;

    const html = `
      <div class="wallet-card-vibrant bkash">
        <div class="wallet-vibrant-top">
          <div class="wallet-vibrant-name"><i class="fas fa-mobile-alt"></i> bKash (বিকাশ)</div>
          <div class="wallet-vibrant-icon"><i class="fas fa-wallet"></i></div>
        </div>
        <div class="wallet-vibrant-balance">${sym}${wallets.bkash.balance.toLocaleString()}</div>
        <div class="wallet-vibrant-bottom">
          <button class="wallet-action-pill" onclick="appController.openTopUpModal('bkash')">
            <i class="fas fa-plus"></i> Add Money
          </button>
          <button class="wallet-action-pill" style="background: rgba(0,0,0,0.2);" onclick="appController.openAddModalWithWallet('bkash')">
            <i class="fas fa-minus"></i> Spend
          </button>
        </div>
      </div>

      <div class="wallet-card-vibrant nagad">
        <div class="wallet-vibrant-top">
          <div class="wallet-vibrant-name"><i class="fas fa-wallet"></i> Nagad (নগদ)</div>
          <div class="wallet-vibrant-icon"><i class="fas fa-paper-plane"></i></div>
        </div>
        <div class="wallet-vibrant-balance">${sym}${wallets.nagad.balance.toLocaleString()}</div>
        <div class="wallet-vibrant-bottom">
          <button class="wallet-action-pill" onclick="appController.openTopUpModal('nagad')">
            <i class="fas fa-plus"></i> Add Money
          </button>
          <button class="wallet-action-pill" style="background: rgba(0,0,0,0.2);" onclick="appController.openAddModalWithWallet('nagad')">
            <i class="fas fa-minus"></i> Spend
          </button>
        </div>
      </div>

      <div class="wallet-card-vibrant bank">
        <div class="wallet-vibrant-top">
          <div class="wallet-vibrant-name"><i class="fas fa-university"></i> Bank Account (ব্যাংক)</div>
          <div class="wallet-vibrant-icon"><i class="fas fa-piggy-bank"></i></div>
        </div>
        <div class="wallet-vibrant-balance">${sym}${wallets.bank.balance.toLocaleString()}</div>
        <div class="wallet-vibrant-bottom">
          <button class="wallet-action-pill" onclick="appController.openTopUpModal('bank')">
            <i class="fas fa-plus"></i> Add Money
          </button>
          <button class="wallet-action-pill" style="background: rgba(0,0,0,0.2);" onclick="appController.openAddModalWithWallet('bank')">
            <i class="fas fa-minus"></i> Spend
          </button>
        </div>
      </div>

      <div class="wallet-card-vibrant cash">
        <div class="wallet-vibrant-top">
          <div class="wallet-vibrant-name"><i class="fas fa-money-bill-wave"></i> Cash in Hand (নগদ)</div>
          <div class="wallet-vibrant-icon"><i class="fas fa-hand-holding-usd"></i></div>
        </div>
        <div class="wallet-vibrant-balance">${sym}${wallets.cash.balance.toLocaleString()}</div>
        <div class="wallet-vibrant-bottom">
          <button class="wallet-action-pill" onclick="appController.openTopUpModal('cash')">
            <i class="fas fa-plus"></i> Add Cash
          </button>
          <button class="wallet-action-pill" style="background: rgba(0,0,0,0.2);" onclick="appController.openAddModalWithWallet('cash')">
            <i class="fas fa-minus"></i> Spend
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Quick Add Expense Widget on Dashboard
  renderQuickAddCategories() {
    const select = document.getElementById('quickCatSelect');
    if (!select) return;

    const categories = dataManager.getCategories().filter(c => c.type === 'expense');
    select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  handleQuickAddExpense(event) {
    event.preventDefault();
    if (this.currentRole === 'guardian') {
      this.showToast('Guardian Observer Mode is Read-Only.', 'info');
      return;
    }

    const title = document.getElementById('quickTitleInput').value.trim();
    const amount = parseFloat(document.getElementById('quickAmountInput').value);
    const category = document.getElementById('quickCatSelect').value;
    const walletId = document.getElementById('quickWalletSelect').value;

    if (!title || isNaN(amount) || amount <= 0) {
      this.showToast('Please enter a title and valid expense amount.', 'error');
      return;
    }

    const walletNames = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank Transfer', cash: 'Cash' };

    const newTx = {
      title,
      amount,
      type: 'expense',
      category,
      walletId,
      date: new Date().toISOString().split('T')[0],
      method: walletNames[walletId] || 'Cash',
      note: 'Quick add from dashboard sidebar',
      flagged: false
    };

    dataManager.addTransaction(newTx);
    this.showToast(`Logged Expense: ${title} (${this.currentCurrency}${amount}) via ${walletNames[walletId]}`, 'success');
    this.renderCurrentView();

    document.getElementById('quickAddForm').reset();
  }

  // Spending Trend Line Visualizer
  renderSpendingTrendChart(transactions) {
    const container = document.getElementById('spendingTrendContainer');
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense').slice(0, 10).reverse();

    if (expenses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fas fa-chart-line" style="font-size: 1.8rem; opacity: 0.4; margin-bottom: 0.4rem;"></i>
          <p style="font-size: 0.88rem;">No spending recorded yet. Add money to your wallet to start tracking!</p>
        </div>
      `;
      return;
    }

    const amounts = expenses.map(e => parseFloat(e.amount));
    const maxVal = Math.max(...amounts, 1);
    const svgWidth = 500;
    const svgHeight = 140;
    const padding = 20;

    const points = amounts.map((val, idx) => {
      const x = padding + (idx / (amounts.length - 1 || 1)) * (svgWidth - 2 * padding);
      const y = svgHeight - padding - (val / maxVal) * (svgHeight - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const polyPoints = `${padding},${svgHeight - padding} ${points} ${svgWidth - padding},${svgHeight - padding}`;

    const svg = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 140px; overflow: visible;">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <polygon points="${polyPoints}" fill="url(#trendGrad)"/>
        <polyline points="${points}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${amounts.map((val, idx) => {
          const x = padding + (idx / (amounts.length - 1 || 1)) * (svgWidth - 2 * padding);
          const y = svgHeight - padding - (val / maxVal) * (svgHeight - 2 * padding);
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="2"/>`;
        }).join('')}
      </svg>
    `;

    container.innerHTML = svg;
  }

  updateMetrics() {
    const summary = dataManager.getFinancialSummary();
    const sym = this.currentCurrency;

    const elemIncome = document.getElementById('metricIncome');
    const elemExpense = document.getElementById('metricExpense');
    const elemBalance = document.getElementById('metricBalance');
    const elemBudget = document.getElementById('metricBudget');

    if (elemIncome) elemIncome.textContent = `${sym}${summary.totalIncome.toLocaleString()}`;
    if (elemExpense) elemExpense.textContent = `${sym}${summary.totalExpense.toLocaleString()}`;
    if (elemBalance) elemBalance.textContent = `${sym}${summary.netBalance.toLocaleString()}`;
    if (elemBudget) {
      if (summary.budget > 0) {
        elemBudget.textContent = `${summary.budgetUsedPercent}% used (${sym}${summary.totalExpense.toLocaleString()} / ${sym}${summary.budget.toLocaleString()})`;
      } else {
        elemBudget.textContent = summary.totalIncome > 0 
          ? `Budget: ${sym}${summary.totalIncome.toLocaleString()} (From Income)`
          : `${sym}0 set (Click Add Money)`;
      }
    }
  }

  getFilteredTransactions() {
    let list = dataManager.getTransactions();

    if (this.selectedCategoryFilter && this.selectedCategoryFilter !== 'all') {
      list = list.filter(t => t.category === this.selectedCategoryFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.method && t.method.toLowerCase().includes(q))
      );
    }

    return list;
  }

  renderTransactionList(containerId, transactions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <i class="fas fa-receipt" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4;"></i>
          <p style="font-size: 0.9rem; font-weight: 600;">No transactions recorded yet.</p>
          <p style="font-size: 0.8rem;">Click "Add Money / Top Up" to deposit money into your bKash, Nagad, Bank, or Cash wallet!</p>
        </div>
      `;
      return;
    }

    const html = transactions.map(t => {
      const cat = dataManager.getCategoryById(t.category);
      const isIncome = t.type === 'income';
      const amountSign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'income' : 'expense';
      const iconBg = isIncome ? 'var(--success-bg)' : 'var(--danger-bg)';
      const iconColor = isIncome ? 'var(--success)' : 'var(--danger)';

      const walletClass = t.walletId || 'cash';

      const deleteBtn = (this.currentRole === 'guardian') 
        ? `<span class="tag-method" style="color: var(--text-sub);">Read-Only</span>`
        : `<button class="icon-btn" onclick="appController.deleteTx('${t.id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>`;

      return `
        <div class="tx-item">
          <div class="tx-left">
            <div class="tx-icon" style="background: ${iconBg}; color: ${iconColor};">
              <i class="fas ${cat.icon}"></i>
            </div>
            <div class="tx-info">
              <div class="tx-title">${t.title}</div>
              <div class="tx-meta">
                <span><i class="far fa-calendar-alt"></i> ${t.date}</span>
                <span class="tag-method ${walletClass}">${t.method || 'Cash'}</span>
                <span>• ${cat.name.split(' (')[0]}</span>
              </div>
            </div>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${amountClass}">${amountSign}${this.currentCurrency}${parseFloat(t.amount).toLocaleString()}</div>
            <div class="tx-actions">
              ${deleteBtn}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // TOP UP / ADD MONEY MODAL HANDLERS
  openTopUpModal(walletId = 'bkash') {
    if (this.currentRole === 'guardian') {
      this.showToast('Guardian Observer Mode is Read-Only.', 'info');
      return;
    }

    const modal = document.getElementById('topUpModal');
    const select = document.getElementById('topUpWalletSelect');
    if (select) select.value = walletId;

    modal.classList.add('active');
  }

  closeTopUpModal() {
    document.getElementById('topUpModal').classList.remove('active');
  }

  handleSaveTopUp(event) {
    event.preventDefault();

    const walletId = document.getElementById('topUpWalletSelect').value;
    const amount = parseFloat(document.getElementById('topUpAmount').value);
    const sourceName = document.getElementById('topUpSource').value.trim();
    const budgetInput = document.getElementById('topUpBudget').value.trim();

    if (isNaN(amount) || amount <= 0) {
      this.showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    const newBudget = budgetInput ? parseFloat(budgetInput) : null;
    const success = dataManager.topUpWallet(walletId, amount, sourceName || 'Allowance Deposit', newBudget);

    if (success) {
      const walletNames = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank Account', cash: 'Cash' };
      this.closeTopUpModal();
      this.showToast(`Added ${this.currentCurrency}${amount} to ${walletNames[walletId]} wallet!`, 'success');
      this.renderCurrentView();
    } else {
      this.showToast('Failed to deposit money to wallet.', 'error');
    }
  }

  populateCategoryFilterDropdown() {
    const select = document.getElementById('filterCategorySelect');
    if (!select) return;

    const categories = dataManager.getCategories();
    let options = `<option value="all">All Categories</option>`;
    categories.forEach(c => {
      options += `<option value="${c.id}">${c.name}</option>`;
    });
    select.innerHTML = options;
  }

  handleSearchInput(value) {
    this.searchQuery = value;
    this.renderCurrentView();
  }

  handleCategoryFilter(catId) {
    this.selectedCategoryFilter = catId;
    this.renderCurrentView();
  }

  // Modals & Action Controls
  openAddModal(type = 'expense') {
    if (this.currentRole === 'guardian') {
      this.showToast('Guardian Observer Mode is Read-Only.', 'info');
      return;
    }

    const modal = document.getElementById('addTxModal');
    document.getElementById('txType').value = type;
    document.getElementById('modalTxTitle').textContent = type === 'income' ? 'Add Income (আয় যুক্ত করুন)' : 'Add Expense (খরচ যোগ করুন)';

    const catSelect = document.getElementById('txCategory');
    const categories = dataManager.getCategories().filter(c => c.type === type);
    catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  }

  openAddModalWithWallet(walletId) {
    this.openAddModal('expense');
    const walletSelect = document.getElementById('txWalletSelect');
    if (walletSelect) walletSelect.value = walletId;
  }

  closeAddModal() {
    document.getElementById('addTxModal').classList.remove('active');
  }

  handleSaveTransaction(event) {
    event.preventDefault();

    const title = document.getElementById('txTitleInput').value.trim();
    const amount = parseFloat(document.getElementById('txAmountInput').value);
    const type = document.getElementById('txType').value;
    const category = document.getElementById('txCategory').value;
    const date = document.getElementById('txDate').value;
    const walletId = document.getElementById('txWalletSelect').value;
    const note = document.getElementById('txNoteInput').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
      this.showToast('Please enter a valid title and amount.', 'error');
      return;
    }

    const walletNames = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank Transfer', cash: 'Cash' };

    const newTx = {
      title,
      amount,
      type,
      category,
      walletId,
      date,
      method: walletNames[walletId] || 'Cash',
      note,
      flagged: false
    };

    dataManager.addTransaction(newTx);
    this.closeAddModal();
    this.showToast(`Logged ${type}: ${title} (${walletNames[walletId]})`, 'success');
    this.renderCurrentView();

    document.getElementById('txForm').reset();
  }

  deleteTx(id) {
    if (confirm('Are you sure you want to delete this record?')) {
      dataManager.deleteTransaction(id);
      this.showToast('Transaction removed & balance adjusted', 'info');
      this.renderCurrentView();
    }
  }

  // Inter-wallet Transfer Modal
  openTransferModal() {
    document.getElementById('transferModal').classList.add('active');
  }

  closeTransferModal() {
    document.getElementById('transferModal').classList.remove('active');
  }

  handleSaveTransfer(event) {
    event.preventDefault();

    const fromW = document.getElementById('transferFromWallet').value;
    const toW = document.getElementById('transferToWallet').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    if (fromW === toW) {
      this.showToast('Select two different wallets to transfer.', 'error');
      return;
    }

    const success = dataManager.transferBetweenWallets(fromW, toW, amount);
    if (success) {
      this.closeTransferModal();
      this.showToast(`Transferred ${this.currentCurrency}${amount} successfully!`, 'success');
      this.renderCurrentView();
    } else {
      this.showToast('Insufficient wallet balance for transfer.', 'error');
    }
  }

  // Authentication Handlers
  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    dataManager.setAuthUser({ isLoggedIn: true, email, name: email.split('@')[0] });
    this.checkAuthUI();
    this.showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
    this.switchView('dashboard');
  }

  handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    dataManager.setAuthUser({ isLoggedIn: true, email, name });
    this.checkAuthUI();
    this.showToast(`Account created for ${name}!`, 'success');
    this.switchView('dashboard');
  }

  renderAnalyticsSummary(transactions) {
    const container = document.getElementById('analyticsSummaryBox');
    if (!container) return;

    const summary = dataManager.getFinancialSummary();
    const expenses = transactions.filter(t => t.type === 'expense');

    let highest = null;
    expenses.forEach(e => {
      if (!highest || parseFloat(e.amount) > parseFloat(highest.amount)) {
        highest = e;
      }
    });

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="background: var(--bg-input); padding: 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Savings Rate</div>
          <div style="font-size: 1.4rem; font-weight: 700; color: var(--success); font-family: 'Outfit';">
            ${summary.totalIncome > 0 ? Math.round((summary.netBalance / summary.totalIncome) * 100) : 0}%
          </div>
        </div>
        <div style="background: var(--bg-input); padding: 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Largest Single Expense</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--danger); font-family: 'Outfit'; margin-top: 4px;">
            ${highest ? `${this.currentCurrency}${parseFloat(highest.amount).toLocaleString()} (${highest.title})` : 'N/A'}
          </div>
        </div>
      </div>
    `;
  }

  renderAdminPanel() {
    const container = document.getElementById('adminPanelContainer');
    if (!container) return;

    const txs = dataManager.getTransactions();
    const categories = dataManager.getCategories();
    const links = dataManager.getSharedLinks();

    container.innerHTML = `
      <div class="card-panel">
        <div class="panel-header">
          <div class="panel-title"><i class="fas fa-user-cog"></i> System Administration Control</div>
          <span class="tag-method" style="background: var(--primary-bg); color: var(--primary);">Admin Restricted</span>
        </div>
        <div class="wallets-grid" style="margin-bottom: 1.5rem;">
          <div class="card-panel" style="padding: 1.2rem; margin-bottom: 0;">
            <div class="metric-title">System Transactions</div>
            <div class="metric-value">${txs.length}</div>
          </div>
          <div class="card-panel" style="padding: 1.2rem; margin-bottom: 0;">
            <div class="metric-title">Expense Categories</div>
            <div class="metric-value">${categories.length}</div>
          </div>
          <div class="card-panel" style="padding: 1.2rem; margin-bottom: 0;">
            <div class="metric-title">Guardian Observers</div>
            <div class="metric-value">${links.length}</div>
          </div>
        </div>
        <button class="btn btn-secondary" style="color: var(--danger); border-color: var(--danger);" onclick="appController.resetAllAppData()">
          <i class="fas fa-trash-alt"></i> Reset System Data to Clean Slate (৳0)
        </button>
      </div>
    `;
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => { toast.remove(); }, 4000);
  }
}

const appController = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  appController.init();
});
