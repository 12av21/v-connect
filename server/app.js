const express = require('express');
const app = express();
const mapRoutes = require('./routes/map');

// ...existing code...

app.use('/api', mapRoutes);

// ...existing code...

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
