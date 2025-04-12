class ExpressError{
    constructor(message,statusCode){
        // super()
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = ExpressError