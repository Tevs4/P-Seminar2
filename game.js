// ===== Party Map =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 960
const H = canvas.height;  // 600

const TILE = 40;
const COLORS = ["#ff2fa3", "#2ff3ff", "#ffd400", "#8a4dff"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Bereiche der Map (später für Kollisionen nutzbar)
const MAP = {
  djStage:   { x: 320, y: 20,  w: 320, h: 90 },
  bar:       { x: 780, y: 140, w: 160, h: 300 },
  danceFloor:{ x: 200, y: 160, w: 520, h: 320 },
  tables: [
    { x: 40, y: 170, r: 28 },
    { x: 40, y: 290, r: 28 },
    { x: 40, y: 410, r: 28 },
  ],
  speakers: [
    { x: 250, y: 30, w: 50, h: 80 },
    { x: 660, y: 30, w: 50, h: 80 },
  ],
};

// Konfetti
const confetti = Array.from({ length: 70 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  s: 3 + Math.random() * 4,
  v: 30 + Math.random() * 50,
  c: COLORS[Math.floor(Math.random() * COLORS.length)],
  p: Math.random() * Math.PI * 2,
}));

function drawBackground() {
  ctx.fillStyle = "#150f33";
  ctx.fillRect(0, 0, W, H);
  // Dielenboden
  for (let y = 0; y < H; y += TILE) {
    for (let x = 0; x < W; x += TILE) {
      ctx.fillStyle = (x / TILE + y / TILE) % 2 ? "#1a1340" : "#171038";
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
}

function drawDanceFloor(t) {
  const f = MAP.danceFloor;
  for (let y = f.y; y < f.y + f.h; y += TILE) {
    for (let x = f.x; x < f.x + f.w; x += TILE) {
      const i = (x - f.x) / TILE;
      const j = (y - f.y) / TILE;
      const idx = Math.floor(t * 1.5 + i + j) % COLORS.length;
      const pulse = 0.55 + 0.35 * Math.sin(t * 4 + i * 0.7 + j * 0.9);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = COLORS[idx];
      ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(f.x, f.y, f.w, f.h);
}

function drawDJ() {
  const s = MAP.djStage;
  ctx.fillStyle = "#2a1b55";
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = "#0d0a1f";
  ctx.fillRect(s.x + 40, s.y + 25, s.w - 80, 40);
  // Plattenteller
  for (const dx of [70, s.w - 70]) {
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(s.x + dx, s.y + 45, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff2fa3";
    ctx.beginPath(); ctx.arc(s.x + dx, s.y + 45, 4, 0, Math.PI * 2); ctx.fill();
  }
  for (const sp of MAP.speakers) {
    ctx.fillStyle = "#111";
    ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
    ctx.strokeStyle = "#2ff3ff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sp.x + sp.w / 2, sp.y + 28, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(sp.x + sp.w / 2, sp.y + 58, 9, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawBar() {
  const b = MAP.bar;
  ctx.fillStyle = "#3b2477";
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = "#ffd400";
  ctx.fillRect(b.x, b.y, 8, b.h);
  // Gläser
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fillRect(b.x + 40, b.y + 25 + i * 45, 18, 26);
  }
  // Barhocker
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#ff2fa3";
    ctx.beginPath(); ctx.arc(b.x - 25, b.y + 40 + i * 75, 14, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTables() {
  for (const t of MAP.tables) {
    ctx.fillStyle = "#4a2d99";
    ctx.beginPath(); ctx.arc(t.x + t.r, t.y, t.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2ff3ff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd400";
    ctx.beginPath(); ctx.arc(t.x + t.r, t.y, 6, 0, Math.PI * 2); ctx.fill();
  }
}

function drawLights(t) {
  // Disco-Kugel
  const bx = W / 2, by = 135;
  const r = 22;
  ctx.fillStyle = "#c9d6ff";
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#7a8bd6";
  ctx.lineWidth = 1;
  for (let a = -2; a <= 2; a++) {
    ctx.beginPath(); ctx.moveTo(bx + a * 8, by - r); ctx.lineTo(bx + a * 8, by + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - r, by + a * 8); ctx.lineTo(bx + r, by + a * 8); ctx.stroke();
  }
  // Lichtstrahlen
  ctx.globalCompositeOperation = "lighter";
  for (let k = 0; k < 4; k++) {
    const ang = Math.PI / 2 + Math.sin(t * 1.2 + k * 1.7) * 0.9;
    const len = 380;
    const spread = 0.12;
    ctx.fillStyle = COLORS[k] + "33";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(ang - spread) * len, by + Math.sin(ang - spread) * len);
    ctx.lineTo(bx + Math.cos(ang + spread) * len, by + Math.sin(ang + spread) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawConfetti(t, dt) {
  for (const c of confetti) {
    if (!reduceMotion) {
      c.y += c.v * dt;
      c.x += Math.sin(t + c.p) * 15 * dt;
      if (c.y > H) { c.y = -10; c.x = Math.random() * W; }
    }
    ctx.fillStyle = c.c;
    ctx.fillRect(c.x, c.y, c.s, c.s * 0.6);
  }
}

let last = 0;
function loop(ms) {
  const t = ms / 1000;
  const dt = Math.min(t - last, 0.05);
  last = t;
  const time = reduceMotion ? 0 : t;

  drawBackground();
  drawTables();
  drawDanceFloor(time);
  drawDJ();
  drawBar();
  drawLights(time);
  drawConfetti(t, dt);

  requestAnimationFrame(loop);
}

// ===== Cäsar-Rätsel =====
// Die Nachricht wurde um SHIFT Buchstaben im Alphabet verschoben.
const SHIFT = 3;
const CIPHER_TEXT = "ZLU IHLHUQ KHXWH";   // Lösung: WIR FEIERN HEUTE

function caesar(text, shift) {
  return text.toUpperCase().replace(/[A-Z]/g, (ch) =>
    String.fromCharCode(((ch.charCodeAt(0) - 65 + shift + 26) % 26) + 65)
  );
}

function normalize(text) {
  return text.toUpperCase().replace(/\s+/g, " ").trim();
}

const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const answer = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const cipherEl = document.getElementById("cipher");
let attempts = 0;

cipherEl.textContent = CIPHER_TEXT;

function unlock() {
  feedback.className = "feedback ok";
  feedback.textContent = "Richtig! Die Tür geht auf …";
  setTimeout(() => {
    gate.hidden = true;
    canvas.hidden = false;
    document.getElementById("quest").hidden = false;
    requestAnimationFrame(loop);
  }, 800);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const solution = caesar(CIPHER_TEXT, -SHIFT);

  if (normalize(answer.value) === solution) {
    unlock();
    return;
  }

  attempts++;
  feedback.className = "feedback error";
  feedback.textContent = "Das stimmt noch nicht.";
  if (attempts >= 3) {
    feedback.textContent += " Tipp: Jeder Buchstabe wurde im Alphabet um dieselbe Anzahl Stellen verschoben.";
  }
  gate.classList.remove("shake");
  void gate.offsetWidth;          // Animation neu starten
  gate.classList.add("shake");
  answer.select();
});
const LEVELS=[
{type:'gap',title:'Klasse & Objekt',secret:'SECHSHUNDERTSIEBEN',answers:['class','String','int', 'String', 'extends', 'super', 'personenId','extends', 'HELFER','super', 'println','maxTeilnehmer', 'getAnzahl','boolean','for','if'],
pos:[1,1,2,1,[1,4],2,10,3,1,1,4,12,8,[1,5],3,1],
order:[2,5,1,10,4,14,7,3,8,6,17,9,11,18,13,15,16,12],
 hints:['Es handelt sich hier um Java und um Vererbung, am Ende das Lösungswort = Code.'],
 code:`public ___ Person {
 proteced ___ name;
 protected ___ PersonenId;
 public Person(String name, int id) {
      this.name = name;
      this.PersonenId = PersonenId;
}
      public ___  getName() {
      return name;
}
      public void setName(String name) {
      this.name = name;
}
      public int getPersonenId() {
      return PersonenId;
} 
}
//Gast erbt von Person
public class Gast ___ Person {
    public Gast(String name, int PersonenId) {
        ___(name, ___);
    }
}

//Helfer erbt ebenfalls von Person
public class Helfer ___ Person {
    public ___(String name, int PersonenId, String aufgabe) {
        ___(name, PersonenId);
        this.aufgabe = aufgabe;
    }
    public String getAufgabe() {
        return aufgabe;
    } 
    public void setAufgabe(String aufgabe) {
        this.aufgabe = aufgabe;
    } 
    public void aufgabeAnzeigen(){
        System.out.___(name + " übernimmt " + aufgabe);}
}
public class Aktivitaet{
  private int PersonenId;
  public Gast[] teilnehmer;
  private int Anzahl; 

  public Aktivitaet(int PersonenId, int maxTeilnehmer) {
    this.PersonenId = PersonenId;
    this.teilnehmer = new Gast[___];
    this.Anzahl = 0;
    }
public int ___(){
  return Anzahl;
}
public ___ istTeilnehmer(Gast g) {
  ___ (i = 0; i < Anzahl; i++) {
    ___(teilnehmer[i] == g) {   
   return true;
    }
  }
  return false;
}`
},

{type:'game',title:'3D-Zielwurf'},
{type:'gap',title:'Schleifen',secret:'FEW',answers:['for','else','while'],
 hints:['Zählschleife','Alternative zu if','Schleife mit Bedingung am Anfang'],
 code:`int summe = 0;
___ (int i = 1; i <= 4; i++) {
    if (i % 2 == 0) {
        summe += i;
    } ___ {
        summe -= 1;
    }
}
___ (summe > 0) {
    summe--;
}`},
{type:'gap',title:'Kapselung',secret:'POT',answers:['private','Object','this'],
 hints:['Nur innerhalb der Klasse sichtbar','Oberklasse aller Klassen','Verweis auf das aktuelle Objekt'],
 code:`public class Hund {
    ___ String name;
    public static void main(String[] a) {
        ___ o = new Hund();
    }
    void setName(String name) {
        ___.name = name;
    }
}`}
];
const P=[[80,80],[310,230],[90,400],[300,560]];
const SEG=['M80 80C80 160 310 150 310 230','M310 230C310 310 90 320 90 400','M90 400C90 480 300 470 300 560'];
let unlocked=1;const done={};let cleanup=null;
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function renderMap(){
  let h=SEG.map((d,i)=>`<path class="seg ${done[i+1]?'done':''}" d="${d}"/>`).join('');
  P.forEach(([x,y],i)=>{
    const n=i+1,st=done[n]?'done':n<=unlocked?'open':'locked';
    h+=`<g class="node ${st}" data-n="${n}"><circle cx="${x}" cy="${y}" r="30"/>
    <text class="n" x="${x}" y="${y}">${st==='done'?'✓':st==='locked'?'🔒':n}</text>
    <text class="l" x="${x}" y="${y+50}">${LEVELS[i].title}</text></g>`;
  });
  $('map').innerHTML=h;
  $('map').querySelectorAll('.node').forEach(g=>g.onclick=()=>{const n=+g.dataset.n;if(n<=unlocked)openLevel(n)});
  $('win').style.display=LEVELS.every((_,i)=>done[i+1])?'block':'none';
}
function complete(n){done[n]=true;unlocked=Math.max(unlocked,n+1);renderMap()}
function closeModal(){if(cleanup){cleanup();cleanup=null}$('modal').style.display='none'}
function openLevel(n){
  const L=LEVELS[n-1];
  $('card').innerHTML=`<button class="close" aria-label="Schließen">×</button><h2>Level ${n} · ${L.title}</h2><div id="body"></div>`;
  $('card').querySelector('.close').onclick=closeModal;
  $('modal').style.display='block';
  (L.type==='gap'?gapTask:gameTask)(n,L,$('body'));
}

function gapTask(n,L,el){
  const parts=L.code.split('___');
  const posOf=i=>[].concat(L.pos?L.pos[i]:1);
  let html='<p>Fülle die Lücken. Die <b>Anfangsbuchstaben</b> der richtigen Wörter ergeben den Code für das nächste Level.</p><pre>';
  parts.forEach((p,i)=>{html+=esc(p);if(i<L.answers.length)html+=`<input data-i="${i}" size="${L.answers[i].length+2}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lücke ${i+1}">`});
  html+='</pre>'+L.hints.map((h,i)=> `<div class="hint">Lücke ${i+1}: ${h}</div>`).join('')+
    `<button class="b" id="chk">Prüfen</button><div class="letters" id="let"> ${L.answers.map((_,i)=>'_'.repeat(posOf(i).length)).join(' ')}</div>
  <div class="letters" id="sol"></div>
  <p>Code: <input class="codein" id="cin" maxlength="${L.secret.length}" autocomplete="off"> <button class="b" id="unl">Freischalten</button></p><div class="msg" id="msg"></div>`;
  el.innerHTML=html;
  const ins=[...el.querySelectorAll('pre input')];
  
  $('chk').onclick=()=>{
    let letters=[],all=true;
    ins.forEach((inp,i)=>{
      const ok=inp.value.trim().toLowerCase()===L.answers[i].toLowerCase();
     inp.className=ok?'ok':'bad';
    letters.push(ok?posOf(i).map(p=>L.answers[i][p-1].toUpperCase()).join(''):'_'.repeat(posOf(i).length));
    if(!ok)all=false;
    });
    $('let').textContent=letters.join(' ');
    if(all&&L.order){
  const flat=letters.join('').split('');
  $('sol').textContent='Lösungswort: '+L.order.map(k=>flat[k-1]).join('');
}else $('sol').textContent='';
    $('msg').className='msg '+(all?'ok':'bad');
    $('msg').textContent=all?'Alle Lücken stimmen! Gib jetzt den Code ein.':'Noch nicht ganz – rote Felder prüfen.';
  };
  $('unl').onclick=()=>{
    if($('cin').value.trim().toUpperCase()===L.secret){
      $('msg').className='msg ok';$('msg').textContent='✔ Code richtig – nächstes Level freigeschaltet!';
      complete(n);setTimeout(closeModal,1200);
    }else{$('msg').className='msg bad';$('msg').textContent='Falscher Code.'}
  };
}

function gameTask(n,L,el){
  el.innerHTML=`<p>Wirf das Geschenk auf den Geburtstagstisch! Stelle Richtung, Winkel und Kraft ein.</p><div id="gbox"></div>
  <div class="ctl"><label>Richtung</label><input type="range" id="yaw" min="-30" max="30" value="0"><span id="yawv">0°</span></div>
  <div class="ctl"><label>Winkel</label><input type="range" id="pit" min="10" max="70" value="40"><span id="pitv">40°</span></div>
  <div class="ctl"><label>Kraft</label><input type="range" id="pow" min="8" max="28" value="18"><span id="powv">18</span></div>
  <button class="b" id="thr">Werfen 🎁</button><button class="b alt" id="rst">Zurücksetzen</button><div class="msg" id="msg"></div>`;
  const PAL=[0xff2fa3,0x2ff3ff,0xffd400,0x8a4dff];
  const box=$('gbox'),W=box.clientWidth,H=300;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x150f33);scene.fog=new THREE.Fog(0x150f33,45,120);
  const cam=new THREE.PerspectiveCamera(55,W/H,.1,200);cam.position.set(0,3.5,10);cam.lookAt(0,1,-14);
  const ren=new THREE.WebGLRenderer({antialias:true});ren.setSize(W,H);box.appendChild(ren.domElement);

  // Licht
  scene.add(new THREE.AmbientLight(0xffffff,.85));
  const p1=new THREE.PointLight(0xff2fa3,1.2,70),p2=new THREE.PointLight(0x2ff3ff,1.2,70);scene.add(p1,p2);

  // Dielenboden wie auf der Party Map
  const fc=document.createElement('canvas');fc.width=fc.height=64;const f=fc.getContext('2d');
  f.fillStyle='#2a1b55';f.fillRect(0,0,64,64);f.fillStyle='#1f1548';f.fillRect(0,0,32,32);f.fillRect(32,32,32,32);
  const tex=new THREE.CanvasTexture(fc);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(40,70);tex.magFilter=THREE.NearestFilter;
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,140),new THREE.MeshLambertMaterial({map:tex}));
  gnd.rotation.x=-Math.PI/2;scene.add(gnd);

  // Leuchtende Tanzfläche
  const tiles=[],tg=new THREE.PlaneGeometry(1.8,1.8);
  for(let r=0;r<6;r++)for(let c=0;c<8;c++){
    const m=new THREE.Mesh(tg,new THREE.MeshBasicMaterial({color:PAL[0]}));
    m.rotation.x=-Math.PI/2;m.position.set(-7+c*2,.02,-3-r*2);scene.add(m);tiles.push(m);
  }

  // Banner "HAPPY BIRTHDAY"
  const bc=document.createElement('canvas');bc.width=512;bc.height=128;const bx=bc.getContext('2d');
  bx.font='bold 48px sans-serif';bx.textAlign='center';bx.textBaseline='middle';
  bx.shadowColor='#2ff3ff';bx.shadowBlur=16;bx.fillStyle='#ff2fa3';bx.fillText('HAPPY BIRTHDAY',256,64);
  const banner=new THREE.Mesh(new THREE.PlaneGeometry(20,5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(bc),transparent:true}));
  banner.position.set(0,8,-38);scene.add(banner);

  // Disco-Kugel
  const disco=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),new THREE.MeshPhongMaterial({color:0xc9d6ff,flatShading:true,shininess:90}));
  disco.position.set(0,9,-18);scene.add(disco);

  // Luftballons
  const balloons=[];
  [[-9,4,-8,0],[9,5,-12,1],[-12,4.5,-20,2],[12,4,-24,3],[-8,5,-30,1],[8,5.5,-32,0],[-14,4,-4,3],[14,4.5,-6,2]].forEach(([x,y,z,i])=>{
    const b=new THREE.Group();
    const s=new THREE.Mesh(new THREE.SphereGeometry(.8,16,12),new THREE.MeshLambertMaterial({color:PAL[i]}));s.scale.y=1.25;
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,3,4),new THREE.MeshBasicMaterial({color:0xffffff}));st.position.y=-2.2;
    b.add(s,st);b.position.set(x,y,z);b.userData.y0=y;scene.add(b);balloons.push(b);
  });

  // Konfetti
  const N=160,cp=new Float32Array(N*3),cc=new Float32Array(N*3),tmp=new THREE.Color();
  for(let i=0;i<N;i++){
    cp.set([(Math.random()-.5)*40,Math.random()*14,-40+Math.random()*48],i*3);
    tmp.setHex(PAL[i%4]);cc.set([tmp.r,tmp.g,tmp.b],i*3);
  }
  const cg=new THREE.BufferGeometry();
  cg.setAttribute('position',new THREE.BufferAttribute(cp,3));cg.setAttribute('color',new THREE.BufferAttribute(cc,3));
  scene.add(new THREE.Points(cg,new THREE.PointsMaterial({size:.25,vertexColors:true})));

  // Geburtstagstisch (Ziel)
  const R=2,TOP=1.17,GH=.3,LAND=TOP+GH;
  const tx=(Math.random()-.5)*10,tz=-(14+Math.random()*14);
  const mk=(geo,col,y)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col}));m.position.y=y;return m};
  const table=new THREE.Group();
  table.add(mk(new THREE.CylinderGeometry(.25,.35,1.1,12),0x2a1b55,.55));
  table.add(mk(new THREE.CylinderGeometry(R+.1,R+.1,.1,32),0x2ff3ff,1.05));
  table.add(mk(new THREE.CylinderGeometry(R,R,.12,32),0x4a2d99,1.11));
  table.add(mk(new THREE.CylinderGeometry(.45,.45,.3,20),0xff2fa3,TOP+.15));
  table.add(mk(new THREE.CylinderGeometry(.04,.04,.25,8),0xffd400,TOP+.42));
  const flame=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color:0xffa200}));flame.position.y=TOP+.58;table.add(flame);
  table.position.set(tx,0,tz);scene.add(table);

 // Geschenk (statt Ball)
  const start=new THREE.Vector3(0,GH,6);
  const gift=new THREE.Group(),rb=new THREE.MeshLambertMaterial({color:0xffd400});
  gift.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.6),new THREE.MeshLambertMaterial({color:0xff2fa3})));
  gift.add(new THREE.Mesh(new THREE.BoxGeometry(.64,.64,.12),rb));
  gift.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.64,.64),rb));
  const bow=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),rb);bow.position.y=.36;gift.add(bow);
  scene.add(gift);

  // Pfeil (hier beginnt der neue Code)
  const UP = new THREE.Vector3(0,1,0);
  const am = new THREE.MeshBasicMaterial({color:0xffffff, depthTest:false, transparent:true, opacity:.95});
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,1,6).translate(0,.5,0), am);
  const head  = new THREE.Mesh(new THREE.ConeGeometry(.3,.6,8).translate(0,.3,0), am);
  const arrow = new THREE.Group().add(shaft, head);
  [arrow, shaft, head].forEach(o => o.renderOrder = 10);
  scene.add(arrow);

  function setArrow(){
    const d = dir(), len = 1.5 + val().v/6;
    arrow.position.copy(start).addScaledVector(d,.5);
    arrow.quaternion.setFromUnitVectors(UP, d);
    shaft.scale.y = len;
    head.position.y = len;
  }

  // Steuerung
  let vel=null,flying=false,finished=false,raf,t=0;
  const val=()=>({y:+$('yaw').value*Math.PI/180,p:+$('pit').value*Math.PI/180,v:+$('pow').value});
  const dir=()=>{const{y,p}=val();return new THREE.Vector3(Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))};
  function upd(){$('yawv').textContent=$('yaw').value+'°';$('pitv').textContent=$('pit').value+'°';$('powv').textContent=$('pow').value;
    if(!flying&&!finished){setArrow()}}
  ['yaw','pit','pow'].forEach(id=>$(id).oninput=upd);
  function reset(){gift.position.copy(start);gift.rotation.set(0,0,0);flying=false;finished=false;arrow.visible=true;$('msg').textContent='';$('msg').className='msg';upd()}
  $('rst').onclick=reset;
  $('thr').onclick=()=>{if(flying||finished)return;vel=dir().multiplyScalar(val().v);flying=true;arrow.visible=false;$('msg').textContent=''};

  function end(hit){
    flying=false;finished=true;const m=$('msg');
    if(hit){
      gift.position.y=LAND;gift.rotation.set(0,0,0);
      m.className='msg ok';m.textContent='🎁 Das Geschenk liegt auf dem Geburtstagstisch! Nächstes Level freigeschaltet.';
      complete(n);setTimeout(()=>{if(cleanup)closeModal()},1800);
    }else{
      gift.position.y=GH;gift.rotation.set(0,0,0);
      const d=Math.max(0,Math.hypot(gift.position.x-tx,gift.position.z-tz)-R);
      m.className='msg bad';m.textContent='Daneben! Das Geschenk ist '+d.toFixed(1)+' m vom Tisch entfernt. Zurücksetzen und nochmal!';
    }
  }

  const clock=new THREE.Clock();
  function loop(){
    raf=requestAnimationFrame(loop);
    const dt=Math.min(clock.getDelta(),.03);t+=dt;
    // Animationen
    tiles.forEach((m,i)=>m.material.color.setHex(PAL[Math.floor(t*1.5+(i%8)+Math.floor(i/8))%4]));
    disco.rotation.y+=dt*.8;
    p1.position.set(Math.cos(t)*10,6,-12+Math.sin(t)*8);p2.position.set(Math.cos(t+3)*10,6,-12+Math.sin(t+3)*8);
    balloons.forEach((b,i)=>b.position.y=b.userData.y0+Math.sin(t*1.5+i)*.3);
    flame.scale.setScalar(1+Math.sin(t*12)*.2);
    for(let i=0;i<N;i++){cp[i*3+1]-=dt*2;if(cp[i*3+1]<0)cp[i*3+1]=14}
    cg.attributes.position.needsUpdate=true;
    // Flug
    if(flying){
      const prev=gift.position.y;
      vel.y-=9.8*dt;gift.position.addScaledVector(vel,dt);
      gift.rotation.x+=dt*5;gift.rotation.z+=dt*3;
      const d=Math.hypot(gift.position.x-tx,gift.position.z-tz);
      if(vel.y<0&&prev>LAND&&gift.position.y<=LAND&&d<=R)end(true);
      else if(gift.position.y<=GH||gift.position.z<-80)end(false);
    }
    ren.render(scene,cam);
  }
  reset();loop();
  cleanup=()=>{cancelAnimationFrame(raf);ren.dispose()};
}

renderMap();