CREATE TABLE generic_data (
	id VARCHAR(512),
    strategy_id INT,
    variable VARCHAR(512),
    network_id INT,
    timestamp INT,
    block_number BIGINT,
    contract_address VARCHAR(256),
    method VARCHAR(256),
    decimals SMALLINT,
    latest_rate NUMERIC,
    PRIMARY KEY(id, strategy_id, variable, network_id, timestamp)
);
