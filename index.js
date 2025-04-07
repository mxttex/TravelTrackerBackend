var express = require("express");
var api = require("./crud");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api", router);

router.use((request, response, next) => {
  console.log("Server in funzione...");
  next();
});

router.route("/getStazione/:nStazione").get((req, res) => {
  console.log(req.params.nStazione);
  nomeStazione = req.params.nStazione;
  api.getStazione(nomeStazione).then((data) => {
    res.status(201).json(data);
    console.log(data);
  });
});

// router.route("/getStazioni").get((req, res) => { //non
//     api.getStazioni().then((data) => {
//         res.status(201).json(data)
//         console.log(data)
//     })
// })

router.route("/getTicket").post((req, res) => {
    /*{ POST Format
    
      "departureLocationId": 830004702,
      "arrivalLocationId": 830000219,
      "departureTime": "2024-10-18T18:00:00.000",
      "adults": 1,
      "children": 0,
      "criteria": {
        "frecceOnly": false,
        "regionalOnly": false,
        "intercityOnly": false,
        "tourismOnly": false,
        "noChanges": false,
        "order": "DEPARTURE_DATE",
        "offset": 0,
        "limit": 10
                    },
      "advancedSearchRequest": {
        "bestFare": false,
        "bikeFilter": false
    }
    }*/
  

    const searchParams = {
      departureLocationId: req.body.departureLocationId,
      arrivalLocationId: req.body.arrivalLocationId,
      departureTime: req.body.departureTime,
      adults: req.body.adults,
      children: req.body.children,
      criteria: req.body.criteria,
      advancedSearchRequest: req.body.advancedSearchRequest,
    };

  api.getTickets(searchParams).then((data) => {
    res.status(201).json(data);
    console.log(data);
  });
});

var port = process.env.PORT || 8090;
app.listen(port);
console.log(`Le API sono in ascolto su http://localhost:${port}/api`);
