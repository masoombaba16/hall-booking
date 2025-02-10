const exp = require('express');
const admin = exp.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncErrorHandle = require('express-async-handler');
const {verifyToken,validateToken} = require('../MIDDLEWARES/Admin');
const {updateadminorclubororanizer}=require('./Utils');
const { sendMessage, getMessages } = require('./messageUtils');
admin.post('/login', asyncErrorHandle(async (req, res) => {
    const adminCollection = req.app.get('adminCollection');
    const user = req.body;
    const dbuser = await adminCollection.findOne({ email: user.email.toLowerCase() });

    if (!dbuser) {
        return res.status(401).send({ message: "User not found" });
    }

    const pass = await bcryptjs.compare(user.password, dbuser.password);
    if (!pass) {
        return res.status(401).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: dbuser.username, userType: dbuser.userType ,email:dbuser.email,names:dbuser.names}, 'abcd', { expiresIn: '6h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 6 * 60 * 60 * 1000,  
        sameSite: 'Strict',
    });

    const safeUser = {
        userType: dbuser.userType,
    };

    return res.send({ message: "Login Success", token: token, user: safeUser });
}));



admin.put('/update-details', validateToken(), asyncErrorHandle(updateadminorclubororanizer));
admin.post('/get-messages', verifyToken(['admin']), asyncErrorHandle(async (req, res) => {
    const receiver = req.body.receiver.toLowerCase();
    const sender = 'admin';
    const messageCollections = req.app.get('messageCollections');

    try {
        const result = await getMessages({ sender, receiver }, messageCollections);
        return res.send(result);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}));
const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

admin.post('/add-hall', validateToken(), asyncErrorHandle(async (req, res) => {
    const data = req.body;
    const hallCollections = req.app.get('hallCollections');
        data.hallname = data.hallname.toLowerCase();
        const found = await hallCollections.findOne({ hallname: data.hallname });
    if (found) {
        return res.status(400).send({ message: 'Hall already exists in the database' });
    }
    const currentDate = new Date();
    data.status = "active";
    data.createdAt = {
        date: formatDate(currentDate),
        time: formatTime(currentDate) 
    };
    data.lastModified = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)  
    };
    data.createdBy = data.username; 
    delete data.username;
    
    await hallCollections.insertOne(data);

    return res.status(201).send({ message: 'Hall added successfully.' });
}));
admin.put('/modify-hall', validateToken(), asyncErrorHandle(async (req, res) => {
    const data = req.body;  
    const hallCollections = req.app.get('hallCollections');
    
    if (data.hallname) {
        data.hallname = data.hallname.toLowerCase();
    }

    const hall = await hallCollections.findOne({ hallname: data.hallname });
    if (!hall) {
        return res.status(404).send({ message: 'Hall not found' });
    }

    const currentDate = new Date();
    data.lastModified = {
        date: formatDate(currentDate),  
        time: formatTime(currentDate)   
    };
    delete data.username;
    const updateResult = await hallCollections.updateOne(
        { hallname: data.hallname }, 
        { $set: data }
    );

    if (updateResult.matchedCount === 0) {
        return res.status(400).send({ message: 'Failed to update hall details' });
    }

    return res.status(200).send({ message: 'Hall details updated successfully' });
}));



admin.post('/send-club-message', verifyToken(['admin']), asyncErrorHandle(async (req, res) => {
    const message = req.body; 
    const messageCollections = req.app.get('messageCollections'); 
    message.receiver = message.receiver.toLowerCase(); 

    const clubCollections = req.app.get('clubCollections'); 
    const found = await clubCollections.findOne({ clubname: message.receiver }); 

    if (!found) {
        return res.status(404).send({ message: "No club found with the specified name" });
    }

    try {
        const result = await sendMessage({
            sender: 'admin',
            sentby:'admin',
            receiver: message.receiver,
            content: message.content,
            messageCollections
        });
        return res.send(result); 
    } catch (error) {
        return res.status(500).send({ message: error.message }); 
    }
}));


admin.post('/add-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections'); 
    const club = req.body;
    club.clubname = club.clubname.toLowerCase();
    const adminu=club.username;
    delete club.username;
    const found = await clubCollections.findOne({ clubname: club.clubname});
    if (found) {
        return res.status(400).send({ message: 'Club already exists in the database' });
    }
    const usfound=await clubCollections.findOne({username:club.clubUsername});
    if(usfound)
    {
        return res.send({message:"username already exists"});
    }
    const hashedPassword = await bcryptjs.hash(club.password, 6);
    club.password = hashedPassword;
    club.username=club.clubUsername;
    club.status = "active";
    club.userType = 'club';
    club.count=0;
    const currentDate = new Date();
    club.createdAt = {
        date: formatDate(currentDate), 
        time: formatTime(currentDate)  
    };
    club.lastModified = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)  
    };
    club.createdBy=adminu;
    delete club.clubUsername;
    await clubCollections.insertOne(club);
    return res.status(201).send({ message: 'Club added successfully.' });
}));

admin.put('/block-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections');
    const club = req.body;
    club.clubname = club.clubname.toLowerCase();
    const found = await clubCollections.findOne({ clubname: club.clubname });
    if (!found) {
        return res.status(404).send({ message: "No club found" });
    }
    const currentDate = new Date();
    club.lastModified = {
        date: formatDate(currentDate),  
        time: formatTime(currentDate)   
    };
    const result = await clubCollections.updateOne(
        { clubname: club.clubname }, 
        { $set: { status: "blocked",lastModified:club.lastModified } } 
    );
    return res.status(200).send({ message: "Club blocked successfully" });
}));

admin.put('/unblock-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections');
    const club = req.body;
    club.clubname = club.clubname.toLowerCase();
    const found = await clubCollections.findOne({ clubname: club.clubname });
    if (!found) {
        return res.status(404).send({ message: "No club found" });
    }
    const currentDate = new Date();
    club.lastModified = {
        date: formatDate(currentDate),   
        time: formatTime(currentDate)  
    };
    const result = await clubCollections.updateOne(
        { clubname: club.clubname }, 
        { $set: { status: "active",lastModified:club.lastModified } } 
    );
    return res.status(200).send({ message: "Club Unblocked successfully" });
}));

module.exports = admin;

