const workspaces = [
  { id: 'home', icon: '⌂', label: 'Home', sections: ['Overview', 'Tasks', 'Activity'] },
  { id: 'j0', icon: '◈', label: 'J0 Admin', sections: ['Overview', 'Operations', 'Agents & Workflows'] },
  { id: 'j1', icon: '✳', label: 'J1 Health', sections: ['Overview', 'Vitals', 'Fitness', 'Nutrition', 'Wellness'] },
  { id: 'j2', icon: '▦', label: 'J2 Business', sections: ['Overview', 'Ventures', 'Finance', 'Analytics', 'Automation'] },
  { id: 'j3', icon: '⬡', label: 'J3 Security', sections: ['Overview', 'Monitoring', 'Access'] },
  { id: 'j4', icon: '✦', label: 'J4 Lifestyle', sections: ['Overview', 'Planning', 'Library'] },
  { id: 'devices', icon: '▣', label: 'Devices', sections: ['Overview', 'Connected devices'] },
  { id: 'garage', icon: '⌘', label: 'Garage', sections: ['Overview', 'Projects'] },
];
const storageKey = 'j5-public-demo-tasks-v1';
const initialTasks = [
  { id: crypto.randomUUID(), title: 'Review the workspace navigation', area: 'J5 setup', done: false },
  { id: crypto.randomUUID(), title: 'Choose one workflow to improve this week', area: 'Planning', done: false },
  { id: crypto.randomUUID(), title: 'Capture a reusable task checklist', area: 'Operations', done: true },
];
let tasks;
try { tasks = JSON.parse(localStorage.getItem(storageKey) || 'null') || initialTasks; } catch { tasks = initialTasks; }
let activeWorkspace = workspaces[0];
let activeSection = 'Overview';
let activeTab = 'Overview';
let taskFilter = 'All';

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const saveTasks = () => localStorage.setItem(storageKey, JSON.stringify(tasks));

function renderRail() {
  $('workspace-list').innerHTML = workspaces.map((workspace) => `<button class="rail-link ${activeWorkspace.id === workspace.id ? 'active' : ''}" data-workspace="${workspace.id}" aria-current="${activeWorkspace.id === workspace.id ? 'page' : 'false'}"><span aria-hidden="true">${workspace.icon}</span><span>${workspace.label.replace('J0 ', '').replace('J1 ', '').replace('J2 ', '').replace('J3 ', '').replace('J4 ', '')}</span></button>`).join('');
  document.querySelectorAll('[data-workspace]').forEach((button) => button.addEventListener('click', () => setWorkspace(button.dataset.workspace)));
}

function setWorkspace(id) {
  activeWorkspace = workspaces.find((item) => item.id === id) || { id, label: id === 'integrations' ? 'Integrations' : 'Settings', sections: ['Overview', 'Connections'] };
  activeSection = activeWorkspace.sections[0];
  activeTab = 'Overview';
  $('context-panel').classList.remove('open');
  $('menu-toggle').setAttribute('aria-expanded', 'false');
  render();
}

function renderSections() {
  $('workspace-name').textContent = activeWorkspace.label;
  $('breadcrumb-workspace').textContent = activeWorkspace.label;
  $('section-list').innerHTML = activeWorkspace.sections.map((section) => `<button class="section-link ${activeSection === section ? 'active' : ''}" data-section="${escapeHtml(section)}" aria-current="${activeSection === section ? 'page' : 'false'}">${escapeHtml(section)}</button>`).join('');
  document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => { activeSection = button.dataset.section; activeTab = activeSection === 'Overview' ? 'Overview' : activeSection; render(); }));
}

function renderTabs() {
  const tabs = activeWorkspace.id === 'home' ? ['Overview', 'Tasks', 'Activity'] : [activeSection, 'Overview'];
  if (!tabs.includes(activeTab)) activeTab = tabs[0];
  $('page-tabs').innerHTML = tabs.map((tab) => `<button class="tab ${activeTab === tab ? 'active' : ''}" data-tab="${escapeHtml(tab)}">${escapeHtml(tab)}</button>`).join('');
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { activeTab = button.dataset.tab; render(); }));
  $('breadcrumb-section').textContent = activeTab;
}

