var express = require("express");
var sha1 = require("sha1");
var router = express.Router();
var fileUpload = require("express-fileupload")
var RESTAURANT = require("../database/restaurant");
const midleware = require("./midleware");
//var midleware = require("./midleware");

router.use(fileUpload({
    fileSize: 50 * 1024 * 1024
}));
router.post("/sendfile", (req, res) => {
    var images = req.files.file;
    var path = __dirname.replace(/\/routes/g, "/images");
    var date = new Date();
    var sing = sha1(date.toString()).substr(1, 5);

    images.mv(path + "/" + sing + "_" + images.name.replace(/\s/g,"_"), (err) => {
        if (err) {
            return res.status(300).send({msn : "ERROR AL ESCRIBIR EL ARCHIVO EN EL DISCO DURO"});
        }
        res.status(200).json({name: images.name});
    });
    //console.log(__dirname);
    //res.status(200).json({name: req.files.name});
});

router.get("/restaurant",(req, res) => {
    var filter = {};
    var params = req.query;
    var select = "";
    var order = {};
    if (params.Nombre != null) {
        var expresion = new RegExp(params.Nombre);
        filter["Nombre"] = expresion;
    }
    if (params.filters != null) {
        select = params.filters.replace(/,/g, " ");
    }
    if (params.order != null) {
        var data = params.order.split(",");
        var number = parseInt(data[1]);
        order[data[0]] = number;
    }

    RESTAURANT.find(filter).
    select(select).
    sort(order).
    exec((err, docs) => {
        if (err) {
            res.status(500).json({msn: "ERROR EN EL SERVIDOR"});
            return;
        }
        res.status(200).json(docs);
        return;
    });
});
router.post("/restaurant", (req, res) => {
    var restaurantRest = req.body;
    var restaurantDB = new RESTAURANT(restaurantRest);
    restaurantDB.save((err, docs) => {
        if (err) {
            var errors = err.errors;
            res.status(500).json(errors);
            return;
        }
        res.status(200).json(docs);
    })
});

router.put("/restaurant", async(req, res) => {
    var params = req.query;
    var bodydata = req.body;
    if (params.id == null) {
        res.status(300).json({msn: "EL PARAMETRO ID ES NECESARIO"});
        return;
    }
    var allowkeylist = ["Nombre", "Calle", "Telefono"];
    var keys = Object.keys(bodydata);
    var updateobjectdata={};
    for (var i = 0; i < keys.length; i++) {
        if (allowkeylist.indexOf(keys[i]) > -1) {
            updateobjectdata[keys[i]] = bodydata[keys[i]];
        }
    }
    RESTAURANT.update({_id: params.id}, {$set: updateobjectdata}, (err, docs) => {
        if (err) {
            res.status(500).json({msn: "EXISTEN PROBLEMAS EN LA BASE DE DATOS"});
            return;
        }
        res.status(200).json(docs);
    });
});

router.delete("/restaurant", (req, res) => {
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({msn: "EL PARAMETRO ID ES NECESARIO"});
        return;
    }
    RESTAURANT.remove({_id: params.id}, (err, docs) => {
        if (err) {
            res.status(500).json({msn: "EXISTEN PROBLEMAS EN LA BASE DE DATOS"});
            return;
        }
        res.status(200).json(docs);
    });
    
});
router.get("restaurant", (req, res) => {

});

module.exports = router;