// Simple offline notes + pattern grouping using Jaccard similarity
// Data stored in localStorage key: 'inboxNotes'

const STORAGE_KEY = 'inboxNotes';
const stopwords = new Set(['the','a','an','and','or','to','for','in','on','of','is','are','was','were','with','my','i','it','that','this']);

// Small keyword->cause mapping and cause->suggestions
const keywordCauses = [
  {k:['newsletter','promotion','promo','sale'], cause: 'Promotions / newsletters'},
  {k:['social','friend','follow','like'], cause: 'Social notifications'},
  {k:['urgent','important','miss','missing','later'], cause: 'Poor prioritization or missed important senders'},
  {k:['boss','manager','team','project'], cause: 'Work-related high-priority messages'},
  {k:['spam','scam','unsubscribe','unsubscribe'], cause: 'Unwanted or spammy senders'},
  {k:['daily','summary','digest'], cause: 'Automated digests or summaries'}
];

const causeSuggestions = {
  'Promotions / newsletters': ['Unsubscribe or send to Promotions folder', 'Create a filter to archive newsletters automatically', 'Batch-check promotional mail once per day'],
  'Social notifications': ['Mute social notifications or disable email alerts', 'Use a separate folder/label and check occasionally'],
  'Poor prioritization or missed important senders': ['Create filter to star or highlight important senders', 'Set desktop/mobile notifications for chosen senders only'],
  'Work-related high-priority messages': ['Create rules to flag messages from your manager or key projects', 'Use narrow inbox rules to surface only project-related emails'],
  'Unwanted or spammy senders': ['Unsubscribe or mark as spam', 'Add sender to block list or filter to delete'],
  'Automated digests or summaries': ['Reduce frequency from sender (if possible)', 'Send summaries to a separate folder and check once daily']
};

// Utilities
function saveNotes(notes){ localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }
function loadNotes(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){return []} }
function idNow(){ return Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36); }

