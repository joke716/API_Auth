const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const GooglePlusTokenStrategy = require('passport-google-plus-token');
const config = require('./configuration');

const { JWT_SECRET } = require('./configuration');
const User = require('./models/user');

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
            return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
    } catch(error) {
        done(error, false);
    }
}));



// Google OAuth Strategy
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: '576753327119-hgk9rvo7bapp5nsl2rh7iqlnonlebdio.apps.googleusercontent.com',
    clientSecret: 'b53xmA05ReIrqEmzZUJDUKey'
}, async (accessToken, refreshToken, profile, done) => {

    try {
        console.log('accessToken: ', accessToken);
        console.log('refreshToken: ', refreshToken);
        console.log('profile: ', profile);

        // Check whether this current user exists in our DB
        const existingUser = await User.findOne({"google.id": profile.id});
        if (existingUser) {
            console.log('existing user');
            return done(null, existingUser);
        }

        console.log('new user');

        // New user
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id,
                email: profile.emails[0].value
            }
        });
        await newUser.save();
        done(null, newUser);

    } catch(error) {
        done(error, false, error.message);
    }


}));


// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        // Find the user given the email
        const user = await User.findOne({ email });

        // If not, handle it
        if (!user) {
            return done(null, false);
        }

        // Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        // If not, handle it
        if (!isMatch) {
            return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
    } catch(error) {
        done(error, false);
    }
}));