# ANM-WEB-APP-EARTHQUAKE
 ANM code assesment

 Maps in this project include the developer option due to billing not included in Google Maps JS API.

# Hosted in 
http://luisangelesmorales.com/ANM-WEB-APP-EARTHQUAKE/

# APIs used in this web app
GeoNames (names, earthquakes)
http://www.geonames.org/

Google Maps JS API
https://developers.google.com/maps/documentation/javascript/overview

# Considerations
- Bonus uses a global variable with data fetched previously due to the limit in requests per hour in GEONAMES API.
- Using ZIP code increases the accuracy of search.
- Due to GEONAMES not using https the web host does not use https.
- SessionStorage is used for search history so closing tab resets the history.