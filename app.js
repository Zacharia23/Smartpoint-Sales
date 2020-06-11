const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Item = require("./models/Items");
const routes = require("./routes");
const bcryptJs = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const assert = require("assert"); 

const app = express();

/** passport config */
require("./config/passport")(passport);

var token = require("crypto").randomBytes(64).toString("hex");

/** Connect to MongoDB */
mongoose.connect("mongodb://localhost:27017/SmartPointTZ", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false, 
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

mongoose.connection
  .once("open", () => {
    console.log("MongoDB Connected!...");
  })
  .on("error", (error) => {
    console.log("Connection Error: ", error);
  });

/** Middleware Binding */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** Express Session middleware */
app.use(
  session({
    secret: token,
    resave: true,
    saveUninitialized: true,
  })
);

/** Passport Middleware */
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

/** Global Variables For flashes */
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/public", express.static("public"));
app.use("/", routes);

/** Assignments name -> value */
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("partials", __dirname + "/views/partials");

/** Register Handler - POST */
app.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  let errors = [];

  /** Check Required Fields */
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ msg: "Please Fill All Fields" });
  }

  /** Check if Passwords Match */
  if (password != confirmPassword) {
    errors.push({ msg: "Passwords Do not Match" });
  }

  /** Check password Length */
  if (password.length < 6) {
    errors.push({ msg: "Password Should be at least 6 Characters!" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      confirmPassword,
    });
  } else {
    /** If Validation Passes */
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        /** If User Exists */
        errors.push({ msg: "Email Already Exists!" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          confirmPassword,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        /** hash password */
        bcryptJs.genSalt(10, (err, salt) =>
          bcryptJs.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            /** Sets new password to Hash */
            newUser.password = hash;

            /** Saves New User */
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "You are Now Registered!");
                res.redirect("/");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

app.post("/inventory/addItem", (req, res, next) => {
  const {
    purchaseDate,
    itemCode,
    phoneModel,
    phoneStorage,
    phoneColor,
    imei,
    rate,
    priceUsd,
    priceTzs,
    cost,
    description,
    barCode,
  } = req.body;

  let errors = [];

  /** Check Required Fields */
  if (
    !purchaseDate ||
    !itemCode ||
    !phoneModel ||
    !phoneStorage ||
    !phoneColor ||
    !imei ||
    !rate ||
    !priceUsd ||
    !priceTzs ||
    !cost ||
    !description ||
    !barCode
  ) {
    errors.push({ msg: "Please Fill all Fields!.." });
  }

  if (errors.length > 0) {
    res.render("inventory", {name: req.user.name}, {
      errors,
      purchaseDate,
      itemCode,
      phoneModel,
      phoneStorage,
      phoneColor,
      imei,
      rate,
      priceUsd,
      priceTzs,
      cost,
      description,
      barCode,
    });
  } else {
    Item.findOne({
      imei:imei,
    }).then((item) =>{
      if (item) {
        errors.push({msg: "Phone Already Exists!... "});
      res.render("inventory", {name: req.user.name }, {
        errors,
        purchaseDate,
        itemCode,
        phoneModel,
        phoneStorage,
        phoneColor,
        imei,
        rate,
        priceUsd,
        priceTzs,
        cost,
        description,
        barCode,
      });
      } else {
        console.log(req.body);
        const items = new Item(req.body);
        items.save().then((item) => {
          req.flash("success_msg", "Item Added!");
          res.redirect("/inventory");
        }).catch((err) => console.log(err));
      }
    });
  }
});


app.post("/", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);
});


app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You Logged Out!");
  res.redirect("/");
});

app.get('/inventory/delete/:id', (req, res) => {
  Item.findByIdAndRemove(req.params.id, (err) => {
    if(err) {
      req.flash("error_msg", "Record Not Deleted"); 
      res.redirect("/inventory"); 
    } else {
      req.flash("success_msg", "Record Deleted"); 
      res.redirect("/inventory");
    }
  });
});

app.get('/inventory/edit/:id', (req, res) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) {
      req.flash("error_msg", "Could Not Update"); 
      res.redirect("/inventory");
    } else {
      res.render("edit-item", {itemDetails: item});
    }
  });
});

app.post('inventory/edit/:id', (req, res) => {
  Item.findByIdAndUpdate(req.params.id, req.body, (err) => {
    if (err) {
      req.flash("error_msg", "Something Went wrong!  Item Could Not be Updated"); 
      res.redirect('inventory/edit'+req.params.id); 
    } else {
      req.flash("success_msg", "Item Updated!..."); 
      res.redirect('/inventory');
    }
  })
})

app.listen(process.env.PORT || 3000);
