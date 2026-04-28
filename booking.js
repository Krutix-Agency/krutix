const API_KEY = "cal_live_3408e504d2a0c0168944c6e6512a9d4c";
const EVENT_TYPE_ID = 5499028;
const API_BASE = "https://api.cal.com/v2";
const VERSION_HEADER = "2024-06-14";

let currentDate = new Date();
let selectedDate = null;
let selectedSlot = null;
let slotsCache = {}; // Cache to make interaction instantaneous

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Initialize Calendar
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    preloadMonthSlots(); // Start preloading immediately
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
});

function renderCalendar() {
    const grid = document.getElementById('cal-grid');
    const monthLabel = document.getElementById('current-month');
    
    grid.innerHTML = "";
    monthLabel.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Add day labels
    days.forEach(day => {
        const d = document.createElement('div');
        d.className = 'cal-day-label';
        d.textContent = day;
        grid.appendChild(d);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        dayEl.textContent = i;
        
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        
        if (d < today) {
            dayEl.classList.add('disabled');
        } else {
            if (d.getTime() === today.getTime()) dayEl.classList.add('today');
            dayEl.onclick = () => selectDate(d);
        }
        
        grid.appendChild(dayEl);
    }
}

function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
    preloadMonthSlots(); // Preload new month
}

async function preloadMonthSlots() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${year}-${month}`;
    
    if (slotsCache[monthKey]) return;

    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const tz = "Asia/Calcutta";

    try {
        const response = await fetch(`${API_BASE}/slots/available?eventTypeId=${EVENT_TYPE_ID}&startTime=${start}&endTime=${end}&timeZone=${tz}`, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "cal-api-version": VERSION_HEADER
            }
        });
        const result = await response.json();
        if (result.status === "success" && result.data && result.data.slots) {
            slotsCache[monthKey] = result.data.slots;
        }
    } catch (err) {
        console.error("Preload error:", err);
    }
}

async function selectDate(date) {
    selectedDate = date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // UI Update
    document.getElementById('selected-date-label').textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('step-date').style.display = 'none';
    document.getElementById('step-time').style.display = 'block';
    
    // Summary
    document.getElementById('sum-date').style.display = 'block';
    document.getElementById('sum-date-val').textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await showSlots(dateStr);
}

async function showSlots(dateStr) {
    const loader = document.getElementById('loading-overlay');
    const container = document.getElementById('slots-container');
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    container.innerHTML = "";

    // If slots are cached, show immediately
    if (slotsCache[monthKey] && slotsCache[monthKey][dateStr]) {
        renderSlots(slotsCache[monthKey][dateStr]);
    } else {
        // Otherwise fetch for this specific day
        loader.style.display = 'flex';
        try {
            const start = `${dateStr}T00:00:00Z`;
            const end = `${dateStr}T23:59:59Z`;
            const tz = "Asia/Calcutta";

            const response = await fetch(`${API_BASE}/slots/available?eventTypeId=${EVENT_TYPE_ID}&startTime=${start}&endTime=${end}&timeZone=${tz}`, {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "cal-api-version": VERSION_HEADER
                }
            });

            const result = await response.json();
            if (result.status === "success" && result.data && result.data.slots) {
                const slots = result.data.slots[dateStr] || [];
                renderSlots(slots);
                // Also store in cache for future clicks
                if (!slotsCache[monthKey]) slotsCache[monthKey] = {};
                slotsCache[monthKey][dateStr] = slots;
            } else {
                container.innerHTML = "<p class='muted'>Error loading slots. Please try again.</p>";
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = "<p class='muted'>Connection error.</p>";
        } finally {
            loader.style.display = 'none';
        }
    }
}

function renderSlots(slots) {
    const container = document.getElementById('slots-container');
    container.innerHTML = "";
    
    if (slots.length === 0) {
        container.innerHTML = "<p class='muted' style='text-align:center'>No slots available for this day.</p>";
    } else {
        slots.forEach(slot => {
            const time = new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.textContent = time;
            div.onclick = () => selectSlot(slot);
            container.appendChild(div);
        });
    }
}

function selectSlot(slot) {
    selectedSlot = slot;
    const time = new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    document.getElementById('sum-time').style.display = 'block';
    document.getElementById('sum-time-val').textContent = time;

    document.getElementById('step-time').style.display = 'none';
    document.getElementById('step-form').style.display = 'block';
}

function goToDate() {
    document.getElementById('step-time').style.display = 'none';
    document.getElementById('step-date').style.display = 'block';
    document.getElementById('sum-time').style.display = 'none';
}

function goToTime() {
    document.getElementById('step-form').style.display = 'none';
    document.getElementById('step-time').style.display = 'block';
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    const loader = document.getElementById('loading-overlay');
    loader.style.display = 'flex';

    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const notes = document.getElementById('user-notes').value;

    try {
        const body = {
            eventTypeId: EVENT_TYPE_ID,
            start: new Date(selectedSlot.time).toISOString(),
            attendee: {
                name: name,
                email: email
            },
            responses: {
                name: name,
                email: email,
                notes: notes
            },
            timeZone: "Asia/Calcutta",
            language: "en",
            metadata: {}
        };

        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "cal-api-version": VERSION_HEADER,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.status === "success") {
            document.getElementById('step-form').style.display = 'none';
            document.getElementById('step-success').classList.add('active');
            document.querySelector('.booking-summary').style.display = 'none';
            document.querySelector('.booking-container').classList.add('success-mode');
        } else {
            alert("Booking failed: " + (result.error?.message || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("A connection error occurred. Please check your network.");
    } finally {
        loader.style.display = 'none';
    }
}
