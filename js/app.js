/* ==========================================================================
   DAILY EXPENSES TRACKER - MAIN APP CONTROLLER (AUTHENTICATION & WALLETS)
   ========================================================================== */

class AppController {
  constructor() {
    this.currentRole = 'student'; // 'student' | 'guardian' | 'admin'
    this.currentView = 'dashboard';
    this.selectedCategoryFilter = 'all';
    this.searchQuery = '';
    this.currentCurrency = '৳';
  }

  init() {
    this.setupEventListeners();
    this.loadTheme();
    this.checkAuth();
    this.renderCurrentView();
  }

  setupEventListeners() {
    // Top Nav buttons
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

  checkAuth() {
    const auth = dataManager.getAuthUser();
    if (!auth || !auth.isLoggedIn) {
      this.switchView('auth');
    }
  }

  loadTheme() {
    const settings = dataManager.getSettings();
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    dataManager.updateSettings({ theme: nextTheme });
    this.showToast(`Theme switched to ${nextTheme} mode`, 'info');
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
    this.updateMetrics();
    this.renderWalletsSummary();

    const categories = dataManager.getCategories();
    const transactions = this.getFilteredTransactions();

    if (this.currentView === 'dashboard') {
      this.renderTransactionList('recentTxList', transactions.slice(0, 6));
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

  // Render Wallet Balances (bKash, Nagad, Bank, Cash)
  renderWalletsSummary() {
    const container = document.getElementById('walletsGridContainer');
    if (!container) return;

    const wallets = dataManager.getWallets();
    const sym = this.currentCurrency;

    const html = `
      <div class="wallet-card bkash">
        <div class="wallet-top">
          <div class="wallet-name"><i class="fas fa-mobile-alt"></i> bKash (বিকাশ)</div>
          <div class="wallet-icon"><i class="fas fa-wallet"></i></div>
        </div>
        <div class="wallet-balance">${sym}${wallets.bkash.balance.toLocaleString()}</div>
        <div class="wallet-footer">
          <span>Mobile Wallet</span>
          <span>Active</span>
        </div>
      </div>

      <div class="wallet-card nagad">
        <div class="wallet-top">
          <div class="wallet-name"><i class="fas fa-wallet"></i> Nagad (নগদ)</div>
          <div class="wallet-icon"><i class="fas fa-paper-plane"></i></div>
        </div>
        <div class="wallet-balance">${sym}${wallets.nagad.balance.toLocaleString()}</div>
        <div class="wallet-footer">
          <span>Digital Cash</span>
          <span>Active</span>
        </div>
      </div>

      <div class="wallet-card bank">
        <div class="wallet-top">
          <div class="wallet-name"><i class="fas fa-university"></i> Bank (ব্যাংক)</div>
          <div class="wallet-icon"><i class="fas fa-piggy-bank"></i></div>
        </div>
        <div class="wallet-balance">${sym}${wallets.bank.balance.toLocaleString()}</div>
        <div class="wallet-footer">
          <span>Savings Account</span>
          <span>Active</span>
        </div>
      </div>

      <div class="wallet-card cash">
        <div class="wallet-top">
          <div class="wallet-name"><i class="fas fa-money-bill-wave"></i> Cash (ক্যাশ)</div>
          <div class="wallet-icon"><i class="fas fa-hand-holding-usd"></i></div>
        </div>
        <div class="wallet-balance">${sym}${wallets.cash.balance.toLocaleString()}</div>
        <div class="wallet-footer">
          <span>Cash in Hand</span>
          <span>Active</span>
        </div>
      </div>
    `;

    container.innerHTML = html;
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
      elemBudget.textContent = `${summary.budgetUsedPercent}% used (${sym}${summary.totalExpense.toLocaleString()} / ${sym}${summary.budget.toLocaleString()})`;
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
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No transaction records found.</p>
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
    this.showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
    this.switchView('dashboard');
  }

  handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    dataManager.setAuthUser({ isLoggedIn: true, email, name });
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
          <div class="panel-title"><i class="fas fa-user-cog"></i> System Admin Dashboard</div>
          <span class="tag-method" style="background: var(--primary-glow); color: var(--primary);">System Admin Mode</span>
        </div>
        <div class="wallets-grid" style="margin-bottom: 1.5rem;">
          <div class="wallet-card bkash">
            <div class="wallet-name">Total System Transactions</div>
            <div class="wallet-balance">${txs.length}</div>
          </div>
          <div class="wallet-card bank">
            <div class="wallet-name">Active Categories</div>
            <div class="wallet-balance">${categories.length}</div>
          </div>
          <div class="wallet-card cash">
            <div class="wallet-name">Guardian Reference Observers</div>
            <div class="wallet-balance">${links.length}</div>
          </div>
        </div>
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
