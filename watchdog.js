const admin = require("firebase-admin");
const client = require("./qldFuelApiClient")
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qld-gasprice-default-rtdb.asia-southeast1.firebasedatabase.app/",
});


const db = admin.database();
const ref = db.ref("qldFuel");

client.getAllData().then(result => {

  const brands = ref.child('brands');
  brands.set(Object.fromEntries(result.brands.map((b) => [b.BrandId, b])));

  const fuels = ref.child("fuels");
  fuels.set(Object.fromEntries(result.fuels.map((f) => [f.FuelId, f])));

  const sites = ref.child("sites");
  sites.set(Object.fromEntries(result.sites.map((s) => [s.SiteId, s])));

  const sites_prices = ref.child("sites_prices");
  sites_prices.set(
    Object.fromEntries(
      result.sites_prices.map((sp) => {
        const parsedDate = (new Date(sp.TransactionDateUtc)).getTime();  //sp.TransactionDateUtc.split(/:|\./).join("-");
        const key = `${sp.FuelId}_${sp.SiteId}_${parsedDate}`;
        return [
          key,
          sp,
        ];
      })
    )
  );
})

