const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function getHashname(item, skin, wear, stat) {
    item = encodeURIComponent(item);
    skin = encodeURIComponent(skin);
    const float = {
        1: "%20%28Factory%20New%29",
        2: "%20%28Minimal%20Wear%29",
        3: "%20%28Field-Tested%29",
        4: "%20%28Well-Worn%29",
        5: "%20%28Battle-Scarred%29"
    };
    floatWear = float[wear];
    if (stat === 1) {
        item = "StatTrak%E2%84%A2%20" + item;
    } else {
        item = item;
    }
    const hashname = item + "%20%7C%20" + skin + floatWear;
    return hashname;
}

async function getNameid(hashname) {
    const response = await fetch(`https://steamcommunity.com/market/listings/730/${hashname}`);
    try {
        const text = await response.text();
        console.log(text)
        const nameid = text.split('Market_LoadOrderSpread( ')[1].split(' ')[0];
        return parseInt(nameid);
    } catch (error) {
        console.error("Error with finding itemID", error)
    }
}

async function itemData(hashname) {
    const nameid = await getNameid(hashname);
    const out = {};
    console.log(nameid)
    try {
        const orderResponse = await fetch(`https://steamcommunity.com/market/itemordershistogram?country=US&currency=1&language=english&two_factor=0&item_nameid=${nameid}`);
        const orderData = await orderResponse.text();
        try {
            out.buy_req = parseInt(orderData.split('\"highest_buy_order":\"')[1].split('\"')[0]) / 100;
            // this data is the highest buy order -- what users are willing to buy the item for ( max )
        } catch (error) { console.error("Error finding buy_req data.") }
        try {
            out.sell_req = parseInt(orderData.split('\"lowest_sell_order":\"')[1].split('\"')[0]) / 100;
            // this data is the lowest sale request -- the lowest listing essentially
        } catch (error) { console.error("Error finding sell_req data.") }
    } catch (error) {
        console.error("Error requesting buy/sell data")
    }
    try {
        const volumeResponse = await fetch(`https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${hashname}`);
        const volumeData = await volumeResponse.text();
        console.log(volumeData)
        try {
            out.volume = parseInt(volumeData.split('volume":"')[1].split('\"')[0]);
            // 24h sales volume of the item ( how many times it's sold ).
        } catch (error) { console.error("Error finding volume data.") }
        try {
            out.low_price = parseInt(JSON.parse(volumeData).lowest_price.replace('$', '').replace(',', ''));
            // this data is the lowest recent sale, what the item actually sold for. Not to be confused with lowest listing.
        } catch (error) { console.error("Error finding lowest price data.") }
        try {
            out.median_price = parseInt(JSON.parse(volumeData).median_price.replace('$', '').replace(',', ''));
            // this data is the lowest recent sale, what the item actually sold for. Not to be confused with lowest listing.
        } catch (error) { console.error("Error finding lowest price data.") }
    } catch (error) {
        console.error("Error requesting data from steam about volume");
    }
    try {
    out.nameid = nameid.toString();
    return out;
    } catch (error) {
        console.error("Error finding nameid.")
    }
}


module.exports = {
    getHashname,
    getNameid,
    itemData
};