# La Guerre des Gones

A super cool real-time strategy conquest game set in Lyon, France

![](https://raw.githubusercontent.com/LeonardA-L/LaGuerreDesGones/master/utils/laGuerreDesGones.png)

## How it works

The map of Lyon (using google maps api) is separated into 51 zones you can conquer. There are several types of zones, for example banks, parks, universities... Each player starts on a neutral zone with 8 neutral units. There are also several types of units including students, tourists, bikers...

Each clock tick, zones generate a unit for their player. Needless to say each zone generates the kind of unit that is related to it (students spawn at universities, ...).

Using your units' special characteristics you have to conquer the city by moving your units from zones to zones, battling your way on zones that are occupied by your opponents. Now here comes the real-time part : every displacement (by foot, bike or metro) are equal to the time it would take to actually travel in the real city. To do so, the server frequently queries [the city's open data website](http://data.grandlyon.com/) to update. Therefore, no public transportation at night, no bike allowed if the city bikes are unavailable, etc.

Here a simple screencast demonstrating the gameplay:

(To be added)

(The real-time part for transportation has been accelerated to 1/1000 in this video)

This project was conducted by 7 french computer sciences engineering students as final school project of the year. The constraint was to use [the city's open data services](http://data.grandlyon.com/) as part of the project. Among the 16 projects, *La Guerre des Gones* was ranked 3rd by the jury.

## How to launch a server

### Technical overview

We used [MEAN.js](http://meanjs.org/) framework for this website, which uses MongoDB for non-relational database, Express.js as application server, Angular.js for client-side, and Node.js as web server.

For convenience we used [SASS](http://sass-lang.com/) for CSS development.

Each action in the game (buying, sell, moving, ...) is handled asynchronously, the server posts them to a job queue indicating a date at which it has to be processed. The job queue is then handled by a thead-pool that can contain several physical machines for scalability, even remote ones.

### Getting started

Clone the repository, and given your linux distribution, run `./install_arch` or `./install_ubuntu-debian.sh` if you have pacman/yaourt or apt-get as packet manager. It's not really sure those scripts actually work, but if they do, they will install all dependencies.

Check if the mongo daemon is running, if not, launch it.

Now, if every dependency is properly installed, running `./launch_prod` will launch a server, fill the database, update dependencies, launch 4 workers in the thread-pool, initialize everything.

For development purposes, settings where set to "really quick" and where not actually thought through. For example winning a battle grants you 100 points while you only need 1000 to win the game. Most of those constants can be set in `app/beowulf.js`.

## How unfinished it is

*La Guerre des Gones* is a school project, developped in two short weeks. It is, therefore, yet unfinished. We don't know how much time and motivation we will get to finish it in a near future, but here's a list of what is still left to do

* Front-end design. Oh boy, isn't it ugly.
* Secure webservices and server calls with constraints, for example
	* You can buy units until you have a negative amount of money, and beyond, server doesn't care for debts
	* If you manage your way to reverse engineer POST communication, you can actually create a request to sell your opponents' units and get the money for yourself
	* A thousand more.
* Clean and refactor the entire codebase : like every good school project, the pre-release all-nighter gave birth to a lot of dirty hot fixes
* Handle exceptions in the job processing queue
* QA and testing