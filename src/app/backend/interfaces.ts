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
  minutes_to_end: string;
  name: string;
  next: NextModel | null;
  paid: boolean;
  position: number;
  loadAll: true;
}


export class ServiceChoiceModel {
  service: ServiceModel;
  current: NextModel;
}


export class NextModel {
  items: Array<NameIdModel>;
  next: NextModel;
}


export class NameIdModel {
  public id: number;
  public name: string;
}

export class ServicePlayListModel {
  main: Array<PlayListModel>;
  additional: any;
}

export class SectionPlayList {
  playList: PlayListModel[];
  sectionName: string;
}

export class PlayListModel {
  id: string;
  name: string;
  path: string;
  //type: string; // file or computed
  isDownload: boolean;
  condition: string; // "day", "month", "year","date", "dayMonth", "number"
}