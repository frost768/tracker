<template>
  <apexchart :type="type" :options="options" :series="options.series"></apexchart>
</template>
<script>

export default {
  props: ['type', 'options'],
}
</script>

<style>
</style>