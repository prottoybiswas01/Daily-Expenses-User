/* ==========================================================================
   DAILY EXPENSES TRACKER - DATA MANAGER & WALLET SYSTEM
   ========================================================================== */

const STORAGE_KEYS = {
  TRANSACTIONS: 'daily_expenses_transactions',
  CATEGORIES: 'daily_expenses_categories',
  WALLETS: 'daily_expenses_wallets',
  USER_SETTINGS: 'daily_expenses_settings',
  SHARED_ACCESS: 'daily_expenses_shared_links',
  AUTH_USER: 'daily_expenses_auth_user'
};

const DEFAULT_WALLETS = {
  bkash: { id: 'bkash', name: 'bKash (বিকাশ)', balance: 4500, icon: 'fa-mobile-alt', color: '#e2136e' },
  nagad: { id: 'nagad', name: 'Nagad (নগদ)', balance: 2200, icon: 'fa-wallet', color: '#f7921e' },
  bank: { id: 'bank', name: 'Bank Account (ব্যাংক)', balance: 8500, icon: 'fa-university', color: '#2563eb' },
  cash: { id: 'cash', name: 'Cash in Hand (নগদ ক্যাশ)', balance: 1800, icon: 'fa-money-bill-wave', color: '#10b981' }
};

const DEFAULT_CATEGORIES = [
  { id: 'cat_transit', name: 'Transport & Fare (গাড়ি ভাড়া)', type: 'expense', icon: 'fa-bus', color: '#6366f1' },
  { id: 'cat_food', name: 'Food & Meals (খাবার)', type: 'expense', icon: 'fa-utensils', color: '#10b981' },
  { id: 'cat_snacks', name: 'Snacks & Personal (চা/নাস্তা/ব্যক্তিগত)', type: 'expense', icon: 'fa-mug-hot', color: '#f59e0b' },
  { id: 'cat_tuition', name: 'Tuition & College Fees (বেতন/টিউশন ফি)', type: 'expense', icon: 'fa-graduation-cap', color: '#ec4899' },
  { id: 'cat_hostel', name: 'Hostel & Rent (হোস্টেল/মেস ভাড়া)', type: 'expense', icon: 'fa-building', color: '#8b5cf6' },
  { id: 'cat_books', name: 'Books & Stationery (বই/খাতা)', type: 'expense', icon: 'fa-book-open', color: '#06b6d4' },
  { id: 'cat_loans', name: 'Loans & Debts (ধার দেওয়া/নেওয়া)', type: 'expense', icon: 'fa-hand-holding-usd', color: '#f43f5e' },
  { id: 'cat_allowance', name: 'Family Allowance (বাসা থেকে টাকা)', type: 'income', icon: 'fa-wallet', color: '#10b981' },
  { id: 'cat_tuition_income', name: 'Tutoring / Freelance (টিউশনি/ফ্রিল্যান্সিং)', type: 'income', icon: 'fa-laptop-code', color: '#3b82f6' }
];

const SEED_TRANSACTIONS = [
  {
    id: 'tx_101',
    title: 'Monthly Hostel Mess Rent (মেস ভাড়া)',
    amount: 5500,
    type: 'expense',
    category: 'cat_hostel',
    walletId: 'bkash',
    date: '2026-08-01',
    method: 'bKash',
    note: 'Paid mess rent & utility bill via bKash',
    flagged: false
  },
  {
    id: 'tx_102',
    title: 'Family Monthly Allowance (বাসার টাকা)',
    amount: 12000,
    type: 'income',
    category: 'cat_allowance',
    walletId: 'bank',
    date: '2026-08-02',
    method: 'Bank Transfer',
    note: 'Father deposited monthly allowance to Bank',
    flagged: false
  },
  {
    id: 'tx_103',
    title: 'University Semester Exam Fee (ফরম ফিলাপ)',
    amount: 2800,
    type: 'expense',
    category: 'cat_tuition',
    walletId: 'nagad',
    date: '2026-08-04',
    method: 'Nagad',
    note: 'Semester exam fee paid via Nagad',
    flagged: false
  },
  {
    id: 'tx_104',
    title: 'Bus Fare & Rickshaw (রিকশা/বাস ভাড়া)',
    amount: 120,
    type: 'expense',
    category: 'cat_transit',
    walletId: 'cash',
    date: '2026-08-05',
    method: 'Cash',
    note: 'Campus commute cash',
    flagged: false
  },
  {
    id: 'tx_105',
    title: 'Private Tuition Income (টিউশনি বেতন)',
    amount: 4500,
    type: 'income',
    category: 'cat_tuition_income',
    walletId: 'bkash',
    date: '2026-08-10',
    method: 'bKash',
    note: 'Received tutoring payment in bKash',
    flagged: false
  }
];

class DataManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WALLETS)) {
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)) {
      const defaultSettings = {
        currency: 'BDT',
        currencySymbol: '৳',
        theme: 'dark',
        monthlyBudget: 15000,
        userName: 'Tanvir Hossain',
        userEmail: 'tanvir.cs@university.edu'
      };
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_USER)) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({ isLoggedIn: true, email: 'tanvir.cs@university.edu', name: 'Tanvir Hossain' }));
    }
  }

  getWallets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WALLETS)) || DEFAULT_WALLETS;
  }

  saveWallets(wallets) {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }

  getTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
  }

  saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  // Automatic Wallet Balance Update Engine
  addTransaction(tx) {
    const list = this.getTransactions();
    tx.id = 'tx_' + Date.now();
    list.unshift(tx);
    this.saveTransactions(list);

    // Update wallet balance automatically
    const wallets = this.getWallets();
    const wId = tx.walletId || 'cash';
    if (wallets[wId]) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'expense') {
        wallets[wId].balance = Math.max(0, wallets[wId].balance - amt);
      } else {
        wallets[wId].balance += amt;
      }
      this.saveWallets(wallets);
    }

    return tx;
  }

  deleteTransaction(id) {
    let list = this.getTransactions();
    const target = list.find(t => t.id === id);
    if (target) {
      // Revert wallet balance
      const wallets = this.getWallets();
      const wId = target.walletId || 'cash';
      if (wallets[wId]) {
        const amt = parseFloat(target.amount) || 0;
        if (target.type === 'expense') {
          wallets[wId].balance += amt;
        } else {
          wallets[wId].balance = Math.max(0, wallets[wId].balance - amt);
        }
        this.saveWallets(wallets);
      }
    }

    list = list.filter(t => t.id !== id);
    this.saveTransactions(list);
  }

  // Inter-wallet Transfer System
  transferBetweenWallets(fromWId, toWId, amount) {
    const wallets = this.getWallets();
    if (!wallets[fromWId] || !wallets[toWId]) return false;

    const amt = parseFloat(amount) || 0;
    if (amt <= 0 || wallets[fromWId].balance < amt) return false;

    wallets[fromWId].balance -= amt;
    wallets[toWId].balance += amt;
    this.saveWallets(wallets);

    // Record as transfer transaction
    const tx = {
      id: 'tx_' + Date.now(),
      title: `Transfer: ${wallets[fromWId].name.split(' (')[0]} → ${wallets[toWId].name.split(' (')[0]}`,
      amount: amt,
      type: 'expense',
      category: 'cat_transit',
      walletId: fromWId,
      date: new Date().toISOString().split('T')[0],
      method: wallets[fromWId].name.split(' (')[0],
      note: `Internal wallet transfer`,
      flagged: false
    };

    const list = this.getTransactions();
    list.unshift(tx);
    this.saveTransactions(list);

    return true;
  }

  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || DEFAULT_CATEGORIES;
  }

  getCategoryById(id) {
    return this.getCategories().find(c => c.id === id) || {
      name: 'Uncategorized', icon: 'fa-tags', color: '#94a3b8'
    };
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)) || {};
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  getAuthUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USER)) || { isLoggedIn: true, email: 'tanvir.cs@university.edu', name: 'Tanvir Hossain' };
  }

  setAuthUser(user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }

  getSharedLinks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHARED_ACCESS)) || [];
  }

  addSharedLink(email, name) {
    const list = this.getSharedLinks();
    const newLink = {
      id: 'shr_' + Date.now(),
      accessCode: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      recipientEmail: email,
      recipientName: name,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      permission: 'Read-Only Observer'
    };
    list.push(newLink);
    localStorage.setItem(STORAGE_KEYS.SHARED_ACCESS, JSON.stringify(list));
    return newLink;
  }

  getFinancialSummary() {
    const transactions = this.getTransactions();
    const wallets = this.getWallets();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') totalIncome += amt;
      else totalExpense += amt;
    });

    let netBalance = 0;
    Object.values(wallets).forEach(w => {
      netBalance += w.balance;
    });

    const settings = this.getSettings();
    const budget = settings.monthlyBudget || 15000;
    const budgetUsedPercent = Math.min(Math.round((totalExpense / budget) * 100), 100);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      budget,
      budgetUsedPercent
    };
  }
}

const dataManager = new DataManager();
