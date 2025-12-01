/**
 * Open Source Business Automation - Explore UI
 * Frontend application for exploring business data with traditional tabs
 * and interacting with the AI Assistant
 */

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5678/webhook'
    : `${window.location.protocol}//${window.location.hostname}:5678/webhook`;

// State management
const state = {
    currentMode: 'explore', // 'explore' or 'ai'
    currentTab: 'leads',
    leads: [],
    customers: [],
    invoices: [],
    content: [],
    filters: {
        leads: 'all',
        customers: 'all',
        invoices: 'all',
        content: 'all'
    },
    aiSessionId: null,
    isLoading: false
};

// ============================================== 
// Initialization
// ============================================== 

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up mode toggle
    setupModeToggle();
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up filters
    setupFilters();
    
    // Generate AI session ID
    state.aiSessionId = generateSessionId();
    
    // Load initial data
    loadAllData();
}

// ============================================== 
// Mode Toggle
// ============================================== 

function setupModeToggle() {
    const exploreBtn = document.getElementById('exploreMode');
    const aiBtn = document.getElementById('aiMode');
    
    exploreBtn.addEventListener('click', function() {
        switchMode('explore');
    });
    
    aiBtn.addEventListener('click', function() {
        switchMode('ai');
    });
}

function switchMode(mode) {
    state.currentMode = mode;
    
    // Update button states
    const exploreBtn = document.getElementById('exploreMode');
    const aiBtn = document.getElementById('aiMode');
    
    exploreBtn.classList.toggle('active', mode === 'explore');
    aiBtn.classList.toggle('active', mode === 'ai');
    exploreBtn.setAttribute('aria-pressed', mode === 'explore');
    aiBtn.setAttribute('aria-pressed', mode === 'ai');
    
    // Update view visibility
    const exploreView = document.getElementById('exploreView');
    const aiView = document.getElementById('aiView');
    
    exploreView.classList.toggle('active', mode === 'explore');
    aiView.classList.toggle('active', mode === 'ai');
    
    // Focus on input if AI mode
    if (mode === 'ai') {
        setTimeout(function() {
            document.getElementById('ai-question-input').focus();
        }, 100);
    }
}

// ============================================== 
// Tab Navigation
// ============================================== 

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    state.currentTab = tabName;
    
    // Update button states
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(function(btn) {
        const isActive = btn.getAttribute('data-tab') === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });
    
    // Update panel visibility
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(function(panel) {
        const panelTab = panel.id.replace('-panel', '');
        panel.classList.toggle('active', panelTab === tabName);
    });
}

// ============================================== 
// Filters
// ============================================== 

function setupFilters() {
    const filterSelects = {
        'leads-filter': 'leads',
        'customers-filter': 'customers',
        'invoices-filter': 'invoices',
        'content-filter': 'content'
    };
    
    Object.entries(filterSelects).forEach(function([id, type]) {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', function() {
                state.filters[type] = select.value;
                applyFilter(type);
            });
        }
    });
}

function applyFilter(type) {
    switch (type) {
        case 'leads':
            renderLeads();
            break;
        case 'customers':
            renderCustomers();
            break;
        case 'invoices':
            renderInvoices();
            break;
        case 'content':
            renderContent();
            break;
    }
}

// ============================================== 
// Data Loading
// ============================================== 

function loadAllData() {
    loadLeads();
    loadCustomers();
    loadInvoices();
    loadContent();
}

async function loadLeads() {
    const listEl = document.getElementById('leads-list');
    listEl.innerHTML = '<div class="loading-state">Loading leads...</div>';
    
    try {
        // Use the AI assistant endpoint to get lead context
        const response = await fetch(API_BASE_URL + '/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Get all leads data',
                user_id: 'explore_ui',
                session_id: state.aiSessionId,
                context: { action: 'fetch_leads' }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Parse leads from response or use demo data
            state.leads = extractDataFromResponse(data, 'leads');
        } else {
            // Use demo data if API fails
            state.leads = generateDemoLeads();
        }
    } catch (error) {
        console.warn('API not available, using demo data:', error.message);
        state.leads = generateDemoLeads();
    }
    
    updateLeadStats();
    renderLeads();
}

