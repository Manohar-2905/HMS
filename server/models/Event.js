const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String, required: true },
        date: { type: Date },
        category: { type: String, default: 'Celebration' },
    },
    { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
