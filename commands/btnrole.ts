import { Client, EmojiIdentifierResolvable, GuildMember, MessageActionRow, MessageButton, MessageButtonStyleResolvable, Role, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js'
import roleMessageSchema from "../models/role-message-schema";

const buttonStyles = ['primary', 'secondary', 'success', 'danger']
const prefix = 'button-roles-'

export default {
    category: 'Utility',
    description: 'Adds an auto role to a message via buttons',
    
    slash: 'both',
    testOnly: true,

    permissions: ['ADMINISTRATOR'],

    minArgs: 2,
    expectedArgs: '<role> <emoji> <button style> <button label>',

    options:
    [
        {
            name: 'role',
            description: 'The target role',
            required: true,
            type: 'ROLE'
        },
        {
            name: 'emoji',
            description: 'The emoji to be used for the button',
            required: true,
            type: 'STRING'
        },
        {
            name: 'button-style',
            description: 'The style of the button',
            required: true,
            type: 'STRING',
            choices: buttonStyles.map((style) => ({
                name: style,
                value: style.toUpperCase()
            }))
        },
        {
            name: 'button-label',
            description: 'The label of the button',
            required: true,
            type: 'STRING'
        }
    ],

    init: (client : Client) => {
        client.on('interactionCreate', (interaction) => {
            if (!interaction.isButton())
            {
                return
            }

            const { guild, customId } = interaction
            if (!guild || !customId.startsWith(prefix))
            {
                return
            }

            const roleId = customId.replace(prefix, '')
            const member = interaction.member as GuildMember

            if (member.roles.cache.has(roleId))
            {
                member.roles.remove(roleId)

                interaction.reply({
                    ephemeral: true,
                    content: `You no longer have the role <@&${roleId}> role.`
                })
            }
            else
            {
                member.roles.add(roleId)

                interaction.reply({
                    ephemeral: true,
                    content: `You now have the role <@&${roleId}> role.`
                })
            }
        })
    },

    callback: async ({guild, message, interaction, args}) => {
        if (!guild)
        {
            return 'Please use this command within a server.'
        }

        args.shift()

        let role: Role
        if (message)
        {
            role = message.mentions.roles.first() as Role
        }
        else
        {
            role = interaction.options.getRole('role') as Role
        }

        const emoji = args.shift()

        const buttonStyle = args.shift() || 'primary'
        if (!buttonStyles.includes(buttonStyle.toLowerCase()))
        {
            return `Unknown button style. Valid styles are: "${buttonStyles.join('", "')}"`
        }

        const buttonLabel = args.join(' ')

        const data = await roleMessageSchema.findById(guild.id)
        if (!data)
        {
            return {
                custom: true,
                ephemeral: true,
                content: `No role message found. Send one using ${process.env.PREFIX}btnmsg`
            }
        }

        const {channelId, messageId } = data
        const channel = guild!.channels.cache.get(channelId) as TextChannel
        const roleMessage = await channel.messages.fetch(messageId)

        const rows = roleMessage.components
        const button = new MessageButton()
                            .setLabel(buttonLabel)
                            .setEmoji(emoji as EmojiIdentifierResolvable)
                            .setStyle(buttonStyle as MessageButtonStyleResolvable)
                            .setCustomId(`${prefix}${role.id}`)
        let added = false

        for (const row of rows)
        {
            if (row.components.length < 5)
            {
                row.addComponents(button)
                added = true
                break
            }
        }
        
        if (!added)
        {
            if (rows.length >= 5)
            {
                return {
                    custom: true,
                    ephemeral: true,
                    content: 'Cannot add more buttons to this message'
                }
            }

            rows.push(new MessageActionRow().addComponents(button))
        }

        roleMessage.edit({
            components: rows
        })

        return {
            custom: true,
            ephemeral: true,
            content: 'Added button to role message'
        }
    }
} as ICommand