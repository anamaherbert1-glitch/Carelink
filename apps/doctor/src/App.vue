<template>
  <main class="page">
    <section class="shell">
      <header>
        <div>
          <div class="logo">CL</div>
          <p class="eyebrow">CareLink Médecin</p>
          <h1>Portail praticien</h1>
          <p>Agenda, patients, consultations et transferts confraternels sécurisés.</p>
        </div>
        <button class="btn" v-if="user" @click="signOut">Déconnexion</button>
      </header>

      <div v-if="!user" class="auth">
        <h2>Connexion</h2>
        <input v-model="email" placeholder="Email" type="email" autocomplete="email">
        <input v-model="password" placeholder="Mot de passe" type="password" autocomplete="current-password">
        <button class="primary" @click="signIn">Se connecter</button>
        <small v-if="error" class="error">{{ error }}</small>
      </div>

      <div v-else>
        <div v-if="!isDoctor" class="card warning">
          <h2>Accès professionnel requis</h2>
          <p>Ce portail est réservé aux comptes médecins vérifiés.</p>
        </div>

        <template v-else>
          <div class="stats">
            <div><b>{{ appointments.length }}</b><span>Rendez-vous</span></div>
            <div><b>{{ slots.length }}</b><span>Créneaux libres</span></div>
            <div><b>{{ patients.size }}</b><span>Patients</span></div>
            <div><b>{{ incomingTransfers.length }}</b><span>Demandes à traiter</span></div>
          </div>

          <section class="card">
            <div class="section-head">
              <div>
                <h2>Demandes de transfert</h2>
                <p class="muted">Un confrère vous demande votre consentement avant de vous donner accès au dossier.</p>
              </div>
              <button class="secondary" @click="loadTransfers">Actualiser</button>
            </div>

            <div v-for="t in incomingTransfers" :key="t.id" class="transfer">
              <div class="transfer-main">
                <b>Patient : {{ t.patient?.first_name }} {{ t.patient?.last_name }}</b>
                <p>Demandeur : Dr. {{ t.from_doctor?.first_name }} {{ t.from_doctor?.last_name }}</p>
                <p><strong>Motif :</strong> {{ t.transfer_reason }}</p>
                <p v-if="t.clinical_summary"><strong>Résumé clinique :</strong> {{ t.clinical_summary }}</p>
                <small>Demandé le {{ formatDate(t.requested_at) }}</small>
              </div>
              <div class="availability-box">
                <b>Votre agenda</b>
                <span v-if="availability[t.id]?.length">{{ availability[t.id].length }} créneau(x) libre(s) dans les 7 prochains jours</span>
                <span v-else>Vérification : aucun créneau libre trouvé dans les 7 prochains jours.</span>
                <button class="secondary" @click="loadAvailability(t)">Vérifier l’agenda</button>
                <div class="actions">
                  <button class="accept" @click="respond(t, true)">Accepter & recevoir le dossier</button>
                  <button class="reject" @click="respond(t, false)">Refuser</button>
                </div>
              </div>
            </div>
            <div v-if="!incomingTransfers.length" class="empty">Aucune demande de transfert en attente.</div>
          </section>

          <section class="card">
            <h2>Envoyer un dossier à un confrère</h2>
            <p class="muted">Le médecin destinataire doit être vérifié et accepter explicitement la demande avant d'obtenir l'accès.</p>
            <div class="form-grid">
              <select v-model="transferForm.dossierId">
                <option value="">Sélectionner un patient</option>
                <option v-for="p in transferablePatients" :key="p.dossierId" :value="p.dossierId">
                  {{ p.name }}
                </option>
              </select>
              <select v-model="transferForm.toDoctorId">
                <option value="">Sélectionner un confrère</option>
                <option v-for="d in otherDoctors" :key="d.id" :value="d.id">
                  Dr. {{ d.first_name }} {{ d.last_name }} — {{ d.specialty }}
                </option>
              </select>
              <input v-model="transferForm.reason" placeholder="Motif du transfert">
              <textarea v-model="transferForm.clinicalSummary" placeholder="Résumé clinique utile au confrère"></textarea>
            </div>
            <button class="primary" :disabled="transferLoading" @click="sendTransfer">
              {{ transferLoading ? 'Envoi…' : 'Demander le consentement du confrère' }}
            </button>
            <small v-if="transferMessage" :class="transferSuccess ? 'success' : 'error'">{{ transferMessage }}</small>
          </section>

          <section class="card">
            <div class="section-head">
              <div>
                <h2>Fiches de soins à compléter</h2>
                <p class="muted">Les patients transmettent leur partie ; vous complétez les informations médicales puis validez la fiche.</p>
              </div>
              <button class="secondary" @click="loadCareForms">Actualiser</button>
            </div>
            <div v-for="f in careForms" :key="f.id" class="transfer">
              <div class="transfer-main">
                <b>{{ f.patient?.first_name }} {{ f.patient?.last_name }}</b>
                <p>{{ f.appointment?.reason_for_visit || 'Consultation' }} · {{ f.appointment?.scheduled_at ? formatDate(f.appointment.scheduled_at) : '' }}</p>
                <p v-if="f.patient_values?.patient_notes"><strong>Note patient :</strong> {{ f.patient_values.patient_notes }}</p>
                <p v-if="f.patient_values?.insurance_member_id"><strong>N° assuré :</strong> {{ f.patient_values.insurance_member_id }}</p>
              </div>
              <div class="consultation-grid">
                <div class="clinical-section">
                  <h3>Consultation</h3>
                  <textarea v-model="doctorDrafts[f.id].symptoms" placeholder="Symptômes / motif clinique"></textarea>
                  <textarea v-model="doctorDrafts[f.id].vital_signs_text" placeholder="Constantes : tension, température, pouls, poids, taille…"></textarea>
                  <textarea v-model="doctorDrafts[f.id].physical_examination" placeholder="Examen clinique"></textarea>
                  <textarea v-model="doctorDrafts[f.id].clinical_notes" placeholder="Compte rendu / observations"></textarea>
                  <textarea v-model="doctorDrafts[f.id].diagnosis" placeholder="Diagnostic"></textarea>
                  <textarea v-model="doctorDrafts[f.id].treatment_plan" placeholder="Plan de traitement / recommandations"></textarea>
                </div>
                <div class="clinical-section prescription-box">
                  <h3>Ordonnance</h3>
                  <p class="muted">Facultatif. Les médicaments ajoutés ici seront intégrés à l’ordonnance électronique lors de la clôture.</p>
                  <div v-for="(item, index) in doctorDrafts[f.id].prescription_items" :key="index" class="prescription-item">
                    <input v-model="item.medication_name" placeholder="Médicament">
                    <input v-model="item.dosage" placeholder="Dosage">
                    <input v-model="item.form" placeholder="Forme">
                    <input v-model.number="item.quantity" type="number" min="1" placeholder="Qté">
                    <input v-model="item.frequency" placeholder="Fréquence / posologie">
                    <input v-model.number="item.duration_days" type="number" min="1" placeholder="Durée (jours)">
                    <input v-model="item.instructions" placeholder="Instructions">
                    <button class="danger" type="button" @click="removePrescriptionItem(f.id,index)">Supprimer</button>
                  </div>
                  <button class="secondary" type="button" @click="addPrescriptionItem(f.id)">+ Ajouter un médicament</button>
                  <textarea v-model="doctorDrafts[f.id].prescription_instructions" placeholder="Conseils généraux de l’ordonnance"></textarea>
                </div>
              </div>
              <div class="actions">
                <button class="secondary" @click="saveCareForm(f,false)">Enregistrer la consultation</button>
                <button class="accept" @click="saveCareForm(f,true)">Valider et clôturer la consultation</button>
              </div>
              <small v-if="formMessages[f.id]" :class="formMessages[f.id].success ? 'success' : 'error'">{{ formMessages[f.id].text }}</small>
            </div>
            <div v-if="!careForms.length" class="empty">Aucune fiche transmise au médecin.</div>
          </section>

          <section class="card">
            <h2>Prochains rendez-vous</h2>
            <button class="primary" @click="createSlot">+ Ajouter un créneau demain</button>
            <div v-for="a in appointments" :key="a.id" class="row">
              <div><b>{{ a.patient?.first_name }} {{ a.patient?.last_name }}</b><p>{{ formatDate(a.scheduled_at) }} · {{ a.reason_for_visit }}</p></div>
              <span>{{ a.status }}</span>
            </div>
            <div v-if="!appointments.length" class="empty">Aucun rendez-vous à venir.</div>
          </section>

          <section class="card">
            <h2>Créneaux disponibles</h2>
            <div v-for="s in slots" :key="s.id" class="row">
              <span>{{ formatDate(s.start_time) }} — {{ new Date(s.end_time).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }}</span>
              <b>{{ s.consultation_mode }}</b>
            </div>
          </section>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis.');
