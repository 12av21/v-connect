const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/geocode', async (req, res) => {
    const { lat, lng } = req.query;
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBjzQPCliDqrzxAv6C_0UtAImHc5O2IB9k`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

module.exports = router;
