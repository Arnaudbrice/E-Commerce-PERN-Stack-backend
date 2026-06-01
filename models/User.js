import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

// Define the User model with its attributes and options
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false, //replaces mongoose requird:true,
    unique: true, //same as mongoose unique:true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    allowNull: false,
    defaultValue: "user", //mongoose default, sequelize defaultValue
  },
  userAvatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // FK for the default shipping address
  // Sequelize will automatically create a foreign key column in the Addresses table named defaultAddressId that references the id column of the Addresses table. This allows us to associate a default shipping address with each user.
  defaultAddressId: {
    type: DataTypes.INTEGER,
    allowNull: true, // This field can be null if the user hasn't set a default address
    references: {
      model: "Addresses", //table name(pluralized and capitalized by default by Sequelize)
      key: "id",
    },
    onDelete: "SET NULL", // If the referenced address is deleted, set defaultAddressId to null
  },
  // way to exclude password from the response when we fetch user data (alternativ to mongoose select:false)
  // the default scope will correctly exclude the password from all findByPk, findOne, findAll calls — without needing raw: true or manual delete user.password.
  defaultScope: {
    attributes: { exclude: ["password"] }, //take all excluding password
  },
  scopes: {
    withPassword: { attributes: {} }, //take all including password
  },
});

/* User.findAll(): without password.
User.scope('withPassword').findOne(): with passwort). */
export default User;
