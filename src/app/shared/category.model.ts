export class Category {
    constructor(
        public id: number,
        public label: string,
        public type: string,
        public layerId: number,
        public layerUniqueId: string,
        public categories: Category[],
        public isExpanded: boolean,
        public isChecked: boolean
    ) {}
}
