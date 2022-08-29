# Rusty Bot

A Discord bot created in Typescript with Discord.js for use in the Rusty's Bois server.

### Requirements

Requres a GCP firestore instance.

Requres a user created file at root named `.env` with three variables:

- `TOKEN=` The bot secret token from your Discord Developer Portal
- `KEYFILE=` The name (with .json extension) of your GCP service account key file.
- `PROJECTID=` The ID of your GCP project
