const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
// ESP32 sends data as x-www-form-urlencoded by default in your code
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const mongoURI = "mongodb+srv://sounicbehera_db_user:RohitCutm@cluster0.mgxmky5.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Successfully connected to MongoDB: Rohit_Iot"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// 2. SENSOR DATA SCHEMA (Defines the structure)
const sensorSchema = new mongoose.Schema({
    device: { type: String, required: true },
    temp: { type: Number, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});


const SensorData = mongoose.model('SensorData', sensorSchema, 'sensor_readings');

// 4. API ROUTE FOR ESP32
app.post('/update', async (req, res) => {
    console.log("📥 Incoming Data:", req.body);
    
    try {
        const entry = new SensorData({
            device: req.body.device,
            temp: req.body.temp,
            status: req.body.status
        });

        await entry.save();
        res.status(200).send("Data Received and Saved!");
    } catch (error) {
        console.error("❌ Save Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 5. GET ROUTE FOR YOUR WEBSITE (To show data in real-time)
app.get('/data', async (req, res) => {
    try {
        const latestData = await SensorData.find().sort({ timestamp: -1 }).limit(10);
        res.json(latestData);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});