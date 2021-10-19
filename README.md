# Minesweeper Versus

## Introduction

#### A multiplayer 1v1 Minesweeper game built with React, Typescript, SCSS and hosted on Heroku. 
#### And a personal project of mine.  

<img src="https://github.com/ChristopherK95/MinesweeperVs/blob/master/MinesweeperVs-img1.png" style="width: 700px; height: 500px; border-radius: 10px"/>

- The game is played like regular Minesweeper, with the addition of taking timed turns with an opponent and the goal to finish the game with the most points.  
- Unlike regular Minesweeper, the game doesn't end when a player presses a mine. Instead the player is subtracted 5 points.
- Settings like amount of tiles, bombs and time per round can be adjusted when hosting the game.

## Design
This repository contains the front-end of the site which has its very own server, while the back-end is handled on another server and has its own [repository](https://github.com/ChristopherK95/MinesweeperVs-server).
The communication between client and server is done with Socket.io.
