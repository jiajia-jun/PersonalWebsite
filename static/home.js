// 个人展示页脚本

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    setupTypewriter();
    setupScrollObserver();
    setupNavbar();
    setupSmoothScroll();
});

// 加载个人信息
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        const result = await res.json();
        if (result.code === 200) {
            renderProfile(result.data);
        }
    } catch (err) {
        console.error('加载个人信息失败:', err);
    }
}

// 渲染个人信息到页面
function renderProfile(profile) {
    // 导航栏品牌
    const navBrand = document.getElementById('navBrand');
    if (profile.name && profile.name !== '你的姓名') {
        navBrand.textContent = profile.name;
    }
    document.title = profile.name && profile.name !== '你的姓名' ? profile.name + ' - 个人主页' : '个人主页';

    // Hero
    document.getElementById('greetingText').textContent = profile.greeting || '你好，我是';
    document.getElementById('heroName').textContent = profile.name || '你的姓名';
    document.getElementById('heroTagline').textContent = profile.tagline || '';

    // 关于我
    document.getElementById('aboutName').textContent = profile.name || '你的姓名';
    document.getElementById('aboutTitle').textContent = profile.title || '';
    document.getElementById('aboutBio').textContent = profile.bio || '';

    // 头像
    const avatar = document.getElementById('aboutAvatar');
    const avatarInitial = document.getElementById('avatarInitial');
    if (profile.avatar) {
        avatar.innerHTML = '<img src="' + escapeHtml(profile.avatar) + '" alt="头像">';
    } else if (profile.name) {
        avatarInitial.textContent = profile.name.charAt(0);
    }

    // 联系方式
    renderContactGrid(profile);

    // 标签 - 使用 about-tags 容器
    const tagsContainer = document.getElementById('aboutTags');
    if (profile.title && profile.title !== '你的职位/头衔') {
        // 保留现有的标签样式
    }
}

// 渲染联系方式网格
function renderContactGrid(profile) {
    const grid = document.getElementById('contactGrid');
    const items = [];

    if (profile.email) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
            label: '邮箱',
            value: profile.email,
            href: 'mailto:' + profile.email
        });
    }
    if (profile.phone) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
            label: '电话',
            value: profile.phone,
            href: 'tel:' + profile.phone
        });
    }
    if (profile.github) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
            label: 'GitHub',
            value: profile.github,
            href: profile.github
        });
    }
    if (profile.website) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
            label: '网站',
            value: profile.website,
            href: profile.website
        });
    }
    if (profile.location) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            label: '所在地',
            value: profile.location,
            href: null
        });
    }
    if (profile.linkedin) {
        items.push({
            icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
            label: 'LinkedIn',
            value: profile.linkedin,
            href: profile.linkedin
        });
    }

    if (items.length === 0) {
        grid.innerHTML = '<div style="text-align:center;color:var(--docsy-text-muted);grid-column:1/-1;padding:2rem;">暂无联系方式</div>';
        return;
    }

    grid.innerHTML = items.map(function(item) {
        var inner = '<div class="contact-icon">' + item.icon + '</div>' +
                    '<h3>' + escapeHtml(item.label) + '</h3>' +
                    '<p>' + escapeHtml(item.value) + '</p>';
        if (item.href) {
            return '<a href="' + escapeHtml(item.href) + '" class="contact-card" target="_blank" rel="noopener">' + inner + '</a>';
        }
        return '<div class="contact-card">' + inner + '</div>';
    }).join('');
}

// 打字机效果
function setupTypewriter() {
    var greetingEl = document.getElementById('greetingText');
    var cursorEl = document.querySelector('.typewriter-cursor');
    var text = greetingEl.textContent;
    greetingEl.textContent = '';
    var i = 0;

    function type() {
        if (i < text.length) {
            greetingEl.textContent += text.charAt(i);
            i++;
            setTimeout(type, 80);
        } else {
            // 打字完成后，2秒后隐藏光标
            setTimeout(function() {
                if (cursorEl) cursorEl.style.display = 'none';
            }, 2000);
        }
    }

    setTimeout(type, 300);
}

// 滚动动画观察器
function setupScrollObserver() {
    var sections = document.querySelectorAll('.section-hidden');
    if (!('IntersectionObserver' in window)) {
        sections.forEach(function(s) { s.classList.add('section-visible'); });
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(function(s) { observer.observe(s); });
}

// 导航栏滚动状态
function setupNavbar() {
    var navbar = document.getElementById('navbar');
    var navLinks = document.querySelectorAll('.nav-link[data-section]');
    var sections = {};
    navLinks.forEach(function(link) {
        var id = link.getAttribute('data-section');
        sections[id] = document.getElementById(id);
    });

    window.addEventListener('scroll', function() {
        // 导航栏样式切换
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 激活状态
        var scrollPos = window.scrollY + 120;
        for (var id in sections) {
            var section = sections[id];
            if (section && section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
                navLinks.forEach(function(l) { l.classList.remove('active'); });
                var activeLink = document.querySelector('.nav-link[data-section="' + id + '"]');
                if (activeLink) activeLink.classList.add('active');
                break;
            }
        }
    });
}

// 平滑滚动
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// 工具函数
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
