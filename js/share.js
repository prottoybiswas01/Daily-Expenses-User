/* ==========================================================================
   DAILY EXPENSES TRACKER - GUARDIAN / OBSERVER SHARING ("REFERENCE") MODULE
   ========================================================================== */

class ShareManager {
  constructor() {}

  // Render the Share & Guardian Access Management Panel
  renderSharePanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const links = dataManager.getSharedLinks();
    const settings = dataManager.getSettings();

    let linksHtml = '';
    if (links.length === 0) {
      linksHtml = `<div class="empty-state"><i class="fas fa-user-shield"></i><p>No active reference links generated yet.</p></div>`;
    } else {
      linksHtml = links.map(link => `
        <div class="tx-item" style="margin-bottom: 8px;">
          <div class="tx-left">
            <div class="tx-icon" style="background: var(--success-bg); color: var(--success);">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="tx-info">
              <div class="tx-title">${link.recipientName}</div>
              <div class="tx-meta">
                <span><i class="fas fa-envelope"></i> ${link.recipientEmail}</span>
                <span class="tag-method" style="background: rgba(16, 185, 129, 0.2); color: var(--success);">${link.permission}</span>
              </div>
            </div>
          </div>
          <div class="tx-right">
            <div style="font-family: monospace; background: var(--bg-input); padding: 4px 8px; border-radius: 6px; font-size: 0.82rem; color: var(--primary);">
              Code: ${link.accessCode}
            </div>
            <button class="icon-btn" onclick="shareManager.copyAccessLink('${link.accessCode}')" title="Copy Share Link">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div class="card-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="fas fa-share-alt"></i> Share Expense Access (রেফারেন্স/অভিভাবক অ্যাক্সেস)
          </div>
          <button class="btn btn-primary" onclick="shareManager.openInviteModal()">
            <i class="fas fa-plus"></i> Invite Observer / Guardian
          </button>
        </div>

        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">
          Students can invite parents, guardians, or sponsors to review daily expense records in real-time. Shared reviewers get read-only access to verify daily spending logs.
        </p>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-main);">Active Reference Observers</h4>
          ${linksHtml}
        </div>

        <div style="background: var(--bg-input); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.9rem; color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-link"></i> Quick Observer Demo Review Link
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Click below to simulate how your shared Guardian / Observer views your expenditure reports:
          </p>
          <button class="btn btn-secondary" onclick="appController.switchRole('guardian')">
            <i class="fas fa-eye"></i> Switch to Guardian Observer View
          </button>
        </div>
      </div>
    `;
  }

  openInviteModal() {
    document.getElementById('inviteModal').classList.add('active');
  }

  closeInviteModal() {
    document.getElementById('inviteModal').classList.remove('active');
  }

  handleCreateInvite(event) {
    event.preventDefault();
    const email = document.getElementById('inviteEmail').value.trim();
    const name = document.getElementById('inviteName').value.trim();

    if (!email || !name) {
      appController.showToast('Please provide both email and name.', 'error');
      return;
    }

    const newLink = dataManager.addSharedLink(email, name);
    this.closeInviteModal();
    this.renderSharePanel('sharePanelContainer');
    appController.showToast(`Access invitation generated for ${name}! Code: ${newLink.accessCode}`, 'success');
  }

  copyAccessLink(code) {
    const url = `${window.location.origin}${window.location.pathname}?access=${code}&role=guardian`;
    navigator.clipboard.writeText(url).then(() => {
      appController.showToast('Shareable Reference URL copied to clipboard!', 'success');
    }).catch(() => {
      appController.showToast(`Access Code: ${code}`, 'info');
    });
  }
}

const shareManager = new ShareManager();
