
const socket=io();let roomCode=null,role=null,latest=null,playerTeam=null,answered=false;
const $=id=>document.getElementById(id);
const names=["🔴 Kırmızı","🔵 Mavi","🟡 Sarı","🟢 Yeşil","🟠 Turuncu","🟣 Mor"];
function show(id){["home","teacher","student"].forEach(x=>$(x).classList.toggle("hidden",x!==id));}
function toast(msg){$("toast").textContent=msg;$("toast").classList.remove("hidden");setTimeout(()=>$("toast").classList.add("hidden"),2600)}
function act(action,team){socket.emit("teacher:action",{action,team});}
$("createRoom").onclick=()=>socket.emit("teacher:create",{},res=>{if(!res?.ok)return;role="teacher";roomCode=res.code;$("roomCode").textContent=roomCode;const link=location.origin+"/?join="+roomCode;$("shareLink").value=link;$("qrcode").innerHTML="";new QRCode($("qrcode"),{text:link,width:144,height:144,colorDark:"#29234e",colorLight:"#ffffff"});show("teacher");render(res.state);});
$("showJoin").onclick=()=>{$("joinBox").classList.toggle("hidden");const q=new URLSearchParams(location.search).get("join");if(q)$("joinCode").value=q;};
$("joinRoom").onclick=()=>{const data={code:$("joinCode").value.trim(),name:$("studentName").value.trim(),team:$("studentTeam").value};socket.emit("student:join",data,res=>{if(!res?.ok){$("joinError").textContent=res?.error||"Katılım başarısız.";return;}role="student";playerTeam=Number(data.team);$("welcome").textContent=data.name+", hoş geldin!";$("studentTeamBadge").textContent=names[playerTeam]+" Takım";show("student");render(res.state);});};
$("copyLink").onclick=async()=>{try{await navigator.clipboard.writeText($("shareLink").value);toast("Katılım bağlantısı kopyalandı.");}catch(e){$("shareLink").select();document.execCommand("copy");toast("Bağlantı kopyalandı.");}};
$("startBtn").onclick=()=>act("start");$("pauseBtn").onclick=()=>act("pause");$("resumeBtn").onclick=()=>act("resume");$("nextBtn").onclick=()=>act("next");$("prevBtn").onclick=()=>act("prev");$("resetBtn").onclick=()=>{if(confirm("Puanlar ve ilerleme sıfırlansın mı?"))act("reset");};
socket.on("state",render);socket.on("room:closed",()=>{toast("Öğretmen oturumu kapattı.");setTimeout(()=>location.href="/",1800);});
function render(s){latest=s;if(!s)return;if(role==="teacher")renderTeacher(s);if(role==="student")renderStudent(s);}
function mazeHTML(teamData,highlight){let tiles=["🚩","","🧩","","⭐","","🧩","","🏆","", "🟩","🟩","","🟩","🟩","","🟩","", "","🟩","","🟩","","🟩","","🟩","", "🟩","🟩","🟩","","🟩","🟩","🟩","🟩",""];return tiles.map((t,i)=>{let marks=teamData.filter(x=>x.progress===i+1).map(x=>["🔴","🔵","🟡","🟢","🟠","🟣"][x.id]);let cls=(t==="🏆"?"finish":t==="🟩"?"path":"");return `<div class="tile ${cls}">${marks.length?marks.join(""):t}</div>`}).join("");}
function renderMaze(el,s){const data=s.teams.map((t,i)=>({...t,id:i}));el.innerHTML=mazeHTML(data);}
function renderTeacher(s){
 $("teacherStatus").textContent=s.paused?(s.started?"Oyun duraklatıldı.":"Oyun beklemede."):"Oyun devam ediyor.";
 $("questionCount").textContent=s.current<0?"Henüz başlamadı":s.current>=18?"Oyun tamamlandı":`${s.current+1} / 18. Soru`;
 renderMaze($("maze"),s);
 $("teamBoard").innerHTML=s.teams.map((t,i)=>`<div class="team"><strong>${names[i]} Takım</strong><small>${t.members} öğrenci • ${t.score} puan</small><div class="bar"><span style="width:${Math.min(100,t.progress/18*100)}%"></span></div><small>Labirent: ${t.progress}/18</small><div><button class="primary" onclick="approve(${i})">Görevi onayla +10</button><button class="danger" onclick="penalty(${i})">-5 puan</button></div></div>`).join("");
 const box=$("teacherQuestion");
 if(s.current<0){box.innerHTML="<div class='eyebrow'>GÖREV EKRANI</div><h2>Oyun başlamayı bekliyor</h2><p>Başlat düğmesine bastığında ilk soru burada görünecek.</p>";}
 else if(s.current>=18){box.innerHTML="<div class='eyebrow'>MACERA TAMAMLANDI</div><h2>🏆 Hazine bulundu!</h2><p>Takım puanlarını aşağıdan inceleyebilirsin.</p>";}
 else {const q=s.question;box.innerHTML=`<div class="eyebrow">${q.level.toUpperCase()} • ${q.index+1}. SORU • ${q.seconds} SANİYE</div><h2>${q.text}</h2><div class="options">${q.options.map((o,i)=>`<div class="option" style="padding:16px;border-radius:12px;font-weight:800">${["A","B","C"][i]}) ${o}</div>`).join("")}</div><div class="taskbox"><b>🏃 Fiziksel görev:</b> ${q.task}<br><b>🎯 Desteklenen beceriler:</b> ${q.skill}</div><p class="muted">Öğrenci cevapları geldikçe takım puanları otomatik güncellenir. Fiziksel görevi öğretmen gözlemleyip ayrıca onaylayabilir.</p>`;}
}
window.approve=i=>act("approve",i);window.penalty=i=>act("penalty",i);
function renderStudent(s){
 const t=s.teams[playerTeam];$("studentProgress").textContent=`${t.progress} / 18`;renderMaze($("studentMaze"),s);
 $("studentScores").innerHTML=s.teams.map((x,i)=>`<div class="team"><strong>${names[i]} Takım</strong><small>${x.score} puan</small><div class="bar"><span style="width:${Math.min(100,x.progress/18*100)}%"></span></div></div>`).join("");
 const box=$("studentQuestion");
 if(!s.started||s.current<0){box.innerHTML="<h2>Öğretmenin oyunu başlatmasını bekle!</h2><p>Hazır olduğunda görevler burada görünecek.</p>";return;}
 if(s.paused){box.innerHTML="<h2>⏸ Oyun duraklatıldı</h2><p>Öğretmenin devam etmesini bekle.</p>";return;}
 if(s.current>=18){box.innerHTML="<h2>🏆 Macera tamamlandı!</h2><p>Takımını tebrik ederiz.</p>";return;}
 const q=s.question;const submitted=(s.answerSummary||[]).some(a=>a.question===s.current&&a.socketId===socket.id);
 box.innerHTML=`<div class="eyebrow">${q.level.toUpperCase()} • ${q.index+1}. GÖREV • ${q.seconds} SANİYE</div><h2>${q.text}</h2><div class="options">${q.options.map((o,i)=>`<button class="option" ${submitted?"disabled":""} onclick="sendAnswer(${i})">${["A","B","C"][i]}) ${o}</button>`).join("")}</div><div class="taskbox"><b>🏃 Fiziksel görev:</b> ${q.task}<br><b>🎯 Beceriler:</b> ${q.skill}</div><p class="muted">${submitted?"Cevabın alındı. Öğretmeninin yönlendirmesini bekle.":"Takımınla düşün ve cevabını seç."}</p>`;
}
window.sendAnswer=i=>socket.emit("student:answer",{choice:i},res=>{if(res?.ok)toast("Cevabın alındı!");else toast(res?.error||"Cevap gönderilemedi.");});
