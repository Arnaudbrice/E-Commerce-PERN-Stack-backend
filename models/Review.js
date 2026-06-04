import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Review = sequelize.define(
  "Review",
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Products", key: "id" }, //key:"id" ->the column in the Products table being referenced (the PK)
      onDelete: "CASCADE", //when product is deleted, delete all reviews of that product
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE", //when user is deleted, delete all reviews of that user
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

export default Review;