async function loadCustomers() {
    const listEl = document.getElementById('customers-list');
    listEl.innerHTML = '<div class="loading-state">Loading customers...</div>';
    
    try {
        const response = await fetch(API_BASE_URL + '/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Get all customers data',
                user_id: 'explore_ui',
                session_id: state.aiSessionId,
                context: { action: 'fetch_customers' }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            state.customers = extractDataFromResponse(data, 'customers');
        } else {
            state.customers = generateDemoCustomers();
        }
    } catch (error) {
        console.warn('API not available, using demo data:', error.message);
        state.customers = generateDemoCustomers();
    }
    
    updateCustomerStats();
    renderCustomers();
}

async function loadInvoices() {
    const listEl = document.getElementById('invoices-list');
    listEl.innerHTML = '<div class="loading-state">Loading invoices...</div>';
    
    try {
        const response = await fetch(API_BASE_URL + '/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Get all invoices data',
                user_id: 'explore_ui',
                session_id: state.aiSessionId,
                context: { action: 'fetch_invoices' }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            state.invoices = extractDataFromResponse(data, 'invoices');
        } else {
            state.invoices = generateDemoInvoices();
        }
    } catch (error) {
        console.warn('API not available, using demo data:', error.message);
        state.invoices = generateDemoInvoices();
    }
    
    updateInvoiceStats();
    renderInvoices();
}

async function loadContent() {
    const listEl = document.getElementById('content-list');
    listEl.innerHTML = '<div class="loading-state">Loading content...</div>';
    
    try {
        const response = await fetch(API_BASE_URL + '/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: 'Get all content data',
                user_id: 'explore_ui',
                session_id: state.aiSessionId,
                context: { action: 'fetch_content' }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            state.content = extractDataFromResponse(data, 'content');
        } else {
            state.content = generateDemoContent();
        }
    } catch (error) {
        console.warn('API not available, using demo data:', error.message);
        state.content = generateDemoContent();
    }
    
    updateContentStats();
    renderContent();
}

// ============================================== 
// Data Extraction & Demo Data
// ============================================== 

function extractDataFromResponse(response, type) {
    // Try to extract real data from API response
    if (response && response.raw_data && Array.isArray(response.raw_data)) {
        return response.raw_data;
    }
    
    // Fall back to demo data
    switch (type) {
        case 'leads': return generateDemoLeads();
        case 'customers': return generateDemoCustomers();
        case 'invoices': return generateDemoInvoices();
        case 'content': return generateDemoContent();
        default: return [];
    }
}

function generateDemoLeads() {
    return [
        { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp Inc', tier: 'hot', score: 92, ai_score: 95.5, industry: 'Technology', status: 'new', created_at: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@innovate.io', company: 'Innovate.io', tier: 'hot', score: 88, ai_score: 90.2, industry: 'Software', status: 'contacted', created_at: '2024-01-14T14:20:00Z' },
        { id: 3, name: 'Mike Williams', email: 'mike@globalfin.com', company: 'Global Finance', tier: 'warm', score: 72, ai_score: 75.8, industry: 'Finance', status: 'new', created_at: '2024-01-13T09:15:00Z' },
        { id: 4, name: 'Emily Brown', email: 'emily@healthplus.org', company: 'HealthPlus', tier: 'warm', score: 65, ai_score: 68.3, industry: 'Healthcare', status: 'qualified', created_at: '2024-01-12T16:45:00Z' },
        { id: 5, name: 'David Lee', email: 'david@retailmax.com', company: 'RetailMax', tier: 'cold', score: 45, ai_score: 42.1, industry: 'Retail', status: 'new', created_at: '2024-01-11T11:00:00Z' },
        { id: 6, name: 'Lisa Chen', email: 'lisa@cloudserv.net', company: 'CloudServ', tier: 'hot', score: 91, ai_score: 93.7, industry: 'Technology', status: 'contacted', created_at: '2024-01-10T08:30:00Z' },
        { id: 7, name: 'James Wilson', email: 'james@manutech.com', company: 'ManuTech', tier: 'warm', score: 68, ai_score: 71.5, industry: 'Manufacturing', status: 'new', created_at: '2024-01-09T13:20:00Z' },
        { id: 8, name: 'Anna Martinez', email: 'anna@edulearn.edu', company: 'EduLearn', tier: 'cold', score: 38, ai_score: 35.9, industry: 'Education', status: 'new', created_at: '2024-01-08T15:10:00Z' }
    ];
}

