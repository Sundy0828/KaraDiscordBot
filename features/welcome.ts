import { Client, Role, TextChannel } from 'discord.js'
import welcomeSchema from '../models/welcome-schema'

const welcomeData = {} as {
    [key: string] : [TextChannel, Role, string]
}

export default (client: Client) => {
    client.on('guildMemberAdd', async member => {
        const {guild, id } = member

        let data = welcomeData[guild.id]

        if (!data)
        {
            const results = await welcomeSchema.findById(guild.id)
            if (!results)
            {
                return
            }
            
            const { channelId, roleId, text } = results
            const channel = guild.channels.cache.get(channelId) as TextChannel
            const role = guild.roles.cache.get(roleId) as Role
            data = welcomeData[guild.id] = [channel, role, text]


            member.roles.add(role)
        }

        data[0].send({
            content: data[2].replace(/@/g, `<@${id}>`)
        })

    })
}

export const config = {
    displayName: 'Welcome Channel',
    dbName: 'WELCOME_CHANNEL'
}