const express = require('express');
const path = require('path');
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const { connectMongoDB } = require('./connection');
const URL = require('./models/url');
const app = express();
const PORT = 8001;

connectMongoDB('mongodb://localhost:27017/short-url').then(() => {
    console.log("MongoDB connected");
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { shortId },
        { $push: { visitHistory: { timestamp: Date.now() } } },
        { new: true }
    );
    if (entry && entry.redirectUrl) {
        res.redirect(entry.redirectUrl);
    } else {
        res.status(404).send('Redirect URL not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server Started at port : ${PORT}`);
});
