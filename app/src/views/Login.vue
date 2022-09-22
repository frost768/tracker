<template>
    <div style="width: fit-content; height: fit-content; border: solid black; padding:10px;">
        <qrcode-vue v-if="qr" render-as="svg" size="300" :value="qr"></qrcode-vue>
        <v-progress-circular v-else indeterminate></v-progress-circular>
    </div>
</template>
<script>
import QrcodeVue from 'qrcode.vue';
import { mapGetters } from 'vuex';
export default {
    components: {
        QrcodeVue
    },
    data() {
        return {
            a: 6,
        };
    },
    computed: {
        ...mapGetters(['qr'])
    },
    methods: {
        d() {
            console.log('dsd');
        }
    }
}
</script>
<style>

</style>