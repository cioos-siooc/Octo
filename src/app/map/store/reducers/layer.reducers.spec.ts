/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {layerReducer} from './layer.reducers';
import * as fromLayer from './layer.reducers';
import {WmsLayer} from '@app/shared/models';
import {AddLayer, DeleteLayer, MoveDownLayer, MoveUpLayer, SetClientPresentation, UpdateLayer} from '../actions/layer.actions';
import {ClientPresentation} from '@app/shared/models';

describe('LayerReducer', () => {

  it('should return default state when no state and no action passed', () => {
    expect(layerReducer(undefined, <any>{})).toEqual(fromLayer.initialState);
  });

  it('should have immutable payload', () => {
    const layer = new WmsLayer();
    layer.id = 1;
    const action = new AddLayer(layer);
    const finalState = layerReducer(fromLayer.initialState, action);
    layer.code = 'test-code';
    expect(finalState.layers[0]).not.toEqual(layer);
  });


  it('should add layer to state.layers', () => {
    const layer = new WmsLayer();
    layer.id = 1;
    const action = new AddLayer(layer);
    const finalState = layerReducer(fromLayer.initialState, action);
    const expectedState = {
      layers: [layer]
    };
    expect(finalState).toEqual(expectedState);
  });

  it('should delete layer from state.layers', () => {
    const layer = new WmsLayer();
    layer.id = 1;
    const initialState = {
      layers: [layer]
    };
    const action = new DeleteLayer(1);
    const finalState = layerReducer(initialState, action);
    const expectedState = {
      layers: []
    };
    expect(finalState).toEqual(expectedState);
  });

  it('should update layer to given layer', () => {
    const layer = new WmsLayer();
    layer.id = 1;
    layer.code = 'initial-code';
    const initialState = {
      layers: [layer]
    };
    const updatedLayer = new WmsLayer();
    updatedLayer.id = 1;
    updatedLayer.code = 'final-code';
    const action = new UpdateLayer(updatedLayer);
    const finalState = layerReducer(initialState, action);
    expect(finalState.layers[0].code).toEqual('final-code');
  });

  it('should move layer up', () => {
    const firstLayer = new WmsLayer();
    firstLayer.id = 1;
    const secondLayer = new WmsLayer();
    secondLayer.id = 2;
    const initialState = {
      layers: [firstLayer, secondLayer]
    };
    const action = new MoveUpLayer(1);
    const finalState = layerReducer(initialState, action);
    expect(finalState.layers[0].id).toEqual(2);
  });

  it('should move layer down', () => {
    const firstLayer = new WmsLayer();
    firstLayer.id = 1;
    const secondLayer = new WmsLayer();
    secondLayer.id = 2;
    const initialState = {
      layers: [firstLayer, secondLayer]
    };
    const action = new MoveDownLayer(2);
    const finalState = layerReducer(initialState, action);
    expect(finalState.layers[0].id).toEqual(2);
  });

  it('should set current client presentation for specified layer', () => {
    const layer = new WmsLayer();
    layer.id = 1;
    const clientPresentation = new ClientPresentation();
    clientPresentation.id = 1;
    clientPresentation.isDefault = true;
    const initialState = {
      layers: [layer]
    };
    const action = new SetClientPresentation({
      layerId: layer.id,
      clientPresentation: clientPresentation
    });
    const finalState = layerReducer(initialState, action);
    expect(finalState.layers[0].currentClientPresentation).toEqual(clientPresentation);
  });

});
