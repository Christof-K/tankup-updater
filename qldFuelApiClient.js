const dotenv = require("dotenv");
dotenv.config();

const baseUrl = "https://fppdirectapi-prod.fuelpricesqld.com.au";
const resources = {
  brands: "Subscriber/GetCountryBrands?countryId=21",
  fuels: "Subscriber/GetCountryFuelTypes?countryId=21",
  sites:
    "Subscriber/GetFullSiteDetails?countryId=21&geoRegionLevel=3&geoRegionId=1",
  sites_prices:
    "Price/GetSitesPrices?countryId=21&geoRegionLevel=3&geoRegionId=1",
};

const getAllData = () => {
  return new Promise((resolve) => {
    var mergedData = {
      brands: [],
      fuels: [],
      sites: [],
      sites_prices: [],
    };

    const promises = [];
    Object.entries(resources).forEach(async ([resourceName, resource]) => {
      const promise = fetch(`${baseUrl}/${resource}`, {
        headers: {
          Authorization: `FPDAPI SubscriberToken=${process.env.API_TOKEN}`,
        },
      })
        .then((result) => {
          return result.json();
        })
        .then((data) => {

          switch (resourceName) {
            case "brands": {
              // {
              //   "BrandId": 5,
              //   "Name": "BP"
              // }
              mergedData.brands.push(...data.Brands);
              break;
            }
            case "fuels": {
              // {
              // "FuelId": 2,
              // "Name": "Unloaded"
              // }
              mergedData.fuels.push(...data.Fuels);
              break;
            }
            case "sites": {
              const sites = data.S;
              sites.forEach((_site) => {
                mergedData.sites.push({
                  SiteId: _site.S, // id
                  Address: _site.A, // address
                  Name: _site.N, // name
                  BrandId: _site.B, // brandId
                  PostCode: _site.P, // postcode
                  Lat: _site.Lat,
                  Lng: _site.Lng,
                  LastModified: _site.M, // last modified - date string
                  GooglePlaceId: _site.GPI, // google place id
                });
              });
              break;
            }
            case "sites_prices": {
              // {
              //   "FuelId": 2,
              //   "SiteId": 61290151,
              //   "CollectionMethod": "Q",
              //   "Price": 1999,
              //   "TransactionDateUtc": "2023-10-30T22:04:14.3"
              // }
              mergedData.sites_prices.push(...data.SitePrices);
              break;
            }
          }
        });
        promises.push(promise)
    });

    Promise.all(promises).then(() => resolve(mergedData));
  });
};

module.exports = { getAllData };
