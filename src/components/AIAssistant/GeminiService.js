/**
 * GeminiService.js
 * Connects to Google Gemini API with function calling support.
 * API key loaded from VITE_GEMINI_API_KEY environment variable.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Function declarations for Gemini function calling ────────────
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_rides',
        description: 'Search for available ride options between pickup and destination. Call this when user wants to book or find rides.',
        parameters: {
          type: 'OBJECT',
          properties: {
            pickup: { type: 'STRING', description: 'The pickup location' },
            destination: { type: 'STRING', description: 'The drop-off destination' },
          },
          required: ['pickup', 'destination'],
        },
      },
      {
        name: 'book_ride',
        description: 'Book a specific ride type for the user.',
        parameters: {
          type: 'OBJECT',
          properties: {
            pickup: { type: 'STRING', description: 'The pickup location' },
            destination: { type: 'STRING', description: 'The drop-off destination' },
            rideType: {
              type: 'STRING',
              description: 'The type of ride: "Shared Ride", "Private", or "Electric Mini"',
            },
          },
          required: ['pickup', 'destination', 'rideType'],
        },
      },
      {
        name: 'track_ride',
        description: 'Get the live tracking status of the current ride. Call this when user asks about driver location or ETA.',
        parameters: {
          type: 'OBJECT',
          properties: {
            rideId: {
              type: 'STRING',
              description: 'The ride ID to track. Use "current" if rideId is not known.',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_dashboard',
        description: 'Get dashboard statistics: total rides, money saved, carbon saved, AI recommendations, traffic status.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'get_profile',
        description: 'Get user profile information including name, company, rides, money saved, carbon saved.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'find_carpool_matches',
        description: 'Find carpool/ride-sharing matches using the AI matching service. Call when user wants to share a ride or find others going the same way.',
        parameters: {
          type: 'OBJECT',
          properties: {
            pickup: { type: 'STRING', description: 'The pickup location' },
            destination: { type: 'STRING', description: 'The drop-off destination' },
          },
          required: ['pickup', 'destination'],
        },
      },
      {
        name: 'navigate_to_destination',
        description: 'Open the search page and set a destination on the map. Call when user says "take me to", "navigate to", or "go to" a place.',
        parameters: {
          type: 'OBJECT',
          properties: {
            destination: { type: 'STRING', description: 'The destination name or address' },
          },
          required: ['destination'],
        },
      },
    ],
  },
];

const SYSTEM_PROMPT = [
  'You are CommuteAI, a friendly and efficient AI commuting assistant.',
  '',
  'You help users with their daily commute by:',
  '- Booking rides (Shared Ride, Private, Electric Mini)',
  '- Tracking their drivers in real-time',
  '- Finding carpool matches with colleagues',
  '- Providing traffic and ETA information',
  '- Showing dashboard statistics and profile data',
  '- Navigating to destinations',
  '',
  'IMPORTANT RULES:',
  '1. Always call the appropriate function to get real data. NEVER fabricate ride prices, ETAs, or driver names.',
  '2. Be concise. Keep responses under 3 sentences unless listing items.',
  '3. When you get function results, present them conversationally.',
  '4. If the user says "book the cheapest", call search_rides first then book the cheapest result.',
  '5. If the user asks to track without a ride ID, call track_ride with no args - it auto-fetches their latest ride.',
  '6. Greet briefly. Do not be overly chatty.',
  '7. Indian context: currency is Rs (rupee symbol), locations are Hyderabad and Bangalore, Indian names.',
  '8. Match scores from find_carpool_matches are integers 0-100 (80 = 80% match).',
  '',
  'Default pickup is "Current Location". Users are in Hyderabad, India.',
].join('\n');


// ── Execute backend function calls ───────────────────────────────
export async function executeFunctionCall(name, args, apiClient, rideContext) {
  const { pickup, destination, currentRideId, setCurrentRideId } = rideContext;

  try {
    switch (name) {

      // ── 1. search_rides ─────────────────────────────────────────
      case 'search_rides': {
        const resolvedPickup = args.pickup || pickup || 'Current Location';
        const resolvedDest   = args.destination || destination || 'Tech Park';
        const res = await apiClient.post('/rides/search', {
          pickup: resolvedPickup,
          destination: resolvedDest,
        });
        const rides = Array.isArray(res.data) ? res.data : [];
        // Return clean, normalized shape so Gemini can read it clearly
        return {
          pickup: resolvedPickup,
          destination: resolvedDest,
          rideOptions: rides.map((r) => ({
            type:  r.type,
            fare:  'Rs ' + r.fare,
            eta:   r.eta,
          })),
        };
      }

      // ── 2. book_ride ─────────────────────────────────────────────
      case 'book_ride': {
        const p = args.pickup      || pickup      || 'Current Location';
        const d = args.destination || destination;
        if (!d) return { error: 'Please tell me where you want to go first.' };
        const res = await apiClient.post('/rides', {
          pickup:      p,
          destination: d,
          rideType:    args.rideType || 'Shared Ride',
        });
        const data = res.data;
        // ✅ FIX: Store rideId in context so track_ride works immediately after booking
        if (data.id && setCurrentRideId) setCurrentRideId(data.id);
        return {
          rideId:      data.id,
          status:      data.status,
          driverName:  data.driverName,
          vehicle:     data.vehicle,
          pickup:      p,
          destination: d,
          rideType:    args.rideType || 'Shared Ride',
        };
      }

      // ── 3. track_ride ─────────────────────────────────────────────
      case 'track_ride': {
        // ✅ FIX: Use explicit ID → stored context ID → 'latest' (backend fallback)
        const id =
          (args.rideId && args.rideId !== 'current' && args.rideId !== 'latest')
            ? args.rideId
            : currentRideId || 'latest';
        const res = await apiClient.get('/rides/' + id + '/track');
        const d = res.data;
        return {
          rideId:         d.rideId,
          status:         d.status,
          driverName:     d.driverName || d.driver,
          vehicle:        d.vehicle,
          eta:            d.eta,
          pickup:         d.currentLocation,
          destination:    d.destination,
          driverLocation: d.location,
        };
      }

      // ── 4. get_dashboard ──────────────────────────────────────────
      case 'get_dashboard': {
        const res = await apiClient.get('/dashboard');
        const d   = res.data;
        return {
          userName:             d.userName,
          totalRidesCompleted:  d.totalRidesCompleted,
          upcomingRides:        d.upcomingRides,
          moneySaved:           d.moneySaved,
          carbonSaved:          d.carbonSaved,
          trafficStatus:        d.trafficStatus,
          bestPickupPoint:      d.bestPickupPoint,
          recommendedRide:      d.aiRecommendation && (d.aiRecommendation.recommended || d.aiRecommendation.recommendedRide),
          waitingTime:          d.aiRecommendation && d.aiRecommendation.waitingTime,
          recentRides:          (d.recentRides || []).map((r) => ({
            route:  r.route,
            date:   r.date,
            fare:   r.fare,
            status: r.status,
          })),
        };
      }

      // ── 5. get_profile ────────────────────────────────────────────
      case 'get_profile': {
        const res = await apiClient.get('/profile');
        const d   = res.data;
        return {
          name:        d.name,
          company:     d.company,
          email:       d.email,
          rating:      d.rating,
          ridesShared: d.ridesShared || d.rides,
          moneySaved:  d.moneySaved,
          carbonSaved: d.carbonSaved,
        };
      }

      // ── 6. find_carpool_matches ───────────────────────────────────
      case 'find_carpool_matches': {
        const resolvedPickup = args.pickup      || pickup      || 'Current Location';
        const resolvedDest   = args.destination || destination || 'Tech Park';
        const res = await apiClient.post('/ai/match', {
          pickup: resolvedPickup,
          drop:   resolvedDest,
          time:   'now',
        });
        const matches = Array.isArray(res.data) ? res.data : [];
        // ✅ FIX: FastAPI returns `org` not `company`; `match` is 0-100 integer not 0-1 float
        return {
          pickup:        resolvedPickup,
          destination:   resolvedDest,
          totalMatches:  matches.length,
          matches:       matches.map((m) => ({
            name:          m.name,
            company:       m.org || m.company || 'Unknown',
            matchPercent:  typeof m.match === 'number' ? m.match : Math.round((m.score || 0) * 100),
            rating:        m.rating,
            fare:          m.fare,
            departureTime: m.time,
            seats:         m.seats,
            verified:      m.verified,
          })),
        };
      }

      // ── navigate_to_destination (UI action) ───────────────────────
      case 'navigate_to_destination': {
        return { navigate: true, destination: args.destination };
      }

      default:
        return { error: 'Unknown function: ' + name };
    }
  } catch (err) {
    const httpStatus = err.response && err.response.status;
    const msg = (err.response && err.response.data && (err.response.data.error || err.response.data.message))
      || err.message || 'Backend error';
    if (httpStatus === 503) return { error: 'The AI matching service is offline. Please try again.' };
    if (httpStatus === 404) return { error: 'No ride found. Book a ride first, then I can track it.' };
    if (httpStatus === 401) return { error: 'Session expired. Please log in again.' };
    return { error: msg };
  }
}


// ── Main Gemini call with function-calling loop ──────────────────
export async function sendToGemini(messages, apiClient, rideContext, onFunctionCall) {
  if (!GEMINI_API_KEY) {
    return 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
  }

  // Build conversation history in Gemini format
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood! I am CommuteAI, ready to help with your commute.' }] },
    ...messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const body = { contents, tools: TOOLS };

    let response;
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;
        if (res.status === 400 && errMsg.includes('API_KEY')) {
          return `❌ Gemini API key is invalid. Please get a free key from https://aistudio.google.com/apikey and add it as VITE_GEMINI_API_KEY in your .env file.`;
        }
        if (res.status === 403) {
          return `❌ Gemini API key error: ${errMsg}. Get a key from https://aistudio.google.com/apikey`;
        }
        return `Gemini is temporarily unavailable (${errMsg}). Please try again.`;
      }

      response = await res.json();
    } catch (fetchErr) {
      return 'Cannot reach Gemini. Please check your internet connection.';
    }

    const candidate = response?.candidates?.[0];
    if (!candidate) return 'Gemini returned an empty response. Please try again.';

    const parts = candidate.content?.parts || [];

    // Check if Gemini wants to call a function
    const functionCallPart = parts.find((p) => p.functionCall);
    if (functionCallPart) {
      const { name, args } = functionCallPart.functionCall;

      // Notify UI that a function is being called
      if (onFunctionCall) onFunctionCall(name, args);

      // Execute the function
      const result = await executeFunctionCall(name, args, apiClient, rideContext);

      // Handle navigate action specially
      if (result?.navigate && onFunctionCall) {
        onFunctionCall('navigate_to_destination', { destination: result.destination });
      }

      // Add the model's function call to history
      contents.push({
        role: 'model',
        parts: [{ functionCall: { name, args } }],
      });

      // Add the function result back
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name,
              response: result,
            },
          },
        ],
      });

      // Continue the loop so Gemini can process the result
      continue;
    }

    // Gemini gave a text response — we're done
    const textPart = parts.find((p) => p.text);
    if (textPart) return textPart.text;

    return 'I received an unexpected response. Please try again.';
  }

  return 'I got stuck in a loop. Please try rephrasing your request.';
}
