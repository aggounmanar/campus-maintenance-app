// Admin Dashboard - Smart Maintenance (مع خريطة المدرسة)
let map, allMarkers = [], currentStatusFilter = "all";
let notificationPanel = null;

function loadReports() { 
    return JSON.parse(localStorage.getItem("reports") || "[]"); 
}

function loadCategories() {
    return JSON.parse(localStorage.getItem("categories") || "[]");
}

function loadStatuses() {
    return JSON.parse(localStorage.getItem("statuses") || "[]");
}

function loadLocations() {
    return JSON.parse(localStorage.getItem("locations") || "[]");
}

function loadComments() {
    return JSON.parse(localStorage.getItem("comments") || "[]");
}

function saveReports(reports) { 
    localStorage.setItem("reports", JSON.stringify(reports)); 
}

function generateId() { 
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9); 
}

function getCategoryName(categoryId) {
    let categories = loadCategories();
    let cat = categories.find(c => c.category_id === categoryId);
    return cat ? cat.name : "Unknown";
}

function getStatusName(statusId) {
    let statuses = loadStatuses();
    let stat = statuses.find(s => s.status_id === statusId);
    return stat ? stat.name : "Unknown";
}

function getPriorityColor(priority) {
    const colors = { 'Low': '#2ecc71', 'Medium': '#f39c12', 'High': '#e74c3c' };
    return colors[priority] || '#555';
}

function getStatusColor(statusId) {
    const colors = { 1: '#e67e22', 2: '#3498db', 3: '#9b59b6', 4: '#f1c40f', 5: '#2ecc71' };
    return colors[statusId] || '#555';
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return String(str).replace(/[&<>]/g, function(match) { 
        if (match === '&') return '&amp;'; 
        if (match === '<') return '&lt;'; 
        if (match === '>') return '&gt;'; 
        return match; 
    }); 
}

function formatDate(dateString) { 
    if (!dateString) return 'N/A'; 
    return new Date(dateString).toLocaleString(); 
}

function showNotification(message) {
    let notify = document.getElementById("notify");
    if (!notify) {
        notify = document.createElement("div");
        notify.id = "notify";
        document.body.appendChild(notify);
    }
    notify.innerHTML = message;
    notify.style.display = "block";
    notify.style.opacity = "1";
    setTimeout(() => {
        notify.style.opacity = "0";
        setTimeout(() => notify.style.display = "none", 300);
    }, 3000);
}

function updateMiniStats() {
    const reports = loadReports();
    const total = reports.length;
    const pending = reports.filter(r => r.status_id === 1).length;
    const inProgress = reports.filter(r => r.status_id === 4).length;
    const resolved = reports.filter(r => r.status_id === 5).length;
    const highPriority = reports.filter(r => r.priority_level === 'High' && r.status_id !== 5).length;

    document.getElementById('miniStats').innerHTML = `
        <div class="stat-mini-card"><div class="stat-number">${total}</div><div class="stat-label">Total Reports</div></div>
        <div class="stat-mini-card"><div class="stat-number">${pending}</div><div class="stat-label">Pending</div></div>
        <div class="stat-mini-card"><div class="stat-number">${inProgress}</div><div class="stat-label">In Progress</div></div>
        <div class="stat-mini-card"><div class="stat-number">${resolved}</div><div class="stat-label">Resolved ✓</div></div>
        <div class="stat-mini-card"><div class="stat-number">${highPriority}</div><div class="stat-label">⚠️ High Priority</div></div>
    `;
}

function getCommentsForReport(reportId) {
    let allComments = loadComments();
    return allComments.filter(c => c.report_id === reportId);
}

