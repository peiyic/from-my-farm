CREATE TABLE IF NOT EXISTS farmer (
    username text NOT NULL,
    name text,
    address text NOT NULL,
    coordinates point NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS ownership (
    farmer_username text NOT NULL,
    product text NOT NULL,
    PRIMARY KEY (farmer_username, product)
);