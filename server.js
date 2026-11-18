
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
const teams = ["Kırmızı Takım","Mavi Takım","Sarı Takım","Yeşil Takım","Turuncu Takım","Mor Takım"];

const questions = [
 {text:"Bir hareket dizisi yapacaksın: Önce zıpla, sonra ellerini kaldır, en son çömel. İlk olarak ne yapmalısın?", options:["Çömelmek","Zıplamak","Dönmek"], correct:1, level:"Kolay", seconds:30, task:"Hareket dizisini sırayla uygula.", skill:"Hareket hafızası, sıralama, dikkat ve koordinasyon."},
 {text:"Sağ elini kaldırdığında diğer elin hangisidir?", options:["Sol el","Sağ el","İki el"], correct:0, level:"Kolay", seconds:20, task:"Sağ ve sol elini sırayla kaldır.", skill:"Sağ-sol kavramı, beden farkındalığı ve yön algısı."},
 {text:"Öğretmenin üç kez alkışlıyor. Sen de aynı sayıda alkışlamalısın. Kaç kez alkışlayacaksın?", options:["2","4","3"], correct:2, level:"Kolay", seconds:20, task:"Üç kez alkışla.", skill:"İşitsel dikkat, sayma ve taklit."},
 {text:"Bir çizginin üzerinde yürürken dengeni korumak için ne yapmalısın?", options:["Kontrolsüz koşmak","Kontrollü adımlar atmak","Gözlerini kapatmak"], correct:1, level:"Kolay", seconds:30, task:"Çizgi üzerinde dengeli yürü.", skill:"Denge, dikkat ve vücut kontrolü."},
 {text:"Labirentte 2 adım ileri, 1 adım sağa gitmelisin. İlk hareketin nedir?", options:["Sağa gitmek","İleri gitmek","Geri gitmek"], correct:1, level:"Orta", seconds:30, task:"İleri ve sağa doğru adım at.", skill:"Yön bulma, sıralama ve hareket planlama."},
 {text:"Top sana doğru geliyor. Yakalamak için ne yapmalısın?", options:["Ellerini hazırlamalısın","Arkana dönmelisin","Gözlerini kapatmalısın"], correct:0, level:"Orta", seconds:30, task:"Yumuşak topu güvenli şekilde yakala.", skill:"El-göz koordinasyonu, tepki süresi ve dikkat."},
 {text:"Üç koni var: kırmızı, mavi ve sarı. Öğretmen önce mavi, sonra kırmızı diyor. İlk hangi koniye gitmelisin?", options:["Sarı","Kırmızı","Mavi"], correct:2, level:"Orta", seconds:30, task:"Önce mavi koniye ilerle.", skill:"Görsel dikkat, hafıza ve yön bulma."},
 {text:"Bir arkadaşınla top taşıyorsun. Topun düşmemesi için ne yapmalısın?", options:["Birlikte hareket etmelisin","Hızla çekmelisin","Arkadaşını bırakmalısın"], correct:0, level:"Orta", seconds:30, task:"Bir arkadaşınla topu birlikte taşı.", skill:"İş birliği, koordinasyon ve iletişim."},
 {text:"Tek ayak üzerinde dururken dengeni korumak için kollarını nasıl kullanmalısın?", options:["Yanlara açmalısın","Arkana saklamalısın","Sürekli sallamalısın"], correct:0, level:"Orta", seconds:30, task:"Tek ayak üzerinde 5 saniye dur.", skill:"Statik denge, beden kontrolü ve koordinasyon."},
 {text:"Topu hedefe attın ama hedefin önüne düştü. Bir sonraki atışta ne yapmalısın?", options:["Daha az kuvvet uygulamalısın","Biraz daha fazla kuvvet uygulamalısın","Hedefe bakmadan atmalısın"], correct:1, level:"Orta", seconds:40, task:"Topu belirlenen hedefe kontrollü şekilde at.", skill:"Kuvvet ayarlama, el-göz koordinasyonu ve hedefleme."},
 {text:"Önünde üç koni var. Konilerin arasından geçerken ne yapmalısın?", options:["Kontrolsüz koşmalısın","Yönünü kontrol ederek ilerlemelisin","Konileri devirmelisin"], correct:1, level:"Orta", seconds:40, task:"Konilerin arasından slalom yaparak geç.", skill:"Çeviklik, yön değiştirme ve vücut kontrolü."},
 {text:"Bir topu önce sağ elinle, sonra sol elinle yere sektirmen isteniyor. Ne yapmalısın?", options:["Sadece sağ elimle sektirmeliyim","İki elimle sırayla sektirmeliyim","Topu hiç sektirmemeliyim"], correct:1, level:"Orta", seconds:40, task:"Topu iki elinle sırayla sektir.", skill:"Çift taraflı koordinasyon, ritim ve motor kontrol."},
 {text:"Arkadaşına top atarken top çok sert gidiyor. Bir sonraki atışta ne yapmalısın?", options:["Daha yumuşak atmalısın","Daha sert atmalısın","Gözlerini kapatmalısın"], correct:0, level:"Orta", seconds:30, task:"Arkadaşına kontrollü şekilde top at.", skill:"Kuvvet kontrolü, koordinasyon ve hareket farkındalığı."},
 {text:"Önce sağa, sonra sola, en son tekrar sağa dönüyorsun. Kaç kez yön değiştirirsin?", options:["2","3","4"], correct:1, level:"Orta", seconds:30, task:"Sağ-sol-sağ yönlerinde hareket et.", skill:"Yön algısı, sayma ve hareket sıralaması."},
 {text:"Arkadaşın denge çizgisinde yürürken zorlanıyor. Ne yapmalısın?", options:["Onunla dalga geçmelisin","Onu acele ettirmelisin","Ona destek olmalısın"], correct:2, level:"Orta", seconds:30, task:"Arkadaşına güvenli şekilde eşlik et.", skill:"İş birliği, sosyal beceri ve denge."},
 {text:"Bir topu hedefe atmadan önce ne yapmalısın?", options:["Hedefe bakmalısın","Arkana dönmelisin","Gözlerini kapatmalısın"], correct:0, level:"Orta", seconds:30, task:"Hedefe odaklanarak atış yap.", skill:"Görsel dikkat, odaklanma ve hedefleme."},
 {text:"Labirentin sonunda hazine var. Önce mavi koniye gitmen, sonra denge çizgisinden geçmen, en son hedefe top atman gerekiyor. Hangi sırayı izlemelisin?", options:["Hedefe at – denge çizgisi – mavi koni","Mavi koni – denge çizgisi – hedefe at","Denge çizgisi – hedefe at – mavi koni"], correct:1, level:"Yıldız", seconds:75, task:"Üç aşamayı belirtilen sırayla tamamla.", skill:"Sıralama, hareket planlama, denge ve hedefleme."},
 {text:"Takımın çıkış kapısına ulaşmak istiyor. Önünde bir engel, bir denge çizgisi ve bir hedef var. Hem güvenli hem doğru ilerlemek için ne yapmalısın?", options:["Engelin üzerinden kontrolsüz atlamalısın","Hedefe bakmadan top atmalısın","Engelin etrafından geçip dengeni korumalı ve hedefe dikkatlice atış yapmalısın"], correct:2, level:"Yıldız", seconds:75, task:"Engelin etrafından geç, denge çizgisini tamamla ve hedefe kontrollü atış yap.", skill:"Problem çözme, karar verme, denge, koordinasyon ve takım çalışması."}
];

