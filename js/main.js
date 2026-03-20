// ========== State ==========
let currentStep = 1;
const totalSteps = 5;
let selectedDate = null;
let selectedTime = null;
let calendarYear, calendarMonth;

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initGallery();
    initCalendar();
    initTimeSlots();
    initScrollReveal();
});

// ========== Navbar ==========
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
    });

    // Close menu on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('open');
            links.classList.remove('open');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

// ========== Gallery Filter ==========
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.gallery-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.4s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// ========== Booking Flow ==========
function nextStep() {
    // Validate current step
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
        currentStep++;
        updateBookingUI();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateBookingUI();
    }
}

function goToStep(step) {
    if (step < currentStep) {
        currentStep = step;
        updateBookingUI();
    }
}

function validateStep(step) {
    switch (step) {
        case 1: {
            const service = document.querySelector('input[name="service"]:checked');
            if (!service) {
                showToast('请选择一个服务项目');
                return false;
            }
            return true;
        }
        case 2: {
            const stylist = document.querySelector('input[name="stylist"]:checked');
            if (!stylist) {
                showToast('请选择一位发型师');
                return false;
            }
            return true;
        }
        case 3: {
            if (!selectedDate) {
                showToast('请选择预约日期');
                return false;
            }
            if (!selectedTime) {
                showToast('请选择预约时间');
                return false;
            }
            return true;
        }
        case 4: {
            const name = document.getElementById('userName').value.trim();
            const phone = document.getElementById('userPhone').value.trim();
            if (!name) {
                showToast('请输入您的姓名');
                return false;
            }
            if (!phone) {
                showToast('请输入联系电话');
                return false;
            }
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                showToast('请输入正确的手机号码');
                return false;
            }
            return true;
        }
        case 5:
            return true;
        default:
            return true;
    }
}

function updateBookingUI() {
    // Update steps visibility
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
    const activeStep = document.getElementById('step' + currentStep);
    if (activeStep) {
        activeStep.classList.add('active');
    }

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((ps, idx) => {
        const stepNum = idx + 1;
        ps.classList.remove('active', 'completed');
        if (stepNum === currentStep) {
            ps.classList.add('active');
        } else if (stepNum < currentStep) {
            ps.classList.add('completed');
        }
    });

    document.querySelectorAll('.progress-line').forEach((line, idx) => {
        line.classList.toggle('active', idx < currentStep - 1);
    });

    // Populate summary on step 5
    if (currentStep === 5) {
        populateSummary();
    }

    // Scroll to booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function populateSummary() {
    const serviceMap = {
        'classic-cut': '经典剪发 (¥88)',
        'trend-cut': '潮流造型 (¥128)',
        'color': '染发造型 (¥288)',
        'perm': '烫发造型 (¥358)',
        'shave': '经典修面 (¥58)',
        'vip': '绅士套餐 (¥158)'
    };

    const service = document.querySelector('input[name="service"]:checked');
    const stylist = document.querySelector('input[name="stylist"]:checked');
    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const note = document.getElementById('userNote').value.trim();

    document.getElementById('summaryService').textContent = service ? serviceMap[service.value] : '-';
    document.getElementById('summaryStylist').textContent = stylist ? stylist.value : '-';
    document.getElementById('summaryDate').textContent = selectedDate ? formatDate(selectedDate) : '-';
    document.getElementById('summaryTime').textContent = selectedTime || '-';
    document.getElementById('summaryName').textContent = name || '-';
    document.getElementById('summaryPhone').textContent = phone || '-';

    const noteRow = document.getElementById('summaryNoteRow');
    if (note) {
        noteRow.style.display = 'flex';
        document.getElementById('summaryNote').textContent = note;
    } else {
        noteRow.style.display = 'none';
    }
}

function submitBooking() {
    // Hide form, show success
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepSuccess').style.display = 'block';
    document.getElementById('stepSuccess').classList.add('active');

    // Update progress
    document.querySelectorAll('.progress-step').forEach(ps => {
        ps.classList.remove('active');
        ps.classList.add('completed');
    });
    document.querySelectorAll('.progress-line').forEach(line => {
        line.classList.add('active');
    });
}

function resetBooking() {
    currentStep = 1;
    selectedDate = null;
    selectedTime = null;

    // Reset form inputs
    document.querySelectorAll('input[name="service"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name="stylist"]').forEach(i => i.checked = false);
    document.getElementById('userName').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userNote').value = '';

    // Reset calendar
    initCalendar();

    // Reset time slots
    document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('selected'));

    // Show step 1
    document.getElementById('stepSuccess').style.display = 'none';
    document.getElementById('stepSuccess').classList.remove('active');
    updateBookingUI();
}

// ========== Calendar ==========
function initCalendar() {
    const now = new Date();
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth();
    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    document.getElementById('calMonth').textContent = `${calendarYear}年 ${monthNames[calendarMonth]}`;

    const daysContainer = document.getElementById('calDays');
    daysContainer.innerHTML = '';

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('button');
        empty.className = 'cal-day empty';
        empty.disabled = true;
        daysContainer.appendChild(empty);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement('button');
        btn.className = 'cal-day';
        btn.textContent = day;

        const date = new Date(calendarYear, calendarMonth, day);
        date.setHours(0, 0, 0, 0);

        // Disable past days
        if (date < today) {
            btn.classList.add('disabled');
            btn.disabled = true;
        }

        // Mark today
        if (date.getTime() === today.getTime()) {
            btn.classList.add('today');
        }

        // Selected state
        if (selectedDate &&
            selectedDate.getFullYear() === calendarYear &&
            selectedDate.getMonth() === calendarMonth &&
            selectedDate.getDate() === day) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            selectedDate = new Date(calendarYear, calendarMonth, day);
            renderCalendar();
        });

        daysContainer.appendChild(btn);
    }

    // Nav events
    document.getElementById('calPrev').onclick = () => {
        calendarMonth--;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }
        renderCalendar();
    };

    document.getElementById('calNext').onclick = () => {
        calendarMonth++;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }
        renderCalendar();
    };
}

// ========== Time Slots ==========
function initTimeSlots() {
    document.querySelectorAll('.timeslot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTime = btn.dataset.time;
        });
    });
}

// ========== Scroll Reveal ==========
function initScrollReveal() {
    const sections = document.querySelectorAll('.section-header, .gallery-grid, .stylists-grid, .booking-form');

    sections.forEach(el => {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(el => observer.observe(el));
}

// ========== Helpers ==========
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekDay}`;
}

function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: var(--primary-dark);
        color: #fff;
        padding: 14px 32px;
        border-radius: 50px;
        font-size: 14px;
        font-family: var(--font);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
