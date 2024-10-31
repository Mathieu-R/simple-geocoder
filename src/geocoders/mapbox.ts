// https://docs.mapbox.com/api/search/geocoding/#forward-geocoding-with-search-text-input

import ky from "ky";

import { GeocoderUnifiedResult } from "../types/common";
import { Feature, MapboxResponse, MatchCode } from "../types/mapbox";
import { createURLSearchParams } from "../utils";
import { DEFAULT_LIMIT } from "../config";

type MapboxForwardRequestOptions = {
  permanent?: boolean;
  autocomplete?: boolean;
  bbox?: number;
  country?: string;
  format?: string;
  language?: string;
  limit?: number;
  proximity?: string;
  types?: string;
  worldview?: string;
};

const baseUrl = "https://api.mapbox.com/search/geocode/v6";

export async function MapboxForwardGeocode(
  apiKey: string,
  query: string,
  language?: string,
  country?: string,
  limit?: string,
  options?: MapboxForwardRequestOptions,
) {
  options = options || {};
  let params = {
    q: query,
    ...options,
    limit: limit || DEFAULT_LIMIT,
    access_token: apiKey,
  };

  if (language) {
    params = { ...params, language };
  }

  if (country) {
    params = { ...params, country };
  }

  const response = await ky<MapboxResponse>(`${baseUrl}/forward`, {
    searchParams: createURLSearchParams(params),
  }).json();

  return response.features.map((feature) => formatResult(feature));
}

function isTrustable(matchCode: MatchCode) {
  console.log(matchCode);
  return Number(
    matchCode.address_number === "matched" &&
      matchCode.street === "matched" &&
      matchCode.postcode === "matched" &&
      matchCode.country === "matched",
  );
}

function formatResult(result: Feature) {
  const { properties, id } = result;
  const { context } = properties;

  console.log(properties.match_code);

  const formatted: GeocoderUnifiedResult = {
    formattedAddress: properties.full_address,
    latitude: properties.coordinates.latitude,
    longitude: properties.coordinates.longitude,
    country: context.country?.name,
    countryCode: context.country?.country_code,
    state: context.region?.name,
    city: context.place?.name,
    zipcode: context.postcode?.name,
    district: context.district?.name,
    streetName:
      properties.feature_type === "address"
        ? context.address?.street_name
        : undefined,
    streetNumber:
      properties.feature_type === "address"
        ? context.address?.address_number
        : undefined,
    neighbourhood: context.neighborhood?.name || context.locality?.name,
    extra: {
      id,
      bbox: properties.bbox ?? undefined,
      confidence: properties.match_code
        ? isTrustable(properties.match_code)
        : 0,
    },
  };

  return formatted;
}
