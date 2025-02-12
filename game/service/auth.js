import express from 'express';
const router = express.Router();
import { check, body, validationResult } from 'express-validator';
import { registerUser, generateJWT, loginUser, verifyAndDecodeToken, getUserByEmail } from './dbUtils.js';
const colors = ["#0d6efd", "#6610f2", "#d63384"];



router.post('/register', [check('name', 'Only one word names are allowed').isAlpha().notEmpty().isLength({ max: 20 }),
check('email', 'Email is required').isEmail().notEmpty().isLength({ min: 2, max: 30 }),
check('password_one', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
check('password_two', "Passwords must match").custom((password_two, { req }) => password_two == req.body.password_one),
],
    async (req, res) => {

        const errors = validationResult(req);



        // Client does same error checking so I only need to say invalid input 
        // This makes it easier to display this as a notification

        if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array().pop().msg });


        try {
            const user = await registerUser(req.body.name, req.body.email, req.body.password_one);

            return res.json({ msg: `Welcome ${req.body.name}`, token: generateJWT(user) });

        }
        catch (err) {
            if (err.cause == "duplicate") {
                return res.status(400).json({ msg: err.message });
            }

            return res.status(500).json({ msg: err.message });
        }
    });


router.post('/login', [check('email', 'Email is required').isEmail().notEmpty(),
check('password', 'Password is required').notEmpty()], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ msg: "Invalid Input" });

    try {

        const user = await loginUser(req.body.email, req.body.password);

        if (user == null) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        return res.json({ msg: `Login Successful`, name: user.name, token: generateJWT(user) });

    }
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }


});




router.get('/user-data', [check('token', 'JWT is required').notEmpty()], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array().pop() });

    try {

        const token = verifyAndDecodeToken(req.headers.token);


        const user = await getUserByEmail(token.email);

        return res.json({ user });



    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: err.message });
    }


});

router.get('/user-colors', (req, res)=>{

    res.json({colors: colors});
});

router.get('/user-country', async (req, res)=>{

    const req_string = `https://api.country.is/${req.header('x-forwarded-for')}`;

    const response = await fetch(req_string);

    const country = (await response.json()).country;

    if(country){

    return res.json({country: country});
    }

    return res.json({country: ""});
})

export default router;