# Meteo Trentino Bot (@MeteoTrentinoBot)

Meteo trentino bot is an unofficial bot of the autonomous province of Trento that allows you to stay updated on:
- weather forecasts (7 days, 3-hour slots) for any town or locality in Trentino, by name or shared GPS position
- the official Meteotrentino text bulletin and the audio bulletin
- provincial weather alerts (Protezione Civile) and the avalanche bulletin
- radar and lightning animations
- live data from the Trentino weather stations
- wind forecast for Lake Garda

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

Alternatively set the `BOT_TOKEN` environment variable.

### Data sources
Same sources as the Meteo Trentino app (`meteotrentino-app-3`):
- Forecasts: [meteo.report](https://meteo.report) open data, `var/data/forecasts/<venue>.json` (+ text bulletins `var/data/bulletins/it/bulletins.json`)
- Stations: Euregio station list ([tinia-website](https://gitlab.com/tinia-euregio/tinia-website)) + `meteo.report/var/data/observations/<station>.json`
- Radar & lightning: `radar.meteotrentino.it`
- Garda wind meteograms and audio bulletin: `contenuti.meteotrentino.it`
- Alerts: `avvisi.protezionecivile.tn.it`

Forecast venues and stations are snapshotted in `lib/config/venues.json` and `lib/config/stations.json` (only the ones that actually publish data). To refresh them: `npm run update-data`.

### Run

Requires Node.js 18+.

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
