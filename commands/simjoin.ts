import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'Simulates a join',
    
    slash: 'both',
    testOnly: true,

    permissions: ['ADMINISTRATOR'],

    callback: ({member, client}) => {
        client.emit('guildMemberAdd', member)
        return 'join simulated'
    }
} as ICommand