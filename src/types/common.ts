export type GeocoderUnifiedResult = {
	latitude: number;
	longitude: number;
	formattedAddress?: string;
	country?: string;
	countryCode?: string;
	state?: string;
	region?: string;
	city?: string;
	zipcode?: string;
	streetName?: string;
	streetNumber?: string;
	[key: string]: any;
	extra?: {
		id?: string | number;
		confidence?: number;
        bbox?: number[];
		[key: string]: any;
	};
};