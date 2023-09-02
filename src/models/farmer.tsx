export interface Farmer {
    username: string,
    address: string,
    coordinates: {
        x: number,
        y: number
    }
    name: string,
    products: string[]
};
