// 个人展示页脚本
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    setupPageNavigation();
    setupTypewriter();
    setupParticles();
    setupMusic();
    setupSidebarAutoHide();
    await renderGallery();
    setupBouncingBalls();
    setupMessages();
});

// ==================== 页面导航 ====================
function setupPageNavigation() {
    var links = document.querySelectorAll('.sidebar-link[data-page]');
    links.forEach(function(link) {
        link.addEventListener('click', function() {
            navigateTo(this.getAttribute('data-page'));
        });
    });

    // 处理浏览器后退/前进
    window.addEventListener('hashchange', function() {
        var page = window.location.hash.replace('#', '') || 'home';
        showPage(page);
    });

    // 初始加载
    var initial = window.location.hash.replace('#', '') || 'home';
    showPage(initial);
}

function navigateTo(page) {
    window.location.hash = page;
}

function showPage(page) {
    // 更新侧边栏高亮
    document.querySelectorAll('.sidebar-link[data-page]').forEach(function(l) {
        l.classList.remove('active');
    });
    var activeLink = document.querySelector('.sidebar-link[data-page="' + page + '"]');
    if (activeLink) activeLink.classList.add('active');

    // 切换页面
    document.querySelectorAll('.page-section').forEach(function(s) {
        s.classList.remove('active');
    });
    var pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    // 相册入场动画
    if (page === 'gallery') {
        startGalleryIntro();
    }
}

function startGalleryIntro() {
    var galleryPage = document.getElementById('page-gallery');
    if (!galleryPage) return;

    var introShown = sessionStorage.getItem('gallery-intro-shown');
    if (introShown) return;

    galleryPage.classList.add('gallery-intro');
    sessionStorage.setItem('gallery-intro-shown', '1');

    setTimeout(function() {
        galleryPage.classList.add('gallery-ready');
    }, 1500);

    setTimeout(function() {
        galleryPage.classList.remove('gallery-intro', 'gallery-ready');
    }, 2500);
}

// ==================== 侧边栏自动隐藏/展开 ====================
function setupSidebarAutoHide() {
    var sidebar = document.getElementById('sidebar');
    var mainContent = document.getElementById('mainContent');
    if (!sidebar || !mainContent) return;

    var collapseTimer = null;
    var autoHideDelay = 3000;
    var rehideDelay = 300;
    var edgeThreshold = 15;
    var sidebarWidth = 220;
    var initialPeriod = true;
    var userInteracted = false;

    function collapse() {
        sidebar.classList.add('sidebar-collapsed');
        mainContent.classList.add('main-content-expanded');
    }

    function expand() {
        sidebar.classList.remove('sidebar-collapsed');
        mainContent.classList.remove('main-content-expanded');
    }

    function scheduleCollapse(delay) {
        clearTimeout(collapseTimer);
        collapseTimer = setTimeout(collapse, delay);
    }

    function cancelCollapse() {
        clearTimeout(collapseTimer);
    }

    // 首次进入：3秒后自动收起（仅当鼠标不在侧边栏上）
    setTimeout(function() {
        initialPeriod = false;
        var mouseX = lastMouseX;
        if (mouseX > sidebarWidth) {
            collapse();
        }
    }, autoHideDelay);

    var lastMouseX = 0;

    // 全局鼠标追踪
    document.addEventListener('mousemove', function(e) {
        lastMouseX = e.clientX;

        if (initialPeriod) return;

        var collapsed = sidebar.classList.contains('sidebar-collapsed');

        if (collapsed) {
            // 鼠标接近左边缘 → 展开
            if (e.clientX <= edgeThreshold) {
                expand();
            }
        } else {
            // 鼠标在侧边栏之外 → 延时收起
            if (e.clientX > sidebarWidth) {
                if (!collapseTimer) {
                    scheduleCollapse(rehideDelay);
                }
            }
        }
    });

    // 侧边栏 hover → 保持展开
    sidebar.addEventListener('mouseenter', function() {
        if (initialPeriod) return;
        cancelCollapse();
        expand();
    });

    sidebar.addEventListener('mouseleave', function() {
        if (initialPeriod) return;
        scheduleCollapse(rehideDelay);
    });

    // 侧边栏内点击导航 → 短暂保持展开后收起
    sidebar.addEventListener('click', function(e) {
        if (e.target.closest('.sidebar-link')) {
            userInteracted = true;
            cancelCollapse();
            scheduleCollapse(rehideDelay);
        }
    });
}

