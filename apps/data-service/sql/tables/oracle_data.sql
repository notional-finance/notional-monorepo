CREATE TABLE oracle_data (
	base VARCHAR(256),
    quote VARCHAR(256),
    oracle_type INT,
    network INT,
    timestamp INT,
    block_number BIGINT,
    decimals SMALLINT,
    oracle_address VARCHAR(256),
    latest_rate NUMERIC,
    PRIMARY KEY(base, quote, oracle_type, network, timestamp)
);
