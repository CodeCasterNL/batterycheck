<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue'
</script>

<template>
  <div class="faq">
    <h2>Veelgestelde Vragen</h2>

    <InfoCard id="maximaal-laadvermogen" title="Wat is het maximale laadvermogen?">
      <p>
        Een plug-in-batterij mag normaal gesproken maximaal 800 Watt via het stopcontact vragen of terugleveren. Slechts wanneer deze aansluiting exclusief voor de batterij op een eigen schakelautomaat ("zekering") 
        is aangesloten, mag de batterij meer terugleveren. Dit kan bij veel modellen worden ingeregeld via de app of configuratie van de batterij. We zien dan (ont)laadvermogens tot wel 2,5 kW (2500 Watt).
      </p>
    </InfoCard>

    <InfoCard id="p1-meter" title="Wat is een P1-meter?">
      <p>
        In je meterkast bevindt zich een elektriciteitsmeter, die continu bijhoudt hoeveel stroom er je huis in en uit gaat. Meters geven deze data bloot via de P1-poort, over het in de DSMR-standaard vastgelegde protocol. 
        Simpel gezegd kan een batterij via een P1-lezer of P1-meter continu zien hoeveel stroom je verbruikt of teruglevert, en zo het (ont)laadgedrag direct aanpassen op de situatie.
      </p>
    </InfoCard>

    <div class="faq-footer">
      <router-link to="/database" class="back-link">Terug naar alle batterijen</router-link>
    </div>
  </div>
</template>

<style scoped>
.faq {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.faq :deep(.info-card) {
  scroll-margin-top: 5rem;
}

.faq-footer {
  padding-top: 0.5rem;
}

.back-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}
.back-link:hover { text-decoration: underline; }
</style>
