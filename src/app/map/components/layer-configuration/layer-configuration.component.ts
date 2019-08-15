import { Layer } from '@app/shared/models/layer.model';
import { Store } from '@ngrx/store';
import { MapState, selectBehaviorState } from '@app/map/store';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-layer-configuration',
  templateUrl: './layer-configuration.component.html',
  styleUrls: ['./layer-configuration.component.css']
})
export class LayerConfigurationComponent implements OnInit {
  behaviors: any[];
  @Input() layer: Layer;

  constructor(private store: Store<MapState>, public modal: NgbActiveModal) { }

  ngOnInit() {
    this.store.select(selectBehaviorState).subscribe((behaviorState) => {
      this.behaviors = behaviorState.behaviors.filter(b => b.layerUniqueId === this.layer.uniqueId);
      console.log(this.behaviors);
    });
  }
}
