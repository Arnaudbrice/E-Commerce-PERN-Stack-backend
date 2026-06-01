import User from "../models/index.js";
import Cart from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
// nodejs built-in crypto module
import crypto from "crypto";
import mongoose from "mongoose";
import Address from "../models/Address.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

//********** POST /auth/register **********

export const register = async (req, res) => {
  const { email, password } = req.body;

  //input validation is made by zod

  // check if the user already exists in the database
  const existingUser = await User.findOne({ where: { email: email } });

  if (existingUser) {
    throw new Error("User already exists", { cause: 409 });
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create a new user
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  await Cart.create({ userId: user.id });

  // find the user but with password excluded by its model default scope
  const newUser = await User.findByPk(user.id);

  res.json(newUser);
};

//********** POST /auth/login **********

export const login = async (req, res) => {
  const { email, password } = req.body;

  // include the password in the query result by using the withPassword scope defined in the User model, and also populate addresses and defaultAddress
  const user = await User.scope("withPassword").findOne({
    where: { email },
    include: [
      { model: Address, as: "addresses" },
      {
        model: Address,
        as: "defaultAddress",
      },
    ],
  });

  if (!user) {
    throw new Error("Invalid Credentials", { cause: 400 });
  }

  // check if the password is correct
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid Password", { cause: 401 });
  }

  // define the payload
  const payload = {
    id: user.id,
    email: user.email,
  };

  // generate a JWT token based on the defined payload
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN + "d",
  });

  //get a plain object instead of a sequelize document, and delete the password property from the user object before sending the response back to the client
  const userDoc = user.toJSON();
  delete userDoc.password;
  //store the token in a cookie and set this cookie in the response header
  res.cookie("token", token, {
    httpOnly: true, //The cookie can’t be accessed by JavaScript (for security).
    secure: process.env.NODE_ENV === "production", //(in production) → The cookie is only sent over HTTPS.
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax", //(in production) → Allows cross-site requests (needed if frontend and backend run on different domains).
    maxAge: Number(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000, // 3 days in ms
    domain:
      process.env.NODE_ENV === "production" ?
        ".dev-with-arnaud.work"
      : undefined,
    path: "/", //to send cookie for all routes
  });

  // send the response back to the client including the cookie set in the response header
  res.json(userDoc);
};

//********** POST /auth/logout **********

export const logout = async (req, res) => {
  // clear the token within the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    domain:
      process.env.NODE_ENV === "production" ?
        ".dev-with-arnaud.work"
      : undefined,
    path: "/", // to clear cookie for all routes
  });

  res.status(200).json({ message: "Logged Out Successfully" });
};

/****************************************
 *           reset password
 ****************************************/

//********** POST /auth/mail-reset-password **********

export const sendMail = async (req, res) => {
  const { email } = req.body;

  console.log("email", email);

  if (!email) {
    throw new Error("Email is required", { cause: 400 });
  }

  //uses crypto module to create a random secured token consisting of 80 hexadecimal characters (Each byte is represented as two hexadecimal characters)
  const token = crypto.randomBytes(40).toString("hex");

  console.log("token", token);
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("User Not Found", { cause: 404 });
  }

  user.resetToken = token;
  user.resetTokenExpiration = new Date(Date.now() + 3600000); //3600000ms=3600s=60m=1h
  await user.save();

  await resend.emails.send({
    from: "Bon Marché<noreply@dev-with-arnaud.work>", // sender (display only)
    to: user.email, // recipient
    replyTo: email,
    subject: "Bon Marché - Password reset request",
    html: `<p>Reset Your Password: <a href="${process.env.FRONTEND_BASE_URL}/reset-password/${token}"><strong>Click Here</strong></a></p>`,
  });

  res
    .status(200)
    .json({ message: "Email for resetting password sent successfully" });
};

//********** GET /auth/reset-password/:token **********
export const getResetPassword = async (req, res) => {
  const { token } = req.params;

  // ensure password reset page can be called only within the expiration time of the token

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gt]: new Date() }, //check if the resetTokenExpiration date is greater than the current date, which means the token is still valid (not expired)
    },
  });

  if (!user) {
    throw new Error(
      "Invalid token, please send a new mail to reset your password",
      { cause: 404 },
    );
  }

  res.status(200).json(token);
};