function normalizeText(s){ return s.toLowerCase().replace(/[\p{P}$+<>=~`^\[\]{}\\|]/gu,' ').replace(/\s+/g,' ').trim(); }
function tokensOf(s){ const norm = normalizeText(s); return Array.from(new Set(norm.split(' ').filter(t=>t && !stopwords.has(t)))); }
function jaccard(a,b){ const A = new Set(a), B=new Set(b); const inter = Array.from(A).filter(x=>B.has(x)).length; const uni = new Set([...A,...B]).size; return uni===0?0:inter/uni; }

// CRUD and UI
const noteForm = document.getElementById('noteForm');
const noteText = document.getElementById('noteText');
const noteType = document.getElementById('noteType');
const noteDate = document.getElementById('noteDate');
const notesList = document.getElementById('notesList');
const analyzeBtn = document.getElementById('analyzeBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const patternsSection = document.getElementById('patternsSection');
const patternsDiv = document.getElementById('patterns');
const closePatterns = document.getElementById('closePatterns');
const editIdInput = document.getElementById('editId');
const saveBtn = document.getElementById('saveBtn');
const cancelEdit = document.getElementById('cancelEdit');

noteForm.addEventListener('submit', e=>{ e.preventDefault(); addNote(); });
analyzeBtn.addEventListener('click', analyzeAndShow);
exportBtn.addEventListener('click', exportJSON);
importBtn.addEventListener('click', ()=>importFile.click());
importFile.addEventListener('change', handleImport);
closePatterns.addEventListener('click', ()=>{ patternsSection.style.display='none'; });
cancelEdit.addEventListener('click', ()=>{ resetEditState(); });

function addNote(){ const text = noteText.value.trim(); if(!text) return; const type = noteType.value || '';
  const ts = noteDate.value ? new Date(noteDate.value).toISOString() : new Date().toISOString();
  const notes = loadNotes();
  // Edit mode: update existing note
  if(editIdInput && editIdInput.value){ const eid = editIdInput.value; const idx = notes.findIndex(n=>n.id===eid); if(idx!==-1){ notes[idx].text = text; notes[idx].type = type; notes[idx].timestamp = ts; saveNotes(notes); resetEditState(); renderNotes(); return; } }
  // Create new
  notes.unshift({ id: idNow(), text, type, timestamp: ts });
  saveNotes(notes); noteText.value=''; noteType.value=''; noteDate.value=''; renderNotes(); }

function resetEditState(){ if(editIdInput) editIdInput.value=''; if(saveBtn) saveBtn.textContent='Save note'; if(cancelEdit) cancelEdit.style.display='none'; noteForm.reset(); }

function renderNotes(){ const notes = loadNotes(); notesList.innerHTML='';
  if(notes.length===0){ notesList.innerHTML='<li><em>No notes yet. Add one above.</em></li>'; return; }
  for(const n of notes){ const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<div>${escapeHtml(n.text)}</div><div class="noteMeta">${n.type?escapeHtml(n.type)+' · ':''}${new Date(n.timestamp).toLocaleString()}</div>`;
    const right = document.createElement('div');
    const edit = document.createElement('button'); edit.textContent='Edit'; edit.style.marginRight='8px'; edit.addEventListener('click', ()=>{ startEdit(n.id); });
    const del = document.createElement('button'); del.textContent='Delete'; del.style.background='#d23'; del.addEventListener('click', ()=>{ deleteNote(n.id); });
    right.appendChild(edit); right.appendChild(del);
    li.appendChild(left); li.appendChild(right); notesList.appendChild(li);
  }
}

function deleteNote(id){ let notes = loadNotes(); notes = notes.filter(n=>n.id!==id); saveNotes(notes); renderNotes(); }

function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// Analysis and grouping
function analyzeNotes(notes){ // returns clusters: [{ids, notes, summaryTokens, cause, suggestions}]
  const tokenList = notes.map(n=>({id:n.id, tokens:tokensOf((n.text||'') + ' ' + (n.type||''))}));
  const used = new Set(); const clusters = [];
  for(let i=0;i<tokenList.length;i++){
    if(used.has(tokenList[i].id)) continue;
    const base = tokenList[i]; const cluster = {ids:[base.id], notes:[notes.find(x=>x.id===base.id)], tokens: new Map() };
    used.add(base.id);
    for(let j=i+1;j<tokenList.length;j++){
      if(used.has(tokenList[j].id)) continue;
      const sim = jaccard(base.tokens, tokenList[j].tokens);
      if(sim >= 0.38){ // threshold tuned for short notes
        used.add(tokenList[j].id); cluster.ids.push(tokenList[j].id); cluster.notes.push(notes.find(x=>x.id===tokenList[j].id));
      }
    }
    // aggregate token frequencies
    for(const t of tokensOf(cluster.notes.map(n=>n.text+' '+(n.type||'')).join(' '))){ cluster.tokens.set(t, (cluster.tokens.get(t)||0)+1); }
    clusters.push(cluster);
  }
  // build summaries, infer causes and suggestions
  const results = clusters.map(c=>{
    const tokens = Array.from(c.tokens.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
    const causeScores = {};
    for(const tk of tokens){ for(const km of keywordCauses){ for(const kw of km.k){ if(tk.includes(kw)) causeScores[km.cause] = (causeScores[km.cause]||0)+1; } } }
    const sortedCauses = Object.entries(causeScores).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
    const cause = sortedCauses.length?sortedCauses[0]:'General overload';
    const suggestions = causeSuggestions[cause] || ['Try batching email checks and reduce subscriptions'];
    return { ids: c.ids, notes: c.notes, summary: tokens.join(', '), cause, suggestions };
  });
  return results;
}

function analyzeAndShow(){ const notes = loadNotes(); if(notes.length===0){ alert('No notes yet. Add a note first.'); return; }
  const patterns = analyzeNotes(notes);
  patternsDiv.innerHTML='';
  for(const p of patterns){ const el = document.createElement('div'); el.className='pattern';
    const h = document.createElement('h3'); h.textContent = `${p.cause} — ${p.notes.length} note${p.notes.length>1?'s':''}`;
    const sum = document.createElement('div'); sum.innerHTML = `<strong>Summary tokens:</strong> ${escapeHtml(p.summary)}`;
    const sample = document.createElement('div'); sample.innerHTML = `<strong>Sample:</strong> ${escapeHtml(p.notes.slice(0,2).map(n=>n.text).join(' — '))}`;
    const expl = document.createElement('div'); expl.innerHTML = `<strong>Possible cause:</strong> ${escapeHtml(p.cause)}.`;
    const sugg = document.createElement('div'); sugg.innerHTML = `<strong>Suggestions:</strong>`;
    const list = document.createElement('ul'); for(const s of p.suggestions){ const li=document.createElement('li'); li.textContent = s; list.appendChild(li);} sugg.appendChild(list);
    el.appendChild(h); el.appendChild(sum); el.appendChild(sample); el.appendChild(expl); el.appendChild(sugg);
    patternsDiv.appendChild(el);
  }
  patternsSection.style.display='block';
}

function startEdit(id){ const notes = loadNotes(); const n = notes.find(x=>x.id===id); if(!n) return; noteText.value = n.text || ''; noteType.value = n.type || ''; // set datetime-local value
  try{ const dt = new Date(n.timestamp); const local = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,16); noteDate.value = local; }catch(e){ noteDate.value=''; }
  if(editIdInput) editIdInput.value = id; if(saveBtn) saveBtn.textContent='Save changes'; if(cancelEdit) cancelEdit.style.display='inline-block'; window.scrollTo({top:0, behavior:'smooth'});
}

// Export/Import
function exportJSON(){ const notes = loadNotes(); const blob = new Blob([JSON.stringify({ exportedAt:new Date().toISOString(), notes },null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download='inbox-notes.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function handleImport(e){ const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ev=>{ try{ const data = JSON.parse(ev.target.result); if(data.notes && Array.isArray(data.notes)){ saveNotes(data.notes); renderNotes(); alert('Imported '+data.notes.length+' notes.'); } else alert('Invalid file format.'); }catch(err){ alert('Failed to import: '+err.message); } }; reader.readAsText(f); }

// Init
renderNotes();

// Expose analyze function for debugging/explainability
window._explainGrouping = function(){ return 'Grouping uses Jaccard similarity on token sets (shared tokens / union). Notes with similarity >= 0.38 are grouped together. This is deterministic and small, suitable for short notes.' };