const supabase = createClient(url, key);

const user = ref<any>(null);
const isDoctor = ref(false);
const email = ref('');
const password = ref('');
const error = ref('');
const appointments = ref<any[]>([]);
const slots = ref<any[]>([]);
const patients = ref(new Set<string>());
const incomingTransfers = ref<any[]>([]);
const careForms = ref<any[]>([]);
const doctorDrafts = reactive<Record<string, any>>({});
const formMessages = reactive<Record<string, {text:string; success:boolean}>>({});
const otherDoctors = ref<any[]>([]);
const availability = reactive<Record<string, any[]>>({});
const transferLoading = ref(false);
const transferMessage = ref('');
const transferSuccess = ref(false);
const transferForm = reactive({ dossierId: '', toDoctorId: '', reason: '', clinicalSummary: '' });

const transferablePatients = computed(() => {
  const seen = new Map<string, any>();
  appointments.value.forEach((a) => {
    if (a.patient_id && !seen.has(a.patient_id)) {
      seen.set(a.patient_id, { dossierId: a.dossier?.id || '', name: `${a.patient?.first_name || ''} ${a.patient?.last_name || ''}`.trim() });
    }
  });
  return Array.from(seen.values()).filter((p) => p.dossierId);
});

function formatDate(value: string) { return new Date(value).toLocaleString('fr-FR'); }

