/* MathLingo HK1: entirely static site; lesson data from data.js */
'use strict';
const D=window.MATHLINGO_DATA;
if(!D){document.getElementById('app').textContent='Không tìm thấy data.js. Hãy đặt data.js cùng thư mục với index.html.';throw Error('Missing data.js')}
const KEY='mathlingo-hk1-progress-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
const st={chapter:0,tab:'vocab',lesson:'all',mode:'vocab',index:0,answered:false,choice:null,flash:0,flipped:false,progress:saved,search:'',globalSearch:''};
const app=document.getElementById('app');
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Preserve complete LaTeX expressions before inserting HTML line breaks.
   KaTeX auto-render cannot read delimiters split across <br> elements. */
function fmt(s){
  const text=String(s??'');
  const latex=/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$)/g;
  let out='',at=0;
  for(const match of text.matchAll(latex)){
    out+=h(text.slice(at,match.index)).replace(/\r?\n/g,'<br>');
    // Keep each whole expression within one text node for KaTeX auto-render.
    out+=h(match[0].replace(/\r?\n/g,' '));
    at=match.index+match[0].length;
  }
  return out+h(text.slice(at)).replace(/\r?\n/g,'<br>');
}
function math(root){if(window.renderMathInElement){try{renderMathInElement(root,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$$',right:'$$',display:true}],throwOnError:false,strict:'ignore'})}catch(e){console.warn('KaTeX error',e)}}}
function record(k,ok){const x=st.progress[k]||{};st.progress[k]={attempts:(x.attempts||0)+1,best:!!(ok||x.best),last:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(st.progress))}catch(e){}}
function stats(){let a=Object.values(st.progress);return {done:a.filter(v=>v.best).length,tried:a.length,tries:a.reduce((n,v)=>n+(v.attempts||0),0)}}
function getChapter(){return D.chapters.find(c=>c.id===st.chapter)}
function lessonOf(id){return getChapter()?.lessons.find(l=>l.id===id)}
function chapterVocab(c){let ids=c.lessons.map(l=>l.id);return D.vocab.filter(v=>ids.includes(v.lesson)&&(st.lesson==='all'||v.lesson===+st.lesson))}
function chapterQuiz(c){const old=D.questions.filter(q=>q.chapter===c.id);if(c.id===2){return D.chapter2.quiz.filter(q=>q.kind!=='meaning')}return old}
function vocabPractice(c){let src=chapterVocab(c);let other=D.vocab.filter(x=>x.vi&&x.en);return src.map((v,i)=>{let distract=other.filter(z=>z.vi!==v.vi).map(z=>z.vi);let opts=[v.vi],start=(i*31+9)%Math.max(1,distract.length);for(let j=0;j<distract.length&&opts.length<4;j++){let candidate=distract[(start+j*7)%distract.length];if(!opts.includes(candidate))opts.push(candidate)}let seed=i%opts.length;opts.push(...opts.splice(0,seed));return {id:'v-'+v.id,kind:'meaning',q:'What is the Vietnamese meaning of “'+v.en+'”?',options:opts,correct:opts.indexOf(v.vi),ex:v.def||''}})}
function qList(){let c=getChapter();if(!c)return [];if(st.mode==='vocab'||st.mode==='flash')return c.id===2?[...D.chapter2.quiz.filter(q=>q.kind==='meaning'),...vocabPractice(c)]:vocabPractice(c);return chapterQuiz(c)}
function overall(){let s=stats();return `<div class="stats"><div class="stat"><strong>${D.chapters.length}</strong><small>Chapters · HK I</small></div><div class="stat"><strong>${D.chapters.reduce((a,c)=>a+c.lessons.length,0)}</strong><small>Lessons · Bài học</small></div><div class="stat"><strong>${D.vocab.length}</strong><small>Vocabulary terms</small></div><div class="stat"><strong>${s.done}</strong><small>Questions mastered · Trả lời đúng</small></div></div>`}
function nav(name,fn,selected){return `<button class="${selected?'active':''}" onclick="${fn}">${name}</button>`}
function head(){return `<header class="header"><a class="logo" href="#" onclick="home();return false"><span class="logoicon">π</span><span>Math<span>Lingo</span></span></a><nav class="navline">${nav('Home','home()',!st.chapter)}${nav('Chapters','goChapters()',st.chapter>0&&st.tab!=='progress')}${nav('🔎 Search words','goGlobalSearch()',st.tab==='globalSearch')}${nav('My progress','goGlobalProgress()',st.tab==='globalProgress')}</nav><span class="topbadge">GRADE 11 · SEMESTER I</span></header>`}
function foot(){return `<footer class="foot"><span>MathLingo © 2026 · Learn Mathematics Through English</span><span id="visitor-count">👁️ Visits: ${D.analyticsCode?'Đang tải…':'Chưa kết nối bộ đếm'}</span></footer>`}
function renderHome(){let chtml=D.chapters.map((c,i)=>`<article class="chaptercard" role="button" tabindex="0" onclick="goChapter(${c.id})" onkeydown="if(event.key==='Enter')goChapter(${c.id})"><div class="n">${String(c.id).padStart(2,'0')}</div><h3>${h(c.en)}</h3><p>${h(c.vi)}</p><div class="line">${c.lessons.length} LESSONS · EXPLORE →</div></article>`).join('');return `<div class="hero"><div><div class="eyebrow">LEARN MATHEMATICS THROUGH ENGLISH</div><h1>Math is a language.<br>Let's learn to speak it.</h1><p>Học Toán lớp 11 bằng tiếng Anh với từ vựng song ngữ, flashcards, bài luyện tập tương tác và những câu chuyện Toán học.</p><button class="btn white" onclick="goChapter(1)">Start learning →</button></div><div class="heroicon">📘</div></div>${overall()}<div class="sectiontitle"><h2 id="chapters">Explore Semester I</h2><small>Based on Toán 11 · Kết nối tri thức · Tập một</small></div><div class="grid">${chtml}</div><div class="sem2"><div><strong>Semester II · Sắp ra mắt</strong><p>Học kỳ II sẽ được bổ sung sau khi hoàn thiện và kiểm tra học kỳ I.</p></div><span class="topbadge">COMING SOON</span></div>`}
function selectedLesson(){let c=getChapter();return `<div class="toolbar"><label for="lesson-sel">Choose lesson / Chọn bài:</label><select id="lesson-sel" class="select" onchange="selectLesson(this.value)"><option value="all">All lessons</option>${c.lessons.map(l=>`<option value="${l.id}" ${String(st.lesson)===String(l.id)?'selected':''}>Lesson ${l.number}: ${h(l.en)}</option>`).join('')}</select></div>`}
function normalizeSearch(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim()}
function visibleVocab(){return chapterVocab(getChapter()).filter(v=>normalizeSearch(v.en+' '+v.vi).includes(normalizeSearch(st.search)))}
function vocabChapter(v){return D.chapters.find(c=>c.lessons.some(l=>l.id===v.lesson))}
function renderGlobalSearch(){
 const term=normalizeSearch(st.globalSearch);
 const found=term?D.vocab.filter(v=>normalizeSearch(v.en+' '+v.vi).includes(term)):[];
 return `<div class="crumb"><button onclick="home()">Home</button> / Search Vocabulary</div><section class="panel"><h1>🔎 Search Vocabulary</h1><p class="small">Tìm từ Toán bằng tiếng Việt hoặc tiếng Anh, không cần gõ dấu. Search all 5 chapters of Semester I.</p><input id="global-word-search" class="input global-word-search" type="search" autocomplete="off" placeholder="Ví dụ: góc lượng giác, cap so cong, sequence, limit..." value="${h(st.globalSearch)}" aria-label="Search English or Vietnamese mathematics vocabulary" oninput="updateGlobalSearch(this.value)"><p class="small">${term?`${found.length} result(s) · Chọn một kết quả để mở flashcard`:'Nhập từ khóa để tìm trong toàn bộ học kỳ I.'}</p><div class="word-results">${found.slice(0,80).map(v=>{const c=vocabChapter(v);return `<button class="word-result" onclick="openSearchedWord(${v.id})"><span><strong>${h(v.en)}</strong><small>${h(v.vi)}</small></span><em>Chapter ${c?.id||'?'} · Flashcard →</em></button>`}).join('')|| (term?'<div class="empty">Không tìm thấy từ phù hợp. Hãy thử từ khác.</div>':'')}</div>${found.length>80?'<p class="small">Hiển thị 80 kết quả đầu tiên; hãy nhập thêm từ để thu hẹp tìm kiếm.</p>':''}</section>`;
}
function updateGlobalSearch(value){st.globalSearch=value;const pos=document.activeElement?.selectionStart;render();const el=document.getElementById('global-word-search');if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(e){}}}
function goGlobalSearch(){st.tab='globalSearch';render();scrollTo(0,0);document.getElementById('global-word-search')?.focus()}
function openSearchedWord(id){const v=D.vocab.find(w=>w.id===id),c=v&&vocabChapter(v);if(!c)return;goChapter(c.id);st.search=v.en;st.flash=0;st.flipped=false;render();document.querySelector('.flash-study')?.scrollIntoView({block:'center',behavior:'smooth'})}

function renderVocab(){
 const list=visibleVocab();
 if(!list.length)return `${selectedLesson()}<div class="toolbar"><input class="input" placeholder="Search English / Tiếng Việt (có hoặc không dấu)..." aria-label="Search vocabulary" value="${h(st.search)}" oninput="searchVocab(this.value)"></div><div class="empty">No vocabulary found. Try another search or lesson.</div>`;
 st.flash=Math.max(0,Math.min(st.flash,list.length-1));
 const w=list[st.flash];
 const phonetic=w.ipa||w.phonetic||w.pronunciation||'';
 return `${selectedLesson()}<section class="flash-study" aria-label="Vocabulary flashcards">
   <div class="toolbar flash-toolbar"><input class="input" placeholder="Search English / Tiếng Việt (có hoặc không dấu)..." aria-label="Search vocabulary" value="${h(st.search)}" oninput="searchVocab(this.value)"><span class="small">${list.length} terms · Card ${st.flash+1} of ${list.length}</span></div>
   <div class="progressline" role="progressbar" aria-label="Flashcards reviewed position" aria-valuenow="${st.flash+1}" aria-valuemin="1" aria-valuemax="${list.length}"><span style="width:${100*(st.flash+1)/list.length}%"></span></div>
   <article class="vocab-flashcard ${st.flipped?'is-flipped':''}" role="button" tabindex="0" aria-label="${st.flipped?'Show English word':'Flip to Vietnamese meaning and example'}" onclick="flipFlash()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();flipFlash()}">
      <div class="flash-side-tag">${st.flipped?'BACK · NGHĨA & VÍ DỤ':'FRONT · ENGLISH'}</div>
      ${st.flipped?`<h3 class="flash-meaning">${h(w.vi)}</h3><div class="flash-en">${h(w.en)}</div>${phonetic?`<div class="flash-ipa">${h(phonetic)}</div>`:''}${w.def?`<div class="flash-def"><strong>Definition</strong><div>${fmt(w.def)}</div></div>`:''}${w.ex?`<div class="flash-example"><strong>Example</strong><div>${fmt(w.ex)}</div></div>`:''}`:`<div class="flash-word">${h(w.en)}</div>${phonetic?`<div class="flash-ipa">${h(phonetic)}</div>`:''}<span class="flash-hint">Nhấn vào thẻ để xem nghĩa, định nghĩa và ví dụ ↻</span>`}
      <span class="flash-flipmark" aria-hidden="true">⟳</span>
   </article>
   <div class="flashcontrols flash-nav"><button class="btn outline" onclick="nextFlash(-1)" ${st.flash===0?'disabled':''}>← Previous</button><button class="btn secondary" onclick="say(${JSON.stringify(w.en).replace(/"/g,'&quot;')})">🔊 Listen</button><button class="btn outline" onclick="flipFlash()">⟳ Flip card</button><button class="btn" onclick="nextFlash(1)" ${st.flash===list.length-1?'disabled':''}>Next →</button></div>
   <p class="flash-helper">Choose a lesson above to study a smaller set of cards. Your teacher can edit these terms in Teacher Editor.</p>
 </section>`;
}
function renderFlash(){let l=chapterVocab(getChapter());if(!l.length)return `<div class="empty">Bài học này chưa có thẻ từ vựng.</div>`;st.flash%=l.length;let w=l[st.flash];return `${selectedLesson()}<div class="toolbar"><small>Flashcards · ${st.flash+1}/${l.length}</small></div><div class="flashbox" onclick="flipFlash()"><div class="hint">${st.flipped?'Vietnamese / Definition':'English term · Click to flip'}</div>${st.flipped?`<div class="meaning">${h(w.vi)}</div><p>${fmt(w.def)}</p><p>${fmt(w.ex)}</p>`:`<div class="word">${h(w.en)}</div><div class="hint">Nhấn để lật thẻ</div>`}</div><div class="flashcontrols"><button class="btn outline" onclick="nextFlash(-1)">← Previous</button><button class="btn secondary" onclick="say(${JSON.stringify(w.en).replace(/"/g,'&quot;')})">🔊 Listen</button><button class="btn" onclick="nextFlash(1)">Next →</button></div>`}
function renderQuestions(){let arr=qList();if(!arr.length)return `<div class="empty">Chưa có câu hỏi trong phần này. Giáo viên có thể bổ sung bằng Teacher Editor.</div>`;st.index=Math.min(st.index,arr.length-1);let q=arr[st.index],key=st.chapter+'-'+st.mode+'-'+q.id,rec=st.progress[key];const hasoptions=Array.isArray(q.options)&&q.options.length>0;return `<div class="toolbar"><span class="small">Question ${st.index+1}/${arr.length} · ${st.mode==='vocab'?'Vocabulary Practice':'Math Practice'}</span><div style="flex:1"></div><span class="small">${arr.filter(x=>st.progress[st.chapter+'-'+st.mode+'-'+x.id]?.best).length} mastered</span></div><div class="progressline"><span style="width:${100*(st.index+1)/arr.length}%"></span></div><div class="questioncard" style="margin-top:16px"><div class="small">${h(q.title||'Choose the correct answer')}</div><h3>${fmt(q.q)}</h3>${hasoptions?`<div class="optiongrid">${q.options.map((x,i)=>`<button class="option ${st.answered?(i===+q.correct?'correct':i===st.choice?'wrong':''):''}" ${st.answered?'disabled':''} onclick="answerChoice(${i})"><strong>${'ABCD'[i]||i+1}.</strong> ${fmt(x)}</button>`).join('')}</div>`:`<div><label class="small" for="shortanswer">Your answer</label><p><input class="answerinput" id="shortanswer" aria-label="Your answer" placeholder="Enter a number or expression" ${st.answered?'disabled':''}></p><button class="btn" ${st.answered?'disabled':''} onclick="answerShort()">Check answer</button></div>`}${st.answered?`<div class="feedback ${st.correct?'success':''}"><strong>${st.correct?'✓ Correct!':'Review the answer'}</strong>${!st.correct?`<p><strong>Correct answer:</strong> ${fmt(hasoptions?q.options[q.correct]:Array.isArray(q.answer)?q.answer[0]:q.answer)}</p>`:''}${q.ex?`<p><strong>Explanation:</strong> ${fmt(q.ex)}</p>`:''}</div>`:''}<div class="flashcontrols"><button class="btn outline" onclick="nextQuestion(-1)" ${st.index===0?'disabled':''}>← Previous</button><button class="btn" onclick="nextQuestion(1)" ${st.index>=arr.length-1?'disabled':''}>Next question →</button></div></div>`}
function renderPractice(){return `<div class="practice-switch"><button class="${st.mode==='vocab'?'active':''}" onclick="setMode('vocab')">🧩 Vocabulary Practice</button><button class="${st.mode==='math'?'active':''}" onclick="setMode('math')">✏️ Math Practice</button><button type="button" class="practice-sound-toggle" onclick="togglePracticeSound()" aria-label="${practiceSoundEnabled?'Mute answer feedback sounds':'Enable answer feedback sounds'}" aria-pressed="${practiceSoundEnabled}">${practiceSoundEnabled?'🔊 Sound: On':'🔇 Sound: Off'}</button></div>${st.mode==='vocab'?selectedLesson()+renderQuestions():renderQuestions()}`}
function renderDiscoveries(){let c=getChapter();if(c.id===2)return `<p class="small">Math Discoveries from your Chapter 2 learning materials.</p>${D.chapter2.discoveries.map((item,i)=>`<article class="discover"><div class="eyebrow" style="color:#068ec7">STORY ${String(i+1).padStart(2,'0')}</div><h3>${h(item.title)}</h3>${item.image?`<img loading="lazy" src="${h(item.image)}" alt="Illustration of ${h(item.title)}">`:''}${item.body.map(p=>`<p>${fmt(p)}</p>`).join('')}</article>`).join('')}`;let defaultDiscover=D.discoveries?.[c.id]||[];return defaultDiscover.map((x,i)=>`<article class="discover"><div class="eyebrow" style="color:#008be0">MATH DISCOVERY ${i+1}</div><h3>${h(x.title)}</h3>${x.image?`<img src="${h(x.image)}" alt="${h(x.title)}">`:``}${x.body.map(p=>`<p>${fmt(p)}</p>`).join('')}</article>`).join('')}
function renderProgress(c){let modeAll=[...(c.id===2?[...D.chapter2.quiz.filter(q=>q.kind==='meaning'),...vocabPractice(c)]:vocabPractice(c)),...chapterQuiz(c)];let total=modeAll.length,done=modeAll.filter(q=>{let mode=String(q.id).startsWith('v-')?'vocab':'math';return st.progress[c.id+'-'+mode+'-'+q.id]?.best}).length;return `<section class="panel"><h3>My Progress · ${h(c.en)}</h3><p>${done}/${total} questions mastered on this device</p><div class="progressline"><span style="width:${total?100*done/total:0}%"></span></div><p class="small">${total?Math.round(100*done/total):0}% completed · Progress is stored only in this browser and is not shared with the teacher.</p><button class="btn outline" onclick="downloadProgress()">⬇ Export my progress</button></section>`}
function chapterVideos(c){const list=D.videos?.[String(c.id)]||[];return Array.isArray(list)?list:[]}
function youtubeId(url){
 const value=String(url||'').trim();
 if(/^[a-zA-Z0-9_-]{11}$/.test(value))return value;
 try{const u=new URL(value);const host=u.hostname.toLowerCase().replace(/^www\./,'').replace(/^m\./,'');let id='';
 if(host==='youtu.be')id=u.pathname.split('/')[1]||'';
 else if(host==='youtube.com'||host==='youtube-nocookie.com'){
 if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
 else if(/^\/(embed|shorts|live)\//.test(u.pathname))id=u.pathname.split('/')[2]||'';
 }
 return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';
 }catch(e){return ''}
}
function renderVideos(){const c=getChapter(),list=chapterVideos(c);
 return `<section class="panel"><div class="eyebrow" style="color:#087bc2">CHAPTER ${c.id} · VIDEO LESSONS</div><h2>🎬 Video Lessons</h2><p class="small">Video bài giảng của chương này do giáo viên lựa chọn. Xem video ngay trên MathLingo, rồi luyện tập ở tab Practice.</p>
 ${list.length?`<div class="videos-grid">${list.map((v,i)=>{let id=youtubeId(v.url);return `<article class="video-card"><h3>${h(v.title||'Video '+(i+1))}</h3>${v.description?`<p class="small">${h(v.description)}</p>`:''}${id?`<div class="video-frame"><iframe loading="lazy" title="${h(v.title||'MathLingo video')}" src="https://www.youtube-nocookie.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="small"><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></p>`:'<p class="note">Liên kết video chưa hợp lệ. Vui lòng nhờ giáo viên kiểm tra.</p>'}</article>`}).join('')}</div>`:`<div class="video-empty"><div style="font-size:34px">🎥</div><h3>Video chưa có sẵn</h3><p>Hiện chưa có video bài giảng cho chương này. Vui lòng quay lại sau.</p></div>`}
 </section>`;
}
function renderChapter(){let c=getChapter();let tabs=[['vocab','📖 Từ vựng'],['practice','✏️ Practice'],['fun','✨ Fun Maths'],['videos','🎬 Video Lessons'],['progress','📈 My Progress']];return `<div class="crumb"><button onclick="home()">Home</button> / <button onclick="goChapters()">Chapters</button> / Chapter ${c.id}</div><div class="chaptertop"><div><div class="eyebrow" style="color:#008be0">SEMESTER I · CHAPTER ${c.id}</div><h1>${h(c.en)}</h1><p>${h(c.vi)}</p></div><span class="topbadge">${c.lessons.length} LESSONS</span></div><div class="listlessons">${c.lessons.map(l=>`<span class="lessontag">${l.number}. ${h(l.en)}</span>`).join('')}</div><div class="tabs">${tabs.map(x=>`<button class="${st.tab===x[0]?'active':''}" onclick="setTab('${x[0]}')">${x[1]}</button>`).join('')}</div>${st.tab==='vocab'?renderVocab():st.tab==='practice'?renderPractice():st.tab==='fun'?renderDiscoveries():st.tab==='videos'?renderVideos():renderProgress(c)}`}
function renderGlobalProgress(){let ps=stats();return `<div class="crumb"><button onclick="home()">Home</button> / My Progress</div><h1>My Progress</h1><p class="small">Your progress on this browser only. ${ps.tried} different questions attempted.</p>${overall()}<div class="grid">${D.chapters.map(c=>`<article class="chaptercard" onclick="goChapter(${c.id},'progress')"><h3>Chapter ${c.id} · ${h(c.en)}</h3><p>View progress →</p></article>`).join('')}</div><p><button class="btn outline" onclick="downloadProgress()">Download results (JSON)</button></p><div class="note">Lưu ý: Xóa dữ liệu trình duyệt hoặc chuyển sang thiết bị khác sẽ không tự mang theo tiến độ. Chức năng tài khoản học sinh và lưu điểm tập trung cần cơ sở dữ liệu riêng.</div>`}
function renderAbout(){return `<h1>About MathLingo</h1><div class="panel"><p><strong>MathLingo</strong> helps Grade 11 students learn mathematics through English with bilingual vocabulary, practice questions, math discoveries, and progress tracking.</p><p>Semester I covers Chapters I–V of the Vietnamese grade 11 textbook <em>Toán 11 — Kết nối tri thức với cuộc sống, tập một</em>, combined with the teacher-provided materials.</p><p>Mathematical notation is rendered using KaTeX. English terms can be read aloud with browser speech synthesis.</p><div class="note"><strong>Privacy & visitor stats:</strong> Progress is stored in your browser. If the site owner activates GoatCounter, aggregated website visit statistics are collected by that third-party service. The public counter is approximate and may be affected by browser restrictions.</div></div>`}
function render(){app.innerHTML=`<div class="frame">${head()}<main class="main">${st.tab==='globalSearch'?renderGlobalSearch():st.tab==='globalProgress'?renderGlobalProgress():st.tab==='about'?renderAbout():st.chapter?renderChapter():renderHome()}</main>${foot()}</div>`;math(app);setupCount()}
function home(){st.chapter=0;st.tab='vocab';st.lesson='all';render();scrollTo(0,0)}
function goChapters(){home();document.getElementById('chapters')?.scrollIntoView({block:'start'})}
function goAbout(){st.tab='about';render();scrollTo(0,0)}
function goGlobalProgress(){st.tab='globalProgress';render();scrollTo(0,0)}
function goChapter(n,tab='vocab'){st.chapter=n;st.tab=tab;st.lesson='all';st.mode='vocab';st.index=0;st.answered=false;st.search='';render();scrollTo(0,0)}
function setTab(t){st.tab=t;st.index=0;st.answered=false;st.flash=0;st.flipped=false;render()}
function selectLesson(x){st.lesson=x;st.index=0;st.flipped=false;st.flash=0;st.answered=false;st.search='';render()}
function searchVocab(x){st.search=x;st.flash=0;st.flipped=false;const pos=document.activeElement?.selectionStart;render();let inp=document.querySelector('.toolbar input');if(inp){inp.focus();inp.setSelectionRange(pos,pos)}}
function setMode(x){st.mode=x==='math'?'math':'vocab';st.index=0;st.answered=false;st.flipped=false;render()}
function nextFlash(i){const total=st.tab==='vocab'?visibleVocab().length:chapterVocab(getChapter()).length;st.flash=Math.max(0,Math.min(total-1,st.flash+i));st.flipped=false;render()}
function flipFlash(){st.flipped=!st.flipped;render()}
function nextQuestion(i){st.index=Math.max(0,Math.min(qList().length-1,st.index+i));st.answered=false;st.choice=null;render()}
/* Short, optional answer feedback tones (no external audio files or tracking). */
const SOUND_KEY='mathlingo-practice-sound-enabled';
let practiceSoundEnabled=true;
try{practiceSoundEnabled=localStorage.getItem(SOUND_KEY)!=='false'}catch(e){}
let answerAudioContext=null;
function togglePracticeSound(){
  practiceSoundEnabled=!practiceSoundEnabled;
  try{localStorage.setItem(SOUND_KEY,String(practiceSoundEnabled))}catch(e){}
  render();
}
function playAnswerSound(correct){
  if(!practiceSoundEnabled)return;
  try{
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return;
    if(!answerAudioContext)answerAudioContext=new AudioContextClass();
    const ctx=answerAudioContext;
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const now=ctx.currentTime+0.012;
    // Correct: warm rising two-note chime. Incorrect: gentle low descending signal.
    const notes=correct?[[660,0,.12],[880,.13,.19]]:[[330,0,.17],[247,.18,.18]];
    notes.forEach(([frequency,offset,duration])=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type=correct?'sine':'triangle';
      osc.frequency.setValueAtTime(frequency,now+offset);
      gain.gain.setValueAtTime(.0001,now+offset);
      gain.gain.linearRampToValueAtTime(correct?.085:.055,now+offset+.018);
      gain.gain.exponentialRampToValueAtTime(.0001,now+offset+duration);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(now+offset);osc.stop(now+offset+duration+.015);
    });
  }catch(err){console.info('Answer sound is unavailable in this browser.',err)}
}
function answerChoice(i){let q=qList()[st.index];if(st.answered)return;st.choice=i;st.correct=(i===+q.correct);st.answered=true;record(st.chapter+'-'+st.mode+'-'+q.id,st.correct);playAnswerSound(st.correct);render()}
function answerShort(){let q=qList()[st.index],inp=document.querySelector('#shortanswer');if(!inp)return;let v=inp.value.trim();if(!v)return;let opts=Array.isArray(q.answer)?q.answer:[q.answer];let norm=x=>String(x).trim().toLowerCase().replace(/[\s,]/g,'').replace('π','pi');st.correct=opts.some(z=>norm(z)===norm(v));st.answered=true;record(st.chapter+'-'+st.mode+'-'+q.id,st.correct);playAnswerSound(st.correct);render()}
function say(word){if(!('speechSynthesis' in window)){alert('Trình duyệt không hỗ trợ đọc giọng nói.');return}speechSynthesis.cancel();let s=new SpeechSynthesisUtterance(word);s.lang='en-US';s.rate=.86;speechSynthesis.speak(s)}
function downloadProgress(){let blob=new Blob([JSON.stringify({project:'MathLingo',exported:new Date().toISOString(),progress:st.progress},null,2)],{type:'application/json'});downloadBlob(blob,'MathLingo-My-Progress.json')}
function downloadBlob(blob,name){let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
let counterStarted=false;
function setupCount(){let code=(D.analyticsCode||'').trim(),el=document.getElementById('visitor-count');if(!code||!el)return;if(!/^[a-z0-9-]+$/i.test(code)){el.textContent='Bộ đếm chưa cấu hình hợp lệ';return}if(counterStarted){el.textContent='👁️ ';try{window.goatcounter?.visit_count?.({append:'#visitor-count'})}catch(e){el.textContent='👁️ Xem lượt truy cập tại '+code+'.goatcounter.com'}return}counterStarted=true;let s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://'+code+'.goatcounter.com/count');s.onload=()=>{let target=document.getElementById('visitor-count');if(!target)return;target.textContent='👁️ ';try{window.goatcounter?.visit_count?.({append:'#visitor-count'})}catch(e){target.textContent='👁️ Xem thống kê tại '+code+'.goatcounter.com'}};s.onerror=()=>{let v=document.getElementById('visitor-count');if(v)v.textContent='Bộ đếm không tải được (có thể do trình chặn quảng cáo)'};document.head.appendChild(s)}
render();

window.addEventListener('load',()=>math(app));
