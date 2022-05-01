import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
}

const remindSchema = new Schema({
    _id: reqString,
    channelId: reqString,
    messageId: reqString
})

const name = 'button-roles'

export default mongoose.models[name] || mongoose.model(name, remindSchema, name)