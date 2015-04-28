#!/bin/bash

sudo apt-get -y install git
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get -y install nodejs
sudo npm install npm -g
sudo apt-get -y install mongodb
# sudo apt-get -y install npm - Already installed with nodejs
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g yo
sudo npm install -g generator-meanjs
sudo apt-get -y install ruby-sass
cd app && sudo npm install
#sudo npm install grunt-contrib-sass --save-dev
sudo bower install --allow-root
