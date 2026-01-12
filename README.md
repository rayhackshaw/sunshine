# Isohel | Visualise the world's sunshine

Web-application which plots world sunlight data and joins cities together that share the same amount (also known as an isohel). Updates daily with new data from OpenWeatherMap.

Built using:
 - [T3 Stack](https://create.t3.gg/)
 - [Mapbox](https://www.mapbox.com/)
 - [OpenWeatherMap](https://openweathermap.org/)

## Inspiration

Original inspiration for this comes from a song called '[isohel](https://www.youtube.com/watch?v=asuA2-pbch0)' by EDEN.

The idea really resonated with me and I thought it would be cool to build something in homage to this.

## Calculations and Accuracy

Each city then gets a sunlight duration assigned to it via a simple subtraction of `sunset - sunrise`, 2 common data points returned from OpenWeatherMap.

Due to the nature of our method of calculation, 'true' isohels are actually close to/almost impossible to find without approximating our results.

e.g. if Madrid has a sunlight duration of 52,756, and if Istanbul has a sunlight duration of 52,856 - they would not share an isohel if we leave them like this.

Sunlight duration is rounded up as a measure to ensure this application isn't too accurate to the point where it is not showing any data at all.
