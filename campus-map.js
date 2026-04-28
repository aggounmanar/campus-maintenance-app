// campus-map.js - خريطة المدرسة (نسخة نهائية مع بحث تلقائي)
let activeMap = null;

function initSchoolMap(mapElementId) {
    // إنشاء الخريطة
    activeMap = L.map(mapElementId, {
        zoomControl: false,
        maxZoom: 22,
        minZoom: 15,
        zoomSnap: 0.5
    }).setView([35.6312, 6.2745], 18);

    // طبقات الخريطة
    const baseMaps = {
        "🗺️ CartoDB Voyager": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OSM & CartoDB',
            subdomains: 'abcd',
            maxZoom: 22
        }),
        "🌍 OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OSM contributors',
            maxZoom: 19
        }),
        "🌙 CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OSM & CartoDB',
            subdomains: 'abcd',
            maxZoom: 22
        }),
        "🛰️ Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
        })
    };

    baseMaps["🗺️ CartoDB Voyager"].addTo(activeMap);

    // بيانات المباني الكاملة
    const campusGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            { "type": "Feature", "properties": { "name": "Amphi Haba Belgacem", "type": "amphi", "color": "#8b6b4d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274143,35.630735], [6.274322,35.63092], [6.274459,35.630833], [6.274293,35.630646], [6.274143,35.630735]]] } },
            { "type": "Feature", "properties": { "name": "Parking Zone North", "type": "parking", "color": "#2c7a6e" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.273823,35.6308], [6.274185,35.631216], [6.274314,35.631153], [6.273952,35.630731], [6.273823,35.6308]]] } },
            { "type": "Feature", "properties": { "name": "Central Green", "type": "greenery", "color": "#468347" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.273834,35.630563], [6.273883,35.63055], [6.274349,35.631083], [6.274312,35.63111], [6.273834,35.630563]]] } },
            { "type": "Feature", "properties": { "name": "Small Pavilion", "type": "facility", "color": "#7f8c8d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274033,35.630582], [6.274094,35.630652], [6.274041,35.630687], [6.273982,35.630613], [6.274033,35.630582]]] } },
            { "type": "Feature", "properties": { "name": "Academic Block A", "type": "building", "color": "#6c8fb3" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274194,35.630547], [6.274676,35.63072], [6.274746,35.630571], [6.274271,35.63041], [6.274194,35.630547]]] } },
            { "type": "Feature", "properties": { "name": "Amphi Rachid Touri", "type": "amphi", "color": "#8b6b4d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.27462,35.630815], [6.274842,35.630676], [6.274952,35.630791], [6.274724,35.630922], [6.27462,35.630815]]] } },
            { "type": "Feature", "properties": { "name": "Administration", "type": "admin", "color": "#b5654b" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274625,35.631116], [6.274858,35.630985], [6.275113,35.631266], [6.274928,35.631358], [6.274754,35.631181], [6.274706,35.631201], [6.274625,35.631116]]] } },
            { "type": "Feature", "properties": { "name": "Admin Annex", "type": "admin", "color": "#b5654b" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274633,35.631046], [6.274794,35.630953], [6.274826,35.630992], [6.274665,35.631086], [6.274633,35.631046]]] } },
            { "type": "Feature", "properties": { "name": "Faculty Rooms - Wing 1", "type": "academic", "color": "#6c8fb3" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275092,35.630848], [6.275411,35.631199], [6.275446,35.63119], [6.275489,35.63116], [6.275529,35.631129], [6.275566,35.631099], [6.275228,35.630744], [6.275218,35.630781], [6.275153,35.630822], [6.275092,35.630848]]] } },
            { "type": "Feature", "properties": { "name": "Cafeteria", "type": "dining", "color": "#c49a6c" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275133,35.631277], [6.275097,35.631312], [6.275092,35.631343], [6.275108,35.631388], [6.275129,35.631415], [6.275161,35.631425], [6.275173,35.631428], [6.275191,35.631436], [6.275253,35.631415], [6.275133,35.631277]]] } },
            { "type": "Feature", "properties": { "name": "Classroom Complex B", "type": "academic", "color": "#6c8fb3" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274993,35.631632], [6.275081,35.631737], [6.275518,35.631473], [6.275424,35.63138], [6.274993,35.631632]]] } },
            { "type": "Feature", "properties": { "name": "Amphi 3 - Modern Hall", "type": "amphi", "color": "#8b6b4d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275424,35.631384], [6.275507,35.631471], [6.275582,35.631476], [6.275649,35.631467], [6.275711,35.631412], [6.275733,35.631371], [6.275671,35.631358], [6.275553,35.631356], [6.275424,35.631384]]] } },
            { "type": "Feature", "properties": { "name": "Tennis Court", "type": "sports", "color": "#5e8d87" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274936,35.631576], [6.275124,35.631785], [6.275054,35.631824], [6.27485,35.631622], [6.274936,35.631576]]] } },
            { "type": "Feature", "properties": { "name": "Basketball Court", "type": "sports", "color": "#5e8d87" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275234,35.631737], [6.275178,35.63168], [6.275432,35.631526], [6.27548,35.631587], [6.275234,35.631737]]] } },
            { "type": "Feature", "properties": { "name": "Amphi 4", "type": "amphi", "color": "#8b6b4d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275574,35.631125], [6.275644,35.631138], [6.275692,35.631158], [6.275757,35.631219], [6.275757,35.631308], [6.275655,35.631273], [6.275553,35.631234], [6.275446,35.631197], [6.275574,35.631125]]] } },
            { "type": "Feature", "properties": { "name": "AI Lab / Physics Lab", "type": "lab", "color": "#bf7f4a" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275735,35.631077], [6.275826,35.631116], [6.27584,35.631092], [6.275942,35.631129], [6.275947,35.631155], [6.276046,35.631179], [6.276073,35.631134], [6.276103,35.631147], [6.276124,35.631112], [6.276175,35.631123], [6.276229,35.631038], [6.276019,35.630966], [6.275966,35.631053], [6.275877,35.631027], [6.275918,35.630935], [6.275821,35.630903], [6.275735,35.631077]]] } },
            { "type": "Feature", "properties": { "name": "Woodland Garden", "type": "greenery", "color": "#468347" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.276483,35.631073], [6.275148,35.63065], [6.274915,35.630565], [6.274293,35.630373], [6.274301,35.630338], [6.276497,35.63104], [6.276483,35.631073]]] } },
            { "type": "Feature", "properties": { "name": "Parking Central", "type": "parking", "color": "#2c7a6e" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275066,35.630717], [6.275001,35.630752], [6.274864,35.630602], [6.274928,35.63055], [6.275172,35.630624], [6.275164,35.630652], [6.275127,35.630665], [6.275094,35.630709], [6.275025,35.630646], [6.275009,35.630649], [6.275066,35.630717]]] } },
            { "type": "Feature", "properties": { "name": "Security Post", "type": "facility", "color": "#9aa0a6" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.27447,35.631221], [6.274443,35.63119], [6.274486,35.631164], [6.27451,35.631195], [6.27447,35.631221]]] } },
            { "type": "Feature", "properties": { "name": "Storage Facility", "type": "utility", "color": "#7f8c8d" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275593,35.631105], [6.275657,35.631119], [6.275655,35.631088], [6.275596,35.631077], [6.275593,35.631105]]] } },
            { "type": "Feature", "properties": { "name": "Outdoor Stage", "type": "culture", "color": "#b0a07c" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.275489,35.630835], [6.275537,35.630851], [6.275558,35.630807], [6.275505,35.6308], [6.275489,35.630835]]] } },
            { "type": "Feature", "properties": { "name": "Olive Grove", "type": "greenery", "color": "#468347" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274408,35.63125], [6.27444,35.631239], [6.275111,35.632012], [6.275617,35.632596], [6.276379,35.633476], [6.276339,35.633485], [6.275904,35.632984], [6.274971,35.631908], [6.274408,35.63125]]] } },
            { "type": "Feature", "properties": { "name": "South Meadow", "type": "greenery", "color": "#468347" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.276333,35.633733], [6.276357,35.633709], [6.273687,35.630648], [6.27366,35.630675], [6.274357,35.631478], [6.276333,35.633733]]] } },
            { "type": "Feature", "properties": { "name": "Parking Lot South", "type": "parking", "color": "#2c7a6e" },
              "geometry": { "type": "Polygon", "coordinates": [[[6.274585,35.631273], [6.274692,35.631397], [6.274789,35.631354], [6.274687,35.631225], [6.274585,35.631273]]] } },
            { "type": "Feature", "properties": { "name": "Central Walkway", "type": "path" },
              "geometry": { "type": "LineString", "coordinates": [[6.275697,35.630998], [6.275765,35.630852], [6.275234,35.630676], [6.274523,35.631077], [6.274293,35.631227]] } },
            { "type": "Feature", "properties": { "name": "Perimeter Path", "type": "path" },
              "geometry": { "type": "LineString", "coordinates": [[6.273778,35.630626], [6.276504,35.633794], [6.277164,35.633408], [6.276941,35.633153]] } },
            { "type": "Feature", "properties": { "name": "Library Link", "type": "path" },
              "geometry": { "type": "LineString", "coordinates": [[6.2751,35.630746], [6.275017,35.630654]] } },
            { "type": "Feature", "properties": { "name": "Administrative Route", "type": "path" },
              "geometry": { "type": "LineString", "coordinates": [[6.274529,35.631084], [6.274641,35.631223], [6.274617,35.631249], [6.274698,35.631345]] } },
            { "type": "Feature", "properties": { "name": "Cafeteria Connector", "type": "path" },
              "geometry": { "type": "LineString", "coordinates": [[6.275102,35.630748], [6.275175,35.630816]] } }
        ]
    };

    function getPolygonCentroid(coords) {
        let latSum = 0, lngSum = 0;
        const ring = coords[0];
        ring.forEach(p => { lngSum += p[0]; latSum += p[1]; });
        return [latSum / ring.length, lngSum / ring.length];
    }

    // ========== بناء فهرس البحث تلقائياً من بيانات المباني ==========
    function buildSearchIndexFromGeoJSON() {
        const index = [];
        
        campusGeoJSON.features.forEach(feature => {
            // فقط المضلعات (المباني) وليس الخطوط
            if (feature.geometry.type === "Polygon") {
                const name = feature.properties.name;
                const type = feature.properties.type;
                // نتخطى المسارات (paths) لأنها ليست مباني
                if (name && type !== "path" && type !== undefined) {
                    const centroid = getPolygonCentroid(feature.geometry.coordinates);
                    index.push({
                        name: name,
                        lat: centroid[0],
                        lng: centroid[1],
                        type: type
                    });
                }
            }
        });
        
        // إضافة نقاط الاهتمام الإضافية (Main Entrance, Information Desk)
        const extraPoints = [
            { name: "Main Entrance", lat: 35.63078, lng: 6.27410, type: "entrance" },
            { name: "Information Desk", lat: 35.63105, lng: 6.27462, type: "info" }
        ];
        
        extraPoints.forEach(point => {
            // نتأكد من عدم وجود اسم مكرر
            if (!index.some(i => i.name === point.name)) {
                index.push(point);
            }
        });
        
        // ترتيب حسب الاسم
        index.sort((a, b) => a.name.localeCompare(b.name));
        
        return index;
    }
    
    const searchIndex = buildSearchIndexFromGeoJSON();
    
    // console.log("Search Index contains:", searchIndex.length, "items");
    // searchIndex.forEach(item => console.log(item.name, item.lat, item.lng));

    // مجموعات الطبقات
    const buildingsGroup = L.layerGroup();
    const parkingGroup = L.layerGroup();
    const greeneryGroup = L.layerGroup();
    const pathsGroup = L.layerGroup();

    campusGeoJSON.features.forEach(feature => {
        const type = feature.properties?.type;
        let layer;

        if (feature.geometry.type === "LineString") {
            layer = L.geoJSON(feature, {
                style: { color: "#FF5C00", weight: 3.5, opacity: 0.65, dashArray: "6, 5" }
            });
            layer.bindPopup(`🚶 <strong>${feature.properties.name || "Pathway"}</strong><br>Pedestrian connection`);
            pathsGroup.addLayer(layer);
            return;
        }

        let color = feature.properties?.color || "#6c8fb3";
        let fillOpacity = 0.55;
        let weight = 1.8;
        if (type === "parking") { fillOpacity = 0.65; weight = 2.2; }
        if (type === "greenery") { fillOpacity = 0.5; weight = 1.2; }
        if (type === "amphi") { fillOpacity = 0.6; weight = 2; }

        const style = { color: color, fillColor: color, fillOpacity: fillOpacity, weight: weight, opacity: 0.9 };
        layer = L.geoJSON(feature, { style: style });

        const name = feature.properties.name || "Campus Zone";
        let popupHtml = "";
        if (type === "parking") popupHtml = `🅿️ <strong>${name}</strong><br>Parking zone`;
        else if (type === "greenery") popupHtml = `🌿 <strong>${name}</strong><br>Natural area`;
        else if (type === "amphi") popupHtml = `🎓 <strong>${name}</strong><br>Lecture hall`;
        else if (type === "lab") popupHtml = `🔬 <strong>${name}</strong><br>Research lab`;
        else popupHtml = `🏛️ <strong>${name}</strong><br>${type || "Campus facility"}`;
        layer.bindPopup(popupHtml);
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.8, weight: 2.8 }));
        layer.on('mouseout', () => layer.setStyle({ fillOpacity: fillOpacity, weight: weight }));

        if (type === "parking") parkingGroup.addLayer(layer);
        else if (type === "greenery") greeneryGroup.addLayer(layer);
        else buildingsGroup.addLayer(layer);
    });

    // Marker Cluster
    const markerCluster = L.markerClusterGroup({
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 19,
        maxClusterRadius: 70,
        iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: `<div style="background: #00b4d8; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 16px; box-shadow: 0 3px 12px rgba(0,0,0,0.3); border: 2px solid #ffe8c7;">🗺️ ${count}</div>`,
                iconSize: [40, 40],
                className: 'cluster-emoji'
            });
        }
    });

    function emojiIcon(emoji, bgColor = "#e76f51") {
        return L.divIcon({
            html: `<div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); border: 2px solid white;">${emoji}</div>`,
            iconSize: [34, 34],
            className: 'emoji-marker-on-building'
        });
    }

    campusGeoJSON.features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const type = feature.properties.type;
            let emoji = "🏛️";
            let bg = "#6c8fb3";
            if (type === "parking") { emoji = "🅿️"; bg = "#2c7a6e"; }
            else if (type === "amphi") { emoji = "🎓"; bg = "#b5654b"; }
            else if (type === "lab") { emoji = "🔬"; bg = "#bf7f4a"; }
            else if (type === "greenery") { emoji = "🌳"; bg = "#468347"; }
            else if (type === "sports") { emoji = "⚽"; bg = "#5e8d87"; }
            else if (type === "dining") { emoji = "🍽️"; bg = "#c49a6c"; }
            else if (type === "admin") { emoji = "📜"; bg = "#b5654b"; }
            
            const centroid = getPolygonCentroid(feature.geometry.coordinates);
            const marker = L.marker([centroid[0], centroid[1]], { icon: emojiIcon(emoji, bg) });
            marker.bindPopup(`<b>${emoji} ${feature.properties.name}</b><br>Type: ${type}`);
            markerCluster.addLayer(marker);
        }
    });

    const extraMarkers = [
        { name: "Main Entrance", lat: 35.63078, lng: 6.27410, emoji: "🚪", bg: "#6c8fb3", details: "Campus main gate" },
        { name: "Information Desk", lat: 35.63105, lng: 6.27462, emoji: "ℹ️", bg: "#f4a261", details: "Visitor help" }
    ];
    extraMarkers.forEach(poi => {
        const marker = L.marker([poi.lat, poi.lng], { icon: emojiIcon(poi.emoji, poi.bg) });
        marker.bindPopup(`<b>${poi.emoji} ${poi.name}</b><br>${poi.details}`);
        markerCluster.addLayer(marker);
    });

    buildingsGroup.addTo(activeMap);
    parkingGroup.addTo(activeMap);
    greeneryGroup.addTo(activeMap);
    pathsGroup.addTo(activeMap);
    markerCluster.addTo(activeMap);

    const overlayGroups = {
        "🏢 Buildings": buildingsGroup,
        "🅿️ Parking": parkingGroup,
        "🌳 Green spaces": greeneryGroup,
        "🚶 Paths": pathsGroup,
        "📍 Markers": markerCluster
    };

    L.control.layers(baseMaps, overlayGroups, { collapsed: false }).addTo(activeMap);

    let isStudentPage = document.body.classList.contains('student-page');
    
    if (!isStudentPage) {
        addMapControls();
        addSearchBox(searchIndex);
    } else {
        addStudentSearchBox(searchIndex);
    }
    
    return activeMap;
}

