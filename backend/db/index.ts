import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("ak4l_db", {
  migrations: "./migrations",
});
