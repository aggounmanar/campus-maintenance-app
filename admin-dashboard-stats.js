// Admin Statistics Dashboard - Smart Maintenance (متوافق مع قاعدة البيانات)
let statusChart, priorityChart, buildingChart, categoryChart;

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

function getStatusName(statusId) {
    let statuses = loadStatuses();
    let stat = statuses.find(s => s.status_id === statusId);
    return stat ? stat.name : "Unknown";
}

function getCategoryName(categoryId) {
    let categories = loadCategories();
    let cat = categories.find(c => c.category_id === categoryId);
    return cat ? cat.name : "Unknown";
}

function getLocationBuilding(locationId) {
    let locations = loadLocations();
    let loc = locations.find(l => l.location_id === locationId);
    return loc ? loc.building_name : "Unknown";
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

function refreshDashboard() {
    const reports = loadReports();
    const total = reports.length;
    const reported = reports.filter(r => r.status_id === 1).length;
    const inProgress = reports.filter(r => r.status_id === 4).length;
    const resolved = reports.filter(r => r.status_id === 5).length;
    const highPriority = reports.filter(r => r.priority_level === 'High').length;
    const mediumPriority = reports.filter(r => r.priority_level === 'Medium').length;
    const lowPriority = reports.filter(r => r.priority_level === 'Low').length;
    const completionRate = total ? ((resolved / total) * 100).toFixed(1) : 0;

    document.getElementById('summaryCards').innerHTML = `
        <div class="stat-card"><div class="number">${total}</div><div class="label">📋 Total Reports</div></div>
        <div class="stat-card"><div class="number">${reported}</div><div class="label">⏳ Pending</div></div>
        <div class="stat-card"><div class="number">${inProgress}</div><div class="label">🔄 In Progress</div></div>
        <div class="stat-card"><div class="number">${resolved}</div><div class="label">✅ Resolved</div></div>
        <div class="stat-card"><div class="number">${highPriority}</div><div class="label">⚠️ High Priority</div></div>
        <div class="stat-card"><div class="number">${completionRate}%</div><div class="label">📊 Completion Rate</div></div>
    `;

    const statusIds = [1, 2, 3, 4, 5];
    const statusCounts = statusIds.map(id => reports.filter(r => r.status_id === id).length);
    const statusNames = statusIds.map(id => getStatusName(id));
    
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: statusNames,
            datasets: [{
                data: statusCounts,
                backgroundColor: ['#e67e22', '#3498db', '#9b59b6', '#f1c40f', '#2ecc71'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: 'white', font: { size: 12 } } }
            }
        }
    });

    const priorities = ['High', 'Medium', 'Low'];
    const priorityCounts = priorities.map(p => reports.filter(r => r.priority_level === p).length);
    
    if (priorityChart) priorityChart.destroy();
    priorityChart = new Chart(document.getElementById('priorityChart'), {
        type: 'bar',
        data: {
            labels: priorities,
            datasets: [{
                label: 'Number of Reports',
                data: priorityCounts,
                backgroundColor: ['#e74c3c', '#f39c12', '#2ecc71'],
                borderRadius: 10,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });

    const buildingCounts = {};
    reports.forEach(r => {
        const building = getLocationBuilding(r.location_id);
        buildingCounts[building] = (buildingCounts[building] || 0) + 1;
    });
    
    if (buildingChart) buildingChart.destroy();
    buildingChart = new Chart(document.getElementById('buildingChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(buildingCounts),
            datasets: [{
                data: Object.values(buildingCounts),
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { labels: { color: 'white', font: { size: 11 } } } }
        }
    });

    const categoryCounts = {};
    reports.forEach(r => {
        const category = getCategoryName(r.category_id);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: 'Number of Reports',
                data: Object.values(categoryCounts),
                backgroundColor: '#3498db',
                borderRadius: 10,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'white', maxRotation: 45, minRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });

    showNotification("📊 Dashboard refreshed!");
}

function initializeSampleData() {
    let categories = JSON.parse(localStorage.getItem("categories") || "[]");
    if (categories.length === 0) {
        categories = [
            { category_id: 1, name: "Lighting", description: "Broken or flickering lights" },
            { category_id: 2, name: "Air Conditioning", description: "AC units not working" },
            { category_id: 3, name: "Network", description: "Wi-Fi or wired network issues" },
            { category_id: 4, name: "Plumbing", description: "Water leaks, broken pipes" },
            { category_id: 5, name: "Classroom Equipment", description: "Projectors, boards, chairs" },
            { category_id: 6, name: "Electrical", description: "Power outlets, short circuits" },
            { category_id: 7, name: "Cleaning", description: "Dirty classrooms, common areas" },
            { category_id: 8, name: "Security", description: "Broken cameras, doors, alarms" },
            { category_id: 9, name: "Other", description: "Miscellaneous issues" },
            { category_id: 10, name: "HVAC", description: "Heating, ventilation, and air conditioning" },
            { category_id: 11, name: "Furniture", description: "Broken chairs, tables, cabinets" }
        ];
        localStorage.setItem("categories", JSON.stringify(categories));
    }

    let statuses = JSON.parse(localStorage.getItem("statuses") || "[]");
    if (statuses.length === 0) {
        statuses = [
            { status_id: 1, name: "Reported", description: "Issue reported, pending validation" },
            { status_id: 2, name: "Validated", description: "Issue confirmed by admin" },
            { status_id: 3, name: "Assigned", description: "Technician assigned" },
            { status_id: 4, name: "In Progress", description: "Being fixed" },
            { status_id: 5, name: "Resolved", description: "Issue fixed" }
        ];
        localStorage.setItem("statuses", JSON.stringify(statuses));
    }

    let locations = JSON.parse(localStorage.getItem("locations") || "[]");
    if (locations.length === 0) {
        // تحديث إحداثيات المواقع لتتناسب مع الخريطة الجديدة
        locations = [
            { location_id: 1, building_name: "Building A", floor: 1, room_number: null, latitude: 35.6310, longitude: 6.2742 },
            { location_id: 2, building_name: "Library", floor: 2, room_number: null, latitude: 35.6315, longitude: 6.2748 },
            { location_id: 3, building_name: "Building C", floor: 3, room_number: null, latitude: 35.6308, longitude: 6.2740 },
            { location_id: 4, building_name: "Student Center", floor: 1, room_number: "101", latitude: 35.6312, longitude: 6.2745 }
        ];
        localStorage.setItem("locations", JSON.stringify(locations));
    }

    let reports = JSON.parse(localStorage.getItem("reports") || "[]");
    if (reports.length === 0) {
        function genId() { return Date.now() + '-' + Math.random().toString(36).substr(2, 9); }
        reports = [
            { report_id: genId(), user_id: 3, category_id: 4, status_id: 1, location_id: 1, assigned_technician_id: null, title: "Water Leak", description: "Water leaking from pipe", image_url: null, reported_at: new Date().toISOString(), priority_level: "High", solution: null, resolved_by: null, resolved_at: null },
            { report_id: genId(), user_id: 3, category_id: 2, status_id: 4, location_id: 2, assigned_technician_id: 2, title: "Broken AC", description: "AC not working", image_url: null, reported_at: new Date().toISOString(), priority_level: "Medium", solution: null, resolved_by: null, resolved_at: null },
            { report_id: genId(), user_id: 4, category_id: 3, status_id: 2, location_id: 3, assigned_technician_id: null, title: "Network Issue", description: "No WiFi", image_url: null, reported_at: new Date().toISOString(), priority_level: "High", solution: null, resolved_by: null, resolved_at: null },
            { report_id: genId(), user_id: 3, category_id: 11, status_id: 5, location_id: 4, assigned_technician_id: 2, title: "Broken Chair", description: "Chair leg broken", image_url: null, reported_at: new Date().toISOString(), priority_level: "Low", solution: "Replaced with new chair", resolved_by: 2, resolved_at: new Date().toISOString() }
        ];
        localStorage.setItem("reports", JSON.stringify(reports));
    }

    let comments = JSON.parse(localStorage.getItem("comments") || "[]");
    if (comments.length === 0 && reports.length > 0) {
        comments = [
            { comment_id: 1, report_id: reports[0].report_id, user_id: 1, user_name: "Admin", comment_text: "This needs immediate attention. Sending technician.", created_at: new Date().toISOString() },
            { comment_id: 2, report_id: reports[0].report_id, user_id: 2, user_name: "Technician One", comment_text: "I will check this today.", created_at: new Date().toISOString() },
            { comment_id: 3, report_id: reports[1].report_id, user_id: 1, user_name: "Admin", comment_text: "Assigned to HVAC team.", created_at: new Date().toISOString() }
        ];
        localStorage.setItem("comments", JSON.stringify(comments));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    refreshDashboard();
    setInterval(refreshDashboard, 30000);
});

window.refreshDashboard = refreshDashboard;