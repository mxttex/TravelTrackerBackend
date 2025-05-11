require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

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

async function findFlights(partenza, arrivo, dataPartenza) {
  const token = await getAccessToken();

  const url = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const params = {
    originLocationCode: partenza,
    destinationLocationCode: arrivo,
    departureDate: dataPartenza,
    adults: 1,
    nonStop: false,
    max: 5,
  };

  const response = await axios.get(url, { headers, params });
  return response.data;
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
  const url = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions";
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
      throw new Error("Errore nella richiesta biglietti");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore nella ricerca:", error.message);
    return null;
  }
}

module.exports = {
  getStazione,
  getTickets,
  findFlights,
};
