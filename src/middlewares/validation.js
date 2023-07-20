// import { Schema } from "mongoose"

const reqMethodes = ["body", "query", "params", "headers", "file", "files"];

export const coreValidationFunction = (shcema) => {
  return (req, res, next) => {
    const validationErrorArr = []
    for (const key of reqMethodes) {
      if (shcema[key]) {
        const validationResult = shcema[key].validate(req[key]);
        console.log(validationResult);
        if (validationResult.error) {
            validationErrorArr.push(validationResult.error.details)
        }
      }
    }
    if(validationErrorArr.length){
        return res.status(400).json({message : 'valdation error' , Errors:validationErrorArr});
    }
    next()
  };
};
