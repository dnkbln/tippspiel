<script setup lang="ts">
import { useAppStore } from "../stores/app";

const appStore = useAppStore();
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Technischer Nullstand</p>
      <h1>{{ appStore.title }}</h1>
      <p class="lead">
        Vue 3 und Pinia sind vorbereitet. Die fachlichen Funktionen folgen im
        naechsten Schritt.
      </p>
      <ul class="checklist">
        <li>Frontend-Skelett aktiv</li>
        <li>Backend-Healthcheck vorgesehen</li>
        <li>Prisma- und PostgreSQL-Anbindung vorbereitet</li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(242, 203, 92, 0.4), transparent 35%),
    linear-gradient(180deg, #f8f4eb 0%, #eef2f0 100%);
  color: #13221a;
  font-family: "Segoe UI", sans-serif;
}

.hero {
  width: min(100%, 42rem);
  padding: 2rem;
  border: 1px solid rgba(19, 34, 26, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 1.5rem 4rem rgba(19, 34, 26, 0.08);
}

.eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8c4f21;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  line-height: 0.95;
}

.lead {
  margin: 1.25rem 0 0;
  font-size: 1.125rem;
  line-height: 1.6;
}

.checklist {
  margin: 1.5rem 0 0;
  padding-left: 1.25rem;
  line-height: 1.8;
}
</style>

