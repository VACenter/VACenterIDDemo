//@ts-check

//Dependancies
const express = require("express");
const request = require("request");
const path = require("path");
const utils = require("./utils.js");
require("dotenv").config();

//Express Server
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/../views"));
app.use('/public', express.static(path.join(__dirname, "/../public")));
app.set('json spaces', 2)
app.use((req,res,next)=>{
    res.locals.hostIP = process.env.HOST;
    res.locals.scopes = process.env.SCOPES;
    next()
})
app.listen(3000);

//Data
const authTokens = new Map();

//Routes
app.get("*", (req, res) => {
    const cookies = utils.getCookies(req);
    switch(req.path){
        case "/":
            res.render("index", {
                clientID: process.env.CLIENT_ID,
            });
            break;
        case "/api/returnLogin":
            const queries = req.query;
            if(queries.response){
                if(queries.response === "success"){
                    if(queries.code){
                        const code = queries.code;
                        //Get Access Token
                        const tokenOptions = {
                            method: 'POST',
                            url: `https://api.id.va-center.com/oAuth2/token`,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            form: {
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET,
                                grant_type: 'authorization_code',
                                code,
                                redirect_uri: `${process.env.HOST}/api/returnLogin`
                            }
                        };

                        request(tokenOptions, function (error, response, body) {
                            if (error || response.statusCode != 200) {
                                res.status(500);
                                console.error(error || response.statusCode);
                                if(response.statusCode != 200){
                                    console.error(body);
                                }
                                res.send("Error retrieving access token [3]");
                            } else {
                                const data = JSON.parse(body);
                                if(data.access_token){
                                    const token = data.access_token;
                                    const authToken = utils.randomString(32);
                                    const tokenData = {
                                        token: authToken,
                                        access_token: token,
                                        refresh_token: data.refresh_token ? data.refresh_token : null,
                                        scope: data.scope,
                                    }
                                    authTokens.set(authToken, tokenData);
                                    res.cookie("authToken", authToken, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true});
                                    res.redirect("/viewData");
                                }else{
                                    res.status(400);
                                    res.send("Error retrieving access token [4]");
                                }
                            }
                        });
                    }else{
                        res.status(400);
                        res.send("Missing Authorisation Code [2]");
                    }
                }else{
                    res.status(401);
                    res.send("Login Failed [1]");
                }
            }else{
                res.sendStatus(400);
            }
            break;
        case "/viewData": {
            if(cookies.authToken){
                if(authTokens.has(cookies.authToken)){
                    const tokenData = authTokens.get(cookies.authToken);
                    //Make API Request
                    const informationOptions = {
                        method: 'GET',
                        url: `https://api.id.va-center.com/api/me`,
                        headers: { Authorization: `Bearer ${tokenData.access_token}` }
                    };

                    request(informationOptions, function (error, response, body) {
                        if (error || response.statusCode != 200) {
                            res.status(500);
                            res.send("Error retrieving user information");
                        } else {
                            const userResponse = JSON.parse(body);
                            res.json(userResponse);
                        }
                    }); 
                }else{
                    res.clearCookie("authToken");
                    res.redirect("/");
                }
            }else{
                res.redirect("/");
            }
            break;
        }
        default:
            res.status(404);
            res.send("Page not found.")
    }    
});