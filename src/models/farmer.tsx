export interface Address {
    latitude: number,
    longitude: number,
    text: string
};

export interface Farmer {
    username: string,
    address: Address,
    name: string,
    products: string[]
};
