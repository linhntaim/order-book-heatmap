const fs = require('fs')

if (!fs.existsSync('./.env')) {
    fs.copyFileSync('./.env.example', './.env')
}

const publicVendorPath = './public/vendors'
const vendors = {
    './node_modules/bootstrap/dist': `${publicVendorPath}/bootstrap/dist`,
    './node_modules/@fortawesome/fontawesome-free/css': `${publicVendorPath}/fontawesome-free/css`,
    './node_modules/@fortawesome/fontawesome-free/webfonts': `${publicVendorPath}/fontawesome-free/webfonts`,
}
Object.keys(vendors).forEach(source => {
    if (!fs.existsSync(source)) {
        return
    }
    const destination = vendors[source]
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, {recursive: true})
    }
    fs.cpSync(source, destination, {recursive: true})
})
