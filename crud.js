// import fetch from "node-fetch";
// //const fetch = require('node-fetch');

async function getStazione(nomeStazione) {
  const url = `https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=${nomeStazione}`;
  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erroraccio");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("errore nella ricerca", error.message);
    return null;
  }
}

// async function getStazioni() {
//   const url = `https://www.trenitalia.com/content/dam/tcom/config/stationList.json`;
//   console.log(url);

//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error("Erroraccio");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("errore nella ricerca", error.message);
//     return null;
//   }
// }

async function getTickets(params) {
  const url =
    "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Erroraccio");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("errore nella ricerca", error.message);
    return null;
  }
}

// const serachParams = {
//   departureLocationId: 830004702,
//   arrivalLocationId: 830000219,
//   departureTime: "2024-10-18T18:00:00.000",
//   adults: 1,
//   children: 0,
//   criteria: {
//     frecceOnly: false,
//     regionalOnly: false,
//     intercityOnly: false,
//     tourismOnly: false,
//     noChanges: false,
//     order: "DEPARTURE_DATE",
//     offset: 0,
//     limit: 10,
//   },
//   advancedSearchRequest: {
//     bestFare: false,
//     bikeFilter: false,
//   },
// };

// getTickets(serachParams).then((data) => {
//   console.log("Biglietti: ", data.solutions);
// });

//  getStazione('cesena').then(data => {
//     console.log("Stazione: ", data)
//  })

//  getStazione('').then(data => {
//     console.log("Stazioni: ", JSON.stringify(data))
//  })
module.exports = {
  getStazione: getStazione,
  getTickets: getTickets,
};
