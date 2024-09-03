CREATE TABLE accounts (
	account_id VARCHAR(256),
        network_id INT,
	PRIMARY KEY(account_id, network_id)
);
