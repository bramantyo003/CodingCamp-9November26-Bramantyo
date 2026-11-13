/* ==========================================================================
   Expense & Budget Visualizer
   Vanilla JS, data stored in the browser's Local Storage.

   Required features : input form, transaction list, total balance, pie chart
   Optional challenges: 1) sort transactions
                        2) highlight spending over a set limit
                        3) dark / light mode toggle
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  const STORAGE_KEYS = {
    transactions: 'ebv.transactions',
    limit: 'ebv.limit',
    sort: 'ebv.sort',
    theme: 'ebv.theme'
  };

  const CATEGORY_COLORS = {
    Food: '#2ecc71',
    Transport: '#3498db',
    Fun: '#e67e22'
  };
  const CATEGORIES = Object.keys(CATEGORY_COLORS);
  const SORT_OPTIONS = ['newest', 'amount-desc', 'amount-asc', 'category'];
  const MAX_AMOUNT = 1000000000;

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  /* ---------- DOM references ---------- */
  const els = {
    form: document.getElementById('transaction-form'),
    name: document.getElementById('item-name'),
    amount: document.getElementById('item-amount'),
    category: document.getElementById('item-category'),
    error: document.getElementById('form-error'),
    balanceCard: document.getElementById('balance-card'),
    balance: document.getElementById('total-balance'),
    limitAlert: document.getElementById('limit-alert'),
    limitInput: document.getElementById('limit-input'),
    list: document.getElementById('transaction-list'),
    listEmpty: document.getElementById('list-empty'),
    sort: document.getElementById('sort-select'),
    chartWrap: document.getElementById('chart-wrap'),
    chartCanvas: document.getElementById('spending-chart'),
    chartEmpty: document.getElementById('chart-empty'),
    themeToggle: document.getElementById('theme-toggle')
  };

  /* ---------- Local Storage helpers ---------- */
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* Storage can be unavailable (private mode / quota). The app still works for this session. */
    }
  }

  function loadTransactions() {
    const data = readStorage(STORAGE_KEYS.transactions, []);
    if (!Array.isArray(data)) return [];
    return data.filter(function (t) {
      return t &&
        t.id !== undefined &&
        typeof t.name === 'string' &&
        typeof t.amount === 'number' && isFinite(t.amount) &&
        CATEGORIES.indexOf(t.category) !== -1;
    });
  }

  function loadLimit() {
    const value = readStorage(STORAGE_KEYS.limit, null);
    return typeof value === 'number' && value > 0 ? value : null;
  }

  function loadSort() {
    const value = readStorage(STORAGE_KEYS.sort, 'newest');
    return SORT_OPTIONS.indexOf(value) !== -1 ? value : 'newest';
  }

  function loadTheme() {
    const saved = readStorage(STORAGE_KEYS.theme, null);
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /* ---------- State ---------- */
  const state = {
    transactions: loadTransactions(),
    limit: loadLimit(),
    sort: loadSort(),
    theme: loadTheme()
  };

  let chart = null;

  /* ---------- Small utilities ---------- */
  function toCents(value) {
    return Math.round(value * 100);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function getTotalCents() {
    return state.transactions.reduce(function (sum, t) {
      return sum + toCents(t.amount);
    }, 0);
  }

  function getCategoryTotals() {
    return CATEGORIES.map(function (category) {
      const cents = state.transactions.reduce(function (sum, t) {
        return t.category === category ? sum + toCents(t.amount) : sum;
      }, 0);
      return cents / 100;
    });
  }

  function isOverLimit(amount) {
    return state.limit !== null && amount > state.limit;
  }

  function getSortedTransactions() {
    const list = state.transactions.slice();
    const byNewest = function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); };

    switch (state.sort) {
      case 'amount-desc':
        list.sort(function (a, b) { return b.amount - a.amount || byNewest(a, b); });
        break;
      case 'amount-asc':
        list.sort(function (a, b) { return a.amount - b.amount || byNewest(a, b); });
        break;
      case 'category':
        list.sort(function (a, b) { return a.category.localeCompare(b.category) || byNewest(a, b); });
        break;
      default:
        list.sort(byNewest);
    }
    return list;
  }

  /* ---------- Rendering ---------- */
  function renderBalance() {
    const totalCents = getTotalCents();
    els.balance.textContent = currency.format(totalCents / 100);

    const over = state.limit !== null && totalCents > toCents(state.limit);
    els.balanceCard.classList.toggle('over-limit', over);
    els.limitAlert.hidden = !over;

    if (over) {
      const excess = (totalCents - toCents(state.limit)) / 100;
      els.limitAlert.textContent = 'Over your limit by ' + currency.format(excess);
    }
  }

  function createTransactionItem(t) {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    const over = isOverLimit(t.amount);
    if (over) li.classList.add('over-limit');

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const name = document.createElement('span');
    name.className = 'transaction-name';
    name.textContent = t.name;

    const amount = document.createElement('span');
    amount.className = 'transaction-amount';
    amount.textContent = currency.format(t.amount);

    const meta = document.createElement('div');
    meta.className = 'transaction-meta';

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t.category;
    meta.appendChild(tag);

    if (over) {
      const warning = document.createElement('span');
      warning.className = 'tag tag-warning';
      warning.textContent = 'Over limit';
      meta.appendChild(warning);
    }

    info.appendChild(name);
    info.appendChild(amount);
    info.appendChild(meta);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-danger';
    del.textContent = 'Delete';
    del.dataset.id = String(t.id);
    del.setAttribute('aria-label', 'Delete ' + t.name);

    li.appendChild(info);
    li.appendChild(del);
    return li;
  }

  function renderList() {
    const items = getSortedTransactions();
    els.list.replaceChildren();
    items.forEach(function (t) {
      els.list.appendChild(createTransactionItem(t));
    });
    els.listEmpty.hidden = items.length > 0;
  }

  function destroyChart() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  function renderChart() {
    if (typeof Chart === 'undefined') {
      destroyChart();
      els.chartWrap.hidden = true;
      els.chartEmpty.hidden = false;
      els.chartEmpty.textContent = 'The chart could not be loaded. Check your internet connection and refresh.';
      return;
    }

    const totals = getCategoryTotals();
    const hasData = totals.some(function (value) { return value > 0; });

    if (!hasData) {
      destroyChart();
      els.chartWrap.hidden = true;
      els.chartEmpty.hidden = false;
      els.chartEmpty.textContent = 'Add a transaction to see your spending chart.';
      return;
    }

    els.chartEmpty.hidden = true;
    els.chartWrap.hidden = false;

    if (chart) {
      chart.data.datasets[0].data = totals;
      chart.update();
      return;
    }

    chart = new Chart(els.chartCanvas, {
      type: 'pie',
      data: {
        labels: CATEGORIES,
        datasets: [{
          data: totals,
          backgroundColor: CATEGORIES.map(function (c) { return CATEGORY_COLORS[c]; }),
          borderColor: cssVar('--card'),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: cssVar('--text') }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ' ' + context.label + ': ' + currency.format(context.parsed);
              }
            }
          }
        }
      }
    });
  }

  function render() {
    renderBalance();
    renderList();
    renderChart();
  }

  /* ---------- Theme (dark / light) ---------- */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    els.themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    els.themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );

    if (chart) {
      chart.options.plugins.legend.labels.color = cssVar('--text');
      chart.data.datasets[0].borderColor = cssVar('--card');
      chart.update();
    }
  }

  /* ---------- Form handling ---------- */
  function showError(message) {
    els.error.textContent = message;
    els.error.hidden = false;
  }

  function clearError() {
    els.error.textContent = '';
    els.error.hidden = true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = els.name.value.trim();
    const amountText = els.amount.value.trim();
    const category = els.category.value;

    if (!name || !amountText || !category) {
      showError('Please fill in all fields.');
      return;
    }

    const amount = parseFloat(amountText);
    if (!isFinite(amount) || amount <= 0) {
      showError('Amount must be a number greater than 0.');
      return;
    }
    if (amount > MAX_AMOUNT) {
      showError('Amount is too large.');
      return;
    }

    state.transactions.push({
      id: generateId(),
      name: name,
      amount: toCents(amount) / 100,
      category: category,
      createdAt: Date.now()
    });
    writeStorage(STORAGE_KEYS.transactions, state.transactions);

    els.form.reset();
    clearError();
    els.name.focus();
    render();
  }

  function handleListClick(event) {
    const button = event.target.closest('button[data-id]');
    if (!button) return;

    const id = button.dataset.id;
    state.transactions = state.transactions.filter(function (t) {
      return String(t.id) !== id;
    });
    writeStorage(STORAGE_KEYS.transactions, state.transactions);
    render();
  }

  function handleSortChange() {
    state.sort = els.sort.value;
    writeStorage(STORAGE_KEYS.sort, state.sort);
    renderList();
  }

  function handleLimitInput() {
    const value = parseFloat(els.limitInput.value);
    state.limit = isFinite(value) && value > 0 ? value : null;
    writeStorage(STORAGE_KEYS.limit, state.limit);
    renderBalance();
    renderList();
  }

  function handleThemeToggle() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    writeStorage(STORAGE_KEYS.theme, next);
  }

  /* ---------- Init ---------- */
  function init() {
    els.sort.value = state.sort;
    els.limitInput.value = state.limit !== null ? state.limit : '';
    applyTheme(state.theme);

    els.form.addEventListener('submit', handleSubmit);
    els.list.addEventListener('click', handleListClick);
    els.sort.addEventListener('change', handleSortChange);
    els.limitInput.addEventListener('input', handleLimitInput);
    els.themeToggle.addEventListener('click', handleThemeToggle);

    [els.name, els.amount, els.category].forEach(function (field) {
      field.addEventListener('input', clearError);
    });

    render();
  }

  init();
})();
