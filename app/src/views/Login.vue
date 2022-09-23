<template>
    <div style="width: fit-content; height: fit-content; border: solid black; padding:10px;">
        <qrcode-vue v-if="qr" render-as="svg" size="300" :value="qr"></qrcode-vue>
        <v-progress-circular v-else indeterminate></v-progress-circular>
        <v-btn @click="send">Send</v-btn>
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
        send() {
            const request = JSON.stringify({ type: 'cmd-profilePictureUrl', data: { jid: 905375584811 } });
            window.ws.send(request);
        }
    }
}
</script>
<style>

</style>