const express = require("express")
const bodyParser = require("body-parser")
const mysql = require("mysql")
const ejs = require("ejs");

const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@123',
    database: 'skelly',
});


db.connect((err) => {
    if (err) {
        throw err;
    } else {
        // console.log("connected")
    }
})



router.get('/search', function (req, res) {
    db.query("SELECT state,count(college_id) as total FROM college GROUP BY state", function (err, results) {
        if (err) {
            console.log(err);
        }
        let states = [];
        let sums = [];
        for (let i = 0; i < results.length; i++) {
            states.push(results[i].state);
            sums.push(results[i].total);
        }
        console.log(sums)

        // console.log(results)
        res.render("search", { states: states,sums: sums });
    })
})


module.exports = router;