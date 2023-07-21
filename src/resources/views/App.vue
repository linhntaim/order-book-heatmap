<template lang="pug">
router-view
</template>

<script>
export default {
    name: 'App',
    head() {
        return {
            templateParams: {
                site: {
                    name: this.$config.app.name,
                    url: this.$config.app.url,
                },
                separator: '-',
            },
            titleTemplate: '%s %separator %site.name',
        }
    },
}
</script>