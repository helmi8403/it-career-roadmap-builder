import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,getDoc,getDocs,collection,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
const chapterCount=8;
if(!firebaseConfig.appId || !firebaseConfig.apiKey){
  $('status').textContent='Firebase web configuration is missing.';
}else{
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  $('sign-in').disabled=false;
  $('sign-in').addEventListener('click',async()=>{
    $('sign-in').disabled=true;
    try{await signInWithPopup(auth,new GoogleAuthProvider());}
    catch(err){$('status').textContent='Sign-in failed: '+(err.code||'unknown error');}
    finally{$('sign-in').disabled=false;}
  });
  $('sign-out').addEventListener('click',async()=>{try{await signOut(auth)}catch(err){$('status').textContent='Sign-out failed: '+err.code}});
  let generation=0;
  onAuthStateChanged(auth,async user=>{
    const current=++generation;
    $('login').classList.toggle('hidden',!!user);
    $('dashboard').classList.toggle('hidden',!user);
    $('sign-out').classList.toggle('hidden',!user);
    $('admin-panel').classList.add('hidden');
    $('chapters').replaceChildren();
    if(!user){$('status').textContent='Sign in to continue.';return;}
    $('name').textContent=user.displayName||'Student';
    $('status').textContent='Loading your progress…';
    try{
      const profile=doc(db,'users',user.uid);
      if(!(await getDoc(profile)).exists()){
        await setDoc(profile,{displayName:user.displayName||'',photoURL:user.photoURL||'',email:user.email||'',createdAt:serverTimestamp()});
      }
      const token=await user.getIdTokenResult();
      if(current!==generation)return;
      $('admin-panel').classList.toggle('hidden',token.claims.admin!==true);
      const progress=collection(db,'users',user.uid,'progress');
      const snapshot=await getDocs(progress);
      if(current!==generation)return;
      const completed=new Set(snapshot.docs.filter(d=>d.data().completed===true).map(d=>d.id));
      function render(){
        $('completed-count').textContent=completed.size+' of '+chapterCount;
        $('chapters').replaceChildren();
        for(let i=1;i<=chapterCount;i++){
          const id='chapter-'+String(i).padStart(2,'0');
          const box=document.createElement('div');box.className='chapter';
          const heading=document.createElement('h3');heading.textContent='Chapter '+i;
          const state=document.createElement('p');state.textContent=completed.has(id)?'Completed':'Not completed';
          const button=document.createElement('button');button.className=completed.has(id)?'secondary':'';
          button.textContent=completed.has(id)?'Mark incomplete':'Mark complete';
          button.addEventListener('click',async()=>{
            button.disabled=true;
            try{
              const next=!completed.has(id);
              await setDoc(doc(progress,id),{chapterId:id,completed:next,lastStudiedAt:serverTimestamp(),updatedAt:serverTimestamp()});
              if(next)completed.add(id);else completed.delete(id);
              render();$('status').textContent='Progress saved to Firestore.';
            }catch(err){button.disabled=false;$('status').textContent='Unable to save progress: '+(err.code||'unknown error');}
          });
          box.append(heading,state,button);$('chapters').append(box);
        }
      }
      render();$('status').textContent='Signed in. Your progress is synced.';
    }catch(err){if(current===generation)$('status').textContent='Account setup failed: '+(err.code||'unknown error');}
  });
}
