import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

export const CATEGORIES = [
  "Electronics",
  "Jewelry",
  "Men's Clothing",
  "Women's Clothing",
  "Kids's Clothing",
  "Books",
  "Home",
  "Beauty",
  "Sports",
  "Other",
];
const Product = sequelize.define(
  "Product",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false,
      defaultValue: "Other",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE", //when user is deleted, delete all products of that user (optional, but makes sense in this case)
    },
    orderId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

export default Product;