function getCommentsHtml(reportId) {
    let comments = getCommentsForReport(reportId);
    if (!comments || comments.length === 0) return '<div style="color:#999;font-size:11px;margin-top:5px;">💬 No comments yet</div>';
    let html = '<div style="max-height:150px;overflow-y:auto;margin-top:8px;padding:5px;background:rgba(0,0,0,0.05);border-radius:8px;"><strong>💬 Comments:</strong>';
    comments.forEach(c => { 
        html += `<div style="padding:5px;border-bottom:1px solid #eee;"><div style="font-weight:bold;color:#3498db;">👤 ${escapeHtml(c.user_name)}</div><div style="font-size:10px;color:#999;">${formatDate(c.created_at)}</div><div style="margin-top:3px;">${escapeHtml(c.comment_text)}</div></div>`; 
    });
    html += '</div>';
    return html;
}

function initMap() {
    map = initSchoolMap('map');
    loadAllPins();
    initNotificationSystem();
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'reports') {
            loadAllPins();
            updateMiniStats();
            showNotification("Reports updated");
        }
    });
}

function loadAllPins() {
    allMarkers.forEach(m => map.removeLayer(m));
    allMarkers = [];
    const reports = loadReports();
    const locations = loadLocations();
    
    reports.forEach(report => {
        let location = locations.find(l => l.location_id === report.location_id);
        if (location && location.latitude && location.longitude) {
            const marker = L.marker([location.latitude, location.longitude]).addTo(map);
            const statusColor = getStatusColor(report.status_id);
            const priorityColor = getPriorityColor(report.priority_level);
            const statusName = getStatusName(report.status_id);
            const categoryName = getCategoryName(report.category_id);
            const commentsHtml = getCommentsHtml(report.report_id);
            const solutionHtml = (report.status_id === 5 && report.solution) ? `<div style="background:#e8f5e9;padding:5px;border-radius:5px;margin-top:5px;"><small>✅ Solution: ${escapeHtml(report.solution)}</small></div>` : '';
            
            marker.bindPopup(`
                <div style="min-width:260px;max-width:300px;background:white;border-radius:15px;padding:10px;">
                    <b>📋 ${escapeHtml(report.title)}</b>
                    <hr>
                    <p style="font-size:12px;margin:5px 0;">${escapeHtml(report.description)}</p>
                    <div>📊 Status: <b style="color:${statusColor}">${statusName}</b> | ⚠️ Priority: <b style="color:${priorityColor}">${report.priority_level}</b></div>
                    <div>🔧 Category: ${categoryName}</div>
                    <div>🏢 Building: ${escapeHtml(location.building_name)}</div>
                    ${location.floor ? `<div>📍 Floor: ${location.floor}</div>` : ''}
                    <div>📅 Reported: ${formatDate(report.reported_at)}</div>
                    ${solutionHtml}
                    ${commentsHtml}
                </div>
            `);
            marker.reportData = report;
            allMarkers.push(marker);
        }
    });
    applyFilters();
}

