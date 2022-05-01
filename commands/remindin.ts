import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js'
import remindSchema from "../models/remind-schema";

export default {
    category: 'Testing',
    description: 'sets a remind for anyone with specific role',
    
    slash: 'both',
    testOnly: true,

    minArgs: 4,
    expectedArgs: '<time> <channel> <role> <text>',

    options:
    [
        
        {
            name: 'time',
            description: 'When the message should be sent. Ex. hh:mm:ss or 00:01:30 for a min and 30 sec',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'channel',
            description: 'The target channel',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'role',
            description: 'The target role',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.ROLE
        },
        {
            name: 'text',
            description: 'The message to be delivered',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({guild, message, interaction, args}) => {
        if (!guild)
        {
            return 'Please use this command within a server.'
        }
        const targetChannel = message ? message.mentions.channels.first() : interaction.options.getChannel('channel')
        if (!targetChannel || targetChannel.type !== 'GUILD_TEXT')
        {
            return 'Please use a text channel'
        }

        const targetRole = message ? message.mentions.roles.first() : interaction.options.getRole('role')
        if (!targetRole)
        {
            return 'Please use a role'
        }
console.log(args)
        let time = interaction?.options.getString('time')
        if (message)
        {
            time = args[0]
        }

        if (!time) { return 'send time must be provided in one of these formats hh:mm:ss or 0h0m0s.' }

        let text = interaction?.options.getString('text')
        if (message)
        {
            args.shift()
            args.shift()
            args.shift()
            text = args.join(' ')
        }

        // parse time stuff
        var hour = 0
        var min = 0
        var sec = 0

        const values = time.split(':')
        sec = values.length > 0 ? Number(values[values.length - 1]) : 0
        min = values.length > 1 ? Number(values[values.length - 2]) : 0
        hour = values.length > 2 ? Number(values[values.length - 3]) : 0
        
        var expire = new Date()
        expire = new Date(new Date(expire).setHours(expire.getHours() + hour))
        expire = new Date(new Date(expire).setMinutes(expire.getMinutes() + min))
        expire = new Date(new Date(expire).setSeconds(expire.getSeconds() + sec))

        await new remindSchema(
        {
            guildId: guild.id,
            text,
            channelId: targetChannel.id,
            roleId: targetRole.id,
            expires: expire
        }).save()

        return 'reminder set!'
    }
} as ICommand