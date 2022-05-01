import {
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from 'discord.js'
import { ICommand } from "wokcommands";
import remindSchema from '../models/remind-schema';

const embeds: MessageEmbed[] = []
const pages = {} as { [key : string] : number }
const prefix = process.env.PREFIX

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
    description: 'show all reminders currently set',
    
    slash: 'both',
    testOnly: true,

    callback: async ({guild, user, channel, message, interaction}) => {
        if (!guild)
        {
            return 'Please use this command within a server.'
        }
        
        const query = {
            guildId: guild.id
        }

        const results = await remindSchema.find().where('guildId').equals(guild.id)
        var count = 1
        var fields = []
        if (results.length < 1)
        {
            return "There are no reminders currently set."
        }

        // create pages with 5 reminders at a time
        for (const result of results)
        {
            const { expires, text } = result
            fields.push({
                name: `Reminder ${count}`,
                value: `At ${expires} the message "${text}" will send.`
            })
            if (count % 5 === 0)
            {
                // create help pages
                embeds.push(new MessageEmbed()
                    .setTitle('Reminders')
                    .setDescription(`page ${Math.ceil(count/5)}`)
                    .addFields(fields))
                fields = []
            }
            count++
        }

        if (fields)
        {
            embeds.push(new MessageEmbed()
                    .setTitle('Reminders')
                    .setDescription(`page ${Math.ceil(count/5)}`)
                    .addFields(fields))
        }
        
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