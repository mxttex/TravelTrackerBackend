require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const traduzioni = {
  "roma": "rome",
  "milano": "milan",
  "napoli": "naples",
  "venezia": "venice",
  "torino": "turin",
  "bologna": "bologna",
  "palermo": "palermo",
  "catania": "catania",
  "firenze": "florence",
  "genova": "genoa",
  "bari": "bari",
  "verona": "verona",
  "pisa": "pisa",
  "bergamo": "bergamo",
  "treviso": "treviso",
  "brindisi": "brindisi",
  "lamezia terme": "lamezia terme",
  "trapani": "trapani",
  "ancona": "ancona",
  "perugia": "perugia",
  "parma": "parma",
  "trieste": "trieste",
  "alghero": "alghero",
  "olbia": "olbia",
  "cagliari": "cagliari",
  "reggio calabria": "reggio calabria",
  "forlì": "forli",
  "rimini": "rimini",
  "salerno": "salerno",
  "bolzano": "bolzano",
  "aosta": "aosta"
};

// Funzione per creare una connessione con le API dei viaggi aerei
async function getAccessToken() {
  const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await axios.post(url, data);
  return response.data.access_token;
}

// Funzione per ottenere i viaggi aerei richiesti dall'utente
async function findFlights(start, arrival, date, adults = 1, children = 0) {
  const token = await getAccessToken();

  const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      originLocationCode: start,
      destinationLocationCode: arrival,
      departureDate: date,
      adults,
      children,
      nonStop: false,
      max: 1
    }
  });

  return response.data;
}

//Funzione per ottenere, come debug, 10 viaggi aerei casuali
async function findRandomFlights() {
  const token = await getAccessToken();

  const airports = ['FCO', 'JFK', 'LHR', 'CDG', 'MAD', 'DXB', 'LAX', 'ORD', 'HND', 'AMS'];

  const randomStart = airports[Math.floor(Math.random() * airports.length)];
  let randomArrival = airports[Math.floor(Math.random() * airports.length)];
  while (randomArrival === randomStart) {
    randomArrival = airports[Math.floor(Math.random() * airports.length)];
  }

  const today = new Date();
  const randomDays = Math.floor(Math.random() * 30);
  const randomDate = new Date(today.getTime() + randomDays * 24 * 60 * 60 * 1000);
  const departureDate = randomDate.toISOString().split('T')[0];

  const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      originLocationCode: randomStart,
      destinationLocationCode: randomArrival,
      departureDate: departureDate,
      adults: 1,
      nonStop: false,
      max: 10
    }
  });

  return response.data;
}

//Funzione per ottenere, dato un volo, il ritardo di esso
async function getDelayPrediction(params) {
  const token = await getAccessToken();

  console.log(params)

  const response = await axios.get("https://test.api.amadeus.com/v1/travel/predictions/flight-delay", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: params
  });

  return response.data;
}

async function getAeroporto(nomeAeroporto) {
  const token = await getAccessToken();
 const nomeTradotto = traduzioni[nomeAeroporto.toLowerCase()] || nomeAeroporto;

  const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${nomeTradotto}&view=FULL`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error("Errore nella ricerca dell'aeroporto:", error.message);
    return null;
  }
}
//Funzione per convertire il formato della data fornita in input nel formato necessario per il funzionamento della ricerca dei viaggi aerei
function convertToApiDate(inputDateTime) {
  try {
    if (inputDateTime.includes('/')) {
      // formato DD/MM/YYYY o DD/MM/YYYY-HH:MM
      const [datePart] = inputDateTime.split('-'); // es. "18/05/2025"
      const [day, month, year] = datePart.split('/');
      return `${year}-${month}-${day}`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDateTime)) {
      // formato ISO YYYY-MM-DD
      return inputDateTime;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}

// Funzione per ottenere una stazione Trenitalia
async function getStazione(nomeStazione) {
  const url = `https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=${nomeStazione}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Errore nella ricerca stazione");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore nella ricerca:", error.message);
    return null;
  }
}

// Funzione per biglietti Trenitalia
async function getTickets(params) {
  
  console.log(params)
  const url =
    "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: params,
  };



  try {
    const response = await fetch(url, options);
  

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("errore nella ricerca", error.message);
    return null;
  }
}

module.exports = {
  getStazione,
  getTickets,
  findFlights,
  convertToApiDate,
  findRandomFlights,
  getDelayPrediction,
  getAeroporto,
};
