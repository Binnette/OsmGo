import { Component, Input } from '@angular/core';
import { MenuController, AlertController, Platform, NavController } from '@ionic/angular';
import { AboutPage } from '../about/about';
import { PushDataToOsmPage } from '../pushDataToOsm/pushDataToOsm';

import { MapService } from '../../services/map.service';
import { OsmApiService } from '../../services/osmApi.service';
import { DataService } from '../../services/data.service';
import { ConfigService } from '../../services/config.service';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'menu',
    templateUrl: './menu.html',
    styleUrls: ['./menu.scss']
})
export class MenuPage {

    @Input() content;
    aboutPage = AboutPage;
    pushDataToOsmPage = PushDataToOsmPage;

    constructor(public menuCtrl: MenuController,
        public mapService: MapService,
        public osmApi: OsmApiService,
        public dataService: DataService,
        public configService: ConfigService,
        public alertService: AlertService,
        private alertCtrl: AlertController,
        public platform: Platform,
        private navCtrl: NavController
    ) {


    }
    menuClosed() {
        this.configService.freezeMapRenderer = false;
    }

    // Le menu est ouvert, on freeze le rendu de la carte
    menuOpened() {
        this.configService.freezeMapRenderer = true;
    }

    deleteDatapresentConfirm() {
        this.alertCtrl.create({

            message: 'Supprimer les données téléchargées? (conserve les modifications)',
            buttons: [
                {
                    text: 'Annuler',
                    role: 'cancel',
                    handler: () => {

                    }
                },
                {
                    text: 'Confirmer',
                    handler: () => {
                        this.mapService.resetDataMap();
                        this.closeMenu();
                    }
                }
            ]
        })
        .then(alert => {
            alert.present();
        })
        ;

    }

    exit() {
        window.navigator['app'].exitApp();
    }
    pushPage(path) {
        this.navCtrl.navigateForward(path);
        // this.routerService.pushPage(pageName);
    }
    setRootPage(pageName) {
        // this.routerService.setRootPage(pageName);

    }

    closeMenu() {
        this.menuCtrl.close();
    }

    logout() {
        this.configService.setIsDelayed(true);
        this.osmApi.resetUserInfo();
    }

}
