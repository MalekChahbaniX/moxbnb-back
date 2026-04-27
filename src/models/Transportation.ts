import mongoose, { Schema, Document } from 'mongoose';

export interface ITransitStop extends Document {
  name: string;
  latitude: number;
  longitude: number;
  type: 'BUS' | 'METRO' | 'TRAIN' | 'TRAM' | 'TAXI';
  distance?: number; // Distance en mètres depuis le logement
}

export interface ITransitLine extends Document {
  name: string;
  type: 'BUS' | 'METRO' | 'TRAIN' | 'TRAM' | 'TAXI';
  number?: string;
  operator: string;
  stops: ITransitStop[];
  description?: string;
}

export interface ITransportation extends Document {
  listingId: mongoose.Types.ObjectId;
  nearbyBuses: {
    count: number;
    closestStop?: {
      name: string;
      distance: number; // en mètres
      walkingTime?: number; // en minutes
    };
  };
  nearbyMetro?: {
    available: boolean;
    stations: {
      name: string;
      distance: number;
      walkingTime?: number;
    }[];
  };
  nearbyTrains?: {
    available: boolean;
    stations: {
      name: string;
      distance: number;
    }[];
  };
  nearbyTaxis?: {
    available: boolean;
    services: string[];
  };
  accessibility: {
    wheelchairAccessible: boolean;
    elevatorNearby: boolean;
    rampAccess: boolean;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transitStopSchema = new Schema<ITransitStop>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  type: {
    type: String,
    enum: ['BUS', 'METRO', 'TRAIN', 'TRAM', 'TAXI'],
    required: true
  },
  distance: {
    type: Number,
    min: 0
  }
}, { _id: true });

const transitLineSchema = new Schema<ITransitLine>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['BUS', 'METRO', 'TRAIN', 'TRAM', 'TAXI'],
    required: true
  },
  number: {
    type: String,
    trim: true
  },
  operator: {
    type: String,
    trim: true,
    required: true
  },
  stops: [transitStopSchema],
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

const transportationSchema = new Schema<ITransportation>({
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    unique: true
  },
  nearbyBuses: {
    count: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    closestStop: {
      name: String,
      distance: { type: Number, min: 0 },
      walkingTime: { type: Number, min: 1 }
    }
  },
  nearbyMetro: {
    available: {
      type: Boolean,
      default: false
    },
    stations: [{
      name: String,
      distance: { type: Number, min: 0 },
      walkingTime: { type: Number, min: 1 }
    }]
  },
  nearbyTrains: {
    available: {
      type: Boolean,
      default: false
    },
    stations: [{
      name: String,
      distance: { type: Number, min: 0 }
    }]
  },
  nearbyTaxis: {
    available: {
      type: Boolean,
      default: true
    },
    services: [String]
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    elevatorNearby: {
      type: Boolean,
      default: false
    },
    rampAccess: {
      type: Boolean,
      default: false
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
transportationSchema.index({ listingId: 1 });
transportationSchema.index({ 'nearbyBuses.count': 1 });
transportationSchema.index({ 'nearbyMetro.available': 1 });
transportationSchema.index({ 'accessibility.wheelchairAccessible': 1 });

export const Transportation = mongoose.model<ITransportation>('Transportation', transportationSchema);
