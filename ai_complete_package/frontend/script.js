// Frontend interactions: calculator, contact form, chat widget, theme
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle (dark mode)
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  if(localStorage.theme === 'dark') root.classList.add('dark');
  themeToggle.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.theme = root.classList.contains('dark') ? 'dark' : 'light';
  });

  // Calculator
  document.getElementById('calcBtn').addEventListener('click', ()=> {
    const c = parseFloat(document.getElementById('complexity').value);
    const i = parseInt(document.getElementById('integrations').value||0,10);
    const ch = parseFloat(document.getElementById('channels').value);
    const base = 1000;
    const estimate = Math.round((base * c + i*1200) * ch);
    document.getElementById('estimateVal').innerText = estimate.toLocaleString('pl-PL') + ' zł';
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    status.innerText = 'Wysyłanie…';
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      company: document.getElementById('company').value,
      message: document.getElementById('message').value
    };
    try {
      const res = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      if(res.ok){ status.innerText='Wysłano! Odpowiemy w 24h.'; contactForm.reset(); }
      else { status.innerText='Błąd wysyłki.'; }
    } catch(err){ status.innerText='Błąd sieci.'; }
  });

  // Chat widget
  const launcher = document.getElementById('chatLauncher');
  const widget = document.getElementById('chatWidget');
  const chatClose = document.getElementById('chatClose');
  const chatSend = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');
  const chatLog = document.getElementById('chatLog');

  launcher.addEventListener('click', ()=> { widget.classList.remove('hidden'); launcher.style.display='none'; });
  chatClose.addEventListener('click', ()=> { widget.classList.add('hidden'); launcher.style.display='block'; });

  function appendMsg(text, who='bot'){
    const d = document.createElement('div'); d.className = 'msg '+(who==='user'?'user':'bot'); d.innerText = text; chatLog.appendChild(d); chatLog.scrollTop = chatLog.scrollHeight;
  }

  chatSend.addEventListener('click', async ()=> {
    const text = chatInput.value.trim(); if(!text) return;
    appendMsg(text,'user'); chatInput.value=''; appendMsg('Piszę...','bot');
    try{
      const res = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text})});
      const data = await res.json();
      // replace last bot message
      const bots = chatLog.querySelectorAll('.msg.bot');
      const lastBot = bots[bots.length-1];
      lastBot.innerText = data.reply || 'Przepraszam, brak odpowiedzi.';
    }catch(err){
      appendMsg('Błąd serwera','bot');
    }
  });

  // order button prefills chat
  document.getElementById('orderBtn').addEventListener('click', ()=> {
    launcher.click();
    setTimeout(()=>{ chatInput.value = 'Chciałbym zamówić projekt agenta AI. Proszę o kontakt.'; },200);
  });
});
