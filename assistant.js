/**
 * SR Assistant - THE INTERACTIVE EXPERT v8.0 🧠⚡✨
 * Feature: Full Offline Expert + Smart Calculators + Interactive Wizards
 */

document.addEventListener('DOMContentLoaded', () => {
    function initAssistant() {
        const fab = document.getElementById('srAssistantFab');
        const windowEl = document.getElementById('srAssistantWindow');
        const closeBtn = document.getElementById('closeAssistantBtn');
        const messagesContainer = document.getElementById('assistantMessages');
        const inputEl = document.getElementById('assistantInput');
        const sendBtn = document.getElementById('sendAssistantBtn');

        if (!fab || !windowEl) {
            setTimeout(initAssistant, 500);
            return;
        }

        console.log("Orange Expert v8.0 (Interactive) Ready 🚀");

        let isWindowOpen = false;
        let hasGreeted = false;

        // --- THE HUMAN INTELLIGENCE ENGINE (v20) 🧠🧡 ---
        window.assistantState = { lastTopic: null, lastAmount: null };

        const SYNONYMS = {
            'خط': ['شريحة', 'سيم', 'sim', 'رقم', 'بريمير', 'كنترول', 'أفراد', 'شركات'],
            'كاش': ['اورنج كاش', 'فلوس', 'محفظة', 'wallet', 'oc', 'موني', 'money'],
            'نت': ['انترنت', 'داتا', 'data', 'باقة', 'mb', 'وحدات', 'ميجا'],
            'سيستم': ['وقع', 'بطيء', 'تهنيج', 'عطلان', 'مش شغال', 'تقيل', 'crm'],
            'هنت': ['هنتات', 'hunt', 'رقم داخلي', 'داخلي', 'تليفون'],
            'إيميل': ['ايميل', 'mail', 'email', 'عنوان'],
        };

        function analyzeIntents(text) {
            let activeIntents = [];
            
            // Check for Greeting
            const greetings = ["ازيك", "صباح", "مساء", "هلا", "اهلاً", "هاي", "hi", "hello", "سلام", "تحية", "باشا", "ريس", "يا بطل", "عامل ايه", "اخبارك"];
            if (greetings.some(g => text.includes(g))) activeIntents.push('greeting');

            // Check for Gratitude
            const gratitude = ["شكرا", "تسلم", "حبيبي", "يا بطل", "كلك ذوق", "شكراً", "thanks", "thx"];
            if (gratitude.some(g => text.includes(g))) activeIntents.push('gratitude');

            // Check for Tasks
            if (text.match(/(احسب|فاتورة|شحن|بكام|فلوس)/i)) activeIntents.push('billing');
            if (text.includes("كاش") || text.includes("cash") || text.includes("سحب") || text.includes("ايداع") || text.includes("محفظة")) activeIntents.push('ocash');
            if (text.includes("نكتة") || text.includes("اضحك") || text.includes("joke") || text.includes("هزار")) activeIntents.push('social');
            if (text.includes("وقع") || text.includes("زحمة") || text.includes("قرف") || text.includes("تعب") || text.includes("عطلان")) activeIntents.push('frustration');
            
            // Search intents (SR, Emails, Hunts)
            if (text.match(/\d{5,}/)) activeIntents.push('sr_search');
            if (text.includes("ايميل") || text.includes("email") || text.includes("هنت") || text.includes("hunt") || text.includes("رقم")) activeIntents.push('data_search');

            return [...new Set(activeIntents)];
        }

        const RESPONSES = {
            greetings: (timeGreet) => [
                `${timeGreet} يا صاحبي! نورتني والله. أؤمرني أقدر أساعدك في إيه؟ 🧡`, 
                `أهلاً بيك يا وحش الفرع.. الشفت أخره امتى؟ 😂 قولي محتاج إيه؟ 😎`, 
                `يا ميت أهلاً باللي منور الشاشات.. معاك زميلك الآلي، هات اللي عندك! 🦾`
            ],
            gratitude: [
                "على إيه بس! إحنا إخوات وفي ضهر بعض يا بطل. 🧡", 
                "العفو يا سيدي، أنا موجود هنا دايماً عشان أسهل عليك الشغل. 😉", 
                "تسلم يا غالي، أي خدمة! روّق إنت بس ومتبقاش شايل هم. ✨"
            ],
            frustration: [
                "عارف إن الشفت تقيل والفرع زحمة، بس إنت قدها وتعمل التارجت وزيادة! كوباية شاي كدة وروّق. 🦾🧡",
                "السيستم بعافية شوية؟ تعيش وتاخد غيرها 😂 اضحك وفكها، وأنا معاك لو احتجت أي تفاصيل بسرعة.",
                "بص، الزحمة دي هي اللي بتعمل الـ GAs! خد نفس عميق وركّز وأنا هسند معاك المبيعات بمعلوماتي. 🎯"
            ],
            social: [
                "مرة موظف فرع دخل ينام، مراته بتقوله 'تصبح على خير'، قالها 'معاكي صورة البطاقة الأصلية؟' 😂",
                "بيقولك مرة عميل دخل يشتري خط 'كارت' وهو أصلاً 'كارت'.. الموظف قاله 'إنت كدة بتعمل MIGRATION لنفسك يا فنان!' 😂",
                "ايه الفرق بين الموظف والـ SR؟ الـ SR بيخلص في 3 أيام، الموظف بيخلص في 3 دقايق لو التارجت قرب! 😉"
            ],
            billingOptions: (amount) => [
                `من عيني يا فنان! حسبة الـ **${amount} جنيه** اهي من غير تعقيد: 👇`,
                `طبعاً يا صاحبي، لو هتدفع **${amount}** يبقى الإجمالي بالمليم كدة: 👇`,
                `حاضر يا بطل، جبتلك الخلاصة لـ **${amount} جنيه**: 👇`
            ],
            fallback: "معلش يا صاحبي مش مجمع قصدك أوي 😅.. جرب تسألني عن (فاتورة معينة، كود SR، أو إيميل قسم) وأنا هرد فوراً! 🦾✨"
        };

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        function localExpertReply(query) {
            const text = query.toLowerCase().trim();
            const intents = analyzeIntents(text);
            let replies = [];

            // 1. Handle Greetings
            if (intents.includes('greeting')) {
                const hour = new Date().getHours();
                const timeGreet = hour < 12 ? "صباح الفل والنشاط" : "مساء الجمال والروقان";
                replies.push(getRandom(RESPONSES.greetings(timeGreet)));
            }

            // 2. Handle Gratitude
            if (intents.includes('gratitude') && intents.length === 1) {
                return getRandom(RESPONSES.gratitude);
            }

            // 3. Handle Small Talk
            if (text.includes("عامل ايه") || text.includes("اخبارك") || text.includes("كيف حالك")) {
                return "أنا زي الفل طول ما إنت والسيستم شغالين تمام! 😂 محتاج مساعدة في حاجة معينة؟";
            }

            // 4. Handle Billing/Calculators
            const calcMatch = text.match(/(\d+)/);
            if (intents.includes('billing') && !calcMatch) {
                window.assistantState.lastTopic = 'billing';
                replies.push(`بكام الفاتورة يا بطل؟ اختار من الأساسيات أو اكتب الباقة (مثلاً: 175):
                    <div class="assistant-inline-actions">
                        <button onclick="window.triggerBubble('175')">Eagle 175</button>
                        <button onclick="window.triggerBubble('450')">Premier 450</button>
                        <button onclick="window.triggerBubble('600')">Premier 600</button>
                        <button onclick="window.triggerBubble('1000')">1000 ج</button>
                    </div>`);
            } else if (calcMatch && (intents.includes('billing') || window.assistantState.lastTopic === 'billing')) {
                const amount = parseFloat(calcMatch[1]);
                if (amount < 5000) {
                    window.assistantState.lastTopic = null;
                    const tax = (amount * 0.23).toFixed(2);
                    const fees = 12.50;
                    const total = (amount + parseFloat(tax) + fees).toFixed(2);

                    // Plan name recognition
                    const planNames = {
                        175: 'Eagle 175 🦅', 520: 'Premier 520', 690: 'Premier 690',
                        860: 'Premier 860', 1200: 'Premier 1200', 1725: 'Premier 1725',
                        450: 'Premier 450', 600: 'Premier 600'
                    };
                    const planLabel = planNames[amount] ? `<div class="calc-plan-label">📋 باقة: <b>${planNames[amount]}</b></div>` : '';

                    const prefix = getRandom(RESPONSES.billingOptions(amount));
                    replies.push(`
                        ${prefix}
                        <div class="calc-result">
                            ${planLabel}
                            <div class="calc-row"><span>الأساسي:</span> <b>${amount} ج.م</b></div>
                            <div class="calc-row"><span>ضريبة (23%):</span> <b>${tax} ج.م</b></div>
                            <div class="calc-row"><span>رسوم:</span> <b>${fees} ج.م</b></div>
                            <div class="calc-total">الإجمالي: ${total} ج.م</div>
                        </div>
                    `);
                }
            }

            // 5. Handle Orange Cash
            if (intents.includes('ocash')) {
                window.assistantState.lastTopic = 'ocash';
                replies.push(`
                    <b>أورنج كاش.. دي الخلاصة يا بطل! 💸</b><br><br>
                    • <b>نفاصيل السحب:</b> #115# يتم ادخال الرقم السري والتاكيد مع موظف الفرع.<br>
                    • <b>تفاصيل الايداع:</b> #115# يتم ادخال الرقم السري والتاكيد مع موظف الفرع.
                `);
            }

            // 6. Handle Search (SRs, Emails, Hunts)
            const srMatch = (window.ORANGE_SR_DATA || []).find(sr => 
                text.includes(sr.id) || text.includes(sr.title.toLowerCase()) || (sr.titleAr && text.includes(sr.titleAr))
            );
            if (srMatch) replies.push(`<b>بص يا سيدي، دورت ولقيت لك الـ SR ده! 😎</b><br><br><b>${srMatch.titleAr || srMatch.title}</b> (كود: ${srMatch.id})<br>${srMatch.steps}`);

            const emailMatch = (window.ORANGE_EMAILS_DATA || []).filter(e => text.split(' ').some(word => word.length > 2 && e.name.toLowerCase().includes(word)));
            if (emailMatch.length > 0 && replies.length === 0) {
                let r = "<b>جبتلك الإيميلات من الكنترول يا بطل! ابعت ومتعطلش نفسك: 👇</b><br>";
                emailMatch.slice(0, 3).forEach(e => r += `• <b>${e.name}</b>: <a href="mailto:${e.email}">${e.email}</a><br>`);
                replies.push(r);
            }

            const huntMatch = (window.ORANGE_HUNTS_DATA || []).filter(h => text.split(' ').some(word => word.length > 2 && h.name.toLowerCase().includes(word)));
            if (huntMatch.length > 0 && replies.length === 0) {
                let r = "<b>الأرقام دي طلعت مية مية من الداتا.. كلمهم وخلص المصلحة: 📞</b><br>";
                huntMatch.slice(0, 3).forEach(h => r += `• <b>${h.name}</b>: <a href="tel:${h.number}">${h.number}</a> (${h.type})<br>`);
                replies.push(r);
            }

            // 7. Frustration & Motivation
            if (intents.includes('frustration')) {
                replies.push(getRandom(RESPONSES.frustration));
            }

            // 8. Social & Jokes
            if (intents.includes('social')) {
                replies.push(getRandom(RESPONSES.social));
            }

            if (replies.length > 0) return replies.join('<br><hr style="border:0;border-top:1px solid rgba(255,121,0,0.1);margin:10px 0;"><br>');

            return RESPONSES.fallback;
        }

        // --- Core UI Functions ---
        function formatText(text) {
            text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<a href="mailto:$1" class="chat-link" target="_blank">$1</a>');
            text = text.replace(/(01[0125][0-9]{8})/g, '<a href="tel:$1" class="chat-link">$1</a>');
            text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            return text;
        }

        const initBubbles = () => {
            const container = document.getElementById('assistantQuickBubbles');
            if(!container) return;
            const bubbles = [
                { id: 'billing', label: 'احسب فاتورة', icon: 'calculator' },
                { id: 'ocash', label: 'أورانج كاش', icon: 'wallet' },
                { id: 'system', label: 'السيستم واقع', icon: 'server-crash' },
                { id: 'hunts', label: 'أرقام التواصل', icon: 'phone-outgoing' }
            ];
            container.innerHTML = bubbles.map(b => `<div class="bubble-chip" onclick="window.triggerBubble('${b.id}')"><i data-lucide="${b.icon}"></i> ${b.label}</div>`).join('');
            if (window.safeRenderIcons) window.safeRenderIcons();
        };

        function toggleWindow() {
            isWindowOpen = !isWindowOpen;
            windowEl.classList.toggle('active', isWindowOpen);
            fab.classList.toggle('minimized', isWindowOpen);
            if (isWindowOpen) {
                initBubbles();
                setTimeout(() => inputEl.focus(), 400);
                if (!hasGreeted) {
                    appendMessage("يا هلا بيك يا بطل! أنا **Orange Expert** زميلك في الفرع.. محتاج مساعدة في كود SR أو إيميل معين؟ 😎", 'bot');
                    hasGreeted = true;
                }
            }
        }

        function handleSend() {
            const text = inputEl.value.trim();
            if (!text) return;
            appendMessage(text, 'user');
            inputEl.value = '';
            showTyping();
            const delay = Math.random() * 500 + 500; 
            setTimeout(() => {
                const reply = localExpertReply(text);
                appendMessage(reply, 'bot');
                if (window.safeRenderIcons) window.safeRenderIcons(); // Render wizard icons
            }, delay);
        }

        function appendMessage(text, sender) {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg msg-${sender}`;
            msgDiv.innerHTML = formatText(text.replace(/\n/g, '<br>'));
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
        }

        function showTyping() {
            if (document.getElementById('typingIndicator')) return;
            const div = document.createElement('div');
            div.id = 'typingIndicator';
            div.className = 'typing-indicator';
            div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            messagesContainer.appendChild(div);
            messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
        }

        fab.addEventListener('click', toggleWindow);
        if (closeBtn) closeBtn.addEventListener('click', toggleWindow);
        if (sendBtn) sendBtn.addEventListener('click', handleSend);
        if (inputEl) inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

        window.triggerBubble = (id) => {
            const cmds = { 
                'ocash': "أورنج كاش",
                'billing': "فاتورة",
                'system': "السيستم وقع",
                'hunts': "هنتات"
            };
            const cmd = cmds[id] || id;
            inputEl.value = cmd;
            handleSend();
        };
        
        window.assistantWizardAction = (type) => {
            appendMessage("من عيني يا بطل، الخلاصة اهي.. 👇", 'bot');
            if (type === 'sim_swap') appendMessage("**بدل فاقد (SIM Swap) 📲**\nمحتاجين البطاقة الأصلية والسعر 5 جنيه.", 'bot');
        };
    }
    initAssistant();
});