function generateDemoCustomers() {
    return [
        { id: 1, name: 'TechCorp Inc', email: 'billing@techcorp.com', company: 'TechCorp Inc', status: 'active', lifetime_value: 125000.00, total_invoices: 12, created_at: '2023-06-15T10:30:00Z' },
        { id: 2, name: 'Innovate.io', email: 'accounts@innovate.io', company: 'Innovate.io', status: 'active', lifetime_value: 89500.00, total_invoices: 8, created_at: '2023-08-22T14:20:00Z' },
        { id: 3, name: 'Global Finance', email: 'finance@globalfin.com', company: 'Global Finance', status: 'active', lifetime_value: 245000.00, total_invoices: 24, created_at: '2022-11-10T09:15:00Z' },
        { id: 4, name: 'CloudServ', email: 'billing@cloudserv.net', company: 'CloudServ', status: 'active', lifetime_value: 67800.00, total_invoices: 6, created_at: '2023-10-05T16:45:00Z' },
        { id: 5, name: 'RetailMax', email: 'accounts@retailmax.com', company: 'RetailMax', status: 'inactive', lifetime_value: 34200.00, total_invoices: 4, created_at: '2023-03-18T11:00:00Z' }
    ];
}

function generateDemoInvoices() {
    return [
        { id: 1, invoice_number: 'INV-2024-001', vendor: 'TechCorp Inc', total_amount: 15000.00, paid_amount: 15000.00, payment_status: 'paid', due_date: '2024-01-30', issue_date: '2024-01-01', created_at: '2024-01-01T10:30:00Z' },
        { id: 2, invoice_number: 'INV-2024-002', vendor: 'Innovate.io', total_amount: 8500.00, paid_amount: 0, payment_status: 'unpaid', due_date: '2024-02-15', issue_date: '2024-01-15', created_at: '2024-01-15T14:20:00Z' },
        { id: 3, invoice_number: 'INV-2024-003', vendor: 'Global Finance', total_amount: 25000.00, paid_amount: 25000.00, payment_status: 'paid', due_date: '2024-01-25', issue_date: '2024-01-05', created_at: '2024-01-05T09:15:00Z' },
        { id: 4, invoice_number: 'INV-2024-004', vendor: 'CloudServ', total_amount: 12000.00, paid_amount: 0, payment_status: 'overdue', due_date: '2024-01-10', issue_date: '2023-12-20', created_at: '2023-12-20T16:45:00Z' },
        { id: 5, invoice_number: 'INV-2024-005', vendor: 'RetailMax', total_amount: 5500.00, paid_amount: 2750.00, payment_status: 'unpaid', due_date: '2024-02-01', issue_date: '2024-01-18', created_at: '2024-01-18T11:00:00Z' }
    ];
}

function generateDemoContent() {
    return [
        { id: 1, title: 'The Future of AI in Business Automation', content_type: 'article', status: 'published', ai_generated: true, views: 1250, engagement_score: 8.5, topic: 'AI & Automation', created_at: '2024-01-10T10:30:00Z' },
        { id: 2, title: 'Best Practices for Lead Management', content_type: 'article', status: 'published', ai_generated: false, views: 890, engagement_score: 7.2, topic: 'Sales', created_at: '2024-01-08T14:20:00Z' },
        { id: 3, title: 'How to Streamline Invoice Processing', content_type: 'blog', status: 'draft', ai_generated: true, views: 0, engagement_score: 0, topic: 'Finance', created_at: '2024-01-15T09:15:00Z' },
        { id: 4, title: 'Customer Success Stories: Q4 2023', content_type: 'article', status: 'published', ai_generated: false, views: 2100, engagement_score: 9.1, topic: 'Case Studies', created_at: '2024-01-05T16:45:00Z' },
        { id: 5, title: 'Upcoming Product Features', content_type: 'blog', status: 'scheduled', ai_generated: true, views: 0, engagement_score: 0, topic: 'Product Updates', scheduled_publish_at: '2024-02-01T09:00:00Z', created_at: '2024-01-12T11:00:00Z' }
    ];
}

