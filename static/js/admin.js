// 后台管理脚本

var currentProfile = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('showPasswordPanel').addEventListener('click', togglePasswordPanel);
    document.getElementById('updatePasswordBtn').addEventListener('click', handlePasswordChange);

    // 编辑器
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('cancelEditBtn').addEventListener('click', loadCurrentProfile);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('editorUpdatePasswordBtn').addEventListener('click', handleEditorPasswordChange);

    // 检查是否已登录
    checkAuth();
}

// === 认证 ===

async function checkAuth() {
    var token = localStorage.getItem('token');
    if (!token) {
        showLoginView();
        return;
    }

    try {
        var res = await fetch('/api/admin/check', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await res.json();
        if (data.code === 200) {
            showEditorView(data.username);
        } else {
            localStorage.removeItem('token');
            showLoginView('登录已过期，请重新登录');
        }
    } catch (err) {
        showLoginView('无法连接到服务器');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('loginMessage', '请输入用户名和密码', 'error');
        return;
    }

    try {
        var res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        var data = await res.json();
        if (data.code === 200 && data.token) {
            localStorage.setItem('token', data.token);
            showEditorView(username);
        } else {
            showMessage('loginMessage', data.message || '登录失败', 'error');
        }
    } catch (err) {
        showMessage('loginMessage', '无法连接到服务器', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    showLoginView();
}

// === 视图切换 ===

function showLoginView(msg) {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('editorView').classList.add('hidden');
    if (msg) {
        showMessage('loginMessage', msg, 'error');
    }
}

function showEditorView(username) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('editorView').classList.remove('hidden');
    document.getElementById('adminUsername').textContent = '管理员：' + escapeHtml(username);
    loadCurrentProfile();
}

// === 个人信息 ===

async function loadCurrentProfile() {
    try {
        var res = await fetch('/api/profile');
        var data = await res.json();
        if (data.code === 200) {
            currentProfile = data.data;
            populateForm(data.data);
            showMessage('editorMessage', '', '');
        }
    } catch (err) {
        showMessage('editorMessage', '加载个人信息失败', 'error');
    }
}

function populateForm(p) {
    document.getElementById('eName').value = p.name || '';
    document.getElementById('eTitle').value = p.title || '';
    document.getElementById('eGreeting').value = p.greeting || '';
    document.getElementById('eTagline').value = p.tagline || '';
    document.getElementById('eBio').value = p.bio || '';
    document.getElementById('eAvatar').value = p.avatar || '';
    document.getElementById('eEmail').value = p.email || '';
    document.getElementById('ePhone').value = p.phone || '';
    document.getElementById('eLocation').value = p.location || '';
    document.getElementById('eGithub').value = p.github || '';
    document.getElementById('eLinkedin').value = p.linkedin || '';
    document.getElementById('eWebsite').value = p.website || '';

    document.getElementById('eSkills').value = (p.skills || []).map(function(s) {
        return s.name + '|' + (s.level || 0);
    }).join('\n');

    document.getElementById('eTimeline').value = (p.timeline || []).map(function(t) {
        return t.period + '|' + t.title + '|' + (t.description || '');
    }).join('\n');
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    var skillsRaw = document.getElementById('eSkills').value.trim();
    var skills = skillsRaw ? skillsRaw.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
        var parts = line.split('|');
        return { name: (parts[0] || '').trim(), level: parseInt(parts[1]) || 0 };
    }) : [];

    var timelineRaw = document.getElementById('eTimeline').value.trim();
    var timeline = timelineRaw ? timelineRaw.split('\n').filter(function(l) { return l.trim(); }).map(function(line) {
        var parts = line.split('|');
        return { period: (parts[0] || '').trim(), title: (parts[1] || '').trim(), description: (parts[2] || '').trim() };
    }) : [];

    var profile = {
        name: document.getElementById('eName').value.trim(),
        title: document.getElementById('eTitle').value.trim(),
        greeting: document.getElementById('eGreeting').value.trim(),
        tagline: document.getElementById('eTagline').value.trim(),
        bio: document.getElementById('eBio').value.trim(),
        avatar: document.getElementById('eAvatar').value.trim(),
        email: document.getElementById('eEmail').value.trim(),
        phone: document.getElementById('ePhone').value.trim(),
        location: document.getElementById('eLocation').value.trim(),
        github: document.getElementById('eGithub').value.trim(),
        linkedin: document.getElementById('eLinkedin').value.trim(),
        website: document.getElementById('eWebsite').value.trim(),
        skills: skills,
        timeline: timeline
    };

    var token = localStorage.getItem('token');
    try {
        var res = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(profile)
        });
        var data = await res.json();
        if (data.code === 200) {
            currentProfile = profile;
            showMessage('editorMessage', '个人信息已保存', 'success');
        } else if (data.code === 401) {
            localStorage.removeItem('token');
            showLoginView('登录已过期，请重新登录');
        } else {
            showMessage('editorMessage', data.message || '保存失败', 'error');
        }
    } catch (err) {
        showMessage('editorMessage', '无法连接到服务器', 'error');
    }
}

// === 密码修改 ===

function togglePasswordPanel() {
    var panel = document.getElementById('passwordPanel');
    panel.classList.toggle('hidden');
}

async function handlePasswordChange() {
    var username = document.getElementById('pwdUsername').value.trim();
    var oldPwd = document.getElementById('pwdOldPassword').value;
    var newPwd = document.getElementById('pwdNewPassword').value;

    if (!username || !oldPwd || !newPwd) {
        showMessage('passwordMessage', '请填写所有字段', 'error');
        return;
    }

    if (newPwd.length < 8) {
        showMessage('passwordMessage', '新密码至少8位', 'error');
        return;
    }

    try {
        var res = await fetch('/api/updatepassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                old_password: oldPwd,
                new_password: newPwd
            })
        });
        var data = await res.json();
        if (data.code === 200) {
            showMessage('passwordMessage', '密码修改成功', 'success');
            document.getElementById('pwdOldPassword').value = '';
            document.getElementById('pwdNewPassword').value = '';
        } else {
            showMessage('passwordMessage', data.message || '密码修改失败', 'error');
        }
    } catch (err) {
        showMessage('passwordMessage', '无法连接到服务器', 'error');
    }
}

async function handleEditorPasswordChange() {
    var username = document.getElementById('ePwdUsername').value.trim();
    var oldPwd = document.getElementById('ePwdOld').value;
    var newPwd = document.getElementById('ePwdNew').value;

    if (!username || !oldPwd || !newPwd) {
        showMessage('editorPasswordMessage', '请填写所有字段', 'error');
        return;
    }

    if (newPwd.length < 8) {
        showMessage('editorPasswordMessage', '新密码至少8位', 'error');
        return;
    }

    try {
        var res = await fetch('/api/updatepassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                old_password: oldPwd,
                new_password: newPwd
            })
        });
        var data = await res.json();
        if (data.code === 200) {
            showMessage('editorPasswordMessage', '密码修改成功', 'success');
            document.getElementById('ePwdOld').value = '';
            document.getElementById('ePwdNew').value = '';
        } else {
            showMessage('editorPasswordMessage', data.message || '密码修改失败', 'error');
        }
    } catch (err) {
        showMessage('editorPasswordMessage', '无法连接到服务器', 'error');
    }
}

// === 工具函数 ===

function showMessage(id, msg, type) {
    var el = document.getElementById(id);
    el.textContent = msg;
    el.className = 'message';
    if (type) el.classList.add(type);
}

function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