function addMapControls() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv || document.querySelector('.campus-map-controls')) return;
    
    mapDiv.style.position = 'relative';
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'campus-map-controls';
    controlsDiv.innerHTML = `
        <button id="campusZoomInBtn" title="Zoom In">➕</button>
        <button id="campusZoomOutBtn" title="Zoom Out">➖</button>
        <button id="campusResetBtn" title="Reset View">🗺️</button>
    `;
    mapDiv.appendChild(controlsDiv);
    
    const zoomStatus = document.createElement('div');
    zoomStatus.className = 'campus-zoom-status';
    zoomStatus.id = 'campusZoomStatus';
    zoomStatus.innerHTML = 'Zoom: 18';
    mapDiv.appendChild(zoomStatus);
    
    document.getElementById('campusZoomInBtn')?.addEventListener('click', () => activeMap.zoomIn());
    document.getElementById('campusZoomOutBtn')?.addEventListener('click', () => activeMap.zoomOut());
    document.getElementById('campusResetBtn')?.addEventListener('click', () => activeMap.setView([35.6312, 6.2745], 18));
    
    activeMap.on('zoomend', () => {
        const status = document.getElementById('campusZoomStatus');
        if (status) status.innerHTML = `Zoom: ${activeMap.getZoom().toFixed(1)}`;
    });
}

