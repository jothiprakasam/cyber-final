const express = require('express');
const Airtable = require('airtable');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configure Airtable
const base = new Airtable({ apiKey: 'patSeS1lNaFzWwi1M.9ec5749dab488f239bd36bcbd43ab537899bf6c91d62eb98130632dd611cea6a' }).base('appFzJMkLp7DiSXxA');

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/rooms', (req, res) => {
    base('Rooms').select({
        view: "Grid view"
    }).firstPage((err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve rooms' });
        }
        res.json(records);
    });
});

app.post('/rooms', (req, res) => {
    const { roomName, roomPassword, encryptionKey } = req.body;

    base('Rooms').create([
        {
            fields: {
                Room: roomName,
                Password: roomPassword,
                Encrypt: encryptionKey,
                Decrypt: encryptionKey
            }
        }
    ], (err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create room' });
        }
        res.json(records);
    });
});

app.post('/api/join-room', (req, res) => {
    const { roomName, roomPassword } = req.body;

    base('Rooms').select({
        filterByFormula: `AND({Room} = '${roomName}', {Password} = '${roomPassword}')`
    }).firstPage((err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Failed to join room' });
        }

        if (records.length > 0) {
            res.json({ success: true, encryptionKey: records[0].fields.Encrypt });
        } else {
            res.json({ success: false });
        }
    });
});

app.get('/api/room-files', (req, res) => {
    const { roomName } = req.query;

    base('Rooms').select({
        filterByFormula: `{Room} = '${roomName}'`
    }).firstPage((err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve room files' });
        }

        if (records.length > 0) {
            const room = records[0];
            res.json({ files: room.fields.File });
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

