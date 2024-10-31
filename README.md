# simple-geocoder

## Supported providers

- Google
- Here
- Mapbox

## Example

```ts
import { MapboxForwardGeocode } from "simple-geocoder";

const API_KEY = ...
const address = "Rue du Belvédère 23, 1050 Ixelles, Belgique"

MapboxForwardGeocode(
  API_KEY,
  address
).then((response) => {
  console.log(response);
});
```
