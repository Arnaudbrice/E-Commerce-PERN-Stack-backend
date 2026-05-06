import sequelize from "../db/index.js";
import { DataTypes } from "sequelize";

const CartItem = sequelize.define("CartItem", {
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Carts", key: "id" },
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Products", key: "id" },
    onDelete: "SET NULL",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // Snapshot-Fields (like in Mongoose) — remain when product is deleted

  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default CartItem;
