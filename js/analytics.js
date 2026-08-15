/* ==========================================================================
   DAILY EXPENSES TRACKER - ANALYTICS & EXPORT ENGINE (PDF & CSV STATEMENT)
   ========================================================================== */

class AnalyticsEngine {

  renderCategoryBars(containerId, transactions, categories, currency = '৳') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fas fa-chart-bar" style="font-size: 1.5rem; opacity: 0.4; margin-bottom: 0.5rem;"></i>
          <p style="font-size: 0.85rem;">No expenses logged for category distribution.</p>
        </div>
      `;
      return;
    }

    const catTotals = {};
    let totalExpenseSum = 0;

    expenses.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      catTotals[t.category] = (catTotals[t.category] || 0) + amt;
      totalExpenseSum += amt;
    });

    const sortedCats = Object.keys(catTotals).map(catId => {
      const catObj = categories.find(c => c.id === catId) || { name: 'Other', icon: 'fa-tags', color: '#64748b' };
      return {
        ...catObj,
        amount: catTotals[catId],
        percent: totalExpenseSum > 0 ? Math.round((catTotals[catId] / totalExpenseSum) * 100) : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    const html = sortedCats.map(c => `
      <div style="margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.25rem;">
          <span><i class="fas ${c.icon}" style="color: ${c.color};"></i> ${c.name.split(' (')[0]}</span>
          <span>${currency}${c.amount.toLocaleString()} (${c.percent}%)</span>
        </div>
        <div style="height: 7px; background: var(--bg-input); border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${c.percent}%; background: ${c.color}; border-radius: 4px; transition: width 0.4s ease;"></div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  renderCategoryDoughnut(containerId, transactions, categories, currency = '৳') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fas fa-chart-pie" style="font-size: 1.8rem; opacity: 0.4; margin-bottom: 0.4rem;"></i>
          <p style="font-size: 0.85rem;">No expenses logged for doughnut visualizer.</p>
        </div>
      `;
      return;
    }

    const catTotals = {};
    let totalSum = 0;
    expenses.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      catTotals[t.category] = (catTotals[t.category] || 0) + amt;
      totalSum += amt;
    });

    const entries = Object.keys(catTotals).map(catId => {
      const catObj = categories.find(c => c.id === catId) || { name: 'Other', color: '#94a3b8' };
      return {
        name: catObj.name.split(' (')[0],
        color: catObj.color,
        amount: catTotals[catId],
        percent: Math.round((catTotals[catId] / totalSum) * 100)
      };
    });

    let currentAngle = 0;
    const gradientParts = entries.map(e => {
      const start = currentAngle;
      currentAngle += e.percent;
      return `${e.color} ${start}% ${currentAngle}%`;
    });

    const conicGrad = `conic-gradient(${gradientParts.join(', ')})`;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; background: ${conicGrad}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="width: 85px; height: 85px; border-radius: 50%; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 0.7rem; color: var(--text-muted);">Total Spent</span>
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); font-family: 'Outfit';">${currency}${totalSum.toLocaleString()}</span>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 1rem; max-width: 280px;">
          ${entries.map(e => `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${e.color}; display: inline-block;"></span>
              <span style="color: var(--text-secondary);">${e.name} (${e.percent}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 1-Click CSV Export for Excel
  exportToCSV(transactions) {
    if (!transactions || transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Date,Title,Amount,Type,Wallet,Category,Note\n";
    transactions.forEach(t => {
      const row = [
        t.id,
        t.date,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.method || 'Cash',
        t.category,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Expense_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 1-Click Print & PDF Statement Generator
  printStatement(transactions, summary, user) {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Financial Statement - Daily Expenses</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: bold; color: #2563eb; }
          .sub { font-size: 14px; color: #64748b; margin-top: 4px; }
          .summary-grid { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .summary-box { text-align: center; }
          .summary-box .val { font-size: 18px; font-weight: bold; }
          .summary-box .label { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; }
          .income-tx { color: #16a34a; font-weight: 600; }
          .expense-tx { color: #dc2626; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Daily Expenses & Student Budget Statement</div>
          <div class="sub">Student: ${user.name || 'Tanvir Hossain'} (${user.email || 'tanvir.cs@university.edu'}) | Generated: ${dateStr}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-box">
            <div class="val" style="color: #16a34a;">৳${summary.totalIncome.toLocaleString()}</div>
            <div class="label">Total Income (আয়)</div>
          </div>
          <div class="summary-box">
            <div class="val" style="color: #dc2626;">৳${summary.totalExpense.toLocaleString()}</div>
            <div class="label">Total Expense (খরচ)</div>
          </div>
          <div class="summary-box">
            <div class="val" style="color: #2563eb;">৳${summary.netBalance.toLocaleString()}</div>
            <div class="label">Net Liquidity Balance</div>
          </div>
        </div>

        <h3>Itemized Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Wallet</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td>${t.method || 'Cash'}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'income-tx' : 'expense-tx'}">${t.type.toUpperCase()}</td>
                <td class="${t.type === 'income' ? 'income-tx' : 'expense-tx'}">${t.type === 'income' ? '+' : '-'}৳${parseFloat(t.amount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by Daily Expenses Tracker System for Student & Guardian Audit Reference.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}

const analyticsEngine = new AnalyticsEngine();
