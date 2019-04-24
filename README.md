# Osm Go ! 

### Cartographiez les tous! 

On parle bien des POI! 
*OSM Go !* est une application mobile qui permet d'enrichir Openstreetmap directement sur le terrain.
Cartographier votre environnement direct n'a jamais été aussi simple et rapide. Gardez les yeux ouverts et ayez le réflexe ! 

L'APK peut se trouver dans la catégorie [releases de ce repo](https://github.com/DoFabien/OsmGo/releases) 

L'application Android est disponible sur [GooglePlay](https://play.google.com/store/apps/details?id=fr.dogeo.osmgo)

Une documentation rapide est [disponible ici](https://github.com/DoFabien/OsmGo/wiki)

 <p align="center">
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/map-vt.png?raw=true"/>
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/map-ortho.png?raw=true"/>
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/fiche.png?raw=true"/>
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/map-modif.png?raw=true"/>
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/select-primary-tag-velo.png?raw=true"/>
  <img src="https://raw.githubusercontent.com/wiki/DoFabien/OsmGo/assets/send-data.png"/>
</p>


### Dev
Osm Go! est une application *hybride* utilisant Ionic 4, donc Cordova et Angular 7. Pour le rendu de la carte, c'est l'excellent Mapbox GL JS qui est à la manœuvre

#### Pré-requis
Un système GNU/Linux (ex: Ubuntu) ou OSX. En effet, Osm Go! utilise Mapnik en version 4+, il sera donc [impossible](https://github.com/mapnik/node-mapnik/issues/848) de le compiler sur un poste Windows. 

#### Installation 
1) Installation des dépendences globales
```sh
sudo npm install -g cordova
sudo npm install -g ionic
```
2) Clone et installation des dépendences
```sh
https://github.com/DoFabien/OsmGo.git
cd OsmGo
npm install
```
3) Test dans le navigateur
```sh
ionic serve 
```

#### Android
Pour l'executer sur un smartphone Android, il faut installer et configurer tout l'environnement de developpement : JDK, Gradle, SDK d'Android, etc. Ça demande un peu de place sur le disque et pas mal de patience. En somme c'est du Java...

1) Ajouter la platforme Android
```sh
ionic cordova platform add android
```
2) Executer l'app sur un smartphone connecté en USB, ou à défaut sur un emulateur 
```sh
ionic cordova run android
```

#### iOS
L'application devrait fonctionner sur iOS avec quelques modifications extrêmement mineures du code.
Néanmoins, je n'ai pas d'iPhone, ni de Mac (pour faire une app ios, il faut un Mac...) et encore moins 100$/an à mettre pour avoir un compte développeur.

Si quelqu'un possède tout ça et souhaite porter l'app sur iOS, je serais heureux de l'aider.