// ============================================== 
// Stats Updates
// ============================================== 

function updateLeadStats() {
    const leads = state.leads;
    const hot = leads.filter(function(l) { return l.tier === 'hot'; }).length;
    const warm = leads.filter(function(l) { return l.tier === 'warm'; }).length;
    const cold = leads.filter(function(l) { return l.tier === 'cold'; }).length;
    const avgScore = leads.length > 0 
        ? (leads.reduce(function(sum, l) { return sum + (l.score || 0); }, 0) / leads.length).toFixed(1)
        : 0;
    
    document.getElementById('hot-leads').textContent = hot;
    document.getElementById('warm-leads').textContent = warm;
    document.getElementById('cold-leads').textContent = cold;
    document.getElementById('avg-score').textContent = avgScore;
    document.getElementById('leads-count').textContent = leads.length;
}

function updateCustomerStats() {
    const customers = state.customers;
    const total = customers.length;
    const active = customers.filter(function(c) { return c.status === 'active'; }).length;
    const totalLTV = customers.reduce(function(sum, c) { return sum + (c.lifetime_value || 0); }, 0);
    
    document.getElementById('total-customers').textContent = total;
    document.getElementById('active-customers').textContent = active;
    document.getElementById('total-ltv').textContent = formatCurrency(totalLTV);
    document.getElementById('customers-count').textContent = total;
}

function updateInvoiceStats() {
    const invoices = state.invoices;
    const total = invoices.length;
    const totalAmount = invoices.reduce(function(sum, i) { return sum + (i.total_amount || 0); }, 0);
    const totalPaid = invoices.reduce(function(sum, i) { return sum + (i.paid_amount || 0); }, 0);
    const overdue = invoices.filter(function(i) { return i.payment_status === 'overdue'; }).length;
    
    document.getElementById('total-invoices').textContent = total;
    document.getElementById('total-invoice-amount').textContent = formatCurrency(totalAmount);
    document.getElementById('total-paid').textContent = formatCurrency(totalPaid);
    document.getElementById('overdue-count').textContent = overdue;
    document.getElementById('invoices-count').textContent = total;
}

function updateContentStats() {
    const content = state.content;
    const total = content.length;
    const published = content.filter(function(c) { return c.status === 'published'; }).length;
    const aiGenerated = content.filter(function(c) { return c.ai_generated; }).length;
    const avgViews = content.length > 0 
        ? Math.round(content.reduce(function(sum, c) { return sum + (c.views || 0); }, 0) / content.length)
        : 0;
    
    document.getElementById('total-content').textContent = total;
    document.getElementById('published-content').textContent = published;
    document.getElementById('ai-generated').textContent = aiGenerated;
    document.getElementById('avg-views').textContent = avgViews;
    document.getElementById('content-count').textContent = total;
}

// ============================================== 
// Rendering
// ============================================== 

function renderLeads() {
    const listEl = document.getElementById('leads-list');
    const filter = state.filters.leads;
    
    let leads = state.leads;
    if (filter !== 'all') {
        leads = leads.filter(function(l) { return l.tier === filter; });
    }
    
    if (leads.length === 0) {
        listEl.innerHTML = createEmptyState('🎯', 'No leads found', 'Leads will appear here when captured');
        return;
    }
    
    listEl.innerHTML = leads.map(function(lead) {
        return createLeadCard(lead);
    }).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.list-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(item.getAttribute('data-id'));
            showLeadDetail(id);
        });
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const id = parseInt(item.getAttribute('data-id'));
                showLeadDetail(id);
            }
        });
    });
}

function renderCustomers() {
    const listEl = document.getElementById('customers-list');
    const filter = state.filters.customers;
    
    let customers = state.customers;
    if (filter !== 'all') {
        customers = customers.filter(function(c) { return c.status === filter; });
    }
    
    if (customers.length === 0) {
        listEl.innerHTML = createEmptyState('👥', 'No customers found', 'Customers will appear here when converted');
        return;
    }
    
    listEl.innerHTML = customers.map(function(customer) {
        return createCustomerCard(customer);
    }).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.list-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(item.getAttribute('data-id'));
            showCustomerDetail(id);
        });
    });
}

