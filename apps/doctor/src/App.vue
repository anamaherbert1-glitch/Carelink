<template>
  <main class="page"><section class="shell"><header><div><div class="logo">CL</div><p class="eyebrow">CareLink Médecin</p><h1>Portail praticien</h1><p>Agenda, patients, consultations et transferts confraternels sécurisés.</p></div><button class="btn" v-if="user" @click="signOut">Déconnexion</button></header><div v-if="!user" class="auth"><h2>Connexion</h2><input v-model="email" placeholder="Email" type="email"><input v-model="password" placeholder="Mot de passe" type="password"><button class="primary" @click="signIn">Se connecter</button><small v-if="error" class="error">{{ error }}</small></div><div v-else class="card"><h2>Portail médecin</h2><p>Session active : {{ user.email }}</p><p v-if="!isDoctor" class="warning">Accès professionnel requis.</p><p v-else>Les fonctions de consultation, transferts de dossiers et gestion des créneaux sont connectées aux services CareLink.</p></div></section></main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@carelink/supabase-client';
const user=ref<any>(null), email=ref(''), password=ref(''), error=ref(''), isDoctor=ref(false);
async function signIn(){ error.value=''; const r=await supabase.auth.signInWithPassword({email:email.value,password:password.value}); if(r.error){error.value=r.error.message;return;} user.value=r.data.user; await loadRole(); }
async function loadRole(){ if(!user.value)return; const {data}=await supabase.from('profiles').select('role').eq('id',user.value.id).maybeSingle(); isDoctor.value=data?.role==='doctor'; }
async function signOut(){await supabase.auth.signOut();user.value=null;isDoctor.value=false;}
supabase.auth.getSession().then(async r=>{user.value=r.data.session?.user||null;if(user.value)await loadRole();});
</script>
<style scoped>
:global(body){margin:0;font-family:Inter,system-ui,sans-serif;background:#f5f8fc;color:#102a43}.page{min-height:100vh;padding:28px;background:linear-gradient(135deg,#e7f1ff,#f5fbff)}.shell{max-width:1100px;margin:auto}.logo{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;color:#fff;font-weight:800;background:linear-gradient(135deg,#1677e8,#0aa38c)}.eyebrow{font-weight:700;color:#1677e8;margin:16px 0 4px}h1{font-size:clamp(2rem,6vw,3.2rem);margin:0}.auth,.card{background:#fff;padding:24px;border-radius:18px;box-shadow:0 10px 30px #14467814;margin-top:20px;max-width:600px}.auth input{display:block;width:100%;padding:12px;margin:10px 0;border:1px solid #d8e0ea;border-radius:10px;box-sizing:border-box}.primary,.btn{border:0;border-radius:10px;padding:11px 16px;cursor:pointer}.primary{background:#1677e8;color:#fff}.error{display:block;color:#b42318;margin-top:12px}.warning{color:#b42318;font-weight:700}
</style>
