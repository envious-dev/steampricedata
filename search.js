async function fetchDataFromBackend() {
    try {
        const response = await fetch('http://localhost:3000/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // You can process the data here
        return data;
    } catch (error) {
        console.error('Fetching data failed:', error);
    }
}

function postDataToServer(data) {
    fetch('http://localhost:3000/submit-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skin: data })
    })
    .then(response => response.text())
    .then(responseData => {
        BringSteamData(responseData)
    });
}

function BringSteamData(data) {
    const dataObject = JSON.parse(data);
    let lowPrice = dataObject.lowest_price
    let median = dataObject.median
    let buy_order = dataObject.buy_req
    let sell_order = dataObject.sell_req
    let volume = dataObject.volume
    let nameid = dataObject.nameid

    let logValues = [];
    
    if (lowPrice !== undefined) {
        logValues.push(`Lowest Price: ${lowPrice}`);
        document.getElementById('steamLow').innerText = "$" + lowPrice;
    }
    if (median !== undefined) {
        logValues.push(`Median: ${median}`);
        document.getElementById('steamMedian').innerText = "$" + median;
    }
    if (buy_order !== undefined) logValues.push(`Buy Order: ${buy_order}`);
    if (sell_order !== undefined) logValues.push(`Sell Order: ${sell_order}`);
    if (volume !== undefined) { 
        document.getElementById('steamVol').innerText = volume;
        logValues.push(`Volume: ${volume}`); 
    }
    if (nameid !== undefined) logValues.push(`NameID: ${nameid}`);

    console.log("Data on frontend: " + logValues.join(", "));
}

function setToZero() {
    document.getElementById('steamVol').innerText = 0
    document.getElementById('steamMedian').innerText ="$" + 0
    document.getElementById('steamLow').innerText = "$" + 0
}

document.addEventListener('DOMContentLoaded', function() {
    var searchButton = document.querySelector('.search');
    var inputField = document.querySelector('.searchInput[type="text"]'); // Select the input field
    var myImage = document.getElementById("skinImage");

    searchButton.addEventListener('click', function() {
        setToZero() // this function simply resets the fields, removing the old search data.
        var userInput = inputField.value; // Get the value from the input field
        if ( userInput.trim() === '') {
            console.log("No data entered")
        } else {
            
            const input = userInput
            const result = parseInput(input);
            console.log(result);

            var inputArray = userInput.trim().split(" "); // split the input string into 4 
            if(inputArray.length !== 4) {
                console.log(inputArray)
            } else {
                console.log("User input array:", inputArray);
                postDataToServer(inputArray)
            }
        }
    });
});

function parseInput(input) {
    let parts = input.split(' ');
    let skin, type, wear, stattrak = false;

    // is the item stattrack? boolean.
    const statTrakIndex = parts.findIndex(part => part.toLowerCase() === 'stattrak');
    if (statTrakIndex !== -1) {
        stattrak = true;
        parts.splice(statTrakIndex, 1); // Remove 'StatTrak' from the array
    }

    // assign variables
    skin = parts[0]; // Skin type
    type = parts[1]; // Skin name

    // float handling since float can be multi worded
    if (parts.length > 2) {
        wear = parts.slice(2).join(' '); // joins up float
    } else {
        wear = parts[2]; // if float is one word assigns it
    }

    return { stattrak, skin, type, wear };
}

const input = "AWP Fade Factory New";
const result = parseInput(input);
console.log(result); // { A: "AWP", B: "Fade", C: "Factory New", D: false }