function applyFilters() {
    allMarkers.forEach(marker => {
        const report = marker.reportData;
        const statusName = getStatusName(report.status_id);
        const statusMatch = currentStatusFilter === "all" || statusName === currentStatusFilter || report.priority_level === currentStatusFilter;
        
        if (statusMatch) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

function filterPins() {
    currentStatusFilter = document.getElementById("filterSelect").value;
    applyFilters();
    showNotification(`Filtered by: ${currentStatusFilter}`);
}

function resetFilters() {
    currentStatusFilter = "all";
    document.getElementById("filterSelect").value = "all";
    applyFilters();
    showNotification("All filters reset");
}

// Notification System
function initNotificationSystem() {
    createBell();
    window.addEventListener('storage', function(e) { 
        if (e.key === 'notifications_trigger') updateBellBadge(); 
    });
    setInterval(updateBellBadge, 5000);
    updateBellBadge();
}

function loadNotifications() { 
    return JSON.parse(localStorage.getItem("notifications") || "[]"); 
}

function saveNotifications(notifications) { 
    localStorage.setItem("notifications", JSON.stringify(notifications)); 
}

function getUnreadCount() { 
    return loadNotifications().filter(n => !n.read).length; 
}

function updateBellBadge() {
    const count = getUnreadCount();
    const badge = document.getElementById('bellBadge');
    if (badge) {
        if (count > 0) {
            badge.style.display = 'flex';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }
}

function createBell() {
    if (document.getElementById('bellDiv')) return;
    const bellDiv = document.createElement('div');
    bellDiv.id = 'bellDiv';
    bellDiv.className = 'notification-bell';
    bellDiv.innerHTML = '🔔<span id="bellBadge" class="notification-badge">0</span>';
    bellDiv.onclick = toggleNotificationPanel;
    document.body.appendChild(bellDiv);
}

function toggleNotificationPanel() {
    if (notificationPanel && notificationPanel.style.display === 'block') {
        notificationPanel.style.display = 'none';
        return;
    }
    
    if (!notificationPanel) {
        notificationPanel = document.createElement('div');
        notificationPanel.className = 'notification-panel';
        document.body.appendChild(notificationPanel);
    }
    
    const notifications = loadNotifications();
    
    if (notifications.length === 0) {
        notificationPanel.innerHTML = `
            <div style="padding:10px;text-align:center;background:#f5f5f5;cursor:pointer;color:#3498db;">🔔 Notifications</div>
            <div style="padding:20px;text-align:center;">📭 No notifications yet</div>
            <div style="padding:10px;text-align:center;background:#e74c3c;color:white;cursor:pointer;margin:5px;border-radius:8px;" onclick="clearAllNotifications()">🗑️ Clear All</div>
        `;
    } else {
        notificationPanel.innerHTML = `
            <div style="padding:10px;text-align:center;background:#f5f5f5;border-bottom:1px solid #ddd;cursor:pointer;color:#3498db;" onclick="markAllRead()">
                🔔 Notifications <span style="float:right">Mark all as read ✓</span>
            </div>
            <div style="max-height:350px;overflow-y:auto">
                ${notifications.map(n => `
                    <div style="padding:12px;border-bottom:1px solid #eee;cursor:pointer;position:relative;${!n.read ? 'background:#e3f2fd;border-left:3px solid #3498db;' : ''}">
                        <div style="font-weight:bold;margin-bottom:5px;">${n.type === 'success' ? '✅' : (n.type === 'warning' ? '⚠️' : '📢')} ${escapeHtml(n.title)}</div>
                        <div style="font-size:12px;color:#666;margin-bottom:5px;">${escapeHtml(n.message)}</div>
                        <div style="font-size:10px;color:#999;">${formatDate(n.date)}</div>
                        <button style="position:absolute;right:10px;top:10px;background:#e74c3c;color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;" onclick="event.stopPropagation(); deleteNotification('${n.id}')">✖</button>
                    </div>
                `).join('')}
            </div>
            <div style="padding:10px;text-align:center;background:#e74c3c;color:white;cursor:pointer;margin:5px;border-radius:8px;" onclick="clearAllNotifications()">🗑️ Clear All</div>
        `;
    }
    notificationPanel.style.display = 'block';
}

function markAllRead() {
    const notifications = loadNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications(notifications);
    updateBellBadge();
    if (notificationPanel) notificationPanel.style.display = 'none';
    showNotification("All marked as read");
}

function deleteNotification(id) {
    const notifications = loadNotifications().filter(n => n.id !== id);
    saveNotifications(notifications);
    updateBellBadge();
    if (notificationPanel && notificationPanel.style.display === 'block') toggleNotificationPanel();
}

function clearAllNotifications() {
    if (confirm("Delete ALL notifications?")) {
        saveNotifications([]);
        updateBellBadge();
        if (notificationPanel && notificationPanel.style.display === 'block') toggleNotificationPanel();
        showNotification("All notifications cleared");
    }
}

window.filterPins = filterPins;
window.resetFilters = resetFilters;
window.markAllRead = markAllRead;
window.deleteNotification = deleteNotification;
window.clearAllNotifications = clearAllNotifications;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') {
        initMap();
    } else {
        setTimeout(function() {
            if (typeof L !== 'undefined') {
                initMap();
            }
        }, 500);
    }
});