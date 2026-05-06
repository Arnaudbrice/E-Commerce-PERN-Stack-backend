import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

// Define the Cart model with its attributes and options

const Cart = sequelize.define("Cart", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Each user can have only one cart
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

export default Cart;
