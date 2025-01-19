import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const {email,password, name} = req.body;
  
  try {
    const userExists = await User.findOne({email})

    if(userExists) {
      return res.status(400).send({message: "User already exists"})
    }
  
    const user = await User.create({
      name,
      email,
      password
    })
  
    res.status(201).json({user, message: "User created successfully"})
  } catch(error) {
    res.status(500).json({message: error.message})
  }
};


export const login = (req, res) => {
  res.send("login");
};

export const logout = (req, res) => {
  res.send("logout");
};  