// ==================== 加载个人信息 ====================
async function loadProfile() {
    try {
        var res = await fetch('/api/profile');
        var result = await res.json();
        if (result.code === 200) {
            renderProfile(result.data);
        }
    } catch (err) {
        console.error('加载个人信息失败:', err);
    }
}

function renderProfile(profile) {
    var name = profile.name || '你的姓名';

    // 浏览器标题
    document.title = name !== '你的姓名' ? name + ' - 个人主页' : '个人主页';

    // 侧边栏
    document.getElementById('sidebarName').textContent = name;
    var sidebarAvatar = document.getElementById('sidebarAvatar');
    if (profile.avatar) {
        sidebarAvatar.innerHTML = '<img src="' + escapeHtml(profile.avatar) + '" alt="">';
    } else if (name !== '你的姓名') {
        document.getElementById('sidebarInitial').textContent = name.charAt(0);
    }

    // Hero
    document.getElementById('greetingText').textContent = profile.greeting || '你好，我是';
    document.getElementById('heroName').textContent = name;
    document.getElementById('heroTagline').textContent = profile.tagline || '';

    // 关于页
    document.getElementById('aboutNameLarge').textContent = name;
    document.getElementById('aboutTitleLarge').textContent = profile.title || '';
    document.getElementById('aboutBioLarge').textContent = profile.bio || '';

    if (profile.avatar) {
        document.getElementById('aboutAvatarLarge').innerHTML = '<img src="' + escapeHtml(profile.avatar) + '" alt="">';
    } else if (name !== '你的姓名') {
        document.getElementById('aboutAvatarInitial').textContent = name.charAt(0);
    }

    // 关于页 - 兴趣标签
    var interestsEl = document.getElementById('aboutInterests');
    if (interestsEl && profile.interests && profile.interests.length > 0) {
        interestsEl.innerHTML = profile.interests.map(function(t) {
            return '<span class="interest-tag">' + escapeHtml(t) + '</span>';
        }).join('');
    }

    // 关于页 - 数据统计
    var statsEl = document.getElementById('aboutStats');
    if (statsEl && profile.stats && profile.stats.length > 0) {
        statsEl.innerHTML = profile.stats.map(function(s) {
            return '<div class="stat-card"><span class="stat-value">' + escapeHtml(s.value) + '</span><span class="stat-label">' + escapeHtml(s.label) + '</span></div>';
        }).join('');
    }

    // 关于页 - 技能列表
    var skillsEl = document.getElementById('skillsList');
    if (skillsEl && profile.skills && profile.skills.length > 0) {
        skillsEl.innerHTML = profile.skills.map(function(s) {
            return '<div class="skill-item"><div class="skill-info"><span>' + escapeHtml(s.name) + '</span><span>' + (s.level || 0) + '%</span></div><div class="skill-bar"><div class="skill-fill" style="width:' + (s.level || 0) + '%"></div></div></div>';
        }).join('');
    }

    // 关于页 - 时间线
    var timelineEl = document.getElementById('timeline');
    if (timelineEl && profile.timeline && profile.timeline.length > 0) {
        timelineEl.innerHTML = profile.timeline.map(function(t) {
            return '<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><span class="timeline-period">' + escapeHtml(t.period) + '</span><h4>' + escapeHtml(t.title) + '</h4><p>' + escapeHtml(t.description) + '</p></div></div>';
        }).join('');
    }

    // 联系方式
    renderContactGrid(profile);
}

function renderContactGrid(profile) {
    var grid = document.getElementById('contactGrid');
    var items = [];

    if (profile.email) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
            label: '邮箱',
            value: profile.email,
            href: 'mailto:' + profile.email
        });
    }
    if (profile.phone) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
            label: '电话',
            value: profile.phone,
            href: 'tel:' + profile.phone
        });
    }
    if (profile.github) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
            label: 'GitHub',
            value: profile.github,
            href: profile.github
        });
    }
    if (profile.website) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
            label: '网站',
            value: profile.website,
            href: profile.website
        });
    }
    if (profile.location) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            label: '所在地',
            value: profile.location,
            href: null
        });
    }
    if (profile.linkedin) {
        items.push({
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
            label: 'LinkedIn',
            value: profile.linkedin,
            href: profile.linkedin
        });
    }

    if (items.length === 0) {
        grid.innerHTML = '<div style="text-align:center;color:rgba(200,200,220,0.4);grid-column:1/-1;padding:2rem;">暂无联系方式</div>';
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

// ==================== 打字机效果 ====================
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
            setTimeout(function() {
                if (cursorEl) cursorEl.style.display = 'none';
            }, 2000);
        }
    }

    setTimeout(type, 300);
}

