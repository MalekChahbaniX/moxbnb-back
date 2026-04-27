import { Request, Response } from 'express';
import { Transportation, Listing } from '../models';

// Obtenir les informations de transport pour un logement
export const getTransportationInfo = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const transportation = await Transportation.findOne({ listingId });
    
    if (!transportation) {
      return res.status(404).json({ error: 'Transportation info not found' });
    }

    res.json(transportation);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transportation info' });
  }
};

// Créer ou mettre à jour les informations de transport
export const updateTransportationInfo = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { nearbyBuses, nearbyMetro, nearbyTrains, nearbyTaxis, accessibility } = req.body;

    // Vérifier que le logement existe
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    let transportation = await Transportation.findOne({ listingId });

    if (transportation) {
      // Mise à jour
      transportation.nearbyBuses = nearbyBuses || transportation.nearbyBuses;
      transportation.nearbyMetro = nearbyMetro || transportation.nearbyMetro;
      transportation.nearbyTrains = nearbyTrains || transportation.nearbyTrains;
      transportation.nearbyTaxis = nearbyTaxis || transportation.nearbyTaxis;
      transportation.accessibility = accessibility || transportation.accessibility;
      transportation.lastUpdated = new Date();
      await transportation.save();
    } else {
      // Création
      transportation = new Transportation({
        listingId,
        nearbyBuses: nearbyBuses || { count: 0 },
        nearbyMetro: nearbyMetro || { available: false, stations: [] },
        nearbyTrains: nearbyTrains || { available: false, stations: [] },
        nearbyTaxis: nearbyTaxis || { available: true, services: [] },
        accessibility: accessibility || { wheelchairAccessible: false, elevatorNearby: false, rampAccess: false }
      });
      await transportation.save();
    }

    res.json(transportation);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transportation info' });
  }
};

// Récupérer les transports à proximité (dans un rayon de X mètres)
export const getNearbyTransport = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query; // radius en mètres

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusInKm = (parseInt(radius as string) || 1000) / 1000;

    // Rechercher les logements à proximité
    const listings = await Listing.find({
      $and: [
        {
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lon, lat]
              },
              $maxDistance: parseInt(radius as string) || 1000
            }
          }
        }
      ]
    });

    // Récupérer les infos de transport pour ces logements
    const transportInfo = await Transportation.find({
      listingId: { $in: listings.map(l => l._id) }
    }).populate('listingId');

    res.json(transportInfo);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching nearby transport' });
  }
};

// Récupérer les logements pour étudiants avec les transports
export const getStudentListingsWithTransport = async (req: Request, res: Response) => {
  try {
    const { city, pricingType, page = 1, limit = 10 } = req.query;

    const query: any = {
      targetAudience: 'STUDENTS',
      status: 'PUBLISHED'
    };

    if (city) {
      query.city = city;
    }

    if (pricingType) {
      query.pricingType = pricingType;
    }

    const skip = ((parseInt(page as string) || 1) - 1) * (parseInt(limit as string) || 10);

    const listings = await Listing.find(query)
      .skip(skip)
      .limit(parseInt(limit as string) || 10)
      .sort({ createdAt: -1 });

    // Récupérer les infos de transport pour chaque logement
    const listingsWithTransport = await Promise.all(
      listings.map(async (listing) => {
        const transport = await Transportation.findOne({ listingId: listing._id });
        return {
          ...listing.toObject(),
          transport
        };
      })
    );

    const total = await Listing.countDocuments(query);

    res.json({
      data: listingsWithTransport,
      pagination: {
        total,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        pages: Math.ceil(total / (parseInt(limit as string) || 10))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student listings' });
  }
};

// Supprimer les informations de transport
export const deleteTransportationInfo = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const result = await Transportation.deleteOne({ listingId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transportation info not found' });
    }

    res.json({ message: 'Transportation info deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transportation info' });
  }
};
