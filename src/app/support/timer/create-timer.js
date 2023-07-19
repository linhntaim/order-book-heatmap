import {registerPropertyFactory} from '@/app/support/helpers'
import {Timer} from './timer'

export function createTimer() {
    return {
        install(app) {
            registerPropertyFactory(
                app.config.globalProperties,
                '$timer',
                () => new Timer(),
            )
        },
    }
}