// ==================== 粒子连线网络 ====================
function setupParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 130;
    var CONNECT_DIST = 150;
    var MOUSE_REPEL = 110;

    var mouse = { x: -9999, y: -9999 };
    var time = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 初始化粒子
    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2.5 + 1,
            phase: Math.random() * Math.PI * 2,
            freq: 0.25 + Math.random() * 0.35,
            amp: 0.12 + Math.random() * 0.28
        });
    }

    document.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function() {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.005;

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // 正弦波飘动 - 每个粒子有独立频率
            var driftX = Math.sin(time * p.freq + p.phase) * p.amp;
            var driftY = Math.cos(time * p.freq * 1.3 + p.phase) * p.amp;

            // 移动
            p.x += p.vx + driftX;
            p.y += p.vy + driftY;

            // 边界反弹
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            p.x = Math.max(0, Math.min(canvas.width, p.x));
            p.y = Math.max(0, Math.min(canvas.height, p.y));

            // 鼠标驱散
            var dx = p.x - mouse.x;
            var dy = p.y - mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_REPEL && dist > 0) {
                var force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
                p.vx += (dx / dist) * force * 2;
                p.vy += (dy / dist) * force * 2;
            }

            // 速度衰减
            p.vx *= 0.995;
            p.vy *= 0.995;

            // 绘制粒子
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(150, 160, 220, 0.55)';
            ctx.fill();
        }

        // 连线
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var a = particles[i];
                var b = particles[j];
                var dx = a.x - b.x;
                var dy = a.y - b.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    var opacity = (1 - dist / CONNECT_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = 'rgba(150, 160, 220, ' + opacity + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ==================== 背景音乐 ====================
function setupMusic() {
    var playlist = [
        { title: 'TAVOS - 涧', src: '/static/audio/jian.mp3' },
        { title: 'Toby Fox - His Theme', src: '/static/audio/his-theme.mp3' }
    ];

    var currentTrack = 0;
    var audio = new Audio(playlist[currentTrack].src);
    audio.loop = true;
    audio.volume = 0.35;

    var btn = document.getElementById('musicBtn');
    var playIcon = btn.querySelector('.music-icon-play');
    var pauseIcon = btn.querySelector('.music-icon-pause');
    var playing = false;

    // 更新按钮状态
    function setPlaying(state) {
        playing = state;
        if (state) {
            btn.classList.add('playing');
            playIcon.style.display = 'none';
            pauseIcon.style.display = '';
        } else {
            btn.classList.remove('playing');
            playIcon.style.display = '';
            pauseIcon.style.display = 'none';
        }
    }

    // 切换曲目
    function switchTrack(index) {
        if (index === currentTrack) return;
        var wasPlaying = playing;
        audio.pause();
        currentTrack = index;
        audio.src = playlist[currentTrack].src;
        audio.loop = true;
        audio.volume = 0.35;

        // 更新轮盘高亮
        document.querySelectorAll('.music-wheel-item').forEach(function(item, i) {
            item.classList.toggle('active', i === currentTrack);
        });

        if (wasPlaying) {
            audio.play().then(function() {
                setPlaying(true);
            }).catch(function() {
                setPlaying(false);
            });
        }
    }

    // 播放/暂停
    btn.addEventListener('click', function() {
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(function() {
                setPlaying(true);
            }).catch(function() {});
        }
    });

    // 轮盘点击切换
    document.querySelectorAll('.music-wheel-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            var trackIndex = parseInt(this.getAttribute('data-track'));
            if (trackIndex === currentTrack && playing) return; // 同一首歌且正在播放
            if (trackIndex === currentTrack && !playing) {
                // 同一首歌但暂停中，恢复播放
                audio.play().then(function() {
                    setPlaying(true);
                }).catch(function() {});
                return;
            }
            switchTrack(trackIndex);
            // 切换后自动播放
            audio.play().then(function() {
                setPlaying(true);
            }).catch(function() {});
        });
    });

    // 初始高亮
    document.querySelectorAll('.music-wheel-item').forEach(function(item, i) {
        item.classList.toggle('active', i === currentTrack);
    });

    // 首次用户交互后自动播放
    var autoplayTried = false;
    function tryAutoplay() {
        if (autoplayTried || playing) return;
        autoplayTried = true;
        audio.play().then(function() {
            setPlaying(true);
        }).catch(function() {
            autoplayTried = false;
        });
    }
    ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function(evt) {
        document.addEventListener(evt, tryAutoplay, { once: true });
    });
}

