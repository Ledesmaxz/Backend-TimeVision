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
  origin: ['https://time-vision-frontend-web.vercel.app', 'http://localhost:3000'],
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.listen(process.env.PORT_PC, () =>
    console.log(`Connect in the port PC ${process.env.PORT_PC}`)
);

mongoClient
    .connect(process.env.STRING_CONNECTION)
    .then(() => console.log("Success connection"))
    .catch((err) => console.error(err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes_system(app);
