<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Person;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function store(Request $request)
    {
        $entry = Entry::create([
            'event_id' => $request->event_id,
            'person_id' => $request->person_id,
            'gift_type' => $request->gift_type,
            'amount' => $request->amount,
            'item_name' => $request->item_name,
            'notes' => $request->notes
        ]);

        return response()->json($entry);
    }

    public function getByEvent($eventId)
    {
        return Entry::with('person')
            ->where('event_id', $eventId)
            ->get();
    }

    public function saveBulk(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'entries' => 'required|array'
        ]);

        $saved = [];

        foreach ($request->entries as $entry) {

            $name = trim($entry['name'] ?? '');
            if (!$name) continue;

            $normalized = strtolower(str_replace(' ', '', $name));

            $person = Person::firstOrCreate(
                [
                    'user_id' => auth()->id(),
                    'normalized_name' => $normalized
                ],
                [
                    'name' => $name
                ]
            );

            // ✅ FIXED: define BEFORE create
            $giftType = $entry['gift_type'] ?? 'cash';

            Entry::create([
                'event_id' => $request->event_id,
                'person_id' => $person->id,
                'gift_type' => $giftType,

                'amount' => $giftType === 'cash'
                    ? (int) ($entry['amount'] ?? 0)
                    : null,

                'item_name' => $giftType === 'gift'
                    ? ($entry['item_name'] ?? null)
                    : null,
            ]);
        }

        return response()->json([
            'message' => 'Entries saved successfully',
            'data' => $saved
        ]);
    }
}