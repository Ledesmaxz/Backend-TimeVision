const express = require("express");
const mongoClient = require("mongoose");
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require("body-parser");

const routes_system = require("./src/routes");
const app = express();
require("dotenv").config();

app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.listen(process.env.PORT_PC, () =>
    console.log(`Connect in the port PC ${process.env.PORT_PC}`)
);

mongoClient
    .connect(process.env.STRING_CONNECTION)
    .then(() => console.log("Success connection"))
    .catch((err) => console.error(err));


app.use(express.json());
routes_system(app);
