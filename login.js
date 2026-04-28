// login.js
function handleLogin() {
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value;
    let isValid = true;

    document.getElementById('emailError').style.display = 'none';
    document.getElementById('passError').style.display = 'none';

    if (!email) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }
    if (!password) {
        document.getElementById('passError').style.display = 'block';
        isValid = false;
    }
    if (!isValid) return;

    // جلب المستخدمين من localStorage (متوافق مع جدول Users)
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (users.length === 0) {
        // بيانات تجريبية متوافقة مع قاعدة البيانات
        users = [
            { user_id: 1, username: "admin", email: "admin@example.com", password_hash: "adminpass", role: "admin", full_name: "Admin User" },
            { user_id: 2, username: "tech1", email: "tech1@example.com", password_hash: "techpass", role: "technician", full_name: "Technician One" },
            { user_id: 3, username: "chaima", email: "chaima@example.com", password_hash: "123456", role: "student", full_name: "Chaima Zer" }
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }

    const user = users.find(u => u.email === email && u.password_hash === password);

    if (user) {
        sessionStorage.setItem('role', user.role);
        sessionStorage.setItem('userName', user.full_name);
        sessionStorage.setItem('userId', user.user_id);
        
        if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
        else if (user.role === 'technician') window.location.href = 'technician-dashboard.html';
        else window.location.href = 'user-dashboard.html';
    } else {
        alert('❌ Invalid email or password');
    }
}

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleLogin();
});

document.getElementById('email').addEventListener('input', function() {
    if (this.value.trim()) document.getElementById('emailError').style.display = 'none';
});

document.getElementById('password').addEventListener('input', function() {
    if (this.value) document.getElementById('passError').style.display = 'none';
});