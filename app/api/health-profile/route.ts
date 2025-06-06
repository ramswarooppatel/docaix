import { NextRequest, NextResponse } from 'next/server';

interface HealthProfileRequest {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  medical_conditions?: string[];
  medications?: string[];
  allergies?: string[];
  lifestyle?: {
    activity_level?: string;
    smoking?: string;
    alcohol?: string;
    sleep_hours?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: HealthProfileRequest = await request.json();
    
    // Validate required fields
    if (!body.age || !body.gender || !body.weight || !body.height) {
      return NextResponse.json(
        { error: 'Missing required fields: age, gender, weight, height' },
        { status: 400 }
      );
    }

    // Calculate BMI
    const heightInMeters = body.height / 100;
    const bmi = parseFloat((body.weight / (heightInMeters * heightInMeters)).toFixed(2));
    
    // Determine BMI category
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    // Call the external API (from your backend)
    const externalResponse = await fetch('https://firstaid-chat-bot-api.onrender.com/health-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!externalResponse.ok) {
      // If external API fails, provide a basic response
      const basicResponse = {
        profile: {
          age: body.age,
          gender: body.gender,
          weight: body.weight,
          height: body.height,
          bmi: bmi,
          bmi_category: bmiCategory,
          medical_conditions: body.medical_conditions || [],
          medications: body.medications || [],
          allergies: body.allergies || [],
          lifestyle: body.lifestyle || {
            activity_level: '',
            smoking: '',
            alcohol: '',
            sleep_hours: ''
          }
        },
        recommendations: {
          general_health_tips: [
            'FAILED RESPONSE FROM EXTERNAL API',
            'Consult with a healthcare provider',
            'Maintain a balanced diet',
            'Exercise regularly',
            'Get adequate sleep',
            'Stay hydrated',
            'Manage stress effectively'
          ],
          diet_plan: {
            breakfast: ['Oatmeal with fruits', 'Greek yogurt', 'Whole grain toast'],
            lunch: ['Grilled chicken salad', 'Brown rice', 'Steamed vegetables'],
            dinner: ['Baked fish', 'Quinoa', 'Mixed vegetables'],
            snacks: ['Mixed nuts', 'Fresh fruits', 'Vegetable sticks'],
            foods_to_avoid: ['Processed foods', 'Sugary drinks', 'Excessive salt']
          },
          exercise_recommendations: [
            '30 minutes of moderate exercise daily',
            'Strength training 2-3 times per week',
            'Regular walking or jogging'
          ],
          lifestyle_changes: [
            'Maintain regular sleep schedule',
            'Reduce stress through meditation',
            'Limit alcohol consumption'
          ],
          medical_precautions: [
            'Regular health check-ups',
            'Monitor vital signs',
            'Take medications as prescribed'
          ],
          health_monitoring: [
            'Weekly weight checks',
            'Blood pressure monitoring',
            'Regular exercise tracking'
          ]
        },
        disclaimer: 'This analysis is for informational purposes only. Always consult with healthcare professionals for medical advice.',
        generated_at: new Date().toISOString().split('T')[0]
      };

      return NextResponse.json(basicResponse);
    }

    const data = await externalResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Health profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}