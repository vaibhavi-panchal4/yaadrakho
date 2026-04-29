<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Person;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'name' => 'required|string',
            'gift_type' => 'required|in:cash,gift',
            'amount' => 'nullable|numeric',
            'item_name' => 'nullable|string',
            'sub_event_id' => 'nullable|exists:sub_events,id'
        ]);

        $name = trim($request->name);
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

        $entry = Entry::create([
            'event_id' => $request->event_id,
            'person_id' => $person->id,
            'sub_event_id' => $request->sub_event_id,
            'gift_type' => $request->gift_type,
            'amount' => $request->gift_type === 'cash' ? $request->amount : null,
            'item_name' => $request->gift_type === 'gift' ? $request->item_name : null,
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
                'sub_event_id' => $entry['sub_event_id'] ?? null, // ✅ ADD THIS
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

    public function update(Request $request, $id)
    {
        $entry = Entry::findOrFail($id);

        // 🔥 UPDATE PERSON NAME
        if ($request->name) {
            $person = $entry->person;

            $person->update([
                'name' => $request->name,
                'normalized_name' => strtolower(str_replace(' ', '', $request->name))
            ]);
        }

        // 🔥 UPDATE ENTRY
        $entry->update([
            'sub_event_id' => $request->sub_event_id,
            'gift_type' => $request->gift_type,
            'amount' => $request->gift_type === 'cash' ? $request->amount : null,
            'item_name' => $request->gift_type === 'gift' ? $request->item_name : null,
        ]);

        return response()->json($entry->load('person'));
    }

    public function destroy($id)
    {
        Entry::findOrFail($id)->delete();

        return response()->json(['message' => 'Entry deleted']);
    }
}