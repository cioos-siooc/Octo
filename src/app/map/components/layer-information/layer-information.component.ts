/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import * as fromLayerInformation from '@app/map/store/reducers/layer-information.reducers';
import {Store} from '@ngrx/store';
import {MapState} from '@app/map/store';
import {selectLayerInformationState} from '@app/map/store';

@Component({
  selector: 'app-layer-information',
  templateUrl: './layer-information.component.html',
  styleUrls: ['./layer-information.component.css']
})
export class LayerInformationComponent implements OnInit {
  layerInformationState: Observable<fromLayerInformation.LayerInformationState>;
  layerInformationHtml: string;

  constructor(private store: Store<MapState>) {
  }

  ngOnInit() {
    this.layerInformationState = this.store.select(selectLayerInformationState);
    // this.layerInformationState.subscribe((state) => this.layerInformationHtml = state.informationHtml);
  }

}
