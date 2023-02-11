require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();

// To receive request data need to be declared express json
app.use(express.json());

// To receive form data need to be declared express urlencoded
app.use(express.urlencoded({ extended: true }));
const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The title is required."],
    minlength: [8, "too short"],
    // custom validation
    validate: {
      validator: function (v) {
        return v.length == 10;
      },
      message: (data) => `${data.value} is not a valid title.`,
    },
  },
  price: {
    type: Number,
    min: [10, "Must be at least 10, got {VALUE}"],
    max: [200],
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: (data) => `${data.value} is not a standard format`,
    },
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// This is another way to connect db

// mongoose.connect('mongodb://127.0.0.1:27017/firstCrud')
// .then(()=>console.log("DB is connected"))
// .catch((error)=>{
//     console.log("DB is not connected");
//     console.log(error);
//     process.exit(1);
// });

// To connect Db using a function
mongoose.set("strictQuery", false);
const connectionToDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/firstCrud");
    console.log("DB is connected");
  } catch (error) {
    console.log("DB is not connected");
    console.log(error.message);
    process.exit(1);
  }
};

const port = process.env.PORT || 5002;

// create model
const product = mongoose.model("products", Schema);
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.listen(port, async () => {
  console.log(`Server is starting at http://localhost:${port}`);
  await connectionToDB();
});

// post data
app.post("/product", async (req, res) => {
  try {
    const title = req.body.title;
    // get data from request body
    const newProduct = new product({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      phone: req.body.phone,
    });

    const proData = await newProduct.save();
    res.status(201).send(proData);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});
// get data
app.get("/products", async (req, res) => {
  try {
    // take price from request body
    const price = req.query.price;
    let result = [];
    if (price) {
      // specific data
      result = await product.find({ price: { $gt: price } });
    } else {
      //all data
      result = await product.find();
    }

    if (result.length > 0) {
      res.status(201).send(result);
    } else {
      res.status(201).send({
        message: "product is not found.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// get specific data
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await product.findOne({ _id: id }).select({
      title: 1,
      _id: 0,
    });
    if (result) {
      res.status(201).send({
        success: true,
        message: "Result is found",
        data: result,
      });
    } else {
      res.status(201).send({
        success: false,
        message: "product is not found.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});
app.delete("/delete/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await product.deleteOne({ _id: id });
    if (result.deletedCount != 0) {
      res.status(201).send({
        success: true,
        message: "product deleted successfully.",
        data: result,
      });
    } else {
      res.status(201).send({
        success: false,
        message: "product is not found.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});
//update product
app.put("/update/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await product.updateOne(
      { _id: id },
      { $set: { description: req.body.description } }
    );

    if (result) {
      if (result.modifiedCount != 0) {
        res.status(201).send({
          success: true,
          message: "product updated successfully.",
          data: result,
        });
      } else {
        res.status(201).send({
          success: false,
          message: "Product id is not found.",
          data: result,
        });
      }
    } else {
      res.status(201).send({
        success: false,
        message: "product is not found.",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});
