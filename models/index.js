import User from "./User.js";
import Address from "./Address.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Product from "./Product.js";
import Review from "./Review.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import UserFavorites from "./UserFavorites.js";

/****************************************
 *           User/Address relationships
 ****************************************/
// User/Address(1:N) association
User.hasMany(Address, {
  foreignKey: "userId", // foreign key column in Address that references User.id
  as: "addresses",
  onDelete: "CASCADE",
}); //user.addresses -> array of addresses for that user
Address.belongsTo(User, {
  foreignKey: "userId", // foreign key column in Address that references User.id
  as: "user",
}); //address.user -> user for that address

// User/Address (1:1) relationship
// A user can point to one address as the default address
User.belongsTo(Address, {
  foreignKey: "defaultAddressId", // foreign key column in User that references Address.id
  as: "defaultAddress",
  constraints: false, // avoid circular foreign key issues during sync/migrations (if we have the reverse relation Address -> User)
});

/****************************************
 *           User/Cart relationships
 ****************************************/

// ── User ↔ Cart (1:1)
User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
});
Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ── Cart ↔ CartItem (1:N)
Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});
CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

// ── Product ↔  CartItem (1:N)
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });

CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ── User ↔ Product (1:N) ──
User.hasMany(Product, { foreignKey: "userId", as: "products" });
Product.belongsTo(User, { foreignKey: "userId", as: "user" });

// ── Product ↔ Review(1:N) ──
Product.hasMany(Review, {
  foreignKey: "productId",
  as: "reviews",
  onDelete: "CASCADE",
}); // when product is deleted, delete all reviews of that product
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ── User ↔ Review(1:N) ──
User.hasMany(Review, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  as: "reviews",
}); // when user is deleted, delete all reviews of that user
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// ── User ↔ Order(1:N) ──
User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ── Order ↔ OrderItem(1:N) ──
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "orderItems",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// product can exists without orderItem, but OrderItem cannot exist without product , so product is the strong entity
// ── Product ↔ OrderItem(1:N) ──
Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// A User can have many favorite Products and a Product can be the favorite of many users(M:N)
// ── User ↔ Product (M:N) ──
/* through: 'UserFavorites' tells Sequelize to create an intermediary table named UserFavorites to handle the many-to-many relationship */
User.belongsToMany(Product, {
  through: UserFavorites,
  as: "favoriteProducts",
  foreignKey: "userId",
  otherKey: "productId",
});
Product.belongsToMany(User, {
  through: UserFavorites,
  as: "favoriteUsers",
  foreignKey: "productId",
  otherKey: "userId",
});

export {
  User,
  Address,
  Cart,
  CartItem,
  Product,
  Review,
  Order,
  OrderItem,
  UserFavorites,
};
