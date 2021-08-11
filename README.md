# Meteo Trentino Bot (@MeteoTrentinoBot)

Meteo trentino bot is an unofficial bot of the autonomous province of Trento that allows you to stay updated on:
- weather forecasts
- provincial weather alerts
- radar and satellite images
- reading data from weather stations
- reading data from sensors in the basins in the territory

:point_right: Launch [@meteotrentinobot](https://t.me/meteotrentinobot)

### Screenshot

<p align="center">
  <img src="https://github.com/Xiryl/meteotrentino-bot/blob/dev/assets/screenshot_0.jpg" width="350" title="hover text">
  <img src="https://github.com/Xiryl/meteotrentino-bot/blob/dev/assets/screenshot_1.jpg" width="350" title="hover text">
</p>

### Setup
Please create `config.json` file inside `/lib/config/` as:

```json
{
    "TOKEN": "telegram_api_key",
    "LOGLY_TOKEN": "logly_api_key"
}
```

### Run

`npm install`

`npm start`

### Docker-compose support
`docker-compose up -d`

### License
```
   Copyright (C) 2019-2021 meteotrentino-bot, Chiarani Fabio

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
   ```