function addSearchBox(searchIndex) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv || document.querySelector('.campus-search')) return;
    
    const searchDiv = document.createElement('div');
    searchDiv.className = 'campus-search';
    searchDiv.innerHTML = `
        <input type="text" id="campusSearchInput" placeholder="🔍 Search building (e.g., Amphi, Lab, Cafeteria)" autocomplete="off">
        <div id="campusSearchResults" class="campus-search-results"></div>
    `;
    mapDiv.appendChild(searchDiv);
    
    const searchInput = document.getElementById('campusSearchInput');
    const resultsDiv = document.getElementById('campusSearchResults');
    
    function getEmojiForType(type) {
        const emojis = {
            'amphi': '🎓', 'building': '🏛️', 'academic': '📚', 'lab': '🔬',
            'admin': '📜', 'dining': '🍽️', 'library': '📖', 'parking': '🅿️',
            'sports': '⚽', 'entrance': '🚪', 'info': 'ℹ️', 'greenery': '🌳',
            'facility': '🏪', 'security': '🛡️', 'utility': '🔧', 'culture': '🎭'
        };
        return emojis[type] || '📍';
    }
    
    function performSearch(query) {
        if (!query.trim()) {
            resultsDiv.classList.remove('show');
            resultsDiv.innerHTML = '';
            return;
        }
        const lowerQuery = query.toLowerCase();
        const matches = searchIndex.filter(item => item.name.toLowerCase().includes(lowerQuery));
        
        if (matches.length === 0) {
            resultsDiv.innerHTML = '<div class="no-result">❌ No building found</div>';
            resultsDiv.classList.add('show');
            return;
        }
        
        const limited = matches.slice(0, 10);
        resultsDiv.innerHTML = limited.map(match => {
            const emoji = getEmojiForType(match.type);
            return `
                <div class="search-result-item" data-lat="${match.lat}" data-lng="${match.lng}" data-name="${match.name}" data-type="${match.type}">
                    ${emoji} ${match.name}
                </div>
            `;
        }).join('');
        resultsDiv.classList.add('show');
        
        document.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const lat = parseFloat(el.dataset.lat);
                const lng = parseFloat(el.dataset.lng);
                const name = el.dataset.name;
                const type = el.dataset.type;
                const emoji = getEmojiForType(type);
                
                if (activeMap) {
                    activeMap.flyTo([lat, lng], 19, { duration: 1 });
                    setTimeout(() => {
                        L.popup()
                            .setLatLng([lat, lng])
                            .setContent(`<b>${emoji} ${name}</b><br>📍 Location found`)
                            .openOn(activeMap);
                    }, 300);
                }
                searchInput.value = '';
                resultsDiv.classList.remove('show');
                resultsDiv.innerHTML = '';
            });
        });
    }
    
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(e.target.value);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchDiv.contains(e.target)) {
            resultsDiv.classList.remove('show');
        }
    });
}