async function signIn() {
  error.value = '';
  const r = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  if (r.error) { error.value = r.error.message; return; }
  user.value = r.data.user;
  await load();
}

async function load() {
  if (!user.value) return;
  const role = await supabase.from('profiles').select('role').eq('id', user.value.id).single();
  isDoctor.value = role.data?.role === 'doctor';
  if (!isDoctor.value) return;

  const a = await supabase.from('appointments')
    .select('*,patient:profiles!appointments_patient_id_fkey(first_name,last_name),dossier:medical_dossiers!medical_dossiers_patient_id_fkey(id)')
    .eq('doctor_id', user.value.id).gte('scheduled_at', new Date().toISOString()).order('scheduled_at');
  appointments.value = a.data || [];
  patients.value = new Set(appointments.value.map((x) => x.patient_id).filter(Boolean));

  const s = await supabase.from('doctor_slots').select('*').eq('doctor_id', user.value.id).eq('status','available').gte('start_time', new Date().toISOString()).order('start_time');
  slots.value = s.data || [];

  await Promise.all([loadTransfers(), loadDoctors(), loadCareForms()]);
}

async function loadDoctors() {
  const r = await supabase.from('doctor_profiles')
    .select('profile_id,specialty,verification_status,profile:profiles!doctor_profiles_profile_id_fkey(id,first_name,last_name)')
    .eq('verification_status', 'verified');
  otherDoctors.value = (r.data || []).filter((d: any) => d.profile_id !== user.value.id).map((d: any) => ({ id: d.profile_id, specialty: d.specialty, first_name: d.profile?.first_name, last_name: d.profile?.last_name }));
}

async function loadTransfers() {
  if (!user.value || !isDoctor.value) return;
  const r = await supabase.from('dossier_transfers')
    .select('*,patient:profiles!dossier_transfers_patient_id_fkey(first_name,last_name),from_doctor:profiles!dossier_transfers_from_doctor_id_fkey(first_name,last_name)')
    .eq('to_doctor_id', user.value.id).eq('status', 'pending').order('requested_at', { ascending: false });
  if (!r.error) incomingTransfers.value = r.data || [];
}

async function loadCareForms() {
  if (!user.value || !isDoctor.value) return;
  const r = await supabase.from('insurance_form_submissions')
    .select('id,workflow_status,patient_values,professional_values,consultation_id,appointment_id,patient:profiles!insurance_form_submissions_patient_id_fkey(first_name,last_name),appointment:appointments!insurance_form_submissions_appointment_id_fkey(reason_for_visit,scheduled_at)')
    .in('workflow_status', ['patient_submitted','doctor_in_progress'])
    .order('created_at', { ascending: false });
  careForms.value = r.data || [];
  careForms.value.forEach((f: any) => {
    if (!doctorDrafts[f.id]) doctorDrafts[f.id] = { ...(f.professional_values || {}) };
    if (!doctorDrafts[f.id].prescription_items) doctorDrafts[f.id].prescription_items = [];
    if (!doctorDrafts[f.id].vital_signs_text) doctorDrafts[f.id].vital_signs_text = '';
  });
}

