<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        Casper Manager demo site
      </v-app-bar-title>
    </v-app-bar>
    <v-main>
      <router-view v-slot="{ Component }">
        <v-fade-transition leave-absolute>
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
</script>