//********** POST /auth/reset-password/:token **********
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() },
    },
  });

  // only reset the password if the token is valid
  if (!user) {
    throw new Error(
      "Invalid token, please send a new mail to reset your password",
      { cause: 404 },
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  /*  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiration = null;
  await user.save(); both works fine */

  await user.update({
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiration: null,
  });

  res.status(201).json({ message: "Password reset successfully" });
};

/****************************************
 *           Profile
 ****************************************/
//********** Put /auth/profile **********

export const updateProfile = async (req, res) => {
  const userId = req.user.id;

  const {
    label,
    firstName,
    lastName,
    companyName,
    phone,
    streetAddress,
    city,
    state,
    zipCode,
    country,
  } = req.body;

  const imageUrl = req.file?.secure_url; //from cloudinary response, secure_url is the url of the uploaded image
  console.log("imageUrl", imageUrl);

  //  Get the user document (with addresses array)

  const queriedUser = await User.findByPk(userId, {
    include: [
      { model: Address, as: "addresses" },
      { model: Address, as: "defaultAddress" },
    ],
  });

  //1- try to update the existing home address if the label is "Home" and if the user already has a home address, otherwise create a new address

  // Find the Address of the user with label "Home" among user's addresses

  const homeAddress = await Address.findOne({
    where: {
      userId,
      label: "Home",
    },
  });
  // Update or create the address
  if (homeAddress) {
    //if the user already has a home address, update it
    homeAddress.firstName = firstName;
    homeAddress.lastName = lastName;
    homeAddress.companyName = companyName;
    homeAddress.phone = phone;
    homeAddress.streetAddress = streetAddress;
    homeAddress.city = city;
    homeAddress.state = state;
    homeAddress.zipCode = zipCode;
    homeAddress.country = country;
    await homeAddress.save();
  } else {
    // If not found, create a new Address
    const newAddress = await Address.create({
      label,
      firstName,
      lastName,
      companyName,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      userId,
    });

    if (!queriedUser.defaultAddressId) {
      // Set the new address as the default address of the user
      await queriedUser.update(
        { defaultAddressId: newAddress.id },
        { where: { id: userId } },
      );
    }
  }

  // Update avatar AFTER address logic (for both cases)
  const updateData = {};
  if (imageUrl) {
    updateData.userAvatar = imageUrl; //updateData={ userAvatar: imageUrl}
  }

  // In Sequelize, we don't need to re-fetch after instance.update() — it mutates the instance in memory automatically. That's the key difference from Mongoose.
  await queriedUser.update({ userAvatar: imageUrl }); //the update instance method mutates and returns the same sequelize instance "user" that has been created using findbyPk, so user is returned without password

  // Re-fetch with associations (password excluded because of the default scope defined in the User model)
  const user = await User.findByPk(userId, {
    include: [
      { model: Address, as: "addresses" },
      { model: Address, as: "defaultAddress" },
    ],
  });

  if (!user) {
    // user not found
    throw new Error("User Not Found", { cause: 404 });
  }

  res.status(200).json({ user });
};

//********** POST /auth/shippingAddress **********
export const addShippingAddress = async (req, res) => {
  const userId = req.user._id;

  const { firstName, lastName, streetAddress, zipCode, city, state, country } =
    req.body;

  // check if the user already added this address as a shipping address to prevent duplicates (based on the firstName, lastName, streetAddress, zipCode, city, state and  country )

  const currentUser = await User.findById(userId).select("addresses").lean();
  if (!currentUser) {
    throw new Error("User Not Found", { cause: 404 });
  }

  // Case-insensitive duplicate check
  const esc = (v = "") => String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters for regex matching

  const existingAddress = await Address.findOne({
    _id: { $in: currentUser.addresses },
    firstName: { $regex: `^${esc(firstName)}$`, $options: "i" },
    lastName: { $regex: `^${esc(lastName)}$`, $options: "i" },
    streetAddress: { $regex: `^${esc(streetAddress)}$`, $options: "i" },
    zipCode: { $regex: `^${esc(zipCode)}$`, $options: "i" },
    city: { $regex: `^${esc(city)}$`, $options: "i" },
    state: { $regex: `^${esc(state)}$`, $options: "i" },
    country: { $regex: `^${esc(country)}$`, $options: "i" },
  });

  if (existingAddress) {
    throw new Error("Shipping address already exists", { cause: 400 });
  }

  //  Create a new document in the 'Address' collection
  const newAddress = await Address.create({
    firstName,
    lastName,
    streetAddress,
    zipCode,
    city,
    state,
    country,
  });

  // Push ONLY the new address's ID into the user's addresses array
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $push: { addresses: newAddress._id }, //push the new address _id to the user addresses array
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("addresses") // Populate to return the full address objects
    .populate("defaultAddress")
    .lean();

  if (!updatedUser) {
    throw new Error("User Not Found", { cause: 404 });
  }

  delete updatedUser.password;

  res.status(200).json({ user: updatedUser });
};

/****************************************
 *           auth me
 ****************************************/

//********** GET /auth/me **********
export const getMe = async (req, res) => {
  // from the authenticate middleware
  // we have access to the user object in the request object
  const { _id } = req.user;

  // populate addresses and defaultAddress
  const user = await User.findById(_id)
    .populate("addresses")
    .populate("defaultAddress")
    .lean();
  if (!user) {
    throw new Error("User Not Found", { cause: 404 });
  }

  console.log("user in getMe", user);
  res.json(user);
};
