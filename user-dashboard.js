// Student Dashboard - Smart Maintenance (نسخة الشريط الخارجي مع بحث محسن)
let map, allMarkers = [];
let isProcessing = false;

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

function initSampleData() {
    let categories = loadCategories();
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

    let statuses = loadStatuses();
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

    let locations = loadLocations();
    if (locations.length === 0) {
        locations = [
            { location_id: 1, building_name: "Building A", floor: 1, room_number: null, latitude: 35.6310, longitude: 6.2742 },
            { location_id: 2, building_name: "Library", floor: 2, room_number: null, latitude: 35.6315, longitude: 6.2748 },
            { location_id: 3, building_name: "Building C", floor: 3, room_number: null, latitude: 35.6308, longitude: 6.2740 }
        ];
        localStorage.setItem("locations", JSON.stringify(locations));
    }

    let reports = loadReports();
    if (reports.length === 0) {
        reports = [
            { report_id: generateId(), user_id: 3, category_id: 4, status_id: 1, location_id: 1, assigned_technician_id: null, title: "Water Leak", description: "Water leaking from pipe near entrance", image_url: null, reported_at: new Date().toISOString(), priority_level: "High", solution: null, resolved_by: null, resolved_at: null },
            { report_id: generateId(), user_id: 3, category_id: 2, status_id: 4, location_id: 2, assigned_technician_id: 2, title: "Broken AC", description: "Air conditioning not working in library", image_url: null, reported_at: new Date().toISOString(), priority_level: "Medium", solution: null, resolved_by: null, resolved_at: null },
            { report_id: generateId(), user_id: 4, category_id: 3, status_id: 2, location_id: 3, assigned_technician_id: null, title: "Network Issue", description: "No WiFi connection in Building C", image_url: null, reported_at: new Date().toISOString(), priority_level: "High", solution: null, resolved_by: null, resolved_at: null }
        ];
        saveReports(reports);
    }
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

function showReportDialog(latlng) {
    if (isProcessing) return;
    isProcessing = true;
    
    let nearest = null;
    let nearestDist = 0;
    
    allMarkers.forEach(m => {
        let dist = Math.sqrt(Math.pow(latlng.lat - m.getLatLng().lat, 2) + Math.pow(latlng.lng - m.getLatLng().lng, 2)) * 111000;
        if (dist < 20) {
            nearest = m;
            nearestDist = dist;
        }
    });
    
    if (nearest) {
        let r = nearest.reportData;
        let categoryName = getCategoryName(r.category_id);
        let statusName = getStatusName(r.status_id);
        let result = confirm(`⚠️ Report nearby (${nearestDist.toFixed(0)}m)\n\n"${r.title}"\nStatus: ${statusName}\nCategory: ${categoryName}\n\nAdd a comment instead of creating a duplicate?`);
        if (result) {
            openCommentModal(r.report_id);
        }
    } else {
        let result = confirm("📍 No report nearby.\n\nCreate a NEW report at this location?");
        if (result) {
            localStorage.setItem("selectedLat", latlng.lat);
            localStorage.setItem("selectedLng", latlng.lng);
            window.location.href = "submit-report.html";
        }
    }
    
    setTimeout(function() {
        isProcessing = false;
    }, 1000);
}

function initMap() {
    map = initSchoolMap('map');
    loadAllPins();
    
    // Attach external toolbar controls
    attachExternalToolbar();
    
    // Map click handler for creating reports
    setTimeout(function() {
        map.on('click', function(e) {
            let target = e.originalEvent.target;
            if (target && (target.closest('.external-map-toolbar') || target.closest('.search-area'))) {
                return;
            }
            showReportDialog(e.latlng);
        });
        
        map.eachLayer(function(layer) {
            if (layer instanceof L.GeoJSON || layer instanceof L.Polygon || layer instanceof L.Path) {
                layer.on('click', function(e) {
                    let target = e.originalEvent.target;
                    if (target && (target.closest('.external-map-toolbar') || target.closest('.search-area'))) {
                        return;
                    }
                    L.DomEvent.stopPropagation(e);
                    showReportDialog(e.latlng);
                });
            }
            if (layer.eachLayer) {
                layer.eachLayer(function(subLayer) {
                    if (subLayer instanceof L.Polygon || subLayer instanceof L.Path) {
                        subLayer.on('click', function(e) {
                            let target = e.originalEvent.target;
                            if (target && (target.closest('.external-map-toolbar') || target.closest('.search-area'))) {
                                return;
                            }
                            L.DomEvent.stopPropagation(e);
                            showReportDialog(e.latlng);
                        });
                    }
                });
            }
        });
    }, 1500);
}

// Attach external toolbar buttons (مبسط - البحث يتم عبر campus-map.js)
function attachExternalToolbar() {
    const zoomInBtn = document.getElementById('extZoomIn');
    const zoomOutBtn = document.getElementById('extZoomOut');
    const resetBtn = document.getElementById('extReset');
    const searchToggle = document.getElementById('extSearchToggle');
    const searchArea = document.getElementById('extSearchArea');
    const searchInput = document.getElementById('extSearchInput');
    const searchResults = document.getElementById('extSearchResults');
    
    if (zoomInBtn) {
        zoomInBtn.onclick = () => { if (map) map.zoomIn(); showToast('Zooming in...'); };
    }
    if (zoomOutBtn) {
        zoomOutBtn.onclick = () => { if (map) map.zoomOut(); showToast('Zooming out...'); };
    }
    if (resetBtn) {
        resetBtn.onclick = () => { if (map) map.setView([35.6312, 6.2745], 18); showToast('View reset to campus center'); };
    }
    if (searchToggle && searchArea) {
        searchToggle.onclick = () => {
            const isVisible = searchArea.style.display === 'flex';
            searchArea.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                setTimeout(() => searchInput?.focus(), 100);
            }
        };
    }
    
    // إغلاق نتائج البحث عند الضغط خارج منطقة البحث
    document.addEventListener('click', (e) => {
        if (searchArea && !searchArea.contains(e.target) && searchToggle !== e.target) {
            if (searchResults) searchResults.classList.remove('show');
        }
    });
}

