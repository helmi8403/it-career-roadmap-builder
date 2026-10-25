import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
if(!firebaseConfig.appId || !firebaseConfig.apiKey) {
 $('status').textContent='Firebase web configuration is required before sign-in can be enabled.';
} else {
 const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
 $('sign-in').disabled=false;
 $('sign-in').addEventListener('click',async()=>{
   $('sign-in').disabled=true;
   try{await signInWithPopup(auth,new GoogleAuthProvider());}
   catch(err){$('status').textContent='Google sign-in failed: '+(err.code||'unknown error');}
   finally{$('sign-in').disabled=false;}
 });
 $('sign-out').addEventListener('click',()=>signOut(auth));
 onAuthStateChanged(auth,async user=>{
   $('login').classList.toggle('hidden',!!user);$('dashboard').classList.toggle('hidden',!user);
   if(!user){$('status').textContent='Sign in to continue.';return;}
   $('name').textContent=user.displayName||'Student';
   try{
     const ref=doc(db,'users',user.uid),snap=await getDoc(ref);
     if(!snap.exists())await setDoc(ref,{displayName:user.displayName||'',photoURL:user.photoURL||'',email:user.email||'',createdAt:serverTimestamp()});
     $('status').textContent='Signed in successfully.';
   }catch(err){$('status').textContent='Signed in, but profile sync failed: '+(err.code||'unknown error');}
 });
}
