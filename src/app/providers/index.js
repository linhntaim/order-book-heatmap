import {factory} from './factory'
import {config} from './config'
import {log} from './log'
import {service} from './service'
import {encryption} from './encryption'
import {storage} from './storage'
import {cache} from './cache'
import {i18n, localization} from './settings'
import {store} from './store'
import {router} from './router'
import {url} from './url'
import {bus} from './bus'
import {pageVisibility} from './page-visibility'
import {timer} from './timer'
import {scrollbar} from './scrollbar'

// Should be maintained in order
export const providers = {
    factory,
    config,
    log,
    service,
    encryption,
    storage,
    cache,
    i18n,
    localization,
    store,
    router,
    url,
    bus,
    pageVisibility,
    timer,
    scrollbar,
}
