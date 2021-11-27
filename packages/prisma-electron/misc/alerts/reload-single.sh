#!/bin/bash

MONGO="mongo localhost:8201/trident"

$MONGO ./clear_alerts.js
mongorestore --port=8201 --db=trident --collection=alerts ./alerts.bson
$MONGO ./dup_alerts.js
