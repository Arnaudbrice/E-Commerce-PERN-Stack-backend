import jwt from "jsonwebtoken";

import { User } from "../models/index.js";

//********** GET /user/me **********

const authenticate = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new Error("Not Authenticated,\nPlease Login First", { cause: 401 });
  }

  // checks if the token is valid and decodes it
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  console.log("payload", payload);
  const user = await User.findByPk(payload.id, {
    raw: true, //return plain json
    plain: true, //Take it out of the array wrapper (returns {} instead of [{}]), because findById of findOne returns a single object or null by default
  });
  if (!user) {
    throw new Error("User not found", { cause: 401 });
  }

  // no need to delete password, because sequelize uses the default scope to exclude password from the response when we fetch user data, but if we use the withPassword scope, we need to delete it manually
  req.user = user;

  next();
};

export default authenticate;
