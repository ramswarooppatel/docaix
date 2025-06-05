import { NextRequest, NextResponse } from 'next/server';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function getNearbyHospitals(lat: number, lon: number, radius: number = 5000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      way["healthcare"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
    );
    out center meta;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    const hospitals = data.elements.map((elem: any) => {
      const name = elem.tags?.name || elem.tags?.["name:en"] || "Unnamed Medical Facility";
      const latitude = elem.lat || elem.center?.lat;
      const longitude = elem.lon || elem.center?.lon;
      const phone = elem.tags?.phone || elem.tags?.["contact:phone"];
      const website = elem.tags?.website || elem.tags?.["contact:website"];
      const emergency = elem.tags?.emergency;
      const healthcare = elem.tags?.healthcare;
      const amenity = elem.tags?.amenity;
      const opening_hours = elem.tags?.opening_hours;
      const operator = elem.tags?.operator;
      const address = elem.tags?.["addr:full"] || 
                     `${elem.tags?.["addr:street"] || ""} ${elem.tags?.["addr:housenumber"] || ""}`.trim() ||
                     elem.tags?.["addr:city"] || "Address not available";

      // Calculate distance from user location
      const distance = calculateDistance(lat, longitude, latitude, longitude);

      // Determine facility type
      let facilityType = "Medical Facility";
      if (amenity === "hospital" || healthcare === "hospital") {
        facilityType = "Hospital";
      } else if (amenity === "clinic" || healthcare === "clinic") {
        facilityType = "Clinic";
      } else if (emergency === "yes") {
        facilityType = "Emergency Center";
      }

      // Simulate rating (since OSM doesn't have ratings)
      const simulatedRating = Math.random() * (4.8 - 3.5) + 3.5;
      const simulatedReviews = Math.floor(Math.random() * 200) + 10;

      // Check if likely to be open (rough estimate)
      const isLikelyOpen = !opening_hours || opening_hours.includes("24/7") || 
                          facilityType === "Hospital" || emergency === "yes";

      return {
        place_id: `osm_${elem.type}_${elem.id}`,
        name,
        vicinity: address,
        rating: Math.round(simulatedRating * 10) / 10,
        user_ratings_total: simulatedReviews,
        geometry: {
          location: { lat: latitude, lng: longitude }
        },
        opening_hours: { 
          open_now: isLikelyOpen 
        },
        formatted_phone_number: phone,
        website: website,
        types: [amenity || healthcare || "medical_facility"],
        distance_km: Math.round(distance * 10) / 10,
        facility_type: facilityType,
        emergency_services: emergency === "yes",
        operator: operator,
        osm_data: {
          type: elem.type,
          id: elem.id,
          tags: elem.tags
        }
      };
    }).filter((hospital: any) => 
      hospital.geometry.location.lat && hospital.geometry.location.lng
    ).sort((a: any, b: any) => a.distance_km - b.distance_km);

    return hospitals;
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000';

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    console.log(`Searching for hospitals near: ${lat}, ${lng} within ${radius}m`);
    
    const hospitals = await getNearbyHospitals(
      parseFloat(lat), 
      parseFloat(lng), 
      parseInt(radius)
    );

    console.log(`Found ${hospitals.length} medical facilities`);

    // If no hospitals found, provide demo data as fallback
    if (hospitals.length === 0) {
      console.log('No hospitals found via Overpass API, providing demo data');
      const demoHospitals = [
        {
          place_id: "demo1",
          name: "City General Hospital",
          vicinity: "Main Street, Downtown",
          rating: 4.2,
          user_ratings_total: 156,
          geometry: {
            location: { lat: parseFloat(lat), lng: parseFloat(lng) }
          },
          opening_hours: { open_now: true },
          formatted_phone_number: "+1-234-567-8900",
          types: ["hospital", "health"],
          distance_km: 0.5,
          facility_type: "Hospital",
          emergency_services: true
        },
        {
          place_id: "demo2",
          name: "Emergency Medical Center",
          vicinity: "Health Avenue, Medical District",
          rating: 4.5,
          user_ratings_total: 203,
          geometry: {
            location: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 }
          },
          opening_hours: { open_now: true },
          formatted_phone_number: "+1-234-567-8901",
          types: ["hospital", "emergency_room"],
          distance_km: 1.2,
          facility_type: "Emergency Center",
          emergency_services: true
        },
        {
          place_id: "demo3",
          name: "Regional Medical Hospital",
          vicinity: "Hospital Road, Suburbs",
          rating: 4.1,
          user_ratings_total: 89,
          geometry: {
            location: { lat: parseFloat(lat) - 0.01, lng: parseFloat(lng) - 0.01 }
          },
          opening_hours: { open_now: false },
          formatted_phone_number: "+1-234-567-8902",
          types: ["hospital", "health"],
          distance_km: 1.8,
          facility_type: "Hospital",
          emergency_services: false
        }
      ];
      
      return NextResponse.json({
        results: demoHospitals,
        source: "demo_data",
        message: "Using demo data - no hospitals found in the area"
      });
    }

    return NextResponse.json({
      results: hospitals.slice(0, 15), // Limit to 15 results
      source: "openstreetmap",
      total_found: hospitals.length,
      search_radius_km: parseInt(radius) / 1000
    });

  } catch (error) {
    console.error('Error in hospital search:', error);
    
    // Fallback to demo data on error
    const demoHospitals = [
      {
        place_id: "fallback1",
        name: "Emergency Medical Services",
        vicinity: "Call 108 or 112 for immediate assistance",
        rating: 5.0,
        user_ratings_total: 999,
        geometry: {
          location: { lat: parseFloat(lat || "0"), lng: parseFloat(lng || "0") }
        },
        opening_hours: { open_now: true },
        formatted_phone_number: "108",
        types: ["emergency_services"],
        distance_km: 0,
        facility_type: "Emergency Services",
        emergency_services: true
      }
    ];

    return NextResponse.json({
      results: demoHospitals,
      source: "fallback_data",
      error: "Could not fetch hospital data",
      message: "Please call emergency services directly"
    }, { status: 200 });
  }
}