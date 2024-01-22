const admin = require("firebase-admin");
const client = require("./qldFuelApiClient");
const serviceAccount = require("./serviceAccountKey.json");
const { getFirestore } = require("firebase-admin/firestore");
const Firestore = require("@google-cloud/firestore");
const geofire = require("geofire-common");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore(app);



client.getAllData().then((result) => {
  const brandsRef = db.collection("brands");
  result.brands.forEach((brand) => {
    brandsRef.doc(`${brand.BrandId}`).set(brand);
  });

  const fuelsRef = db.collection("fuels");
  result.fuels.forEach((fuel) => {
    fuelsRef.doc(`${fuel.FuelId}`).set(fuel);
  })

  const sitesRef = db.collection("sites");
  result.sites.forEach(site => {
    site.geohash = geofire.geohashForLocation([site.Lat, site.Lng]);
    sitesRef.doc(`${site.SiteId}`).set(site);
  })

  const sitesPricesRef = db.collection("sites_prices");
  result.sites_prices.forEach(sp => {
    const site = result.sites.find(site => site.SiteId == sp.SiteId);
    const parsedDate = new Date(sp.TransactionDateUtc).getTime();
    const key = `${sp.FuelId}_${sp.SiteId}_${parsedDate}`;

    if(site) {
      sp.geohash = geofire.geohashForLocation([site.Lat, site.Lng])
    }

    sitesPricesRef.doc(`${key}`).set(sp);
  })

});
