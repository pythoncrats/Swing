import express from "express";

const route = express.Router();

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(401).json({
        message: "All fields are mandatory",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

export default route;
