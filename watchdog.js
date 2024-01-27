
const client = require("./qldFuelApiClient");
const geofire = require("geofire-common");
const Store = require("./store")

const dotenv = require("dotenv");
dotenv.config();



client.getAllData().then((result) => {
  console.log(`store mode - ${process.env.MODE}`);
  const store = new Store(process.env.MODE);

  store.storeCollection("brands", result.brands, "BrandId");
  store.storeCollection("fuels", result.fuels, "FuelId");

  const sitesParsed = [];
  result.sites.forEach((site) => {
    site.Geohash = geofire.geohashForLocation([site.Lat, site.Lng]);
    const prices = {};
    result.sites_prices
      .filter((sp) => sp.SiteId === site.SiteId)
      .sort((a, b) =>
        a.TransactionDate.getTime() < b.TransactionDate.getTime() ? 1 : -1
      )
      .forEach((sp) => {
        if (!prices[sp.FuelId]) {
          prices[sp.FuelId] = sp;
        }
      });


    site.Prices = prices;
    sitesParsed.push(site);
  });


  store.storeCollection("sites", sitesParsed, "SiteId");


  // todo: for chart / history data only
  // const sitesPricesRef = db.collection("sites_prices");
  // result.sites_prices.forEach((sp) => {
  //   const site = result.sites.find((site) => site.SiteId == sp.SiteId);
  //   const parsedDate = new Date(sp.TransactionDateUtc).getTime();
  //   const key = `${sp.FuelId}_${sp.SiteId}_${parsedDate}`;

  //   if (site) {
  //     sp.Geohash = geofire.geohashForLocation([site.Lat, site.Lng]);
  //   }

  //   sitesPricesRef.doc(`${key}`).set(sp);
  // });

  // console.log("INFO", addedInfo)

  console.log("done");
});