function publicState(room) {
 return {
  code: room.code, started: room.started, paused: room.paused, current: room.current,
  question: room.current >= 0 ? (() => { const q=questions[room.current]; return {text:q.text,options:q.options,level:q.level,seconds:q.seconds,task:q.task,skill:q.skill,index:room.current}; })() : null,
  teams: teams.map((name,i)=>({name, score:room.scores[i], progress:room.progress[i], members:room.players.filter(p=>p.team===i).length})),
  players: room.players.map(p=>({name:p.name,team:p.team})),
  answerSummary: room.answers.map(a=>({name:a.name,team:a.team,question:a.question,correct:a.correct,socketId:a.socketId}))
 };
}
function emitRoom(room){ io.to(room.code).emit("state", publicState(room)); }
function makeCode(){ return crypto.randomBytes(3).toString("hex").toUpperCase(); }

io.on("connection", socket => {
 socket.on("teacher:create", (_, cb) => {
  let code=makeCode(); while(rooms.has(code)) code=makeCode();
  const room={code,teacher:socket.id,players:[],started:false,paused:true,current:-1,scores:[0,0,0,0,0,0],progress:[0,0,0,0,0,0],answers:[]};
  rooms.set(code,room); socket.join(code); socket.data={room:code,role:"teacher"};
  cb && cb({ok:true,code,state:publicState(room)});
 });
 socket.on("student:join",(data,cb)=>{
  const code=String(data.code||"").toUpperCase(), room=rooms.get(code);
  if(!room) return cb&&cb({ok:false,error:"Oda kodu bulunamadı."});
  const name=String(data.name||"").trim().slice(0,20);
  const team=Number(data.team);
  if(!name || !Number.isInteger(team)||team<0||team>5) return cb&&cb({ok:false,error:"Adını ve takımını seç."});
  if(room.players.some(p=>p.socketId===socket.id)) return;
  room.players.push({socketId:socket.id,name,team}); socket.join(code); socket.data={room:code,role:"student"};
  cb&&cb({ok:true,state:publicState(room)}); emitRoom(room);
 });
 socket.on("teacher:action",(data)=>{
  const room=rooms.get(socket.data?.room);
  if(!room || room.teacher!==socket.id) return;
  if(data.action==="start"){room.started=true;room.paused=false;if(room.current<0)room.current=0;}
  if(data.action==="pause") room.paused=true;
  if(data.action==="resume") room.paused=false;
  if(data.action==="next"){if(room.current<questions.length-1){room.current++;room.paused=true;room.answers=[];}else{room.started=false;room.paused=true;room.current=questions.length;}}
  if(data.action==="prev"){room.current=Math.max(0,room.current-1);room.paused=true;room.answers=[];}
  if(data.action==="reset"){room.started=false;room.paused=true;room.current=-1;room.scores=[0,0,0,0,0,0];room.progress=[0,0,0,0,0,0];room.answers=[];}
  if(data.action==="approve"){const team=Number(data.team);if(team>=0&&team<6){room.scores[team]+=10;room.progress[team]=Math.min(18,room.progress[team]+1);}}
  if(data.action==="penalty"){const team=Number(data.team);if(team>=0&&team<6)room.scores[team]=Math.max(0,room.scores[team]-5);}
  emitRoom(room);
 });
 socket.on("student:answer",(data,cb)=>{
  const room=rooms.get(socket.data?.room); if(!room||socket.data?.role!=="student")return;
  const player=room.players.find(p=>p.socketId===socket.id);
  if(!player||room.paused||!room.started||room.current<0||room.current>=questions.length)return;
  const q=questions[room.current], choice=Number(data.choice);
  if(!Number.isInteger(choice)||choice<0||choice>2)return;
  const already=room.answers.some(a=>a.socketId===socket.id&&a.question===room.current);
  if(already)return cb&&cb({ok:false,error:"Bu soru için cevabın zaten alındı."});
  const correct=choice===q.correct;
  room.answers.push({socketId:socket.id,name:player.name,team:player.team,question:room.current,correct});
  if(correct){room.scores[player.team]+=10;room.progress[player.team]=Math.min(18,room.progress[player.team]+1);}
  cb&&cb({ok:true,correct}); emitRoom(room);
 });
 socket.on("disconnect",()=>{
  const room=rooms.get(socket.data?.room); if(!room)return;
  if(room.teacher===socket.id){io.to(room.code).emit("room:closed");rooms.delete(room.code);}
  else {room.players=room.players.filter(p=>p.socketId!==socket.id);emitRoom(room);}
 });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log("Sporun Zeka Takimi running on "+PORT));