function renderInvoices() {
    const listEl = document.getElementById('invoices-list');
    const filter = state.filters.invoices;
    
    let invoices = state.invoices;
    if (filter !== 'all') {
        invoices = invoices.filter(function(i) { return i.payment_status === filter; });
    }
    
    if (invoices.length === 0) {
        listEl.innerHTML = createEmptyState('💰', 'No invoices found', 'Invoices will appear here when created');
        return;
    }
    
    listEl.innerHTML = invoices.map(function(invoice) {
        return createInvoiceCard(invoice);
    }).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.list-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(item.getAttribute('data-id'));
            showInvoiceDetail(id);
        });
    });
}

function renderContent() {
    const listEl = document.getElementById('content-list');
    const filter = state.filters.content;
    
    let content = state.content;
    if (filter !== 'all') {
        content = content.filter(function(c) { return c.status === filter; });
    }
    
    if (content.length === 0) {
        listEl.innerHTML = createEmptyState('📝', 'No content found', 'Content will appear here when created');
        return;
    }
    
    listEl.innerHTML = content.map(function(item) {
        return createContentCard(item);
    }).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.list-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(item.getAttribute('data-id'));
            showContentDetail(id);
        });
    });
}

// ============================================== 
// Card Templates
// ============================================== 

function createLeadCard(lead) {
    const tierIcon = lead.tier === 'hot' ? '🔥' : (lead.tier === 'warm' ? '🌡️' : '❄️');
    return `
        <div class="list-item" data-id="${lead.id}" tabindex="0" role="button" aria-label="View ${lead.name} details">
            <div class="item-icon ${lead.tier}">${tierIcon}</div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-title">${escapeHtml(lead.name)}</span>
                    <span class="item-badge ${lead.tier}">${lead.tier.toUpperCase()}</span>
                </div>
                <div class="item-subtitle">${escapeHtml(lead.company)} • ${escapeHtml(lead.email)}</div>
                <div class="item-meta">
                    <span class="item-meta-item">📊 Score: ${lead.score}</span>
                    <span class="item-meta-item">🤖 AI: ${lead.ai_score?.toFixed(1) || 'N/A'}</span>
                    <span class="item-meta-item">🏭 ${escapeHtml(lead.industry || 'Unknown')}</span>
                </div>
            </div>
            <div class="item-actions">
                <span class="item-value">${lead.score}</span>
                <span class="item-date">${formatDate(lead.created_at)}</span>
            </div>
        </div>
    `;
}

function createCustomerCard(customer) {
    return `
        <div class="list-item" data-id="${customer.id}" tabindex="0" role="button" aria-label="View ${customer.name} details">
            <div class="item-icon customer">👥</div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-title">${escapeHtml(customer.name)}</span>
                    <span class="item-badge ${customer.status}">${customer.status.toUpperCase()}</span>
                </div>
                <div class="item-subtitle">${escapeHtml(customer.company)} • ${escapeHtml(customer.email)}</div>
                <div class="item-meta">
                    <span class="item-meta-item">📄 ${customer.total_invoices} invoices</span>
                    <span class="item-meta-item">📅 Since ${formatDate(customer.created_at)}</span>
                </div>
            </div>
            <div class="item-actions">
                <span class="item-value">${formatCurrency(customer.lifetime_value)}</span>
                <span class="item-date">LTV</span>
            </div>
        </div>
    `;
}

