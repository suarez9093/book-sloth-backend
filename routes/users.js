require("dotenv").config();
const express = require("express");
const router = express.Router();
const Joi = require("joi");
var mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect();

router.get("/", (req, res) => {
  const query = "SELECT * from User";
  connection.query(query, function (error, results, fields) {
    if (error) {
      res.status(500).send(error.sqlMessage);
      throw error;
    }
    res.send(results);
  });
});

router.get("/:id", (req, res) => {
  const query = `SELECT * from User WHERE user_id=${req.params.id}`;
  connection.query(query, function (error, results, fields) {
    if (!results) return res.status(404).send("User not found");
    else if (error) {
      res.status(500).send(error.sqlMessage);
      throw error;
    }
    res.send(results);
  });
});

router.post("/", (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().min(3).required(),
    last_name: Joi.string().min(3).required(),
    email: Joi.string().email().min(3).required(),
    photo: Joi.string().min(3).required(),
    message: Joi.string(),
  });

  const result = schema.validate(req.body);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  } else {
    const { first_name, last_name, email, photo, message, replies } = req.body;
    const query = `INSERT INTO USER (first_name, last_name, email, photo, message, replies) VALUES ('${first_name}','${last_name}',"${email}",'${photo}',"${message}", "${
      replies || "[]"
    }");`;
    connection.query(query, function (error, results, fields) {
      if (error) {
        res.status(500).send(error.sqlMessage);
        throw error;
      }
      res.send(req.body);
    });
  }
});

// Error. Will allow user so udpate without the user_id existing. Possibly another query to the db?
router.put("/:id", (req, res) => {
  const { first_name, last_name, email, photo, message } = req.body;
  const query = `UPDATE USER SET first_name="${first_name}",last_name="${last_name}",email="${email}",photo="${photo}",message="${message} "WHERE user_id=${req.params.id}`;

  connection.query(query, function (err, results, fields) {
    if (!results) return res.status(404).send("User not found");
    else if (err) {
      res.status(500).send(err.sqlMessage);
      throw error;
    }
    const result = validateUser(req.body);

    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    res.send(req.body);
  });
});

// Error. Will allow user so udpate without the user_id existing. Possibly another query to the db?
router.delete("/:id", (req, res) => {
  const query = `DELETE FROM USER WHERE user_id=${req.params.id}`;
  connection.query(query, function (err, results, fields) {
    if (!results) return res.status(404).send("User not found");
    else if (err) {
      res.status(500).send(err.sqlMessage);
      throw error;
    }

    res.send(results);
  });
});

function validateUser(user) {
  const schema = Joi.object({
    first_name: Joi.string().min(3).required(),
    last_name: Joi.string().min(3).required(),
    email: Joi.string().email().min(3).required(),
    photo: Joi.string().min(3).required(),
    message: Joi.string(),
  });

  return schema.validate(user);
}

module.exports = router;
