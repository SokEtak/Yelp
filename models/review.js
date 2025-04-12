const mongoose = require('mongoose');
const {Schema} = mongoose

const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    body: {
        type: String,
        required: true
    },
    author:{type:Schema.Types.ObjectId,ref:'User'}
});

module.exports = mongoose.model('Review', reviewSchema);
