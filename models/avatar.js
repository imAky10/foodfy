const mongoose = require("mongoose");

const AvatarSchema = new mongoose.Schema({
    avatarImage: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Avatar = mongoose.model("Avatar", AvatarSchema);

module.exports = Avatar;