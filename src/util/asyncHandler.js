const async_handler = (fn) =>{
     return async (req,res,next) =>{
        try{
            await fn(req,res,next)
        }catch(err){
            console.log("Error => ",err)
            res.status(err.status|| 500).json({success:false, message: err.message})
        }
    }
}
// const async_handler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }

module.exports = async_handler;