import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Testing',
    description: 'Sends an embed',

    slash: 'both',
    testOnly: true,

    permissions: ['ADMINISTRATOR'],

    callback: ({text}) => {
        const json = JSON.parse(text)
        const embed = new MessageEmbed(json);
        return embed
    }
} as ICommand