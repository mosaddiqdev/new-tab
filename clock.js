class MinimalClock {
    constructor() {
        this.clockElement = document.getElementById('clock');
        this.greetingElement = document.getElementById('greeting');
        this.dateElement = document.getElementById('date');
        this.shortcutsElement = document.getElementById('shortcuts');

        this.isClockVisible = this.loadSetting('isClockVisible', true);
        this.isDateVisible = this.loadSetting('isDateVisible', true);
        this.shortcutsTimer = null;

        this.init();
    }

    init() {
        this.applyVisibilityStates();
        this.updateClock();
        this.updateGreeting();
        this.updateDate();
        this.setupKeyboardShortcuts();
        this.setupHoverHelp();

        setInterval(() => {
            this.updateClock();
        }, 1000);

        setInterval(() => {
            this.updateGreeting();
            this.updateDate();
        }, 60000);

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateClock();
                this.updateGreeting();
                this.updateDate();
            }
        });
    }

    updateClock() {
        if (!this.clockElement) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        this.clockElement.textContent = `${hours}:${minutes}`;
    }

    updateGreeting() {
        if (!this.greetingElement) return;

        const hour = new Date().getHours();
        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
        } else if (hour >= 17 && hour < 22) {
            greeting = 'Good Evening';
        } else {
            greeting = 'Good Night';
        }

        this.greetingElement.textContent = greeting;
    }

    updateDate() {
        if (!this.dateElement) return;

        const now = new Date();
        const options = {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        };

        const formattedDate = now.toLocaleDateString('en-US', options);
        this.dateElement.textContent = formattedDate;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.toggleClock();
                    break;
                case 'd':
                    this.toggleDate();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case '?':
                case '/':
                    this.showShortcutsTemporarily();
                    break;
            }
        });
    }

    toggleClock() {
        this.isClockVisible = !this.isClockVisible;
        this.saveSetting('isClockVisible', this.isClockVisible);

        const container = document.querySelector('.container');

        if (this.isClockVisible) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }

        this.showNotification(this.isClockVisible ? 'Clock shown' : 'Focus mode');
    }

    toggleDate() {
        this.isDateVisible = !this.isDateVisible;
        this.saveSetting('isDateVisible', this.isDateVisible);

        if (this.isDateVisible) {
            this.dateElement.classList.remove('hidden');
            this.greetingElement.classList.remove('hidden');
        } else {
            this.dateElement.classList.add('hidden');
            this.greetingElement.classList.add('hidden');
        }

        this.showNotification(this.isDateVisible ? 'Date shown' : 'Date hidden');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                this.showNotification('Fullscreen not available');
            });
        } else {
            document.exitFullscreen();
        }
    }

    setupHoverHelp() {
        const hoverTrigger = document.createElement('div');
        hoverTrigger.className = 'help-trigger';
        hoverTrigger.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            width: 120px;
            height: 120px;
            z-index: 999;
            pointer-events: auto;
        `;

        document.body.appendChild(hoverTrigger);

        hoverTrigger.addEventListener('mouseenter', () => {
            this.shortcutsElement.classList.add('show');
        });

        const hideShortcuts = () => {
            setTimeout(() => {
                if (!hoverTrigger.matches(':hover') && !this.shortcutsElement.matches(':hover')) {
                    this.shortcutsElement.classList.remove('show');
                }
            }, 100);
        };

        hoverTrigger.addEventListener('mouseleave', hideShortcuts);
        this.shortcutsElement.addEventListener('mouseleave', hideShortcuts);

        this.shortcutsElement.addEventListener('mouseenter', () => {
            this.shortcutsElement.classList.add('show');
        });
    }

    showShortcutsTemporarily() {
        this.shortcutsElement.classList.add('show');

        if (this.shortcutsTimer) {
            clearTimeout(this.shortcutsTimer);
        }

        this.shortcutsTimer = setTimeout(() => {
            this.shortcutsElement.classList.remove('show');
        }, 3000);
    }

    showNotification(message) {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            padding: 0.6rem 1.2rem;
            border-radius: 0.4rem;
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 300;
            z-index: 1000;
            opacity: 0;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 200);
        }, 1200);
    }

    saveSetting(key, value) {
        try {
            localStorage.setItem(`minimal-clock-${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save setting:', key, error);
        }
    }

    loadSetting(key, defaultValue) {
        try {
            const saved = localStorage.getItem(`minimal-clock-${key}`);
            return saved !== null ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.warn('Failed to load setting:', key, error);
            return defaultValue;
        }
    }

    applyVisibilityStates() {
        const container = document.querySelector('.container');
        if (!this.isClockVisible) {
            container.classList.add('hidden');
        }

        if (!this.isDateVisible) {
            this.dateElement.classList.add('hidden');
            this.greetingElement.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MinimalClock();
});