function showToast(message) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 13px;
            z-index: 2000;
            backdrop-filter: blur(10px);
            pointer-events: none;
            transition: opacity 0.3s;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 1500);
}

function loadAllPins() {
    if (allMarkers.length > 0) {
        allMarkers.forEach(m => map.removeLayer(m));
    }
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
            
            marker.bindPopup(`
                <div style="min-width:260px;max-width:300px;background:white;border-radius:15px;padding:10px;">
                    <b>📋 ${escapeHtml(r.title)}</b>
                    <hr>
                    <p style="font-size:12px;margin:5px 0;">${escapeHtml(r.description)}</p>
                    <div>📊 Status: <b style="color:${statusColor}">${statusName}</b> | ⚠️ Priority: <b style="color:${priorityColor}">${r.priority_level}</b></div>
                    <div>🔧 Category: ${categoryName}</div>
                    <div>🏢 Building: ${escapeHtml(location.building_name)}</div>
                    ${location.floor ? `<div>📍 Floor: ${location.floor}</div>` : ''}
                    ${location.room_number ? `<div>🚪 Room: ${location.room_number}</div>` : ''}
                    <div>📅 Reported: ${formatDate(r.reported_at)}</div>
                    ${solutionHtml}
                    ${commentsHtml}
                    <button onclick="openCommentModal('${r.report_id}')" style="background:#3498db;color:white;border:none;padding:8px;border-radius:8px;margin-top:8px;width:100%;cursor:pointer;">💬 Add Your Comment</button>
                </div>
            `);
            marker.reportData = r;
            allMarkers.push(marker);
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
    let userName = sessionStorage.getItem("userName") || "Student";
    let userId = parseInt(sessionStorage.getItem("userId") || 3);
    let comment = prompt("💬 Write your comment about this issue:");
    if (comment && comment.trim()) {
        addCommentToReport(reportId, userId, userName, comment);
        loadAllPins();
        showNotification("✅ Comment added! The technician will see it.");
    }
}

function createNewReport() {
    alert("📍 Click anywhere on the map to create a new report!");
}

window.openCommentModal = openCommentModal;
window.createNewReport = createNewReport;

document.addEventListener('DOMContentLoaded', function() {
    initSampleData();
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