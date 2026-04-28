// Technician Dashboard - Smart Maintenance (مع خريطة المدرسة)
let map, allMarkers = [];

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

function saveComments(comments) {
    localStorage.setItem("comments", JSON.stringify(comments));
}

function saveReports(r) { 
    localStorage.setItem("reports", JSON.stringify(r)); 
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

function escapeHtml(s) { 
    if (!s) return ''; 
    return String(s).replace(/[&<>]/g, function(m) { 
        if (m === '&') return '&amp;'; 
        if (m === '<') return '&lt;'; 
        if (m === '>') return '&gt;'; 
        return m; 
    }); 
}

function formatDate(d) { 
    if (!d) return 'N/A'; 
    return new Date(d).toLocaleString(); 
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

function addNotification(title, message, type) {
    let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.unshift({ 
        id: generateId(), 
        title: title, 
        message: message, 
        type: type, 
        read: false, 
        date: new Date().toISOString() 
    });
    if (notifications.length > 50) notifications = notifications.slice(0, 50);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    localStorage.setItem("notifications_trigger", Date.now().toString());
    showNotification("🔔 " + title);
}

function updateStatsBar() {
    let reports = loadReports();
    let total = reports.length;
    let pending = reports.filter(r => r.status_id === 1).length;
    let inProgress = reports.filter(r => r.status_id === 4).length;
    let resolved = reports.filter(r => r.status_id === 5).length;
    let highPriority = reports.filter(r => r.priority_level === 'High' && r.status_id !== 5).length;

    document.getElementById('statsBar').innerHTML = `
        <div class="stat-pill"><span>${total}</span> Total Reports</div>
        <div class="stat-pill"><span>${pending}</span> Pending</div>
        <div class="stat-pill"><span>${inProgress}</span> In Progress</div>
        <div class="stat-pill"><span>${resolved}</span> Resolved ✓</div>
        <div class="stat-pill"><span>${highPriority}</span> ⚠️ High Priority</div>
    `;
}

function getCommentsForReport(reportId) {
    let allComments = loadComments();
    return allComments.filter(c => c.report_id === reportId);
}

function addCommentToReport(reportId, userId, userName, commentText) {
    let comments = loadComments();
    let newComment = {
        comment_id: comments.length + 1,
        report_id: reportId,
        user_id: userId,
        user_name: userName,
        comment_text: commentText,
        created_at: new Date().toISOString()
    };
    comments.push(newComment);
    saveComments(comments);
    return newComment;
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
    updateStatsBar();
}

function loadAllPins() {
    allMarkers.forEach(m => map.removeLayer(m));
    allMarkers = [];
    let reports = loadReports();
    let locations = loadLocations();
    
    reports.forEach(r => {
        let location = locations.find(l => l.location_id === r.location_id);
        if (location && location.latitude && location.longitude) {
            let marker = L.marker([location.latitude, location.longitude]).addTo(map);
            let statusColor = getStatusColor(r.status_id);
            let priorityColor = getPriorityColor(r.priority_level);
            let categoryName = getCategoryName(r.category_id);
            let statusName = getStatusName(r.status_id);
            let commentsHtml = getCommentsHtml(r.report_id);
            let solutionHtml = (r.status_id === 5 && r.solution) ? `<div style="background:#e8f5e9;padding:5px;border-radius:5px;margin-top:5px;"><small>✅ Solution: ${escapeHtml(r.solution)}</small></div>` : '';
            let resolveButton = (r.status_id !== 5) ? `<button class="resolve-btn" onclick="markAsResolved('${r.report_id}')" style="background:#2ecc71;color:white;border:none;padding:8px;border-radius:8px;margin-top:8px;width:100%;cursor:pointer;">✅ Mark as Resolved</button>` : '';
            
            marker.bindPopup(`
                <div style="min-width:280px;max-width:320px;background:white;border-radius:15px;padding:10px;">
                    <b>📋 ${escapeHtml(r.title)}</b>
                    <hr>
                    <p style="font-size:12px;margin:5px 0;">${escapeHtml(r.description)}</p>
                    <div>📊 Status: <b style="color:${statusColor}">${statusName}</b> | ⚠️ Priority: <b style="color:${priorityColor}">${r.priority_level}</b></div>
                    <div>🔧 Category: ${categoryName}</div>
                    <div>🏢 Building: ${escapeHtml(location.building_name)}</div>
                    ${location.floor ? `<div>📍 Floor: ${location.floor}</div>` : ''}
                    <div>📅 Reported: ${formatDate(r.reported_at)}</div>
                    ${solutionHtml}
                    ${commentsHtml}
                    <button onclick="openCommentModal('${r.report_id}')" style="background:#3498db;color:white;border:none;padding:8px;border-radius:8px;margin-top:8px;width:100%;cursor:pointer;">💬 Add Comment</button>
                    ${resolveButton}
                </div>
            `);
            marker.reportData = r;
            allMarkers.push(marker);
        }
    });
    filterPins();
}

function filterPins() {
    let filterValue = document.getElementById("filterSelect").value;
    allMarkers.forEach(m => {
        let report = m.reportData;
        let statusName = getStatusName(report.status_id);
        if (filterValue === "all") {
            m.addTo(map);
        } else if (statusName === filterValue || report.priority_level === filterValue) {
            m.addTo(map);
        } else {
            map.removeLayer(m);
        }
    });
}

function openCommentModal(reportId) {
    let reports = loadReports();
    let report = reports.find(r => r.report_id === reportId);
    if (!report) { 
        alert("Report not found"); 
        return; 
    }
    let userName = sessionStorage.getItem("userName") || "Technician";
    let userId = parseInt(sessionStorage.getItem("userId") || 2);
    let comment = prompt("💬 Write your comment about this issue:");
    if (comment && comment.trim()) {
        addCommentToReport(reportId, userId, userName, comment);
        loadAllPins();
        showNotification("✅ Comment added!");
        updateStatsBar();
    }
}

function markAsResolved(reportId) {
    let reports = loadReports();
    let report = reports.find(r => r.report_id === reportId);
    if (!report) { 
        alert("Report not found"); 
        return; 
    }
    let solution = prompt("🔧 How did you fix this issue?\n\nPlease describe the solution:");
    if (!solution || solution.trim() === "") { 
        alert("Please provide a solution"); 
        return; 
    }
    if (!confirm(`Confirm resolution?\n\n"${report.title}"\nSolution: ${solution}`)) return;
    
    report.status_id = 5;
    report.resolved_at = new Date().toISOString();
    report.solution = solution;
    report.resolved_by = parseInt(sessionStorage.getItem("userId") || 2);
    
    let comments = loadComments();
    comments.push({
        comment_id: comments.length + 1,
        report_id: reportId,
        user_id: report.resolved_by,
        user_name: "System",
        comment_text: `✅ RESOLVED: ${solution}`,
        created_at: new Date().toISOString()
    });
    saveComments(comments);
    
    saveReports(reports);
    addNotification("✅ Issue Resolved", `"${report.title}" fixed`, "success");
    loadAllPins();
    updateStatsBar();
    showNotification("✅ Marked as resolved!");
}

window.filterPins = filterPins;
window.markAsResolved = markAsResolved;
window.openCommentModal = openCommentModal;

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
    
    setInterval(() => {
        loadAllPins();
        updateStatsBar();
    }, 30000);
});