// All Reports - Smart Maintenance (متوافق مع قاعدة البيانات - مع جدول Comments منفصل)
let allReports = [];

function loadReports() { 
    allReports = JSON.parse(localStorage.getItem("reports") || "[]");
    return allReports;
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

function getLocationBuilding(locationId) {
    let locations = loadLocations();
    let loc = locations.find(l => l.location_id === locationId);
    return loc ? loc.building_name : "Unknown";
}

function getCommentsForReport(reportId) {
    let allComments = loadComments();
    return allComments.filter(c => c.report_id === reportId);
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

function buildNavbar() {
    const navbar = document.getElementById("navbar");
    const role = sessionStorage.getItem("role");
    
    if (role === "admin") {
        navbar.innerHTML = `
            <span onclick="location.href='admin-dashboard.html'">🗺️ Map</span>
            <span onclick="location.href='admin-dashboard-stats.html'">📊 Statistics</span>
            <span onclick="location.href='all-reports.html'">📋 Reports</span>
            <span onclick="location.href='manage-status.html'">⚙️ Manage</span>
        `;
    } else if (role === "technician") {
        navbar.innerHTML = `
            <span onclick="location.href='technician-dashboard.html'">🗺️ Map</span>
            <span onclick="location.href='all-reports.html'">📋 Reports</span>
        `;
    } else {
        navbar.innerHTML = ``;
    }
}

function getStatusColor(statusId) {
    const colors = { 1: '#e67e22', 2: '#3498db', 3: '#9b59b6', 4: '#f1c40f', 5: '#2ecc71' };
    return colors[statusId] || '#555';
}

function getPriorityColor(priority) {
    const colors = { 'Low': '#2ecc71', 'Medium': '#f39c12', 'High': '#e74c3c' };
    return colors[priority] || '#555';
}

function filterR() {
    const buildingFilter = document.getElementById("fb").value;
    const statusFilter = document.getElementById("fs").value;
    const priorityFilter = document.getElementById("fp").value;
    const searchText = document.getElementById("st").value.toLowerCase();
    
    const filtered = allReports.filter(report => {
        const building = getLocationBuilding(report.location_id);
        const statusName = getStatusName(report.status_id);
        return (buildingFilter === "all" || building === buildingFilter) && 
               (statusFilter === "all" || statusName === statusFilter) && 
               (priorityFilter === "all" || report.priority_level === priorityFilter) &&
               (searchText === "" || (report.title && report.title.toLowerCase().includes(searchText)));
    });
    
    displayReports(filtered);
}

function displayReports(reports) {
    const container = document.getElementById("tableContainer");
    
    if (reports.length === 0) {
        container.innerHTML = "<div class='empty-message'>📭 No reports found</div>";
        return;
    }

    let html = `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Building</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    reports.forEach((report, index) => {
        const statusColor = getStatusColor(report.status_id);
        const priorityColor = getPriorityColor(report.priority_level);
        const statusName = getStatusName(report.status_id);
        const categoryName = getCategoryName(report.category_id);
        const buildingName = getLocationBuilding(report.location_id);
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(report.title)}</strong></td>
                <td>${escapeHtml(buildingName)}</td>
                <td>${escapeHtml(categoryName)}</td>
                <td><span class="status-badge" style="background:${statusColor}20; color:${statusColor}; border:1px solid ${statusColor}">${statusName}</span></td>
                <td><span class="status-badge" style="background:${priorityColor}20; color:${priorityColor}; border:1px solid ${priorityColor}">${report.priority_level}</span></td>
                <td>${formatDate(report.reported_at)}</td>
                <td><button class="view-btn" onclick="viewDetails('${report.report_id}')">View</button></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function viewDetails(reportId) {
    const report = allReports.find(r => r.report_id === reportId);
    if (!report) return;
    
    const statusColor = getStatusColor(report.status_id);
    const priorityColor = getPriorityColor(report.priority_level);
    const statusName = getStatusName(report.status_id);
    const categoryName = getCategoryName(report.category_id);
    const buildingName = getLocationBuilding(report.location_id);
    
    // جلب التعليقات من جدول Comments المنفصل
    let reportComments = getCommentsForReport(reportId);
    let commentsHtml = '';
    if (reportComments && reportComments.length > 0) {
        commentsHtml = '<h4 style="margin-top:15px;">💬 Comments:</h4>';
        reportComments.forEach(comment => {
            commentsHtml += `<div style="padding:8px; background:#f5f5f5; margin:5px 0; border-radius:8px;"><strong>${escapeHtml(comment.user_name)}</strong> <small style="color:#999;">${formatDate(comment.created_at)}</small><br>${escapeHtml(comment.comment_text)}</div>`;
        });
    } else {
        commentsHtml = '<p style="margin-top:15px;">No comments yet.</p>';
    }
    
    let solutionHtml = '';
    if (report.status_id === 5 && report.solution) {
        solutionHtml = `<div style="background:#e8f5e9; padding:10px; border-radius:10px; margin:10px 0;"><strong>✅ Solution:</strong><br>${escapeHtml(report.solution)}<br><small>Resolved on ${formatDate(report.resolved_at)}</small></div>`;
    }
    
    let imageHtml = '';
    if (report.image_url) {
        imageHtml = `<div style="margin:10px 0;"><strong> Photo:</strong><br><img src="${report.image_url}" style="max-width:100%; border-radius:10px; max-height:200px; cursor:pointer;" onclick="window.open(this.src)"></div>`;
    }
    
    document.getElementById("modalBody").innerHTML = `
        <p><strong> Title:</strong> ${escapeHtml(report.title)}</p>
        <p><strong> Description:</strong> ${escapeHtml(report.description)}</p>
        <p><strong> Building:</strong> ${escapeHtml(buildingName)}</p>
        <p><strong> Category:</strong> ${escapeHtml(categoryName)}</p>
        <p><strong> Status:</strong> <span class="status-badge" style="background:${statusColor}20; color:${statusColor}; border:1px solid ${statusColor}">${statusName}</span></p>
        <p><strong> Priority:</strong> <span class="status-badge" style="background:${priorityColor}20; color:${priorityColor}; border:1px solid ${priorityColor}">${report.priority_level}</span></p>
        <p><strong> Date:</strong> ${formatDate(report.reported_at)}</p>
        ${solutionHtml}
        ${imageHtml}
        <hr>
        ${commentsHtml}
    `;
    
    document.getElementById("detailModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("detailModal").style.display = "none";
}

function exportCSV() {
    let csv = "ID,Title,Description,Building,Category,Status,Priority,Date\n";
    allReports.forEach(report => {
        const buildingName = getLocationBuilding(report.location_id);
        const categoryName = getCategoryName(report.category_id);
        const statusName = getStatusName(report.status_id);
        csv += `"${report.report_id}","${(report.title || '').replace(/"/g, '""')}","${(report.description || '').replace(/"/g, '""')}","${buildingName}","${categoryName}","${statusName}","${report.priority_level}","${report.reported_at || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reports_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    alert("✅ Reports exported to CSV!");
}

document.addEventListener('DOMContentLoaded', function() {
    buildNavbar();
    loadReports();
    filterR();
});

window.filterR = filterR;
window.viewDetails = viewDetails;
window.closeModal = closeModal;
window.exportCSV = exportCSV;