// دالة خاصة للطالب - تدمج البحث مع شريط الأدوات الخارجي
function addStudentSearchBox(searchIndex) {
    const searchInput = document.getElementById('extSearchInput');
    const searchResults = document.getElementById('extSearchResults');
    
    if (!searchInput || !searchResults) return;
    
    function getEmojiForType(type) {
        const emojis = {
            'amphi': '🎓', 'building': '🏛️', 'academic': '📚', 'lab': '🔬',
            'admin': '📜', 'dining': '🍽️', 'library': '📖', 'parking': '🅿️',
            'sports': '⚽', 'entrance': '🚪', 'info': 'ℹ️', 'greenery': '🌳',
            'facility': '🏪', 'security': '🛡️', 'utility': '🔧', 'culture': '🎭'
        };
        return emojis[type] || '📍';
    }
    
    function performStudentSearch(query) {
        if (!query.trim()) {
            searchResults.classList.remove('show');
            searchResults.innerHTML = '';
            return;
        }
        const lowerQuery = query.toLowerCase();
        const matches = searchIndex.filter(item => item.name.toLowerCase().includes(lowerQuery));
        
        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="no-result">❌ No building found</div>';
            searchResults.classList.add('show');
            return;
        }
        
        const limited = matches.slice(0, 8);
        searchResults.innerHTML = limited.map(match => {
            const emoji = getEmojiForType(match.type);
            return `
                <div class="search-result-item" data-lat="${match.lat}" data-lng="${match.lng}" data-name="${match.name}" data-type="${match.type}">
                    ${emoji} ${match.name}
                </div>
            `;
        }).join('');
        searchResults.classList.add('show');
        
        document.querySelectorAll('#extSearchResults .search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const lat = parseFloat(el.dataset.lat);
                const lng = parseFloat(el.dataset.lng);
                const name = el.dataset.name;
                const type = el.dataset.type;
                const emoji = getEmojiForType(type);
                
                if (activeMap) {
                    activeMap.flyTo([lat, lng], 19, { duration: 1 });
                    setTimeout(() => {
                        L.popup()
                            .setLatLng([lat, lng])
                            .setContent(`<b>${emoji} ${name}</b><br>📍 Location found`)
                            .openOn(activeMap);
                    }, 300);
                }
                searchInput.value = '';
                searchResults.classList.remove('show');
                searchResults.innerHTML = '';
                
                const searchArea = document.getElementById('extSearchArea');
                if (searchArea) searchArea.style.display = 'none';
            });
        });
    }
    
    searchInput.addEventListener('input', (e) => performStudentSearch(e.target.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performStudentSearch(e.target.value);
    });
}

