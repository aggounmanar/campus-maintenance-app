// Manage Status - Smart Maintenance (متوافق مع قاعدة البيانات - مع جدول Comments منفصل)
let reports = [], currentCommentReportId = null;

function loadReports() { 
    return JSON.parse(localStorage.getItem("reports") || "[]"); 
}

function loadStatuses() {
    return JSON.parse(localStorage.getItem("statuses") || "[]");
}

function loadComments() {
    return JSON.parse(localStorage.getItem("comments") || "[]");
}

function saveComments(comments) {
    localStorage.setItem("comments", JSON.stringify(comments));
}

function saveReports(reportsData) { 
    localStorage.setItem("reports", JSON.stringify(reportsData)); 
}

function getStatusName(statusId) {
    let statuses = loadStatuses();
    let stat = statuses.find(s => s.status_id === statusId);
    return stat ? stat.name : "Unknown";
}

function getStatusId(statusName) {
    let statuses = loadStatuses();
    let stat = statuses.find(s => s.name === statusName);
    return stat ? stat.status_id : 1;
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

// دالة لجلب التعليقات الخاصة بتقرير معين
function getCommentsForReport(reportId) {
    let allComments = loadComments();
    return allComments.filter(c => c.report_id === reportId);
}

function loadData() {
    reports = loadReports();
    render();
}

function render() {
    const tbody = document.querySelector("#tbl tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    if (reports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:rgba(255,255,255,0.7); padding:40px;">📭 No reports found.</td></tr>`;
        return;
    }
    
    reports.forEach((report, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s backwards`;
        
        let solutionPreview = '-';
        if (report.solution) {
            solutionPreview = report.solution.length > 50 ? 
                escapeHtml(report.solution.substring(0, 50)) + '...' : 
                escapeHtml(report.solution);
        }
        
        let currentStatusName = getStatusName(report.status_id);
        let commentsCount = getCommentsForReport(report.report_id).length;
        
        row.innerHTML = `
            <td style="color:white;">${escapeHtml(report.title)}</td>
            <td>
                <select class="statusSel" data-index="${index}">
                    <option ${currentStatusName === 'Reported' ? 'selected' : ''}>Reported</option>
                    <option ${currentStatusName === 'Validated' ? 'selected' : ''}>Validated</option>
                    <option ${currentStatusName === 'Assigned' ? 'selected' : ''}>Assigned</option>
                    <option ${currentStatusName === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option ${currentStatusName === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
            </td>
            <td>
                <select class="prioritySel" data-index="${index}">
                    <option ${report.priority_level === 'Low' ? 'selected' : ''}>Low</option>
                    <option ${report.priority_level === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option ${report.priority_level === 'High' ? 'selected' : ''}>High</option>
                </select>
            </td>
            <td style="color:rgba(255,255,255,0.7);">${solutionPreview}</td>
            <td><button class="comment-btn" onclick="openComments('${report.report_id}')">💬 ${commentsCount}</button></td>
            <td><button class="del-btn" onclick="deleteReport(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function openComments(reportId) {
    currentCommentReportId = reportId;
    const report = reports.find(r => r.report_id === reportId);
    const commentsList = document.getElementById("commentsList");
    const comments = getCommentsForReport(reportId);
    
    if (comments.length === 0) {
        commentsList.innerHTML = "<p style='color:#999;'>No comments yet. Be the first to comment!</p>";
    } else {
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">👤 ${escapeHtml(comment.user_name)}</div>
                <div class="comment-date">${formatDate(comment.created_at)}</div>
                <div class="comment-text">${escapeHtml(comment.comment_text)}</div>
            </div>
        `).join('');
    }
    
    document.getElementById("modal").style.display = "block";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    currentCommentReportId = null;
    document.getElementById("newComment").value = "";
}

function addComment() {
    const commentText = document.getElementById("newComment").value.trim();
    if (!commentText) {
        alert("Please enter a comment");
        return;
    }
    
    if (currentCommentReportId) {
        let comments = loadComments();
        let newComment = {
            comment_id: comments.length + 1,
            report_id: currentCommentReportId,
            user_id: parseInt(sessionStorage.getItem("userId") || 1),
            user_name: "Admin",
            comment_text: commentText,
            created_at: new Date().toISOString()
        };
        comments.push(newComment);
        saveComments(comments);
        
        openComments(currentCommentReportId);
        render();
        document.getElementById("newComment").value = "";
        
        addNotification("💬 New Comment", `Admin commented on report`);
    }
}

function addNotification(title, message) {
    let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.unshift({
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        title: title,
        message: message,
        type: "info",
        read: false,
        date: new Date().toISOString()
    });
    if (notifications.length > 50) notifications = notifications.slice(0, 50);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    localStorage.setItem("notifications_trigger", Date.now().toString());
}

function deleteReport(index) {
    const reportTitle = reports[index].title;
    if (confirm(`Delete "${reportTitle}"? This action cannot be undone.`)) {
        // حذف التعليقات المرتبطة أولاً
        let comments = loadComments();
        comments = comments.filter(c => c.report_id !== reports[index].report_id);
        saveComments(comments);
        
        reports.splice(index, 1);
        saveReports(reports);
        render();
        addNotification("🗑️ Report Deleted", `"${reportTitle}" was deleted by Admin`);
    }
}

function saveAllChanges() {
    const rows = document.querySelectorAll("#tbl tbody tr");
    
    rows.forEach((row, index) => {
        if (reports[index]) {
            const statusSelect = row.querySelector(".statusSel");
            const prioritySelect = row.querySelector(".prioritySel");
            
            if (statusSelect) reports[index].status_id = getStatusId(statusSelect.value);
            if (prioritySelect) reports[index].priority_level = prioritySelect.value;
            
            if (statusSelect && statusSelect.value === 'Resolved' && getStatusName(reports[index].status_id) !== 'Resolved') {
                // إضافة تعليق نظامي
                let comments = loadComments();
                comments.push({
                    comment_id: comments.length + 1,
                    report_id: reports[index].report_id,
                    user_id: parseInt(sessionStorage.getItem("userId") || 1),
                    user_name: "System",
                    comment_text: "✅ This issue has been marked as Resolved.",
                    created_at: new Date().toISOString()
                });
                saveComments(comments);
                reports[index].resolved_at = new Date().toISOString();
                reports[index].resolved_by = parseInt(sessionStorage.getItem("userId") || 1);
            }
        }
    });
    
    saveReports(reports);
    alert("✅ All changes saved successfully!");
    render();
    addNotification("💾 Changes Saved", "Report statuses and priorities have been updated");
}

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    const saveButton = document.getElementById("saveAll");
    if (saveButton) {
        saveButton.onclick = saveAllChanges;
    }
    
    window.onclick = function(event) {
        const modal = document.getElementById("modal");
        if (event.target === modal) {
            closeModal();
        }
    };
});

window.openComments = openComments;
window.closeModal = closeModal;
window.addComment = addComment;
window.deleteReport = deleteReport;