// ==================== 相册 - 水平滚动 ====================
async function renderGallery() {
    var strip = document.getElementById('galleryStrip');
    var wrapper = document.getElementById('galleryStripWrapper');
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');

    if (!strip || !wrapper) return;

    strip.innerHTML = '<div style="text-align:center;color:rgba(200,200,220,0.4);padding:2rem;">加载中...</div>';

    var imageFiles = [];
    try {
        var res = await fetch('/api/images');
        var result = await res.json();
        if (result.code === 200 && result.imageList) {
            imageFiles = result.imageList.map(function(item) { return item.imageName; });
        }
    } catch (err) {
        console.error('加载图片列表失败:', err);
    }

    if (imageFiles.length === 0) {
        strip.innerHTML = '<div style="text-align:center;color:rgba(200,200,220,0.4);padding:2rem;">暂无图片</div>';
        return;
    }

    shuffleArray(imageFiles);

    // 渲染图片（复制两份实现无缝循环）
    var itemsHtml = '';
    for (var r = 0; r < 2; r++) {
        for (var i = 0; i < imageFiles.length; i++) {
            var thumbSrc = '/api/images/thumb/' + imageFiles[i];
            var origSrc = '/api/images/' + imageFiles[i];
            itemsHtml += '<div class="gallery-item" data-src="' + origSrc + '" data-thumb="' + thumbSrc + '" data-index="' + i + '">' +
                '<img src="' + thumbSrc + '" alt="相册图片 ' + (i + 1) + '">' +
            '</div>';
        }
    }
    strip.innerHTML = itemsHtml;

    // 淡入动画
    var imgs = strip.querySelectorAll('img');
    imgs.forEach(function(img) {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('loaded');
            });
            img.addEventListener('error', function() {
                img.classList.add('loaded');
            });
        }
    });

    // 自动滚动与拖拽
    var scrollPos = 0;
    var autoSpeed = 0.5;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    var autoPaused = false;
    var pauseTimer = null;

    function pauseAuto() {
        autoPaused = true;
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(function() { autoPaused = false; }, 2000);
    }

    // 鼠标拖拽 - 扩大响应区域到整个 wrapper + page-inner
    wrapper.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartScroll = scrollPos;
        wrapper.classList.add('dragging');
        pauseAuto();
        e.preventDefault();
    });

    // 同时在相册页面上方和下方空白区域也能拖拽
    var galleryPage = document.getElementById('page-gallery');
    if (galleryPage) {
        galleryPage.addEventListener('mousedown', function(e) {
            // 排除灯箱和按钮
            if (e.target.closest('.lightbox-close') || e.target.closest('#lightbox')) return;
            isDragging = true;
            dragStartX = e.clientX;
            dragStartScroll = scrollPos;
            wrapper.classList.add('dragging');
            pauseAuto();
        });
    }

    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - dragStartX;
        scrollPos = dragStartScroll - dx;
        // 循环边界
        var singleWidth = strip.scrollWidth / 2;
        while (scrollPos < 0) scrollPos += singleWidth;
        while (scrollPos >= singleWidth) scrollPos -= singleWidth;
        strip.style.transform = 'translateX(' + (-scrollPos) + 'px)';
    });

    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            wrapper.classList.remove('dragging');
            dragStartScroll = scrollPos;
        }
    });

    // 触摸拖拽 - 扩大响应区域
    wrapper.addEventListener('touchstart', function(e) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartScroll = scrollPos;
        pauseAuto();
    });

    if (galleryPage) {
        galleryPage.addEventListener('touchstart', function(e) {
            if (e.target.closest('.lightbox-close') || e.target.closest('#lightbox')) return;
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartScroll = scrollPos;
            pauseAuto();
        });
    }

    window.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var dx = e.touches[0].clientX - dragStartX;
        scrollPos = dragStartScroll - dx;
        var singleWidth = strip.scrollWidth / 2;
        while (scrollPos < 0) scrollPos += singleWidth;
        while (scrollPos >= singleWidth) scrollPos -= singleWidth;
        strip.style.transform = 'translateX(' + (-scrollPos) + 'px)';
    });

    window.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            dragStartScroll = scrollPos;
        }
    });

    // 灯箱点击
    strip.addEventListener('click', function(e) {
        var item = e.target.closest('.gallery-item');
        if (!item) return;
        // 如果刚拖拽完，忽略点击
        if (Math.abs(scrollPos - dragStartScroll) > 5) return;
        var origSrc = item.getAttribute('data-src');
        var thumbSrc = item.getAttribute('data-thumb');
        lightboxImg.src = thumbSrc;
        lightboxImg.alt = '相册图片';
        lightbox.classList.add('show');
        // 后台加载原图，就绪后硬切
        var fullImg = new Image();
        fullImg.onload = function() {
            lightboxImg.src = origSrc;
        };
        fullImg.src = origSrc;
    });

    lightboxClose.addEventListener('click', function() {
        lightbox.classList.remove('show');
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) lightbox.classList.remove('show');
    });

    // 键盘关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') lightbox.classList.remove('show');
    });

    // 主循环
    function autoScroll() {
        if (!autoPaused && !isDragging) {
            scrollPos += autoSpeed;
            var singleWidth = strip.scrollWidth / 2;
            if (scrollPos >= singleWidth) scrollPos -= singleWidth;
            strip.style.transform = 'translateX(' + (-scrollPos) + 'px)';
        }
        requestAnimationFrame(autoScroll);
    }

    requestAnimationFrame(autoScroll);
}

