const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
function initialize (passport, getUserByEmail)
{
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);

        if(user == null){
            return done(null, false, {status:'error', error: 'Invalid email/password'}); //changement possibe pour l'envoi des messages de succès ou de non succès !!!
        }

        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            } else {
                return done(null, false, {status:"error", error:"Invalid credentials"});
            }
        } catch (error) {
            
        }

        passport.use(
            new LocalStrategy(
                { usernameField: 'email' }, 
                authenticateUser
            )
        );

        passport.serializeUser((user, done) => {});
        passport.deserializeUser((id, done) => {});
    };
}

module.exports = initialize;