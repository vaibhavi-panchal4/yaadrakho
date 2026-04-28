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

            // ✅ VALIDATION (FIXED)
            if (!$eventId || (!$name && !$personId)) {
                return response()->json(['error' => 'Missing data'], 400);
            }

            // =====================================================
            // ✅ CASE 1: USER SELECTED FROM SUGGESTION (person_id)
            // =====================================================
            if ($personId) {
                $person = Person::find($personId);

                if (!$person) {
                    return response()->json([
                        'message' => "Person not found 😅"
                    ]);
                }

                return $this->generateSuggestion($person, $eventId);
            }

            // =====================================================
            // ✅ CASE 2: USER TYPING NAME → FIND MATCHES
            // =====================================================
            $normalized = strtolower(str_replace(' ', '', $name));

            $persons = Person::where('normalized_name', 'LIKE', "%$normalized%")
                ->orWhere('normalized_name', 'LIKE', "$normalized%")
                ->get();

            if ($persons->isEmpty()) {
                return response()->json([
                    'message' => "No match found 😅"
                ]);
            }

            // 🎯 SORT BEST MATCHES
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

            // 🔥 TAKE TOP 3
            $top = array_slice($scored, 0, 3);

            // ✅ IF EXACT MATCH → DIRECT RESULT
            if ($top && $top[0]['person']->normalized_name === $normalized) {
                return $this->generateSuggestion($top[0]['person'], $eventId);
            }

            // ❗ OTHERWISE → ASK USER
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
    // ✅ FINAL SUGGESTION LOGIC
    // =====================================================
    private function generateSuggestion($person, $eventId)
    {
        $event = Event::find($eventId);

        $entry = Entry::where('person_id', $person->id)
            ->whereHas('event', function ($q) use ($event) {
                $q->where('title', $event->title);
            })
            ->latest()
            ->first();

        if (!$entry) {
            return response()->json([
                'message' => "No past data for this event type 🤔"
            ]);
        }

        
        $date = Carbon::parse($entry->created_at);

        $days = (int)$date->diffInDays(now());
        $months = (int)$date->diffInMonths(now());
        $years = (int)$date->diffInYears(now());

        // ✅ CLEAN TIME FORMAT
        if ($days < 30) {
            $timeText = $days . " day" . ($days == 1 ? "" : "s");
        } elseif ($months < 12) {
            $timeText = $months . " month" . ($months == 1 ? "" : "s");
        } else {
            $timeText = $years . " year" . ($years == 1 ? "" : "s");
        }

        // =====================================================
        // 💰 CASH LOGIC (SMART INCREASE)
        // =====================================================
        if ($entry->gift_type === 'cash') {

            $lastAmount = $entry->amount;

            $yearsFactor = $months / 12;

            $days = (int)$date->diffInDays(now());
            $months = (int)$date->diffInMonths(now());
            $years = $months / 12;

            // 🎯 Smart increase rules
            if ($days < 30) {
                $increaseRate = 0; // no change for recent
            } elseif ($months < 6) {
                $increaseRate = 0.05; // 5%
            } elseif ($months < 12) {
                $increaseRate = 0.08; // 8%
            } else {
                $increaseRate = min(0.12 + ($years * 0.03), 0.20); // max 20%
            }

            $suggestedRaw = $lastAmount + ($lastAmount * $increaseRate);
            $suggested = round($suggestedRaw, -2);

            if ($increaseRate === 0) {
            return response()->json([
                'message' => "💡 {$timeText} ago, they gave you ₹{$lastAmount}. Returning the same amount ₹{$lastAmount} would be perfectly appropriate 😊"
            ]);
        }

        return response()->json([
            'message' => "💡 {$timeText} ago, they gave you ₹{$lastAmount}. A fair return today would be around ₹{$suggested} — thoughtful and balanced 😊"
        ]);
        }

        // =====================================================
        // 🎁 GIFT LOGIC
        // =====================================================
        if ($entry->gift_type === 'gift') {

            $item = strtolower($entry->item_name);

            $suggestion = "a similar or slightly better gift";

            if (str_contains($item, 'watch')) {
                $suggestion = "a similar watch or slightly upgraded brand";
            } elseif (str_contains($item, 'perfume')) {
                $suggestion = "a premium perfume or combo set";
            } elseif (str_contains($item, 'wallet')) {
                $suggestion = "a leather wallet or accessory set";
            }

            return response()->json([
                'message' => "🎁 {$timeText} ago, they gave you '{$entry->item_name}'. You could return {$suggestion} — thoughtful and balanced 😉"
            ]);
        }

        return response()->json([
            'message' => "No suggestion available"
        ]);
    }
}