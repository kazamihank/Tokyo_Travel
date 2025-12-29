import { GoogleGenAI } from "@google/genai";

// Define interface for window to include appData
declare global {
    interface Window {
        appData: any;
    }
}

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat State
let isChatOpen = false;
let chatSession: any = null;

// Create UI Elements
function createChatUI() {
    // Styles
    const style = document.createElement('style');
    style.textContent = `
        #chat-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #FF5A5F;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 500;
            transition: transform 0.2s;
        }
        #chat-fab:hover {
            transform: scale(1.05);
        }
        #chat-window {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 350px;
            height: 500px;
            max-height: 70vh;
            max-width: 90vw;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            z-index: 500;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s ease-in-out;
        }
        #chat-window.open {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }
        .chat-msg {
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        .chat-msg.user {
            background-color: #008489;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .chat-msg.ai {
            background-color: #f3f4f6;
            color: #1f2937;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .typing-dot {
            animation: typing 1.4s infinite ease-in-out both;
            width: 6px;
            height: 6px;
            background-color: #9ca3af;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // FAB
    const fab = document.createElement('div');
    fab.id = 'chat-fab';
    fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    fab.onclick = toggleChat;
    document.body.appendChild(fab);

    // Window
    const win = document.createElement('div');
    win.id = 'chat-window';
    win.innerHTML = `
        <div class="bg-brand-teal p-4 text-white flex justify-between items-center shadow-sm">
            <div class="font-bold flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Tokyo AI Assistant
            </div>
            <button onclick="toggleChat()" class="hover:bg-white/20 rounded p-1 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 flex flex-col bg-white">
            <div class="chat-msg ai">嗨！我是你的東京旅遊助手。關於這個行程有任何問題都可以問我喔！🌸</div>
        </div>
        <div class="p-3 border-t border-gray-100 bg-gray-50 flex items-center">
            <input type="text" id="chat-input" class="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal placeholder-gray-400" placeholder="問問行程細節...">
            <button id="chat-send" class="ml-2 bg-brand-coral text-white rounded-full p-2 hover:bg-red-500 transition shadow-sm disabled:opacity-50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
        </div>
    `;
    document.body.appendChild(win);

    // Events
    document.getElementById('chat-send')?.addEventListener('click', sendMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initialize Global Toggle function for the close button inside HTML string
    (window as any).toggleChat = toggleChat;
}

function toggleChat() {
    const win = document.getElementById('chat-window');
    if (win) {
        isChatOpen = !isChatOpen;
        if (isChatOpen) win.classList.add('open');
        else win.classList.remove('open');
        
        // Focus input when opening
        if(isChatOpen) {
             setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
        }
    }
}

async function sendMessage() {
    const inputEl = document.getElementById('chat-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chat-send') as HTMLButtonElement;

    const text = inputEl.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;

    // Add Loading
    const loadingId = addLoading();

    try {
        // Check context
        const appData = window.appData;
        
        if (!chatSession) {
            const systemInstruction = `
                You are an enthusiastic and helpful travel assistant for a user's upcoming trip to Tokyo in 2026.
                
                Here is the detailed itinerary JSON data for the trip:
                ${JSON.stringify(appData)}
                
                Guidelines:
                1. Answer questions specifically based on this itinerary.
                2. If the user asks about something not in the itinerary, provide general Tokyo travel advice but mention it's not in their current plan.
                3. Be concise and friendly.
                4. Use emojis occasionally.
                5. Language: Traditional Chinese (Taiwan).
            `;

            chatSession = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction: systemInstruction,
                }
            });
        }

        const response = await chatSession.sendMessage({ message: text });
        const responseText = response.text;

        removeLoading(loadingId);
        addMessage(responseText, 'ai');

    } catch (e) {
        console.error(e);
        removeLoading(loadingId);
        addMessage("抱歉，我現在有點累，請稍後再試。", 'ai');
    } finally {
        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }
}

function addMessage(text: string, type: 'user' | 'ai') {
    const list = document.getElementById('chat-messages');
    if (!list) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerText = text; // basic text, safe
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
}

function addLoading() {
    const list = document.getElementById('chat-messages');
    if (!list) return '';

    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = `chat-msg ai`;
    div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
    return id;
}

function removeLoading(id: string) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatUI);
} else {
    createChatUI();
}