import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const OrderItem = sequelize.define("OrderItem", {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Orders", key: "id" },
    onDelete: "CASCADE", //when order is deleted, delete all order items of that order
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Products", key: "id" },
    onDelete: "SET NULL", // when product is deleted, set productId to null in order items of that product (optional, but makes sense in this case)
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default OrderItem;
