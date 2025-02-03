import express from 'express';
const router = express.Router();
import { check, body, validationResult } from 'express-validator';
import {registerUser, generateJWT, getUserIdByEmail} from './dbUtils.js';




router.post('/register', [check('name', 'Name is required').isAlpha().notEmpty().isLength({ max: 20 }),
check('email', 'Email is required').isEmail().notEmpty().isLength({ min: 2, max: 30 }),
check('password_one', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
check('password_two', "Passwords must match").custom((password_two, { req }) => password_two == req.body.password_one),
],
    async (req, res) => {

        const errors = validationResult(req);



        // Client does same error checking so I only need to say invalid input 
        // This makes it easier to display this as a notification
        if(!errors.isEmpty()) return res.status(400).json({msg:"Invalid Input"});


        try {
            await registerUser(req.body.name, req.body.email, req.body.password_one);

            // const id = (await getUserIdByEmail(req.body.email))._id;

            // console.log(id);
            return res.json({ msg: `Welcome ${req.body.name}`, token: generateJWT({email: req.body.email})});

        }
        catch (err) {
            if (err.cause == "duplicate") {
                return res.status(400).json({ msg: err.message });
            }

            return res.status(500).json({ msg: err.message });
        }
    });


export default router;