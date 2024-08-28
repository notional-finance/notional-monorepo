CREATE TABLE yield_data (
	token VARCHAR(512),
	underlying VARCHAR(512),
	debt_token VARCHAR(512),
    network_id INT,
    block_number BIGINT,
	total_value_locked NUMERIC,
    total_apy NUMERIC,
    interest_apy NUMERIC,
    note_incentives NUMERIC,
    fee_apy NUMERIC,
    leverage NUMERIC,
    max_leverage NUMERIC,
    debt_rate NUMERIC,
    PRIMARY KEY(token, underlying, debt_token, network_id, block_number)	
);
