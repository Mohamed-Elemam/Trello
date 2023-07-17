


export const errorHandling = (API)=>{


    return (req,res,next) => {
        API(req , res , next).catch((err)=>{
            console.log(err)
          return  res.status(400).json({message:"failed"})

        })
        }
}