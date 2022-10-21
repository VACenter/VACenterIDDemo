<div align=center>

# VACenterID Demo
## Learn how to use the VACenterID OAuth2 API

</div>

### What is this?
tokenData
This is a small web application written in NodeJS & Express, it will ask users to login, which will then take you to a VACenterID Authentication Page, following which it will display some information about you.


### How can I use it?

This application has an .env.example file, which needs to be populated and renamed to .env, see instructions for what to populate the results with below.

### Limitations
At the moment, the VACenter Developer Portal is not operational, as such you can not generate an application yet. Stay tuned.

### Environment Variables
As aforementioned, you must populate the .env.example file and rename it to .env. This will show you what to populate.

- **HOST:** This should become your IP address with HTTP & port 3000 afixed. If you actually want to run this, you must port forwards 3000.
- **SCOPES:** This is the scopes you want to retrieve data for, at the moment only *identify* and *email* are supported by the demo.
- **CLIENT_ID:** This is the Client ID of your application as registered on the VACenter Developer Portal.
- **CLIENT_SECRET:** This is the Client Secret of your application as registered on the VACenter Developer Portal.