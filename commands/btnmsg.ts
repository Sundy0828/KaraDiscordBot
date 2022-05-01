import { TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js'
import roleMessageSchema from "../models/role-message-schema";

export default {
    category: 'Utility',
    description: 'send a message',
    
    slash: 'both',
    testOnly: true,

    permissions: ['ADMINISTRATOR'],

    minArgs: 2,
    expectedArgs: '<channel> <text>',
    expectedArgsTypes: ['CHANNEL', 'STRING'],

    options:
    [
        {
            name: 'channel',
            description: 'The target channel',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.CHANNEL
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

        const data = await roleMessageSchema.findById(guild.id)
        if (data)
        {
            return {
                custom: true,
                ephemeral: true,
                content: `There is already a message setup for this server.`
            }
        }

        args.shift()

        const text = args.join(' ')

        let channel: TextChannel
        if (message)
        {
            channel = message.mentions.channels.first() as TextChannel
        }
        else
        {
            channel = interaction.options.getChannel('channel') as TextChannel
        }

        const sentMessage = await channel.send(text || '')

        await new roleMessageSchema({
            _id: guild.id,
            channelId: channel.id,
            messageId: sentMessage.id
        }).save()

        if (interaction)
        {
            return {
                custom: true,
                content: "Message sent",
                ephemeral: true
            }
        }

        
    }
} as ICommand