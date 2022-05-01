import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
}

const remindSchema = new Schema({
    guildId: reqString,
    channelId: reqString,
    roleId: reqString,
    text: reqString,
    expires: Date
},
{
    timestamps: true
})

const name = 'reminders'

export default mongoose.models[name] || mongoose.model(name, remindSchema, name)