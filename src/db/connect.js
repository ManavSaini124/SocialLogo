const mongoose = require('mongoose');

const connect = async()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`Connected to database: ${connection.connection.host}`);
    }catch(err){
        console.log(`Error: ${err.message}`);
    }
}

module.exports = connect;