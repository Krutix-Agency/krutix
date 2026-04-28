const AI_CONFIG = {
    name: "KRUTIX AI",
    role: "Digital Consultant",
    fallbackResponse: "I'm currently optimizing my neural links. I can help with services, pricing, or automation. What do you want to know?",
    knowledge: [
        {
            keywords: ["hello", "hi", "hey", "hii", "greetings", "good morning", "good afternoon", "good evening"],
            answer: "Welcome to KRUTIX! We are a digital agency specializing in AI agent development, custom websites, workflow automation, and full digital transformation services. How can I help you today?"
        },
        {
            keywords: ["thanks", "thank you", "thx", "appreciate it"],
            answer: "You're very welcome! If you have any more questions or if there's anything else I can assist you with, just let me know. We're here to help!"
        },
        {
            keywords: ["ok", "hmm", "okay", "kk", "understood", "okey"],
            answer: "Now I think you are on the right way for grow your business, so don't wait else you will lose best opportunity.. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to know more."
        },
        {
            keywords: ["who are you", "about you", "introduce", "what are you"],
            answer: "I am KRUTIX AI, your digital consultant. I help businesses grow using automation, AI systems, and high-performance digital solutions. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to learn more."
        },
        {
            keywords: ["services", "what do you do", "offer", "solutions"],
            answer: "We provide AI agent development, custom websites, workflow automation, and full digital transformation services. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to get the best solution for your business."
        },
        {
            keywords: ["ai agent", "automation", "bot", "chatbot"],
            answer: "Our AI agents automate customer support, lead generation, and repetitive business tasks, helping you save time and scale faster. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to implement this in your business."
        },
        {
            keywords: ["website", "web development", "site"],
            answer: "We build high-performance websites designed for speed, conversions, and automation integration. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to get your custom website."
        },
        {
            keywords: ["crm", "lead management", "sales system"],
            answer: "We create CRM systems that track leads, automate follow-ups, and increase your sales conversions. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to set up your CRM."
        },
        {
            keywords: ["automation", "workflow", "process"],
            answer: "We automate repetitive workflows like emails, lead tracking, and operations to make your business more efficient. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to automate your workflows."
        },
        {
            keywords: ["digital marketing", "growth", "scale"],
            answer: "We help businesses scale using smart digital systems, automation, and performance-focused strategies. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to grow your business."
        },
        {
            keywords: ["price", "cost", "pricing", "charges"],
            answer: "Pricing depends on your requirements and the complexity of the solution. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to get an exact quote."
        },
        {
            keywords: ["contact", "call", "meeting", "book", "number", "email", "phone", "talk", "consultation"],
            answer: "You can book a free consultation directly here: <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book Consultation</a>. \n\n📱 Mobile: +91 9110992766 \n📧 Email: krutix.agency@gmail.com \n\nLet’s discuss your requirements and find the best solution!"
        },
        {
            keywords: ["work", "portfolio", "projects", "clients"],
            answer: "We’ve built automation systems, CRM tools, and high-converting websites for different businesses. <a href='booking.html' style='color:var(--cyan);text-decoration:underline'>Book a free consultation</a> to see how we can help you."
        }
    ]
};

let chatHistory = [];

function toggleChatPopup() {
    const popup = document.getElementById('chat-popup');
    popup.classList.toggle('open');
    if (popup.classList.contains('open')) {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
        if (chatHistory.length === 0) {
            addMessage("ai", "Hello! I'm your KRUTIX AI assistant. How can I help you accelerate your business today?");
        }
    }
}

function addMessage(type, text, isAnimated = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = `msg ${type}`;
    container.appendChild(msg);

    if (isAnimated && type === "ai") {
        let i = 0;
        const speed = 15; // typing speed in ms

        // We'll use a hidden element to parse HTML then type text
        const tempDiv = document.createElement('div');
        const formattedText = text.replace(/\n/g, '<br>');

        function typeEffect() {
            if (i <= formattedText.length) {
                // If we hit an opening tag, skip to the end of it
                if (formattedText[i] === '<') {
                    const tagEnd = formattedText.indexOf('>', i);
                    if (tagEnd !== -1) {
                        i = tagEnd + 1;
                    }
                }

                msg.innerHTML = formattedText.substring(0, i);
                i++;
                container.scrollTop = container.scrollHeight;
                setTimeout(typeEffect, speed);
            }
        }
        typeEffect();
    } else {
        msg.innerHTML = text.replace(/\n/g, '<br>');
    }

    container.scrollTop = container.scrollHeight;
    chatHistory.push({ role: type === "ai" ? "assistant" : "user", content: text });
}

async function handleChat(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage("user", text);
    input.value = '';

    // Simulate AI thinking
    const typing = document.createElement('div');
    typing.className = 'msg ai typing';
    typing.textContent = '...';
    document.getElementById('chat-messages').appendChild(typing);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

    // Simple local logic first
    let response = "";
    const lowerText = text.toLowerCase();

    const match = AI_CONFIG.knowledge.find(k => k.keywords.some(kw => lowerText.includes(kw)));
    if (match) {
        response = match.answer;
    } else {
        response = AI_CONFIG.fallbackResponse;
    }

    setTimeout(() => {
        typing.remove();
        addMessage("ai", response, true);
    }, 600);
}

// Ensure the popup structure exists if not in HTML
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('chat-popup')) {
        const popupHTML = `
            <div id="chat-popup" class="chat-popup">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">K</div>
                        <div>
                            <h3>KRUTIX AI</h3>
                            <p>Online</p>
                        </div>
                    </div>
                    <button class="close-chat" onclick="toggleChatPopup()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div id="chat-messages" class="chat-messages"></div>
                <form class="chat-input-area" onsubmit="handleChat(event)">
                    <input type="text" id="chat-input" placeholder="Ask about KRUTIX..." autocomplete="off">
                    <button type="submit" class="send-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
});
