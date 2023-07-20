import Joi from "joi";

const userSchema = Joi.object({
  userName: Joi.string().min(3).max(15).required(),
  email:Joi.string().email({tlds:{allow:['com','net']}}),
  password:Joi.string().pattern(new RegExp('^[A-z]')).required(),
  // /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[0-9]){8,}/
  cPassword:Joi.ref('password'),
  age:Joi.number().integer().min(16).max(100),
  gender:Joi.string().valid('male', 'female'),
  phone:Joi.string().pattern(new RegExp('^01[0-9]{8}')),
});
