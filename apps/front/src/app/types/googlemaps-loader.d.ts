declare module '@googlemaps/js-api-loader' {
  export class Loader {
    constructor(options: {
      apiKey: string;
      version?: string;
      libraries?: string[];
    });
    load(): Promise<unknown>;
  }
}
