#!/bin/bash
# Load synthetic PCI cardholder data from CSV into the cardholder_data table.
# Runs as a PostgreSQL docker-entrypoint-initdb.d script (03-*).

set -e

echo "Loading PCI cardholder data..."
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\COPY cardholder_data(pan,network,expiry,cvv,cardholder_name,cardholder_email,phone,city,state,zip,country,issuing_bank,account_status) FROM '/data/synthetic_chd.csv' CSV HEADER"
echo "PCI cardholder data loaded."
