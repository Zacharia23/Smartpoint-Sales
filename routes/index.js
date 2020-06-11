const express = require("express");
const router = express.Router();
const Item = require("../models/Items");
const { ensureAuth } = require("../config/auth");

const getItems = Item.find({});

router.get("/", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

router.get("/home", ensureAuth, (req, res) => {
  res.render("home", {
    title: "Home",
    pageName: "home", 
    name: req.user.name,
  });
});

router.get("/inventory", ensureAuth, (req, res) => {
  getItems.exec(function (err, data) {
    if (err) throw err;
    res.render("inventory", {
      title: "Inventory",
      name: req.user.name,
      pageName: "home", 
      pageName: "inventory", 
      records: data,
    });
  });
});

router.get("/edit-item", ensureAuth, (req, res) => {
  res.render("edit-item", {
    title: "Update Items",
    pageName: "inventory", 
    name: req.user.name,
  });
});

module.exports = router;
