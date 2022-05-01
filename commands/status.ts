import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'Sets bot status',
    
    slash: 'both',
    testOnly: true,

    minArgs: 1,
    expectedArgs: '<status>',

    ownerOnly: true,

    callback: ({client, text}) => {
        client.user?.setPresence({
            status: 'online',
            activities: 
            [
                {
                    name: text
                }
            ]
        })

        return 'Status updated'
    }
} as ICommand