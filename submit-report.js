// Submit Report - Smart Maintenance (متوافق مع قاعدة البيانات)
let selectedLat, selectedLng, imgData = null;
let locations = [];

function loadReports() { 
    return JSON.parse(localStorage.getItem("reports") || "[]"); 
}

function saveReports(reports) { 
    localStorage.setItem("reports", JSON.stringify(reports)); 
}

function loadLocations() {
    return JSON.parse(localStorage.getItem("locations") || "[]");
}

function saveLocations(locationsData) {
    localStorage.setItem("locations", JSON.stringify(locationsData));
}

function generateId() { 
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9); 
}

// Room number options for buildings
const buildingRooms = {
    "Classroom Complex B": Array.from({length: 10}, (_, i) => i + 1),
    "Faculty Rooms - Wing 1": Array.from({length: 12}, (_, i) => i + 11)
};

function toggleRoomNumberField() {
    const buildingSelect = document.getElementById("building_name");
    const selectedBuilding = buildingSelect.value;
    const roomGroup = document.getElementById("roomNumberGroup");
    const roomSelect = document.getElementById("room_number");
    
    if (buildingRooms[selectedBuilding]) {
        // Populate room numbers
        const rooms = buildingRooms[selectedBuilding];
        roomSelect.innerHTML = '<option value="">Select Room Number</option>';
        rooms.forEach(room => {
            roomSelect.innerHTML += `<option value="${room}">Room ${room}</option>`;
        });
        roomGroup.style.display = "block";
    } else {
        roomGroup.style.display = "none";
        roomSelect.value = "";
    }
}

selectedLat = parseFloat(localStorage.getItem("selectedLat"));
selectedLng = parseFloat(localStorage.getItem("selectedLng"));

if (!selectedLat || !selectedLng) {
    alert("⚠️ Please select a location on the map first!");
    window.location.href = "user-dashboard.html";
}

document.getElementById("locationInfo").innerHTML = `📍 Selected Location: <strong>Lat: ${selectedLat.toFixed(6)}</strong> | <strong>Lng: ${selectedLng.toFixed(6)}</strong><br>Click 'Submit' to report issue at this location.`;

document.getElementById("reportDate").value = new Date().toISOString().slice(0, 16);

function previewImage(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("previewImg").src = e.target.result;
            document.getElementById("imagePreview").style.display = "block";
            imgData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage() {
    document.getElementById("fileUpload").value = "";
    document.getElementById("imagePreview").style.display = "none";
    imgData = null;
}

function createLocation(buildingName, floor, roomNumber, lat, lng) {
    let locations = loadLocations();
    let newLocation = {
        location_id: locations.length + 1,
        building_name: buildingName,
        floor: floor || null,
        room_number: roomNumber || null,
        latitude: lat,
        longitude: lng
    };
    locations.push(newLocation);
    saveLocations(locations);
    return newLocation.location_id;
}

function submitReport() {
    let categoryId = parseInt(document.getElementById("category_id").value);
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let buildingName = document.getElementById("building_name").value;
    let floor = document.getElementById("floor").value ? parseInt(document.getElementById("floor").value) : null;
    let roomNumber = null;
    
    // Get room number only if building requires it and is selected
    const roomSelect = document.getElementById("room_number");
    if (buildingRooms[buildingName] && roomSelect.value) {
        roomNumber = roomSelect.value;
    }
    
    let reportDate = document.getElementById("reportDate").value;
    let userId = parseInt(sessionStorage.getItem("userId") || 3);

    if (!title) {
        alert("❌ Please enter a title");
        return;
    }
    if (!description) {
        alert("❌ Please enter a description");
        return;
    }
    if (!buildingName) {
        alert("❌ Please select a building");
        return;
    }
    
    // Validate room number for buildings that require it
    if (buildingRooms[buildingName] && !roomNumber) {
        alert(`❌ Please select a room number for ${buildingName}`);
        return;
    }

    let reports = loadReports();
    let duplicate = false;
    reports.forEach(report => {
        let loc = locations.find(l => l.location_id === report.location_id);
        if (loc) {
            let distance = Math.sqrt(Math.pow(selectedLat - loc.latitude, 2) + Math.pow(selectedLng - loc.longitude, 2)) * 111000;
            if (distance < 20) duplicate = true;
        }
    });

    if (duplicate) {
        alert("⚠️ A report already exists within 20 meters of this location!");
        return;
    }

    let locationId = createLocation(buildingName, floor, roomNumber, selectedLat, selectedLng);

    let priorityLevel = "Medium";
    const highPriorityCategories = [1, 3, 4, 6];
    if (highPriorityCategories.includes(categoryId)) priorityLevel = "High";
    else if (categoryId === 2) priorityLevel = "Medium";

    let newReport = {
        report_id: generateId(),
        user_id: userId,
        category_id: categoryId,
        status_id: 1,
        location_id: locationId,
        assigned_technician_id: null,
        title: title,
        description: description,
        image_url: imgData,
        reported_at: reportDate || new Date().toISOString(),
        priority_level: priorityLevel,
        solution: null,
        resolved_by: null,
        resolved_at: null,
        comments: []
    };

    reports.push(newReport);
    saveReports(reports);

    localStorage.removeItem("selectedLat");
    localStorage.removeItem("selectedLng");

    alert("✅ Report submitted successfully!");

    let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.unshift({
        id: generateId(),
        title: "📋 New Report Submitted",
        message: `${title} in ${buildingName}${roomNumber ? `, Room ${roomNumber}` : ''}`,
        type: "info",
        read: false,
        date: new Date().toISOString(),
        report_id: newReport.report_id
    });
    if (notifications.length > 50) notifications = notifications.slice(0, 50);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    localStorage.setItem("notifications_trigger", Date.now().toString());

    history.back();
}

window.previewImage = previewImage;
window.removeImage = removeImage;
window.submitReport = submitReport;
window.toggleRoomNumberField = toggleRoomNumberField;