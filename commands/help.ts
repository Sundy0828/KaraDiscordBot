import {
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from 'discord.js'
import { ICommand } from "wokcommands";

const embeds: MessageEmbed[] = []
const pages = {} as { [key : string] : number }
const prefix = process.env.PREFIX

// create help pages
embeds.push(new MessageEmbed()
                .setTitle('Help')
                .setDescription('page 1')
                .addFields([
                    {
                        name: `${prefix}help`,
                        value: 'show help commands.'
                    },
                    {
                        name: `${prefix}btnrole <role> <emoji> <button style> <button label>`,
                        value: 'This creates a button for users to interact with to gain a role.'
                    },
                    {
                        name: `${prefix}remindin <time> <channel> <role> <text>`,
                        value: 'sets a remind in x amount of time for anyone with specific role. note: format time like this hh:mm:ss or 00:01:30 for a min and 30 sec'
                    }
                    ,
                    {
                        name: `${prefix}remindlist`,
                        value: 'shows all the reminds active, with when they will go off'
                    }
                ]))

const getRow = (id : string) => {
    const row = new MessageActionRow()

    row.addComponents(
        new MessageButton()
            .setCustomId('prev_embed')
            .setStyle('SECONDARY')
            .setEmoji('⬅️')
            .setDisabled(pages[id] === 0)
    )
    row.addComponents(
        new MessageButton()
            .setCustomId('next_embed')
            .setStyle('SECONDARY')
            .setEmoji('➡️')
            .setDisabled(pages[id] === embeds.length - 1)
    )

    return row
}

export default {
    category: 'Testing',
    description: 'give help to for commands',
    
    slash: 'both',
    testOnly: true,

    callback: async ({user, channel, message, interaction, member}) => {
        const id = user.id
        pages[id] = pages[id] || 0

        const embed = embeds[pages[id]]
        let reply: Message | undefined
        let collector

        const filter = (i : Interaction) => i.user.id === user.id

        if (message)
        {
            reply = await message.reply({
                embeds: [embed],
                components: [getRow(id)]
            })
            collector = reply.createMessageComponentCollector({filter})
        }
        else
        {
            interaction.reply({
                ephemeral: true,
                embeds: [embed],
                components: [getRow(id)]
            })
            collector = channel.createMessageComponentCollector({filter})
        }

        collector.on('collect', (btnInt) => {
            if (!btnInt)
            {
                return
            }

            btnInt.deferUpdate()

            if (btnInt.customId !== 'prev_embed' && btnInt.customId !== 'next_embed')
            {
                return
            }

            if (btnInt.customId === 'prev_embed' && pages[id] > 0)
            {
                --pages[id]
            }
            else if (btnInt.customId === 'next_embed' && pages[id] < embeds.length - 1)
            {
                ++pages[id]
            }

            if (reply)
            {
                reply.edit({
                    embeds: [embeds[pages[id]]],
                    components: [getRow(id)]
                })
            }
            else
            {
                interaction.editReply({
                    embeds: [embeds[pages[id]]],
                    components: [getRow(id)]
                })
            }
        })
    }
} as ICommand