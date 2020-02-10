
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AddLayer, SetLayerPosition, InitLayerPosition } from './../actions/layer.actions';

import {Actions, Effect} from '@ngrx/effects';


import {catchError, map, mergeMap, withLatestFrom} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Layer} from '@app/shared/models';
import {LayerDescription} from '@app/shared/models/layer-description.model';
import {environment} from '@env/environment';
import {ClientPresentation} from '@app/shared/models';
import {ClickStrategy} from '@app/shared/models';
import {ClickFormatterInfo} from '@app/shared/models';
import {uniqueId} from 'lodash';
import {of} from 'rxjs/internal/observable/of';
import {cloneDeep} from 'lodash';
import { StoreState } from './../reducers/index';
import { Store } from '@ngrx/store';
import {
  FetchClickFormatter,
  FetchClickStrategy,
  FetchClientPresentations,
  FetchLayer,
  FetchLayerDescription,
  LayerActionTypes
} from '../actions/layer.actions';

@Injectable()
export class LayerEffects {

  @Effect()
  layerFetch = this.actions$
    .ofType<FetchLayer>(LayerActionTypes.FETCH_LAYER)
    .pipe(mergeMap((action: FetchLayer) => {
      return this.httpClient.get<Layer>(`${environment.mapapiUrl}/layers/${action.payload.layerId}`).pipe(map(
        (layer) => {
          layer.uniqueId = action.payload.uniqueId;
          layer.defaultPriority = action.payload.priority;
          layer.priority = -1;

          // Do some layer group stuff
          if (action.payload.layerGroupId) {
            layer.layerGroupId = action.payload.layerGroupId;
          }
          if (layer.urlBehaviors != null) {
            layer.urlBehaviors.forEach((behavior) => {
              behavior.uniqueId = uniqueId();
              behavior.layerUniqueId = layer.uniqueId;
            });
          }
          return layer;
        }
      ));
    }), mergeMap(
      (layer) => {
        return [
          new FetchClickStrategy(layer)
        ];
      }
    ));


  @Effect()
  clickStrategyFetch = this.actions$
    .ofType<FetchClickStrategy>(LayerActionTypes.FETCH_CLICK_STRATEGY)
    .pipe(mergeMap((action: FetchClickStrategy) => {
        return this.httpClient.get<ClickStrategy>(`${environment.mapapiUrl}/layers/${action.payload.id}/click-strategies`).pipe(
          map(
            (clickStrategy) => {
              const newAction = cloneDeep(action);
              newAction.payload.clickStrategy = clickStrategy;
              return newAction.payload;
            }
          ), catchError((err: HttpErrorResponse) => {
            return of(action.payload);
          }));
      })
      , map(
        (layer) => {
          return {
            type: LayerActionTypes.FETCH_CLICK_FORMATTER,
            payload: layer
          };
        }
      ));
  @Effect()
  clickFormatterFetch = this.actions$
    .ofType<FetchClickFormatter>(LayerActionTypes.FETCH_CLICK_FORMATTER)
    .pipe(mergeMap((action: FetchClickFormatter) => {
        return this.httpClient.get<ClickFormatterInfo>(`${environment.mapapiUrl}/layers/${action.payload.id}/click-formatters`).pipe(
          map(
            (clickFormatterInfo) => {
              const newAction = cloneDeep(action);
              newAction.payload.clickFormatterInfo = clickFormatterInfo;
              return newAction.payload;
            }
          ), catchError((err: HttpErrorResponse) => {
            return of(action.payload);
          }));
      })
      , map(
        (layer) => {
          return {
            type: LayerActionTypes.FETCH_CLIENT_PRESENTATIONS,
            payload: layer
          };
        }
      ));

  @Effect()
  clientPresentationsFetch = this.actions$
    .ofType<FetchClientPresentations>(LayerActionTypes.FETCH_CLIENT_PRESENTATIONS)
    .pipe(mergeMap((action: FetchClientPresentations) => {
        return this.httpClient.get<ClientPresentation[]>(
          `${environment.mapapiUrl}/layers/${action.payload.id}/client-presentations`).pipe(map(
          (clientPresentations) => {
            // Add clientPresentations to the layer and set the default as the current one
            const newPayload = {...action.payload};

            // default to slgo-mapbox if the styler is undefined
            clientPresentations = clientPresentations.map((cp) => {
              if (typeof(cp.styler) === 'undefined' ) {
                cp.styler = 'slgo-mapbox'
              }
              return cp;
            });

            newPayload.currentClientPresentation = clientPresentations.find((cp: ClientPresentation) => {
              return cp.isDefault;
            });
            newPayload.clientPresentations = clientPresentations;
            return newPayload;
          }
        ));
      })
      , map(
        (layer) => new FetchLayerDescription(layer)
      ));

  @Effect()
  layerDescriptionFetch = this.actions$
      .ofType<FetchLayerDescription>(LayerActionTypes.FETCH_LAYER_DESCRIPTION)
      .pipe(mergeMap((action: FetchLayerDescription) => {
        return this.httpClient.get<LayerDescription>
        (`${environment.mapapiUrl}/layers/${action.payload.id}/layer-descriptions`).pipe(
          map(
            (layerDescription) => {
              const newPayload = {...action.payload};
              newPayload.description = layerDescription;
              return newPayload;
            }
          ), catchError((err: HttpErrorResponse) => {
            return of(action.payload);
          }),
          map((layer: Layer) => new AddLayer(layer))
        );
      }));

  @Effect()
  layerPosition = this.actions$
      .ofType<AddLayer>(LayerActionTypes.ADD_LAYER)
      .pipe(map((action: AddLayer) => {
        if (action.payload.priority === -1) {
          return new InitLayerPosition({layerId: action.payload.uniqueId});
        }
      }));

  @Effect()
  initLayerPosition = this.actions$
      .ofType<InitLayerPosition>(LayerActionTypes.INIT_LAYER_POSITION)
      .pipe(
        withLatestFrom(this.store$),
        map(([action, store]) => {
          const layer = store.map.layer.layers.filter((l: Layer) => l.uniqueId === action.payload.layerId)[0];
          return new SetLayerPosition({
            layerId: action.payload.layerId,
            newLayerPosition: layer.defaultPriority
          });
      }));

  constructor(private actions$: Actions,
              private httpClient: HttpClient,
              private store$: Store<StoreState>) {
  }
}
