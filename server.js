const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATABASE_NAME = 'students.db';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialiser la base de données
const db = new sqlite3.Database(DATABASE_NAME, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Connected to the ${DATABASE_NAME} SQlite database.`);
    db.run("CREATE TABLE IF NOT EXISTS notes (studentId INTEGER PRIMARY KEY, subject TEXT, score INTEGER)", (err) => {
        if (err) {
            console.error("Error creating the table:", err);
        } else {
            console.log("Table 'notes' created or already exists.");
        }
    });
});

// Ajouter une note
app.post('/ajouter-note', (req, res) => {
    const { studentId, subject, score } = req.body;
    const sql = "INSERT INTO notes (studentId, subject, score) VALUES (?, ?, ?)";
    db.run(sql, [studentId, subject, score], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur lors de l'ajout de la note." });
            return;
        }
        res.json({ message: "Note ajoutée avec succès!", id: this.lastID });
    });
});

// Récupérer la liste des étudiants et leurs notes
app.get('/etudiants', (req, res) => {
    const sql = "SELECT * FROM notes";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur lors de la récupération des données." });
            return;
        }
        res.json({ etudiants: rows });
    });
});

// Modifier la note d'un étudiant
app.put('/modifier-note/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { subject, score } = req.body;
    const sql = "UPDATE notes SET subject = ?, score = ? WHERE studentId = ?";
    db.run(sql, [subject, score, studentId], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur lors de la modification de la note." });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: "Étudiant non trouvé." });
            return;
        }
        res.json({ message: "Note modifiée avec succès!" });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
    process.exit(0);
});
