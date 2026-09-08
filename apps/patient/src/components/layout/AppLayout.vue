<template>
  <div class="app-shell">
    <aside class="app-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">CL</div>
        <div class="sidebar-logo-text">
          <span class="sidebar-logo-name">CareLink</span>
          <span class="sidebar-logo-role">Patient</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-nav-section">
          <span class="sidebar-nav-label">Principal</span>
          <RouterLink to="/dashboard" class="sidebar-link" :class="{ active: route.name === 'dashboard' }">🏠<span class="sidebar-link-text">Tableau de bord</span></RouterLink>
          <RouterLink to="/dossier" class="sidebar-link" :class="{ active: route.name === 'dossier' }">📋<span class="sidebar-link-text">Mon Dossier</span></RouterLink>
        </div>
        <div class="sidebar-nav-section">
          <span class="sidebar-nav-label">Soins</span>
          <RouterLink to="/appointments" class="sidebar-link" :class="{ active: route.path.startsWith('/appointments') }">📅<span class="sidebar-link-text">Rendez-vous</span></RouterLink>
          <RouterLink to="/prescriptions" class="sidebar-link" :class="{ active: route.name === 'prescriptions' }">💊<span class="sidebar-link-text">Ordonnances</span></RouterLink>
        </div>
        <div class="sidebar-nav-section">
          <span class="sidebar-nav-label">Services</span>
          <RouterLink to="/marketplace" class="sidebar-link" :class="{ active: route.name === 'marketplace' }">🛒<span class="sidebar-link-text">Marketplace</span></RouterLink>
          <RouterLink to="/cart" class="sidebar-link" :class="{ active: route.name === 'cart' }">🛍️<span class="sidebar-link-text">Panier</span><span v-if="cartCount > 0" class="sidebar-link-badge">{{ cartCount }}</span></RouterLink>
          <RouterLink to="/insurance" class="sidebar-link" :class="{ active: route.name === 'insurance' }">🛡️<span class="sidebar-link-text">Assurance santé</span></RouterLink>
          <RouterLink to="/nearby" class="sidebar-link" :class="{ active: route.name === 'nearby' }">📍<span class="sidebar-link-text">Autour de moi</span></RouterLink>
          <RouterLink to="/notifications" class="sidebar-link" :class="{ active: route.name === 'notifications' }">🔔<span class="sidebar-link-text">Notifications</span></RouterLink>
          <RouterLink to="/orders" class="sidebar-link" :class="{ active: route.path.startsWith('/orders') }">📦<span class="sidebar-link-text">Mes Commandes</span></RouterLink>
        </div>
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <img v-if="authStore.profile?.avatar_url" :src="authStore.profile.avatar_url as string" alt="Avatar" />
          <span v-else>{{ authStore.userInitials }}</span>
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ authStore.fullName }}</div>
          <div class="sidebar-user-role">Patient</div>
        </div>
        <button class="btn btn-ghost btn-icon" type="button" title="Déconnexion" @click="authStore.signOut()">↪</button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <main class="app-main">
      <header class="app-topbar">
        <button class="btn btn-ghost btn-icon sidebar-toggle" type="button" @click="sidebarOpen = !sidebarOpen">☰</button>
        <div class="flex-1">
          <slot name="topbar-title"><h1 style="font-size:var(--font-size-lg);font-weight:700">{{ pageTitle }}</h1></slot>
        </div>
        <slot name="topbar-actions" />
      </header>
      <div class="app-content"><slot /></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

withDefaults(defineProps<{ pageTitle?: string }>(), { pageTitle: 'CareLink' });
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const sidebarOpen = ref(false);
const cartCount = computed(() => cartStore.totalItems);
</script>

<style scoped>
.sidebar-toggle { display: none; }
.sidebar-overlay { position: fixed; inset: 0; background: rgb(0 0 0 / 0.4); z-index: 150; }
@media (max-width: 1024px) {
  .sidebar-toggle { display: inline-flex; }
  .app-sidebar.open { transform: translateX(0); z-index: 200; }
}
</style>