// الستايلات
const campusStyles = document.createElement('style');
campusStyles.textContent = `
    #map { position: relative !important; }
    
    .campus-map-controls {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .campus-map-controls button {
        width: 40px;
        height: 40px;
        background: #1e2a2f;
        border: none;
        color: white;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        backdrop-filter: blur(5px);
        background: rgba(30, 42, 47, 0.9);
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .campus-map-controls button:hover {
        background: #f4a261;
        color: #1e2a2f;
        transform: scale(1.05);
    }
    
    .campus-zoom-status {
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.65);
        color: #f4cda6;
        padding: 5px 12px;
        border-radius: 30px;
        font-size: 11px;
        font-family: monospace;
        font-weight: bold;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }
    
    .campus-search {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        width: 280px;
        background: rgba(20, 24, 30, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 40px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        padding: 5px 10px;
    }
    .campus-search input {
        width: 100%;
        background: transparent;
        border: none;
        color: white;
        font-size: 14px;
        padding: 8px 8px;
        outline: none;
    }
    .campus-search input::placeholder {
        color: #b0b8c5;
    }
    .campus-search-results {
        max-height: 250px;
        overflow-y: auto;
        background: rgba(0,0,0,0.85);
        border-radius: 20px;
        margin-top: 6px;
        display: none;
    }
    .campus-search-results.show {
        display: block;
    }
    .search-result-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;
        color: #f0f3f8;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        transition: all 0.2s;
    }
    .search-result-item:hover {
        background: #f4a261;
        color: #1e2a2f;
    }
    .no-result {
        padding: 10px;
        text-align: center;
        color: #ccc;
        font-style: italic;
    }
`;
document.head.appendChild(campusStyles);