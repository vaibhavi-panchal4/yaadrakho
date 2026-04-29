<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Person;
use App\Models\Entry;
use App\Models\Event;
use Carbon\Carbon;

class SuggestionController extends Controller
{
    public function suggestSmart(Request $request)
    {
        try {
            $name = $request->name;
            $eventId = $request->event_id;
            $personId = $request->person_id;

            if (!$eventId || (!$name && !$personId)) {
                return response()->json(['error' => 'Missing data'], 400);
            }

            // ✅ DIRECT SELECT
            if ($personId) {
                $person = Person::where('id', $personId)
                    ->where('user_id', auth()->id())
                    ->first();

                if (!$person) {
                    return response()->json([
                        'message' => "Person not found 😅"
                    ]);
                }

                return $this->generateSuggestion($person, $eventId);
            }

            // ✅ SEARCH
            $normalized = strtolower(str_replace(' ', '', $name));

            $persons = Person::where('user_id', auth()->id()) // 🔥 IMPORTANT
                ->where(function ($q) use ($normalized) {
                    $q->where('normalized_name', 'LIKE', "%$normalized%")
                      ->orWhere('normalized_name', 'LIKE', "$normalized%");
                })
                ->get();

            if ($persons->isEmpty()) {
                return response()->json([
                    'message' => "No match found 😅"
                ]);
            }

            // 🎯 SCORE
            $scored = [];

            foreach ($persons as $p) {
                similar_text($normalized, $p->normalized_name, $percent);

                if (str_starts_with($p->normalized_name, $normalized)) {
                    $percent += 20;
                }

                $scored[] = [
                    'person' => $p,
                    'score' => $percent
                ];
            }

            usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

            $top = array_slice($scored, 0, 3);

            if ($top && $top[0]['person']->normalized_name === $normalized) {
                return $this->generateSuggestion($top[0]['person'], $eventId);
            }

            return response()->json([
                'type' => 'confirm',
                'options' => array_map(function ($item) {
                    return [
                        'id' => $item['person']->id,
                        'name' => $item['person']->name
                    ];
                }, $top)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // =====================================================
    // 🔥 NEW SMART EVENT-BASED LOGIC
    // =====================================================
    private function generateSuggestion($person, $eventId)
    {
        $event = Event::where('id', $eventId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Event not found']);
        }

        $entries = Entry::with('subEvent')
            ->where('person_id', $person->id)
            ->whereHas('event', function ($q) use ($event) {
                $q->where('id', $event->id)
                ->where('user_id', auth()->id());
            })
            ->get();

        if ($entries->isEmpty()) {
            return response()->json([
                'message' => "No past data for this event 🤔"
            ]);
        }

        // =====================================================
        // 🔥 GROUP BY SUB EVENT
        // =====================================================
        $grouped = [];

        foreach ($entries as $entry) {
            $key = $entry->subEvent->name ?? 'Main Event';

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'cash' => 0,
                    'gifts' => []
                ];
            }

            if ($entry->gift_type === 'cash') {
                $grouped[$key]['cash'] += $entry->amount;
            }

            if ($entry->gift_type === 'gift') {
                $grouped[$key]['gifts'][] = $entry->item_name;
            }
        }

        // =====================================================
        // ⏱ TIME
        // =====================================================
        $date = Carbon::parse($event->event_date);
        $years = (int)$date->diffInYears(now());

        $timeText = $years > 0 ? "$years years ago" : "recently";

        // =====================================================
        // 💡 BUILD RESPONSE
        // =====================================================
        $breakdown = [];
        $suggestedBreakdown = [];
        $totalCash = 0;
        $suggestedTotal = 0;

        foreach ($grouped as $sub => $data) {

            $cash = $data['cash'];
            $gifts = $data['gifts'];

            $totalCash += $cash;

            // 🎯 SMART INCREASE
            $suggestedCash = $cash > 0
                ? round($cash * 1.15, -2) // 15% increase per sub-event
                : 0;

            $suggestedTotal += $suggestedCash;

            $breakdown[] = [
                'sub_event' => $sub,
                'cash' => $cash,
                'gifts' => $gifts
            ];

            $suggestedBreakdown[] = [
                'sub_event' => $sub,
                'cash' => $suggestedCash,
                'gifts' => count($gifts) > 0 ? 'similar gift' : null
            ];
        }

        return response()->json([
            'type' => 'smart',

            'summary' => [
                'event' => $event->title,
                'time' => $timeText,
                'total_cash' => $totalCash,
            ],

            'given' => $breakdown,

            'suggested' => $suggestedBreakdown,

            'final' => [
                'cash' => $suggestedTotal,
                'note' => 'Return similar gifts where applicable'
            ]
        ]);
    }
}