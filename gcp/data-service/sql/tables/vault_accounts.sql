CREATE TABLE vault_accounts (
	account_id VARCHAR(256),
    vault_id VARCHAR(256),
    network_id INT,
	PRIMARY KEY(account_id, vault_id, network_id)
);
