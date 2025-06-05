import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Google Places API key - you'll need to add this to your environment variables
    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      // Return demo data if no API key is configured
      return NextResponse.json({
        results: [
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
            types: ["hospital", "health"]
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
            types: ["hospital", "emergency_room"]
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
            types: ["hospital", "health"]
          }
        ]
      });
    }

    // Google Places Nearby Search API
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_message || 'Failed to fetch hospitals');
    }

    // Get additional details for each hospital
    const hospitalsWithDetails = await Promise.all(
      data.results.slice(0, 10).map(async (hospital: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${hospital.place_id}&fields=formatted_phone_number,website,opening_hours&key=${API_KEY}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          return {
            ...hospital,
            ...detailsData.result
          };
        } catch (error) {
          console.error('Error fetching hospital details:', error);
          return hospital;
        }
      })
    );

    return NextResponse.json({
      results: hospitalsWithDetails
    });

  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby hospitals' },
      { status: 500 }
    );
  }
}