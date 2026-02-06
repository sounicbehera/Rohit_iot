const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ✅ CORS: Allows your Netlify site to communicate with this backend
app.use(cors({
    origin: 'https://rohit-iot.netlify.app'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. DATABASE CONNECTION
const mongoURI = "mongodb+srv://sounicbehera_db_user:RohitCutm@cluster0.mgxmky5.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB: Rohit_Iot"))
    .catch(err => console.error("❌ Connection error:", err));

// 2. SCHEMA & MODEL - UPDATED WITH REQUESTED FIELDS
const sensorSchema = new mongoose.Schema({
    device: String,
    temp: Number,              // Temperature
    humidity: Number,          // Humidity
    gas: Number,               // Gas sensor reading
    pressure: Number,          // Pressure
    location: {
        latitude: Number,      // Latitude coordinate
        longitude: Number      // Longitude coordinate
    },
    timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema, 'sensor_readings');

// 3. POST ROUTE (For ESP32)
app.post('/update', async (req, res) => {
    try {
        // Extract data from request body
        const { device, temp, humidity, gas, pressure, latitude, longitude } = req.body;
        
        // Create new sensor data entry
        const entry = new SensorData({
            device,
            temp,
            humidity,
            gas,
            pressure,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        });
        
        await entry.save();
        res.status(200).json({ 
            status: "success", 
            message: "Data saved successfully" 
        });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to save data" 
        });
    }
});

// 4. GET ROUTE (For Netlify Website)
app.get('/data', async (req, res) => {
    try {
        // Gets the latest 10 readings
        const latestData = await SensorData.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .select('device temp humidity gas pressure location timestamp');
        
        res.json(latestData);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to fetch data" 
        });
    }
});

// 5. GET LATEST SINGLE READING (Optional - useful for real-time display)
app.get('/latest', async (req, res) => {
    try {
        const latestReading = await SensorData.findOne()
            .sort({ timestamp: -1 })
            .select('device temp humidity gas pressure location timestamp');
        
        res.json(latestReading);
    } catch (error) {
        console.error("Error fetching latest data:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to fetch latest data" 
        });
    }
});

// 6. HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Backend is running",
        timestamp: new Date()
    });
});

app.listen(PORT, () => console.log(`🚀 Backend live on port ${PORT}`));
