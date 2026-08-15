import React, { useState, useEffect } from 'react';
import { getSavingsGoalsApi, addSavingsGoalApi, depositSavingsApi, deleteSavingsGoalApi } from '../services/savingsService';
import { PiggyBank, PlusCircle, Trash2, CheckCircle2, Target } from 'lucide-react';

const SavingsPage = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await getSavingsGoalsApi();
      if (res.success) setGoals(res.data);
    } catch (err) {
      console.error('Failed to fetch savings goals:', err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title || isNaN(target) || target <= 0) return;

    setLoading(true);
    try {
      const res = await addSavingsGoalApi({
        title,
        targetAmount: target,
        currentAmount: initialAmount ? parseFloat(initialAmount) : 0
      });
      if (res.success) {
        setTitle('');
        setTargetAmount('');
        setInitialAmount('');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error creating goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmt);
    if (!depositGoalId || isNaN(amt) || amt <= 0) return;

    try {
      const res = await depositSavingsApi(depositGoalId, amt);
      if (res.success) {
        setDepositGoalId(null);
        setDepositAmt('');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error adding deposit:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteSavingsGoalApi(id);
      if (res.success) fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PiggyBank color="var(--emerald)" size={26} /> Student Savings & Emergency Fund Goals
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Track tuition, laptop purchase, exam fees, or emergency savings targets.
        </p>
      </div>

      <div className="grid-2">
        {/* Create Goal Form */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--emerald)' }}>
            + Create New Savings Goal
          </h3>

          <form onSubmit={handleAddGoal}>
            <div className="form-group">
              <label className="form-label">Goal Title / Objective</label>
              <input type="text" placeholder="e.g. Laptop Fund, Semester Fee, Emergency Cash" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Target Amount (৳ BDT)</label>
              <input type="number" step="any" placeholder="e.g. 25000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Saved Amount (Optional)</label>
              <input type="number" step="any" placeholder="e.g. 2000" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} className="form-input" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-success" style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Creating...' : 'Save New Goal'}
            </button>
          </form>
        </div>

        {/* Savings Goals Progress Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {goals.length === 0 ? (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)' }}>
              No savings goals created yet. Set a goal above!
            </div>
          ) : (
            goals.map((g) => {
              const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
              const isCompleted = g.currentAmount >= g.targetAmount;

              return (
                <div key={g._id} className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={20} color={isCompleted ? 'var(--emerald)' : 'var(--primary)'} />
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{g.title}</h4>
                      {isCompleted && <span className="badge badge-income"><CheckCircle2 size={12} /> Achieved</span>}
                    </div>
                    <button onClick={() => handleDelete(g._id)} className="btn btn-secondary" style={{ padding: '0.35rem' }} title="Delete Goal">
                      <Trash2 size={14} color="var(--rose)" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    <span>Progress: <strong>৳ {g.currentAmount.toLocaleString()}</strong> / ৳ {g.targetAmount.toLocaleString()}</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>{percent}%</span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 'var(--radius-full)' }}></div>
                  </div>

                  {/* Inline Deposit Trigger */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    {depositGoalId === g._id ? (
                      <form onSubmit={handleDeposit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <input type="number" placeholder="Deposit ৳" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} className="form-input" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} required />
                        <button type="submit" className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Deposit</button>
                        <button type="button" onClick={() => setDepositGoalId(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Cancel</button>
                      </form>
                    ) : (
                      <button onClick={() => setDepositGoalId(g._id)} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                        + Add Savings Deposit
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default SavingsPage;
