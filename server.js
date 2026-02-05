const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ✅ UPDATED CORS: This allows your Netlify site to talk to this backend
app.use(cors({
    origin: 'https://rohit-iot.netlify.app'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. DATABASE CONNECTION
// Replace <password> and <cluster-url> with your Atlas details
const mongoURI = "mongodb+srv://sounicbehera_db_user:RohitCutm@cluster0.mgxmky5.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB: Rohit_Iot"))
    .catch(err => console.error("❌ Connection error:", err));

// 2. SCHEMA & MODEL
const sensorSchema = new mongoose.Schema({
    device: String,
    temp: Number,
    status: String,
    timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', sensorSchema, 'sensor_readings');

// 3. POST ROUTE (For ESP32)
app.post('/update', async (req, res) => {
    try {
        const entry = new SensorData(req.body);
        await entry.save();
        res.status(200).send("Data Saved");
    } catch (error) {
        res.status(500).send("Error");
    }
});

// 4. GET ROUTE (For Netlify Website)
app.get('/data', async (req, res) => {
    try {
        // Gets the latest 10 readings
        const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(10);
        res.json(latestData);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => console.log(`🚀 Backend live on port ${PORT}`));
