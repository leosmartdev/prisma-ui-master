# demo

Notes on the current demo machine.

Credentials for the laptop are as follows:

* username: Demo
* password: !Pa55word 

All commands listed below are run in the propmt provided after clicking on
the "git bash" icon found on the desktop. Before typing any of the commands,
change to the c2 directory:

```
cd c2
```

The backend services run in a virtual machine and must be started after
rebooting the laptop.

```
vagrant up
```

Click on the C2 desktop icon to start the application. Credentials are
as follows:

* username: admin
* password: admin

An invalid username/password error message may also indicate that the
backend services are not running. Check the status of the backend services
with:

```
vagrant ssh
tmsd --info
exit
```

The output should look like the following:

```
pid  name       status   started  the last successful start  command line args
5523 tgwad      running  1 times  2016-10-27 19:23:00 UTC     --num 10 --name batam
5546 tnsd.py    running  1 times  2016-10-27 19:23:00 UTC     /var/lib/trident/sensorData/css-btm-24hour 3452
5530 tnoid      running  1 times  2016-10-27 19:23:00 UTC     --address 127.0.0.1:3452 --radar_latitude 1.187700 --radar_longitude 104.021866
5629 tclientd   running  2 times  2016-10-27 19:23:03 UTC
5529 tdatabased running  1 times  2016-10-27 19:23:00 UTC     -mongo-data /var/trident/db
5633 twebd      running  2 times  2016-10-27 19:23:03 UTC
5624 tanalyzed  running  2 times  2016-10-27 19:23:03 UTC
```

All services should be listed as running and only started one or two times.

If the backend services are not running properly for any reason, clean
out all runtime files and restart the system with the following:

```
vagrant ssh
sudo service tmsd stop
purge-tms
sudo service tmsd start
exit
```

To shutdown the virtual machine when no longer in use:

```
vagrant halt
```



