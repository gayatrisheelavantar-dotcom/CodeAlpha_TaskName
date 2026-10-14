import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {getFirestore,doc,onSnapshot,setDoc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {firebaseConfig as cfg} from "./firebase-config.js";

const btn=document.getElementById('sync');
if(!cfg.apiKey||cfg.apiKey.startsWith('YOUR')){
  btn.textContent='Sync: add Firebase config';btn.disabled=true;
}else{
  const auth=getAuth(initializeApp(cfg)),db=getFirestore(),ref=u=>doc(db,'users',u.uid);
  let user=null,unsub=null;
  window.cloudPush=s=>{if(user)setDoc(ref(user),s).catch(console.error)};
  btn.onclick=()=>user?signOut(auth):signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>alert('Sign-in failed: '+e.message));
  onAuthStateChanged(auth,u=>{
    user=u;if(unsub){unsub();unsub=null}
    if(!u){btn.textContent='Sign in to sync';return}
    btn.textContent='Synced: '+(u.displayName||'signed in').split(' ')[0]+' (sign out)';
    // Real-time listener: updates arrive instantly from other devices.
    unsub=onSnapshot(ref(u),snap=>{
      const local=window.getState();
      if(!snap.exists()){window.cloudPush(local);return}
      const remote=snap.data();
      if(!snap.metadata.hasPendingWrites&&(remote.updatedAt||0)>(local.updatedAt||0))window.applyRemote(remote);
      else if((local.updatedAt||0)>(remote.updatedAt||0))window.cloudPush(local);
    });
  });
}
