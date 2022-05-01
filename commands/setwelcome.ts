import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js'
import welcomeSchema from "../models/welcome-schema";

export default {
    category: 'Testing',
    description: 'sets the welcome message and auto grant roles',
    
    slash: 'both',
    testOnly: true,

    permissions: ['ADMINISTRATOR'],

    minArgs: 3,
    expectedArgs: '<channel> <role> <text>',

    options:
    [
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

        let text = interaction?.options.getString('text')
        if (message)
        {
            args.shift()
            text = args.join(' ')
        }

        await welcomeSchema.findOneAndUpdate({
            _id: guild.id
        },
        {
            _id: guild.id,
            text,
            channelId: targetChannel.id,
            roleId: targetRole.id
        },
        {
            upsert: true
        })

        return 'welcome channel set!'
    }
} as ICommand