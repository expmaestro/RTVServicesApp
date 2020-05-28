
export class Profile {
  USER_FIO: string;
  USER_ID: string;

  matrix: CoordVal;
  rPosition: CoordVal;
  softSignPosition: CoordVal;
  solidSignPosition: CoordVal;
  obraz: CoordVal;
  oblik: CoordVal;
  lobr: CoordVal;
  robl: CoordVal;
  stradasteya: CoordVal;
}

export class CoordVal {
  id: string;
  name: string;
  value: string;
  enumId: string;
}


export class CoordsModel {
  matrix: CoordModel;
  obraz: CoordModel;
  oblik: CoordModel;
  lobr: CoordModel;
  robl: CoordModel;
  stradasteya: CoordModel;
  radasteya: CoordModel;
  zituord: CoordModel;
  keyObraz: CoordModel;
  keyOblik: CoordModel;
  keyLobr: CoordModel;
  keyRobl: CoordModel;
  stradasteyaDistance: CoordModel;
  radasteyaCanvas: CoordModel;
  zituordCanvas: CoordModel;
  stradasteyaOpposite: CoordModel;
  stradasteyaOppositeDistance: CoordModel;
  stradasteyaParam: CoordModel;
}

export class CoordModel {
  name: string;
  filename: string;
}

export class VariantsObj {
  matrix: VariantsObjData;
  rPosition: VariantsObjData;
  softSignPosition: VariantsObjData;
  solidSignPosition: VariantsObjData;
  obraz: VariantsObjData;
  oblik: VariantsObjData;
  lobr: VariantsObjData;
  robl: VariantsObjData;
  stradasteya: VariantsObjData;
}

export class VariantsObjData {
  name: string;
  id: string;
  enum: Array<KeyValuePair>
}


class KeyValuePair {
  key: string;
  value: string;
}


export class ServiceModel {
  id: number;
  minutes_to_end: ""
  name: string;
  next: NextModel | null;
  paid: boolean;
  position: number;
}


export class NextModel {
  items: Array<NameIdModel>;
  next: NextModel;
}


export class NameIdModel {
  public id: number;
  public name: string;
}


export class PlayListModel {
  title: string;
  src: string;
  isDownload: boolean;
}



