<img align="left" width="auto" height="90" src="./docs/images/thumbnail128x128.png">

[![Join us on Discord](https://img.shields.io/discord/938519232155648011.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uvdg2R5PAU)

[![MIT License](https://img.shields.io/badge/license-MIT-informational.svg)](./LICENSE)


# About Mirror

Mirror is a multi-purpose Discord bot which provides fun, immersive and informative features for your discord server at no cost.

Mirror is a for-fun personal project for learning programming and computer science concepts through TypeScript, node-js, GitHub, and the Discord API.

Mirror was created by Fordle#0001 and Phantasm#0001, with contributions from friends.

Interested in adding Mirror to your server? Click [here](https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=139606649936&scope=bot%20applications.commands)

## Essential Commands

### Introthemes

Set a personal intro theme with [`/intro set`](src/slashcommands/Intro.ts) by uploading a short audio or video clip — Mirror trims it to the first 10 seconds and plays it whenever you join the voice channel Mirror is in. Remove your own with `/intro remove`. Get Mirror into a channel on demand with [`/join`](src/slashcommands/Join.ts) (it hops into your current voice channel), or give it a permanent home with [`/defaultvc`](src/slashcommands/DefaultVc.ts). Managers can clear any member's intro with [`/removeintro`](src/slashcommands/RemoveIntro.ts).

### Birthdays

Members save their birthday with [`/birthday`](src/slashcommands/Birthday.ts); managers set the announcement channel and time with [`/birthdayconfig`](src/slashcommands/BirthdayConfig.ts) and can review everyone's saved dates with [`/birthdaylist`](src/slashcommands/BirthdayList.ts).

### Informative Commands

 - [`/weather`](src/slashcommands/Weather.ts) Current weather for a provided city.

 - [`/nasa`](src/slashcommands/Nasa.ts) Display the NASA Astronomy Picture of the Day.

 - [`/stock`](src/slashcommands/Stock.ts) Stock summary for a provided ticker. *(Needs an updated market-data provider — the previous IEX Cloud API has shut down.)*

### Fun & Utility

Poll your server with [`/poll`](src/slashcommands/Poll.ts), roll dice with [`/roll`](src/slashcommands/Roll.ts), and browse everything with [`/help`](src/slashcommands/Help.ts). Managers can tailor Mirror via [`/config`](src/slashcommands/Config.ts), [`/servercolor`](src/slashcommands/ServerColor.ts), and [`/managerrole`](src/slashcommands/ManagerRole.ts).

> **Note:** The legacy music player was removed in the current refactor and is no longer part of Mirror.

## Contributing to Mirror

Mirror is a public project and as such you are welcome to contribute if you desire.

If you want to work on Mirror with the team reach out to one of us on discord and we will get you started.

For more information on formatting and installing the bot read below: 

[Contributing](docs/CONTRIBUTING.md)  
[Building the bot](docs/BUILDING.md)  
[APIs we use](docs/APIDOCUMENTATION.md)
[Development Server](https://discord.gg/BTVseHM)

## Acknowledgements

Big thank you to Phantasm for building Mirror's framework and being an incredible mentor through this process, answering every question I have, no matter how dumb.

[discord.js.org](https://discord.js.org) for providing an incredibly deep and interesting package.

Luke, Gavin, Marty and Leo for allowing me to teach them GitHub, discord and TypeScript.

The wonderful folks from DisCouch, Paris, Friends and MarcyPark for breaking the bot countless times, making it even stronger than before.