// ==================== 弹球物理引擎 ====================
function setupBouncingBalls() {
    var canvas = document.getElementById('ballCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var balls = [];
    var ballImg = new Image();
    ballImg.src = '/static/img/my.jpg';

    var GRAVITY = 600;
    var RESTITUTION = 0.6;
    var RADIUS = 20;
    var FADE_DURATION = 5000;

    var lastTime = performance.now();

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('click', function(e) {
        if (isInteractive(e.target)) return;
        spawnBall(e.clientX, e.clientY);
    });

    function isInteractive(el) {
        var interactiveTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'NAV', 'LABEL', 'ASIDE'];
        while (el && el !== document.body) {
            if (interactiveTags.indexOf(el.tagName) !== -1) return true;
            if (el.getAttribute('role') === 'button') return true;
            if (el.classList && el.classList.contains('sidebar-link')) return true;
            if (el.classList && el.classList.contains('sidebar')) return true;
            if (el.classList && el.classList.contains('music-btn')) return true;
            if (el.classList && el.classList.contains('gallery-item')) return true;
            if (el.onclick && el.tagName !== 'svg' && el.tagName !== 'path') return true;
            el = el.parentElement;
        }
        return false;
    }

    function spawnBall(x, y) {
        x = Math.max(RADIUS, Math.min(canvas.width - RADIUS, x));
        y = Math.max(RADIUS, Math.min(canvas.height - RADIUS, y));
        balls.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 300,
            vy: -200 - Math.random() * 200,
            radius: RADIUS,
            born: performance.now()
        });
    }

    function update(dt) {
        dt = Math.min(dt, 0.05);
        var now = performance.now();

        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            b.vy += GRAVITY * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (b.x - b.radius < 0) { b.x = b.radius; b.vx = Math.abs(b.vx) * RESTITUTION; }
            if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx = -Math.abs(b.vx) * RESTITUTION; }
            if (b.y - b.radius < 0) { b.y = b.radius; b.vy = Math.abs(b.vy) * RESTITUTION; }
            if (b.y + b.radius > canvas.height) { b.y = canvas.height - b.radius; b.vy = -Math.abs(b.vy) * RESTITUTION; }
        }

        for (var i = 0; i < balls.length; i++) {
            for (var j = i + 1; j < balls.length; j++) {
                var a = balls[i], b = balls[j];
                var dx = b.x - a.x, dy = b.y - a.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var minDist = a.radius + b.radius;

                if (dist < minDist && dist > 0) {
                    var overlap = minDist - dist;
                    var nx = dx / dist, ny = dy / dist;
                    a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
                    b.x += nx * overlap / 2; b.y += ny * overlap / 2;

                    var dvx = a.vx - b.vx, dvy = a.vy - b.vy;
                    var dvDotN = dvx * nx + dvy * ny;
                    if (dvDotN > 0) {
                        a.vx -= dvDotN * nx; a.vy -= dvDotN * ny;
                        b.vx += dvDotN * nx; b.vy += dvDotN * ny;
                    }
                }
            }
        }

        balls = balls.filter(function(b) { return (now - b.born) < FADE_DURATION; });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var now = performance.now();

        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            var elapsed = now - b.born;
            var opacity = Math.max(0, 1 - elapsed / FADE_DURATION);

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            if (ballImg.complete && ballImg.naturalWidth > 0) {
                var size = b.radius * 2;
                ctx.drawImage(ballImg, b.x - b.radius, b.y - b.radius, size, size);
            } else {
                ctx.fillStyle = '#4F46E5';
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function loop(timestamp) {
        var dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        update(dt);
        render();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

// ==================== 留言板 ====================
function setupMessages() {
    var form = document.getElementById('messageForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        var nameEl = document.getElementById('msgName');
        var contentEl = document.getElementById('msgContent');
        var name = nameEl.value.trim();
        var content = contentEl.value.trim();

        if (!name || !content) return;

        var btn = form.querySelector('button');
        btn.disabled = true;
        btn.textContent = '发布中...';

        try {
            var res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, content: content })
            });
            var result = await res.json();
            if (result.code === 200) {
                nameEl.value = '';
                contentEl.value = '';
                await loadMessages();
            } else {
                alert(result.message || '留言失败');
            }
        } catch (err) {
            console.error('留言失败:', err);
            alert('留言失败，请稍后重试');
        } finally {
            btn.disabled = false;
            btn.textContent = '发布留言';
        }
    });

    loadMessages();
    setupLikeButtons();
}

