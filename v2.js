// V2 profile and assessment. Existing saved milestones remain independent.
function validAssessment(value) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([role, statuses]) => Object.hasOwn(roles, role) &&
      Array.isArray(statuses) && statuses.length === roles[role].steps.length &&
      statuses.every(s => ['learn', 'practice', 'evidence'].includes(s)));
}
(function () {
  const $ = s => document.querySelector(s);
  const assessmentKey = 'it-roadmap-skills-v2';
  function profile() { try { const p = JSON.parse(planStorage.getItem(profileKey)); return validProfile(p) ? p : null; } catch { return null; } }
  function assessment() { try { const a = JSON.parse(planStorage.getItem(assessmentKey)); return validAssessment(a) ? a : {}; } catch { return {}; } }
  function stamp() {
    planStorage.setItem('it-roadmap-updated', new Date().toISOString());
    showSaved();
  }
  function showSaved() {
    const t = planStorage.getItem('it-roadmap-updated');
    $('#last-saved').textContent = storageUnavailable ? 'Changes are only kept for this visit. Download a backup before leaving.' : t ? 'Last saved on this browser: ' + new Date(t).toLocaleString() : 'Your existing saved data is available. New changes will show a save time here.';
  }
  function page() {
    const hash = location.hash.slice(1), name = ['certs', 'resources'].includes(hash) ? 'learning' : ['profile', 'learning'].includes(hash) ? hash : 'roadmap';
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === name));
    document.querySelectorAll('[data-page]').forEach(a => { if(a.dataset.page === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.body.classList.toggle('page-other', name !== 'roadmap');
    document.title = ({profile:'My Profile',learning:'Learning',roadmap:'My Plan'}[name]) + ' | IT Career Roadmap Builder';
    if (hash === 'certs' || hash === 'resources') $('#' + hash).scrollIntoView({block:'start'});
  }
  function routes(target) {
    return starterKeys.flatMap(start => {
      if (start === target) return [{start, level:0}];
      const level = [1,2].find(i => branchRoles(start,i).includes(target));
      return level ? [{start,level}] : [];
    });
  }
  function draw() {
    const p = profile();
    if (!p) {
      $('#personal-heading').textContent = 'Where do you want to go?';
      $('#personal-next').innerHTML = '<p>Add a target career and the time you can spend learning. You can also continue exploring the roadmap below.</p><a class="btn" href="#profile">Set up My Profile</a>';
      $('#skill-assessment').replaceChildren();return;
    }
    const r = roles[p.target], a = assessment(), states = a[p.target] || r.steps.map(()=>'learn');
    const count = states.filter(x=>x==='evidence').length;
    const next = states.findIndex(x=>x!=='evidence');
    const options = routes(p.target), preferred = options.find(x=>x.start===roleSelect.value) || options[0];
    $('#personal-heading').textContent = 'Your goal: ' + r.name;
    const hours = Number(p.hours), budget = p.budget === '' || p.budget === undefined ? null : Number(p.budget);
    let text = `<p>${esc(p.role || 'Starting your career')} · ${p.years} years in IT. Your assessment below controls the next learning action. Experience, qualifications and certificate names are self-reported; they do not automatically complete a skill.</p>`;
    if (p.direction === 'management') text += '<p>Your leadership interest is saved. Build the foundation skills first, then explore the management and director section for your selected path.</p>';
    else if(p.direction === 'technical') text += '<p>Your focus is technical depth: prioritise hands-on projects and specialist roles in the Career Map.</p>';
    if (preferred) text += `<p>Suggested route: ${esc(roles[preferred.start].name)}${preferred.level ? ' → '+esc(r.name)+' at an eligible milestone' : ''}. This is a planning route; check the experience and skill requirements before moving.</p><button class="btn" id="apply-goal">Show this route in my roadmap</button>`;
    text += '<a class="btn secondary" href="#profile">Edit profile</a>';
    if (next >= 0) {
      const g=stageGuides[p.target][next], step=r.steps[next], need=states[next];
      text += `<div id="next-action"><p class="eyebrow">${need==='learn'?'Learn next':'Build evidence next'}</p><h3>${esc(step[0])}</h3><p>${esc(need==='learn'?g[0]:g[1])}</p><p><b>Evidence to produce:</b> ${esc(g[1])}</p>`;
      if(hours>0) text += `<p>Your weekly time budget: ${hours} hours. Start with ${Math.max(0.5,Math.round(hours/2*2)/2)} hours of guided learning and use the remaining time to practise. This is a suggested schedule, not a completion forecast.</p>`;
      else text += '<p>Try one learning session and one practical task this week. You can set your weekly time in My Profile.</p>';
      text += `<p>${budget===0?'Your budget is S$0: look for free modules first; defer paid exams.':budget!==null?'Your monthly limit is S$'+budget+': check course and exam fees before enrolling.':'Use an existing or free learning resource first; check fees before enrolling.'}</p>`;
      const resource=r.resources[0];if(resource)text+=`<a href="${esc(resource[2])}" target="_blank" rel="noopener">Explore ${esc(resource[0])} ↗</a><p><small>This is a role learning hub; choose the module matching the skill above. Availability and fees vary.</small></p>`;
      text+='</div>';
    } else text += '<div id="next-action"><h3>Review your evidence</h3><p>You have marked every foundation skill as demonstrated. Review your work against job requirements, practise explaining your projects, and explore the next career milestone. This checklist is not a hiring or promotion assessment.</p></div>';
    $('#personal-next').innerHTML=text;
    $('#skill-assessment').innerHTML='<h3>Your skills-gap checklist</h3><p>Assess the actual skill, not just whether you finished a course. Update this whenever your experience changes.</p><p id="assessment-count" aria-live="polite">'+count+' of '+states.length+' foundation skills have self-reported evidence.</p>'+r.steps.map((s,i)=>`<div class="skill-row"><label for="skill-${i}">${esc(s[0])}<small>${esc(s[2].join(' · '))}</small></label><select id="skill-${i}" data-skill="${i}" aria-label="Assessment: ${esc(s[0])}">${[['learn','Need to learn'],['practice','Know the basics — need evidence'],['evidence','Can demonstrate with evidence']].map(([v,t])=>`<option value="${v}" ${states[i]===v?'selected':''}>${t}</option>`).join('')}</select></div>`).join('');
    $('#apply-goal')?.addEventListener('click',()=>{
      roleSelect.value=preferred.start;
      planStorage.setItem('it-roadmap-role',preferred.start);
      if(preferred.level)planStorage.setItem(moveStorage(),JSON.stringify({level:preferred.level,target:p.target,credit:0}));else planStorage.removeItem(moveStorage());
      restoreMove();render();stamp();draw();location.hash='roadmap';page();
    });
  }
  $('#skill-assessment').addEventListener('change',e=>{
    if(!e.target.matches('[data-skill]'))return;const p=profile();if(!p)return;const a=assessment();a[p.target] ||= roles[p.target].steps.map(()=>'learn');const i=Number(e.target.dataset.skill);a[p.target][i]=e.target.value;planStorage.setItem(assessmentKey,JSON.stringify(a));stamp();draw();$('#skill-'+i)?.focus();
  });
  $('#profile-form').addEventListener('submit',()=>{stamp();draw();});
  $('#confirm-import').addEventListener('click',()=>{showSaved();draw();page();});
  $('#role').addEventListener('change',()=>{stamp();draw();page();});
  $('#roadmap').addEventListener('change',e=>{if(!e.target.matches('[data-skill]'))stamp();});
  $('#reset').addEventListener('click',stamp);
  $('#delete-data').addEventListener('click',()=>{$('#delete-confirm').hidden=false;$('#delete-yes').focus();});
  $('#delete-no').addEventListener('click',()=>{$('#delete-confirm').hidden=true;$('#delete-data').focus();});
  $('#delete-yes').addEventListener('click',()=>{backupKeys.forEach(k=>planStorage.removeItem(k));roleSelect.value='support';careerMove=null;current='support';history.replaceState(null,'',location.pathname+'#profile');loadProfile();render();draw();page();showSaved();cancelImport();$('#delete-confirm').hidden=true;$('#save-status').textContent=storageUnavailable?'Saved data could not be removed from browser storage. Clear site data using your browser settings.':'Your saved career data has been deleted from this browser.';});
  window.addEventListener('hashchange',page);
  window.addEventListener('storage',()=>{memoryStore.clear();roleSelect.value=planStorage.getItem('it-roadmap-role')||'support';restoreMove();render();loadProfile();showSaved();draw();page();});
  showSaved();draw();page();
})();
