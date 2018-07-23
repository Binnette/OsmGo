import { Injectable, EventEmitter } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';

import { Diagnostic } from '@ionic-native/diagnostic';
import * as turf from '@turf/turf';

@Injectable()
export class LocationService {
    eventNewLocation = new EventEmitter();
    eventNewCompassHeading = new EventEmitter();
    eventStartCompassHeading = new EventEmitter();
    eventPlatformReady = new EventEmitter();
    location;
    pointGeojson;
    compassHeading = { magneticHeading: 0, trueHeading: 0, headingAccuracy: 0, timestamp: 0 };
    headingTest = 0;
    gpsIsReady = false;
    subscriptionLocation;
    subscriptionWatchLocation;
    forceOpen: boolean = false; // l'utilisateur a fait le choix d'ouvrir l'app sans geoloc
    isFirstLocation = true;

    constructor(private geolocation: Geolocation, private deviceOrientation: DeviceOrientation, private diagnostic: Diagnostic) {

        this.eventPlatformReady.subscribe(isVirtual => {
            /*DEBUG ionic serve */
            if (isVirtual) {
                this.location = { coords: { accuracy: 20, altitude: null, altitudeAccuracy: null, heading: null, latitude: 45.1865723, longitude: 5.7171862, speed: null }, timestamp: 1479114012803 };
                this.eventNewLocation.emit(this.getGeojsonPos());
                this.gpsIsReady = true;
                this.enableGeolocation();
            } else {

                this.diagnostic.registerLocationStateChangeHandler(data => {
                    if (data === 'location_off') {
                        this.disableGeolocation();
                    } else {
                        this.enableGeolocation();
                    }
                })

                this.diagnostic.isLocationAuthorized()
                    .then(autorised => {
                        if (autorised === false) {
                            this.diagnostic.requestLocationAuthorization().then(e => {
                                if (e == 'GRANTED') {
                                    this.checkIfLocationIsAvailable()
                                } else {
                                    // l'utilisateur à refuser la geoloc ...
                                }
                            })

                        } else {
                            this.checkIfLocationIsAvailable()
                        }
                    })
            }
            this.heading(isVirtual)
        })
    }

    checkIfLocationIsAvailable() {
        this.diagnostic.isLocationAvailable()
            .then(isLocationAvailable => {
                if (!isLocationAvailable) {
                    this.diagnostic.switchToLocationSettings();
                } else { // la loc est activé
                    this.enableGeolocation();
                }
            })
            .catch(error => {

            });
    }

    enableGeolocation() {

        this.subscriptionWatchLocation = this.geolocation.watchPosition({ enableHighAccuracy: true })
            .subscribe((data) => {
                    if (!this.gpsIsReady) {
                        this.gpsIsReady = true;
                    }

                    let distance = Infinity;
                    if (this.location && this.location.coords) {
                        const from = turf.point([data.coords.longitude, data.coords.latitude]);
                        const to = turf.point([this.location.coords.longitude, this.location.coords.latitude]);
                        distance = turf.distance(from, to, { units: 'metres' }); //=> m
                    } else {

                    }
                    // on ne déplace le marker que si la position à changé de 2 m au moins
                    // Sinon ça regénère le rendu et ça fait chauffé le téléphone pour rien...
                    if (distance > 2) {
                        this.location = data;
                        this.eventNewLocation.emit(this.getGeojsonPos());
                    }
            });

    };

    disableGeolocation() {
        this.subscriptionWatchLocation.unsubscribe()
    }

    heading(isVirtual) {
        if (isVirtual) { // for testing : ionic Serve
            this.compassHeading = { magneticHeading: 0, trueHeading: 0, headingAccuracy: 0, timestamp: 0 };
                this.eventNewCompassHeading.emit(this.compassHeading);
        } else {
            this.deviceOrientation.watchHeading({ frequency: 200 }).subscribe((data) => {
                    if (Math.abs(data.trueHeading - this.compassHeading.trueHeading) > 4) {
                        // near 360? TODO
                        this.compassHeading = data;
                        this.eventNewCompassHeading.emit(data);
                    }

            });
        }
    }
    getLocation() {
        return this.location;
    }

    getCoordsPosition() {
        if (this.location) {
            return [this.location.coords.longitude, this.location.coords.latitude]
        }
        else {
            return [0, 0];
        }
    }

    getGeojsonPos() {
        let lon = (this.location && this.location.coords) ? this.location.coords.longitude : 5.6;
        let lat = (this.location && this.location.coords) ? this.location.coords.latitude : 45.6;
        let accuracy = (this.location) ? this.location.coords.accuracy : 0;
        let heading = this.compassHeading.trueHeading;

        this.pointGeojson = {
            "type": "FeatureCollection", "features": [
                {
                    "geometry": { "type": "Point", "coordinates": [lon, lat] },
                    "properties": {
                        "accuracy": accuracy,
                        "trueHeading": heading
                    }
                }
            ]
        }
        return this.pointGeojson
    }

    getGeoJSONCirclePosition(points = 64) {
        if (!points) points = 64;
        let radiusInKm = this.location.coords.accuracy / 1000;
        let coords = {
            latitude: this.location.coords.latitude,
            longitude: this.location.coords.longitude
        };
        let km = radiusInKm;
        let ret = [];
        let distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
        let distanceY = km / 110.574;

        let theta, x, y;
        for (let i = 0; i < points; i++) {
            theta = (i / points) * (2 * Math.PI);
            x = distanceX * Math.cos(theta);
            y = distanceY * Math.sin(theta);
            ret.push([coords.longitude + x, coords.latitude + y]);
        }
        ret.push(ret[0]);
        return {
            "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [ret] } }]
        };
    };
}
