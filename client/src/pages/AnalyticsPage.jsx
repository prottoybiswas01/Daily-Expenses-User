import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart as PieIcon, TrendingDown, DollarSign } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const { transactions, summary } = useFinancial();

  // Aggregate expenses by category
  const categoryTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categoryNames = {
    cat_food: 'Food & Dining',
    cat_tuition: 'Tuition & Academic',
    cat_rent: 'Mess & Hall Rent',
    cat_transit: 'Transportation',
    cat_mobile: 'Mobile & Internet',
    cat_snack: 'Tea & Snacks',
    cat_allowance: 'Allowance',
    cat_entertainment: 'Entertainment',
    cat_health: 'Medical',
    cat_other: 'Miscellaneous'
  };

  const labels = Object.keys(categoryTotals).map(cat => categoryNames[cat] || cat);
  const dataValues = Object.values(categoryTotals);

  const chartData = {
    labels: labels.length > 0 ? labels : ['No Expense Data'],
    datasets: [
      {
        data: dataValues.length > 0 ? dataValues : [1],
        backgroundColor: [
          '#6366f1',
          '#10b981',
          '#f43f5e',
          '#f59e0b',
          '#06b6d4',
          '#8b5cf6',
          '#ec4899',
          '#3b82f6',
          '#14b8a6',
          '#64748b'
        ],
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.2)'
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieIcon color="var(--primary)" size={24} /> Expense Analytics & Category Breakdown
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Visual insight into where your monthly budget and allowance is going.
        </p>
      </div>

      <div className="grid-2">
        {/* Doughnut Chart */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', alignSelf: 'flex-start' }}>
            Category Distribution
          </h3>
          <div style={{ width: '100%', maxWidth: '320px', height: '320px', position: 'relative' }}>
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } } }
                }
              }}
            />
          </div>
        </div>

        {/* Category breakdown table */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Expense Ranking by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.keys(categoryTotals).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No expenses logged to generate breakdown.
              </div>
            ) : (
              Object.entries(categoryTotals).map(([cat, amt]) => {
                const percent = summary.totalExpense > 0 ? Math.round((amt / summary.totalExpense) * 100) : 0;
                return (
                  <div key={cat} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                      <span>{categoryNames[cat] || cat}</span>
                      <span>৳ {amt.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 'var(--radius-full)' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
