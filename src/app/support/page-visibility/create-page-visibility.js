export function createPageVisibility() {
    return {
        install(app) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    app.config.globalProperties.$bus.emit('pageVisible')
                }
            })
        },
    }
}