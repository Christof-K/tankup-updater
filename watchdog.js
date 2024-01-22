const admin = require("firebase-admin");
const client = require("./qldFuelApiClient");
const serviceAccount = require("./serviceAccountKey.json");
const { getFirestore, GeoPoint } = require("firebase-admin/firestore");
const Firestore = require("@google-cloud/firestore");
const geofire = require("geofire-common");
const geofirestore = require("geofirestore")

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore(app);
const GeoFirestore = geofirestore.initializeApp(db)



client.getAllData().then((result) => {
  const brandsRef = db.collection("brands");
  result.brands.forEach((brand) => {
    brandsRef.doc(`${brand.BrandId}`).set(brand);
  });

  const fuelsRef = db.collection("fuels");
  result.fuels.forEach((fuel) => {
    fuelsRef.doc(`${fuel.FuelId}`).set(fuel);
  })

  // const sitesRef = db.collection("sites");
  const siteGoeRef = GeoFirestore.collection("sites");

  result.sites.forEach(site => {
    site.coordinates = new GeoPoint(site.Lat, site.Lng);
    // site.geohash = geofire.geohashForLocation([site.Lat, site.Lng]);
    // sitesRef.doc(`${site.SiteId}`).set(site);
    siteGoeRef.doc(`${site.SiteId}`).set(site);
  })

  const sitePricesGeoRef = GeoFirestore.collection("sites_prices");

  result.sites_prices.forEach(sp => {
    const site = result.sites.find(site => site.SiteId == sp.SiteId);
    const parsedDate = new Date(sp.TransactionDateUtc).getTime();
    const key = `${sp.FuelId}_${sp.SiteId}_${parsedDate}`;

    if(site) {
      sp.coordinates = new GeoPoint(site.Lat, site.Lng);
      // sp.geohash = geofire.geohashForLocation([site.Lat, site.Lng])
    }

    sitePricesGeoRef.doc(`${key}`).set(sp);
  })

});
