<script setup lang="ts">
</script>

<template>
  <div class="landing">
    <section class="hero surface">
      <h2>Vergelijk thuisbatterijen</h2>
      <p class="hero-sub">
        Vind de beste thuisbatterij voor jouw situatie. Objectief, onafhankelijk en actueel.
      </p>
      <div class="hero-actions">
        <router-link to="/zoek" class="btn btn-primary">Welke batterij voor mij?</router-link>
        <router-link to="/database" class="btn btn-secondary">Bekijk alle modellen</router-link>
      </div>
    </section>

    <section class="info-section">
      <div class="info-card surface">
        <h3>Wat is een thuisbatterij?</h3>
        <p>
          Een thuisbatterij is een plug-in opslagsysteem waarmee je elektriciteit kunt opslaan
          voor later gebruik. Denk aan energie van zonnepanelen of goedkoop stroom bij dynamische
          contracten. Je slaat op wanneer het goedkoop is, en gebruikt het wanneer de prijzen
          hoger liggen, bijvoorbeeld in de avond.
        </p>
      </div>
      <div class="info-card surface">
        <h3>Waarom een thuisbatterij?</h3>
        <p>
          Met stijgende energieprijzen en toenemende populariteit van zonnepanelen en dynamische
          energiecontracten wordt een thuisbatterij steeds interessanter. Je bespaart op je
          energierekening en bent minder afhankelijk van het net, en sommige modellen bieden zelfs
          noodstroom bij stroomuitval.
        </p>
      </div>
    </section>

    <section class="about-section">
      <div class="info-card surface">
        <p>
          Deze site poogt zo objectief mogelijk de momenteel op de Nederlandse markt beschikbare
          thuisbatterijen te presenteren. De selectie is beperkt tot plug-in-batterijen waarover
          voldoende (prijs)informatie beschikbaar is. Wij doen ons uiterste best de gepresenteerde
          data correct te laten zijn.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero {
  text-align: center;
  padding: 2.5rem 1.5rem;
}

.hero h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.hero-sub {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .info-section {
    grid-template-columns: 1fr;
  }
}

.info-card {
  padding: 1.25rem;
}

.info-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.info-card p {
  color: var(--color-text-muted);
  line-height: 1.6;
}

.about-section {
  display: grid;
  gap: 1rem;
}

</style>
