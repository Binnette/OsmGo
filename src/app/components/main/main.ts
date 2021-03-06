import { Component, NgZone, AfterViewInit } from '@angular/core';
import {
  NavController, MenuController,
  ModalController, ToastController, Platform, AlertController
} from '@ionic/angular';


import { OsmApiService } from '../../services/osmApi.service';
import { TagsService } from '../../services/tags.service';
import { MapService } from '../../services/map.service';
import { DataService } from '../../services/data.service';
import { LocationService } from '../../services/location.service';
import { AlertService } from '../../services/alert.service';
import { ConfigService } from '../../services/config.service';
import { ModalsContentPage } from '../modal/modal';
import { BBox } from '@turf/turf';

import { timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';


@Component({
  templateUrl: './main.html',
  selector: 'main',
  styleUrls: ['./main.scss']
})

export class MainPage implements AfterViewInit {
  modalIsOpen = false;

  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public menuCtrl: MenuController,
    public osmApi: OsmApiService,
    public tagsService: TagsService,
    public mapService: MapService,
    public dataService: DataService,
    public locationService: LocationService,
    public alertService: AlertService,
    public configService: ConfigService,
    public platform: Platform,
    private alertCtrl: AlertController,
    private _ngZone: NgZone,
    private router: Router
  ) {

    this.tagsService.loadPresets().subscribe();
    this.tagsService.loadTags();

    this.router.events.subscribe((e) => {

      if (e instanceof NavigationEnd) {
        if (e['urlAfterRedirects'] === '/main') {
          this.configService.freezeMapRenderer = false;
          // la carte ne detect pas toujours le changement de taille du DOM...
          if (this.mapService.map) {
            timer(300).subscribe(t => {
              this.mapService.map.resize();
            });
          }

        } else {
          this.configService.freezeMapRenderer = true;
        }
      }
    });

    this.platform.backButton.subscribe(async () => {
      if (this.router.url === '/main') {
        if (this.modalIsOpen) {
          return;
        }
        const menuIsOpen = await this.menuCtrl.isOpen('menu1');
        if (menuIsOpen) {
          this.menuCtrl.close('menu1');
        } else {
          this.presentConfirm();
        }
      }
    });

    mapService.eventShowModal.subscribe(async (_data) => {

      this.configService.freezeMapRenderer = true;
      const newPosition = (_data.newPosition) ? _data.newPosition : false;


      const modal = await this.modalCtrl.create({
        component: ModalsContentPage,
        componentProps: { type: _data.type, data: _data.geojson, newPosition: newPosition, origineData: _data.origineData }
      });
      await modal.present();
      this.modalIsOpen = true;

      modal.onDidDismiss().then(d => {
        this.modalIsOpen = false;
        const data = d.data;
        this.configService.freezeMapRenderer = false;
        if (data) {
          if (data['type'] === 'Move') {
            this.mapService.eventMoveElement.emit(data);
          }
          if (data['redraw']) {
            timer(50).subscribe(t => {
              this.mapService.eventMarkerReDraw.emit(this.dataService.getGeojson());
              this.mapService.eventMarkerChangedReDraw.emit(this.dataService.getGeojsonChanged());
            });
          }
        }
      });

    });


    this.alertService.eventNewAlert.subscribe(alert => {
      this.presentToast(alert);
    });


  }

  openMenu() {
    this.menuCtrl.open('menu1');

  }



  presentConfirm() {
    this.alertCtrl.create({
      header: 'Vraiment?',
      message: 'Voulez vous vraiment quitter Osm Go! ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Oui',
          handler: () => {
            window.navigator['app'].exitApp();
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });

  }

  loadData() {
    // L'utilisateur charge les données, on supprime donc le tooltip
    this._ngZone.run(() => {
      this.alertService.displayToolTipRefreshData = false;
      this.mapService.loadingData = true;
    });


    const bbox: BBox = this.mapService.getBbox();
    this.osmApi.getDataFromBbox(bbox, false)
      .subscribe(data => { // data = geojson a partir du serveur osm

      },
        err => {
          this.mapService.loadingData = false;
          console.log(err);
          this.presentToast(err);
        });
  }



  goToPage(pageName) {
    // this.routerService.pushPage(pageName)

  }
  goToPushDataPage() {
    if (this.osmApi.getUserInfo().connected) {
      this.goToPage('pushDataToOsmPage');
    } else {
      this.goToPage('loginPage');
    }
  }



  presentToast(message) {
    this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 4000,
      showCloseButton: true,
      closeButtonText: 'X'
    })
      .then(toast => {
        toast.present();
      });

  }

  ngAfterViewInit() {
    this.tagsService.loadTags();
    this.mapService.eventDomMainReady.emit(document.getElementById('map'));
    this.alertService.eventDisplayToolTipRefreshData.subscribe(async e => {

      const toast = await this.toastCtrl.create({
        position: 'bottom',
        message: 'Charger les données de l\'emprise ?',
        showCloseButton: true,
        duration: 6000,
        closeButtonText: 'Ok'
      });
      toast.present();
      toast.onDidDismiss().then(ev => {
        if (ev.role === 'cancel') {
          if (this.mapService.map && this.mapService.map.getZoom() > 16) {
            this.loadData();
          }
        }
      });
    });
  }
}