function renderOverview() {
  const complete = tasks.filter((task) => task.done).length;
  const open = tasks.length - complete;
  return `<div class="overview-grid"><article class="metric-card"><div class="label">Open tasks</div><div class="value">${open}</div><div class="hint">Things ready for your next step</div></article><article class="metric-card"><div class="label">Completed</div><div class="value">${complete}</div><div class="hint">Progress saved in this browser</div></article><article class="metric-card"><div class="label">Workspaces</div><div class="value">${workspaces.length}</div><div class="hint">One shell for your J5 work</div></article></div><h3 class="section-heading">Pick up where you left off</h3><article class="focus-card"><div><h3>Keep the next action clear</h3><p>Use the task view to capture small, finishable steps and keep your work moving.</p></div><button class="primary-button" data-open-tasks>Open tasks →</button></article><h3 class="section-heading">Next actions</h3>${renderTaskList(tasks.filter((task) => !task.done).slice(0, 2))}`;
}

function renderTaskList(items) {
  if (!items.length) return '<div class="empty-state">Nothing in this view yet. Add a task when you are ready.</div>';
  return `<div class="task-list">${items.map((task) => `<div class="task-row ${task.done ? 'done' : ''}"><input class="task-check" type="checkbox" data-task="${task.id}" ${task.done ? 'checked' : ''} aria-label="Mark ${escapeHtml(task.title)} ${task.done ? 'open' : 'complete'}"><div class="task-copy"><div class="task-name">${escapeHtml(task.title)}</div><div class="task-meta"><span>${escapeHtml(task.area || 'General')}</span><span class="tag">${task.done ? 'Complete' : 'Next step'}</span></div></div><button class="delete-button" data-delete="${task.id}" aria-label="Remove ${escapeHtml(task.title)}">×</button></div>`).join('')}</div>`;
}

function renderTasks() {
  const filters = ['All', 'Open', 'Completed'];
  const shown = tasks.filter((task) => taskFilter === 'All' || (taskFilter === 'Open' ? !task.done : task.done));
  return `<form class="task-form" id="task-form"><input class="task-input" id="new-task" maxlength="120" required placeholder="Add a clear next action…" aria-label="New task"><button class="primary-button" type="submit">Add task</button></form><div class="task-toolbar"><div class="filter-group">${filters.map((filter) => `<button class="filter-button ${taskFilter === filter ? 'active' : ''}" type="button" data-filter="${filter}">${filter}</button>`).join('')}</div><span class="task-meta">${tasks.length} tasks · saved on this device</span></div>${renderTaskList(shown)}`;
}

function renderActivity() {
  return `<h3 class="section-heading">A lightweight activity view</h3><div class="panel-card"><div class="activity-list"><div class="activity-item"><span class="activity-icon">✓</span><div><strong>${tasks.filter((task) => task.done).length} tasks completed</strong><p>Completion status is kept in local browser storage.</p></div></div><div class="activity-item"><span class="activity-icon">＋</span><div><strong>${tasks.length} tasks in your demo list</strong><p>Use Tasks to add, filter, and update your next actions.</p></div></div></div></div>`;
}

function bindTaskActions() {
  document.querySelectorAll('[data-task]').forEach((input) => input.addEventListener('change', () => { tasks = tasks.map((task) => task.id === input.dataset.task ? { ...task, done: input.checked } : task); saveTasks(); render(); }));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => { tasks = tasks.filter((task) => task.id !== button.dataset.delete); saveTasks(); render(); }));
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { taskFilter = button.dataset.filter; render(); }));
  $('task-form')?.addEventListener('submit', (event) => { event.preventDefault(); const input = $('new-task'); const title = input.value.trim(); if (!title) return; tasks.unshift({ id: crypto.randomUUID(), title, area: activeWorkspace.label, done: false }); saveTasks(); render(); $('new-task')?.focus(); });
  document.querySelector('[data-open-tasks]')?.addEventListener('click', () => { activeTab = 'Tasks'; render(); });
}

function render() {
  renderRail();
  renderSections();
  renderTabs();
  const isHome = activeWorkspace.id === 'home';
  $('page-eyebrow').textContent = isHome ? 'J5 COMMAND' : activeWorkspace.label.toUpperCase();
  $('page-title').textContent = isHome ? (activeTab === 'Tasks' ? 'Make the next step visible.' : activeTab === 'Activity' ? 'A clear view of progress.' : 'Your work, in one place.') : `${activeSection} for ${activeWorkspace.label}`;
  $('page-description').textContent = isHome ? 'A simple workspace shell and task flow, ready for the public J5 build.' : 'This public starter keeps navigation consistent while each workspace grows.';
  $('page-view').innerHTML = activeTab === 'Tasks' ? renderTasks() : activeTab === 'Activity' ? renderActivity() : renderOverview();
  bindTaskActions();
}

$('menu-toggle').addEventListener('click', () => { const panel = $('context-panel'); const open = panel.classList.toggle('open'); $('menu-toggle').setAttribute('aria-expanded', String(open)); });
$('home-link').addEventListener('click', (event) => { event.preventDefault(); setWorkspace('home'); });
render();
