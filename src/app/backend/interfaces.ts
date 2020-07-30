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
  cover: string;
  coverLocalPath: string;
  type: string;
  comment: string;
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

export class ServicePlayListModelObject {
  obj: { [key: string]: ServicePlayListModel }
}

export class ServicePlayListModel {
  main: Array<PlayListModel>;
  additional: any;
}

export class SectionPlayList {
  playList: PlayListModel[];
  service: ServiceModel;
  params: number[];
}

export class PlayListModel {
  id: string;
  name: string;
  path: string;
  //type: string; // file or computed
  isDownload: boolean;
  condition: string; // "day", "month", "year","date", "dayMonth", "number"
}

// export class AudioMainObject {
//   obj: { [key: string]: ServicePlayListModel }
// }

export class AudioObject {
  active: string;
  description: string;
  elements: Array<AudioElements>;
  id: string;
  json_data: {};
  name: string;
  tmp_rubric_id: {};
  type: string;

}

export class AudioElements {
  active: string;
  annotation: string;
  collection_id: string;
  date_created: string;// "2020-03-02T20:17:53+03:00"
  date_updated: string;// "2020-06-23T15:31:19+03:00"
  description: string;// " Из альбома «Я при часах, или часовой механизм»"
  duration: string;// "179"
  id: string;//"8666"
  json_data: {};//{description: "", tags: [], stikers: []}
  name: string; //"Песня «Ритмомерные часы» "
  preview_image_link: string; // ""
  preview_video_link: string; // ""
  tmp_duration_watching_access: string;//"0"
  tmp_product_id: null
  type: string;// "audio"
  user_access: {};//{accesses: {799: {entity_id: "260", entity_type: "1", id: "799", name: "Все аудио",…}},…}
  user_created: string; //"69742"
  visible_catalog: string;// "1"
}