<template>
      <RouterView />
</template>

<script>
import { RouterView } from 'vue-router'

export default {
  name: 'App',
  components: {
    RouterView
  }
}
</script>

<style>
@font-face {
  font-family: 'Gilroy Bold';
  src: url('@/components/fonts/gilroy-bold.ttf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Gilroy Regular';
  src: url('@/components/fonts/gilroy-regular.ttf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Gilroy Medium';
  src: url('@/components/fonts/gilroy-medium.ttf') format('opentype');
  font-weight: normal;
  font-style: normal;
}
</style>