async function loadMessages() {
    var list = document.getElementById('messageList');
    if (!list) return;

    try {
        var res = await fetch('/api/messages');
        var result = await res.json();
        if (result.code === 200 && result.data) {
            renderMessages(result.data, list);
        }
    } catch (err) {
        console.error('加载留言失败:', err);
        list.innerHTML = '<div style="text-align:center;color:rgba(200,200,220,0.4);padding:2rem;">加载留言失败</div>';
    }
}

function renderMessages(messages, list) {
    if (!messages || messages.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:rgba(200,200,220,0.4);padding:2rem;">还没有留言，快来写第一条吧</div>';
        return;
    }

    list.innerHTML = messages.map(function(msg) {
        return '<div class="message-item" data-id="' + msg.id + '">' +
            '<div class="message-meta">' +
                '<span class="message-name">' + escapeHtml(msg.name) + '</span>' +
                '<div style="display:flex;align-items:center;gap:1rem;">' +
                    '<span class="message-time">' + escapeHtml(msg.timestamp) + '</span>' +
                    '<button class="message-like" data-id="' + msg.id + '">' +
                        '<svg class="like-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
                        '<span class="like-count">' + (msg.likes || 0) + '</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<p class="message-content">' + escapeHtml(msg.content) + '</p>' +
        '</div>';
    }).join('');
}

// ==================== 点赞特效 ====================
function setupLikeButtons() {
    var messageList = document.getElementById('messageList');
    if (!messageList) return;

    messageList.addEventListener('click', function(e) {
        var btn = e.target.closest('.message-like');
        if (!btn) return;

        var id = btn.getAttribute('data-id');
        var likeCountEl = btn.querySelector('.like-count');
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        // 按钮弹性动画
        btn.classList.remove('liked');
        void btn.offsetWidth;
        btn.classList.add('liked');

        // 粒子爆炸
        spawnLikeParticles(cx, cy);

        // 发送点赞请求
        fetch('/api/messages/' + encodeURIComponent(id) + '/like', { method: 'POST' })
            .then(function(res) { return res.json(); })
            .then(function(result) {
                if (result.code === 200 && result.data) {
                    if (likeCountEl) likeCountEl.textContent = result.data.likes;
                }
            })
            .catch(function(err) { console.error('点赞失败:', err); });
    });
}

function spawnLikeParticles(cx, cy) {
    var colors = ['#f87171', '#fb923c', '#fbbf24', '#a78bfa', '#818cf8', '#f472b6'];
    var count = 12;

    for (var i = 0; i < count; i++) {
        var particle = document.createElement('div');
        var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        var distance = 30 + Math.random() * 45;
        var dx = Math.cos(angle) * distance;
        var dy = Math.sin(angle) * distance;
        var size = 4 + Math.random() * 6;
        var color = colors[Math.floor(Math.random() * colors.length)];

        particle.className = 'like-particle';
        particle.style.cssText =
            'left:' + cx + 'px;' +
            'top:' + cy + 'px;' +
            'width:' + size + 'px;' +
            'height:' + size + 'px;' +
            'background:' + color + ';' +
            '--dx:' + dx + 'px;' +
            '--dy:' + dy + 'px;';

        document.body.appendChild(particle);

        setTimeout(function() {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 750);
    }
}

// ==================== 工具函数 ====================
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}
