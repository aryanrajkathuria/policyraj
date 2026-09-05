// Customer dashboard. Every value rendered here is set with textContent —
// nothing a customer types is ever passed to innerHTML.
(function () {
  const $ = (id) => document.getElementById(id);
  const gate = $('gate');
  const app = $('app');
  const notice = $('notice');

  let policies = [];

  const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const showGate = (message, allowSignIn) => {
    $('gateMessage').textContent = message;
    $('signInBtn').hidden = !allowSignIn;
    gate.hidden = false;
    app.hidden = true;
  };

  const showNotice = (type, message) => {
    notice.className = `dash-note ${type}`;
    notice.textContent = message;
    notice.hidden = false;
    if (type === 'success') setTimeout(() => { notice.hidden = true; }, 4000);
  };

  const fmtDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
  };

  const metaCell = (label, value) => {
    const span = el('span');
    span.appendChild(el('strong', null, label));
    span.appendChild(document.createTextNode(value));
    return span;
  };

  const buildPolicyCard = (policy) => {
    const card = el('div', 'policy-card');

    const heading = el('h3', null, `${policy.insurer || 'Policy'} · ${policy.policyType || ''}`.trim());
    card.appendChild(heading);

    const badge = el('span', `dash-badge ${policy.status || ''}`, policy.status || 'unknown');
    card.appendChild(badge);

    const meta = el('div', 'policy-meta');
    meta.appendChild(metaCell('Policy number', policy.policyNumber || '—'));
    meta.appendChild(metaCell('Sum assured', policy.sumAssured ? money.format(policy.sumAssured) : '—'));
    meta.appendChild(metaCell('Premium', policy.premium ? money.format(policy.premium) : '—'));
    meta.appendChild(metaCell('Renewal', fmtDate(policy.renewalDate)));
    meta.appendChild(metaCell('Document', policy.fileName || 'Not uploaded'));
    card.appendChild(meta);

    const actions = el('div', 'dash-actions');

    const editBtn = el('button', 'dash-btn secondary small', 'Edit');
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => startEdit(policy));
    actions.appendChild(editBtn);

    const uploadLabel = el('label', 'dash-btn small', policy.s3Key ? 'Replace PDF' : 'Upload PDF');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.hidden = true;
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleUpload(policy, fileInput.files[0], card);
    });
    uploadLabel.appendChild(fileInput);
    actions.appendChild(uploadLabel);

    if (policy.s3Key) {
      const downloadBtn = el('button', 'dash-btn secondary small', 'Download');
      downloadBtn.type = 'button';
      downloadBtn.addEventListener('click', () => handleDownload(policy, downloadBtn));
      actions.appendChild(downloadBtn);
    }

    const deleteBtn = el('button', 'dash-btn danger small', 'Delete');
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', () => handleDelete(policy));
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    return card;
  };

  const renderPolicies = () => {
    const list = $('policyList');
    list.textContent = '';
    $('policyEmpty').hidden = policies.length > 0;
    policies.forEach((policy) => list.appendChild(buildPolicyCard(policy)));
  };

  const fillProfile = (profile) => {
    const p = profile || {};
    $('fullName').value = p.fullName || '';
    $('phone').value = p.phone || '';
    $('address').value = p.address || '';
    $('city').value = p.city || '';
    $('pincode').value = p.pincode || '';
    $('nomineeName').value = p.nomineeName || '';
    $('nomineeRelation').value = p.nomineeRelation || '';
    $('nomineeDob').value = p.nomineeDob || '';
    $('reminderOptIn').checked = Boolean(p.reminderOptIn);
  };

  const loadDashboard = async () => {
    const data = await Api.read('getDashboard');
    policies = data.policies || [];
    policies.sort((a, b) => (a.insurer || '').localeCompare(b.insurer || ''));
    renderPolicies();
    fillProfile(data.profile);
  };

  const startEdit = (policy) => {
    $('policyId').value = policy.policyId;
    $('insurer').value = policy.insurer || '';
    $('policyNumber').value = policy.policyNumber || '';
    $('policyType').value = policy.policyType || 'Health';
    $('status').value = policy.status || 'active';
    $('sumAssured').value = policy.sumAssured || '';
    $('premium').value = policy.premium || '';
    $('premiumFrequency').value = policy.premiumFrequency || 'yearly';
    $('startDate').value = policy.startDate || '';
    $('renewalDate').value = policy.renewalDate || '';
    $('policyFormTitle').textContent = 'Edit policy';
    $('policyCancel').hidden = false;
    $('policyFormTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetPolicyForm = () => {
    $('policyForm').reset();
    $('policyId').value = '';
    $('policyFormTitle').textContent = 'Add a policy';
    $('policyCancel').hidden = true;
  };

  const collectPolicy = () => ({
    insurer: $('insurer').value.trim(),
    policyNumber: $('policyNumber').value.trim(),
    policyType: $('policyType').value,
    status: $('status').value,
    sumAssured: Number($('sumAssured').value) || 0,
    premium: Number($('premium').value) || 0,
    premiumFrequency: $('premiumFrequency').value,
    startDate: $('startDate').value,
    renewalDate: $('renewalDate').value
  });

  const handleUpload = async (policy, file, card) => {
    const bar = el('div', 'progress');
    const fill = el('span');
    bar.appendChild(fill);
    card.appendChild(bar);

    try {
      await Api.uploadDocument(policy.policyId, file, (pct) => {
        fill.style.width = `${pct}%`;
      });
      showNotice('success', `${file.name} uploaded.`);
      await loadDashboard();
    } catch (err) {
      bar.remove();
      showNotice('error', err.message);
    }
  };

  const handleDownload = async (policy, button) => {
    button.disabled = true;
    try {
      const { url } = await Api.read('getDownloadUrl', { policyId: policy.policyId });
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      showNotice('error', err.status === 404 ? 'That document is no longer available.' : err.message);
    } finally {
      button.disabled = false;
    }
  };

  const handleDelete = async (policy) => {
    const label = policy.policyNumber || 'this policy';
    if (!window.confirm(`Delete ${label}? The uploaded document is deleted too.`)) return;
    try {
      await Api.save('deletePolicy', { policyId: policy.policyId });
      showNotice('success', 'Policy deleted.');
      await loadDashboard();
    } catch (err) {
      showNotice('error', err.message);
    }
  };

  const wireUp = () => {
    $('signOutBtn').addEventListener('click', () => Auth.signOut());

    document.querySelectorAll('.dash-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        $('panelPolicies').hidden = tab.dataset.panel !== 'panelPolicies';
        $('panelProfile').hidden = tab.dataset.panel !== 'panelProfile';
      });
    });

    $('policyCancel').addEventListener('click', resetPolicyForm);

    $('policyForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = $('policySubmit');
      const policyId = $('policyId').value;
      submit.disabled = true;
      try {
        if (policyId) {
          await Api.save('updatePolicy', { policyId, data: collectPolicy() });
          showNotice('success', 'Policy updated.');
        } else {
          await Api.save('createPolicy', { data: collectPolicy() });
          showNotice('success', 'Policy added.');
        }
        resetPolicyForm();
        await loadDashboard();
      } catch (err) {
        showNotice('error', err.message);
      } finally {
        submit.disabled = false;
      }
    });

    $('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await Api.save('updateProfile', {
          data: {
            fullName: $('fullName').value.trim(),
            phone: $('phone').value.trim(),
            address: $('address').value.trim(),
            city: $('city').value.trim(),
            pincode: $('pincode').value.trim(),
            nomineeName: $('nomineeName').value.trim(),
            nomineeRelation: $('nomineeRelation').value.trim(),
            nomineeDob: $('nomineeDob').value,
            reminderOptIn: $('reminderOptIn').checked
          }
        });
        showNotice('success', 'Profile saved.');
      } catch (err) {
        showNotice('error', err.message);
      }
    });
  };

  const init = async () => {
    $('signInBtn').addEventListener('click', () => Auth.signIn());

    try {
      await Auth.handleCallback();
    } catch (err) {
      showGate(err.message, true);
      return;
    }

    const token = await Auth.getIdToken();
    if (!token) {
      showGate('Sign in to view your policies.', true);
      return;
    }

    // Convenience routing only. The admin function enforces the real check.
    if (Auth.isAdmin()) {
      window.location.replace('admin/');
      return;
    }

    const claims = Auth.claims() || {};
    $('userLabel').textContent = claims.name || claims.email || '';

    gate.hidden = true;
    app.hidden = false;
    wireUp();

    try {
      await loadDashboard();
    } catch (err) {
      if (err.status === 401) {
        Auth.clear();
        showGate('Your session expired. Sign in again.', true);
      } else {
        showNotice('error', err.message);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
