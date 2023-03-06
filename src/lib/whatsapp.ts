import {Client, NoAuth} from 'whatsapp-web.js'


export const whatsapp = new Client({
    authStrategy: new NoAuth()
})