async function saveCareForm(form: any, complete: boolean) {
  error.value = '';
  formMessages[form.id] = { text: '', success: false };
  const draft = doctorDrafts[form.id] || {};
  let consultationId = form.consultation_id || null;

  if (!consultationId) {
    const started = await supabase.rpc('start_consultation_for_appointment', { p_appointment_id: form.appointment_id });
    if (started.error) { formMessages[form.id] = { text: started.error.message, success: false }; return; }
    consultationId = started.data?.id || null;
  }

  const professionalValues = {
    ...draft,
    vital_signs: draft.vital_signs || (draft.vital_signs_text ? { notes: draft.vital_signs_text } : {}),
  };

  const saved = await supabase.rpc('save_doctor_insurance_form', {
    p_submission_id: form.id,
    p_professional_values: professionalValues,
    p_consultation_id: consultationId,
    p_complete: false,
  });
  if (saved.error) { formMessages[form.id] = { text: saved.error.message, success: false }; return; }

  if (complete) {
    const items = (draft.prescription_items || []).filter((x: any) => String(x.medication_name || '').trim());
    const completed = await supabase.rpc('complete_consultation_and_issue_prescription', {
      p_consultation_id: consultationId,
      p_diagnosis: draft.diagnosis || null,
      p_clinical_notes: draft.clinical_notes || null,
      p_treatment_plan: draft.treatment_plan || null,
      p_prescription_items: items.length ? items : null,
      p_prescription_instructions: draft.prescription_instructions || null,
    });
    if (completed.error) { formMessages[form.id] = { text: completed.error.message, success: false }; return; }

    const locked = await supabase.rpc('save_doctor_insurance_form', {
      p_submission_id: form.id,
      p_professional_values: professionalValues,
      p_consultation_id: consultationId,
      p_complete: true,
    });
    if (locked.error) { formMessages[form.id] = { text: locked.error.message, success: false }; return; }
    formMessages[form.id] = { text: items.length ? 'Consultation clôturée et ordonnance créée.' : 'Consultation clôturée et fiche validée.', success: true };
  } else {
    formMessages[form.id] = { text: 'Consultation enregistrée.', success: true };
  }
  await loadCareForms();
}

function addPrescriptionItem(formId: string) {
  if (!doctorDrafts[formId]) doctorDrafts[formId] = {};
  if (!doctorDrafts[formId].prescription_items) doctorDrafts[formId].prescription_items = [];
  doctorDrafts[formId].prescription_items.push({ medication_name:'', dosage:'', form:'Comprimé', quantity:1, frequency:'', duration_days:7, instructions:'' });
}

function removePrescriptionItem(formId: string, index: number) {
  doctorDrafts[formId]?.prescription_items?.splice(index, 1);
}

async function loadAvailability(transfer: any) {
  const r = await supabase.from('doctor_slots').select('id,start_time,end_time,consultation_mode')
    .eq('doctor_id', user.value.id).eq('status','available')
    .gte('start_time', new Date().toISOString())
    .lte('start_time', new Date(Date.now() + 7 * 86400000).toISOString())
    .order('start_time');
  availability[transfer.id] = r.data || [];
}

async function sendTransfer() {
  transferMessage.value = '';
  if (!transferForm.dossierId || !transferForm.toDoctorId || !transferForm.reason.trim()) {
    transferSuccess.value = false; transferMessage.value = 'Sélectionnez le patient, le confrère et indiquez le motif.'; return;
  }
  transferLoading.value = true;
  const r = await supabase.rpc('initiate_dossier_transfer', {
    p_dossier_id: transferForm.dossierId,
    p_to_doctor_id: transferForm.toDoctorId,
    p_reason: transferForm.reason.trim(),
    p_clinical_summary: transferForm.clinicalSummary.trim() || null,
  });
  transferLoading.value = false;
  if (r.error) { transferSuccess.value = false; transferMessage.value = r.error.message; return; }
  transferSuccess.value = true;
  transferMessage.value = 'Demande envoyée. Le dossier ne sera accessible au confrère qu’après son acceptation.';
  transferForm.dossierId = ''; transferForm.toDoctorId = ''; transferForm.reason = ''; transferForm.clinicalSummary = '';
}

