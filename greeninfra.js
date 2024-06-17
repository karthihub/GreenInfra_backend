const express = require("express");
const cors = require("cors");
const dbConfig = require('./app/config/db.config');
const logger = require("./app/models/logger.model");
const app = express();

const https = require('https');
const path = require('path');
const fs = require('fs');


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "Blueprint");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
})

const upload = multer({ storage });


app.use(cors({
    origin: ['http://agamservices.agamdigital.in:65012', 'https://agamservices.agamdigital.in:65011', 'http://localhost', 'https://192.168.1.5', 'https://192.168.1.5'],
        // '*','http://localhost:8100','http://localhost:8084','http://192.168.1.5:8084', 'http://agamservices.agamdigital.in:65012', 'https://agamservices.agamdigital.in:65011' ],
    credentials: true,

    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    
}));

// Handle preflight requests
app.options('*', cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require('./app/models');
const Role = db.role;



db.mongoose
    .connect(`${dbConfig.URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        // initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// welcome route
app.get("/", (req, res) => {
    logger.info("Welcome to NCC Infra.", { q: req.query.q });
    res.json({ message: "Welcome to NCC Infra." });
});

//upload image
app.post("/uploadImage", upload.single("file"), (req, res) => {
    const kycImage = req.file;
    if (kycImage) {
        res.json({ image: kycImage, status: true });
    } else {
        res.json({ message: "File upload filed, Please try again", status: false });
    }
});

// routes
require('./app/routes/adminauth.routes') (app);


app.use('/Blueprint', express.static('Blueprint'));


const sslServer = https.createServer(
    {
        key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    },
    app
)

// set port, listen for requests
const PORT1 = process.env.PORT || 65011;

const PORT2 = process.env.PORT || 65012;

sslServer.listen(PORT1, () => {
    console.log(`Server is running on port ${PORT1}.`);
});

app.listen(PORT2, () => {
    console.log(`Server is running on port ${PORT2}.`);
});



