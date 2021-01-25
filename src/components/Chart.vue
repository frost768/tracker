<template>
  <apexchart :type="type" :options="options" :series="series"></apexchart>
</template>
<script>

export default {
  props: ['type', 'options','series'],
  
}
</script>

<style>
</style>