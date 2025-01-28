class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errorDetails = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode;
        this.data = null;
        // this.message = false;
        this.errorDetails = errorDetails;
        this.success = false;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;