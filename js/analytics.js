/* ==========================================================================
   DAILY EXPENSES TRACKER - CHARTS & VISUAL ANALYTICS MODULE
   ========================================================================== */

class AnalyticsEngine {
  constructor() {}

  // Render SVG Category Doughnut/Pie Breakdown
  renderCategoryDoughnut(containerId, transactions, categories, currencySymbol = '৳') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filter expenses only
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by category
    const catTotals = {};
    let totalExpenseSum = 0;

    expenses.forEach(t => {
      const catId = t.category;
      catTotals[catId] = (catTotals[catId] || 0) + parseFloat(t.amount);
      totalExpenseSum += parseFloat(t.amount);
    });

    if (totalExpenseSum === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-chart-pie"></i>
          <p>No expense data logged yet</p>
        </div>
      `;
      return;
    }

    // Build SVG Donut arcs
    let currentAngle = 0;
    const slices = [];
    const legendItems = [];

    Object.keys(catTotals).forEach(catId => {
      const amount = catTotals[catId];
      const category = categories.find(c => c.id === catId) || { name: 'Other', color: '#94a3b8' };
      const percentage = (amount / totalExpenseSum) * 100;
      const angle = (amount / totalExpenseSum) * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      slices.push({
        startAngle,
        endAngle,
        color: category.color,
        name: category.name,
        percentage: percentage.toFixed(1),
        amount
      });

      legendItems.push(`
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${category.color}; display: inline-block;"></span>
            <span style="color: var(--text-muted); font-weight: 500;">${category.name.split(' (')[0]}</span>
          </div>
          <span style="font-weight: 700;">${currencySymbol}${amount.toLocaleString()} (${percentage.toFixed(0)}%)</span>
        </div>
      `);
    });

    // Helper for SVG Arc Paths
    const getArcPath = (cx, cy, r, innerR, startAngle, endAngle) => {
      const rad = deg => (deg - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(rad(startAngle));
      const y1 = cy + r * Math.sin(rad(startAngle));
      const x2 = cx + r * Math.cos(rad(endAngle));
      const y2 = cy + r * Math.sin(rad(endAngle));

      const ix1 = cx + innerR * Math.cos(rad(endAngle));
      const iy1 = cy + innerR * Math.sin(rad(endAngle));
      const ix2 = cx + innerR * Math.cos(rad(startAngle));
      const iy2 = cy + innerR * Math.sin(rad(startAngle));

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    };

    let svgPaths = '';
    slices.forEach(s => {
      // Avoid 360-deg arc glitch
      const endA = s.endAngle >= 360 ? 359.99 : s.endAngle;
      const pathData = getArcPath(110, 110, 95, 60, s.startAngle, endA);
      svgPaths += `<path d="${pathData}" fill="${s.color}" opacity="0.9">
        <title>${s.name}: ${currencySymbol}${s.amount} (${s.percentage}%)</title>
      </path>`;
    });

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; align-items: center; height: 100%;">
        <div style="position: relative; width: 220px; height: 220px;">
          <svg width="220" height="220" viewBox="0 0 220 220">
            ${svgPaths}
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total Spent</div>
            <div style="font-size: 1.25rem; font-weight: 700; font-family: 'Outfit'; color: var(--danger);">${currencySymbol}${totalExpenseSum.toLocaleString()}</div>
          </div>
        </div>
        <div style="max-height: 220px; overflow-y: auto; padding-right: 5px;">
          ${legendItems.join('')}
        </div>
      </div>
    `;
  }

  // Render Category Progress Bars
  renderCategoryBars(containerId, transactions, categories, currencySymbol = '৳') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense');
    const catTotals = {};
    let maxAmount = 1;

    expenses.forEach(t => {
      const catId = t.category;
      catTotals[catId] = (catTotals[catId] || 0) + parseFloat(t.amount);
      if (catTotals[catId] > maxAmount) maxAmount = catTotals[catId];
    });

    const activeCatIds = Object.keys(catTotals);

    if (activeCatIds.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No expenses logged.</p></div>`;
      return;
    }

    const html = activeCatIds.map(catId => {
      const amount = catTotals[catId];
      const category = categories.find(c => c.id === catId) || { name: 'Expense', color: '#6366f1', icon: 'fa-tag' };
      const percent = Math.min(Math.round((amount / maxAmount) * 100), 100);

      return `
        <div class="cat-bar-item">
          <div class="cat-bar-header">
            <span><i class="fas ${category.icon}" style="color: ${category.color}; margin-right: 6px;"></i>${category.name.split(' (')[0]}</span>
            <span style="font-family: 'Outfit'; font-weight: 700;">${currencySymbol}${amount.toLocaleString()}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percent}%; background: linear-gradient(90deg, ${category.color} 0%, ${category.color}dd 100%);"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="category-bars">${html}</div>`;
  }
}

const analyticsEngine = new AnalyticsEngine();
