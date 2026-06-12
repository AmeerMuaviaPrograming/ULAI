/* =============================================
   UNIVERSITY OF LAYYAH AI ASSISTANT
   Chat Logic — chat.js
   ============================================= */
(function () {
    'use strict';
    // ──────────────────── DOM Elements ────────────────────
    const chatFab        = document.getElementById('chat-fab');
    const chatWindow     = document.getElementById('chat-window');
    const chatBody       = document.getElementById('chat-body');
    const chatMessages   = document.getElementById('chat-messages');
    const chatInput      = document.getElementById('chat-input');
    const chatSendBtn    = document.getElementById('chat-send-btn');
    const chatStatus     = document.getElementById('chat-status');
    const btnMinimize    = document.getElementById('btn-minimize-chat');
    const btnClear       = document.getElementById('btn-clear-chat');
    const quickReplies   = document.querySelectorAll('.quick-btn');
    const fabNotification = document.getElementById('fab-notification');
    const navChatBtn     = document.getElementById('btn-chat-nav');
    const heroStartChat  = document.getElementById('hero-start-chat');
    const featureAskBtns = document.querySelectorAll('.feature-ask');
    const navbar         = document.getElementById('navbar');
    const navMenuToggle  = document.getElementById('nav-menu-toggle');
    const navLinks       = document.getElementById('nav-links');
    const navLinkItems   = document.querySelectorAll('.nav-link');
    const particlesContainer = document.getElementById('particles-container');
    // ──────────────────── State ────────────────────
    let isOpen = false;
    let isTyping = false;
    let messageHistory = [];
    // ──────────────────── API Configuration ────────────────────
    const API_URL = '/chat';
    // ──────────────────── Initialize ────────────────────
    function init() {
        initLucide();
        bindEvents();
        createParticles();
        initScrollAnimations();
        initNavbarScroll();
        initStatCounters();
        initCardGlowEffect();
    }
    function initLucide() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    // ──────────────────── Event Bindings ────────────────────
    function bindEvents() {
        // Chat widget toggle
        chatFab.addEventListener('click', toggleChat);
        btnMinimize.addEventListener('click', toggleChat);
        navChatBtn.addEventListener('click', openChat);
        heroStartChat.addEventListener('click', openChat);
        // Send message
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', handleInputKeydown);
        chatInput.addEventListener('input', handleInputChange);
        // Quick replies
        quickReplies.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (query) sendQueryMessage(query);
            });
        });
        // Feature "Ask about this" buttons
        featureAskBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (query) {
                    openChat();
                    setTimeout(() => sendQueryMessage(query), 400);
                }
            });
        });
        // Clear chat
        btnClear.addEventListener('click', clearChat);
        // Mobile nav toggle
        navMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
        // Nav link clicks
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinkItems.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                navLinks.classList.remove('open');
            });
        });
        // Auto-resize textarea
        chatInput.addEventListener('input', autoResizeTextarea);
    }
    // ──────────────────── Chat Widget Toggle ────────────────────
    function toggleChat() {
        isOpen = !isOpen;
        chatFab.classList.toggle('active', isOpen);
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen) {
            fabNotification.classList.add('hidden');
            setTimeout(() => chatInput.focus(), 400);
        }
    }
    function openChat() {
        if (!isOpen) toggleChat();
    }
    // ──────────────────── Message Handling ────────────────────
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isTyping) return;
        appendMessage('user', text);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatSendBtn.disabled = true;
        showTypingIndicator();
        fetchBotResponse(text);
    }
    function sendQueryMessage(query) {
        if (isTyping) return;
        appendMessage('user', query);
        showTypingIndicator();
        fetchBotResponse(query);
    }
    function handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    function handleInputChange() {
        chatSendBtn.disabled = !chatInput.value.trim();
    }
    function autoResizeTextarea() {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    }
    // ──────────────────── Render Messages ────────────────────
    function appendMessage(role, text) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        if (role === 'bot') {
            msgDiv.innerHTML = `
                <div class="msg-avatar">
                    <i data-lucide="bot"></i>
                </div>
                <div class="msg-content">
                    <div class="msg-bubble">${escapeHTML(text)}</div>
                    <span class="msg-time">${timeStr}</span>
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="msg-content">
                    <div class="msg-bubble">${escapeHTML(text)}</div>
                    <span class="msg-time">${timeStr}</span>
                </div>
            `;
        }
        chatMessages.appendChild(msgDiv);
        initLucide();
        scrollToBottom();
        messageHistory.push({ role, text, time: timeStr });
    }
    function showTypingIndicator() {
        isTyping = true;
        chatStatus.textContent = 'Typing...';
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="msg-avatar">
                <i data-lucide="bot"></i>
            </div>
            <div class="typing-bubble">
                <span></span><span></span><span></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        initLucide();
        scrollToBottom();
    }
    function removeTypingIndicator() {
        isTyping = false;
        chatStatus.textContent = 'Online — Ready to help';
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }
    function scrollToBottom() {
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    }
    function clearChat() {
        chatMessages.innerHTML = '';
        messageHistory = [];
        // Show welcome again
        const welcome = document.getElementById('chat-welcome');
        if (welcome) welcome.style.display = 'block';
    }
    // ──────────────────── API Communication ────────────────────
    async function fetchBotResponse(userMessage) {
        // Hide welcome on first message
        const welcome = document.getElementById('chat-welcome');
        if (welcome) welcome.style.display = 'none';
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            removeTypingIndicator();
            const botReply = data.response || data.answer || data.reply || 'Sorry, I could not understand the response.';
            appendMessage('bot', botReply);
        } catch (error) {
            console.error('Chat API Error:', error);
            removeTypingIndicator();
            // Fallback demo response for prototype
            const fallbackResponses = {
                'admission': 'University of Layyah mein admission ke liye aapko online portal par apply karna hoga. BS programs ke liye intermediate mein kamaz kam 45% marks chahiye. Admission form fee Rs. 1500 hai. Documents mein matric certificate, inter marksheet, CNIC copy, aur photos chahiye hongi.',
                'fee': 'BS Programs ki fee approximately Rs. 15,000 - 20,000 per semester hai. Yeh department ke hisaab se vary karti hai. Engineering programs ki fee thori zyada hoti hai around Rs. 25,000 per semester. Fee challan semester ke pehle hafte mein jama karni hoti hai.',
                'program': 'University of Layyah mein kaafi programs available hain:\n\n📚 BS Computer Science\n📚 BS Information Technology\n📚 BS Mathematics\n📚 BS Physics\n📚 BS Chemistry\n📚 BS English\n📚 BS Education\n📚 BS Commerce\n📚 MBA / MPA\n\nHar program 4 saal (8 semesters) ka hai.',
                'scholarship': 'University of Layyah mein multiple scholarships available hain:\n\n🎓 Merit-based Scholarship (Top 3 positions)\n🎓 Need-based Financial Aid\n🎓 HEC Need-based Scholarship\n🎓 Punjab Government Scholarship\n🎓 Ehsaas Undergraduate Scholarship\n\nScholarship ke liye GPA 3.0+ hona chahiye.',
                'campus': 'University of Layyah ka campus Layyah city mein main GT Road par located hai. Facilities mein shamil hain:\n\n🏛️ Modern Lecture Halls\n📖 Central Library\n💻 Computer Labs\n🔬 Science Laboratories\n🕌 Mosque\n🏟️ Sports Ground\n🚌 Transport Service\n☕ Cafeteria',
                'contact': 'University of Layyah Contact Information:\n\n📞 Phone: 0606-510041\n📧 Email: info@uol.edu.pk\n🌐 Website: www.uol.edu.pk\n📍 Address: Layyah, Punjab, Pakistan\n\nOffice hours: Monday-Friday, 8:00 AM - 4:00 PM',
                'default': 'Assalam-o-Alaikum! Main University of Layyah ka AI Assistant hoon. Aap mujhse admissions, fee structure, available programs, scholarships, campus facilities, ya university rules ke baare mein pooch sakte hain. Kya jaanna chahte hain?'
            };
            const lowerMsg = userMessage.toLowerCase();
            let reply = fallbackResponses.default;
            if (lowerMsg.includes('admission') || lowerMsg.includes('apply') || lowerMsg.includes('eligib')) {
                reply = fallbackResponses.admission;
            } else if (lowerMsg.includes('fee') || lowerMsg.includes('cost') || lowerMsg.includes('challan') || lowerMsg.includes('paisa')) {
                reply = fallbackResponses.fee;
            } else if (lowerMsg.includes('program') || lowerMsg.includes('course') || lowerMsg.includes('department') || lowerMsg.includes('subject')) {
                reply = fallbackResponses.program;
            } else if (lowerMsg.includes('scholarship') || lowerMsg.includes('financial') || lowerMsg.includes('aid')) {
                reply = fallbackResponses.scholarship;
            } else if (lowerMsg.includes('campus') || lowerMsg.includes('facilit') || lowerMsg.includes('lab') || lowerMsg.includes('library') || lowerMsg.includes('hostel')) {
                reply = fallbackResponses.campus;
            } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email') || lowerMsg.includes('address')) {
                reply = fallbackResponses.contact;
            }
            appendMessage('bot', reply);
        }
    }
    // ──────────────────── Utility ────────────────────
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
    // ──────────────────── Particles ────────────────────
    function createParticles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * 20;
            const hue = Math.random() > 0.5 ? '160' : '200'; // emerald or cyan
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                background: hsl(${hue}, 70%, 55%);
            `;
            particlesContainer.appendChild(particle);
        }
    }
    // ──────────────────── Scroll Animations ────────────────────
    function initScrollAnimations() {
        const revealElements = document.querySelectorAll(
            '.feature-card, .step-card, .tech-item, .architecture-card, .about-content'
        );
        revealElements.forEach(el => el.classList.add('reveal'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });
        revealElements.forEach(el => observer.observe(el));
    }
    // ──────────────────── Navbar Scroll ────────────────────
    function initNavbarScroll() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            navbar.classList.toggle('scrolled', currentScroll > 50);
            // Active section tracking
            const sections = ['hero', 'features', 'how-it-works', 'about'];
            let currentSection = 'hero';
            sections.forEach(id => {
                const section = document.getElementById(id);
                if (section && section.getBoundingClientRect().top <= 200) {
                    currentSection = id;
                }
            });
            navLinkItems.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-section') === currentSection);
            });
            lastScroll = currentScroll;
        });
    }
    // ──────────────────── Stat Counter Animation ────────────────────
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(el => observer.observe(el));
    }
    function animateCounter(element, target) {
        const duration = 1500;
        const start = 0;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeOut);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }
    // ──────────────────── Card Glow Effect (Mouse Tracking) ────────────────────
    function initCardGlowEffect() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });
    }
    // ──────────────────── Boot ────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();