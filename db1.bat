@echo off
start /B mongod --replSet casatejada -logpath /data/replicaset1/1.log -dbpath /data/replicaset1 --port 27018
start /B mongod --replSet casatejada -logpath /data/replicaset2/2.log -dbpath /data/replicaset2 --port 27019