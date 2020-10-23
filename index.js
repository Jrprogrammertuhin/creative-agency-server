const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swu9d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mewxp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('agency'));
app.use(fileUpload());

// const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(err);
    const agencyCollection = client.db("creativeAgency").collection("Agency");


    app.post('/addAService', (req, res) => {
        console.log(req.body)
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const filePath = `${__dirname}/agency/${file.name}`;
        // console.log(req)
        console.log(file, title, description);
        file.mv(filePath, err => {
            if (err) {
                console.log(err);
                res.status(500).send("field to upload img")
            }
            const newImg = fs.readFileSync(filePath);
            const encImg = newImg.toString('base64');

            var image = {
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg, 'base64')
            };
            agencyCollection.insertOne({ image, title, description })
                .then(result => {
                    console.log(result)
                    fs.remove(filePath, error => {
                        if (error) {
                            console.log(error);
                        }
                        res.send(result.insertedCount > 0);
                        
                    })

                })

        })



    })
    client.close();

});



app.listen(5000)
// app.listen(process.env.PORT || port)