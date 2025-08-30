@echo off
start /B mongod --replSet antonios -logpath D:/data/antonios/rpl1/1.log -dbpath D:/data/antonios/rpl1 --port 27018
start /B mongod --replSet antonios -logpath D:/data/antonios/rpl2/2.log -dbpath D:/data/antonios/rpl2 --port 27019