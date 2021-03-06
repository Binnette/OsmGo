import { Component, Input } from '@angular/core';

@Component({
    selector: 'read-presets',
    template: `
           <ion-card>
                <ion-card-header>
					<b *ngIf="!displayCode">{{tag.preset?.lbl}}</b>
					<b *ngIf="displayCode">{{tag.preset?.key}}</b>
				</ion-card-header>
				<ion-card-content>
                    <p *ngIf="!displayCode && (tag | displayPresetLabel)">{{(tag | displayPresetLabel).lbl}}</p>
                    <p *ngIf="displayCode || !(tag | displayPresetLabel)">
                        <i *ngIf="tag.preset?.type !== 'number'
                        && tag.preset?.type !== 'text' "
                        class="fa fa-code" aria-hidden="true"></i>
                         {{tag.value}}
                    </p>

				</ion-card-content>
			</ion-card>
  `
})
export class ReadPresets {
    @Input() displayCode;
    @Input() tag;
}