function createInvoiceCard(invoice) {
    const statusIcon = invoice.payment_status === 'paid' ? '✅' : (invoice.payment_status === 'overdue' ? '⚠️' : '⏳');
    return `
        <div class="list-item" data-id="${invoice.id}" tabindex="0" role="button" aria-label="View invoice ${invoice.invoice_number} details">
            <div class="item-icon invoice">${statusIcon}</div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-title">${escapeHtml(invoice.invoice_number)}</span>
                    <span class="item-badge ${invoice.payment_status}">${invoice.payment_status.toUpperCase()}</span>
                </div>
                <div class="item-subtitle">${escapeHtml(invoice.vendor)}</div>
                <div class="item-meta">
                    <span class="item-meta-item">📅 Due: ${formatDate(invoice.due_date)}</span>
                    <span class="item-meta-item">💵 Paid: ${formatCurrency(invoice.paid_amount)}</span>
                </div>
            </div>
            <div class="item-actions">
                <span class="item-value">${formatCurrency(invoice.total_amount)}</span>
                <span class="item-date">${formatDate(invoice.issue_date)}</span>
            </div>
        </div>
    `;
}

function createContentCard(content) {
    const statusIcon = content.status === 'published' ? '✅' : (content.status === 'scheduled' ? '📅' : '📝');
    return `
        <div class="list-item" data-id="${content.id}" tabindex="0" role="button" aria-label="View ${content.title} details">
            <div class="item-icon content">${statusIcon}</div>
            <div class="item-content">
                <div class="item-header">
                    <span class="item-title">${escapeHtml(content.title)}</span>
                    <span class="item-badge ${content.status}">${content.status.toUpperCase()}</span>
                    ${content.ai_generated ? '<span class="item-badge ai">🤖 AI</span>' : ''}
                </div>
                <div class="item-subtitle">${escapeHtml(content.content_type)} • ${escapeHtml(content.topic || 'No topic')}</div>
                <div class="item-meta">
                    <span class="item-meta-item">👁️ ${content.views} views</span>
                    <span class="item-meta-item">⭐ ${content.engagement_score?.toFixed(1) || 0} engagement</span>
                </div>
            </div>
            <div class="item-actions">
                <span class="item-value">${content.views}</span>
                <span class="item-date">${formatDate(content.created_at)}</span>
            </div>
        </div>
    `;
}

