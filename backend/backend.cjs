const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { getHashname, getNameid, itemData } = require('./requestSteam.js');

app.use(express.json());

// Enable CORS for all routes

app.use(cors());

// Cors for frontend only
// app.use(cors({ origin: 'http://localhost:5500' }));


async function fetchData(item, skin, wear, stattrak) {
    const hashname = getHashname(item, skin, wear, stattrak);
    const data = await itemData(hashname);
    console.log(data);
    return data;
}

// function to actually request the data needed from steam. Uses functions from ./steamRequest.js.

// GET Endpoint
app.get('/data', (req, res) => {
    const data = { message: 'Hello from the backend!' };
    res.json(data);
});

// POST Endpoint
app.post('/submit-data', async (req, res) => {
    const receivedData = req.body; // for checking things are working
    console.log("Recieved data at backend.js", receivedData.skin)

    try {
        // We assume frontend is sending the right data now
        console.log(receivedData.skin[0], receivedData.skin[1], receivedData.skin[2], receivedData.skin[3])


        fetchData(receivedData.skin[0], receivedData.skin[1], receivedData.skin[2], receivedData.skin[3]).then(d => {
            console.log("Data: ", d);
            res.json({ 
                median: d.median_price,
                lowest_price: d.low_price,
                buy_req: d.buy_req,
                sell_req: d.sell_req,
                volume: d.volume,
                nameid: d.nameid,
                skin: receivedData.skin 
            }) 
        }) 

    } catch (error) {
        console.error('Error in fetchData:', error);
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
