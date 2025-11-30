export interface NewPropertyForm {
  price: number;
  location: string;
  municipality: SarajevoMunicipality;
  condition: string;
  typeOfProperty: string;
  numberOfRooms: number;
  m2: number;
  equipment: string;
  level: number;
  heatingType: string;
  built: number;
  bathrooms: number;
  floorType: string;
  landM2: number;
  parking: boolean;
  orientation: string;
  additional: AdditionalFeature[];
}

export type SarajevoMunicipality =
  | "Centar"
  | "Stari Grad"
  | "Novi Grad"
  | "Novo Sarajevo"
  | "Ilidza"
  | "Vogosca"
  | "Hadžići"
  | "Trnovo"
  | "Ilijas";

export type PropertyCondition =
  | "Newly Built"
  | "Renovated"
  | "In Good Condition"
  | "Needs Renovation";

export type PropertyType =
  | "Apartment"
  | "House"
  | "Commercial Property"
  | "Office"
  | "Vacation Home";

export type EquipmentLevel =
  | "Unfurnished"
  | "Semi-furnished"
  | "Fully Furnished";

  export type FloorType =
  | "Parquet"
  | "Ceramic"
  | "Laminate"
  | "Marble"
  | "Vinyl"
  | "Carpet";

export type HeatingType =
  | "Central Heating"
  | "Gas"
  | "Electric Heating"
  | "Solid Fuel"
  | "Floor Heating"
  | "Heat Pump";

  export type Orientation =
  | "North"
  | "South"
  | "East"
  | "West"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";


export type AdditionalFeature =
  | "Garage"
  | "Elevator"
  | "Water"
  | "Electricity"
  | "Gas"
  | "Internet"
  | "ParkingCircle"
  | "Balcony"
  | "Terrace"
  | "RegisteredInLandRegistry"
  | "Alarm"
  | "VideoSurveillance";


  