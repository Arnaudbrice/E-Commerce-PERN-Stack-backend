import { Sequelize } from "sequelize";
import chalk from "chalk";
// Create a new instance of Sequelize with the connection string
const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: "postgres", // Specifies that the database dialect is PostgreSQL, which tells Sequelize how to communicate with the database.
  logging: false, // prevents Sequelize from logging SQL queries to the console, which can be useful for debugging but may clutter the output in production environments.
});
// top-Level Await ( use of await without to put it in an async function)
try {
  // test the connection by trying to authenticate
  await sequelize.authenticate();
  console.log(
    chalk.green("Connection to database has been established successfully."),
  );
} catch (error) {
  console.error(chalk.red("Unable to connect to the database:", error));
  process.exit(1); // Exits the process with a non-zero status code, indicating that an error occurred. This is important to prevent the application from running without a successful database connection.
}
// export the sequelize instance so it can be used in other parts of the application to define models and interact with the database.
export default sequelize;
