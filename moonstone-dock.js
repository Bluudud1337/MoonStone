(function(){
  const root = document.getElementById("moonstone-dock-root");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  const items = [
    ["index.html","Home",'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/>'],
    ["launcher.html","About:blank Launcher",'<path d="M5 12h14M12 5l7 7-7 7"/>'],
    ["games.html","Games",'<path d="M6 11h4m-2-2v4"/><path d="M15 10h.01M18 12h.01"/><path d="M7 6h10a4 4 0 0 1 3.8 5.2l-1.3 4.3a2.5 2.5 0 0 1-4.1 1.1L13 14h-2l-2.4 2.6a2.5 2.5 0 0 1-4.1-1.1l-1.3-4.3A4 4 0 0 1 7 6Z"/>'],
    ["movies.html","Movies",'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v4m5-4v4m5-4v4M7 16v4m5-4v4m5-4v4M3 12h18"/>'],
    ["work.html","Work",'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'],
    ["YT.html","YouTube Watcher",'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>'],
    ["calculator.html","Calculator",'<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M7 6h10M7 11h2m3 0h2m3 0h.01M7 15h2m3 0h2m3 0h.01M7 19h2m3 0h2"/>'],
    ["chat.html","Chatroom",'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>'],
    ["tidal.html","Music",'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>']
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const links = items.map(([href,label,path]) => '<a class="side-link '+(href===current?'active':'')+'" href="'+href+'" aria-label="'+label+'" title="'+label+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+path+'</svg>'+(href==="YT.html"?'<span class="youtube-new-label">NEW</span>':"")+'</a>').join("");
  root.innerHTML = '<nav class="sidebar ms-dock" aria-label="Main navigation">'+links+'<div class="side-divider"></div><button class="side-button" id="settingsOpen" aria-label="Settings" title="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z"/><path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l1.45-1.12-1.5-2.6-1.75.6a7.8 7.8 0 0 0-2.6-1.5L14.7 4h-3.4l-.3 1.88a7.8 7.8 0 0 0-2.6 1.5l-1.75-.6-1.5 2.6L6.6 10.5a7.8 7.8 0 0 0 0 3l-1.45 1.12 1.5 2.6 1.75-.6a7.8 7.8 0 0 0 2.6 1.5L11.3 20h3.4l.3-1.88a7.8 7.8 0 0 0 2.6-1.5l1.75.6 1.5-2.6L19.4 13.5Z"/></svg></button></nav>';
  function sync(){
    let settings={};try{settings=JSON.parse(localStorage.getItem("moonstone-settings")||"{}")}catch(e){}
    const pos=["left","right","bottom"].includes(settings.dockPosition)?settings.dockPosition:"left";
    document.body.classList.remove("dock-left","dock-right","dock-bottom");
    document.body.classList.add("dock-"+pos);
    document.body.classList.toggle("dock-span-full",settings.dockSpan==="full");
  }
  sync();
  addEventListener("storage",e=>{if(e.key==="moonstone-settings")sync()});
  addEventListener("focus",sync);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});
})();