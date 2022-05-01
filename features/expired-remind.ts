import { Client, Role, TextChannel } from 'discord.js'
import remindSchema from '../models/remind-schema'

export default (client: Client) => {
    const check = async () => {
        const query = {
            expires: { $lt : new Date() }
        }

        const results = await remindSchema.find(query)

        for (const result of results)
        {
            const { guildId, channelId, roleId, text } = result
            const guild = await client.guilds.fetch(guildId)
            if (!guild)
            {
                console.log(`Guild ${guildId} no longer uses this bot.`)
                continue
            }

            const channel = guild.channels.cache.get(channelId) as TextChannel
            const role = guild.roles.cache.get(roleId) as Role

            channel.send(`${role} ${text}`)
        }

        await remindSchema.deleteMany(query)

        setTimeout(check, 1000 * 60)
    }
    check()
}

export const config = {
    displayName: 'Remind Channel',
    dbName: 'REMIND'
}