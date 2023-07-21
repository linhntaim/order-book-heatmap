<template lang="pug">
.error.text-center.pt-5
    not-found
</template>

<script>
import NotFound from '../errors/NotFound'

export default {
    // eslint-disable-next-line
    name: 'Welcome',
    components: {NotFound},
}
</script>
