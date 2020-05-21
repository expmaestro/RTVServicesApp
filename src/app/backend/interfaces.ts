
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