async function respond(transfer: any, accept: boolean) {
  const notes = accept ? 'Accepté après vérification de mon agenda.' : window.prompt('Motif du refus (optionnel)') || undefined;
  const r = await supabase.rpc('respond_to_dossier_transfer', { p_transfer_id: transfer.id, p_accept: accept, p_response_notes: notes || null });
  if (r.error) { window.alert(r.error.message); return; }
  await loadTransfers();
  if (accept) window.alert('Transfert accepté. Vous disposez maintenant d’un accès au dossier du patient pour sa prise en charge.');
}

async function createSlot() {
  if (!user.value) return;
  const start = new Date(Date.now() + 86400000); start.setMinutes(0,0,0);
  const end = new Date(start.getTime() + 30 * 60000);
  await supabase.from('doctor_slots').insert({ doctor_id:user.value.id, start_time:start.toISOString(), end_time:end.toISOString(), consultation_mode:'in_person', capacity:1, status:'available' });
  await load();
}

async function signOut() { await supabase.auth.signOut(); user.value = null; isDoctor.value = false; }
supabase.auth.getSession().then(async r => { user.value = r.data.session?.user || null; if (user.value) await load(); });
</script>

<style>
:root{font-family:Inter,system-ui,sans-serif;color:#102a43;background:#f5f8fc}*{box-sizing:border-box}body{margin:0}.page{min-height:100vh;padding:28px;background:linear-gradient(135deg,#e7f1ff,#f5fbff)}.shell{max-width:1100px;margin:auto}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:28px}.logo{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;color:#fff;font-weight:800;background:linear-gradient(135deg,#1677e8,#0aa38c)}.eyebrow{font-weight:700;color:#1677e8;margin:16px 0 4px}h1{font-size:clamp(2rem,6vw,3.2rem);margin:0}.auth,.card{background:#fff;padding:24px;border-radius:18px;box-shadow:0 10px 30px #14467814;margin-bottom:20px}.auth{max-width:460px}.auth input,.form-grid input,.form-grid textarea,.form-grid select{display:block;width:100%;padding:12px;margin:0;border:1px solid #d8e0ea;border-radius:10px;background:#fff;font:inherit}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.form-grid textarea{min-height:100px;grid-column:1/-1}.primary,.btn,.secondary,.accept,.reject{border:0;border-radius:10px;padding:11px 16px;cursor:pointer;font:inherit}.primary{background:#1677e8;color:#fff}.secondary{background:#edf4ff;color:#1554a0}.accept{background:#0b8f67;color:#fff}.reject{background:#fff0f0;color:#b42318}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}.stats div{background:#fff;padding:20px;border-radius:16px}.stats b,.stats span{display:block}.stats b{font-size:1.8rem}.stats span{color:#64748b}.row{display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-bottom:1px solid #e2e8f0}.row p{margin:4px 0;color:#64748b}.empty{padding:20px;color:#64748b}.muted{color:#64748b}.error,.success{display:block;margin-top:12px}.error{color:#b42318}.success{color:#087443}.warning{border:1px solid #f2c94c}.section-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.transfer{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;padding:18px 0;border-bottom:1px solid #e2e8f0}.consultation-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px}.clinical-section{border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#fbfdff}.clinical-section h3{margin:0 0 10px}.clinical-section textarea{min-height:78px;margin-bottom:10px}.prescription-item{display:grid;grid-template-columns:1.5fr 1fr 1fr .6fr 1.4fr .8fr 1.4fr auto;gap:7px;margin-bottom:8px}.prescription-item input{min-width:0}.danger{background:#fff0f0;color:#b42318;border:1px solid #fda29b;border-radius:8px;padding:8px;cursor:pointer}.transfer-main p{margin:7px 0}.availability-box{background:#f7fafc;padding:16px;border-radius:12px;display:flex;flex-direction:column;gap:10px}.actions{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:1000px){.consultation-grid{grid-template-columns:1fr}.prescription-item{grid-template-columns:1fr 1fr}.prescription-item .danger{grid-column:1/-1}}@media(max-width:800px){.stats{grid-template-columns:1fr 1fr}.transfer,.form-grid{grid-template-columns:1fr}.form-grid textarea{grid-column:auto}.section-head{flex-direction:column}}@media(max-width:500px){.stats{grid-template-columns:1fr}.page{padding:16px}.card,.auth{padding:18px}.row{flex-direction:column}}
</style>