function createEmptyState(icon, title, subtitle) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-text">${escapeHtml(title)}</div>
            <div class="empty-state-subtext">${escapeHtml(subtitle)}</div>
        </div>
    `;
}

// ============================================== 
// Detail Modals
// ============================================== 

function showLeadDetail(id) {
    const lead = state.leads.find(function(l) { return l.id === id; });
    if (!lead) return;
    
    const tierIcon = lead.tier === 'hot' ? '🔥' : (lead.tier === 'warm' ? '🌡️' : '❄️');
    
    document.getElementById('modal-title').textContent = `${tierIcon} Lead: ${lead.name}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-grid">
            <div class="detail-group">
                <div class="detail-label">Name</div>
                <div class="detail-value">${escapeHtml(lead.name)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Email</div>
                <div class="detail-value">${escapeHtml(lead.email)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Company</div>
                <div class="detail-value">${escapeHtml(lead.company)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Industry</div>
                <div class="detail-value">${escapeHtml(lead.industry || 'Unknown')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Tier</div>
                <div class="detail-value"><span class="item-badge ${lead.tier}">${lead.tier.toUpperCase()}</span></div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status</div>
                <div class="detail-value">${escapeHtml(lead.status || 'New')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Score</div>
                <div class="detail-value">${lead.score}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">AI Score</div>
                <div class="detail-value">${lead.ai_score?.toFixed(1) || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-group">
            <div class="detail-label">Created</div>
            <div class="detail-value">${formatDateTime(lead.created_at)}</div>
        </div>
    `;
    
    openModal();
}

function showCustomerDetail(id) {
    const customer = state.customers.find(function(c) { return c.id === id; });
    if (!customer) return;
    
    document.getElementById('modal-title').textContent = `👥 Customer: ${customer.name}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-grid">
            <div class="detail-group">
                <div class="detail-label">Name</div>
                <div class="detail-value">${escapeHtml(customer.name)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Email</div>
                <div class="detail-value">${escapeHtml(customer.email)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Company</div>
                <div class="detail-value">${escapeHtml(customer.company)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="item-badge ${customer.status}">${customer.status.toUpperCase()}</span></div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Lifetime Value</div>
                <div class="detail-value">${formatCurrency(customer.lifetime_value)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Total Invoices</div>
                <div class="detail-value">${customer.total_invoices}</div>
            </div>
        </div>
        <div class="detail-group">
            <div class="detail-label">Customer Since</div>
            <div class="detail-value">${formatDateTime(customer.created_at)}</div>
        </div>
    `;
    
    openModal();
}

function showInvoiceDetail(id) {
    const invoice = state.invoices.find(function(i) { return i.id === id; });
    if (!invoice) return;
    
    document.getElementById('modal-title').textContent = `💰 Invoice: ${invoice.invoice_number}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-grid">
            <div class="detail-group">
                <div class="detail-label">Invoice Number</div>
                <div class="detail-value">${escapeHtml(invoice.invoice_number)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Vendor</div>
                <div class="detail-value">${escapeHtml(invoice.vendor)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="item-badge ${invoice.payment_status}">${invoice.payment_status.toUpperCase()}</span></div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">${formatDate(invoice.issue_date)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">${formatDate(invoice.due_date)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Total Amount</div>
                <div class="detail-value">${formatCurrency(invoice.total_amount)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Paid Amount</div>
                <div class="detail-value">${formatCurrency(invoice.paid_amount)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Outstanding</div>
                <div class="detail-value">${formatCurrency(invoice.total_amount - invoice.paid_amount)}</div>
            </div>
        </div>
    `;
    
    openModal();
}

function showContentDetail(id) {
    const content = state.content.find(function(c) { return c.id === id; });
    if (!content) return;
    
    document.getElementById('modal-title').textContent = `📝 ${content.title}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-grid">
            <div class="detail-group">
                <div class="detail-label">Title</div>
                <div class="detail-value">${escapeHtml(content.title)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Type</div>
                <div class="detail-value">${escapeHtml(content.content_type)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Topic</div>
                <div class="detail-value">${escapeHtml(content.topic || 'No topic')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="item-badge ${content.status}">${content.status.toUpperCase()}</span></div>
            </div>
            <div class="detail-group">
                <div class="detail-label">AI Generated</div>
                <div class="detail-value">${content.ai_generated ? '🤖 Yes' : 'No'}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Views</div>
                <div class="detail-value">${content.views}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Engagement Score</div>
                <div class="detail-value">${content.engagement_score?.toFixed(1) || 0}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Created</div>
                <div class="detail-value">${formatDateTime(content.created_at)}</div>
            </div>
        </div>
    `;
    
    openModal();
}

function openModal() {
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on backdrop click
document.getElementById('detailModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('detailModal').classList.contains('active')) {
        closeModal();
    }
});

// ============================================== 
// AI Assistant
// ============================================== 

function submitQuestion(event) {
    event.preventDefault();
    const input = document.getElementById('ai-question-input');
    const question = input.value.trim();
    
    if (!question) return;
    
    askQuestion(question);
    input.value = '';
}

async function askQuestion(question) {
    const messagesEl = document.getElementById('ai-messages');
    
    // Add user message
    messagesEl.innerHTML += `
        <div class="ai-message user">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${escapeHtml(question)}</p>
            </div>
        </div>
    `;
    
    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    messagesEl.innerHTML += `
        <div class="ai-message assistant" id="${typingId}">
            <div class="message-avatar">🤖</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    try {
        const response = await fetch(API_BASE_URL + '/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question,
                user_id: 'explore_ui',
                session_id: state.aiSessionId
            })
        });
        
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.remove();
        }
        
        if (response.ok) {
            const data = await response.json();
            addAssistantMessage(data.answer || 'I received your question but could not generate a response.');
        } else {
            addAssistantMessage('I apologize, but I encountered an error processing your request. Please ensure the n8n workflow is running and try again.');
        }
    } catch (error) {
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.remove();
        }
        
        console.error('AI Assistant error:', error);
        addAssistantMessage('I apologize, but I cannot connect to the AI service right now. Please ensure the n8n workflow is running at ' + API_BASE_URL + '/ai-assistant');
    }
    
    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addAssistantMessage(message) {
    const messagesEl = document.getElementById('ai-messages');
    messagesEl.innerHTML += `
        <div class="ai-message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ============================================== 
// Utility Functions
// ============================================== 

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCurrency(amount) {
    if (typeof amount !== 'number') amount = 0;
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
