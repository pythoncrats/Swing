import express from "express";
import { env } from "./config/env.js";
import pool from "./config/db.js";
import bcrpty from "bcrypt";
import route from "./routes/login.js";

const app = express();
app.use(express.json());

//Create pool

const connection = await pool.getConnection();

try {
  if (!connection) {
    console.log("there's no connection");
  }

  console.log("connected successfully to database");
} catch (error) {
  console.error("server error", error);
}

app.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    const full_nameTrim = full_name.trim();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();
    const phoneTrim = phone.trim();
    const roleTrim = role.trim();

    if (
      !full_nameTrim ||
      !emailTrim ||
      !passwordTrim ||
      !phoneTrim ||
      !roleTrim
    ) {
      return res.status(401).json({
        message: "All fields are mandatory",
      });
    }

    if (
      passwordTrim.length < 8 ||
      !/[a-zA-Z]/.test(passwordTrim) ||
      !/[0-9]/.test(passwordTrim)
    ) {
      return res.status(401).json({
        message:
          "Weak password ! should have atleast eight characters, a later plus a number",
      });
    }

    const addUser =
      "INSERT INTO users(full_name, email, password, phone, role) VALUES (?,?,?,?,?)";

    const encryptPassword = await bcrpty.hash(passwordTrim, 10);

    const emailCheck =
      "SELECT full_name, email, password, phone, role FROM users WHERE email = ?";

    const [emailChecked] = await pool.query(emailCheck, [emailTrim]);

    const phoneName =
      "SELECT full_name, email, password, phone, role FROM users WHERE phone = ?";

    const [checkedPhone] = await pool.query(phoneName, [phoneTrim]);

    if (emailChecked.length > 0 || checkedPhone.length > 0) {
      return res.status(409).json({
        message: "user already exists",
      });
    }

    const [userAdded] = await pool.query(addUser, [
      full_nameTrim,
      emailTrim,
      encryptPassword,
      phoneTrim,
      roleTrim,
    ]);

    return res.status(200).json({
      message: "registered successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

app.use("/api/users", route);

const PORT = env.appPort;

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}/api/users`);
});
