import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const UserFavorites = sequelize.define("UserFavorites", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    primaryKey: true, //composite primary key with productId, because a user can only have one favorite entry for each product, but can have multiple favorite entries for different products
    onDelete: "CASCADE", //when user is deleted, delete all favorites of that user
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Products", key: "id" },
    primaryKey: true, //composite primary key with userId, because a product can only be favorited by one user, but can be favorited by multiple users
    onDelete: "CASCADE", //when product is deleted, delete all favorites of that product (optional, but makes sense in this case)
  },
});

export default UserFavorites;
