<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\SubEvent;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'sub_events' => 'array'
        ]);

        // ✅ CREATE EVENT (correct)
        $event = Event::create([
            'user_id' => auth()->id(),
            'title' => $request->name,
            'event_date' => $request->date,
        ]);

        // ✅ CREATE SUB EVENTS
        if ($request->sub_events) {
            foreach ($request->sub_events as $sub) {
                SubEvent::create([
                    'event_id' => $event->id,
                    'name' => $sub
                ]);
            }
        }

        return response()->json($event);
    }

    public function index()
    {
        return Event::with('subEvents')
            ->where('user_id', auth()->id())
            ->get();
    }

    public function show($id)
    {
        return Event::with('subEvents')->findOrFail($id);
    }

    public function withEntries()
    {
        return \App\Models\Event::with([
            'entries.person',
            'entries.subEvent' // 🔥 ADD THIS
        ])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
    }

    public function update(Request $request, $id)
    {
        $event = Event::where('user_id', auth()->id())->findOrFail($id);

        $event->update([
            'title' => $request->name,
            'event_date' => $request->date,
        ]);

        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = Event::where('user_id', auth()->id())->findOrFail($id);

        // 🔥 delete related data
        $event->entries()->delete();
        $event->subEvents()->delete();

        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }

    public function exportCsv()
    {
        $events = \App\Models\Event::with(['entries.person', 'entries.subEvent'])
            ->where('user_id', auth()->id())
            ->get();

        $filename = "yaadrakho_export.csv";

        $handle = fopen('php://output', 'w');

        // Headers
        fputcsv($handle, [
            'Event',
            'Date',
            'Person',
            'Sub Event',
            'Type',
            'Amount',
            'Gift'
        ]);

        foreach ($events as $event) {
            foreach ($event->entries as $entry) {
                fputcsv($handle, [
                    $event->title,
                    $event->event_date,
                    $entry->person->name ?? '',
                    $entry->subEvent->name ?? 'Main Event',
                    $entry->gift_type,
                    $entry->amount,
                    $entry->item_name
                ]);
            }
        }

        fclose($handle);

        return response()->streamDownload(function () use ($handle) {}, $filename, [
            "Content-Type" => "text/csv",
        ]);
    }
}