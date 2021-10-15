const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mysql = require("mysql")
const path = require("path");
const fileUpload = require("express-fileupload");


const app = express()

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@123',
    database: 'skelly',
})

db.connect((err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Connected")
    }
})

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


app.get("/", function (req, res) {
    res.render("home");
})

app.get("/details", function (req, res) {
    db.query("SELECT * FROM college", function (err, results) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("tables", { users: results });
        }
    })
})

global.c_id = "";

app.get("/view/:id", function (req, res) {
    const id = req.params.id;
    c_id = id;
    db.query("SELECT * FROM student WHERE college_id = ?", [id], function (err, results) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("student_tables", { students: results })
        }
    })
})


app.get("/viewsimilar", function (req, res) {
    db.query("SELECT year_founded fROM college WHERE college_id = ?", [c_id], function (err, result) {
        if (err) {
            console.log(err)
        }
        console.log(result[0].year_founded);
        let year = (result[0].year_founded);
        let new_year = Number(year) + 9;
        console.log(new_year);
        db.query(`SELECT * FROM college WHERE year_founded BETWEEN '${year}' and '${new_year}'`, function (err, results) {
            if (err) {
                console.log(err)
            }
            // console.log(results);
            res.render("view_similar", { users: results });
        })
    })
})

app.get("/add/:id", function (req, res) {
    const id = req.params.id;
    res.render("add_students", { my_id: id });
})

app.get("/addcollege", function (req, res) {
    res.render("add_college");
})

app.post("/save_college", function (req, res) {
    let data = { college_id: req.body.college_id, college_name: req.body.college_name, year_founded: req.body.year_founded, city: req.body.city, state: req.body.state, country: req.body.country, courses: req.body.courses }
    let sql = "INSERT INTO college SET ?";

    db.query(sql, data, function (err, results) {
        if (err) {
            console.log(err)
        }
        console.log(results);
        res.redirect("/details")
    })
})

app.post("/save", function (req, res) {
    let data = { student_id: req.body.sid, college_id: req.body.college_id, student_name: req.body.username, student_email: req.body.email, year_of_batch: req.body.batch, skills: req.body.skills }
    let sql = "INSERT INTO student SET ?";

    db.query(sql, data, function (err, results) {
        if (err) {
            console.log(err)
        }
        console.log(results);
        res.redirect("/details")
    })
})

app.get("/total_student/:id", function (req, res) {
    const my_id = req.params.id;
    db.query("SELECT COUNT(s.student_id) as total FROM student as s INNER JOIN college as c ON s.college_id = c.college_id and c.college_id = ?",
        [my_id], function (err, results) {
            if (err) {
                console.log(err);
            }
            // console.log(results[0].total)
            db.query(`UPDATE college SET total_students = '${results[0].total}' WHERE college_id = ?`, [my_id], function (error, result) {
                if (error) {
                    console.log(error);
                }
                // console.log(result);
                res.render("total_student", { total: results[0].total });
            })

        })
})

const router_search = require("./routes/search")

app.use(router_search)

global.mail = "";

app.get("/view/profile/:id", function (req, res) {
    const id = req.params.id;

    db.query("SELECT * FROM student WHERE student_id = ?", [id], function (err, results) {
        if (err) {
            console.log(err)
        }
        mail = results[0].student_email;
        res.render("profile", { users: results[0] });
    })
})


app.get("/edit_profiles/:id", function (req, res) {
    const id = req.params.id;
    my_id = id;
    db.query("SELECT * FROM student WHERE student_id =? ", [id], function (err, result) {
        if (err) {
            console.log(err);
        }
        // console.log(result);
        res.render("edit_profile", { user: result[0] })
    })
})


app.post("/student_profile_edit", function (req, res) {

    // const id = req.body.id;
    // console.log(id);

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }


    var file = req.files.uploaded_image;
    var img_name = file.name;

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
        file.mv('public/upload_images/' + file.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            db.query("SELECT * FROM student WHERE student_email = ?", [mail], function (err, result) {
                if (err) {
                    console.log(err);
                }
                db.query(`UPDATE student SET skills = '${req.body.pskills}',student_name = '${req.body.pname}',student_image = '${img_name}',year_of_batch = '${req.body.pbatch}' WHERE student_email =? `, [mail], function (errr, results) {
                    if (errr) {
                        console.log(errr);
                    }
                    console.log(results[0])

                    res.redirect("/profile");
                })
            })
        })
    }


})

//profile
app.get("/profile", function (req, res) {
    db.query("SELECT * FROM student WHERE student_email = ?", [mail], function (err, results) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("profile", { users: results[0] });
        }
    })
})


app.listen(3000, function () {
    console.log("Successfuly started port on 3000")
})