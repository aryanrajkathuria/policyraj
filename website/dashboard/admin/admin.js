// Owner dashboard. Read only by design — there is no create, edit, upload or
// delete control anywhere in this file, and the admin Lambda exposes no write
// action to call even if one were added here.
(function () {
  const $ = (id) => document.getElementById(id);
  const gate = $('gate');
  const app = $('app');
  const notice = $('notice');

  let customers = [];

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
  };

  const fmtDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
  };

  const fmtWhen = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return d.toLocaleDateString('en-IN');
  };

  const feedRow = (item) => {
    const row = el('div', 'feed-row');
    row.appendChild(el('div', 'feed-dot'));

    const body = el('div', 'feed-body');
    body.appendChild(el('div', 'feed-who', item.customerName || item.customerEmail || 'Customer'));
    body.appendChild(el('div', 'feed-what', item.summary || item.type || ''));
    row.appendChild(body);

    row.appendChild(el('div', 'feed-when', fmtWhen(item.timestamp)));
    return row;
  };

  const renderFeed = (activity) => {
    const feed = $('activityFeed');
    feed.textContent = '';
    $('feedEmpty').hidden = activity.length > 0;
    activity.forEach((item) => feed.appendChild(feedRow(item)));
  };

  const renderCustomers = (filter) => {
    const term = (filter || '').trim().toLowerCase();
    const rows = $('customerRows');
    rows.textContent = '';

    const matches = customers.filter(
      (c) =>
        !term ||
        (c.fullName || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term)
    );

    $('customerEmpty').hidden = matches.length > 0;

    matches.forEach((customer) => {
      const tr = document.createElement('tr');
      [
        customer.fullName || '—',
        customer.email || '—',
        customer.phone || '—',
        String(customer.policyCount)
      ].forEach((value) => tr.appendChild(el('td', null, value)));

      tr.appendChild(el('td', null, customer.lastActivityAt ? fmtWhen(customer.lastActivityAt) : '—'));

      const actionCell = el('td');
      const viewBtn = el('button', 'dash-btn secondary small', 'View');
      viewBtn.type = 'button';
      viewBtn.addEventListener('click', () => openCustomer(customer));
      actionCell.appendChild(viewBtn);
      tr.appendChild(actionCell);

      rows.appendChild(tr);
    });
  };

  const metaCell = (label, value) => {
    const span = el('span');
    span.appendChild(el('strong', null, label));
    span.appendChild(document.createTextNode(value));
    return span;
  };

  const openDocument = async (userId, policy, button) => {
    button.disabled = true;
    try {
      const { url } = await Api.admin('getDocumentUrl', { userId, policyId: policy.policyId });
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      showNotice('error', err.status === 404 ? 'No document on that policy.' : err.message);
    } finally {
      button.disabled = false;
    }
  };

  const openCustomer = async (customer) => {
    const detail = $('customerDetail');
    detail.hidden = false;
    $('detailName').textContent = customer.fullName || customer.email || 'Customer';
    $('detailContact').textContent = `${customer.email || ''} · ${customer.phone || 'no phone'}`;
    $('detailProfile').textContent = '';
    $('detailPolicies').textContent = '';
    $('detailActivity').textContent = '';
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const data = await Api.admin('getCustomer', { userId: customer.userId });
      const profile = data.profile || {};

      const meta = $('detailProfile');
      meta.appendChild(metaCell('Address', profile.address || '—'));
      meta.appendChild(metaCell('City', profile.city || '—'));
      meta.appendChild(metaCell('PIN code', profile.pincode || '—'));
      meta.appendChild(metaCell('Nominee', profile.nomineeName || '—'));
      meta.appendChild(metaCell('Nominee relation', profile.nomineeRelation || '—'));
      meta.appendChild(metaCell('Renewal reminders', profile.reminderOptIn ? 'Opted in' : 'No'));

      const list = $('detailPolicies');
      (data.policies || []).forEach((policy) => {
        const card = el('div', 'policy-card');
        card.appendChild(el('h3', null, `${policy.insurer || 'Policy'} · ${policy.policyType || ''}`.trim()));
        card.appendChild(el('span', `dash-badge ${policy.status || ''}`, policy.status || 'unknown'));

        const pm = el('div', 'policy-meta');
        pm.appendChild(metaCell('Policy number', policy.policyNumber || '—'));
        pm.appendChild(metaCell('Sum assured', policy.sumAssured ? money.format(policy.sumAssured) : '—'));
        pm.appendChild(metaCell('Premium', policy.premium ? money.format(policy.premium) : '—'));
        pm.appendChild(metaCell('Renewal', fmtDate(policy.renewalDate)));
        card.appendChild(pm);

        if (policy.s3Key) {
          const actions = el('div', 'dash-actions');
          const open = el('button', 'dash-btn secondary small', `Open ${policy.fileName || 'PDF'}`);
          open.type = 'button';
          open.addEventListener('click', () => openDocument(customer.userId, policy, open));
          actions.appendChild(open);
          card.appendChild(actions);
        } else {
          card.appendChild(el('p', 'feed-what', 'No document uploaded.'));
        }

        list.appendChild(card);
      });

      if (!(data.policies || []).length) {
        list.appendChild(el('div', 'dash-empty', 'No policies recorded.'));
      }

      const activity = $('detailActivity');
      (data.activity || []).slice(0, 20).forEach((item) =>
        activity.appendChild(
          feedRow({
            ...item,
            customerName: customer.fullName,
            customerEmail: customer.email
          })
        )
      );
    } catch (err) {
      showNotice('error', err.message);
    }
  };

  const load = async () => {
    const [feed, list] = await Promise.all([
      Api.admin('getActivityFeed', { limit: 50 }),
      Api.admin('listCustomers')
    ]);
    customers = list.customers || [];
    renderFeed(feed.activity || []);
    renderCustomers('');
  };

  const wireUp = () => {
    $('signOutBtn').addEventListener('click', () => Auth.signOut());
    $('closeDetail').addEventListener('click', () => {
      $('customerDetail').hidden = true;
    });

    document.querySelectorAll('.dash-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        $('panelFeed').hidden = tab.dataset.panel !== 'panelFeed';
        $('panelCustomers').hidden = tab.dataset.panel !== 'panelCustomers';
      });
    });

    let searchTimer;
    $('customerSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const value = e.target.value;
      searchTimer = setTimeout(() => renderCustomers(value), 250);
    });
  };

  const init = async () => {
    $('signInBtn').addEventListener('click', () => Auth.signIn());

    const token = await Auth.getIdToken();
    if (!token) {
      showGate('Sign in with the owner account.', true);
      return;
    }

    if (!Auth.isAdmin()) {
      showGate('This account does not have owner access.', false);
      return;
    }

    const claims = Auth.claims() || {};
    $('userLabel').textContent = claims.name || claims.email || '';

    gate.hidden = true;
    app.hidden = false;
    wireUp();

    try {
      await load();
    } catch (err) {
      if (err.status === 403) {
        showGate('This account does not have owner access.', false);
      } else if (err.status === 401) {
        Auth.clear();
        showGate('Your session expired. Sign in again.', true);
      } else {
        showNotice('error', err.message);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
